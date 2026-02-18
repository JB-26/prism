import type { Page } from "@playwright/test";
import { mockAnalyzeApi } from "./mock-api";
import { VALID_CSV } from "./csv-files";

/**
 * Performs the full upload flow and waits for the dashboard to appear.
 * This is the shared helper for any test that needs to start from the
 * dashboard state rather than the upload state.
 *
 * Arranges the mock API intercept, navigates home, selects the valid CSV,
 * clicks Upload, and awaits the "Results" heading that signals the dashboard.
 */
export async function uploadAndReachDashboard(page: Page): Promise<void> {
  await mockAnalyzeApi(page);
  await page.goto("/");

  // Select the valid CSV file via the hidden input
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(VALID_CSV);

  // The Upload button becomes enabled once a valid file is selected
  await page.getByRole("button", { name: "Upload" }).click();

  // Wait for the dashboard heading to confirm we left the "thinking" state
  await page.getByRole("heading", { name: "Results" }).waitFor({
    state: "visible",
    timeout: 15_000,
  });
}
