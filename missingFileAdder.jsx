import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';

const MissingFileAdder = ({ missingFiles, onAdd }) => {
  const [selectedFiles, setSelectedFiles] = useState({});
  const inputRefs = useRef({});

  const handleFileChange = useCallback((event, id) => {
    const file = event.target.files[0] || null;
    setSelectedFiles(prev => ({
      ...prev,
      [id]: file
    }));
  }, []);

  const handleAdd = useCallback(
    id => {
      const file = selectedFiles[id];
      if (!file) return;
      onAdd(id, file);
      setSelectedFiles(prev => ({
        ...prev,
        [id]: null
      }));
      const input = inputRefs.current[id];
      if (input) {
        input.value = '';
      }
    },
    [selectedFiles, onAdd]
  );

  return (
    <div className="missing-file-adder">
      {missingFiles.map(({ id, label }) => (
        <div key={id} className="missing-file-adder__row">
          <label htmlFor={`file-input-${id}`} className="missing-file-adder__label">
            {label}
          </label>
          <input
            id={`file-input-${id}`}
            type="file"
            className="missing-file-adder__input"
            onChange={e => handleFileChange(e, id)}
            ref={el => {
              if (el) {
                inputRefs.current[id] = el;
              }
            }}
          />
          <button
            type="button"
            className="missing-file-adder__button"
            disabled={!selectedFiles[id]}
            onClick={() => handleAdd(id)}
          >
            Add
          </button>
        </div>
      ))}
    </div>
  );
};

MissingFileAdder.propTypes = {
  missingFiles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  onAdd: PropTypes.func.isRequired
};

export default MissingFileAdder;