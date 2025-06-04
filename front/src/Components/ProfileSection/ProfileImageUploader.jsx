import React, { useState, useCallback } from 'react';
import { PencilSquareIcon } from "@heroicons/react/24/outline";

const ProfileImageUploader = ({ 
  currentImage, 
  onImageChange, 
  disabled = false, 
  size = 120,
  showOverlay = true 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = useCallback((file) => {
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onImageChange(reader.result);
    };
    reader.readAsDataURL(file);
  }, [onImageChange]);

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, handleFileSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const triggerFileInput = () => {
    if (!disabled) {
      document.getElementById('profileImageInput').click();
    }
  };

  const containerStyle = {
    width: size,
    height: size,
    position: 'relative',
    cursor: disabled ? 'default' : 'pointer',
    transition: 'all 0.3s ease',
    ...(isDragOver && !disabled ? { transform: 'scale(1.05)' } : {})
  };

  const imageStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    border: '4px solid white',
    objectFit: 'cover',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s ease'
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: '50%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    gap: 4
  };

  return (
    <div
      style={containerStyle}
      onClick={triggerFileInput}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`profile-image-uploader ${isDragOver ? 'drag-over' : ''}`}
      title={disabled ? '' : 'Click to change profile picture'}
    >
      {currentImage ? (
        <div style={{ position: 'relative' }}>
          <img
            src={currentImage}
            alt="Profile"
            style={imageStyle}
            onError={(e) => {
              console.error('Profile image failed to load:', currentImage);
              e.target.style.display = 'none';
            }}
          />
          {showOverlay && !disabled && (
            <div 
              style={overlayStyle}
              className="profile-image-overlay"
            >
              <PencilSquareIcon style={{ width: 24, height: 24, color: 'white' }} />
              <span style={{ 
                color: 'white', 
                fontSize: 12, 
                fontWeight: 600, 
                textAlign: 'center' 
              }}>
                Change Photo
              </span>
            </div>
          )}
        </div>
      ) : (
        <div style={{
          ...imageStyle,
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: isDragOver ? '4px solid #10b981' : '4px solid white'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            color: 'white'
          }}>
            <span style={{ fontSize: 24 }}>📸</span>
            <span style={{ fontSize: 10, fontWeight: 600, textAlign: 'center' }}>
              {isDragOver ? 'Drop here' : 'Add Photo'}
            </span>
          </div>
        </div>
      )}
      
      <input
        id="profileImageInput"
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        disabled={disabled}
        style={{ display: 'none' }}
      />
      
      <style jsx>{`
        .profile-image-uploader:hover .profile-image-overlay {
          opacity: 1;
        }
        
        .profile-image-uploader:hover img {
          filter: brightness(0.8);
        }
        
        .profile-image-uploader.drag-over {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default ProfileImageUploader; 