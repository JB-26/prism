import { test, expect } from "@playwright/test";
import { mockAnalyzeApi, mockAnalyzeApiError } from "./fixtures/mock-api";
import {
  VALID_CSV,
  INVALID_TYPE_FILE,
  makeOversizedCsvFile,
} from "./fixtures/csv-files";
import { uploadAndReachDashboard } from "./fixtures/helpers";

// ---------------------------------------------------------------------------
// Upload page tests
// These tests cover the FileUpload component (upload state only).
// All tests that need a real API response mock it via page.route().
// ---------------------------------------------------------------------------

test.describe("Upload page — initial state", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display the page title and upload prompt", async ({ page }) => {
    // Assert
    await expect(page).toHaveTitle("Prism");
    await expect(
      page.getByRole("heading", { name: "Upload your CSV file" }),
    ).toBeVisible();
  });

  test("should display the site header with the Prism logo link", async ({
    page,
  }) => {
    // Assert
    const logo = page.getByRole("link", { name: "Prism" });
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute("href", "/");
  });

  test("should show a disabled Upload button when no file is selected", async ({
    page,
  }) => {
    // Assert — no file chosen yet, so the button must be disabled
    const uploadButton = page.getByRole("button", { name: "Upload" });
    await expect(uploadButton).toBeVisible();
    await expect(uploadButton).toBeDisabled();
  });

  test("should show the file label prompting the user to select a CSV", async ({
    page,
  }) => {
    // Assert
    await expect(
      page.getByText("Click to select a CSV file"),
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------

test.describe("Upload page — file selection", () => {
  test("should enable the Upload button after selecting a valid CSV file", async ({
    page,
  }) => {
    // Arrange
    await page.goto("/");
    const fileInput = page.locator('input[type="file"]');
    const uploadButton = page.getByRole("button", { name: "Upload" });

    // Act
    await fileInput.setInputFiles(VALID_CSV);

    // Assert — button becomes enabled and file name appears in the label
    await expect(uploadButton).toBeEnabled();
    await expect(page.getByText(VALID_CSV.name)).toBeVisible();
  });

  test("should show an error and keep Upload disabled for a non-CSV file type", async ({
    page,
  }) => {
    // Arrange
    await page.goto("/");
    const fileInput = page.locator('input[type="file"]');

    // Act
    await fileInput.setInputFiles(INVALID_TYPE_FILE);

    // Assert — error message shown, button stays disabled
    const errorMessage = page.locator('p[role="alert"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText("Please upload a CSV file");
    await expect(page.getByRole("button", { name: "Upload" })).toBeDisabled();
  });

  test("should show an error and keep Upload disabled for a file over 3MB", async ({
    page,
  }) => {
    // Arrange
    await page.goto("/");
    const fileInput = page.locator('input[type="file"]');
    const oversizedFile = makeOversizedCsvFile();

    // Act
    await fileInput.setInputFiles(oversizedFile);

    // Assert — size error shown, button stays disabled
    const errorMessage = page.locator('p[role="alert"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText("3MB");
    await expect(page.getByRole("button", { name: "Upload" })).toBeDisabled();
  });

  test("should clear an existing error when a new valid file is chosen", async ({
    page,
  }) => {
    // Arrange — first trigger an error with an invalid file
    await page.goto("/");
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(INVALID_TYPE_FILE);
    await expect(page.locator('p[role="alert"]')).toBeVisible();

    // Act — replace with a valid file
    await fileInput.setInputFiles(VALID_CSV);

    // Assert — error is gone and button becomes enabled
    await expect(page.locator('p[role="alert"]')).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Upload" })).toBeEnabled();
  });
});

// ---------------------------------------------------------------------------

test.describe("Upload page — upload flow", () => {
  test("should transition to the thinking state while analysis is in progress", async ({
    page,
  }) => {
    // Arrange — delay the mock response so we can observe the thinking state
    await page.route("**/api/analyze", async (route) => {
      // Hold the request open for 2s so the thinking animation is visible
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          result: {
            chartType: "bar",
            chartConfig: {
              labels: ["A"],
              datasets: [{ label: "x", data: [1] }],
            },
            summary: "Test summary",
          },
        }),
      });
    });
    await page.goto("/");
    await page.locator('input[type="file"]').setInputFiles(VALID_CSV);

    // Act
    await page.getByRole("button", { name: "Upload" }).click();

    // Assert — thinking indicator appears (ARIA role="status" on ThinkingAnimation)
    await expect(page.getByRole("status")).toBeVisible();
    // The cancel button is visible during analysis
    await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
  });

  test("should cancel an in-progress analysis and return to the upload screen", async ({
    page,
  }) => {
    // Arrange — never fulfill the request (simulates a long-running call)
    await page.route("**/api/analyze", async (_route) => {
      // Intentionally never fulfill — the test cancels before it resolves
      await new Promise((resolve) => setTimeout(resolve, 30_000));
    });
    await page.goto("/");
    await page.locator('input[type="file"]').setInputFiles(VALID_CSV);
    await page.getByRole("button", { name: "Upload" }).click();

    // Wait for thinking state
    await expect(page.getByRole("status")).toBeVisible();

    // Act
    await page.getByRole("button", { name: "Cancel" }).click();

    // Assert — back to upload state
    await expect(
      page.getByRole("heading", { name: "Upload your CSV file" }),
    ).toBeVisible();
    await expect(page.getByRole("status")).not.toBeVisible();
  });

  test("should display an error message when the API returns a failure response", async ({
    page,
  }) => {
    // Arrange
    await mockAnalyzeApiError(page, "Analysis failed due to invalid data", 500);
    await page.goto("/");
    await page.locator('input[type="file"]').setInputFiles(VALID_CSV);

    // Act
    await page.getByRole("button", { name: "Upload" }).click();

    // Assert — error is shown and we return to upload state
    const errorMessage = page.locator('p[role="alert"]');
    await expect(errorMessage).toBeVisible({ timeout: 10_000 });
    await expect(errorMessage).toContainText("Analysis failed");
    await expect(
      page.getByRole("heading", { name: "Upload your CSV file" }),
    ).toBeVisible();
  });

  test("should display a user-friendly error when the server returns 400 for empty CSV", async ({
    page,
  }) => {
    // Arrange
    await mockAnalyzeApiError(page, "CSV file appears to be empty", 400);
    await page.goto("/");
    await page.locator('input[type="file"]').setInputFiles(VALID_CSV);

    // Act
    await page.getByRole("button", { name: "Upload" }).click();

    // Assert
    await expect(page.locator('p[role="alert"]')).toContainText(
      "CSV file appears to be empty",
      { timeout: 10_000 },
    );
  });

  test("should reach the dashboard after a successful upload", async ({
    page,
  }) => {
    // Arrange
    await mockAnalyzeApi(page);
    await page.goto("/");
    await page.locator('input[type="file"]').setInputFiles(VALID_CSV);

    // Act
    await page.getByRole("button", { name: "Upload" }).click();

    // Assert — dashboard heading signals success
    await expect(
      page.getByRole("heading", { name: "Results" }),
    ).toBeVisible({ timeout: 15_000 });
  });

  test("should show thinking animation text during analysis", async ({
    page,
  }) => {
    // Arrange — hold the response open so we can observe the thinking state
    await page.route("**/api/analyze", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          result: {
            chartType: "bar",
            chartConfig: {
              labels: ["A"],
              datasets: [{ label: "x", data: [1] }],
            },
            summary: "Test summary",
          },
        }),
      });
    });
    await page.goto("/");
    await page.locator('input[type="file"]').setInputFiles(VALID_CSV);

    // Act
    await page.getByRole("button", { name: "Upload" }).click();

    // Assert — "Thinking" heading and timing hint are visible while waiting
    await expect(page.getByText("Thinking")).toBeVisible();
    await expect(page.getByText("This usually takes 5–15 seconds")).toBeVisible();
  });

  test("should send the correct CSV text and file name in the API request body", async ({
    page,
  }) => {
    // Arrange — capture the intercepted request body for inspection
    let capturedBody: { csvText?: string; fileName?: string } | null = null;
    await page.route("**/api/analyze", async (route) => {
      const body = route.request().postDataJSON() as {
        csvText?: string;
        fileName?: string;
      };
      capturedBody = body;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          result: {
            chartType: "bar",
            chartConfig: {
              labels: ["A"],
              datasets: [{ label: "x", data: [1] }],
            },
            summary: "Test summary",
          },
        }),
      });
    });
    await page.goto("/");
    await page.locator('input[type="file"]').setInputFiles(VALID_CSV);

    // Act
    await page.getByRole("button", { name: "Upload" }).click();
    await page.getByRole("heading", { name: "Results" }).waitFor({
      state: "visible",
      timeout: 15_000,
    });

    // Assert — the API received the file name and non-empty CSV text
    expect(capturedBody).not.toBeNull();
    expect(capturedBody!.fileName).toBe(VALID_CSV.name);
    expect(capturedBody!.csvText).toContain("Month,Sales");
  });

  test("should display an error when the network request itself fails", async ({
    page,
  }) => {
    // Arrange — abort the request to simulate a network failure (e.g., offline)
    await page.route("**/api/analyze", async (route) => {
      await route.abort("failed");
    });
    await page.goto("/");
    await page.locator('input[type="file"]').setInputFiles(VALID_CSV);

    // Act
    await page.getByRole("button", { name: "Upload" }).click();

    // Assert — an error message appears and the upload page is shown again
    const errorMessage = page.locator('p[role="alert"]');
    await expect(errorMessage).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByRole("heading", { name: "Upload your CSV file" }),
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------

test.describe("Upload page — re-upload after delete", () => {
  test("should allow a new file to be uploaded after deleting results", async ({
    page,
  }) => {
    // Arrange — reach the dashboard first
    await uploadAndReachDashboard(page);

    // Delete the current result
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Confirm" }).click();
    await expect(
      page.getByRole("heading", { name: "Upload your CSV file" }),
    ).toBeVisible();

    // Set up the mock again for the second upload
    await mockAnalyzeApi(page);

    // Act — upload a new file
    await page.locator('input[type="file"]').setInputFiles(VALID_CSV);
    await expect(page.getByRole("button", { name: "Upload" })).toBeEnabled();
    await page.getByRole("button", { name: "Upload" }).click();

    // Assert — dashboard appears again
    await expect(
      page.getByRole("heading", { name: "Results" }),
    ).toBeVisible({ timeout: 15_000 });
  });
});

// ---------------------------------------------------------------------------

test.describe("Upload page — oversized file recovery", () => {
  test("should clear an oversized-file error when a valid file is chosen next", async ({
    page,
  }) => {
    // Arrange — trigger the size error
    await page.goto("/");
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(makeOversizedCsvFile());
    await expect(page.locator('p[role="alert"]')).toBeVisible();

    // Act — replace with a valid file
    await fileInput.setInputFiles(VALID_CSV);

    // Assert — error disappears and upload button becomes enabled
    await expect(page.locator('p[role="alert"]')).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Upload" })).toBeEnabled();
  });
});
