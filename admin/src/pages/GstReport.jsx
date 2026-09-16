import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  FileText, Download, Calendar, Filter, User, Search, 
  ArrowUpRight, Calculator, CheckCircle2, AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { API_URLS } from '../api/config';
import { useSettings } from '../context/SettingsContext';

const GstReport = () => {
  const { settings } = useSettings();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSales();
  }, []);

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

  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const saleDate = new Date(s.createdAt).toISOString().split('T')[0];
      const matchesDate = saleDate >= fromDate && saleDate <= toDate;
      const matchesSearch = s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (s._id && s._id.toLowerCase().includes(searchQuery.toLowerCase()));
      // Only include GST bills in GST report
      const isGstBill = s.billType === 'GST';
      return matchesDate && matchesSearch && isGstBill;
    });
  }, [sales, fromDate, toDate, searchQuery]);

  const stats = useMemo(() => {
    const taxableValue = filteredSales.reduce((sum, s) => sum + (s.subt || 0), 0);
    const totalGst = filteredSales.reduce((sum, s) => sum + (s.gst || 0), 0);
    const totalAmount = filteredSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    return { taxableValue, totalGst, totalAmount };
  }, [filteredSales]);

  const exportToExcel = () => {
    const data = filteredSales.map(s => ({
      'Invoice Date': new Date(s.createdAt).toLocaleDateString(),
      'Invoice #': s._id.slice(-6).toUpperCase(),
      'Customer Name': s.customerName,
      'Customer GSTIN': s.customerGstin || 'Unregistered',
      'Taxable Value': s.subt?.toFixed(2) || '0.00',
      'CGST (9%)': (s.gst / 2).toFixed(2) || '0.00',
      'SGST (9%)': (s.gst / 2).toFixed(2) || '0.00',
      'Total GST': s.gst?.toFixed(2) || '0.00',
      'Total Invoice Value': s.totalAmount?.toFixed(2) || '0.00'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "GST Report");
    XLSX.writeFile(wb, `GST_Filing_Report_${fromDate}_to_${toDate}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(20);
    doc.text(settings.shopName || "GST Filing Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Period: ${fromDate} to ${toDate}`, 14, 22);
    doc.text(`Taxable Value: ₹${stats.taxableValue.toLocaleString()}`, 14, 28);
    doc.text(`Total Tax (GST): ₹${stats.totalGst.toLocaleString()}`, 14, 34);

    const tableData = filteredSales.map(s => [
      new Date(s.createdAt).toLocaleDateString(),
      s._id.slice(-6).toUpperCase(),
      s.customerName,
      (s.subt || 0).toFixed(2),
      (s.gst / 2).toFixed(2),
      (s.gst / 2).toFixed(2),
      (s.gst || 0).toFixed(2),
      (s.totalAmount || 0).toFixed(2)
    ]);

    doc.autoTable({
      head: [['Date', 'Inv #', 'Customer', 'Taxable', 'CGST', 'SGST', 'Total GST', 'Inv Total']],
      body: tableData,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8 }
    });

    doc.save(`GST_Report_${fromDate}.pdf`);
  };

  if (loading) return (
    <div className="d-flex align-items-center justify-content-center vh-100">
      <div className="spinner-grow text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="gst-report-container p-4 bg-light min-vh-100">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded-4 shadow-sm">
        <div>
          <h4 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            <Calculator className="text-primary" size={24} /> GST Filing Report
          </h4>
          <p className="text-muted small mb-0">Summary of tax collected for GSTR filing</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-2" onClick={exportToExcel}>
            <Download size={14} /> Export Excel
          </button>
          <button className="btn btn-primary btn-sm rounded-pill px-4" onClick={exportToPDF}>Print Report</button>
        </div>
      </div>

      {/* Tax Summary Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="text-muted small fw-bold mb-1">TOTAL TAXABLE VALUE</div>
            <div className="h3 fw-bold text-dark">₹{stats.taxableValue.toLocaleString()}</div>
            <div className="text-success small mt-2 d-flex align-items-center gap-1">
              <CheckCircle2 size={14} /> Ready for GSTR-1
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white border-start border-4 border-primary">
            <div className="text-muted small fw-bold mb-1">TOTAL GST (CGST + SGST)</div>
            <div className="h3 fw-bold text-primary">₹{stats.totalGst.toLocaleString()}</div>
            <div className="text-muted x-small mt-2">Calculated at {settings.taxRate || 18}% average</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="text-muted small fw-bold mb-1">TOTAL INVOICE VALUE</div>
            <div className="h3 fw-bold text-dark">₹{stats.totalAmount.toLocaleString()}</div>
            <div className="text-muted x-small mt-2">From {filteredSales.length} Tax Invoices</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 p-3 bg-white">
        <div className="row g-3 align-items-center">
          <div className="col-md-3">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-0"><Calendar size={14} /></span>
              <input type="date" className="form-control bg-light border-0" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>
          </div>
          <div className="col-md-3">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-0"><Calendar size={14} /></span>
              <input type="date" className="form-control bg-light border-0" value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
          </div>
          <div className="col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-0"><Search size={14} /></span>
              <input type="text" className="form-control bg-light border-0" placeholder="Search by customer..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
          </div>
          <div className="col-md-2">
            <button className="btn btn-light btn-sm w-100 rounded-pill border-0 d-flex align-items-center justify-content-center gap-2">
              <Filter size={14} /> More Filters
            </button>
          </div>
        </div>
      </div>

      {/* GST Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr className="text-muted x-small fw-bold text-uppercase">
                <th className="ps-4 py-3">Date</th>
                <th className="py-3">Inv #</th>
                <th className="py-3">Customer</th>
                <th className="py-3">Taxable Value</th>
                <th className="py-3">CGST</th>
                <th className="py-3">SGST</th>
                <th className="py-3 text-primary">Total GST</th>
                <th className="pe-4 py-3 text-end">Total Value</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((s) => (
                <tr key={s._id} className="small">
                  <td className="ps-4 py-3">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 fw-bold">#{s._id.slice(-6).toUpperCase()}</td>
                  <td className="py-3">
                    <div className="fw-bold">{s.customerName}</div>
                    <div className="text-muted x-small">{s.customerGstin || 'Unregistered'}</div>
                  </td>
                  <td className="py-3">₹{s.subt?.toLocaleString()}</td>
                  <td className="py-3 text-muted">₹{(s.gst / 2).toLocaleString()}</td>
                  <td className="py-3 text-muted">₹{(s.gst / 2).toLocaleString()}</td>
                  <td className="py-3 text-primary fw-bold">₹{s.gst?.toLocaleString()}</td>
                  <td className="pe-4 py-3 text-end fw-bold">₹{s.totalAmount?.toLocaleString()}</td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <div className="p-4">
                      <AlertCircle size={40} className="mb-2 opacity-25" />
                      <p>No GST transactions found for this period.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .gst-report-container { font-family: 'Inter', sans-serif; }
        .x-small { font-size: 0.7rem; }
      `}</style>
    </div>
  );
};

export default GstReport;
