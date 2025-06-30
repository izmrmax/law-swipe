import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const AddMissingFile = ({ caseId, missingFileType, onFileAdded }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleFileChange = (e) => {
    setError('');
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file before uploading.');
      return;
    }
    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('type', missingFileType);

    try {
      const response = await fetch(`/api/cases/${caseId}/files`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Upload failed');
      }
      const result = await response.json();
      if (!isMountedRef.current) return;
      setSelectedFile(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      if (onFileAdded) {
        onFileAdded(result);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      if (err.name === 'AbortError') return;
      setError(err.message || 'An error occurred during upload.');
    } finally {
      if (isMountedRef.current) {
        setUploading(false);
      }
    }
  };

  return (
    <div className="add-missing-file">
      <label htmlFor="file-input">{`Upload ${missingFileType} file:`}</label>
      <input
        id="file-input"
        type="file"
        ref={inputRef}
        onChange={handleFileChange}
        disabled={uploading}
      />
      {selectedFile && (
        <div className="file-info">
          <span>{selectedFile.name}</span>
        </div>
      )}
      {error && <div className="error-message">{error}</div>}
      <button
        type="button"
        onClick={handleUpload}
        disabled={uploading || !selectedFile}
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
};

AddMissingFile.propTypes = {
  caseId: PropTypes.string.isRequired,
  missingFileType: PropTypes.string,
  onFileAdded: PropTypes.func,
};

AddMissingFile.defaultProps = {
  missingFileType: 'document',
  onFileAdded: null,
};

export default AddMissingFile;