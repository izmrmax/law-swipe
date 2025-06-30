function AddMissingAiFile({ uploadUrl, onSuccess, onError }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = e => {
    setError('');
    const selected = e.target.files[0];
    if (selected && selected.name.toLowerCase().endsWith('.ai')) {
      setFile(selected);
    } else {
      setFile(null);
      setError('Please select a valid .ai file');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!file) {
      setError('No file selected');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      const data = await res.json();
      setFile(null);
      onSuccess(data);
    } catch (err) {
      const message = err.message || 'Upload error';
      setError(message);
      onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="add-missing-ai-file" onSubmit={handleSubmit}>
      <label htmlFor="ai-file-input" className="file-label">
        {file ? file.name : 'Select a .ai file'}
      </label>
      <input
        id="ai-file-input"
        type="file"
        accept=".ai"
        onChange={handleFileChange}
        className="file-input"
        disabled={loading}
      />
      {error && <div className="error-message">{error}</div>}
      <button type="submit" disabled={loading} className="upload-button">
        {loading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  );
}

AddMissingAiFile.propTypes = {
  uploadUrl: PropTypes.string.isRequired,
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
};

AddMissingAiFile.defaultProps = {
  onSuccess: () => {},
  onError: () => {},
};

export default AddMissingAiFile;