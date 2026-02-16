import { NextResponse } from "next/server";
import { parseCSV } from "@/lib/csv-parser";
import { buildPrompt } from "@/lib/prompt-builder";
import { analyzeCSV } from "@/lib/claude-client";
import { isValidChartType } from "@/lib/chart-config";
import type { AnalyzeRequest, AnalyzeResponse } from "@/types";

const MAX_CSV_SIZE = 3 * 1024 * 1024; // 3MB

export async function POST(request: Request) {
  try {
    const body: AnalyzeRequest = await request.json();

    if (!body.csvText || !body.fileName) {
      return NextResponse.json<AnalyzeResponse>(
        { success: false, error: "Missing csvText or fileName" },
        { status: 400 },
      );
    }

    // Server-side size validation
    if (new TextEncoder().encode(body.csvText).length > MAX_CSV_SIZE) {
      return NextResponse.json<AnalyzeResponse>(
        { success: false, error: "CSV data exceeds 3MB limit" },
        { status: 400 },
      );
    }

    // Server-side fileName validation
    if (!body.fileName.toLowerCase().endsWith(".csv")) {
      return NextResponse.json<AnalyzeResponse>(
        { success: false, error: "Only CSV files are allowed" },
        { status: 400 },
      );
    }

    const csv = parseCSV(body.csvText);

    if (csv.headers.length === 0) {
      return NextResponse.json<AnalyzeResponse>(
        { success: false, error: "CSV file appears to be empty" },
        { status: 400 },
      );
    }

    const prompt = buildPrompt(csv, body.fileName);
    const result = await analyzeCSV(prompt);

    // Validate Claude's response shape
    if (!isValidChartType(result.chartType)) {
      return NextResponse.json<AnalyzeResponse>(
        { success: false, error: "Invalid chart type returned by analysis" },
        { status: 500 },
      );
    }

    if (
      !Array.isArray(result.chartConfig?.labels) ||
      !Array.isArray(result.chartConfig?.datasets) ||
      typeof result.summary !== "string"
    ) {
      return NextResponse.json<AnalyzeResponse>(
        {
          success: false,
          error: "Invalid response shape returned by analysis",
        },
        { status: 500 },
      );
    }

    return NextResponse.json<AnalyzeResponse>({
      success: true,
      result,
    });
  } catch (error) {
    const message = error instanceof Error
      ? error.message
      : "An unexpected error occurred";
    return NextResponse.json<AnalyzeResponse>(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
