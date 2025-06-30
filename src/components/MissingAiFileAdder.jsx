import React, { useState, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'

const MissingAiFileAdder = ({
  onFileAdded,
  acceptedFormats = ['json', 'csv', 'txt'],
  maxFileSize = 5 * 1024 * 1024
}) => {
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const validateFile = useCallback(
    f => {
      if (f.size > maxFileSize) {
        return `File size must be less than ${(maxFileSize / 1024 / 1024).toFixed(1)} MB`
      }
      const ext = f.name.split('.').pop().toLowerCase()
      if (!acceptedFormats.includes(ext)) {
        return `Unsupported file type .${ext}. Allowed: ${acceptedFormats
          .map(e => `.${e}`)
          .join(', ')}`
      }
      return ''
    },
    [acceptedFormats, maxFileSize]
  )

  const handleFile = useCallback(
    f => {
      const validationError = validateFile(f)
      if (validationError) {
        setError(validationError)
        setFile(null)
        return
      }
      setError('')
      setFile(f)
      onFileAdded(f)
    },
    [onFileAdded, validateFile]
  )

  const onInputChange = e => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const onDragOver = e => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }

  const onDragLeave = e => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }

  const onDrop = e => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const triggerFileSelect = () => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }

  const onKeyDown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      triggerFileSelect()
    }
  }

  return (
    <div className="missing-ai-file-adder">
      <div
        className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={triggerFileSelect}
        onKeyDown={onKeyDown}
        role="button"
        tabIndex="0"
        style={{
          border: '2px dashed #ccc',
          borderRadius: '4px',
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer'
        }}
      >
        {file ? (
          <div>
            <strong>Selected File:</strong> {file.name} (
            {(file.size / 1024).toFixed(2)} KB)
          </div>
        ) : (
          <div>
            Drag & drop your AI file here, or click to select.
            <div style={{ marginTop: '8px', color: '#666', fontSize: '0.9em' }}>
              Accepted: {acceptedFormats.map(ext => `.${ext}`).join(', ')} | Max:{' '}
              {(maxFileSize / 1024 / 1024).toFixed(1)} MB
            </div>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={acceptedFormats.map(ext => `.${ext}`).join(',')}
        style={{ display: 'none' }}
        onChange={onInputChange}
      />
      {error && (
        <div style={{ color: 'red', marginTop: '8px', fontSize: '0.9em' }}>
          {error}
        </div>
      )}
    </div>
  )
}

MissingAiFileAdder.propTypes = {
  onFileAdded: PropTypes.func.isRequired,
  acceptedFormats: PropTypes.arrayOf(PropTypes.string),
  maxFileSize: PropTypes.number
}

export default MissingAiFileAdder