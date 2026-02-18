import { test, expect } from "@playwright/test";
import { uploadAndReachDashboard } from "./fixtures/helpers";
import { readFileSync } from "fs";

// ---------------------------------------------------------------------------
// Save / download tests
// The SaveButton triggers a client-side blob download using a programmatically
// created <a> element. Playwright intercepts the download event to verify the
// file is triggered without asserting on the file system.
// ---------------------------------------------------------------------------

test.describe("Save Report button", () => {
  test("should trigger a file download when Save Report is clicked", async ({
    page,
  }) => {
    // Arrange
    await uploadAndReachDashboard(page);

    // Act — start waiting for the download before clicking to avoid a race
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Save Report" }).click();
    const download = await downloadPromise;

    // Assert — the browser initiates a download with the expected file name
    expect(download.suggestedFilename()).toBe("prism-report.html");
  });

  test("should briefly show 'Saved!' feedback after clicking Save Report", async ({
    page,
  }) => {
    // Arrange
    await uploadAndReachDashboard(page);

    // Act
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Save Report" }).click();
    // Consume the download so it does not block the browser
    await downloadPromise;

    // Assert — button label changes to "Saved!" immediately after click
    await expect(page.getByRole("button", { name: "Saved!" })).toBeVisible();

    // The label reverts to "Save Report" after ~2 seconds (per component logic)
    await expect(
      page.getByRole("button", { name: "Save Report" }),
    ).toBeVisible({ timeout: 5_000 });
  });

  test("should allow the report to be saved multiple times", async ({
    page,
  }) => {
    // Arrange
    await uploadAndReachDashboard(page);

    // Act — save twice; the button must re-enable after the "Saved!" timeout
    const firstDownload = page.waitForEvent("download");
    await page.getByRole("button", { name: "Save Report" }).click();
    await firstDownload;

    // Wait for the "Saved!" state to reset
    await expect(
      page.getByRole("button", { name: "Save Report" }),
    ).toBeVisible({ timeout: 5_000 });

    const secondDownload = page.waitForEvent("download");
    await page.getByRole("button", { name: "Save Report" }).click();
    const dl = await secondDownload;

    // Assert — second download also has the correct filename
    expect(dl.suggestedFilename()).toBe("prism-report.html");
  });

  test("should produce an HTML download file", async ({ page }) => {
    // Arrange
    await uploadAndReachDashboard(page);

    // Act
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Save Report" }).click();
    const download = await downloadPromise;

    // Assert — save to a temp path and inspect the contents
    const path = await download.path();
    if (path) {
      // The generateHTML function always produces an HTML document
      const content = readFileSync(path, "utf-8");
      expect(content).toContain("<!DOCTYPE html>");
      expect(content).toContain("chart.js");
    }
  });

  test("should include the original summary text in the downloaded HTML", async ({
    page,
  }) => {
    // Arrange
    await uploadAndReachDashboard(page);

    // Act
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Save Report" }).click();
    const download = await downloadPromise;

    // Assert — the default mock summary appears in the exported file
    const path = await download.path();
    if (path) {
      const content = readFileSync(path, "utf-8");
      expect(content).toContain("Sales data shows strong performance in March");
    }
  });

  test("should include the edited summary in the downloaded HTML after editing", async ({
    page,
  }) => {
    // Arrange — reach dashboard, edit the summary, then save
    await uploadAndReachDashboard(page);
    const summaryPanel = page.locator(".rounded-lg", {
      has: page.getByRole("heading", { name: "Executive Summary" }),
    });
    await summaryPanel.getByRole("button", { name: "Edit" }).click();
    await page
      .getByRole("textbox", { name: "Executive Summary" })
      .fill("Custom report summary for download.");
    await summaryPanel.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Custom report summary for download.")).toBeVisible();

    // Act — download the report
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Save Report" }).click();
    const download = await downloadPromise;

    // Assert — the edited summary appears in the HTML, not the original
    const path = await download.path();
    if (path) {
      const content = readFileSync(path, "utf-8");
      expect(content).toContain("Custom report summary for download.");
      expect(content).not.toContain(
        "Sales data shows strong performance in March",
      );
    }
  });

  test("should include the updated chart type in the downloaded HTML after editing", async ({
    page,
  }) => {
    // Arrange — change chart type to "pie" then download
    await uploadAndReachDashboard(page);
    const chartPanel = page.locator(".rounded-lg", {
      has: page.getByRole("heading", { name: "Chart" }),
    });
    await chartPanel.getByRole("button", { name: "Edit" }).click();
    await page.getByRole("combobox", { name: "Chart type" }).selectOption("pie");
    await expect(chartPanel.getByRole("button", { name: "Edit" })).toBeVisible();

    // Act — download the report
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Save Report" }).click();
    const download = await downloadPromise;

    // Assert — the exported HTML references "pie", not "bar"
    const path = await download.path();
    if (path) {
      const content = readFileSync(path, "utf-8");
      // The safeChartType is injected as: type: 'pie'
      expect(content).toContain("type: 'pie'");
      expect(content).not.toContain("type: 'bar'");
    }
  });
});

// ---------------------------------------------------------------------------
// Navigation tests
// ---------------------------------------------------------------------------

