import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Search } from 'lucide-react';

const SuggestionInput = ({ value, onChange, placeholder, options = [], onSelect, icon: Icon = Search, className = "" }) => {
  const [show, setShow] = useState(false);
  const ref = useRef(null);

  // Memoized filter — only recomputes when value or options actually change
  const filtered = useMemo(() => {
    if (!value || !show) return [];
    const q = value.toLowerCase();
    return options.filter(o => o.label.toLowerCase().includes(q)).slice(0, 8);
  }, [value, options, show]);

  useEffect(() => {
    const click = (e) => { if (ref.current && !ref.current.contains(e.target)) setShow(false); };
    document.addEventListener('mousedown', click);
    return () => document.removeEventListener('mousedown', click);
  }, []);

  const handleSelect = useCallback((data) => {
    onSelect(data);
    setShow(false);
  }, [onSelect]);

  return (
    <div className={`search-wrapper position-relative ${className}`} ref={ref}>
      <Icon className="search-icon" size={16} />
      <input className="form-control" placeholder={placeholder} value={value} 
        onChange={e => { onChange(e.target.value); setShow(true); }}
        onFocus={() => setShow(true)}
        autoComplete="off" />
      
      {show && filtered.length > 0 && (
        <div className="position-absolute w-100 bg-white border shadow-lg rounded-3 mt-1" style={{ zIndex: 1000, overflow: 'hidden' }}>
          {filtered.map((o, idx) => (
            <div key={idx} className="px-3 py-2 border-bottom hover-bg-light cursor-pointer small fw-bold d-flex flex-column"
              style={{ transition: 'all 0.15s', cursor: 'pointer' }}
              onClick={() => handleSelect(o.data)}>
              <span>{o.label}</span>
              {o.subText && <span className="text-muted extra-small fw-normal">{o.subText}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(SuggestionInput);
