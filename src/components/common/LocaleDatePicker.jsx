import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
};

const DAYS = {
  en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  fr: ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'],
};

export default function LocaleDatePicker({
  id,
  value = '',
  onChange,
  className = '',
  hasError = false,
  placeholder,
}) {
  const { language } = useLanguage();
  const lang = language === 'fr' ? 'fr' : 'en';
  const displayPlaceholder = placeholder || (lang === 'fr' ? 'aaaa-mm-jj' : 'yyyy-mm-dd');

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse current value (YYYY-MM-DD) or default to today for calendar view
  const parseDate = (str) => {
    if (!str) return null;
    const parts = str.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) return new Date(y, m, d);
    }
    return null;
  };

  const selectedDate = parseDate(value);
  const [viewYear, setViewYear] = useState(() => (selectedDate ? selectedDate.getFullYear() : new Date().getFullYear()));
  const [viewMonth, setViewMonth] = useState(() => (selectedDate ? selectedDate.getMonth() : new Date().getMonth()));

  // Keep view in sync when value changes externally
  useEffect(() => {
    const d = parseDate(value);
    if (d) {
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  // Close calendar on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutside);
    };
  }, [isOpen]);

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const isoString = `${viewYear}-${mm}-${dd}`;
    onChange(isoString);
    setIsOpen(false);
  };

  // Generate calendar days for viewMonth & viewYear
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; // Monday = 0

  const daysGrid = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    daysGrid.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysGrid.push(d);
  }

  const isDaySelected = (d) => {
    if (!selectedDate || !d) return false;
    return (
      selectedDate.getFullYear() === viewYear &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getDate() === d
    );
  };

  return (
    <div ref={containerRef} className="locale-datepicker-container">
      <div
        className={`locale-datepicker-wrapper ${hasError ? 'field-error' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <input
          id={id}
          type="text"
          className={`locale-datepicker-input ${className}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={displayPlaceholder}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
        />
        <button
          type="button"
          className="locale-datepicker-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          tabIndex={-1}
          title={lang === 'fr' ? 'Choisir une date' : 'Choose date'}
          aria-label={lang === 'fr' ? 'Choisir une date' : 'Choose date'}
        >
          <i className="fa fa-calendar" />
        </button>
      </div>

      {isOpen && (
        <div className="locale-datepicker-popup">
          <div className="datepicker-header">
            <button type="button" className="datepicker-nav-btn" onClick={handlePrevMonth} aria-label="Previous month">
              ‹
            </button>
            <span className="datepicker-title">
              {MONTHS[lang][viewMonth]} {viewYear}
            </span>
            <button type="button" className="datepicker-nav-btn" onClick={handleNextMonth} aria-label="Next month">
              ›
            </button>
          </div>

          <div className="datepicker-days-header">
            {DAYS[lang].map((dayName, idx) => (
              <span key={idx} className="datepicker-day-name">
                {dayName}
              </span>
            ))}
          </div>

          <div className="datepicker-days-grid">
            {daysGrid.map((d, idx) => (
              <button
                key={idx}
                type="button"
                className={`datepicker-day-cell ${!d ? 'empty' : ''} ${isDaySelected(d) ? 'selected' : ''}`}
                disabled={!d}
                onClick={() => d && handleSelectDay(d)}
              >
                {d || ''}
              </button>
            ))}
          </div>

          <div className="datepicker-footer">
            <button
              type="button"
              className="datepicker-footer-btn"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                setIsOpen(false);
              }}
            >
              {lang === 'fr' ? 'Effacer' : 'Clear'}
            </button>
            <button
              type="button"
              className="datepicker-footer-btn"
              onClick={(e) => {
                e.stopPropagation();
                const now = new Date();
                const y = now.getFullYear();
                const m = String(now.getMonth() + 1).padStart(2, '0');
                const d = String(now.getDate()).padStart(2, '0');
                onChange(`${y}-${m}-${d}`);
                setIsOpen(false);
              }}
            >
              {lang === 'fr' ? "Aujourd'hui" : 'Today'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
