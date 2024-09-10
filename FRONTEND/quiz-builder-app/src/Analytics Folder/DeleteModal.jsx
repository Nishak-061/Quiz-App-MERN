import React from "react";
import "./deletemodal.css";

const DeleteModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div>
      <div className="delete-modal-overlay">
        <div className="delete-modal">
          <h2 className="delete-modal-heading">
            Are you confirm you <br /> want to delete?
          </h2>
          <div className="delete-modal-buttons">
            <button onClick={onConfirm} className="delete-modal-confirm">
              Confirm Delete
            </button>
            <button onClick={onCancel} className="delete-modal-cancel">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
