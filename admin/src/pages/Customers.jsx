import React, { useState, useEffect } from 'react';
import CustomerHeader from '../components/customers/CustomerHeader';
import CustomerTable from '../components/customers/CustomerTable';
import AddCustomerModal from '../components/customers/AddCustomerModal';
import Pagination from '../components/common/Pagination';
import CustomerHistoryModal from '../components/customers/CustomerHistoryModal';
import axios from 'axios';
import { API_URLS } from '../api/config';

const Customers = () => {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedCust, setSelectedCust] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [form, setForm] = useState({ name: '', mobile: '' });
  const [editIdx, setEditIdx] = useState(null);
  const size = 10;
  const ac = API_URLS.CUSTOMERS;

  const f = () => axios.get(ac).then(res => setCustomers(res.data));

  useEffect(() => {
    f();
    axios.get(API_URLS.SALES).then(res => setSales(res.data));
  }, []);

  useEffect(() => { setPage(1); }, [q]);

  const fs = customers.filter(c => c.name.toLowerCase().includes(q.toLowerCase()) || c.mobile.includes(q));
  const paged = fs.slice((page - 1) * size, page * size);

  const handleEdit = (c) => { setForm(c); setEditIdx(c._id); setShowModal(true); };
  const handleDelete = async (id) => { if (window.confirm('Delete this customer?')) { await axios.delete(`${ac}/${id}`); f(); } };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editIdx) { 
        await axios.put(`${ac}/${editIdx}`, form); 
      } else { 
        await axios.post(ac, form); 
      }
      setShowModal(false); 
      setForm({ name: '', mobile: '' }); 
      setEditIdx(null); 
      f();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save customer');
    }
  };

  return (<div className="container-fluid p-0">
    <CustomerHeader onAdd={() => { setEditIdx(null); setForm({ name: '', mobile: '' }); setShowModal(true); }} />
    <div className="table-card mt-4 shadow-sm border-0">
      <CustomerTable list={paged} q={q} onQ={setQ} onAdd={() => setShowModal(true)} onEdit={handleEdit} onDelete={handleDelete} 
        onHistory={(c) => { setSelectedCust(c); setShowHistory(true); }} allCustomers={customers} />
      <Pagination total={fs.length} size={size} current={page} onChange={setPage} />
    </div>
    <AddCustomerModal show={showModal} onClose={() => setShowModal(false)} form={form} onChange={setForm} onSave={handleSave} edit={editIdx !== null} />
    <CustomerHistoryModal show={showHistory} onClose={() => setShowHistory(false)} customer={selectedCust} sales={sales} />
  </div>);
};

export default Customers;
