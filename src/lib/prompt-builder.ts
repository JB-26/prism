import type { ParsedCSV } from "@/types";

const MAX_ROWS = 50;

export function buildPrompt(csv: ParsedCSV, fileName: string): string {
  const totalRows = csv.rows.length;
  const truncatedRows = csv.rows.slice(0, MAX_ROWS);

  const csvPreview = [csv.headers.join(",")]
    .concat(truncatedRows.map((row) => row.join(",")))
    .join("\n");

  const truncationNote = totalRows > MAX_ROWS
    ? `\n\nNote: This CSV contains ${totalRows} total rows. Only the first ${MAX_ROWS} rows are shown above.`
    : "";

  return `You are a data analyst. Analyze the following CSV data from a file named "${fileName}" and provide:

1. The most appropriate chart type from: bar, line, pie, doughnut, polarArea, radar
2. A Chart.js chart configuration with labels and datasets
3. An executive summary of the data (2-3 paragraphs)

CSV Data:
${csvPreview}${truncationNote}

Respond with valid JSON in this exact format (no markdown code blocks):
{
  "chartType": "bar",
  "chartConfig": {
    "labels": ["Label1", "Label2"],
    "datasets": [
      {
        "label": "Dataset Name",
        "data": [10, 20],
        "backgroundColor": ["#6b7280", "#9ca3af", "#d1d5db"],
        "borderColor": ["#4b5563", "#6b7280", "#9ca3af"],
        "borderWidth": 1
      }
    ]
  },
  "summary": "Executive summary here..."
}

Requirements for the chart configuration:
- Use a muted, professional color palette (grays, slate blues, muted teals)
- Ensure tooltips will work by providing properly structured data
- For pie/doughnut charts, use an array of colors matching the number of data points
- Choose the chart type that best represents the data relationships
- The summary should highlight key trends, outliers, and actionable insights`;
}
