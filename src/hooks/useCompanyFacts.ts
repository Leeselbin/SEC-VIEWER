import { useQuery } from "@tanstack/react-query";

// --- 타입 정의: 애플리케이션 전체에서 사용될 데이터 구조를 정의합니다. ---

/** 상세 재무제표 테이블의 각 행을 나타내는 데이터 타입 */
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

/** 연간 투자 지표(ROE, ROA 등)를 위한 데이터 타입 */
export interface InvestmentMetric {
  year: number;
  roe?: number;
  roa?: number;
  debtToEquity?: number;
}

/** YoY 성장률 그래프를 위한 데이터 타입 (Chart.js 형식) */
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

/** 5단계 분석 모델의 각 단계를 위한 데이터 타입 */
export interface AnalysisStep {
  label: string;
  value: number | undefined;
  score: number;
  description: string;
}

/** 5단계 분석의 최종 결과를 위한 데이터 타입 */
export interface AnalysisResult {
  totalScore: number;
  evaluation: string;
  evaluationColor: string;
  steps: AnalysisStep[];
}

/** 손익계산서 요약 테이블을 위한 데이터 타입 */
export interface IncomeStatementRecord {
  year: number;
  quarter?: string;
  revenue?: number;
  operatingIncome?: number;
  netIncome?: number;
  filed: string;
}

/** 연간/분기 손익계산서 데이터를 포함하는 최종 타입 */
export interface IncomeStatementData {
  annual: IncomeStatementRecord[];
  quarterly: IncomeStatementRecord[];
}

// --- API 응답 원본 데이터 타입 정의 ---
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

// --- 헬퍼 함수: 5단계 평가 모델의 점수 계산 로직 ---

/** 성장률 점수 계산 (매출, 영업이익, 순이익 YoY) */
const getGrowthScore = (value?: number): number => {
  if (value === undefined) return 1;
  if (value > 20) return 5;
  if (value > 10) return 4;
  if (value > 5) return 3;
  if (value > 0) return 2;
  return 1;
};

/** ROE 점수 계산 */
const getRoeScore = (value?: number): number => {
  if (value === undefined) return 1;
  if (value > 20) return 5;
  if (value > 15) return 4;
  if (value > 10) return 3;
  if (value > 5) return 2;
  return 1;
};

/** 부채비율 점수 계산 */
const getDebtRatioScore = (value?: number): number => {
  if (value === undefined) return 1;
  if (value < 50) return 5;
  if (value < 100) return 4;
  if (value < 150) return 3;
  if (value < 200) return 2;
  return 1;
};

/** 총점에 따른 최종 평가 등급 및 색상 반환 */
const getTotalScoreEvaluation = (
  score: number
): { evaluation: string; color: string } => {
  if (score >= 21) return { evaluation: "매우 긍정적", color: "#2ecc71" };
  if (score >= 16) return { evaluation: "긍정적", color: "#3498db" };
  if (score >= 11) return { evaluation: "보통", color: "#f1c40f" };
  if (score >= 6) return { evaluation: "주의 필요", color: "#e67e22" };
  return { evaluation: "부정적", color: "#e74c3c" };
};

/** 여러 가능한 매출 항목을 순차적으로 찾아 반환하는 함수 */
const getRevenueValue = (dataObject: any): number | undefined => {
  if (!dataObject) return undefined;
  return (
    dataObject.Revenues ||
    dataObject.SalesRevenueNet ||
    dataObject.RevenueFromContractWithCustomerExcludingAssessedTax
  );
};

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
              if (!annualData[record.fy])
                annualData[record.fy] = { year: record.fy };
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
        label: "매출 YoY",
        data: [],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "영업이익 YoY",
        data: [],
        backgroundColor: "rgba(255, 159, 64, 0.6)",
        borderColor: "rgba(255, 159, 64, 1)",
        borderWidth: 1,
      },
      {
        label: "순이익 YoY",
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
      const prevRevenue = getRevenueValue(previous);
      const currentRevenue = getRevenueValue(current);
      const revenueYoY =
        prevRevenue && currentRevenue
          ? ((currentRevenue - prevRevenue) / Math.abs(prevRevenue)) * 100
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
  const { evaluation, color } = getTotalScoreEvaluation(totalScore);
  return { totalScore, evaluation, evaluationColor: color, steps };
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
      revenue: getRevenueValue(d),
      operatingIncome: d.OperatingIncomeLoss,
      netIncome: d.NetIncomeLoss,
      filed: d.filed || "",
    }))
    .sort((a, b) => b.year - a.year);

  const quarterlyIncome = Object.values(quarterlyData)
    .map((d) => ({
      year: d.year,
      quarter: d.quarter,
      revenue: getRevenueValue(d),
      operatingIncome: d.OperatingIncomeLoss,
      netIncome: d.NetIncomeLoss,
      filed: d.filed,
    }))
    .sort((a, b) => new Date(b.filed).getTime() - new Date(a.filed).getTime());

  return { annual: annualIncome, quarterly: quarterlyIncome };
};

// --- 메인 데이터 페칭 함수 (모든 로직을 조합) ---
const fetchAndProcessAllData = async (
  cik: string,
  companyName: string,
  years: number
) => {
  // 1. SEC API에서 원본 데이터 호출
  const url = `/api/xbrl/companyfacts/CIK${cik}.json`;
  const headers = { "User-Agent": "MyWebApp my.email@example.com" };
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`HTTP 오류: ${response.status}`);
  const data: SECData = await response.json();
  const facts = data.facts?.["us-gaap"] || {};

  // 2. 원본 데이터를 필요한 형태로 1차 가공 및 집계
  const { processedRecords, annualData, quarterlyData } =
    aggregateFinancialData(facts, companyName, cik, years);

  // 3. 집계된 데이터를 바탕으로 각 지표 계산
  const investmentMetrics = calculateInvestmentMetrics(annualData, years);
  const yoyChartData = calculateYoYChartData(annualData);
  const incomeStatementData = aggregateIncomeStatements(
    annualData,
    quarterlyData,
    years
  );

  // 4. 계산된 지표들로 최종 분석 모델 실행
  const analysisResult = runAnalysisModel(investmentMetrics, yoyChartData);

  // 5. 모든 결과를 하나의 객체로 조합하여 반환
  return {
    records: processedRecords,
    yoyChartData,
    investmentMetrics,
    analysisResult,
    incomeStatementData,
  };
};

// --- 커스텀 훅: React 컴포넌트에서 데이터를 쉽게 사용하도록 돕는 최종 인터페이스 ---
export const useCompanyFacts = (
  cik: string,
  companyName: string,
  years: number
) => {
  return useQuery({
    queryKey: ["companyFacts", cik, companyName, years],
    queryFn: () => fetchAndProcessAllData(cik, companyName, years),
    enabled: !!cik && years > 0, // CIK와 years가 있을 때만 쿼리 실행
    staleTime: 1000 * 60 * 5, // 5분 동안 데이터를 '신선한' 상태로 간주 (캐시 활용)
    refetchOnWindowFocus: false, // 창 포커스 시 자동 리페치 비활성화
  });
};
