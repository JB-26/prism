"use client";

import { useRef, useState } from "react";
import { validateFile } from "@/lib/file-validator";
import ThinkingAnimation from "@/components/ThinkingAnimation";
import DashboardView from "@/components/DashboardView";
import type { AnalysisResult, AnalyzeResponse } from "@/types";

type ViewState = "upload" | "thinking" | "dashboard";

export default function FileUpload() {
  const [viewState, setViewState] = useState<ViewState>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error!);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setError(null);
    setViewState("thinking");
    abortControllerRef.current = new AbortController();

    try {
      const csvText = await selectedFile.text();

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText, fileName: selectedFile.name }),
        signal: abortControllerRef.current.signal,
      });

      const data: AnalyzeResponse = await response.json();

      if (!data.success || !data.result) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data.result);
      setViewState("dashboard");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setViewState("upload");
        return;
      }
      setError(err instanceof Error ? err.message : "An error occurred");
      setViewState("upload");
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
    setViewState("upload");
  };

  const handleDelete = () => {
    setResult(null);
    setSelectedFile(null);
    setViewState("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (viewState === "thinking") {
    return (
      <div className="flex flex-col items-center">
        <ThinkingAnimation />
        <button
          type="button"
          onClick={handleCancel}
          className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    );
  }

  if (viewState === "dashboard" && result) {
    return (
      <div className="animate-fade-in">
        {/* Visually hidden live region announces completion to screen readers.
            role="status" on ThinkingAnimation conveyed the in-progress state;
            this separate region announces when that state resolves. */}
        <p
          role="status"
          aria-live="polite"
          className="sr-only"
        >
          Analysis complete
        </p>
        <DashboardView result={result} onDelete={handleDelete} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="mb-6 text-2xl font-bold text-gray-800">
        Upload your CSV file
      </h1>

      <div className="mb-4 flex flex-col items-center gap-4">
        {/* role="button" + tabIndex make the label keyboard-activatable as an
            interactive element. focus-visible outline keeps it consistent with
            the rest of the design system. aria-describedby ties the label to
            the constraint hint for screen reader announcement. */}
        <label
          htmlFor="csv-upload"
          role="button"
          tabIndex={0}
          aria-describedby="csv-upload-hint"
          onKeyDown={(e) => {
            // Allow Space/Enter to open the native file picker
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 px-12 py-8 text-center transition-colors hover:border-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-800"
        >
          <p className="text-gray-500">
            {selectedFile ? selectedFile.name : "Click to select a CSV file"}
          </p>
          <input
            id="csv-upload"
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        {/* Constraint hint referenced by aria-describedby on the drop zone */}
        <p id="csv-upload-hint" className="text-xs text-gray-500">
          CSV only, max 3 MB
        </p>

        <button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile}
          className="rounded-lg bg-green-action px-6 py-2 font-semibold text-white transition-colors hover:bg-green-action-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Upload
        </button>
      </div>

      {error && (
        <p
          role="alert"
          aria-live="assertive"
          className="mt-2 text-sm font-medium text-red-action"
        >
          {error}
        </p>
      )}
    </div>
  );
}
