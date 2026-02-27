# Plan: URL Scraping for Knowledge Sources

## Context
Knowledge sources currently only support manually typed text. This plan adds the ability to paste a URL and have the system automatically fetch and extract content from web pages to use as knowledge base entries.

## Changes

### 1. Install `cheerio` in backend
**File**: `backend/package.json`
- `npm install cheerio` (HTML parser for content extraction)

### 2. Create scraper service
**New file**: `backend/src/services/scraper.ts`
- `scrapeUrl(url)` function: validates URL, fetches HTML, extracts text with cheerio
- Strips nav/footer/script/style, finds main content area, normalizes whitespace
- 15s timeout, 50K char cap, minimum content threshold

### 3. Add backend API routes
**File**: `backend/src/api/knowledge.ts`
- `POST /v1/knowledge/scrape` — Preview: fetch URL and return extracted content without saving
- `POST /v1/knowledge/:id/refresh` — Re-fetch content from stored sourceUrl
- Modify existing `POST /v1/knowledge` to handle `sourceType: "url"` (auto-scrape if no content provided)

### 4. Update dashboard API client
**File**: `dashboard/src/lib/api.ts`
- Add `scrapeUrl(url)` function
- Add `refreshKnowledgeSource(id)` function
- Update `createKnowledgeSource` to accept `sourceUrl` param

### 5. Update dashboard knowledge page
**File**: `dashboard/src/app/knowledge/page.tsx`
- Add source type toggle (Manual / From URL) in create modal
- URL input with "Fetch Content" button that previews extracted content
- Show source URL + "Refresh" button on URL-type sources in list
- "URL" badge on URL-sourced items

## Verification
1. Run backend: `cd backend && npm run dev`
2. Run dashboard: `cd dashboard && npm run dev`
3. Create a manual knowledge source (unchanged behavior)
4. Create a URL knowledge source — paste a URL, click Fetch, confirm content, save
5. Click Refresh on a URL source to re-fetch
6. Test chat responds using scraped content
