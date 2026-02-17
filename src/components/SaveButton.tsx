"use client";

import { useState } from "react";
import { generateHTML } from "@/lib/html-exporter";
import type { ChartConfiguration, SupportedChartType } from "@/types";

interface SaveButtonProps {
  chartType: SupportedChartType;
  chartConfig: ChartConfiguration;
  summary: string;
}

export default function SaveButton({
  chartType,
  chartConfig,
  summary,
}: SaveButtonProps) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const html = generateHTML(chartType, chartConfig, summary);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "prism-report.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleSave}
      className="flex items-center gap-1 rounded-lg bg-green-action px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-action-hover"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" />
      </svg>
      {saved ? "Saved!" : "Save Report"}
    </button>
  );
}
