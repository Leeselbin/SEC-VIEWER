import React from "react";
import { ProcessedRecord } from "../../../hooks/useCompanyAnalysis";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRecord: ProcessedRecord | null;
}

const ModalDetailData: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  selectedRecord,
}) => {
  if (!isOpen) {
    return null;
  }

  const modalOverlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  };

  const modalContentStyle: React.CSSProperties = {
    background: "white",
    padding: "25px 30px",
    borderRadius: "8px",
    position: "relative",
    width: "90%",
    maxWidth: "700px",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
  };

  const modalCloseButtonStyle: React.CSSProperties = {
    position: "absolute",
    top: "10px",
    right: "15px",
    background: "transparent",
    border: "none",
    fontSize: "2.5rem",
    cursor: "pointer",
    color: "#aaa",
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <button style={modalCloseButtonStyle} onClick={onClose}>
          &times;
        </button>
        {selectedRecord && (
          <div>
            <h3
              style={{
                marginTop: 0,
                borderBottom: "2px solid #eee",
                paddingBottom: "10px",
              }}
            >
              상세 정보 ({selectedRecord.재무항목})
            </h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {Object.entries(selectedRecord).map(([key, value]) => (
                <li
                  key={key}
                  style={{
                    padding: "5px 0",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <strong>{key}:</strong> {value?.toString() || "N/A"}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalDetailData;
