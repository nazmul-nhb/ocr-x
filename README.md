# OCR X

> OCR image and PDF documents in the browser using Google Cloud Vision.

## Setup

This app has no Node.js server. It calls the Vision REST API from the browser, so use a browser-restricted Google Cloud API key with the Vision API enabled.

The app uses the configured key automatically. If the key is missing, rejected, or has reached its quota, the replacement-key dialog appears. You can also create a local `.env` file:

```bash
VITE_GOOGLE_VISION_API_KEY=your_browser_restricted_key
```

Replacement keys are saved in local storage only when entered through the app. For production, restrict the key to the deployed site origin and to the Cloud Vision API.

PDFs are rendered page-by-page with the locally bundled, typed `pdfjs-dist` package and sent to Vision sequentially. Progress is estimated from the file size, browser network speed, and completed pages.

Completed extractions are saved as filename + extracted text in IndexedDB through `locality-idb`; the original files are never stored. The interface includes persistent light/dark mode, editable extracted text, query-string tabs, and single/all history deletion.

## Commands

```bash
pnpm dev
pnpm build
```
