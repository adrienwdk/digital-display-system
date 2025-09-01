import React, { useCallback } from 'react';
import Avatar from '../ui/Avatar';

const CreatePostModal = ({ 
  isOpen, 
  onClose, 
  currentUser, 
  postForm, 
  onPostFormChange, 
  filePreviewUrls, 
  selectedFiles,
  onFileChange, 
  onRemoveFile, 
  onCreatePost,
  formatDepartmentName
}) => {
  // All hooks must be called before any conditional returns
  const formatFileSize = useCallback((bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }, []);

  const getFileIcon = useCallback((fileType) => {
    if (fileType.startsWith('image/')) {
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
          <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2" />
          <path d="M21 15l-5-5-5 5" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    } else if (fileType === 'application/pdf') {
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" />
          <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" />
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" />
        <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }, []);

  const handleTextareaChange = useCallback((e) => {
    onPostFormChange('content', e.target.value);
  }, [onPostFormChange]);

  const handleServiceChange = useCallback((e) => {
    onPostFormChange('service', e.target.value);
  }, [onPostFormChange]);

  const handlePinChange = useCallback((e) => {
    onPostFormChange('shouldPin', e.target.checked);
  }, [onPostFormChange]);

  const handlePinLocationChange = useCallback((location, checked) => {
    const locations = postForm.pinLocations;
    if (checked) {
      onPostFormChange('pinLocations', [...locations, location]);
    } else {
      onPostFormChange('pinLocations', locations.filter(loc => loc !== location));
    }
  }, [postForm.pinLocations, onPostFormChange]);

  // Now the conditional return comes after all hooks
  if (!isOpen) return null;

  const authorData = currentUser || {
    firstName: 'Visiteur',
    lastName: '',
    role: 'Invité'
  };

  const isUserAdmin = currentUser?.isAdmin;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Créer un post</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        
        <div className="modal-body">
          <div className="post-author-info">
            <Avatar user={authorData} size="medium" className="mr-3" />
            <div>
              <div className="author-name">{`${authorData.firstName} ${authorData.lastName}`}</div>
              <div className="author-role">{authorData.role}</div>
            </div>
          </div>
          
          {!isUserAdmin && (
            <div className="info-message">
              Note : Votre publication sera visible après validation par un administrateur.
            </div>
          )}

          <div className="form-group service-selector">
            <label htmlFor="postService">Service</label>
            <select
              id="postService"
              value={postForm.service}
              onChange={handleServiceChange}
              className="service-select"
            >
              {currentUser?.service && currentUser.service !== 'general' && (
                <option value={currentUser.service}>
                  {formatDepartmentName(currentUser.service)} (Mon service)
                </option>
              )}
              <option value="general">Général</option>
              <option value="rh">RH</option>
              <option value="commerce">Commerce</option>
              <option value="marketing">Marketing</option>
              <option value="informatique">Informatique</option>
              <option value="achat">Achat</option>
              <option value="comptabilité">Comptabilité</option>
              <option value="logistique">Logistique</option>
            </select>
          </div>

          {isUserAdmin && (
            <div className="pin-options">
              <label className="pin-checkbox">
                <input
                  type="checkbox"
                  checked={postForm.shouldPin}
                  onChange={handlePinChange}
                />
                <span>Épingler ce post</span>
              </label>
              
              {postForm.shouldPin && (
                <div className="pin-locations-select">
                  <label className="pin-location-label">
                    <input
                      type="checkbox"
                      checked={postForm.pinLocations.includes('general')}
                      onChange={(e) => handlePinLocationChange('general', e.target.checked)}
                    />
                    <span>Épingler dans Général</span>
                  </label>
                  <label className="pin-location-label">
                    <input
                      type="checkbox"
                      checked={postForm.pinLocations.includes('service')}
                      onChange={(e) => handlePinLocationChange('service', e.target.checked)}
                    />
                    <span>Épingler dans {formatDepartmentName(postForm.service)}</span>
                  </label>
                </div>
              )}
            </div>
          )}
          
          {/* TEXTAREA AVEC GESTION D'ÉTAT LOCALE */}
          <textarea
            placeholder="Que voulez-vous partager ?"
            value={postForm.content}
            onChange={handleTextareaChange}
            className="post-textarea"
          />
          
          {filePreviewUrls.length > 0 && (
            <div className="file-previews">
              <div className="preview-header">
                <span className="preview-count">
                  {filePreviewUrls.filter(f => f.type.startsWith('image/')).length} / 4 images
                  {filePreviewUrls.filter(f => !f.type.startsWith('image/')).length > 0 && 
                    ` • ${filePreviewUrls.filter(f => !f.type.startsWith('image/')).length} autres fichiers`
                  }
                </span>
              </div>
              {filePreviewUrls.map((file, index) => (
                <div className="file-preview" key={index}>
                  {file.type.startsWith('image/') ? (
                    <img src={file.url} alt={`Preview ${index}`} />
                  ) : (
                    <div className="file-icon">
                      {getFileIcon(file.type)}
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{formatFileSize(file.size)}</span>
                    </div>
                  )}
                  <button 
                    className="remove-file"
                    onClick={() => onRemoveFile(index)}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="file-upload-options">
            <div className="upload-option">
              <label className="file-upload-label">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  multiple
                  className="file-input"
                />
                <span className="file-button">
                  <span role="img" aria-label="Camera">📷</span> Images (max 4)
                </span>
              </label>
            </div>
            
            <div className="upload-option">
              <label className="file-upload-label">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={onFileChange}
                  multiple
                  className="file-input"
                />
                <span className="file-button">
                  <span role="img" aria-label="Document">📄</span> PDF
                </span>
              </label>
            </div>
          </div>
          
          <div className="modal-actions">
            <div className="file-limits-info">
              Max: 4 images, 10 fichiers total, 10MB/fichier, 50MB au total
            </div>
            <button
              className="publish-button"
              onClick={onCreatePost}
              disabled={!postForm.content.trim() && selectedFiles.length === 0}
            >
              Publier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CreatePostModal);