import React, { useState } from 'react';
import './StudentVerificationModal.css';

const StudentVerificationModal = ({ onClose, onUpload }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = () => {
    if (file) {
      onUpload(file);
      onClose();
    } else {
      alert("Please select a file.");
    }
  };

  return (
    <div className="verification-modal-overlay">
      <div className="verification-modal">
        <button
          className="modal-close-button"
          aria-label="Close"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="modal-title">Student Verification</h2>
        <p className="modal-description">Please upload your Certificate of Registration (COR).</p>

        <div className="file-upload-box">
          <span className="file-name">
            {file ? file.name : "No file chosen"}
          </span>
          <label htmlFor="cor-upload" className="upload-button">Choose File</label>
          <input
            id="cor-upload"
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            hidden
          />
        </div>

        <div className="modal-actions">
          <button onClick={handleSubmit} className="upload-btn">Upload</button>
          <button onClick={onClose} className="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default StudentVerificationModal;