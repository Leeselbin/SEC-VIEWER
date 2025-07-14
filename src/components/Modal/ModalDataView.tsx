import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalDataView: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) {
    return null;
  }

  // --- [수정] 인라인 스타일 객체 정의 ---
  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const modalContentStyle: React.CSSProperties = {
    background: 'white',
    padding: '25px 30px',
    borderRadius: '8px',
    position: 'relative',
    width: '90%',
    maxWidth: '700px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
  };

  const modalCloseButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '10px',
    right: '15px',
    background: 'transparent',
    border: 'none',
    fontSize: '2.5rem',
    cursor: 'pointer',
    color: '#aaa',
  };


  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <button style={modalCloseButtonStyle} onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default ModalDataView;