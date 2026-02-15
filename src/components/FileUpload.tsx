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

    try {
      const csvText = await selectedFile.text();

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText, fileName: selectedFile.name }),
      });

      const data: AnalyzeResponse = await response.json();

      if (!data.success || !data.result) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data.result);
      setViewState("dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setViewState("upload");
    }
  };

  const handleDelete = () => {
    setResult(null);
    setSelectedFile(null);
    setViewState("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (viewState === "thinking") {
    return <ThinkingAnimation />;
  }

  if (viewState === "dashboard" && result) {
    return (
      <div className="animate-fade-in">
        <DashboardView result={result} onDelete={handleDelete} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">
        Upload your CSV file
      </h2>

      <div className="mb-4 flex flex-col items-center gap-4">
        <label
          htmlFor="csv-upload"
          className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 px-12 py-8 text-center transition-colors hover:border-gray-400"
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
        <p className="mt-2 text-sm font-medium text-red-action">{error}</p>
      )}
    </div>
  );
}
