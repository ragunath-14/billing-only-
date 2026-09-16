import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ total, size, current, onChange }) => {
  const pages = Math.ceil(total / size);
  if (pages <= 1) return null;
  
  const start = (current - 1) * size + 1;
  const end = Math.min(current * size, total);

  return (
    <div className="d-flex align-items-center justify-content-between p-3 border-top bg-light bg-opacity-10">
      <div className="text-muted small">Showing {start}-{end} of {total}</div>
      <div className="d-flex gap-1">
        <button className="btn btn-outline-secondary btn-sm p-1" disabled={current === 1} onClick={() => onChange(current - 1)}><ChevronLeft size={16} /></button>
        {[...Array(pages)].map((_, i) => (
          <button key={i} className={`btn btn-sm px-2 ${current === i + 1 ? 'btn-primary' : 'btn-outline-secondary'}`} 
            onClick={() => onChange(i + 1)}>{i + 1}</button>
        ))}
        <button className="btn btn-outline-secondary btn-sm p-1" disabled={current === pages} onClick={() => onChange(current + 1)}><ChevronRight size={16} /></button>
      </div>
    </div>
  );
};

export default Pagination;
