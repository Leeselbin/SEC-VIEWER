import { useQuery } from "@tanstack/react-query";

// --- 타입 정의 ---
export interface ProcessedRecord {
  회사명: string;
  CIK번호: string;
  재무항목: string;
  항목설명: string;
  단위: string;
  값: number;
  시작일: string | undefined;
  종료일: string;
  회계연도: number;
  회계분기: string;
  공시서류: string;
  제출일: string;
}

export interface InvestmentMetric {
  year: number;
  roe?: number;
  roa?: number;
  debtToEquity?: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}

// 5단계 분석 결과를 위한 타입
export interface AnalysisStep {
  label: string;
  value: number | undefined;
  score: number;
  description: string;
}
export interface AnalysisResult {
  totalScore: number;
  evaluation: string;
  evaluationColor: string;
  steps: AnalysisStep[];
}

// API 응답 데이터 타입
interface SECUnitData {
  fy: number;
  val: number;
  form: string;
  filed: string;
  fp: string;
  start?: string;
  end: string;
}
interface SECFact {
  description: string;
  units: { [key: string]: SECUnitData[] };
}
interface SECData {
  facts: { "us-gaap": { [key: string]: SECFact } };
}

// --- 헬퍼 함수: 점수 계산 로직 ---
const getGrowthScore = (value?: number): number => {
  if (value === undefined) return 1;
  if (value > 20) return 5;
  if (value > 10) return 4;
  if (value > 5) return 3;
  if (value > 0) return 2;
  return 1;
};
const getRoeScore = (value?: number): number => {
  if (value === undefined) return 1;
  if (value > 20) return 5;
  if (value > 15) return 4;
  if (value > 10) return 3;
  if (value > 5) return 2;
  return 1;
};
const getDebtRatioScore = (value?: number): number => {
  if (value === undefined) return 1;
  if (value < 50) return 5;
  if (value < 100) return 4;
  if (value < 150) return 3;
  if (value < 200) return 2;
  return 1;
};
const getTotalScoreEvaluation = (
  score: number
): { evaluation: string; color: string } => {
  if (score >= 21) return { evaluation: "매우 긍정적", color: "#2ecc71" };
  if (score >= 16) return { evaluation: "긍정적", color: "#3498db" };
  if (score >= 11) return { evaluation: "보통", color: "#f1c40f" };
  if (score >= 6) return { evaluation: "주의 필요", color: "#e67e22" };
  return { evaluation: "부정적", color: "#e74c3c" };
};

