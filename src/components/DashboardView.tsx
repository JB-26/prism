"use client";

import { useEffect, useRef, useState } from "react";
import ChartDisplay from "@/components/ChartDisplay";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import ReportTitle from "@/components/ReportTitle";
import SaveButton from "@/components/SaveButton";
import type { AnalysisResult, SupportedChartType } from "@/types";

interface DashboardViewProps {
  result: AnalysisResult;
  csvText: string;
  onDelete: () => void;
}

export default function DashboardView(
  { result, csvText, onDelete }: DashboardViewProps,
) {
  const [chartType, setChartType] = useState<SupportedChartType>(
    result.chartType,
  );
  const [summary, setSummary] = useState(result.summary);
  const [title, setTitle] = useState(result.title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Focus the Cancel button when the delete confirmation appears so keyboard
  // and screen reader users are immediately aware of the new UI state.
  const deleteConfirmCancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (showDeleteConfirm) {
      deleteConfirmCancelRef.current?.focus();
    }
  }, [showDeleteConfirm]);

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
      {/*
        Two-row header:
          Row 1 — ReportTitle owns its full width. It handles its own
                  [h1 | Edit] / [input | Save | Cancel] layout internally,
                  matching the ExecutiveSummary card pattern.
          Row 2 — Dashboard-level action buttons, right-aligned and always
                  stable regardless of how long the report title is.
      */}
      <div className="mb-2">
        <ReportTitle title={title} onTitleChange={setTitle} />
      </div>
      <div className="mb-6 flex items-center justify-end gap-3">
          <SaveButton
            chartType={chartType}
            chartConfig={result.chartConfig}
            summary={summary}
            title={title}
            csvText={csvText}
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
                  ref={deleteConfirmCancelRef}
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

      {(() => {
        const lines = csvText.split("\n").filter((l) => l.trim() !== "");
        if (lines.length < 2) return null;
        const headers = lines[0].split(",");
        const dataRows = lines.slice(1);
        const preview = dataRows.slice(0, 10);
        const totalRows = dataRows.length;
        return (
          <details className="mt-6 rounded-lg border border-gray-200">
            <summary className="cursor-pointer px-6 py-4 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Source Data &mdash; {Math.min(preview.length, 10)} of {totalRows}{" "}
              rows shown
            </summary>
            <div className="overflow-x-auto px-6 pb-6">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    {headers.map((h, i) => (
                      <th
                        key={i}
                        className="border border-gray-200 bg-gray-50 px-3 py-1.5 text-left font-semibold"
                      >
                        {h.trim()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, ri) => (
                    <tr key={ri}>
                      {row.split(",").map((cell, ci) => (
                        <td
                          key={ci}
                          className="border border-gray-200 px-3 py-1.5"
                        >
                          {cell.trim()}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        );
      })()}
    </div>
  );
}
