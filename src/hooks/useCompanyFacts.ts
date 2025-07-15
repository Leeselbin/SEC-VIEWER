import { useQuery } from "@tanstack/react-query";
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

const fetchAndProcessFacts = async (
  cik: string,
  companyName: string,
  years: number
): Promise<ProcessedRecord[]> => {
  const url = `/api/xbrl/companyfacts/CIK${cik}.json`;
  const headers = { "User-Agent": "MyWebApp my.email@example.com" };

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`HTTP 오류: ${response.status}`);
  }
  const data: SECData = await response.json();

  const facts = data.facts?.["us-gaap"] || {};
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - years;

  const processedRecords: ProcessedRecord[] = [];
  for (const conceptName in facts) {
    const conceptData = facts[conceptName];
    for (const unit in conceptData.units) {
      conceptData.units[unit].forEach((record) => {
        if (record.fy && record.fy >= minYear) {
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
      });
    }
  }

  processedRecords.sort(
    (a, b) => new Date(b.제출일).getTime() - new Date(a.제출일).getTime()
  );
  return processedRecords;
};

export const useCompanyFacts = (
  cik: string,
  companyName: string,
  years: number
) => {
  return useQuery<ProcessedRecord[], Error>({
    queryKey: ["companyFacts", cik, companyName, years],
    queryFn: () => fetchAndProcessFacts(cik, companyName, years),
    enabled: !!cik && years > 0,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
