import type { Page } from "@playwright/test";

/**
 * A deterministic AnalysisResult used as the mock payload for /api/analyze.
 * All E2E tests that need the dashboard should use this fixture so tests are
 * independent of the live Anthropic API.
 */
export const MOCK_ANALYSIS_RESULT = {
  success: true,
  result: {
    chartType: "bar",
    chartConfig: {
      labels: ["January", "February", "March", "April", "May"],
      datasets: [
        {
          label: "Sales",
          data: [120, 85, 200, 175, 140],
          backgroundColor: "rgba(59,130,246,0.6)",
          borderColor: "rgba(59,130,246,1)",
          borderWidth: 1,
        },
      ],
    },
    summary:
      "Sales data shows strong performance in March with 200 units, representing the peak of the period. " +
      "February saw the lowest performance at 85 units. " +
      "Overall trend suggests moderate growth with a notable mid-period spike.",
  },
};

/**
 * Intercepts POST /api/analyze and responds with the mock analysis result.
 * Call this before navigating to the page so the route is registered in time.
 *
 * Usage:
 *   await mockAnalyzeApi(page);
 *   await page.goto('/');
 */
export async function mockAnalyzeApi(page: Page): Promise<void> {
  await page.route("**/api/analyze", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_ANALYSIS_RESULT),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * Intercepts POST /api/analyze and responds with an API error payload.
 * Used to test the error-handling path in FileUpload.
 */
export async function mockAnalyzeApiError(
  page: Page,
  errorMessage = "Analysis failed",
  status = 500,
): Promise<void> {
  await page.route("**/api/analyze", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify({ success: false, error: errorMessage }),
      });
    } else {
      await route.continue();
    }
  });
}
