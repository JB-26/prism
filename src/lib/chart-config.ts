import type { SupportedChartType } from "@/types";

export const CHART_TYPES: { value: SupportedChartType; label: string }[] = [
  { value: "bar", label: "Bar Chart" },
  { value: "line", label: "Line Chart" },
  { value: "pie", label: "Pie Chart" },
  { value: "doughnut", label: "Doughnut Chart" },
  { value: "polarArea", label: "Polar Area Chart" },
  { value: "radar", label: "Radar Chart" },
];

export function getChartTypeLabel(type: SupportedChartType): string {
  const found = CHART_TYPES.find((ct) => ct.value === type);
  return found ? found.label : type;
}

export function isCartesianChart(type: SupportedChartType): boolean {
  return type === "bar" || type === "line";
}

export function isValidChartType(type: string): type is SupportedChartType {
  return CHART_TYPES.some((ct) => ct.value === type);
}
