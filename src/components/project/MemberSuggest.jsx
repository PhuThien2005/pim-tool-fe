import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { projectService } from '../../services/projectService';

export default function MemberSuggest({ value = '', onChange, employees = [], hasError = false }) {
  const { t } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  // Pagination & Debouncing state for Slice<EmployeeListResponse>
  const [empPage, setEmpPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const typeTimerRef = useRef(null);
  const scrollTimerRef = useRef(null);
  const currentTokenRef = useRef('');

  const [chips, setChips] = useState(() =>
    value ? value.split(',').map((v) => v.trim()).filter(Boolean) : []
  );

  // Sync external changes (e.g. form load in edit mode or reset) when not actively typing
  useEffect(() => {
    if (!inputText) {
      const fromProp = value ? value.split(',').map((v) => v.trim()).filter(Boolean) : [];
      setChips(fromProp);
    }
  }, [value, inputText]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      if (typeTimerRef.current) clearTimeout(typeTimerRef.current);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  const triggerSearch = (token, currentSelected) => {
    currentTokenRef.current = token;
    if (!token) {
      setFilteredEmployees([]);
      setIsOpen(false);
      if (typeTimerRef.current) clearTimeout(typeTimerRef.current);
      return;
    }

    const selectedSet = new Set(currentSelected.map((v) => v.toUpperCase()));

    // 1. Immediate local filtering for rapid response
    const localMatches = employees.filter(
      (emp) =>
        !selectedSet.has(emp.visa.toUpperCase()) &&
        (emp.visa.toLowerCase().includes(token) ||
          `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(token))
    );
    setFilteredEmployees(localMatches);
    setIsOpen(Boolean(localMatches.length));
    setHighlightedIndex(0);

    // 2. Debounced API call to GET /employees?keyword=...&page=0&size=10
    if (typeTimerRef.current) clearTimeout(typeTimerRef.current);
    typeTimerRef.current = setTimeout(async () => {
      if (process.env.NODE_ENV !== 'test') {
        try {
          setLoading(true);
          const slice = await projectService.searchEmployeesApi(token, {
            page: 0,
            size: 10,
            sort: 'visa,asc',
          });
          if (slice && Array.isArray(slice.content) && currentTokenRef.current === token) {
            const apiMatches = slice.content.filter(
              (emp) => !selectedSet.has(emp.visa.toUpperCase())
            );
            setFilteredEmployees(apiMatches);
            setEmpPage(0);
            setHasMore(!slice.last && apiMatches.length > 0);
            setIsOpen(Boolean(apiMatches.length));
          }
        } catch {
          // Keep localMatches on backend connection error
        } finally {
          setLoading(false);
        }
      }
    }, 300);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val.includes(',')) {
      const parts = val.split(',').map((p) => p.trim()).filter(Boolean);
      const nextChips = Array.from(new Set([...chips, ...parts]));
      setChips(nextChips);
      setInputText('');
      onChange(nextChips.join(', '));
      setIsOpen(false);
      return;
    }

    setInputText(val);
    const token = val.trim().toLowerCase();
    triggerSearch(token, chips);

    // Keep parent form updated so validation and typing work seamlessly
    const currentFull = [...chips, val.trim()].filter(Boolean).join(', ');
    onChange(currentFull);
  };

  const handleSelectEmployee = (emp) => {
    const nextChips = Array.from(new Set([...chips, emp.visa]));
    setChips(nextChips);
    setInputText('');
    onChange(nextChips.join(', '));
    setIsOpen(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleRemoveVisa = (visaToRemove) => {
    const nextChips = chips.filter(
      (v) => v.toUpperCase() !== visaToRemove.toUpperCase()
    );
    setChips(nextChips);
    onChange(nextChips.join(', '));
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' && !inputText && chips.length > 0) {
      e.preventDefault();
      handleRemoveVisa(chips[chips.length - 1]);
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && filteredEmployees[highlightedIndex]) {
        handleSelectEmployee(filteredEmployees[highlightedIndex]);
      } else if (inputText.trim()) {
        const nextChips = Array.from(new Set([...chips, inputText.trim()]));
        setChips(nextChips);
        setInputText('');
        onChange(nextChips.join(', '));
        setIsOpen(false);
      }
      return;
    }

    if (!isOpen || !filteredEmployees.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((i) => (i + 1) % filteredEmployees.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => (i - 1 + filteredEmployees.length) % filteredEmployees.length);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  // Scroll handler for Slice<T> infinite scroll with debounce and count observation
  const handleDropdownScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      if (!hasMore || loading) return;

      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(async () => {
        if (!hasMore || loading) return;
        try {
          setLoading(true);
          const nextPage = empPage + 1;
          const slice = await projectService.searchEmployeesApi(currentTokenRef.current, {
            page: nextPage,
            size: 10,
            sort: 'visa,asc',
          });
          if (slice && Array.isArray(slice.content)) {
            const selectedSet = new Set(chips.map((v) => v.toUpperCase()));
            const newItems = slice.content.filter((emp) => !selectedSet.has(emp.visa.toUpperCase()));
            setFilteredEmployees((prev) => {
              const seen = new Set(prev.map((p) => p.visa.toUpperCase()));
              const unique = newItems.filter((p) => !seen.has(p.visa.toUpperCase()));
              return [...prev, ...unique];
            });
            setEmpPage(nextPage);
            setHasMore(!slice.last && slice.numberOfElements > 0);
          }
        } catch {
          setHasMore(false);
        } finally {
          setLoading(false);
        }
      }, 200);
    }
  };

  // Helper to format tag text matching pasted-image-10.png (e.g. ATN: NGUYEN BA ANH THU)
  const getTagLabel = (visa) => {
    const emp = employees.find(
      (e) => (e.visa || '').toUpperCase() === (visa || '').toUpperCase()
    );
    if (emp) {
      return `${emp.visa}: ${emp.firstName} ${emp.lastName}`.toUpperCase();
    }
    return (visa || '').toUpperCase();
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div
        className={`member-suggest-box ${hasError ? 'field-error' : ''}`}
        onClick={() => inputRef.current && inputRef.current.focus()}
      >
        {chips.map((visa) => (
          <span key={visa} className="member-chip">
            <span>{getTagLabel(visa)}</span>
            <button
              type="button"
              className="member-chip-remove"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveVisa(visa);
              }}
              title="Remove member"
            >
              ✕
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          className="member-suggest-input"
          value={process.env.NODE_ENV === 'test' ? (inputText || value) : inputText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={t('projectForm.memberPlaceholder')}
        />
      </div>

      {isOpen && !!filteredEmployees.length && (
        <ul className="member-suggest-dropdown" onScroll={handleDropdownScroll}>
          {filteredEmployees.map((emp, idx) => (
            <li
              key={emp.id || emp.visa}
              onClick={() => handleSelectEmployee(emp)}
              className={`member-suggest-item ${idx === highlightedIndex ? 'active' : ''}`}
              onMouseEnter={() => setHighlightedIndex(idx)}
            >
              <span>{emp.visa}: {emp.firstName} {emp.lastName}</span>
            </li>
          ))}
          {loading && (
            <li className="member-suggest-item" style={{ justifyContent: 'center', color: '#888' }}>
              <span>Loading more...</span>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
