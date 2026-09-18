import React from 'react';
import { Save, FileText, Receipt } from 'lucide-react';

const PrintSettings = ({ data, onChange, onSave, loading }) => {
  const paperSize = data.printPaperSize || 'thermal';

  return (
    <form onSubmit={onSave}>
      <h6 className="fw-bold mb-1">Print & Receipt</h6>
      <p className="text-muted small mb-4">
        Choose how the bill is printed at the billing counter. The shop name, address and GSTIN
        shown on the printed bill come from Shop Details.
      </p>

      <label className="form-label fw-bold">Bill Paper Size</label>
      <div className="row g-3">
        <div className="col-md-6">
          <label
            className={`d-flex align-items-start gap-3 p-3 border rounded-3 w-100 ${paperSize === 'thermal' ? 'border-primary bg-light' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            <input
              type="radio" name="printPaperSize" className="form-check-input mt-1"
              checked={paperSize === 'thermal'}
              onChange={() => onChange({ ...data, printPaperSize: 'thermal' })}
            />
            <Receipt size={20} className="text-primary mt-1" />
            <div>
              <div className="fw-bold small">Receipt (Thermal)</div>
              <div className="text-muted extra-small">Narrow strip, ideal for thermal/POS printers</div>
            </div>
          </label>
        </div>
        <div className="col-md-6">
          <label
            className={`d-flex align-items-start gap-3 p-3 border rounded-3 w-100 ${paperSize === 'a4' ? 'border-primary bg-light' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            <input
              type="radio" name="printPaperSize" className="form-check-input mt-1"
              checked={paperSize === 'a4'}
              onChange={() => onChange({ ...data, printPaperSize: 'a4' })}
            />
            <FileText size={20} className="text-primary mt-1" />
            <div>
              <div className="fw-bold small">A4 Sheet</div>
              <div className="text-muted extra-small">Full page invoice, ideal for regular printers</div>
            </div>
          </label>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-5">
        <button type="submit" className="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm" disabled={loading}>
          {loading ? <div className="spinner-border spinner-border-sm" /> : <Save size={16} />}
          <span>Save Configuration</span>
        </button>
      </div>
    </form>
  );
};

export default PrintSettings;
