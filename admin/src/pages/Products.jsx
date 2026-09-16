import React from 'react';
import { useProducts } from '../hooks/useProducts';
import ProductHeader from '../components/inventory/ProductHeader';
import ProductTable from '../components/inventory/ProductTable';
import InventoryStats from '../components/inventory/InventoryStats';
import ProductFormModal from '../components/inventory/ProductFormModal';
import { PriceModal, OfferModal } from '../components/inventory/PriceOfferModals';
import DeleteModal from '../components/inventory/DeleteModal';
import Pagination from '../components/common/Pagination';
import axios from 'axios';
import { API_URLS } from '../api/config';
import { useSettings } from '../context/SettingsContext';
import { calcFinalPrice } from '../utils/pricing';

const emptyForm = { name: '', brand: '', sku: '', category: 'Other', buyingPrice: '', sellingPrice: '', stock: '', lowStockThreshold: 5 };

const Products = () => {
  const p = useProducts();
  const { settings } = useSettings();
  const [page, setPage] = React.useState(1);
  const [categories, setCategories] = React.useState([]);
  const size = 10;

  React.useEffect(() => {
    axios.get(`${API_URLS.BASE}/categories`).then(r => setCategories(r.data)).catch(() => {});
  }, []);

  const fs = React.useMemo(() => {
    const q = p.search.toLowerCase();
    return p.products.filter(i => {
      const matchQ = i.name.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q);
      const matchCat = p.filterCat === 'All' || i.category === p.filterCat;
      const sVal = Number(i.stock || 0);
      const thres = Number(i.lowStockThreshold || 5);
      const matchStock = p.stockFilter === 'all' ? true
        : p.stockFilter === 'out' ? sVal === 0
        : p.stockFilter === 'low' ? sVal > 0 && sVal <= thres
        : sVal > thres;
      return matchQ && matchCat && matchStock;
    });
  }, [p.products, p.search, p.filterCat, p.stockFilter]);

  React.useEffect(() => { setPage(1); }, [p.search, p.filterCat, p.stockFilter, p.tab]);
  const paged = fs.slice((page - 1) * size, page * size);
  const openEdit = (i) => { p.setEditTarget(i); p.setForm(i); p.setShowProduct(true); };
  const dPrice = (i) => { p.setTargetId(i._id); p.setTargetName(i.name); p.setPriceForm({ buyingPrice: i.buyingPrice, sellingPrice: i.sellingPrice }); p.setShowPrice(true); };
  const dOffer = (i) => { p.setTargetId(i._id); p.setTargetName(i.name); p.setOfferForm({ offerLabel: i.offerLabel || '', discountType: i.discountType || 'percentage', discountValue: i.discountValue || '' }); p.setShowOffer(true); };
  const dDelete = (i) => { p.setTargetId(i._id); p.setTargetName(i.name); p.setShowDelete(true); };
  
  const onBulk = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader(); 
    reader.onload = async (evt) => {
      const csv = evt.target.result;
      const lines = csv.split('\n').filter(l => l.trim()).map(l => l.split(','));
      const headers = lines[0].map(h => h.trim().toLowerCase());
      const batch = [];
      
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i]; if (row.length < 2) continue;
        const d = {}; headers.forEach((h, idx) => d[h] = row[idx]?.trim());
        batch.push({ 
          name: d.name, brand: d.brand, buyingPrice: Number(d.cost || 0), 
          sellingPrice: Number(d.price || 0), stock: Number(d.stock || 0), 
          category: d.category || 'Other' 
        });
      }
      
      if (batch.length) {
        try {
          await axios.post(`${API_URLS.BASE}/products/bulk`, batch);
          p.f(); // Refresh list
          alert(`Bulk upload complete! ${batch.length} products added.`);
        } catch (err) {
          alert('Bulk upload failed: ' + (err.response?.data?.error || err.message));
        }
      }
    }; 
    reader.readAsText(file);
  };
  const calc = (i) => calcFinalPrice(i, settings);

  return (<>
    <ProductHeader search={p.search} onSearch={p.setSearch} products={p.products} onAdd={() => { p.setEditTarget(null); p.setForm(emptyForm); p.setShowProduct(true); }} onBulk={onBulk} />
    <div className="table-card mt-3 shadow-sm border-0">
      <div className="p-3 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div className="d-flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Inventory' },
            { key: 'low', label: '⚠️ Low Stock' },
            { key: 'out', label: '⛔ Out of Stock' },
          ].map(f => (
            <button key={f.key} className={`btn btn-sm rounded-pill px-3 fw-bold ${p.stockFilter === f.key ? 'btn-primary shadow-sm' : 'btn-light border text-muted'}`}
              onClick={() => p.setStockFilter(f.key)}>{f.label}</button>
          ))}
        </div>
        <select className="form-select form-select-sm w-auto rounded-pill px-3 fw-bold" value={p.filterCat} onChange={e => p.setFilterCat(e.target.value)}>
          <option value="All">All Categories</option>
          {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
        </select>
      </div>
      <ProductTable list={paged} onEdit={openEdit} onPrice={dPrice} onOffer={dOffer} onDelete={dDelete} calcFinal={calc} categories={categories} globalDiscount={settings.globalDiscount} />
      <Pagination total={fs.length} size={size} current={page} onChange={setPage} />
    </div>
    <ProductFormModal show={p.showProduct} editTarget={p.editTarget} form={p.form} categories={categories} onChange={p.setForm} onSave={p.saveProduct} onClose={() => p.setShowProduct(false)} />
    <PriceModal show={p.showPrice} name={p.targetName} form={p.priceForm} onChange={p.setPriceForm} onSave={p.savePrice} onClose={() => p.setShowPrice(false)} />
    <OfferModal show={p.showOffer} name={p.targetName} form={p.offerForm} onChange={p.setOfferForm} onSave={p.saveOffer} onRemove={p.removeOffer} onClose={() => p.setShowOffer(false)} />
    <DeleteModal show={p.showDelete} name={p.targetName} onConfirm={p.confirmDelete} onClose={() => p.setShowDelete(false)} />
  </>);
};

export default Products;