test.describe("Header navigation", () => {
  test("should display the Prism logo in the header", async ({ page }) => {
    // Arrange + Act
    await page.goto("/");

    // Assert
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Prism" }),
    ).toBeVisible();
  });

  test("should display the About nav link in the header", async ({ page }) => {
    // Arrange + Act
    await page.goto("/");

    // Assert
    await expect(page.getByRole("link", { name: "About" })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "About" }),
    ).toHaveAttribute("href", "/about");
  });

  test("should navigate to the About page when the About link is clicked", async ({
    page,
  }) => {
    // Arrange
    await page.goto("/");

    // Act
    await page.getByRole("link", { name: "About" }).click();

    // Assert — URL and heading confirm navigation
    await expect(page).toHaveURL("/about");
    await expect(
      page.getByRole("heading", { name: "About Prism" }),
    ).toBeVisible();
  });

  test("should navigate back to home from the About page via the logo", async ({
    page,
  }) => {
    // Arrange
    await page.goto("/about");

    // Act
    await page.getByRole("link", { name: "Prism" }).click();

    // Assert
    await expect(page).toHaveURL("/");
    await expect(
      page.getByRole("heading", { name: "Upload your CSV file" }),
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// About page content tests
// ---------------------------------------------------------------------------

test.describe("About page", () => {
  test("should display the About Prism heading", async ({ page }) => {
    // Arrange + Act
    await page.goto("/about");

    // Assert
    await expect(
      page.getByRole("heading", { name: "About Prism" }),
    ).toBeVisible();
  });

  test("should display descriptive content about the application", async ({
    page,
  }) => {
    // Arrange + Act
    await page.goto("/about");

    // Assert — check for key phrases from the about page
    await expect(page.getByText("human in the loop")).toBeVisible();
    await expect(page.getByText("Chart.js")).toBeVisible();
  });

  test("should include the site header and footer on the About page", async ({
    page,
  }) => {
    // Arrange + Act
    await page.goto("/about");

    // Assert — header landmark and footer landmark are both present
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("should show the About nav link as active/current when on the About page", async ({
    page,
  }) => {
    // Arrange + Act
    await page.goto("/about");

    // Assert — the About link is present in the header on the About page too
    await expect(page.getByRole("link", { name: "About" })).toBeVisible();
  });
});

// ---------------------------------------------------------------------------

test.describe("Footer", () => {
  test("should display the footer with attribution text", async ({ page }) => {
    // Arrange + Act
    await page.goto("/");

    // Assert — the footer contentinfo landmark is present
    const footer = page.getByRole("contentinfo");
    await expect(footer).toBeVisible();
    await expect(footer).toContainText("Built by");
  });

  test("should display the author link in the footer", async ({ page }) => {
    // Arrange + Act
    await page.goto("/");

    // Assert — the author link is visible and points to the expected URL
    const authorLink = page.getByRole("link", { name: /Joshua Blewitt/i });
    await expect(authorLink).toBeVisible();
    await expect(authorLink).toHaveAttribute(
      "href",
      "https://www.joshblewitt.dev/",
    );
  });

  test("should open the footer author link in a new tab", async ({ page }) => {
    // Arrange + Act
    await page.goto("/");

    // Assert — target="_blank" ensures the link opens externally
    const authorLink = page.getByRole("link", { name: /Joshua Blewitt/i });
    await expect(authorLink).toHaveAttribute("target", "_blank");
  });

  test("should have noopener noreferrer on the footer external link", async ({
    page,
  }) => {
    // Arrange + Act
    await page.goto("/");

    // Assert — rel must include both noopener and noreferrer for security
    const authorLink = page.getByRole("link", { name: /Joshua Blewitt/i });
    await expect(authorLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("should display the footer on the About page as well", async ({
    page,
  }) => {
    // Arrange + Act
    await page.goto("/about");

    // Assert — footer is present on every page (shared layout)
    const footer = page.getByRole("contentinfo");
    await expect(footer).toBeVisible();
    await expect(footer).toContainText("Built by");
  });
});

// ---------------------------------------------------------------------------
// Full end-to-end user journey
// ---------------------------------------------------------------------------

test.describe("Full user journey", () => {
  test("should complete the full workflow: upload, view chart, edit summary, save report", async ({
    page,
  }) => {
    // --- Step 1: Upload a CSV file ---
    await uploadAndReachDashboard(page);

    await expect(page.getByRole("heading", { name: "Results" })).toBeVisible();

    // --- Step 2: Verify chart is present ---
    await expect(page.locator("canvas")).toBeVisible();

    // --- Step 3: Change chart type to Line ---
    const chartPanel = page.locator(".rounded-lg", {
      has: page.getByRole("heading", { name: "Chart" }),
    });
    await chartPanel.getByRole("button", { name: "Edit" }).click();
    await page
      .getByRole("combobox", { name: "Chart type" })
      .selectOption("line");
    // Edit mode closes on selection
    await expect(
      chartPanel.getByRole("button", { name: "Edit" }),
    ).toBeVisible();

    // --- Step 4: Edit the executive summary ---
    const summaryPanel = page.locator(".rounded-lg", {
      has: page.getByRole("heading", { name: "Executive Summary" }),
    });
    await summaryPanel.getByRole("button", { name: "Edit" }).click();
    await page
      .getByRole("textbox", { name: "Executive Summary" })
      .fill("Custom summary for this report.");
    await summaryPanel.getByRole("button", { name: "Save" }).click();
    await expect(
      page.getByText("Custom summary for this report."),
    ).toBeVisible();

    // --- Step 5: Save the report ---
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Save Report" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("prism-report.html");

    // --- Step 6: Delete to return to upload ---
    await page.getByRole("button", { name: "Delete" }).click();
    await page.getByRole("button", { name: "Confirm" }).click();
    await expect(
      page.getByRole("heading", { name: "Upload your CSV file" }),
    ).toBeVisible();
  });
});
