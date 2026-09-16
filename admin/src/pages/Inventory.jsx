import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus, Edit2, Trash2, Tag, IndianRupee, PackageOpen,
  Search, AlertTriangle, CheckCircle2, X, Layers
} from 'lucide-react';
import Pagination from '../components/common/Pagination';

const API = 'http://localhost:5000/api/products';
const emptyForm = {
  name: '', brand: '', sku: '', category: 'Mobile',
  buyingPrice: '', sellingPrice: '', stock: '',
  lowStockThreshold: 5
};

const emptyOffer = {
  hasOffer: true, offerLabel: '', discountType: 'percentage',
  discountValue: '', offerExpiry: ''
};

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'inventory'
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'low' | 'good'

  // Modals
  const [offerModal, setOfferModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  
  const [page, setPage] = useState(1);
  const size = 10;

  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [priceForm, setPriceForm] = useState({ buyingPrice: '', sellingPrice: '' });
  const [offerForm, setOfferForm] = useState(emptyOffer);
  const [targetId, setTargetId] = useState(null);
  const [targetName, setTargetName] = useState('');

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => { setPage(1); }, [search, filterCat, stockFilter]);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(API);
      setProducts(res.data);
    } catch (err) { console.error(err); }
  };

  // ── Filtered lists ────────────────────────────────────────────────────────
  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q);
    const matchCat = filterCat === 'All' || p.category === filterCat;
    const matchStock = stockFilter === 'all' ? true : stockFilter === 'low' ? p.stock < p.lowStockThreshold : p.stock >= p.lowStockThreshold;
    return matchSearch && matchCat && matchStock;
  });

  const paged = filtered.slice((page - 1) * size, page * size);

  const totalStock = products.reduce((a, p) => a + p.stock, 0);
  const totalStockValue = products.reduce((a, p) => a + (p.stock * p.sellingPrice), 0);
  const lowStockCount = products.filter(p => p.stock < p.lowStockThreshold).length;

  // ── Product CRUD ─────────────────────────────────────────────────────────
  const openAddProduct = () => {
    setEditProduct(null);
    setForm(emptyForm);
    setProductModal(true);
  };

  const openEditProduct = (p) => {
    setEditProduct(p);
    setForm({
      name: p.name, brand: p.brand, sku: p.sku || '', category: p.category,
      buyingPrice: p.buyingPrice, sellingPrice: p.sellingPrice,
      stock: p.stock, lowStockThreshold: p.lowStockThreshold || 5
    });
    setProductModal(true);
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editProduct) {
        await axios.put(`${API}/${editProduct._id}`, form);
      } else {
        await axios.post(API, form);
      }
      setProductModal(false);
      fetchProducts();
    } catch (err) { alert(err.response?.data?.error || 'Error saving product'); }
  };

  // ── Price Modal ──────────────────────────────────────────────────────────
  const openPriceModal = (p) => {
    setTargetId(p._id);
    setTargetName(p.name);
    setPriceForm({ buyingPrice: p.buyingPrice, sellingPrice: p.sellingPrice });
    setPriceModal(true);
  };

  const savePrice = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`${API}/${targetId}/price`, priceForm);
      setPriceModal(false);
      fetchProducts();
    } catch (err) { alert('Error updating price'); }
  };

  // ── Offer Modal ──────────────────────────────────────────────────────────
  const openOfferModal = (p) => {
    setTargetId(p._id);
    setTargetName(p.name);
    setOfferForm({
      hasOffer: p.hasOffer || false,
      offerLabel: p.offerLabel || '',
      discountType: p.discountType || 'percentage',
      discountValue: p.discountValue || '',
      offerExpiry: p.offerExpiry ? p.offerExpiry.slice(0, 10) : ''
    });
    setOfferModal(true);
  };

  const saveOffer = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`${API}/${targetId}/offer`, {
        ...offerForm,
        discountValue: Number(offerForm.discountValue),
        offerExpiry: offerForm.offerExpiry || null
      });
      setOfferModal(false);
      fetchProducts();
    } catch (err) { alert('Error saving offer'); }
  };

  const removeOffer = async () => {
    try {
      await axios.patch(`${API}/${targetId}/offer`, {
        hasOffer: false, offerLabel: '', discountValue: 0, offerExpiry: null
      });
      setOfferModal(false);
      fetchProducts();
    } catch (err) { alert('Error removing offer'); }
  };

  // ── Delete ───────────────────────────────────────────────────────────────
  const openDelete = (p) => {
    setTargetId(p._id);
    setTargetName(p.name);
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API}/${targetId}`);
      setDeleteModal(false);
      fetchProducts();
    } catch (err) { alert('Error deleting product'); }
  };

  const calcFinalPrice = (p) => {
    if (!p.hasOffer || !p.discountValue) return p.sellingPrice;
    if (p.discountType === 'percentage') return (p.sellingPrice - (p.sellingPrice * p.discountValue / 100)).toFixed(2);
    return (p.sellingPrice - p.discountValue).toFixed(2);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: '8px' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Products &amp; Inventory</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Manage your product catalog and inventory levels</p>
        </div>
        <button onClick={openAddProduct}><Plus size={18} /> Add Product</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
        {['products', 'inventory'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'none', color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
              borderRadius: 0, padding: '12px 24px', fontWeight: 600, textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── PRODUCTS TAB ──────────────────────────────────────────── */}
      {activeTab === 'products' && (
        <>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input style={{ paddingLeft: '38px', width: '100%' }}
                placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ width: '180px' }}>
              <option value="All">All Categories</option>
              <option>Mobile</option><option>Accessory</option>
              <option>Tablet</option><option>Other</option>
            </select>
          </div>

          <div className="card table-container">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Cost Price</th>
                  <th>Selling Price</th>
                  <th>Offer / Discount</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(p => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600 }}>{p.name}<br />
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.brand}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{p.sku || '—'}</td>
                    <td><span className="badge primary">{p.category}</span></td>
                    <td><span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><IndianRupee size={14} />{p.buyingPrice}</span></td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><IndianRupee size={14} />{p.sellingPrice}</span>
                      {p.hasOffer && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--success)', fontSize: '0.78rem' }}>
                          ↓ <IndianRupee size={12} />{calcFinalPrice(p)}
                        </span>
                      )}
                    </td>
                    <td>
                      {p.hasOffer ? (
                        <div>
                          <span className="badge success">
                            {p.discountType === 'percentage' ? `${p.discountValue}% OFF` : `₹${p.discountValue} OFF`}
                          </span>
                          {p.offerLabel && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{p.offerLabel}</div>}
                        </div>
                      ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No offer</span>}
                    </td>
                    <td><span className={p.stock < (p.lowStockThreshold || 5) ? 'badge danger' : 'badge success'}>{p.stock}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button title="Edit Product" className="outline" style={{ padding: '5px 8px' }} onClick={() => openEditProduct(p)}>
                          <Edit2 size={14} />
                        </button>
                        <button title="Update Price" className="outline" style={{ padding: '5px 8px', color: 'var(--success)', borderColor: 'var(--success)' }} onClick={() => openPriceModal(p)}>
                          <IndianRupee size={14} />
                        </button>
                        <button title="Manage Offer" className="outline" style={{ padding: '5px 8px', color: '#f59e0b', borderColor: '#f59e0b' }} onClick={() => openOfferModal(p)}>
                          <Tag size={14} />
                        </button>
                        <button title="Delete Product" className="danger" style={{ padding: '5px 8px' }} onClick={() => openDelete(p)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="9" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    <PackageOpen size={40} style={{ marginBottom: '12px', opacity: 0.4 }} /><br />No products found
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3">
            <Pagination total={filtered.length} size={size} current={page} onChange={setPage} />
          </div>
        </>
      )}

      {/* ── INVENTORY TAB ─────────────────────────────────────────── */}
      {activeTab === 'inventory' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Layers size={24} style={{ opacity: 0.8 }} />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>{totalStock}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.85, marginTop: '4px' }}>Total Units in Stock</div>
            </div>
            <div className="card" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <IndianRupee size={24} style={{ opacity: 0.8 }} />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>₹{totalStockValue.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.85, marginTop: '4px' }}>Total Stock Value</div>
            </div>
            <div className="card" style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <AlertTriangle size={24} style={{ opacity: 0.8 }} />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 700 }}>{lowStockCount}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.85, marginTop: '4px' }}>Low Stock Items</div>
            </div>
          </div>

          {/* Stock filter chips */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {[
              { key: 'all', label: `All Products (${products.length})` },
              { key: 'low', label: `Low Stock (${lowStockCount})` },
              { key: 'good', label: `Good Stock (${products.length - lowStockCount})` },
            ].map(opt => (
              <button key={opt.key}
                onClick={() => setStockFilter(opt.key)}
                style={{ padding: '6px 18px', fontWeight: 600,
                  background: stockFilter === opt.key ? 'var(--primary)' : 'transparent',
                  border: '1px solid var(--border-color)', color: stockFilter === opt.key ? '#fff' : 'var(--text-muted)' }}>
                {opt.label}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
            <input style={{ paddingLeft: '38px', width: '100%' }}
              placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="card table-container">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Threshold</th>
                  <th>Stock Value</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(p => {
                  const isLow = p.stock < (p.lowStockThreshold || 5);
                  return (
                    <tr key={p._id}>
                      <td style={{ fontWeight: 600 }}>{p.name}<br />
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.brand}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{p.sku || '—'}</td>
                      <td><span className="badge primary">{p.category}</span></td>
                      <td style={{ fontWeight: 700, fontSize: '1.1rem' }}>{p.stock}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{p.lowStockThreshold || 5}</td>
                      <td>₹{(p.stock * p.sellingPrice).toLocaleString('en-IN')}</td>
                      <td>
                        {isLow
                          ? <span className="badge danger" style={{ display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}><AlertTriangle size={12} /> Low Stock</span>
                          : <span className="badge success" style={{ display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}><CheckCircle2 size={12} /> In Stock</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button title="Edit" className="outline" style={{ padding: '5px 8px' }} onClick={() => openEditProduct(p)}><Edit2 size={14} /></button>
                          <button title="Delete" className="danger" style={{ padding: '5px 8px' }} onClick={() => openDelete(p)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan="9" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    <PackageOpen size={40} style={{ marginBottom: '12px', opacity: 0.4 }} /><br />No products found
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3">
            <Pagination total={filtered.length} size={size} current={page} onChange={setPage} />
          </div>
        </>
      )}

      {/* ════ MODAL: Add / Edit Product ════════════════════════════ */}
      {productModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <span className="modal-title">{editProduct ? 'Edit Product' : 'Add New Product'}</span>
              <button className="modal-close" onClick={() => setProductModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={saveProduct}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label>Product Name *</label>
                  <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. iPhone 15 Pro" />
                </div>
                <div className="form-group">
                  <label>Brand *</label>
                  <input required value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="Apple" />
                </div>
                <div className="form-group">
                  <label>SKU / Model No.</label>
                  <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="IPH-15-PRO" />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option>Mobile</option><option>Accessory</option>
                    <option>Tablet</option><option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Cost / Buying Price (₹) *</label>
                  <input required type="number" value={form.buyingPrice} onChange={e => setForm({ ...form, buyingPrice: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Selling Price (₹) *</label>
                  <input required type="number" value={form.sellingPrice} onChange={e => setForm({ ...form, sellingPrice: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Stock Quantity *</label>
                  <input required type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Low Stock Threshold</label>
                  <input type="number" value={form.lowStockThreshold} onChange={e => setForm({ ...form, lowStockThreshold: e.target.value })} />
                </div>
              </div>
              <button type="submit" style={{ width: '100%', marginTop: '16px' }}>
                {editProduct ? 'Update Product' : 'Save Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ════ MODAL: Quick Price Update ════════════════════════════ */}
      {priceModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <span className="modal-title">Update Price</span>
              <button className="modal-close" onClick={() => setPriceModal(false)}><X size={18} /></button>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>{targetName}</p>
            <form onSubmit={savePrice}>
              <div className="form-group">
                <label>Cost / Buying Price (₹)</label>
                <input type="number" required value={priceForm.buyingPrice}
                  onChange={e => setPriceForm({ ...priceForm, buyingPrice: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Selling Price (₹)</label>
                <input type="number" required value={priceForm.sellingPrice}
                  onChange={e => setPriceForm({ ...priceForm, sellingPrice: e.target.value })} />
              </div>
              <button type="submit" style={{ width: '100%', marginTop: '12px', backgroundColor: 'var(--success)' }}>
                Save Price
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ════ MODAL: Offer / Discount ═══════════════════════════════ */}
      {offerModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <span className="modal-title" style={{ color: '#f59e0b' }}>🏷 Manage Offer</span>
              <button className="modal-close" onClick={() => setOfferModal(false)}><X size={18} /></button>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>{targetName}</p>
            <form onSubmit={saveOffer}>
              <div className="form-group">
                <label>Offer Label (e.g. "Summer Sale")</label>
                <input value={offerForm.offerLabel}
                  onChange={e => setOfferForm({ ...offerForm, offerLabel: e.target.value })}
                  placeholder="Diwali Offer" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Discount Type</label>
                  <select value={offerForm.discountType}
                    onChange={e => setOfferForm({ ...offerForm, discountType: e.target.value })}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Discount Value</label>
                  <input required type="number" min="0"
                    value={offerForm.discountValue}
                    onChange={e => setOfferForm({ ...offerForm, discountValue: e.target.value })}
                    placeholder={offerForm.discountType === 'percentage' ? '10' : '500'} />
                </div>
              </div>
              <div className="form-group">
                <label>Offer Expiry Date (Optional)</label>
                <input type="date" value={offerForm.offerExpiry}
                  onChange={e => setOfferForm({ ...offerForm, offerExpiry: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="submit" style={{ flex: 1, backgroundColor: '#f59e0b' }}>
                  <Tag size={16} /> Apply Offer
                </button>
                <button type="button" className="outline" style={{ flex: 1, borderColor: 'var(--danger)', color: 'var(--danger)' }}
                  onClick={removeOffer}>
                  Remove Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════ MODAL: Delete Confirmation ════════════════════════════ */}
      {deleteModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '380px', textAlign: 'center' }}>
            <Trash2 size={48} style={{ color: 'var(--danger)', margin: '0 auto 16px' }} />
            <h2 style={{ marginBottom: '8px' }}>Delete Product?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Are you sure you want to delete <strong>{targetName}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="outline" style={{ flex: 1 }} onClick={() => setDeleteModal(false)}>Cancel</button>
              <button className="danger" style={{ flex: 1 }} onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
