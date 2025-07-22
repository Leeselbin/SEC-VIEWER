import { useQuery } from "@tanstack/react-query";

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

/**
 * 백엔드 API를 호출하여 기업 분석 데이터를 가져오는 함수
 * @param cik - 회사 CIK 번호
 * @param companyName - 회사명
 * @param years - 조회할 기간(년)
 */
const fetchCompanyAnalysis = async (
  cik: string,
  companyName: string,
  years: number
) => {
  // 백엔드 서버 주소 (환경변수로 관리하는 것을 추천)
  const url = `/analysis-api/company-analysis/${cik}/${companyName}/${years}`;

  const response = await fetch(url);

  if (!response.ok) {
    // 백엔드(FastAPI)에서 보낸 에러 메시지를 사용
    const errorData = await response.json();
    throw new Error(
      errorData.detail || "서버에서 데이터를 가져오는 데 실패했습니다."
    );
  }

  return response.json();
};

/**
 * 기업 분석 데이터를 가져오는 React-Query 커스텀 훅
 */
export const useCompanyAnalysis = (
  cik: string,
  companyName: string,
  years: number
) => {
  return useQuery({
    // queryKey: 쿼리 결과 캐싱을 위한 고유 키
    // cik, years가 변경되면 react-query가 자동으로 데이터를 다시 가져옵니다.
    queryKey: ["companyAnalysis", cik, years],

    // queryFn: 데이터를 가져오는 비동기 함수
    queryFn: () => fetchCompanyAnalysis(cik, companyName, years),

    // enabled: 특정 조건에서만 쿼리를 실행하도록 설정
    // CIK와 companyName이 있고, years가 0보다 클 때만 API를 호출합니다.
    enabled: !!cik && !!companyName && years > 0,

    // staleTime: 5분 동안 데이터를 '신선한' 상태로 간주 (캐시 활용)
    staleTime: 1000 * 60 * 5,

    // refetchOnWindowFocus: 사용자가 창을 다시 포커스했을 때 자동 리페치 비활성화
    refetchOnWindowFocus: false,
  });
};
