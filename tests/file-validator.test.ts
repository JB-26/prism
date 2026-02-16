/// <reference lib="deno.ns" />
import { assertEquals } from "@std/assert";

// Inline implementation since Deno tests can't use Next.js path aliases
function validateFile(file: { name: string; type: string; size: number }) {
  const MAX_FILE_SIZE = 3 * 1024 * 1024;
  const ALLOWED_MIME_TYPES = [
    "text/csv",
    "application/vnd.ms-excel",
    "text/plain",
  ];

  if (!file.name.toLowerCase().endsWith(".csv")) {
    return { valid: false, error: "Please upload a CSV file." };
  }

  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: "Please upload a CSV file." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "File must be 3MB or less." };
  }

  return { valid: true };
}

Deno.test("validates a valid CSV file", () => {
  const result = validateFile({
    name: "data.csv",
    type: "text/csv",
    size: 1024,
  });
  assertEquals(result.valid, true);
  assertEquals(result.error, undefined);
});

Deno.test("rejects non-CSV file extension", () => {
  const result = validateFile({
    name: "data.md",
    type: "text/plain",
    size: 1024,
  });
  assertEquals(result.valid, false);
  assertEquals(result.error, "Please upload a CSV file.");
});

Deno.test("rejects file larger than 3MB", () => {
  const result = validateFile({
    name: "big.csv",
    type: "text/csv",
    size: 4 * 1024 * 1024,
  });
  assertEquals(result.valid, false);
  assertEquals(result.error, "File must be 3MB or less.");
});

Deno.test("accepts CSV with empty MIME type", () => {
  const result = validateFile({
    name: "data.csv",
    type: "",
    size: 500,
  });
  assertEquals(result.valid, true);
});

Deno.test("rejects invalid MIME type", () => {
  const result = validateFile({
    name: "data.csv",
    type: "application/json",
    size: 500,
  });
  assertEquals(result.valid, false);
  assertEquals(result.error, "Please upload a CSV file.");
});

Deno.test("accepts file at exactly 3MB", () => {
  const result = validateFile({
    name: "exact.csv",
    type: "text/csv",
    size: 3 * 1024 * 1024,
  });
  assertEquals(result.valid, true);
});

// Boundary and edge case tests

Deno.test("rejects file at 3MB + 1 byte", () => {
  const result = validateFile({
    name: "big.csv",
    type: "text/csv",
    size: 3 * 1024 * 1024 + 1,
  });
  assertEquals(result.valid, false);
  assertEquals(result.error, "File must be 3MB or less.");
});

Deno.test("accepts uppercase .CSV extension", () => {
  const result = validateFile({
    name: "data.CSV",
    type: "text/csv",
    size: 500,
  });
  assertEquals(result.valid, true);
});

Deno.test("accepts text/plain MIME with .csv extension", () => {
  const result = validateFile({
    name: "data.csv",
    type: "text/plain",
    size: 500,
  });
  assertEquals(result.valid, true);
});

Deno.test("rejects double extension data.csv.exe", () => {
  const result = validateFile({
    name: "data.csv.exe",
    type: "application/octet-stream",
    size: 500,
  });
  assertEquals(result.valid, false);
});

Deno.test("accepts zero-byte CSV file", () => {
  const result = validateFile({
    name: "empty.csv",
    type: "text/csv",
    size: 0,
  });
  assertEquals(result.valid, true);
});
