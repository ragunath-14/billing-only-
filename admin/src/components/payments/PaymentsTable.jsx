import { Check, Trash2, Clock, DollarSign, ListFilter } from 'lucide-react';
import SuggestionInput from '../common/SuggestionInput';

const PaymentsTable = ({ list, q, onQ, tab, onTab, onPartial, onDelete, allNames = [] }) => (
  <div className="table-card shadow-sm mt-3 pt-2">
    <div className="custom-tabs px-3 pt-3 border-bottom d-flex align-items-center justify-content-between">
      <div className="d-flex gap-3">
        {['pending', 'partial', 'completed'].map(t => (
          <button key={t} className={`custom-tab border-0 py-2 px-1 pb-3 ${tab === t ? 'active fw-bold text-primary border-bottom border-primary' : 'text-muted opacity-75'}`} 
            style={{background:'none', borderBottom: tab === t ? '2px solid #0d6efd' : 'none'}}
            onClick={() => onTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>))}
      </div>
      <div className="small text-muted">{list.length} Records found</div>
    </div>
    <div className="p-3 border-bottom bg-light bg-opacity-10">
      <SuggestionInput value={q} onChange={onQ} onSelect={onQ} placeholder="Search by customer name or phone..." options={allNames.map(name => ({ label: name, data: name }))} className="px-1" />
    </div>
    <div className="table-responsive">{list.length === 0 ? <div className="py-5 text-center text-muted"><Clock size={32} className="mb-2 opacity-25" /><h6 className="fw-bold">No {tab} records found</h6></div>
        : <table className="table mb-0 align-middle">
          <thead className="table-light"><tr><th className="ps-4">Customer</th><th>Total Due</th><th>Paid</th><th>Balance</th><th className="text-center">Status</th><th className="text-end pe-4">Actions</th></tr></thead>
          <tbody>{list.map((s) => (
            <tr key={s._id}>
              <td className="ps-4 py-3">
                <div className="fw-bold">{s.customerName}</div>
                <div className="text-muted small">{s.customerPhone}</div>
              </td>
              <td className="fw-bold">₹{s.totalAmount.toLocaleString()}</td>
              <td className="text-success fw-bold">₹{s.paidAmount.toLocaleString()}</td>
              <td className="text-danger fw-bold">₹{(s.totalAmount - s.paidAmount).toLocaleString()}</td>
              <td className="text-center">
                <span className={`badge rounded-pill px-3 py-2 ${
                  s.status === 'Completed' ? 'bg-success bg-opacity-10 text-success' : 
                  s.status === 'Partial' ? 'bg-primary bg-opacity-10 text-primary' : 
                  'bg-warning bg-opacity-10 text-warning'
                }`}>
                  {s.status.toUpperCase()}
                </span>
              </td>
              <td className="text-end pe-4">
                <div className="d-flex gap-2 justify-content-end">
                  {s.status !== 'Completed' && (
                    <button 
                      className="btn btn-sm btn-primary rounded-pill px-3 d-flex align-items-center gap-1 shadow-sm" 
                      onClick={() => onPartial(s)}
                    >
                      <DollarSign size={14} /> Pay Partial
                    </button>
                  )}
                  <button className="btn btn-sm btn-outline-danger rounded-circle p-1" onClick={() => onDelete(s._id)}><Trash2 size={14} /></button>
                </div>
              </td>
            </tr>))}</tbody></table>
    }</div></div>
);

export default PaymentsTable;
