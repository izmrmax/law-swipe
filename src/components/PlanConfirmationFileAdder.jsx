import React, { useState, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

const PlanConfirmationFileAdder = ({ onFilesChange }) => {
  const [files, setFiles] = useState([])
  const [errors, setErrors] = useState([])
  const fileInputRef = useRef(null)

  const validateAndAdd = useCallback(
    incomingFiles => {
      const newFiles = []
      const newErrors = []

      Array.from(incomingFiles).forEach(file => {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          newErrors.push(`${file.name} has invalid file type.`)
        } else if (file.size > MAX_FILE_SIZE) {
          newErrors.push(`${file.name} exceeds maximum size of 5MB.`)
        } else if (files.find(f => f.name === file.name && f.size === file.size)) {
          newErrors.push(`${file.name} is already added.`)
        } else if (newFiles.find(f => f.name === file.name && f.size === file.size)) {
          newErrors.push(`${file.name} is duplicate in this selection.`)
        } else {
          newFiles.push(file)
        }
      })

      if (newFiles.length) {
        setFiles(prev => [...prev, ...newFiles])
      }
      setErrors(newErrors)
    },
    [files]
  )

  const handleFileSelect = e => {
    validateAndAdd(e.target.files)
    e.target.value = ''
  }

  const handleDrop = e => {
    e.preventDefault()
    validateAndAdd(e.dataTransfer.files)
  }

  const handleDragOver = e => {
    e.preventDefault()
  }

  const handleRemove = index => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  useEffect(() => {
    onFilesChange(files)
  }, [files, onFilesChange])

  return (
    <div className="plan-confirmation-file-adder">
      <div
        className="file-drop-zone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
      >
        <input
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(',')}
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <p>Drag & drop files here, or click to select (PDF, JPG, PNG; max 5MB each)</p>
      </div>

      {errors.length > 0 && (
        <ul className="file-errors">
          {errors.map((err, idx) => (
            <li key={idx}>{err}</li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <ul className="file-list">
          {files.map((file, idx) => {
            const key = `${file.name}-${file.size}-${idx}`
            return (
              <li key={key} className="file-item">
                <span className="file-name">{file.name}</span>
                <span className="file-size">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
                <button
                  type="button"
                  className="file-remove-btn"
                  onClick={() => handleRemove(idx)}
                >
                  Remove
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

PlanConfirmationFileAdder.propTypes = {
  onFilesChange: PropTypes.func.isRequired
}

export default PlanConfirmationFileAdder