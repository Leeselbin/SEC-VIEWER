import React, { useState, ReactNode } from "react";

interface AccordionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  // --- 인라인 스타일 정의 (애니메이션 개선) ---
  const accordionStyle: React.CSSProperties = {
    marginBottom: "10px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "#fff",
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: "#f8f9fa",
    padding: "15px 20px",
    width: "100%",
    textAlign: "left",
    border: "none",
    outline: "none",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: isOpen ? "1px solid #ddd" : "none",
  };

  // [수정] Grid를 이용한 애니메이션 스타일
  const contentWrapperStyle: React.CSSProperties = {
    display: "grid",
    // grid-template-rows를 0fr <-> 1fr로 변경하여 애니메이션 적용
    gridTemplateRows: isOpen ? "1fr" : "0fr",
    transition: "grid-template-rows 0.3s ease-out", // ease-out으로 더 부드러운 느낌
  };

  const contentInnerStyle: React.CSSProperties = {
    overflow: "hidden", // 자식 요소가 넘치지 않도록 설정
  };

  const contentStyle: React.CSSProperties = {
    padding: "20px",
  };

  const arrowStyle: React.CSSProperties = {
    transition: "transform 0.3s ease",
    transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
    fontSize: "16px",
    marginRight: "10px",
    color: "#555",
  };

  return (
    <div style={accordionStyle}>
      <button onClick={toggleAccordion} style={headerStyle}>
        <span>{title}</span>
        <span style={arrowStyle}>▶</span>
      </button>
      <div style={contentWrapperStyle}>
        <div style={contentInnerStyle}>
          <div style={contentStyle}>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Accordion;
