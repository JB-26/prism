# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

Prism is a "human in the loop" web application for data analytics. Users upload
CSV files, and Claude generates interactive Chart.js visualizations with
executive summaries. Users can edit chart types, modify summaries, and download
shareable HTML results.

## Tech Stack

- **Runtime:** Deno
- **Framework:** Next.js
- **Language:** TypeScript
- **AI:** Anthropic SDK (`claude-haiku-4-5-20251001`)
- **Charts:** Chart.js
- **Styling:** Tailwind CSS (black/white professional theme, desktop only)

## Development Commands

```bash
# Install dependencies
deno install

# Run development server
deno task dev

# Run all tests (Deno's native testing library)
deno test

# Run a single test file
deno test path/to/test_file.ts

# Lint
deno lint

# Format
deno fmt
```

## Architecture & Core Flow

1. User uploads CSV (restricted to CSV only, max 3MB)
2. CSV is parsed and validated
3. Claude selects appropriate chart type and generates Chart.js code
4. Claude generates an executive summary
5. Results displayed in a dashboard UI
6. User can edit chart type (dropdown) and summary text
7. User can save/download results as a shareable HTML file

## Key Constraints

- CSV-only file uploads with 3MB size limit
- API keys stored in `.env` (never committed)
- Desktop only — no mobile support
- System font stack (no custom web fonts)
- Color-coded action buttons: green (upload), yellow (edit), red (delete)
