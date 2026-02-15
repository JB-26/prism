/// <reference lib="deno.ns" />
import { assertEquals } from "@std/assert";

// Inline implementations for Deno tests
type SupportedChartType =
  | "bar"
  | "line"
  | "pie"
  | "doughnut"
  | "polarArea"
  | "radar";

const CHART_TYPES: { value: SupportedChartType; label: string }[] = [
  { value: "bar", label: "Bar Chart" },
  { value: "line", label: "Line Chart" },
  { value: "pie", label: "Pie Chart" },
  { value: "doughnut", label: "Doughnut Chart" },
  { value: "polarArea", label: "Polar Area Chart" },
  { value: "radar", label: "Radar Chart" },
];

function getChartTypeLabel(type: SupportedChartType): string {
  const found = CHART_TYPES.find((ct) => ct.value === type);
  return found ? found.label : type;
}

function isCartesianChart(type: SupportedChartType): boolean {
  return type === "bar" || type === "line";
}

function isValidChartType(type: string): type is SupportedChartType {
  return CHART_TYPES.some((ct) => ct.value === type);
}

Deno.test("getChartTypeLabel returns correct label for bar", () => {
  assertEquals(getChartTypeLabel("bar"), "Bar Chart");
});

Deno.test("getChartTypeLabel returns correct label for pie", () => {
  assertEquals(getChartTypeLabel("pie"), "Pie Chart");
});

Deno.test("isCartesianChart returns true for bar and line", () => {
  assertEquals(isCartesianChart("bar"), true);
  assertEquals(isCartesianChart("line"), true);
});

Deno.test("isCartesianChart returns false for pie and doughnut", () => {
  assertEquals(isCartesianChart("pie"), false);
  assertEquals(isCartesianChart("doughnut"), false);
});

Deno.test("isValidChartType validates known types", () => {
  assertEquals(isValidChartType("bar"), true);
  assertEquals(isValidChartType("line"), true);
  assertEquals(isValidChartType("pie"), true);
  assertEquals(isValidChartType("doughnut"), true);
  assertEquals(isValidChartType("polarArea"), true);
  assertEquals(isValidChartType("radar"), true);
});

Deno.test("isValidChartType rejects unknown types", () => {
  assertEquals(isValidChartType("scatter"), false);
  assertEquals(isValidChartType("bubble"), false);
  assertEquals(isValidChartType(""), false);
});

Deno.test("CHART_TYPES contains 6 chart types", () => {
  assertEquals(CHART_TYPES.length, 6);
});
