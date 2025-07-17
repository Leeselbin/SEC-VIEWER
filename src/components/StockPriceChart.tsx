import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { StockChartData } from "../hooks/useStockPrice";

// Chart.js에 필요한 모든 모듈 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface StockPriceChartProps {
  chartData: StockChartData;
  companyName: string;
}

const StockPriceChart: React.FC<StockPriceChartProps> = ({
  chartData,
  companyName,
}) => {
  const [timeUnit, setTimeUnit] = useState<"day" | "week" | "month">("day");

  const dataMap = {
    day: chartData.daily,
    week: chartData.weekly,
    month: chartData.monthly,
  };

  const data = {
    datasets: [
      {
        label: `${companyName} 종가`,
        data: dataMap[timeUnit],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: 0.1,
        pointRadius: 1,
        borderWidth: 2,
      },
    ],
  };

  // [핵심 수정] 차트 옵션에 interaction 설정 추가
  const options = {
    responsive: true,
    maintainAspectRatio: false, // 컨테이너 크기에 맞게 비율 조정
    interaction: {
      mode: "index" as const, // X축 인덱스를 기준으로 상호작용
      intersect: false, // 마우스가 직접 닿지 않아도 가장 가까운 항목을 찾음
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `${companyName} 주가 추이`,
        font: { size: 16 },
      },
      tooltip: {
        callbacks: {
          // 툴팁 제목을 한국 날짜 형식으로 예쁘게 표시
          title: function (tooltipItems: any) {
            if (tooltipItems[0]) {
              const date = new Date(tooltipItems[0].parsed.x);
              return date.toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });
            }
            return "";
          },
        },
      },
    },
    scales: {
      x: {
        type: "time" as const,
        time: {
          unit: timeUnit,
          tooltipFormat: "yyyy. MM. dd", // 툴팁에 표시될 날짜 형식
        },
        title: {
          display: true,
          text: "날짜",
        },
      },
      y: {
        title: {
          display: true,
          text: "가격 (USD)",
        },
      },
    },
  };

  // --- 스타일 정의 ---
  const buttonGroupStyle: React.CSSProperties = {
    textAlign: "right",
    marginBottom: "10px",
  };
  const toggleButtonStyle: React.CSSProperties = {
    padding: "6px 12px",
    fontSize: "14px",
    border: "1px solid #ddd",
    backgroundColor: "white",
    cursor: "pointer",
  };
  const activeToggleButtonStyle: React.CSSProperties = {
    ...toggleButtonStyle,
    backgroundColor: "#3498db",
    color: "white",
    borderColor: "#3498db",
  };

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        marginBottom: "20px",
      }}
    >
      <div style={buttonGroupStyle}>
        <button
          onClick={() => setTimeUnit("day")}
          style={
            timeUnit === "day" ? activeToggleButtonStyle : toggleButtonStyle
          }
        >
          일
        </button>
        <button
          onClick={() => setTimeUnit("week")}
          style={
            timeUnit === "week" ? activeToggleButtonStyle : toggleButtonStyle
          }
        >
          주
        </button>
        <button
          onClick={() => setTimeUnit("month")}
          style={
            timeUnit === "month" ? activeToggleButtonStyle : toggleButtonStyle
          }
        >
          월
        </button>
      </div>
      {/* 차트의 높이를 지정하기 위해 div로 한번 감싸줍니다. */}
      <div style={{ position: "relative", height: "400px" }}>
        <Line options={options} data={data} />
      </div>
    </div>
  );
};

export default StockPriceChart;
