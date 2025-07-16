import { useQuery } from "@tanstack/react-query";

// --- 타입 정의 (이전과 동일) ---
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
export interface IncomeStatementRecord {
  year: number;
  quarter?: string;
  revenue?: number;
  operatingIncome?: number;
  filed: string;
}
export interface IncomeStatementData {
  annual: IncomeStatementRecord[];
  quarterly: IncomeStatementRecord[];
}
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

/** 1. 원본 데이터에서 상세 레코드와 연간/분기 데이터를 집계하는 함수 */
const aggregateFinancialData = (
  facts: SECData["facts"]["us-gaap"],
  companyName: string,
  cik: string,
  years: number
) => {
  const currentYear = new Date().getFullYear();
  const minYearForCalc = currentYear - years - 1;
  const minYearForDisplay = currentYear - years;

  const processedRecords: ProcessedRecord[] = [];
  const annualData: { [year: number]: { [key: string]: any } } = {};
  const quarterlyData: { [key: string]: { [key: string]: any } } = {};

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
          if (unit === "USD") {
            if (record.form === "10-K") {
              if (!annualData[record.fy]) annualData[record.fy] = {};
              annualData[record.fy][conceptName] = record.val;
            } else if (record.form === "10-Q") {
              const key = `${record.fy}${record.fp}`;
              if (!quarterlyData[key])
                quarterlyData[key] = {
                  year: record.fy,
                  quarter: record.fp,
                  filed: record.filed,
                };
              quarterlyData[key][conceptName] = record.val;
            }
          }
        }
      });
    }
  }
  processedRecords.sort(
    (a, b) => new Date(b.제출일).getTime() - new Date(a.제출일).getTime()
  );
  return { processedRecords, annualData, quarterlyData };
};

/** 2. 투자 지표(ROE, ROA, 부채비율)를 계산하는 함수 */
const calculateInvestmentMetrics = (
  annualData: { [year: number]: any },
  years: number
): InvestmentMetric[] => {
  const currentYear = new Date().getFullYear();
  const minYearForDisplay = currentYear - years;
  const investmentMetrics: InvestmentMetric[] = [];
  const sortedYears = Object.keys(annualData)
    .map(Number)
    .sort((a, b) => a - b);

  for (const year of sortedYears) {
    if (year >= minYearForDisplay) {
      const current = annualData[year];
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
  }
  return investmentMetrics.reverse();
};

/** 3. YoY 성장률 차트 데이터를 계산하는 함수 */
const calculateYoYChartData = (annualData: {
  [year: number]: any;
}): ChartData => {
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
  const sortedYears = Object.keys(annualData)
    .map(Number)
    .sort((a, b) => a - b);

  for (const year of sortedYears) {
    const current = annualData[year];
    const previous = annualData[year - 1];
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
  return yoyChartData;
};

/** 4. 5단계 정량 분석 모델을 실행하는 함수 */
const runAnalysisModel = (
  investmentMetrics: InvestmentMetric[],
  yoyChartData: ChartData
): AnalysisResult => {
  const getGrowthScore = (v?: number) => {
    if (v === undefined) return 1;
    if (v > 20) return 5;
    if (v > 10) return 4;
    if (v > 5) return 3;
    if (v > 0) return 2;
    return 1;
  };
  const getRoeScore = (v?: number) => {
    if (v === undefined) return 1;
    if (v > 20) return 5;
    if (v > 15) return 4;
    if (v > 10) return 3;
    if (v > 5) return 2;
    return 1;
  };
  const getDebtRatioScore = (v?: number) => {
    if (v === undefined) return 1;
    if (v < 50) return 5;
    if (v < 100) return 4;
    if (v < 150) return 3;
    if (v < 200) return 2;
    return 1;
  };
  const getTotalScoreEvaluation = (s: number) => {
    if (s >= 21) return { e: "매우 긍정적", c: "#2ecc71" };
    if (s >= 16) return { e: "긍정적", c: "#3498db" };
    if (s >= 11) return { e: "보통", c: "#f1c40f" };
    if (s >= 6) return { e: "주의 필요", c: "#e67e22" };
    return { e: "부정적", c: "#e74c3c" };
  };

  const latestMetrics = investmentMetrics[0];
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
  const { e: evaluation, c: evaluationColor } =
    getTotalScoreEvaluation(totalScore);
  return { totalScore, evaluation, evaluationColor, steps };
};

/** 5. 연간/분기 손익계산서 데이터를 집계하는 함수 */
const aggregateIncomeStatements = (
  annualData: { [year: number]: any },
  quarterlyData: { [key: string]: any },
  years: number
): IncomeStatementData => {
  const currentYear = new Date().getFullYear();
  const minYearForDisplay = currentYear - years;

  const annualIncome = Object.values(annualData)
    .filter((d) => d.year >= minYearForDisplay)
    .map((d) => ({
      year: d.year,
      revenue: d.Revenues,
      operatingIncome: d.OperatingIncomeLoss,
      filed: d.filed || "",
    }))
    .sort((a, b) => b.year - a.year);

  const quarterlyIncome = Object.values(quarterlyData)
    .map((d) => ({
      year: d.year,
      quarter: d.quarter,
      revenue: d.Revenues,
      operatingIncome: d.OperatingIncomeLoss,
      filed: d.filed,
    }))
    .sort((a, b) => new Date(b.filed).getTime() - new Date(a.filed).getTime());

  return { annual: annualIncome, quarterly: quarterlyIncome };
};

// --- 메인 데이터 페칭 함수 ---
const fetchAndProcessAllData = async (
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

  // 1. 데이터 집계
  const { processedRecords, annualData, quarterlyData } =
    aggregateFinancialData(facts, companyName, cik, years);

  console.log("annualData :", annualData);
  // 2. 각 지표 계산
  const investmentMetrics = calculateInvestmentMetrics(annualData, years);
  const yoyChartData = calculateYoYChartData(annualData);
  const incomeStatementData = aggregateIncomeStatements(
    annualData,
    quarterlyData,
    years
  );

  console.log("incomeStatementData :", incomeStatementData);

  // 3. 최종 분석 실행
  const analysisResult = runAnalysisModel(investmentMetrics, yoyChartData);

  // 4. 모든 결과를 하나의 객체로 조합하여 반환
  return {
    records: processedRecords,
    yoyChartData,
    investmentMetrics,
    analysisResult,
    incomeStatementData,
  };
};

export const useCompanyFacts = (
  cik: string,
  companyName: string,
  years: number
) => {
  return useQuery({
    queryKey: ["companyFacts", cik, companyName, years],
    queryFn: () => fetchAndProcessAllData(cik, companyName, years),
    enabled: !!cik && years > 0,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
