import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
};

const SHORT_MONTHS = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  fr: ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'],
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
  const [mode, setMode] = useState('days'); // 'days' | 'months' | 'years'
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
  const [yearPage, setYearPage] = useState(() => Math.floor((selectedDate ? selectedDate.getFullYear() : new Date().getFullYear()) / 12) * 12);

  // Keep view in sync when value changes externally
  useEffect(() => {
    const d = parseDate(value);
    if (d) {
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
      setYearPage(Math.floor(d.getFullYear() / 12) * 12);
    }
  }, [value]);

  // Close calendar on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setMode('days');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutside);
    };
  }, [isOpen]);

  const handlePrev = (e) => {
    e.stopPropagation();
    if (mode === 'days') {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear((y) => y - 1);
      } else {
        setViewMonth((m) => m - 1);
      }
    } else if (mode === 'months') {
      setViewYear((y) => y - 1);
    } else if (mode === 'years') {
      setYearPage((p) => p - 12);
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (mode === 'days') {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear((y) => y + 1);
      } else {
        setViewMonth((m) => m + 1);
      }
    } else if (mode === 'months') {
      setViewYear((y) => y + 1);
    } else if (mode === 'years') {
      setYearPage((p) => p + 12);
    }
  };

  const handleSelectDay = (day) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const isoString = `${viewYear}-${mm}-${dd}`;
    onChange(isoString);
    setIsOpen(false);
    setMode('days');
  };

  const handleSelectMonth = (mIdx) => {
    setViewMonth(mIdx);
    setMode('days');
  };

  const handleSelectYear = (yr) => {
    setViewYear(yr);
    setMode('days');
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

  const yearsList = [];
  for (let i = 0; i < 12; i++) {
    yearsList.push(yearPage + i);
  }

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
            <button
              type="button"
              className="datepicker-nav-btn"
              onClick={handlePrev}
              aria-label="Previous"
            >
              ‹
            </button>
            <div className="datepicker-title-group">
              {mode === 'days' && (
                <>
                  <button
                    type="button"
                    className="datepicker-title-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMode('months');
                    }}
                    title={lang === 'fr' ? 'Choisir le mois' : 'Choose month'}
                  >
                    {MONTHS[lang][viewMonth]}
                  </button>
                  <button
                    type="button"
                    className="datepicker-title-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setYearPage(Math.floor(viewYear / 12) * 12);
                      setMode('years');
                    }}
                    title={lang === 'fr' ? "Choisir l'année" : 'Choose year'}
                  >
                    {viewYear}
                  </button>
                </>
              )}
              {mode === 'months' && (
                <>
                  <span className="datepicker-title-static">
                    {MONTHS[lang][viewMonth]}
                  </span>
                  <button
                    type="button"
                    className="datepicker-title-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setYearPage(Math.floor(viewYear / 12) * 12);
                      setMode('years');
                    }}
                    title={lang === 'fr' ? "Choisir l'année" : 'Choose year'}
                  >
                    {viewYear}
                  </button>
                </>
              )}
              {mode === 'years' && (
                <span className="datepicker-title-static">
                  {yearPage} - {yearPage + 11}
                </span>
              )}
            </div>
            <button
              type="button"
              className="datepicker-nav-btn"
              onClick={handleNext}
              aria-label="Next"
            >
              ›
            </button>
          </div>

          {mode === 'days' && (
            <>
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
            </>
          )}

          {mode === 'months' && (
            <div className="datepicker-grid-3col">
              {SHORT_MONTHS[lang].map((mName, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`datepicker-block-cell ${idx === viewMonth ? 'selected' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectMonth(idx);
                  }}
                >
                  {mName}
                </button>
              ))}
            </div>
          )}

          {mode === 'years' && (
            <div className="datepicker-grid-3col">
              {yearsList.map((yr) => (
                <button
                  key={yr}
                  type="button"
                  className={`datepicker-block-cell ${yr === viewYear ? 'selected' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectYear(yr);
                  }}
                >
                  {yr}
                </button>
              ))}
            </div>
          )}

          <div className="datepicker-footer">
            <button
              type="button"
              className="datepicker-footer-btn"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                setIsOpen(false);
                setMode('days');
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
                setViewYear(y);
                setViewMonth(now.getMonth());
                onChange(`${y}-${m}-${d}`);
                setIsOpen(false);
                setMode('days');
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
