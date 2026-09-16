import React from 'react';
import { Search, Package, MoveHorizontal } from 'lucide-react';
import ProductRow from './ProductRow';

const ProductTable = ({ list, onEdit, onPrice, onOffer, onDelete, calcFinal, categories, globalDiscount }) => (
  <div>
    {list && list.length > 0 && (
      <div className="d-lg-none text-muted extra-small d-flex align-items-center gap-1 px-3 pt-2">
        <MoveHorizontal size={12} /> Swipe table sideways for prices &amp; actions
      </div>
    )}
    <div className="table-responsive">
    <table className="table mb-0 align-middle">
      <thead className="table-light"><tr><th className="ps-3 text-muted small fw-bold">PRODUCT DETAILS</th><th className="text-muted small fw-bold">BRAND</th><th className="text-muted small fw-bold">CAT</th><th className="text-muted small fw-bold">COST</th><th className="text-muted small fw-bold">SELLING</th><th className="text-muted small fw-bold">OFFER</th><th className="text-muted small fw-bold">STOCK</th><th className="text-center pe-3 text-muted small fw-bold">ACTIONS</th></tr></thead>
      <tbody>
        {!list || list.length === 0 ? <tr><td colSpan="8"><div className="py-5 text-center text-muted"><Package size={40} className="mb-2 opacity-25" /><br />No products found</div></td></tr>
          : list.map(p => <ProductRow key={p._id} p={p} onEdit={onEdit} onPrice={onPrice} onOffer={onOffer} onDelete={onDelete} calcFinal={calcFinal} categories={categories} globalDiscount={globalDiscount} />)
        }
      </tbody>
    </table>
    </div>
  </div>
);

export default ProductTable;
