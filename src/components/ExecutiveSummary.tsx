"use client";

import { useState } from "react";

interface ExecutiveSummaryProps {
  summary: string;
  onSummaryChange: (summary: string) => void;
}

export default function ExecutiveSummary({
  summary,
  onSummaryChange,
}: ExecutiveSummaryProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(summary);

  const handleSave = () => {
    onSummaryChange(editText);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setEditText(summary);
    setIsEditing(true);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Executive Summary</h3>
        {isEditing
          ? (
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1 rounded bg-green-action px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-green-action-hover"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
              </svg>
              Save
            </button>
          )
          : (
            <button
              type="button"
              onClick={handleEdit}
              className="flex items-center gap-1 rounded bg-yellow-action px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-yellow-action-hover"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit
            </button>
          )}
      </div>

      {isEditing
        ? (
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full rounded border border-gray-300 p-3 text-sm leading-relaxed focus:border-gray-400 focus:outline-none"
            rows={8}
          />
        )
        : (
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
            {summary}
          </div>
        )}
    </div>
  );
}
