import type { ValidationResult } from "@/types";

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

const ALLOWED_MIME_TYPES = [
  "text/csv",
  "application/vnd.ms-excel",
  "text/plain",
];

export function validateFile(file: File): ValidationResult {
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
