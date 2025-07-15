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

// 연간 투자 지표를 위한 타입
export interface InvestmentMetric {
  year: number;
  roe?: number;
  roa?: number;
  debtToEquity?: number;
}

// 차트 데이터를 위한 타입
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
  const minYear = currentYear - years - 1; // YoY 계산을 위해 1년 더 데이터를 가져옵니다.

  // 1. 상세 재무제표 데이터와 연간 데이터 집계
  const processedRecords: ProcessedRecord[] = [];
  const annualData: { [year: number]: { [key: string]: any } } = {};

  for (const conceptName in facts) {
    const conceptData = facts[conceptName];
    for (const unit in conceptData.units) {
      conceptData.units[unit].forEach((record: SECUnitData) => {
        if (record.fy && record.fy >= minYear) {
          // 상세 기록 추가 (표시할 기간만)
          if (record.fy >= currentYear - years) {
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

          // 연간 데이터 집계 (10-K 연간 보고서 기준)
          if (unit === "USD" && record.form === "10-K") {
            if (!annualData[record.fy]) annualData[record.fy] = {};
            // 최신 데이터로 덮어쓰기 (같은 회계연도에 여러 공시가 있을 경우)
            annualData[record.fy][conceptName] = record.val;
          }
        }
      });
    }
  }

  // 2. 집계된 연간 데이터로 투자 지표 및 YoY 계산
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

    // 투자 지표 계산 (표시할 기간만)
    if (year >= currentYear - years) {
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

    // YoY 계산
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

  // 상세 기록 정렬
  processedRecords.sort(
    (a, b) => new Date(b.제출일).getTime() - new Date(a.제출일).getTime()
  );

  // 최종 반환 데이터 구조
  return {
    records: processedRecords,
    yoyChartData,
    investmentMetrics: investmentMetrics.reverse(),
  };
};

// --- 커스텀 훅 ---
export const useCompanyFacts = (
  cik: string,
  companyName: string,
  years: number
) => {
  return useQuery({
    queryKey: ["companyFacts", cik, companyName, years],
    queryFn: () => fetchAndProcessFacts(cik, companyName, years),
    enabled: !!cik && years > 0,
    staleTime: 1000 * 60 * 5,
  });
};
