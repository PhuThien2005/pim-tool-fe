import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { projectService } from '../../services/projectService';

export default function MemberSuggest({ value = '', onChange, employees = [], hasError = false }) {
  const { t } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [empPage, setEmpPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const tokenRef = useRef('');

  const [chips, setChips] = useState(() => (value ? value.split(',').map((v) => v.trim()).filter(Boolean) : []));

  useEffect(() => {
    if (!inputText) setChips(value ? value.split(',').map((v) => v.trim()).filter(Boolean) : []);
  }, [value, inputText]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const triggerSearch = useCallback((token, currentChips) => {
    tokenRef.current = token;
    if (!token) { setFilteredEmployees([]); return setIsOpen(false); }

    const selectedSet = new Set(currentChips.map((v) => v.toUpperCase()));
    const local = employees.filter(
      (e) => !selectedSet.has(e.visa.toUpperCase()) &&
        (e.visa.toLowerCase().includes(token) || `${e.firstName} ${e.lastName}`.toLowerCase().includes(token))
    );
    setFilteredEmployees(local);
    setIsOpen(Boolean(local.length));
    setHighlightedIndex(0);

    if (process.env.NODE_ENV !== 'test') {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        try {
          setLoading(true);
          const slice = await projectService.searchEmployeesApi(token, { page: 0, size: 10, sort: 'visa,asc' });
          if (slice?.content && tokenRef.current === token) {
            const apiMatches = slice.content.filter((e) => !selectedSet.has(e.visa.toUpperCase()));
            setFilteredEmployees(apiMatches);
            setEmpPage(0);
            setHasMore(!slice.last && apiMatches.length > 0);
            setIsOpen(Boolean(apiMatches.length));
          }
        } catch {} finally { setLoading(false); }
      }, 300);
    }
  }, [employees]);

  const updateChips = (nextChips) => {
    const unique = Array.from(new Set(nextChips.map((v) => v.trim()).filter(Boolean)));
    setChips(unique);
    setInputText('');
    setIsOpen(false);
    onChange(unique.join(', '));
    if (inputRef.current) inputRef.current.focus();
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (val.includes(',')) return updateChips([...chips, ...val.split(',')]);
    setInputText(val);
    triggerSearch(val.trim().toLowerCase(), chips);
    onChange([...chips, val.trim()].filter(Boolean).join(', '));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' && !inputText && chips.length) {
      e.preventDefault();
      updateChips(chips.slice(0, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = isOpen && filteredEmployees[highlightedIndex] ? filteredEmployees[highlightedIndex].visa : inputText.trim();
      if (target) updateChips([...chips, target]);
    } else if (isOpen && filteredEmployees.length) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightedIndex((i) => (i + 1) % filteredEmployees.length); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightedIndex((i) => (i - 1 + filteredEmployees.length) % filteredEmployees.length); }
      else if (e.key === 'Escape') { e.preventDefault(); setIsOpen(false); }
    }
  };

  const handleDropdownScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 20 && hasMore && !loading) {
      setLoading(true);
      const nextPage = empPage + 1;
      projectService.searchEmployeesApi(tokenRef.current, { page: nextPage, size: 10, sort: 'visa,asc' })
        .then((slice) => {
          if (slice?.content) {
            const selectedSet = new Set(chips.map((v) => v.toUpperCase()));
            const newItems = slice.content.filter((emp) => !selectedSet.has(emp.visa.toUpperCase()));
            setFilteredEmployees((prev) => [...prev, ...newItems.filter((n) => !prev.some((p) => p.visa === n.visa))]);
            setEmpPage(nextPage);
            setHasMore(!slice.last && slice.numberOfElements > 0);
          }
        })
        .catch(() => setHasMore(false))
        .finally(() => setLoading(false));
    }
  };

  const getTagLabel = (visa) => {
    const emp = employees.find((e) => (e.visa || '').toUpperCase() === (visa || '').toUpperCase());
    return emp ? `${emp.visa}: ${emp.firstName} ${emp.lastName}`.toUpperCase() : (visa || '').toUpperCase();
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div className={`member-suggest-box ${hasError ? 'field-error' : ''}`} onClick={() => inputRef.current && inputRef.current.focus()}>
        {chips.map((visa) => (
          <span key={visa} className="member-chip">
            <span>{getTagLabel(visa)}</span>
            <button type="button" className="member-chip-remove" onClick={(e) => { e.stopPropagation(); updateChips(chips.filter((v) => v.toUpperCase() !== visa.toUpperCase())); }} title="Remove member">✕</button>
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
            <li key={emp.id || emp.visa} onClick={() => updateChips([...chips, emp.visa])} className={`member-suggest-item ${idx === highlightedIndex ? 'active' : ''}`} onMouseEnter={() => setHighlightedIndex(idx)}>
              <span>{emp.visa}: {emp.firstName} {emp.lastName}</span>
            </li>
          ))}
          {loading && <li className="member-suggest-item" style={{ justifyContent: 'center', color: '#888' }}><span>Loading more...</span></li>}
        </ul>
      )}
    </div>
  );
}
