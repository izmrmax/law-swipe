import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

function ConfirmMissingAiFile({ fileName, onConfirm, onCancel }) {
  const modalRef = useRef(null)

  useEffect(() => {
    const modalNode = modalRef.current
    if (!modalNode) return

    const focusableElements = modalNode.querySelectorAll('button')
    const firstEl = focusableElements[0]
    const lastEl = focusableElements[focusableElements.length - 1]

    if (firstEl) {
      firstEl.focus()
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCancel()
      } else if (event.key === 'Tab') {
        if (focusableElements.length === 0) return
        if (event.shiftKey) {
          // shift + tab
          if (document.activeElement === firstEl) {
            event.preventDefault()
            lastEl.focus()
          }
        } else {
          // tab
          if (document.activeElement === lastEl) {
            event.preventDefault()
            firstEl.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onCancel])

  return (
    <div className="confirm-missing-ai-file__overlay">
      <div
        className="confirm-missing-ai-file__modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-missing-ai-file__title"
        ref={modalRef}
      >
        <h2 id="confirm-missing-ai-file__title">Missing AI File</h2>
        <p>
          The AI-generated file <strong>{fileName}</strong> is missing. Would you like to
          generate it now?
        </p>
        <div className="confirm-missing-ai-file__actions">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={onConfirm}
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  )
}

ConfirmMissingAiFile.propTypes = {
  fileName: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
}

export default ConfirmMissingAiFile