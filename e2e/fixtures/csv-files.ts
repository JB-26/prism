/**
 * In-memory CSV file fixtures for use with Playwright's setInputFiles().
 *
 * Using in-memory buffers means no fixture files need to be committed to the
 * repo and tests are fully self-contained.
 */

/** A minimal valid CSV with a header row and five data rows. */
export const VALID_CSV = {
  name: "sales-data.csv",
  mimeType: "text/csv",
  buffer: Buffer.from(
    "Month,Sales\nJanuary,120\nFebruary,85\nMarch,200\nApril,175\nMay,140",
    "utf-8",
  ),
};

/**
 * A CSV whose name has a .txt extension.
 * The file-validator rejects non-.csv extensions client-side.
 */
export const INVALID_TYPE_FILE = {
  name: "not-a-csv.txt",
  mimeType: "text/plain",
  buffer: Buffer.from("Month,Sales\nJanuary,120", "utf-8"),
};

/**
 * A CSV-named file that is 1 byte over the 3MB limit (3 * 1024 * 1024 + 1).
 * Generates the buffer at call time to keep module load fast.
 */
export function makeOversizedCsvFile() {
  const MAX_BYTES = 3 * 1024 * 1024 + 1; // 1 byte over the 3MB limit
  // Fill with repeated valid CSV content characters — still text/csv so the
  // extension check passes, but the size check fires.
  const header = "a,b\n";
  const row = "x,y\n";
  const needed = MAX_BYTES - header.length;
  const repeats = Math.ceil(needed / row.length);
  const content = header + row.repeat(repeats);
  return {
    name: "oversized.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(content.slice(0, MAX_BYTES), "utf-8"),
  };
}
