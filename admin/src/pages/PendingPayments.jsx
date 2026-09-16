import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PaymentsHeader from '../components/payments/PaymentsHeader';
import PaymentsStats from '../components/payments/PaymentsStats';
import PaymentsTable from '../components/payments/PaymentsTable';
import AddPaymentModal from '../components/payments/AddPaymentModal';
import PartialPaymentModal from '../components/payments/PartialPaymentModal';
import Pagination from '../components/common/Pagination';
import { API_URLS } from '../api/config';

const PendingPayments = () => {
  const [tab, setTab] = useState('pending');
  const [q, setQ] = useState('');
  const [items, setItems] = useState([]);
  const [, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showPartial, setShowPartial] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form, setForm] = useState({ customerName: '', customerPhone: '', totalAmount: '' });
  const [page, setPage] = useState(1);
  const size = 10;

  const fetchPayments = async () => {
    try {
      const res = await axios.get(API_URLS.PAYMENTS);
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => { setPage(1); }, [q, tab]);

  const fs = items.filter(i => {
    const matchSearch = i.customerName.toLowerCase().includes(q.toLowerCase()) || 
                       i.customerPhone.includes(q);
    const matchTab = tab === 'all' || i.status.toLowerCase() === tab.toLowerCase();
    return matchSearch && matchTab;
  });

  const paged = fs.slice((page - 1) * size, page * size);

  const handleSave = async () => {
    try {
      await axios.post(API_URLS.PAYMENTS, form);
      fetchPayments();
      setShowAdd(false); 
      setForm({ customerName: '', customerPhone: '', totalAmount: '' });
    } catch {
      alert('Failed to save payment record');
    }
  };

  const onPartialSubmit = async (id, paymentData) => {
    try {
      await axios.post(`${API_URLS.PAYMENTS}/${id}/partial`, paymentData);
      fetchPayments();
      setShowPartial(false);
      setSelectedRecord(null);
    } catch {
      alert('Failed to record payment');
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this record forever?')) return;
    try {
      await axios.delete(`${API_URLS.PAYMENTS}/${id}`);
      fetchPayments();
    } catch {
      alert('Delete failed');
    }
  };

  const handlePartialOpen = (record) => {
    setSelectedRecord(record);
    setShowPartial(true);
  };

  return (
    <div className="container-fluid p-0">
      <PaymentsHeader onAdd={() => setShowAdd(true)} />
      
      <PaymentsStats 
        pendingAmt={items.filter(i => i.status !== 'Completed').reduce((a, x) => a + (x.totalAmount - x.paidAmount), 0)} 
        completedCount={items.filter(i => i.status === 'Completed').length} 
      />

      <div className="table-card mt-4 shadow-sm border-0 pt-0">
        <PaymentsTable 
          list={paged} 
          q={q} 
          onQ={setQ} 
          tab={tab} 
          onTab={setTab} 
          onPartial={handlePartialOpen} 
          onDelete={onDelete} 
          totalCount={fs.length} 
          allNames={items.map(i => i.customerName)} 
        />
        <Pagination total={fs.length} size={size} current={page} onChange={setPage} />
      </div>

      <AddPaymentModal 
        show={showAdd} 
        onClose={() => setShowAdd(false)} 
        form={form} 
        onChange={setForm} 
        onSave={handleSave} 
      />

      <PartialPaymentModal
        show={showPartial}
        onClose={() => setShowPartial(false)}
        record={selectedRecord}
        onSave={onPartialSubmit}
      />
    </div>
  );
};

export default PendingPayments;
