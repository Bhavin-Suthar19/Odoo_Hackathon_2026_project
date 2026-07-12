import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option...',
  disabled = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [dropUp, setDropUp] = useState(false);

  const containerRef = useRef(null);
  const listRef = useRef(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  // Check viewport clipping on open
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const dropdownHeight = 240; // estimated max menu height
      if (rect.bottom + dropdownHeight > windowHeight && rect.top > dropdownHeight) {
        setDropUp(true);
      } else {
        setDropUp(false);
      }
    }
  }, [isOpen]);

  // Handle outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = (optionValue) => {
    if (disabled) return;
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === 'Escape') {
      setIsOpen(false);
      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        const idx = options.findIndex((o) => String(o.value) === String(value));
        setHighlightIndex(idx >= 0 ? idx : 0);
      } else if (highlightIndex >= 0 && highlightIndex < options.length) {
        handleSelect(options[highlightIndex].value);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightIndex(0);
      } else {
        setHighlightIndex((prev) => (prev + 1) % options.length);
      }
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightIndex(options.length - 1);
      } else {
        setHighlightIndex((prev) => (prev - 1 + options.length) % options.length);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`custom-select-container ${className}`}
      style={{ position: 'relative', width: '100%' }}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="custom-select-trigger industrial-input"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          cursor: disabled ? 'not-allowed' : 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 120ms ease',
            flexShrink: 0,
            color: 'var(--text-secondary)',
          }}
        />
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          role="listbox"
          className={`custom-select-dropdown ${dropUp ? 'drop-up' : 'drop-down'}`}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            [dropUp ? 'bottom' : 'top']: 'calc(100% + 4px)',
            zIndex: 1000,
            maxHeight: '240px',
            overflowY: 'auto',
            margin: 0,
            padding: '4px',
            listStyle: 'none',
          }}
        >
          {options.map((option, index) => {
            const isSelected = String(option.value) === String(value);
            const isHighlighted = index === highlightIndex;

            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setHighlightIndex(index)}
                className={`custom-select-option ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
              >
                <span>{option.label}</span>
                {isSelected && <Check size={14} color="var(--accent-primary)" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
