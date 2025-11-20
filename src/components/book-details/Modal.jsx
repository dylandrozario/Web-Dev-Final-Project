import React from 'react';

export default function Modal({ open, onClose, children }) {
    if (!open) return null; // modal is hidden unless open = true

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <button onClick={onClose} style={styles.close}>X</button>
                {children}
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    modal: {
        background: "white",
        padding: "20px",
        borderRadius: "8px",
        minWidth: "300px",
        maxWidth: "90vw",
    },
    close: {
        float: "right",
        border: "none",
        background: "none",
        fontSize: "18px",
        cursor: "pointer",
    }
};

