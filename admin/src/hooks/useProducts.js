import { useState, useEffect } from 'react';
import axios from 'axios';

import { API_URLS } from '../api/config';

const emptyForm = { name: '', brand: '', sku: '', category: 'Sparklers', buyingPrice: '', sellingPrice: '', stock: '', lowStockThreshold: 5, boxContents: '' };

// form.boxContents is a newline-separated string while being edited in the textarea;
// when opening an existing product for edit it arrives as an array from the API.
const parseBoxContents = (val) => {
  if (Array.isArray(val)) return val.map(s => s.trim()).filter(Boolean);
  return (val || '').split('\n').map(s => s.trim()).filter(Boolean);
};
const emptyOffer = { offerLabel: '', discountType: 'percentage', discountValue: '', offerExpiry: '' };

export const useProducts = () => {
  const API = API_URLS.PRODUCTS;
  const [products, setProducts] = useState([]);
  const [tab, setTab] = useState('products');
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [stockFilter, setStockFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showProduct, setShowProduct] = useState(false);
  const [showPrice, setShowPrice] = useState(false);
  const [showOffer, setShowOffer] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [priceForm, setPriceForm] = useState({ buyingPrice: '', sellingPrice: '' });
  const [offerForm, setOfferForm] = useState(emptyOffer);
  const [targetId, setTargetId] = useState(null);
  const [targetName, setTargetName] = useState('');

  const f = () => { setLoading(true); axios.get(API).then(r => setProducts(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { f(); }, []);

  const saveProduct = async (e) => {
    e.preventDefault();
    const bPrice = Number(form.buyingPrice || 0);
    const sPrice = Number(form.sellingPrice || 0);

    if (sPrice <= bPrice && sPrice > 0) {
      alert('WARNING: Selling Price must be higher than Cost Price (to ensure profit)');
      return;
    }

    try {
      const payload = {
        ...form,
        buyingPrice: bPrice,
        sellingPrice: sPrice,
        stock: Number(form.stock || 0),
        lowStockThreshold: Number(form.lowStockThreshold || 5),
        boxContents: parseBoxContents(form.boxContents)
      };
      if (editTarget) {
        await axios.put(`${API}/${editTarget._id}`, payload);
      } else {
        await axios.post(API, payload);
      }
      setShowProduct(false);
      f();
    } catch (err) {
      alert('Save failed: ' + (err.response?.data?.error || err.message));
    }
  };
  const savePrice = (e) => { e.preventDefault(); axios.patch(`${API}/${targetId}/price`, { buyingPrice: Number(priceForm.buyingPrice), sellingPrice: Number(priceForm.sellingPrice) }).then(() => { setShowPrice(false); f(); }); };
  const saveOffer = (e) => { e.preventDefault(); axios.patch(`${API}/${targetId}/offer`, { hasOffer: true, ...offerForm, discountValue: Number(offerForm.discountValue) }).then(() => { setShowOffer(false); f(); }); };
  const removeOffer = () => { axios.patch(`${API}/${targetId}/offer`, { hasOffer: false }).then(() => { setShowOffer(false); f(); }); };
  const confirmDelete = () => { axios.delete(`${API}/${targetId}`).then(() => { setShowDelete(false); f(); }); };

  return {
    products, tab, setTab, search, setSearch, filterCat, setFilterCat, stockFilter, setStockFilter, loading,
    showProduct, setShowProduct, showPrice, setShowPrice, showOffer, setShowOffer, showDelete, setShowDelete,
    editTarget, setEditTarget, form, setForm, priceForm, setPriceForm, offerForm, setOfferForm,
    targetId, setTargetId, targetName, setTargetName, f, saveProduct, savePrice, saveOffer, removeOffer, confirmDelete
  };
};
