// src/components/YoYChart.tsx
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { ChartData } from "../hooks/useCompanyFacts";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface YoYChartProps {
  chartData: ChartData;
}

const YoYChart: React.FC<YoYChartProps> = ({ chartData }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text: "주요 항목 YoY 성장률 (%)",
        font: { size: 16 },
      },
      tooltip: {
        callbacks: {
          label: (context: any) =>
            `${context.dataset.label}: ${context.parsed.y.toFixed(2)} %`,
        },
      },
    },
    scales: { y: { ticks: { callback: (value: any) => `${value}%` } } },
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
      <Bar options={options} data={chartData} />
    </div>
  );
};

export default YoYChart;
