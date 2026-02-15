export interface ParsedCSV {
  headers: string[];
  rows: string[][];
}

export type SupportedChartType =
  | "bar"
  | "line"
  | "pie"
  | "doughnut"
  | "polarArea"
  | "radar";

export interface AnalysisResult {
  chartType: SupportedChartType;
  chartConfig: ChartConfiguration;
  summary: string;
}

export interface ChartConfiguration {
  labels: string[];
  datasets: Dataset[];
}

export interface Dataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface AnalyzeRequest {
  csvText: string;
  fileName: string;
}

export interface AnalyzeResponse {
  success: boolean;
  result?: AnalysisResult;
  error?: string;
}
