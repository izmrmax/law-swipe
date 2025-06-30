import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'

export default function AddMissingAiFile({ onUpload }) {
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState('')

  const uploadControllerRef = useRef(null)
  const isMounted = useRef(true)

  useEffect(() => {
    return () => {
      isMounted.current = false
      if (uploadControllerRef.current) {
        uploadControllerRef.current.abort()
      }
    }
  }, [])

  const validateFile = (f) => {
    if (!f) return 'No file selected.'
    if (!f.name.toLowerCase().endsWith('.ai')) return 'Only .ai files are allowed.'
    if (f.size > 10 * 1024 * 1024) return 'File size must be under 10MB.'
    return ''
  }

  const handleFileChange = (e) => {
    setError('')
    setSuccess('')
    const f = e.target.files[0]
    const validationError = validateFile(f)
    if (validationError) {
      setFile(null)
      setError(validationError)
      return
    }
    setFile(f)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!file) {
      setError('Please select a .ai file to upload.')
      return
    }

    setUploading(true)
    const controller = new AbortController()
    uploadControllerRef.current = controller

    try {
      const formData = new FormData()
      formData.append('aiFile', file)

      const res = await fetch('/api/upload-ai', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      })

      const result = await res.json()
      if (!res.ok) {
        throw new Error(result.message || 'Upload failed.')
      }

      if (isMounted.current) {
        setSuccess('File uploaded successfully.')
        setFile(null)
        e.target.reset()
        if (onUpload) onUpload(result)
      }
    } catch (err) {
      if (err.name !== 'AbortError' && isMounted.current) {
        setError(err.message || 'An unexpected error occurred.')
      }
    } finally {
      if (isMounted.current) {
        setUploading(false)
      }
      uploadControllerRef.current = null
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto' }}>
      <fieldset disabled={uploading} style={{ border: 'none', padding: 0 }}>
        <label htmlFor="ai-file-input" style={{ display: 'block', marginBottom: 8 }}>
          Upload missing AI file:
        </label>
        <input
          id="ai-file-input"
          type="file"
          accept=".ai"
          onChange={handleFileChange}
          aria-describedby="ai-file-error"
          style={{ display: 'block', marginBottom: 12 }}
        />
        {error && (
          <div id="ai-file-error" style={{ color: 'red', marginBottom: 12 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ color: 'green', marginBottom: 12 }}>
            {success}
          </div>
        )}
        <button type="submit" disabled={uploading} style={{ padding: '8px 16px' }}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </fieldset>
    </form>
  )
}

AddMissingAiFile.propTypes = {
  onUpload: PropTypes.func
}