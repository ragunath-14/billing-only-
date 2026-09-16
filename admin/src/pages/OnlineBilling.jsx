import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URLS } from '../api/config';
import { useBilling } from '../hooks/useBilling';
import { useSettings } from '../context/SettingsContext';
import {
  ShoppingBag, CheckCircle, Clock, FileText,
  User, MapPin, Phone, ArrowRight, Printer,
  Search, Filter, CreditCard, Banknote, Trash2, AlertTriangle
} from 'lucide-react';
import ReceiptModal from '../components/billing/ReceiptModal';

const OnlineBilling = () => {
  const b = useBilling();
  const { settings } = useSettings();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      const res = await axios.get(`${API_URLS.BASE}/orders`);
      // Only show orders that aren't Delivered or Cancelled yet
      setOrders(res.data.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBillOrder = (order) => {
    setSelectedOrder(order);
    // Prefill the billing hook with this order's data
    b.prefill({
      customerInfo: order.customer,
      prefillItems: order.items.map(i => ({
        _id: i.productId,
        name: i.name,
        sellingPrice: i.price,
        qty: i.qty,
        outOfStock: i.outOfStock
      }))
    });
  };

  const finalizeBill = async () => {
    if (!selectedOrder) return;
    
    // 1. Process the bill via existing hook
    await b.checkout(b.cart.reduce((a,i) => a + (i.sellingPrice * i.quantity), 0), selectedOrder._id);
    
    // 2. Update order status to Delivered in background
    try {
      await axios.patch(`${API_URLS.BASE}/orders/${selectedOrder._id}/status`, { status: 'Delivered' });
      fetchPendingOrders();
      setSelectedOrder(null);
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  const deleteOrder = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this online booking?')) return;
    try {
      await axios.delete(`${API_URLS.BASE}/orders/${id}`);
      fetchPendingOrders();
      if (selectedOrder?._id === id) setSelectedOrder(null);
    } catch (err) {
      alert('Failed to delete order');
    }
  };

  return (
    <div className="container-fluid py-4 h-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Online Order Billing</h2>
          <p className="text-muted small">Convert online bookings into final tax invoices</p>
        </div>
      </div>

      <div className="row g-4 h-100">
        {/* Left: Pending Orders List */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white p-3 border-bottom d-flex align-items-center gap-2">
              <Clock className="text-primary" size={18} />
              <h6 className="fw-bold mb-0">Pending Bookings</h6>
            </div>
            <div className="card-body p-0 overflow-auto" style={{ maxHeight: '70vh' }}>
              {loading ? (
                <div className="p-5 text-center text-muted">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="p-5 text-center text-muted">No pending orders found</div>
              ) : (
                orders.map(o => (
                  <div 
                    key={o._id} 
                    className={`order-item-card p-3 border-bottom border-light cursor-pointer transition-all ${selectedOrder?._id === o._id ? 'bg-primary bg-opacity-10 border-primary border-opacity-25' : 'hover-bg-light'}`}
                    onClick={() => handleBillOrder(o)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="fw-bold text-primary d-flex align-items-center gap-2">
                        {o.orderId}
                        {o.items.some(i => i.outOfStock) && (
                          <span className="badge bg-danger bg-opacity-10 text-danger border border-danger x-small" title="Order contains an item that was out of stock when booked">
                            <AlertTriangle size={10} className="me-1" style={{ marginTop: '-2px' }} />OOS
                          </span>
                        )}
                      </span>
                      <div className="d-flex gap-2 align-items-center">
                        <span className="badge bg-warning text-dark x-small rounded-pill">{o.status}</span>
                        <button 
                          className="btn btn-link text-danger p-0 border-0" 
                          onClick={(e) => deleteOrder(e, o._id)}
                          title="Delete Order"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="fw-bold text-dark mb-1">{o.customer.name}</div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-muted small">{o.items.length} items</span>
                      <span className="fw-bold text-dark">₹{o.totalAmount.toFixed(0)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Invoicing Module */}
        <div className="col-lg-8">
          {selectedOrder ? (
            <div className="card border-0 shadow-sm rounded-4 h-100 d-flex flex-column">
              <div className="card-header bg-white p-3 border-bottom d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-primary bg-opacity-10 p-2 rounded-3">
                    <FileText className="text-primary" size={20} />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0">Billing for {selectedOrder.orderId}</h6>
                    <span className="text-muted x-small">Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button className="btn btn-light btn-sm rounded-pill px-3" onClick={() => setSelectedOrder(null)}>Cancel</button>
              </div>

              <div className="card-body p-4 overflow-auto">
                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <div className="fw-bold small text-muted text-uppercase mb-2">Customer Details</div>
                    <div className="bg-light p-3 rounded-4">
                      <div className="fw-bold mb-1"><User size={14} className="me-2 text-primary" />{selectedOrder.customer.name}</div>
                      <div className="small mb-1"><Phone size={14} className="me-2 text-primary" />{selectedOrder.customer.phone}</div>
                      <div className="small"><MapPin size={14} className="me-2 text-primary" />{selectedOrder.customer.address}</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="fw-bold small text-muted text-uppercase mb-2">Payment Option</div>
                    <div className="d-flex gap-2 h-100 align-items-start">
                      <button 
                        className={`btn flex-grow-1 py-3 rounded-4 d-flex flex-column align-items-center gap-2 ${paymentMethod === 'Cash' ? 'btn-primary shadow' : 'btn-light'}`}
                        onClick={() => { setPaymentMethod('Cash'); b.setCust({...b.cust, method: 'Cash'}); }}
                      >
                        <Banknote size={24} />
                        <span className="fw-bold small">Cash</span>
                      </button>
                      <button 
                        className={`btn flex-grow-1 py-3 rounded-4 d-flex flex-column align-items-center gap-2 ${paymentMethod === 'UPI' ? 'btn-primary shadow' : 'btn-light'}`}
                        onClick={() => { setPaymentMethod('UPI'); b.setCust({...b.cust, method: 'UPI'}); }}
                      >
                        <CreditCard size={24} />
                        <span className="fw-bold small">UPI / Online</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="fw-bold small text-muted text-uppercase mb-2">Itemized Breakdown</div>
                <div className="table-responsive rounded-4 border border-light overflow-hidden">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="ps-3 py-2 small fw-bold">Product</th>
                        <th className="py-2 small fw-bold text-center">Qty</th>
                        <th className="py-2 small fw-bold text-end">Price</th>
                        <th className="pe-3 py-2 small fw-bold text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {b.cart.map((item, idx) => (
                        <tr key={idx}>
                          <td className="ps-3 small fw-bold">
                            {item.name}
                            {item.outOfStock && (
                              <span className="badge bg-danger bg-opacity-10 text-danger border border-danger x-small ms-2" title="This item was out of stock when the customer booked it">
                                <AlertTriangle size={10} className="me-1" style={{ marginTop: '-2px' }} />Out of Stock
                              </span>
                            )}
                          </td>
                          <td className="text-center small">{item.quantity}</td>
                          <td className="text-end small">₹{item.sellingPrice}</td>
                          <td className="pe-3 text-end fw-bold small">₹{(item.quantity * item.sellingPrice).toFixed(0)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-light fw-bold">
                      <tr>
                        <td colSpan="3" className="ps-3 text-end small py-3">Grand Total</td>
                        <td className="pe-3 text-end text-primary h5 mb-0 py-3">₹{b.cart.reduce((a,i)=>a+(i.sellingPrice*i.quantity), 0).toFixed(0)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="card-footer bg-white p-4 border-top">
                <div className="d-grid gap-3">
                  <button 
                    className="btn btn-primary rounded-pill py-3 fw-bold h5 mb-0 shadow-lg d-flex align-items-center justify-content-center gap-2"
                    onClick={finalizeBill}
                    disabled={b.loading}
                  >
                    {b.loading ? 'Processing...' : (
                      <>
                        <Printer size={20} /> Generate & Print Invoice
                      </>
                    )}
                  </button>
                  <p className="text-center x-small text-muted mb-0">
                    This will finalize the sale, update inventory, and mark the online order as "Delivered".
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm rounded-4 h-100 d-flex align-items-center justify-content-center bg-light bg-opacity-50 border-dashed">
              <div className="text-center p-5">
                <div className="bg-white p-4 rounded-circle shadow-sm d-inline-block mb-4">
                  <ShoppingBag size={48} className="text-muted opacity-25" />
                </div>
                <h4 className="fw-bold text-dark opacity-50">Select an order to begin billing</h4>
                <p className="text-muted">Pick a pending order from the list on the left to generate an invoice.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <ReceiptModal show={!!b.lastSale} sale={b.lastSale} onClose={() => b.setLastSale(null)} onDelete={b.deleteSale} />

      <style>{`
        .order-item-card { transition: all 0.2s ease; }
        .hover-bg-light:hover { background-color: #f8f9fa; }
        .x-small { font-size: 0.7rem; }
        .border-dashed { border: 2px dashed #dee2e6 !important; }
      `}</style>
    </div>
  );
};

export default OnlineBilling;
