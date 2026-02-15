import { NextResponse } from "next/server";
import { parseCSV } from "@/lib/csv-parser";
import { buildPrompt } from "@/lib/prompt-builder";
import { analyzeCSV } from "@/lib/claude-client";
import type { AnalyzeRequest, AnalyzeResponse } from "@/types";

export async function POST(request: Request) {
  try {
    const body: AnalyzeRequest = await request.json();

    if (!body.csvText || !body.fileName) {
      return NextResponse.json<AnalyzeResponse>(
        { success: false, error: "Missing csvText or fileName" },
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
