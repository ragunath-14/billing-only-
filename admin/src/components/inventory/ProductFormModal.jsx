import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ImagePlus, X } from 'lucide-react';

// Resizes/compresses an uploaded image client-side (max 900px on the long edge,
// JPEG q0.8) and returns it as a data URI — stored directly in Product.imageUrl.
// Avoids needing a cloud storage bucket, and sidesteps Render's ephemeral disk
// (a file saved to local disk there would vanish on the next deploy/restart).
function compressImageFile(file, maxDim = 900, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not read image'));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

const ProductFormModal = ({ show, editTarget, form, categories = [], onChange, onSave, onClose }) => {
  const navigate = useNavigate();
  const [uploading, setUploading] = React.useState(false);
  if (!show) return null;

  const handleImageFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Please choose an image file');
    setUploading(true);
    try {
      onChange({ ...form, imageUrl: await compressImageFile(file) });
    } catch (err) {
      alert('Failed to process image: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header border-light">
            <h6 className="modal-title fw-bold text-primary">{editTarget ? 'Edit Product' : 'Add New Product'}</h6>
            <button className="btn-close" onClick={onClose} />
          </div>
          <form onSubmit={onSave}>
            <div className="modal-body px-4 py-3">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label small fw-bold text-muted">Product Name *</label>
                  <input required className="form-control rounded-3" value={form.name} onChange={e => onChange({ ...form, name: e.target.value })} placeholder="e.g. 10cm Sparklers" />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold text-muted">Manufacturer *</label>
                  <input required className="form-control rounded-3" value={form.brand} onChange={e => onChange({ ...form, brand: e.target.value })} placeholder="e.g. Standard" />
                </div>
                <div className="col-6">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label small fw-bold text-muted mb-0">Category</label>
                    <button 
                      type="button" 
                      className="btn btn-link p-0 small text-decoration-none d-flex align-items-center gap-1"
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => navigate('/categories')}
                    >
                      <PlusCircle size={12} /> New
                    </button>
                  </div>
                  <select className="form-select rounded-3" value={form.category} onChange={e => onChange({ ...form, category: e.target.value })}>
                    <option value="Other">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold text-muted">Cost Price (₹) *</label>
                  <input required type="number" className="form-control rounded-3" value={form.buyingPrice} onChange={e => onChange({ ...form, buyingPrice: e.target.value })} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold text-muted">Selling Price (₹) *</label>
                  <input required type="number" className="form-control rounded-3" value={form.sellingPrice} onChange={e => onChange({ ...form, sellingPrice: e.target.value })} />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold text-muted">Product Image</label>
                  <div className="d-flex align-items-center gap-3">
                    {form.imageUrl ? (
                      <div className="position-relative">
                        <img src={form.imageUrl} alt="Product preview" className="rounded-3 border" style={{ width: 64, height: 64, objectFit: 'cover' }} />
                        <button
                          type="button"
                          className="btn btn-danger btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center"
                          style={{ width: 20, height: 20, position: 'absolute', top: -6, right: -6 }}
                          onClick={() => onChange({ ...form, imageUrl: '' })}
                          title="Remove image"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-3 border d-flex align-items-center justify-content-center text-muted" style={{ width: 64, height: 64 }}>
                        <ImagePlus size={22} />
                      </div>
                    )}
                    <div className="flex-grow-1">
                      <input type="file" accept="image/*" className="form-control form-control-sm rounded-3" onChange={handleImageFile} disabled={uploading} />
                      <div className="form-text extra-small">
                        {uploading ? 'Processing image...' : `Optional — shown on the shop page and here. Left blank, a ${form.category || 'category'}-relevant icon is used instead.`}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold text-muted">Stock Quantity *</label>
                  <input required type="number" className="form-control rounded-3" value={form.stock} onChange={e => onChange({ ...form, stock: e.target.value })} />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold text-muted">Barcode</label>
                  <input className="form-control rounded-3" value={form.barcode || ''} onChange={e => onChange({ ...form, barcode: e.target.value })} placeholder="Scan or type" />
                </div>
                {form.category === 'Gift Boxes' && (
                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted">Gift Box Contents</label>
                    <textarea
                      className="form-control rounded-3"
                      rows={4}
                      placeholder={'One item per line, e.g.\n10x Sparklers\n5x Flower Pots\n2x Rockets'}
                      value={Array.isArray(form.boxContents) ? form.boxContents.join('\n') : (form.boxContents || '')}
                      onChange={e => onChange({ ...form, boxContents: e.target.value })}
                    />
                    <div className="form-text extra-small">Shown to customers on the shop page when they click "Info" on this box.</div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer border-light">
              <button type="button" className="btn btn-light rounded-pill px-4" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold">{editTarget ? 'Update Product' : 'Save Product'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductFormModal;
