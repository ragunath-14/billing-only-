import { Search, UserCircle, Plus, Edit2, Trash2, History } from 'lucide-react';
import SuggestionInput from '../common/SuggestionInput';

const CustomerTable = ({ list, q, onQ, onAdd, onEdit, onDelete, onHistory, allCustomers = [] }) => (
  <div className="table-card h-100 shadow-sm"><div className="p-3 border-bottom">
    <SuggestionInput value={q} onChange={onQ} onSelect={onQ} className="px-1"
      placeholder="Find customer by name or mobile..." options={allCustomers.map(c => ({ label: c.name, subText: c.mobile, data: c.name }))} />
  </div>
    <div className="table-responsive">{list.length === 0 ? <div className="py-5 text-center px-4"><UserCircle size={56} className="text-muted mb-3 opacity-25" />
        <h6 className="fw-bold">No Customers Found</h6><p className="text-muted extra-small">Add your regular cracker buyers here</p><button className="btn btn-sm btn-outline-primary mt-2 rounded-pill px-3" onClick={onAdd}><Plus size={14} className="me-1" /> Register Now</button></div>
        : <table className="table mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th className="ps-3 text-muted extra-small fw-bold" style={{ width: '35%' }}>CUSTOMER NAME</th>
              <th className="text-muted extra-small fw-bold" style={{ width: '25%' }}>MOBILE NUMBER</th>
              <th className="text-end pe-3 text-muted extra-small fw-bold">ACTIONS / HISTORY</th>
            </tr>
          </thead>
          <tbody>{list.map((c, i) => <tr key={i}><td className="ps-3 fw-bold">{c.name}</td><td>{c.mobile}</td>
            <td className="text-end pe-3">
              <div className="d-flex gap-2 justify-content-end">
                <button className="btn btn-primary py-2 px-3 rounded-pill d-flex align-items-center gap-2 shadow-sm fw-bold" onClick={() => onHistory(c)} style={{ fontSize: '0.85rem' }}><History size={16} /> <span className="d-none d-sm-inline">Check History</span><span className="d-inline d-sm-none">History</span></button>
                <div className="vr opacity-25 mx-1"></div>
                <button className="btn btn-outline-secondary p-2 rounded-circle border-2" onClick={() => onEdit(c)}><Edit2 size={16} /></button>
                <button className="btn btn-outline-danger p-2 rounded-circle border-2" onClick={() => onDelete(c._id)}><Trash2 size={16} /></button>
              </div>
            </td></tr>)}</tbody></table>
    }</div></div>
);

export default CustomerTable;
