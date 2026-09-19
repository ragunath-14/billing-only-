import { Plus, Search, FileSpreadsheet } from 'lucide-react';
import SuggestionInput from '../common/SuggestionInput';
import { exportToExcel } from '../../utils/exportExcel';

const handleExport = (products) => {
  const rows = products.map((p, i) => ({
    'Sl. No': p.sku || i + 1,
    'Name': p.name,
    'Brand': p.brand,
    'Category': p.category,
    'Buying Price': p.buyingPrice,
    'Selling Price': p.sellingPrice,
    'Stock': p.stock,
    'Unit': p.unit,
    'Low Stock Threshold': p.lowStockThreshold,
    'Barcode': p.barcode || '',
  }));
  exportToExcel(`Products_${new Date().toISOString().split('T')[0]}.xlsx`, 'Products', rows);
};

const ProductHeader = ({ search, onSearch, products = [], onAdd, onBulk }) => (
  <div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-start justify-content-between gap-3 mb-3 px-1">
    <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-2 gap-sm-4 flex-grow-1">
      <div className="flex-shrink-0">
        <h5 className="fw-bold mb-1">Stock & Operations</h5>
        <p className="text-muted extra-small mb-0">Manage everything from crackers to quantities</p>
      </div>
      <div className="flex-grow-1" style={{ maxWidth: '400px' }}>
        <SuggestionInput value={search} onChange={onSearch} onSelect={onSearch}
          placeholder="Filter by name, brand, or Sl. No..." options={products.map(p => ({ label: p.name, subText: p.sku ? `Sl. No: ${p.sku}` : p.brand, data: p.name }))} />
      </div>
    </div>
    <div className="d-flex gap-2">
      <button className="btn btn-light border shadow-sm fw-bold px-3 d-flex align-items-center justify-content-center flex-fill text-nowrap" onClick={() => handleExport(products)}>
        <FileSpreadsheet size={16} className="me-1" /> Export Excel
      </button>
      <label className="btn btn-light mb-0 border shadow-sm fw-bold px-3 d-flex align-items-center justify-content-center flex-fill text-nowrap">
        Bulk CSV <input type="file" hidden accept=".csv" onChange={onBulk} />
      </label>
      <button className="btn btn-primary shadow-sm px-4 fw-bold flex-fill text-nowrap" onClick={onAdd}>
        <Plus size={16} className="me-1" /> New Stock
      </button>
    </div>
  </div>
);

export default ProductHeader;
