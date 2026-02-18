import { test, expect } from "@playwright/test";
import { uploadAndReachDashboard } from "./fixtures/helpers";
import { MOCK_ANALYSIS_RESULT } from "./fixtures/mock-api";

// ---------------------------------------------------------------------------
// Dashboard tests
// Every test in this file starts from the dashboard state by calling the
// shared helper, which mocks the API and completes the upload flow.
// ---------------------------------------------------------------------------

test.describe("Dashboard — chart display", () => {
  test("should display the Results heading and chart panel after upload", async ({
    page,
  }) => {
    // Arrange + Act
    await uploadAndReachDashboard(page);

    // Assert
    await expect(page.getByRole("heading", { name: "Results" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Chart" })).toBeVisible();
  });

  test("should render a canvas element for the Chart.js chart", async ({
    page,
  }) => {
    // Arrange + Act
    await uploadAndReachDashboard(page);

    // Assert — Chart.js renders a <canvas> element
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible();
  });

  test("should render an accessible data table that mirrors chart labels", async ({
    page,
  }) => {
    // Arrange + Act
    await uploadAndReachDashboard(page);

    // The sr-only <table> in ChartDisplay contains all chart labels.
    // The table is in the DOM even if visually hidden — we can assert on it.
    const table = page.getByRole("table", { name: "Chart data" });
    await expect(table).toBeAttached();

    // Verify the first label from the mock result appears as a row header
    const firstLabel = MOCK_ANALYSIS_RESULT.result.chartConfig.labels[0];
    await expect(
      page.getByRole("rowheader", { name: firstLabel }),
    ).toBeAttached();
  });
});

// ---------------------------------------------------------------------------

test.describe("Dashboard — chart type editing", () => {
  test("should show the Edit button for chart type in the default state", async ({
    page,
  }) => {
    // Arrange + Act
    await uploadAndReachDashboard(page);

    // Assert — there are two Edit buttons (chart + summary). We scope to the
    // chart panel using its heading.
    const chartPanel = page.locator(".rounded-lg", {
      has: page.getByRole("heading", { name: "Chart" }),
    });
    await expect(chartPanel.getByRole("button", { name: "Edit" })).toBeVisible();
  });

  test("should reveal the chart-type dropdown when Edit is clicked", async ({
    page,
  }) => {
    // Arrange
    await uploadAndReachDashboard(page);
    const chartPanel = page.locator(".rounded-lg", {
      has: page.getByRole("heading", { name: "Chart" }),
    });

    // Act
    await chartPanel.getByRole("button", { name: "Edit" }).click();

    // Assert — the select and a Cancel button appear
    const select = page.getByRole("combobox", { name: "Chart type" });
    await expect(select).toBeVisible();
    await expect(
      chartPanel.getByRole("button", { name: "Cancel" }),
    ).toBeVisible();
  });

  test("should list all supported chart types in the dropdown", async ({
    page,
  }) => {
    // Arrange
    await uploadAndReachDashboard(page);
    const chartPanel = page.locator(".rounded-lg", {
      has: page.getByRole("heading", { name: "Chart" }),
    });
    await chartPanel.getByRole("button", { name: "Edit" }).click();

    // Assert — all six chart types must appear as options
    const select = page.getByRole("combobox", { name: "Chart type" });
    const expectedOptions = [
      "Bar Chart",
      "Line Chart",
      "Pie Chart",
      "Doughnut Chart",
      "Polar Area Chart",
      "Radar Chart",
    ];
    for (const option of expectedOptions) {
      await expect(select.getByRole("option", { name: option })).toBeAttached();
    }
  });

  test("should change the chart type when a new option is selected", async ({
    page,
  }) => {
    // Arrange
    await uploadAndReachDashboard(page);
    const chartPanel = page.locator(".rounded-lg", {
      has: page.getByRole("heading", { name: "Chart" }),
    });
    await chartPanel.getByRole("button", { name: "Edit" }).click();

    // Act — switch from "bar" (default) to "Line Chart"
    await page
      .getByRole("combobox", { name: "Chart type" })
      .selectOption("line");

    // Assert — the dropdown closes (editing mode exits on selection)
    // and the Edit button re-appears, confirming the state reset
    await expect(
      chartPanel.getByRole("button", { name: "Edit" }),
    ).toBeVisible();
    // The dropdown should no longer be visible
    await expect(
      page.getByRole("combobox", { name: "Chart type" }),
    ).not.toBeVisible();
  });

  test("should cancel chart type editing without changing the chart", async ({
    page,
  }) => {
    // Arrange
    await uploadAndReachDashboard(page);
    const chartPanel = page.locator(".rounded-lg", {
      has: page.getByRole("heading", { name: "Chart" }),
    });
    await chartPanel.getByRole("button", { name: "Edit" }).click();

    // Act — click Cancel without picking a new option
    await chartPanel.getByRole("button", { name: "Cancel" }).click();

    // Assert — editing UI is gone, Edit button is back
    await expect(
      page.getByRole("combobox", { name: "Chart type" }),
    ).not.toBeVisible();
    await expect(
      chartPanel.getByRole("button", { name: "Edit" }),
    ).toBeVisible();
  });
});

// ---------------------------------------------------------------------------

test.describe("Dashboard — executive summary editing", () => {
  test("should display the executive summary text from the analysis result", async ({
    page,
  }) => {
    // Arrange + Act
    await uploadAndReachDashboard(page);

    // Assert — the mock summary text is visible in the panel
    const expectedSummaryFragment =
      "Sales data shows strong performance in March";
    await expect(page.getByText(expectedSummaryFragment)).toBeVisible();
  });

  test("should show the Edit button on the Executive Summary panel", async ({
    page,
  }) => {
    // Arrange + Act
    await uploadAndReachDashboard(page);

    const summaryPanel = page.locator(".rounded-lg", {
      has: page.getByRole("heading", { name: "Executive Summary" }),
    });

    // Assert
    await expect(
      summaryPanel.getByRole("button", { name: "Edit" }),
    ).toBeVisible();
  });

  test("should open a textarea pre-filled with the summary when Edit is clicked", async ({
    page,
  }) => {
    // Arrange
    await uploadAndReachDashboard(page);
    const summaryPanel = page.locator(".rounded-lg", {
      has: page.getByRole("heading", { name: "Executive Summary" }),
    });

    // Act
    await summaryPanel.getByRole("button", { name: "Edit" }).click();

    // Assert — textarea appears with the existing summary text
    const textarea = page.getByRole("textbox", { name: "Executive Summary" });
    await expect(textarea).toBeVisible();
    await expect(textarea).toHaveValue(
      /Sales data shows strong performance in March/,
    );

    // The Save button replaces Edit
    await expect(
      summaryPanel.getByRole("button", { name: "Save" }),
    ).toBeVisible();
  });

  test("should save the edited summary and display the updated text", async ({
    page,
  }) => {
    // Arrange
    await uploadAndReachDashboard(page);
    const summaryPanel = page.locator(".rounded-lg", {
      has: page.getByRole("heading", { name: "Executive Summary" }),
    });
    await summaryPanel.getByRole("button", { name: "Edit" }).click();

    const textarea = page.getByRole("textbox", { name: "Executive Summary" });
    const newSummary = "Updated summary text for testing purposes.";

    // Act — clear the textarea and type a new summary
    await textarea.fill(newSummary);
    await summaryPanel.getByRole("button", { name: "Save" }).click();

    // Assert — edit mode closes and new text is displayed
    await expect(textarea).not.toBeVisible();
    await expect(page.getByText(newSummary)).toBeVisible();
    await expect(
      summaryPanel.getByRole("button", { name: "Edit" }),
    ).toBeVisible();
  });

  test("should preserve edited summary text through multiple edits", async ({
    page,
  }) => {
    // Arrange
    await uploadAndReachDashboard(page);
    const summaryPanel = page.locator(".rounded-lg", {
      has: page.getByRole("heading", { name: "Executive Summary" }),
    });

    // First edit
    await summaryPanel.getByRole("button", { name: "Edit" }).click();
    await page
      .getByRole("textbox", { name: "Executive Summary" })
      .fill("First edit.");
    await summaryPanel.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("First edit.")).toBeVisible();

    // Second edit
    await summaryPanel.getByRole("button", { name: "Edit" }).click();
    await page
      .getByRole("textbox", { name: "Executive Summary" })
      .fill("Second edit.");
    await summaryPanel.getByRole("button", { name: "Save" }).click();

    // Assert — second edit persists, first edit is gone
    await expect(page.getByText("Second edit.")).toBeVisible();
    await expect(page.getByText("First edit.")).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------

test.describe("Dashboard — delete flow", () => {
  test("should show a Delete button on the dashboard", async ({ page }) => {
    // Arrange + Act
    await uploadAndReachDashboard(page);

    // Assert
    await expect(page.getByRole("button", { name: "Delete" })).toBeVisible();
  });

  test("should show a confirmation dialog when Delete is clicked", async ({
    page,
  }) => {
    // Arrange
    await uploadAndReachDashboard(page);

    // Act
    await page.getByRole("button", { name: "Delete" }).click();

    // Assert — "Are you sure?" prompt with Confirm and Cancel buttons
    await expect(page.getByText("Are you sure?")).toBeVisible();
    await expect(page.getByRole("button", { name: "Confirm" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
  });

  test("should hide the Delete button while the confirmation prompt is visible", async ({
    page,
  }) => {
    // Arrange
    await uploadAndReachDashboard(page);

    // Act
    await page.getByRole("button", { name: "Delete" }).click();

    // Assert — the original Delete button is replaced by the confirmation UI;
    // only "Confirm" and "Cancel" are present (not a second "Delete").
    await expect(page.getByText("Are you sure?")).toBeVisible();
    // The delete button SVG/icon button is gone; we expect exactly zero buttons
    // with the accessible name "Delete" (Confirm/Cancel replace it).
    await expect(page.getByRole("button", { name: "Delete" })).not.toBeVisible();
  });

  test("should cancel the delete and remain on the dashboard", async ({
    page,
  }) => {
    // Arrange
    await uploadAndReachDashboard(page);
    await page.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText("Are you sure?")).toBeVisible();

    // Act
    await page.getByRole("button", { name: "Cancel" }).click();

    // Assert — confirmation gone, dashboard still shown
    await expect(page.getByText("Are you sure?")).not.toBeVisible();
    await expect(page.getByRole("heading", { name: "Results" })).toBeVisible();
  });

  test("should restore the Delete button after cancelling the confirmation", async ({
    page,
  }) => {
    // Arrange
    await uploadAndReachDashboard(page);
    await page.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText("Are you sure?")).toBeVisible();

    // Act — cancel the confirmation
    await page.getByRole("button", { name: "Cancel" }).click();

    // Assert — the original Delete button is visible again
    await expect(page.getByRole("button", { name: "Delete" })).toBeVisible();
  });

  test("should return to the upload screen after confirming delete", async ({
    page,
  }) => {
    // Arrange
    await uploadAndReachDashboard(page);
    await page.getByRole("button", { name: "Delete" }).click();

    // Act
    await page.getByRole("button", { name: "Confirm" }).click();

    // Assert — back to the upload page
    await expect(
      page.getByRole("heading", { name: "Upload your CSV file" }),
    ).toBeVisible();
    // Upload button should be disabled (no file selected)
    await expect(page.getByRole("button", { name: "Upload" })).toBeDisabled();
  });
});

// ---------------------------------------------------------------------------

test.describe("Dashboard — chart type dropdown pre-selection", () => {
  test("should pre-select the current chart type in the dropdown when Edit is opened", async ({
    page,
  }) => {
    // Arrange — the mock result uses "bar" as the initial chart type
    await uploadAndReachDashboard(page);
    const chartPanel = page.locator(".rounded-lg", {
      has: page.getByRole("heading", { name: "Chart" }),
    });

    // Act
    await chartPanel.getByRole("button", { name: "Edit" }).click();

    // Assert — the dropdown's selected value matches the current chart type
    const select = page.getByRole("combobox", { name: "Chart type" });
    await expect(select).toHaveValue("bar");
  });

  test("should update the dropdown pre-selection after a chart type change", async ({
    page,
  }) => {
    // Arrange — change the chart type to "line" first
    await uploadAndReachDashboard(page);
    const chartPanel = page.locator(".rounded-lg", {
      has: page.getByRole("heading", { name: "Chart" }),
    });
    await chartPanel.getByRole("button", { name: "Edit" }).click();
    await page.getByRole("combobox", { name: "Chart type" }).selectOption("line");
    // Edit mode closes after selection
    await expect(chartPanel.getByRole("button", { name: "Edit" })).toBeVisible();

    // Act — re-open edit mode
    await chartPanel.getByRole("button", { name: "Edit" }).click();

    // Assert — the dropdown now pre-selects "line"
    await expect(page.getByRole("combobox", { name: "Chart type" })).toHaveValue(
      "line",
    );
  });
});

// ---------------------------------------------------------------------------

test.describe("Dashboard — executive summary edge cases", () => {
  test("should allow saving an empty summary without error", async ({
    page,
  }) => {
    // Arrange
    await uploadAndReachDashboard(page);
    const summaryPanel = page.locator(".rounded-lg", {
      has: page.getByRole("heading", { name: "Executive Summary" }),
    });
    await summaryPanel.getByRole("button", { name: "Edit" }).click();

    // Act — clear all text and save
    await page.getByRole("textbox", { name: "Executive Summary" }).fill("");
    await summaryPanel.getByRole("button", { name: "Save" }).click();

    // Assert — edit mode closes without an error; the panel is still shown
    await expect(
      page.getByRole("textbox", { name: "Executive Summary" }),
    ).not.toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Executive Summary" }),
    ).toBeVisible();
    await expect(
      summaryPanel.getByRole("button", { name: "Edit" }),
    ).toBeVisible();
  });

  test("should re-populate textarea with current summary each time Edit is opened", async ({
    page,
  }) => {
    // Arrange — edit once and save a custom value
    await uploadAndReachDashboard(page);
    const summaryPanel = page.locator(".rounded-lg", {
      has: page.getByRole("heading", { name: "Executive Summary" }),
    });
    await summaryPanel.getByRole("button", { name: "Edit" }).click();
    await page
      .getByRole("textbox", { name: "Executive Summary" })
      .fill("Saved custom text.");
    await summaryPanel.getByRole("button", { name: "Save" }).click();

    // Act — open Edit again
    await summaryPanel.getByRole("button", { name: "Edit" }).click();

    // Assert — the textarea contains the previously saved value
    await expect(
      page.getByRole("textbox", { name: "Executive Summary" }),
    ).toHaveValue("Saved custom text.");
  });
});
