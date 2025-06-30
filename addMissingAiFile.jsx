const AddMissingAiFile = ({ uploadUrl, onSuccess, onError }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = e => {
    setErrorMessage('');
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDrop = e => {
    e.preventDefault();
    setErrorMessage('');
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = e => {
    e.preventDefault();
  };

  const handleClickSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClickSelect();
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a file first.');
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setUploading(true);
      setProgress(0);
      const response = await axios.post(uploadUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: event => {
          if (event.total) {
            const percent = Math.round((event.loaded * 100) / event.total);
            setProgress(percent);
          }
        }
      });
      setUploading(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setProgress(0);
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      setUploading(false);
      setErrorMessage(err.response?.data?.message || 'Upload failed.');
      if (onError) {
        onError(err);
      }
    }
  };

  return (
    <div className="add-missing-ai-file">
      <div
        className="drop-zone"
        role="button"
        tabIndex="0"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClickSelect}
        onKeyDown={handleKeyDown}
        style={{
          padding: '20px',
          border: '2px dashed #ccc',
          borderRadius: '6px',
          textAlign: 'center',
          cursor: 'pointer'
        }}
      >
        {selectedFile ? (
          <p>Selected file: {selectedFile.name}</p>
        ) : (
          <p>Drag & drop AI file here, or click to select.</p>
        )}
        <input
          type="file"
          accept=".json,.csv,.txt"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
      {errorMessage && (
        <div className="error" style={{ color: 'red', marginTop: '8px' }}>
          {errorMessage}
        </div>
      )}
      {uploading && (
        <div className="progress" style={{ marginTop: '8px' }}>
          <div
            className="progress-bar"
            style={{
              width: `${progress}%`,
              height: '8px',
              backgroundColor: '#4caf50'
            }}
          />
          <p style={{ fontSize: '12px' }}>{progress}%</p>
        </div>
      )}
      <button
        type="button"
        onClick={handleUpload}
        disabled={uploading}
        style={{
          marginTop: '12px',
          padding: '10px 16px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: uploading ? 'not-allowed' : 'pointer'
        }}
      >
        {uploading ? 'Uploading...' : 'Upload AI File'}
      </button>
    </div>
  );
};

AddMissingAiFile.propTypes = {
  uploadUrl: PropTypes.string.isRequired,
  onSuccess: PropTypes.func,
  onError: PropTypes.func
};

AddMissingAiFile.defaultProps = {
  onSuccess: null,
  onError: null
};

export default AddMissingAiFile;