// --- API 호출 및 데이터 처리 로직 ---
const fetchAndProcessFacts = async (
  cik: string,
  companyName: string,
  years: number
) => {
  const url = `/api/xbrl/companyfacts/CIK${cik}.json`;
  const headers = { "User-Agent": "MyWebApp my.email@example.com" };

  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`HTTP 오류: ${response.status}`);

  const data: SECData = await response.json();
  const facts = data.facts?.["us-gaap"] || {};
  const currentYear = new Date().getFullYear();
  const minYearForCalc = currentYear - years - 1; // YoY 계산을 위해 1년 더 데이터를 가져옴
  const minYearForDisplay = currentYear - years;

  const processedRecords: ProcessedRecord[] = [];
  const annualData: { [year: number]: { [key: string]: any } } = {};

  for (const conceptName in facts) {
    const conceptData = facts[conceptName];
    for (const unit in conceptData.units) {
      conceptData.units[unit].forEach((record) => {
        if (record.fy && record.fy >= minYearForCalc) {
          if (record.fy >= minYearForDisplay) {
            processedRecords.push({
              회사명: companyName,
              CIK번호: cik,
              재무항목: conceptName,
              항목설명: conceptData.description,
              단위: unit,
              값: record.val,
              시작일: record.start,
              종료일: record.end,
              회계연도: record.fy,
              회계분기: record.fp,
              공시서류: record.form,
              제출일: record.filed,
            });
          }
          if (unit === "USD" && record.form === "10-K") {
            if (!annualData[record.fy]) annualData[record.fy] = {};
            annualData[record.fy][conceptName] = record.val;
          }
        }
      });
    }
  }

  const yoyChartData: ChartData = {
    labels: [],
    datasets: [
      {
        label: "매출(Revenues) YoY",
        data: [],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "영업이익(OperatingIncomeLoss) YoY",
        data: [],
        backgroundColor: "rgba(255, 159, 64, 0.6)",
        borderColor: "rgba(255, 159, 64, 1)",
        borderWidth: 1,
      },
      {
        label: "순이익(NetIncomeLoss) YoY",
        data: [],
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };
  const investmentMetrics: InvestmentMetric[] = [];
  const sortedYears = Object.keys(annualData)
    .map(Number)
    .sort((a, b) => a - b);

  for (const year of sortedYears) {
    const current = annualData[year];
    const previous = annualData[year - 1];

    if (year >= minYearForDisplay) {
      const netIncome = current?.NetIncomeLoss;
      const assets = current?.Assets;
      const equity = current?.StockholdersEquity;
      const liabilities = current?.Liabilities;
      investmentMetrics.push({
        year,
        roe:
          equity && netIncome && equity > 0
            ? (netIncome / equity) * 100
            : undefined,
        roa:
          assets && netIncome && assets > 0
            ? (netIncome / assets) * 100
            : undefined,
        debtToEquity:
          equity && liabilities && equity > 0
            ? (liabilities / equity) * 100
            : undefined,
      });
    }

    if (previous) {
      yoyChartData.labels.push(year.toString());
      const revenueYoY =
        previous.Revenues && current.Revenues
          ? ((current.Revenues - previous.Revenues) /
              Math.abs(previous.Revenues)) *
            100
          : 0;
      const opIncomeYoY =
        previous.OperatingIncomeLoss && current.OperatingIncomeLoss
          ? ((current.OperatingIncomeLoss - previous.OperatingIncomeLoss) /
              Math.abs(previous.OperatingIncomeLoss)) *
            100
          : 0;
      const netIncomeYoY =
        previous.NetIncomeLoss && current.NetIncomeLoss
          ? ((current.NetIncomeLoss - previous.NetIncomeLoss) /
              Math.abs(previous.NetIncomeLoss)) *
            100
          : 0;

      yoyChartData.datasets[0].data.push(revenueYoY);
      yoyChartData.datasets[1].data.push(opIncomeYoY);
      yoyChartData.datasets[2].data.push(netIncomeYoY);
    }
  }

  const latestMetrics = investmentMetrics[investmentMetrics.length - 1];
  const latestYoY =
    yoyChartData.labels.length > 0
      ? {
          revenue: yoyChartData.datasets[0].data.slice(-1)[0],
          operatingIncome: yoyChartData.datasets[1].data.slice(-1)[0],
          netIncome: yoyChartData.datasets[2].data.slice(-1)[0],
        }
      : {};

  const steps: AnalysisStep[] = [
    {
      label: "성장성 (매출 YoY)",
      value: latestYoY.revenue,
      score: getGrowthScore(latestYoY.revenue),
      description: "회사가 얼마나 빠르게 성장하는가?",
    },
    {
      label: "수익성 (ROE)",
      value: latestMetrics?.roe,
      score: getRoeScore(latestMetrics?.roe),
      description: "주주자본으로 얼마나 효율적으로 이익을 내는가?",
    },
    {
      label: "안정성 (부채비율)",
      value: latestMetrics?.debtToEquity,
      score: getDebtRatioScore(latestMetrics?.debtToEquity),
      description: "재무적으로 얼마나 안정적인가?",
    },
    {
      label: "영업 효율성 (영업이익 YoY)",
      value: latestYoY.operatingIncome,
      score: getGrowthScore(latestYoY.operatingIncome),
      description: "핵심 사업의 이익 창출력이 성장하는가?",
    },
    {
      label: "종합 이익률 (순이익 YoY)",
      value: latestYoY.netIncome,
      score: getGrowthScore(latestYoY.netIncome),
      description: "최종 이익이 성장하고 있는가?",
    },
  ];

  const totalScore = steps.reduce((sum, step) => sum + step.score, 0);
  const { evaluation, color } = getTotalScoreEvaluation(totalScore);

  const analysisResult: AnalysisResult = {
    totalScore,
    evaluation,
    evaluationColor: color,
    steps,
  };

  processedRecords.sort(
    (a, b) => new Date(b.제출일).getTime() - new Date(a.제출일).getTime()
  );

  return {
    records: processedRecords,
    yoyChartData,
    investmentMetrics: investmentMetrics.reverse(),
    analysisResult,
  };
};

export const useCompanyFacts = (
  cik: string,
  companyName: string,
  years: number
) => {
  return useQuery({
    queryKey: ["companyFacts", cik, companyName, years],
    queryFn: (): Promise<{
      records: ProcessedRecord[];
      yoyChartData: ChartData;
      investmentMetrics: InvestmentMetric[];
      analysisResult: AnalysisResult;
    }> => fetchAndProcessFacts(cik, companyName, years),
    enabled: !!cik && years > 0,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
