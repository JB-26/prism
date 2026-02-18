"use client";

import { useState } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { CHART_TYPES } from "@/lib/chart-config";
import type { ChartConfiguration, SupportedChartType } from "@/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  Filler,
);

interface ChartDisplayProps {
  chartType: SupportedChartType;
  chartConfig: ChartConfiguration;
  onChartTypeChange: (type: SupportedChartType) => void;
}

export default function ChartDisplay({
  chartType,
  chartConfig,
  onChartTypeChange,
}: ChartDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);

  const chartData = {
    labels: chartConfig.labels,
    datasets: chartConfig.datasets,
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Chart</h3>
        {isEditing
          ? (
            <div className="flex items-center gap-2">
              <label htmlFor="chart-type-select" className="sr-only">
                Chart type
              </label>
              <select
                id="chart-type-select"
                value={chartType}
                onChange={(e) => {
                  onChartTypeChange(e.target.value as SupportedChartType);
                  setIsEditing(false);
                }}
                className="rounded border border-gray-300 px-3 py-1 text-sm"
              >
                {CHART_TYPES.map((ct) => (
                  <option key={ct.value} value={ct.value}>
                    {ct.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded border border-gray-300 px-3 py-1 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          )
          : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 rounded bg-yellow-action px-3 py-1 text-sm font-medium text-black transition-colors hover:bg-yellow-action-hover"
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
          )}
      </div>
      <div className="relative h-80">
        <Chart
          type={chartType}
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { tooltip: { enabled: true } },
          }}
        />
      </div>
      <table className="sr-only">
        <caption>Chart data</caption>
        <thead>
          <tr>
            <th scope="col">Label</th>
            {chartConfig.datasets.map((d) => (
              <th key={d.label} scope="col">{d.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chartConfig.labels.map((label, i) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              {chartConfig.datasets.map((d) => (
                <td key={d.label}>{d.data[i]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
