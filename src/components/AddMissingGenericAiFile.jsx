import React, { useState, useRef } from 'react';
import axios from 'axios';

function AddMissingAiFile() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRef = useRef(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['application/json', 'text/plain'];

  const handleFileChange = (e) => {
    setError('');
    setSuccess('');
    const selected = e.target.files[0];
    if (selected) {
      if (!ALLOWED_TYPES.includes(selected.type)) {
        setError('Invalid file type. Only JSON and TXT files are allowed.');
        setFile(null);
        if (inputRef.current) inputRef.current.value = '';
        return;
      }
      if (selected.size > MAX_FILE_SIZE) {
        setError('File is too large. Maximum size is 5MB.');
        setFile(null);
        if (inputRef.current) inputRef.current.value = '';
        return;
      }
      setFile(selected);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('aiFile', file);

    try {
      setUploading(true);
      const response = await axios.post('/api/ai/files', formData);
      if (response.status === 200) {
        setSuccess('File uploaded successfully.');
        setFile(null);
        if (inputRef.current) inputRef.current.value = '';
      } else {
        setError('Upload failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="add-missing-ai-file">
      <h2>Add Missing AI File</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".json,.txt"
          onChange={handleFileChange}
          disabled={uploading}
          ref={inputRef}
        />
        <button type="submit" disabled={uploading || !file}>
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
}

export default AddMissingAiFile;