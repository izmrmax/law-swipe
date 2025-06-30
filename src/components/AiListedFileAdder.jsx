import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const AIListedFileAdder = ({ maxFiles, allowedTypes, onChange }) => {
  const [files, setFiles] = useState([])
  const fileInputRef = useRef(null)

  const openFileDialog = () => {
    if (files.length < maxFiles) {
      fileInputRef.current.click()
    }
  }

  const handleFileSelection = (e) => {
    const selectedFiles = Array.from(e.target.files).filter((file) =>
      allowedTypes.includes('*/*') || allowedTypes.includes(file.type)
    )
    const combined = [...files, ...selectedFiles]
      .filter((file, index, self) =>
        index === self.findIndex((f) => f.name === file.name && f.size === file.size)
      )
      .slice(0, maxFiles)
    setFiles(combined)
    e.target.value = null
  }

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  useEffect(() => {
    onChange(files)
  }, [files, onChange])

  const acceptAttr = allowedTypes.includes('*/*') ? undefined : allowedTypes.join(',')

  return (
    <div className="ai-file-adder">
      <input
        type="file"
        ref={fileInputRef}
        multiple
        {...(acceptAttr ? { accept: acceptAttr } : {})}
        className="ai-file-input"
        onChange={handleFileSelection}
      />
      <button
        type="button"
        className="ai-file-add-button"
        onClick={openFileDialog}
        disabled={files.length >= maxFiles}
      >
        Add Files
      </button>
      <ul className="ai-file-list">
        {files.map((file, idx) => (
          <li key={`${file.name}-${file.size}`} className="ai-file-item">
            <span className="ai-file-name">{file.name}</span>
            <button
              type="button"
              className="ai-file-remove-button"
              onClick={() => removeFile(idx)}
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

AIListedFileAdder.propTypes = {
  maxFiles: PropTypes.number,
  allowedTypes: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
}

AIListedFileAdder.defaultProps = {
  maxFiles: 5,
  allowedTypes: ['*/*'],
  onChange: () => {},
}

export default AIListedFileAdder