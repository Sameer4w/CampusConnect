function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isLoading,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="modal-overlay"
    >
      <div
        className="confirm-modal"
      >
        <div
          className="confirm-modal-header"
        >
          <h2>
            ⚠️ {title}
          </h2>
        </div>

        <div
          className="confirm-modal-body"
        >
          <p>
            {message}
          </p>

          <p>
            This action cannot
            be undone.
          </p>
        </div>

        <div
          className="confirm-modal-actions"
        >
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>

          <button
            type="button"
            className="btn-danger"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading
              ? "Deleting..."
              : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;