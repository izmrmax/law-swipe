import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

const AddMissingFile = ({ documentType, existingFileName, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = e => {
    setError('')
    const file = e.target.files[0]
    if (!file) return
    const maxSize = 10 * 1024 * 1024
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      setError('Only PDF, JPG or PNG files are allowed.')
      return
    }
    if (file.size > maxSize) {
      setError('File must be 10MB or smaller.')
      return
    }
    setSelectedFile(file)
  }

  const handleUploadClick = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload.')
      return
    }
    setError('')
    setUploading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('documentType', documentType)
    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        const errText = await response.text()
        throw new Error(errText || 'Upload failed')
      }
      const data = await response.json()
      if (onUpload) onUpload(data)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = null
      }
    } catch (e) {
      setError(e.message || 'An error occurred during upload.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="add-missing-file">
      <label className="file-label">
        Required Document: {documentType}
      </label>
      {existingFileName && (
        <div className="existing-file">
          Existing File:{' '}
          <a
            href={`/api/files/${existingFileName}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {existingFileName}
          </a>
        </div>
      )}
      <input
        id={`file-input-${documentType}`}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      <div className="file-actions">
        <button
          type="button"
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          disabled={uploading}
          aria-label={selectedFile ? `Change ${documentType} file` : `Select ${documentType} file`}
        >
          {selectedFile ? 'Change File' : 'Select File'}
        </button>
        {selectedFile && (
          <span className="file-name">{selectedFile.name}</span>
        )}
        <button
          type="button"
          onClick={handleUploadClick}
          disabled={uploading || !selectedFile}
          aria-label={`Upload selected ${documentType} file`}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
      {error && <div className="file-error">{error}</div>}
    </div>
  )
}

AddMissingFile.propTypes = {
  documentType: PropTypes.string.isRequired,
  existingFileName: PropTypes.string,
  onUpload: PropTypes.func,
}

export default AddMissingFile