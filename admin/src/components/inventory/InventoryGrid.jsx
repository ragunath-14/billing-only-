import React from 'react';
import { Search, Package, AlertTriangle, CheckCircle2, Edit2, Trash2 } from 'lucide-react';

const InventoryGrid = ({ list, onEdit, onDelete }) => (
  <div className="table-responsive">
    <table className="table mb-0 align-middle">
      <thead className="table-light"><tr><th className="ps-3 text-muted small fw-bold">PRODUCT</th><th className="text-muted small fw-bold">CATEGORY</th><th className="text-muted small fw-bold">STOCK</th><th className="text-muted small fw-bold">STATUS</th><th className="text-end pe-3 text-muted small fw-bold">ACTIONS</th></tr></thead>
      <tbody>
        {!list || list.length === 0 ? <tr><td colSpan="5"><div className="py-5 text-center text-muted"><Package size={40} className="mb-2 opacity-25" /><br />No products found</div></td></tr>
          : list.map(p => {
            const isLow = p.stock < (p.lowStockThreshold || 5);
            return (<tr key={p._id}>
              <td className="ps-3"><div className="fw-bold">{p.name}</div><div className="text-muted extra-small">{p.brand}</div></td>
              <td><span className="badge bg-light text-dark border">{p.category}</span></td>
              <td className="fw-bold fs-5">{p.stock}</td>
              <td>{isLow ? <span className="badge bg-danger-subtle text-danger border border-danger px-3"><AlertTriangle size={12} className="me-1" /> LOW STOCK</span>
                : <span className="badge bg-success-subtle text-success border border-success px-3"><CheckCircle2 size={12} className="me-1" /> GOOD</span>}</td>
              <td className="text-end pe-3">
                <div className="d-flex gap-2 justify-content-end">
                  <button className="btn btn-outline-primary btn-sm p-1" onClick={() => onEdit(p)}><Edit2 size={14} /></button>
                  <button className="btn btn-outline-danger btn-sm p-1" onClick={() => onDelete(p)}><Trash2 size={14} /></button>
                </div>
              </td>
            </tr>);})}
      </tbody>
    </table>
  </div>
);

export default InventoryGrid;
