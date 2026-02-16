/// <reference lib="deno.ns" />
import { assertEquals, assertThrows } from "@std/assert";

// Inline parseJSON implementation for Deno tests (mirrors claude-client.ts)
interface AnalysisResult {
  chartType: string;
  chartConfig: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderWidth?: number;
    }[];
  };
  summary: string;
}

function parseJSON(text: string): AnalysisResult {
  try {
    return JSON.parse(text);
  } catch {
    // Fall through to code block stripping
  }

  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch) {
    return JSON.parse(codeBlockMatch[1]);
  }

  throw new Error("Failed to parse Claude response as JSON");
}

const validResult: AnalysisResult = {
  chartType: "bar",
  chartConfig: {
    labels: ["A", "B"],
    datasets: [{ label: "Test", data: [1, 2], borderWidth: 1 }],
  },
  summary: "Test summary",
};

Deno.test("parses clean JSON response", () => {
  const json = JSON.stringify(validResult);
  const result = parseJSON(json);
  assertEquals(result.chartType, "bar");
  assertEquals(result.chartConfig.labels, ["A", "B"]);
  assertEquals(result.summary, "Test summary");
});

Deno.test("parses JSON wrapped in markdown json fences", () => {
  const json = "```json\n" + JSON.stringify(validResult) + "\n```";
  const result = parseJSON(json);
  assertEquals(result.chartType, "bar");
});

Deno.test("parses JSON wrapped in plain fences", () => {
  const json = "```\n" + JSON.stringify(validResult) + "\n```";
  const result = parseJSON(json);
  assertEquals(result.chartType, "bar");
});

Deno.test("throws on unparseable natural language text", () => {
  assertThrows(
    () => parseJSON("This is a natural language response"),
    Error,
    "Failed to parse Claude response as JSON",
  );
});

Deno.test("throws on malformed JSON in code block", () => {
  assertThrows(
    () => parseJSON("```json\n{bad json}\n```"),
    Error,
  );
});

Deno.test("parses JSON with trailing whitespace in fences", () => {
  const json = "```json \n" + JSON.stringify(validResult) + "\n ```";
  const result = parseJSON(json);
  assertEquals(result.chartType, "bar");
});

Deno.test("throws on empty code block", () => {
  assertThrows(
    () => parseJSON("```\n\n```"),
    SyntaxError,
  );
});
