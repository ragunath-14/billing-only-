import React from 'react';
import SuggestionInput from '../common/SuggestionInput';
import Pagination from '../common/Pagination';
import { calcFinalPrice } from '../../utils/pricing';

const cats = ['All', 'Sparklers', 'Flower Pots', 'Rockets', 'Ground Chakkars', 'Gift Boxes', 'Novelties', 'Other'];

const ProductCatalog = ({ search, onSearch, cat, onCat, filtered, allProducts = [], onAdd, settings }) => {
  const [page, setPage] = React.useState(1);
  const size = 9;

  React.useEffect(() => { setPage(1); }, [search, cat]);
  const paged = filtered.slice((page - 1) * size, page * size);

  return (
    <div className="col-lg-6">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div><h6 className="fw-bold mb-0">Products Catalog</h6><p className="text-muted extra-small mb-0">Select items to add to cart</p></div>
      </div>
      <div className="table-card p-3 mb-3 shadow-sm border-0">
        <SuggestionInput value={search} onChange={onSearch} onSelect={onSearch} className="mb-2"
          placeholder="Look up product..." options={React.useMemo(() => allProducts.map(p => ({ label: p.name, subText: p.brand, data: p.name })), [allProducts])} />
        <div className="d-flex gap-1 overflow-auto pb-1 no-scrollbar" style={{ whiteSpace: 'nowrap' }}>
          {cats.map(c => <button key={c} className={`btn btn-xs rounded-pill px-3 py-1 ${cat === c ? 'btn-primary shadow-sm' : 'btn-light border text-muted'}`} style={{ fontSize: '0.75rem' }} onClick={() => onCat(c)}>{c}</button>)}
        </div>
      </div>
      <div className="row g-2 mb-3">
        {paged.map(p => {
          const pr = calcFinalPrice(p, settings);
          return (<div key={p._id} className="col-6 col-md-4">
            <div className="pos-item-card border shadow-sm transition-all" onClick={() => onAdd(p)}>
              <div className="pos-item-header d-flex justify-content-between extra-small"><span className="text-muted">{p.brand}</span><span className={p.stock < 5 ? 'text-danger fw-bold' : 'text-success'}>S:{p.stock}</span></div>
              <div className="pos-item-name fw-bold" style={{ fontSize: '0.85rem' }}>{p.name}</div>
              <div className="pos-item-price text-primary fw-bold" style={{ fontSize: '0.9rem' }}>₹{pr.toLocaleString('en-IN')}</div>
            </div></div>);})}
      </div>
      <Pagination total={filtered.length} size={size} current={page} onChange={setPage} />
    </div>
  );
};

export default React.memo(ProductCatalog);
