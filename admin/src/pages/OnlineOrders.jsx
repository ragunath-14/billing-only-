import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URLS } from '../api/config';
import {
  ShoppingBag, Search, Eye, FileText, CheckCircle,
  Clock, XCircle, Truck, Trash2, ChevronRight, Filter, User, AlertTriangle
} from 'lucide-react';
import Pagination from '../components/common/Pagination';

const OnlineOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage] = useState(1);
  const size = 10;

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => { setPage(1); }, [search, filter]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URLS.BASE}/orders`);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API_URLS.BASE}/orders/${id}/status`, { status });
      fetchOrders();
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (err) {
      alert('Update failed');
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm('Delete this order record?')) return;
    try {
      await axios.delete(`${API_URLS.BASE}/orders/${id}`);
      fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      alert('Delete failed');
    }
  };

  const createBill = (order) => {
    // Navigate to billing and pass the order items
    navigate('/billing', { 
      state: { 
        prefillItems: order.items.map(item => ({
          _id: item.productId,
          name: item.name,
          sellingPrice: item.price,
          qty: item.qty,
          outOfStock: item.outOfStock
        })),
        customerInfo: order.customer
      } 
    });
  };

  const filtered = orders.filter(o => {
    const matchSearch = o.orderId.toLowerCase().includes(search.toLowerCase()) || 
                       o.customer.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || o.status === filter;
    return matchSearch && matchFilter;
  });

  const paged = filtered.slice((page - 1) * size, page * size);

  const getStatusColor = (s) => {
    switch (s) {
      case 'Pending': return 'bg-warning text-dark';
      case 'Confirmed': return 'bg-info text-white';
      case 'Shipped': return 'bg-primary text-white';
      case 'Delivered': return 'bg-success text-white';
      case 'Cancelled': return 'bg-danger text-white';
      default: return 'bg-secondary text-white';
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Online Bookings</h2>
          <p className="text-muted small">Manage orders from your online storefront</p>
        </div>
        <div className="d-flex flex-column flex-sm-row gap-2">
          <div className="position-relative">
            <Search className="position-absolute top-50 translate-middle-y ms-3 text-muted" size={16} />
            <input
              type="text"
              className="form-control ps-5 rounded-pill border-light shadow-sm"
              placeholder="Order ID or Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="form-select rounded-pill border-light shadow-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      <div className="row g-4">
        {/* Orders List */}
        <div className={selectedOrder ? "col-lg-7" : "col-12"}>
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="ps-4 py-3 text-uppercase small fw-bold">Order ID</th>
                    <th className="py-3 text-uppercase small fw-bold">Customer</th>
                    <th className="py-3 text-uppercase small fw-bold">Amount</th>
                    <th className="py-3 text-uppercase small fw-bold text-center">Status</th>
                    <th className="pe-4 py-3 text-uppercase small fw-bold text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" className="text-center py-5 text-muted">Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-5 text-muted">No orders found</td></tr>
                  ) : (
                    paged.map(o => (
                      <tr key={o._id} className={selectedOrder?._id === o._id ? 'table-primary' : ''} style={{cursor:'pointer'}} onClick={() => setSelectedOrder(o)}>
                        <td className="ps-4 py-3 fw-bold">
                          {o.orderId}
                          {o.items.some(i => i.outOfStock) && (
                            <span className="badge bg-danger bg-opacity-10 text-danger border border-danger ms-2" title="Order contains an item that was out of stock when booked">
                              <AlertTriangle size={11} className="me-1" style={{ marginTop: '-2px' }} />OOS
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          <div className="fw-bold">{o.customer.name}</div>
                          <div className="text-muted small">{o.customer.phone}</div>
                        </td>
                        <td className="py-3 fw-bold">₹{o.totalAmount.toFixed(0)}</td>
                        <td className="py-3 text-center">
                          <span className={`badge rounded-pill px-3 ${getStatusColor(o.status)}`}>{o.status}</span>
                        </td>
                        <td className="pe-4 py-3 text-center">
                          <div className="d-flex justify-content-center gap-2">
                            <button className="btn btn-primary btn-sm rounded-pill px-3 d-flex align-items-center" onClick={(e) => { e.stopPropagation(); createBill(o); }}>
                              <FileText size={14} className="me-1" /> Bill
                            </button>
                            <button className="btn btn-outline-danger btn-sm rounded-circle p-1 d-flex align-items-center justify-content-center" style={{width:'30px', height:'30px'}} onClick={(e) => { e.stopPropagation(); deleteOrder(o._id); }} title="Delete Order">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-3 px-2">
            <Pagination total={filtered.length} size={size} current={page} onChange={setPage} />
          </div>
        </div>

        {/* Order Details Panel */}
        {selectedOrder && (
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 position-sticky" style={{ top: '20px' }}>
              <div className="card-header bg-white p-3 border-bottom d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0">Order Details</h5>
                <button className="btn-close" onClick={() => setSelectedOrder(null)}></button>
              </div>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <div className="text-muted small">Order ID</div>
                    <div className="h5 fw-bold text-primary">{selectedOrder.orderId}</div>
                    <div className="text-muted x-small">{new Date(selectedOrder.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-end">
                    <span className={`badge rounded-pill px-3 py-2 ${getStatusColor(selectedOrder.status)}`}>{selectedOrder.status}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="fw-bold mb-2 pb-1 border-bottom d-flex align-items-center gap-2">
                    <User size={16} /> Customer Info
                  </div>
                  <div className="bg-light p-3 rounded-3">
                    <div className="fw-bold">{selectedOrder.customer.name}</div>
                    <div className="text-muted mb-1">{selectedOrder.customer.phone}</div>
                    <div className="small text-muted">{selectedOrder.customer.address}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="fw-bold mb-2 pb-1 border-bottom d-flex align-items-center gap-2">
                    <ShoppingBag size={16} /> Order Items
                  </div>
                  <div className="order-items-list border rounded-3 overflow-hidden">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="d-flex justify-content-between p-2 border-bottom last-child-no-border bg-white">
                        <div>
                          <div className="fw-bold small d-flex align-items-center gap-2">
                            {item.name}
                            {item.outOfStock && (
                              <span className="badge bg-danger bg-opacity-10 text-danger border border-danger x-small" title="This item was out of stock when the customer booked it">
                                <AlertTriangle size={10} className="me-1" style={{ marginTop: '-2px' }} />Out of Stock
                              </span>
                            )}
                          </div>
                          <div className="text-muted x-small">₹{item.price} x {item.qty}</div>
                        </div>
                        <div className="fw-bold small align-self-center">₹{item.total.toFixed(0)}</div>
                      </div>
                    ))}
                    <div className="p-3 bg-light d-flex justify-content-between fw-bold">
                      <span>Total Amount</span>
                      <span className="text-primary h5 mb-0">₹{selectedOrder.totalAmount.toFixed(0)}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold">Update Status</label>
                  <div className="d-flex gap-2 flex-wrap">
                    {['Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                      <button 
                        key={s} 
                        className={`btn btn-sm rounded-pill px-3 ${selectedOrder.status === s ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => updateStatus(selectedOrder._id, s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <button className="btn btn-primary rounded-pill py-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2" onClick={() => createBill(selectedOrder)}>
                    <FileText size={18} /> Convert to Final Bill
                  </button>
                  <button className="btn btn-light text-danger rounded-pill py-2" onClick={() => deleteOrder(selectedOrder._id)}>
                    <Trash2 size={16} className="me-1" /> Remove Order Record
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .last-child-no-border:last-child { border-bottom: 0 !important; }
        .x-small { font-size: 0.75rem; }
      `}</style>
    </div>
  );
};

export default OnlineOrders;
