"use client";

import { useState } from "react";

interface ReportTitleProps {
  title: string;
  onTitleChange: (title: string) => void;
}

export default function ReportTitle({
  title,
  onTitleChange,
}: ReportTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(title);

  const handleSave = () => {
    onTitleChange(editText);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setEditText(title);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditText(title);
    setIsEditing(false);
  };

  return (
    // Mirror ExecutiveSummary's pattern: heading + its own edit controls share
    // a single justify-between row. min-w-0 on the title prevents it from
    // overflowing when the text is long; the button group never moves.
    <div className="flex items-center justify-between gap-3">
      {isEditing
        ? (
          // In edit mode the input expands to fill available space; controls
          // are pinned to the right via the flex layout.
          <>
            <input
              type="text"
              aria-label="Report Title"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="min-w-0 flex-1 rounded border border-gray-300 px-3 py-1 text-2xl font-bold focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
            />
            <div className="flex shrink-0 items-center gap-2">
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
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                </svg>
                Save
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded border border-gray-300 px-3 py-1 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </>
        )
        : (
          // min-w-0 + truncate: the heading takes all available space but never
          // overflows and never displaces the Edit button from its anchored
          // right-hand position.
          <>
            <h1 className="min-w-0 flex-1 truncate text-2xl font-bold" title={title}>
              {title}
            </h1>
            <button
              type="button"
              onClick={handleEdit}
              className="flex shrink-0 items-center gap-1 rounded bg-yellow-action px-3 py-1 text-sm font-medium text-black transition-colors hover:bg-yellow-action-hover"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit
            </button>
          </>
        )}
    </div>
  );
}
