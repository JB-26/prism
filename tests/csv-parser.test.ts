/// <reference lib="deno.ns" />
import { assertEquals } from "@std/assert";

// Inline CSV parser for Deno tests (avoids Next.js path alias issues)
interface ParsedCSV {
  headers: string[];
  rows: string[][];
}

function parseCSV(text: string): ParsedCSV {
  const lines = splitLines(text);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
}

function splitLines(text: string): string[] {
  const lines: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      current += char;
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && text[i + 1] === "\n") i++;
      if (current.trim().length > 0) lines.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim().length > 0) lines.push(current);
  return lines;
}

function parseLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        fields.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

Deno.test("parses simple CSV", () => {
  const csv = "Name,Age\nAlice,30\nBob,25";
  const result = parseCSV(csv);
  assertEquals(result.headers, ["Name", "Age"]);
  assertEquals(result.rows, [["Alice", "30"], ["Bob", "25"]]);
});

Deno.test("handles quoted fields", () => {
  const csv = 'Name,City\n"Alice","New York"';
  const result = parseCSV(csv);
  assertEquals(result.rows[0], ["Alice", "New York"]);
});

Deno.test("handles escaped quotes", () => {
  const csv = 'Name,Quote\nAlice,"She said ""hello"""';
  const result = parseCSV(csv);
  assertEquals(result.rows[0], ["Alice", 'She said "hello"']);
});

Deno.test("handles empty CSV", () => {
  const result = parseCSV("");
  assertEquals(result.headers, []);
  assertEquals(result.rows, []);
});

Deno.test("handles CRLF line endings", () => {
  const csv = "A,B\r\n1,2\r\n3,4";
  const result = parseCSV(csv);
  assertEquals(result.headers, ["A", "B"]);
  assertEquals(result.rows, [["1", "2"], ["3", "4"]]);
});

Deno.test("handles commas inside quoted fields", () => {
  const csv = 'Name,Address\nAlice,"123 Main St, Apt 4"';
  const result = parseCSV(csv);
  assertEquals(result.rows[0], ["Alice", "123 Main St, Apt 4"]);
});

Deno.test("handles single row CSV (headers only)", () => {
  const csv = "Name,Age,City";
  const result = parseCSV(csv);
  assertEquals(result.headers, ["Name", "Age", "City"]);
  assertEquals(result.rows, []);
});

// Edge case tests

Deno.test("drops whitespace-only rows", () => {
  const csv = "A,B\n   \n1,2";
  const result = parseCSV(csv);
  // Whitespace-only row is dropped by splitLines
  assertEquals(result.rows.length, 1);
  assertEquals(result.rows[0], ["1", "2"]);
});

Deno.test("handles mismatched column counts", () => {
  const csv = "A,B\n1,2,3\n4";
  const result = parseCSV(csv);
  assertEquals(result.headers, ["A", "B"]);
  assertEquals(result.rows[0], ["1", "2", "3"]);
  assertEquals(result.rows[1], ["4"]);
});

Deno.test("handles unicode in headers and values", () => {
  const csv = "名前,年齢\n太郎,30";
  const result = parseCSV(csv);
  assertEquals(result.headers, ["名前", "年齢"]);
  assertEquals(result.rows[0], ["太郎", "30"]);
});

Deno.test("handles quoted field with embedded newline", () => {
  const csv = 'Name,Bio\n"Alice","She\nlikes code"';
  const result = parseCSV(csv);
  assertEquals(result.rows[0][0], "Alice");
  assertEquals(result.rows[0][1], "She\nlikes code");
});

Deno.test("handles single column CSV", () => {
  const csv = "Name\nAlice\nBob";
  const result = parseCSV(csv);
  assertEquals(result.headers, ["Name"]);
  assertEquals(result.rows, [["Alice"], ["Bob"]]);
});

Deno.test("handles very long single field without error", () => {
  const longValue = "x".repeat(10001);
  const csv = `A\n${longValue}`;
  const result = parseCSV(csv);
  assertEquals(result.rows[0][0], longValue);
});
