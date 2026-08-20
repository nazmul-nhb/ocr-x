import type { PDFDocumentProxy } from 'pdfjs-dist';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import { ACCEPTED_TYPES } from '../constants/ocr';
import type { ConnectionLike, ScanCallbacks } from '../types/ocr';

const pdfWorkerUrl = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();

export class VisionApiError extends Error {
	readonly kind: 'auth' | 'limit' | 'network' | 'generic';

	constructor(message: string, kind: VisionApiError['kind'] = 'generic') {
		super(message);
		this.name = 'VisionApiError';
		this.kind = kind;
	}
}

export function formatBytes(bytes: number) {
	return bytes < 1024 * 1024
		? `${Math.max(1, Math.round(bytes / 1024))} KB`
		: `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function fileKind(file: File) {
	return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
		? 'PDF'
		: 'IMAGE';
}

export function isAcceptedFile(file: File) {
	return ACCEPTED_TYPES.includes(file.type) || file.name.toLowerCase().endsWith('.pdf');
}

function getBase64(dataUrl: string) {
	return dataUrl.split(',')[1] ?? '';
}

function fileToDataUrl(file: File) {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () =>
			reject(new VisionApiError('Could not read that file.', 'generic'));
		reader.readAsDataURL(file);
	});
}

async function requestVision(content: string, apiKey: string) {
	if (!apiKey)
		throw new VisionApiError(
			'Google Vision needs an API key before it can read this file.',
			'auth'
		);
	let response: Response;
	try {
		response = await fetch(
			`https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(apiKey)}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					requests: [
						{ image: { content }, features: [{ type: 'DOCUMENT_TEXT_DETECTION' }] },
					],
				}),
			}
		);
	} catch {
		throw new VisionApiError(
			'The Vision API could not be reached. Check your connection and try again.',
			'network'
		);
	}

	const payload = (await response.json()) as {
		responses?: Array<{
			fullTextAnnotation?: { text?: string };
			textAnnotations?: Array<{ description?: string }>;
			error?: { message?: string };
		}>;
		error?: { message?: string };
	};
	const message =
		payload.error?.message ??
		payload.responses?.[0]?.error?.message ??
		'Vision API request failed.';
	if (!response.ok || payload.error || payload.responses?.[0]?.error) {
		const kind =
			response.status === 401 ||
			response.status === 403 ||
			/api key|credential|permission|unauthorized/i.test(message)
				? 'auth'
				: response.status === 429 || /quota|limit|rate/i.test(message)
					? 'limit'
					: 'generic';
		throw new VisionApiError(message, kind);
	}
	return (
		payload.responses?.[0]?.fullTextAnnotation?.text ??
		payload.responses?.[0]?.textAnnotations?.[0]?.description ??
		''
	);
}

async function renderPdfPages(
	file: File,
	onPage: (page: number, total: number, document: PDFDocumentProxy) => Promise<string>
) {
	GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
	const document = await getDocument({ data: await file.arrayBuffer() }).promise;
	const pageTexts: string[] = [];
	for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1)
		pageTexts.push(await onPage(pageNumber, document.numPages, document));
	return pageTexts;
}

function estimateDuration(file: File) {
	const nav = navigator as Navigator & { connection?: ConnectionLike };
	const downlink = Math.max(0.5, nav.connection?.downlink ?? 5);
	return Math.round((Math.max(1.8, file.size / (downlink * 125000)) + 4.5) * 10) / 10;
}

export function estimatedScanTime(file: File | null) {
	return file ? `~${estimateDuration(file)} sec` : '—';
}

export async function extractText(file: File, apiKey: string, callbacks: ScanCallbacks) {
	const expectedSeconds = estimateDuration(file);
	const startedAt = Date.now();
	const progressTimer = window.setInterval(() => {
		callbacks.onProgress(
			Math.min(
				91,
				Math.max(
					4,
					Math.round(((Date.now() - startedAt) / (expectedSeconds * 1000)) * 88) + 4
				)
			)
		);
	}, 250);

	try {
		if (fileKind(file) === 'IMAGE') {
			callbacks.onLabel('Reading document');
			const text = await requestVision(getBase64(await fileToDataUrl(file)), apiKey);
			callbacks.onProgress(96);
			return text.trim();
		}

		callbacks.onLabel('Scanning PDF pages');
		const pages = await renderPdfPages(file, async (pageNumber, total, pdf) => {
			callbacks.onLabel(`Reading page ${pageNumber} of ${total}`);
			const page = await pdf.getPage(pageNumber);
			const viewport = page.getViewport({ scale: 1.65 });
			const canvas = document.createElement('canvas');
			canvas.width = viewport.width;
			canvas.height = viewport.height;
			const context = canvas.getContext('2d');
			if (!context) throw new VisionApiError('Could not prepare the PDF page.');
			await page.render({ canvas, canvasContext: context, viewport }).promise;
			const text = await requestVision(
				getBase64(canvas.toDataURL('image/jpeg', 0.9)),
				apiKey
			);
			callbacks.onProgress(Math.min(96, Math.round((pageNumber / total) * 92) + 4));
			return text;
		});
		return pages.filter(Boolean).join('\n\n').trim();
	} finally {
		window.clearInterval(progressTimer);
	}
}
