import { Trash2 } from 'lucide-react';

const RecentSalesTable = ({ sales, onDelete }) => (
  <div className="table-card"><div className="table-card-header"><h6 className="table-card-title">Recent Sales</h6></div>
    <div className="table-responsive"><table className="table mb-0"><thead><tr><th>#</th><th>Date</th><th>Customer</th><th>Items</th><th>Amount</th><th>Type</th><th>Action</th></tr></thead>
      <tbody>{sales.length === 0 ? <tr><td colSpan="7"><div className="empty-state">No sales</div></td></tr>
        : sales.map((s, idx) => (<tr key={s._id}>
            <td className="text-muted">#{idx + 1}</td>
            <td>{new Date(s.createdAt).toLocaleDateString()}</td>
            <td className="fw-bold">{s.customerName}</td>
            <td>{s.products.length} Items</td>
            <td className="fw-bold">₹{s.totalAmount?.toLocaleString()}</td>
            <td><span className="stock-chip chip-primary">{s.paymentMethod}</span></td>
            <td>
              <div className="d-flex align-items-center gap-2">
                <button 
                  onClick={() => { if(window.confirm('⚠️ Are you sure you want to delete this bill?\n\nThis action cannot be undone. All items\' stock levels will be automatically restored.')) onDelete(s._id); }} 
                  className="btn btn-icon btn-light text-danger border-0 shadow-sm"
                  title="Delete Sale & Restore Stock"
                  style={{ width: '32px', height: '32px', borderRadius: '8px' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>))}</tbody></table></div></div>
);

export default RecentSalesTable;
