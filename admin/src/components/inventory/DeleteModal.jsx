import React from 'react';
import { Trash2 } from 'lucide-react';

const DeleteModal = ({ show, name, onConfirm, onClose }) => {
  if (!show) return null;
  return (<div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.45)' }}>
    <div className="modal-dialog modal-dialog-centered modal-sm"><div className="modal-content text-center p-2">
      <div className="modal-body">
        <div className="delete-icon-wrap"><Trash2 size={28} color="#dc2626" /></div>
        <h6 className="fw-bold mb-1">Delete Product?</h6>
        <p className="text-muted small">Are you sure you want to delete <strong>{name}</strong>?</p>
      </div>
      <div className="modal-footer justify-content-center border-0 pt-0">
        <button className="btn btn-light" onClick={onClose}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm}>Yes, Delete</button>
      </div></div></div></div>);
};

export default DeleteModal;
