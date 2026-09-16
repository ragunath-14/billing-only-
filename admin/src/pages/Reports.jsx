import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  FileText, Download, Calendar, Filter, Printer, 
  ArrowUpRight, ShoppingCart, Users, TrendingUp,
  FileSpreadsheet, FileIcon as FilePdf, ChevronDown, User, Search, Trash2, Eye
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { API_URLS } from '../api/config';
import Pagination from '../components/common/Pagination';

const Reports = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('Sales Report');
  const [fromDate, setFromDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const size = 10;

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => { setPage(1); }, [searchQuery, fromDate, toDate]);

  const fetchSales = async () => {
    try {
      const res = await axios.get(API_URLS.SALES);
      setSales(res.data);
    } catch (err) {
      console.error("Failed to fetch sales", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSale = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bill? Stock will be restored and linked online orders will be reset.')) return;
    try {
      await axios.delete(`${API_URLS.SALES}/${id}`);
      fetchSales(); // Refresh list
      alert('Bill deleted successfully');
    } catch (err) {
      alert('Failed to delete bill');
    }
  };

  // Filtered sales based on date range and search
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const saleDate = new Date(s.createdAt).toISOString().split('T')[0];
      const matchesDate = saleDate >= fromDate && saleDate <= toDate;
      const matchesSearch = s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (s._id && s._id.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesDate && matchesSearch;
    });
  }, [sales, fromDate, toDate, searchQuery]);

  const paged = filteredSales.slice((page - 1) * size, page * size);

  // Stats calculation
  const stats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const totalGST = filteredSales.reduce((sum, s) => sum + (s.gst || 0), 0);
    const totalOrders = filteredSales.length;
    return {
      revenue: totalRevenue,
      gst: totalGST,
      orders: totalOrders
    };
  }, [filteredSales]);

  // Chart data: Monthly Sales Trend
  const salesTrendData = useMemo(() => {
    const months = {};
    filteredSales.forEach(s => {
      const d = new Date(s.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = (months[key] || 0) + s.totalAmount;
    });
    return Object.keys(months).sort().map(key => {
      const [year, month] = key.split('-');
      const name = new Date(year, month - 1).toLocaleString('default', { month: 'short' }) + ' ' + year.slice(-2);
      return { name, amount: Math.round(months[key]) };
    });
  }, [filteredSales]);

  // Chart data: Top Selling Products
  const topProductsData = useMemo(() => {
    const prods = {};
    filteredSales.forEach(s => {
      s.products.forEach(p => {
        prods[p.name] = (prods[p.name] || 0) + p.quantity;
      });
    });
    return Object.keys(prods)
      .map(name => ({ name, qty: prods[name] }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [filteredSales]);

  const exportToExcel = () => {
    const data = filteredSales.map(s => ({
      'Invoice #': s._id.slice(-6).toUpperCase(),
      'Date': new Date(s.createdAt).toLocaleDateString(),
      'Customer': s.customerName,
      'Phone': s.customerPhone || 'N/A',
      'Items': s.products.length,
      'Bill Type': s.billType || 'Regular',
      'Subtotal': s.subt || 0,
      'GST': s.gst || 0,
      'Total': s.totalAmount || 0,
      'Method': s.paymentMethod
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
    XLSX.writeFile(wb, `Sales_Report_${fromDate}_to_${toDate}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(18);
    doc.text("Business Sales Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Period: ${fromDate} to ${toDate}`, 14, 22);
    doc.text(`Total Revenue: ₹${stats.revenue.toLocaleString()}`, 14, 28);

    const tableData = filteredSales.map(s => [
      s._id.slice(-6).toUpperCase(),
      new Date(s.createdAt).toLocaleDateString(),
      s.customerName,
      s.customerPhone || 'N/A',
      s.products.length,
      s.billType || 'Regular',
      s.subt?.toFixed(2) || '0.00',
      s.gst?.toFixed(2) || '0.00',
      s.totalAmount?.toFixed(2) || '0.00',
      s.paymentMethod
    ]);

    doc.autoTable({
      head: [['Inv #', 'Date', 'Customer', 'Phone', 'Items', 'Type', 'Subtotal', 'GST', 'Total', 'Method']],
      body: tableData,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] }
    });

    doc.save(`Sales_Report_${fromDate}_to_${toDate}.pdf`);
  };

  if (loading) return (
    <div className="d-flex align-items-center justify-content-center vh-100">
      <div className="spinner-grow text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="reports-container p-4 bg-light min-vh-100">
      {/* Top Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm">
        <div>
          <h4 className="fw-bold text-dark mb-0">Reports & Analytics</h4>
          <p className="text-muted small mb-0">Detailed business performance insights</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="text-end">
            <div className="fw-bold small">Admin User</div>
            <div className="text-muted x-small">Store Manager</div>
          </div>
          <div className="bg-primary rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm" style={{width: '40px', height: '40px'}}>
            <User className="text-white" size={20} />
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
        <div className="card-header bg-white border-0 pt-4 px-4">
          <h6 className="fw-bold mb-0 d-flex align-items-center gap-2">
            <Filter size={18} className="text-primary" /> Report Filters
          </h6>
        </div>
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small fw-bold text-muted">Report Type</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-0"><FileText size={16} /></span>
                <select className="form-select bg-light border-0" value={reportType} onChange={e => setReportType(e.target.value)}>
                  <option>Sales Report</option>
                  <option>Tax Report</option>
                  <option>Inventory Report</option>
                </select>
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-bold text-muted">From Date</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-0"><Calendar size={16} /></span>
                <input type="date" className="form-control bg-light border-0" value={fromDate} onChange={e => setFromDate(e.target.value)} />
              </div>
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-bold text-muted">To Date</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-0"><Calendar size={16} /></span>
                <input type="date" className="form-control bg-light border-0" value={toDate} onChange={e => setToDate(e.target.value)} />
              </div>
            </div>
            <div className="col-md-3 d-flex align-items-end gap-2">
              <button className="btn btn-danger btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-2 rounded-3 py-2" onClick={exportToPDF}>
                <FilePdf size={16} /> PDF
              </button>
              <button className="btn btn-success btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-2 rounded-3 py-2" onClick={exportToExcel}>
                <FileSpreadsheet size={16} /> Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white hover-up">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-primary bg-opacity-10 p-3 rounded-4">
                <TrendingUp className="text-primary" size={24} />
              </div>
              <div>
                <div className="text-muted small fw-bold">TOTAL REVENUE</div>
                <div className="h4 fw-bold mb-0 text-dark">₹{stats.revenue.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white hover-up">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-success bg-opacity-10 p-3 rounded-4">
                <ShoppingCart className="text-success" size={24} />
              </div>
              <div>
                <div className="text-muted small fw-bold">TOTAL SALES</div>
                <div className="h4 fw-bold mb-0 text-dark">{stats.orders} <span className="small text-muted fw-normal">Invoices</span></div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white hover-up">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-warning bg-opacity-10 p-3 rounded-4">
                <FileText className="text-warning" size={24} />
              </div>
              <div>
                <div className="text-muted small fw-bold">TOTAL GST COLLECTED</div>
                <div className="h4 fw-bold mb-0 text-dark">₹{stats.gst.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h6 className="fw-bold mb-0">Monthly Sales Trend</h6>
              <div className="badge bg-light text-primary rounded-pill px-3 py-2">Revenue Growth</div>
            </div>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={salesTrendData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
            <h6 className="fw-bold mb-4">Top Selling Products</h6>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={topProductsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} width={100} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                  />
                  <Bar dataKey="qty" fill="#2563eb" radius={[0, 10, 10, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-header bg-white p-4 border-0 d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0">Sales Transactions</h6>
          <div className="position-relative" style={{width: '250px'}}>
            <Search className="position-absolute top-50 translate-middle-y ms-3 text-muted" size={16} />
            <input 
              type="text" 
              className="form-control form-control-sm ps-5 bg-light border-0 rounded-pill" 
              placeholder="Search by customer or invoice..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr className="text-muted x-small fw-bold text-uppercase">
                <th className="ps-4 py-3">Invoice #</th>
                <th className="py-3">Date</th>
                <th className="py-3">Customer</th>
                <th className="py-3">Phone</th>
                <th className="py-3">Items</th>
                <th className="py-3">Subtotal</th>
                <th className="py-3 text-primary">GST</th>
                <th className="py-3">Total</th>
                <th className="py-3">Status</th>
                <th className="pe-4 py-3 text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((s) => (
                <tr key={s._id} className="small">
                  <td className="ps-4 py-3 fw-bold">#{s._id.slice(-6).toUpperCase()}</td>
                  <td className="py-3 text-muted">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 fw-bold">{s.customerName}</td>
                  <td className="py-3 text-muted">{s.customerPhone || 'N/A'}</td>
                  <td className="py-3"><span className="badge bg-light text-dark">{s.products.length} Items</span></td>
                  <td className="py-3">₹{s.subt?.toLocaleString()}</td>
                  <td className="py-3 text-primary fw-bold">₹{s.gst?.toLocaleString()}</td>
                  <td className="py-3 fw-bold text-dark">₹{s.totalAmount?.toLocaleString()}</td>
                  <td className="py-3">
                    <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1">Completed</span>
                  </td>
                  <td className="pe-4 py-3 text-end">
                    <div className="d-flex justify-content-end gap-2">
                      <button className="btn btn-link btn-sm p-0 text-primary fw-bold text-decoration-none d-flex align-items-center gap-1">
                        <Eye size={14} /> View
                      </button>
                      <button 
                        className="btn btn-link btn-sm p-0 text-danger fw-bold text-decoration-none d-flex align-items-center gap-1"
                        onClick={() => handleDeleteSale(s._id)}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan="10" className="text-center py-5 text-muted">
                    No transactions found for the selected period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="card-footer bg-white border-0 py-3">
          <Pagination total={filteredSales.length} size={size} current={page} onChange={setPage} />
        </div>
      </div>

      <style>{`
        .reports-container {
          font-family: 'Inter', sans-serif;
        }
        .x-small { font-size: 0.7rem; }
        .fw-600 { font-weight: 600; }
        .hover-up { transition: transform 0.2s; }
        .hover-up:hover { transform: translateY(-5px); }
        .stat-card {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .table-card-title {
          font-size: 1rem;
          font-weight: 700;
          color: #1e293b;
        }
        .stock-chip {
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .chip-primary { background: #e0e7ff; color: #4338ca; }
        .btn-sm { font-size: 0.8rem; }
      `}</style>
    </div>
  );
};

export default Reports;
