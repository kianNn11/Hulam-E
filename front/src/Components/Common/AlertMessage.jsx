import React, { useEffect, useState, useCallback } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import './AlertMessage.css';

const AlertMessage = ({ type, message, onClose, autoClose = true, duration = 5000, restrictionDetails, className = '' }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Wait for fade-out animation
  }, [onClose]);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, handleClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="alert-icon" />;
      case 'warning':
        return <ExclamationTriangleIcon className="alert-icon" />;
      case 'error':
        return <ExclamationTriangleIcon className="alert-icon" />;
      default:
        return <InformationCircleIcon className="alert-icon" />;
    }
  };

  const formatMessage = (msg) => {
    if (typeof msg !== 'string') return msg;
    
    // Split by double newlines to create paragraphs
    const paragraphs = msg.split('\n\n');
    
    return paragraphs.map((paragraph, index) => (
      <p key={index} className="alert-paragraph">
        {paragraph.split('\n').map((line, lineIndex) => (
          <React.Fragment key={lineIndex}>
            {line}
            {lineIndex < paragraph.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
    ));
  };

  if (!isVisible) return null;

  return (
    <div className={`alert-message alert-${type} ${className} ${isVisible ? 'alert-visible' : 'alert-hidden'}`}>
      <div className="alert-content">
        <div className="alert-icon-container">
          {getIcon()}
        </div>
        <div className="alert-text-container">
          <div className="alert-message-text">
            {formatMessage(message)}
          </div>
          
          {/* Show restriction details if available */}
          {restrictionDetails && (
            <div className="alert-restriction-details">
              {restrictionDetails.blockedAction && (
                <div className="restriction-item">
                  <strong>Blocked Action:</strong> {restrictionDetails.blockedAction}
                </div>
              )}
              {restrictionDetails.contactInfo && (
                <div className="restriction-item">
                  <strong>Support:</strong> {restrictionDetails.contactInfo}
                </div>
              )}
            </div>
          )}
        </div>
        <button onClick={handleClose} className="alert-close-button">
          <XMarkIcon className="alert-close-icon" />
        </button>
      </div>
    </div>
  );
};

export default AlertMessage; 