import React, { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import PropTypes from 'prop-types';

const PlanConfirmationFileAdder = ({
  onFilesChange,
  multiple,
  maxFiles,
  acceptedFileTypes
}) => {
  const [files, setFiles] = useState([]);
  const previewsRef = useRef([]);

  const isAccepted = file => {
    return acceptedFileTypes.some(pattern => {
      if (pattern.endsWith('/*')) {
        const base = pattern.replace('/*', '/');
        return file.type.startsWith(base);
      }
      if (pattern.startsWith('.')) {
        return file.name.toLowerCase().endsWith(pattern.toLowerCase());
      }
      return file.type === pattern;
    });
  };

  const handleFileInput = e => {
    const selected = Array.from(e.target.files || []);
    const valid = selected.filter(isAccepted);
    const slots = multiple ? maxFiles - files.length : 1;
    const toAdd = valid.slice(0, slots).map(file => {
      const preview = URL.createObjectURL(file);
      previewsRef.current.push(preview);
      return {
        id: uuidv4(),
        file,
        preview
      };
    });
    const updated = multiple ? [...files, ...toAdd] : toAdd;
    if (maxFiles && updated.length > maxFiles) {
      updated.splice(maxFiles);
    }
    setFiles(updated);
    onFilesChange(updated.map(f => f.file));
    e.target.value = '';
  };

  const handleRemove = id => {
    const updated = files.filter(item => {
      if (item.id === id) {
        URL.revokeObjectURL(item.preview);
        previewsRef.current = previewsRef.current.filter(p => p !== item.preview);
        return false;
      }
      return true;
    });
    setFiles(updated);
    onFilesChange(updated.map(f => f.file));
  };

  useEffect(() => {
    return () => {
      previewsRef.current.forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  const isFull = maxFiles && files.length >= maxFiles;

  return (
    <div className="plan-confirmation-file-adder">
      <label className="file-adder-label">
        {isFull ? `Maximum of ${maxFiles} files reached` : 'Add File'}
        <input
          type="file"
          multiple={multiple}
          accept={acceptedFileTypes.join(',')}
          onChange={handleFileInput}
          className="file-input"
          disabled={isFull}
        />
      </label>
      {files.length > 0 && (
        <ul className="file-list">
          {files.map(({ id, file, preview }) => (
            <li key={id} className="file-item">
              {file.type.startsWith('image/') ? (
                <img src={preview} alt={file.name} className="file-preview" />
              ) : (
                <span className="file-icon">?</span>
              )}
              <span className="file-name">{file.name}</span>
              <button
                type="button"
                className="remove-button"
                onClick={() => handleRemove(id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

PlanConfirmationFileAdder.propTypes = {
  onFilesChange: PropTypes.func.isRequired,
  multiple: PropTypes.bool,
  maxFiles: PropTypes.number,
  acceptedFileTypes: PropTypes.arrayOf(PropTypes.string)
};

PlanConfirmationFileAdder.defaultProps = {
  multiple: true,
  maxFiles: 5,
  acceptedFileTypes: ['.pdf', 'image/*']
};

export default PlanConfirmationFileAdder;