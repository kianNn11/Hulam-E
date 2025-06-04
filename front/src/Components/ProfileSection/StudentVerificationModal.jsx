import React, { useState } from 'react';
import './StudentVerificationModal.css';

const StudentVerificationModal = ({ onClose, onUpload, loading }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = () => {
    if (file) {
      onUpload(file);
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
          disabled={loading}
        >
          &times;
        </button>

        <h2 className="modal-title">Student Verification</h2>
        <p className="modal-description">
          Please upload your <strong>Certificate of Registration (COR)</strong> to verify your student status.
        </p>
        <p className="modal-subdescription">
          This document will be reviewed by the admin to confirm your enrollment.
        </p>

        <div className="file-upload-box">
          <div className="file-input-container">
            <span className="file-name">
              {file ? file.name : "No file chosen"}
            </span>
            <label htmlFor="cor-upload" className="upload-button">
              Choose COR File
            </label>
          </div>
          <input
            id="cor-upload"
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileChange}
            disabled={loading}
            hidden
          />
          <p className="file-format-info">
            Accepted formats: Images (JPG, PNG), PDF, or Word documents
          </p>
        </div>

        <div className="modal-actions">
          <button 
            onClick={handleSubmit} 
            className="upload-btn"
            disabled={loading || !file}
          >
            {loading ? 'Uploading...' : 'Submit COR'}
          </button>
          <button 
            onClick={onClose} 
            className="cancel-btn"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentVerificationModal;