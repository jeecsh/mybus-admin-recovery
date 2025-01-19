import React, { useEffect, useCallback } from "react";
import styles from "./pop.module.css";

export default function Popup({ title, message, onClose, onConfirm }) {
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  return (
    <div className={styles.overlay} role="dialog" aria-labelledby="popup-title" aria-describedby="popup-message">
      <div className={styles.popup}>
        <div className={styles.header}>
          <h2 id="popup-title">{title}</h2>
          <button className={styles.closeButton} aria-label="Close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={styles.body} id="popup-message">
          <p>{message}</p>
        </div>
        <div className={styles.footer}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.confirmButton} onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
