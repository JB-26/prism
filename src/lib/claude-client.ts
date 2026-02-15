import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisResult } from "@/types";

const client = new Anthropic();

export async function analyzeCSV(prompt: string): Promise<AnalysisResult> {
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  const parsed = parseJSON(textBlock.text);
  return parsed;
}

function parseJSON(text: string): AnalysisResult {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // Fall through to code block stripping
  }

  // Strip markdown code blocks if present
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch) {
    return JSON.parse(codeBlockMatch[1]);
  }

  throw new Error("Failed to parse Claude response as JSON");
}
