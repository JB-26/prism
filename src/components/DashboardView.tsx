"use client";

import { useState } from "react";
import ChartDisplay from "@/components/ChartDisplay";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import SaveButton from "@/components/SaveButton";
import type { AnalysisResult, SupportedChartType } from "@/types";

interface DashboardViewProps {
  result: AnalysisResult;
  onDelete: () => void;
}

export default function DashboardView(
  { result, onDelete }: DashboardViewProps,
) {
  const [chartType, setChartType] = useState<SupportedChartType>(
    result.chartType,
  );
  const [summary, setSummary] = useState(result.summary);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    onDelete();
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Results</h1>
        <div className="flex gap-3">
          <SaveButton
            chartType={chartType}
            chartConfig={result.chartConfig}
            summary={summary}
          />
          {showDeleteConfirm
            ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Are you sure?</span>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="rounded-lg bg-red-action px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-action-hover"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCancel}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            )
            : (
              <button
                type="button"
                onClick={handleDeleteClick}
                className="flex items-center gap-1 rounded-lg bg-red-action px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-action-hover"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Delete
              </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartDisplay
          chartType={chartType}
          chartConfig={result.chartConfig}
          onChartTypeChange={setChartType}
        />
        <ExecutiveSummary
          summary={summary}
          onSummaryChange={setSummary}
        />
      </div>
    </div>
  );
}
