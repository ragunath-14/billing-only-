import React from 'react';
import { Edit2, IndianRupee, Tag, Trash2 } from 'lucide-react';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { getCategoryImage } from '../../utils/categoryImages';

const ProductRow = ({ p, onEdit, onPrice, onOffer, onDelete, calcFinal, categories, globalDiscount }) => (
  <tr>
    <td>
      <div className="d-flex align-items-center gap-2">
        {(p.imageUrl || getCategoryImage(p.category)) ? <img src={p.imageUrl || getCategoryImage(p.category)} alt="" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 4 }} />
          : <div className="bg-light d-flex align-items-center justify-content-center" style={{ width: 40, height: 40, borderRadius: 4, fontSize: '1.1rem' }}>{getCategoryIcon(p.category, categories)}</div>}
        <div>
          <div className="fw-600" style={{ fontWeight: 600 }}>{p.name}</div>
          <div className="text-muted" style={{ fontSize: '0.7rem' }}>
            {p.sku ? `Sl. No: ${p.sku}` : (p.barcode || 'No Barcode')}
          </div>
        </div>
      </div>
    </td>
    <td><span className="text-muted small">{p.brand || '—'}</span></td>
    <td><span className="stock-chip chip-primary">{p.category}</span></td>
    <td>₹{(p.buyingPrice || 0).toLocaleString('en-IN')}</td>
    <td>
      <div>₹{(p.sellingPrice || 0).toLocaleString('en-IN')}</div>
      {p.hasOffer && <div className="text-success small">↓ ₹{calcFinal(p).toLocaleString('en-IN')}</div>}
    </td>
    <td>
      {globalDiscount?.enabled && globalDiscount.value > 0
        ? <span className="stock-chip chip-success" title="Store-wide discount from Settings">
            🌐 {globalDiscount.type === 'percentage' ? `${globalDiscount.value}% OFF` : `₹${globalDiscount.value} OFF`}
          </span>
        : p.hasOffer ? <span className="stock-chip chip-success">
            {p.discountType === 'percentage' ? `${p.discountValue}% OFF` : `₹${p.discountValue} OFF`}
          </span> : <span className="text-muted small">—</span>}
    </td>
    <td>
      {p.stock === 0
        ? <span className="stock-chip chip-danger">Out of Stock</span>
        : <span className={`stock-chip ${p.stock < (p.lowStockThreshold || 5) ? 'chip-danger' : 'chip-success'}`}>{p.stock}</span>}
    </td>
    <td className="text-center pe-3">
      <div className="d-flex justify-content-center gap-1">
        <button className="btn btn-light btn-icon" onClick={() => onEdit(p)} title="Edit Product"><Edit2 size={14} /></button>
        <button className="btn btn-light btn-icon text-primary" onClick={() => onPrice(p)} title="Edit Prices"><IndianRupee size={14} /></button>
        <button className="btn btn-light btn-icon text-warning" onClick={() => onOffer(p)} title="Manage Offers"><Tag size={14} /></button>
        <button className="btn btn-light btn-icon text-danger" onClick={() => onDelete(p)} title="Delete Product"><Trash2 size={14} /></button>
      </div>
    </td>
  </tr>
);

export default ProductRow;
