const allowedMimeTypes = [
  'application/pdf',
  'text/plain',
  'application/json',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

const MAX_FILE_SIZE = 5 * 1024 * 1024

function AddMissingAiFile({ onAdd, onCancel }) {
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const resetInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleFileChange(e) {
    const selected = e.target.files && e.target.files[0]
    if (!selected) {
      setFile(null)
      setError('')
      return
    }
    if (!allowedMimeTypes.includes(selected.type)) {
      setFile(null)
      setError('Unsupported file type. Please upload PDF, TXT, JSON, CSV, DOC or DOCX.')
      resetInput()
      return
    }
    if (selected.size > MAX_FILE_SIZE) {
      setFile(null)
      setError('File size exceeds 5MB limit.')
      resetInput()
      return
    }
    setFile(selected)
    setError('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!file) {
      setError('Please select a valid file before submitting.')
      return
    }
    onAdd(file)
  }

  return (
    <form className="add-ai-file-form" onSubmit={handleSubmit}>
      <label htmlFor="ai-file-input">Upload AI File:</label>
      <input
        id="ai-file-input"
        type="file"
        accept=".pdf,.txt,.json,.csv,.doc,.docx"
        onChange={handleFileChange}
        ref={fileInputRef}
      />
      {file && <p className="file-info">Selected file: {file.name}</p>}
      {error && (
        <p className="error-message" role="alert" aria-live="assertive">
          {error}
        </p>
      )}
      <div className="form-actions">
        <button type="submit" disabled={!file}>
          Add File
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

AddMissingAiFile.propTypes = {
  onAdd: PropTypes.func.isRequired,
  onCancel: PropTypes.func
}

AddMissingAiFile.defaultProps = {
  onCancel: null
}

export default AddMissingAiFile