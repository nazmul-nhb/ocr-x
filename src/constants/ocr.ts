export const ACCEPTED_TYPES = [
	'image/jpeg',
	'image/png',
	'image/webp',
	'image/gif',
	'application/pdf',
];
export const MAX_FILE_SIZE = 20 * 1024 * 1024;
export const API_KEY_STORAGE = 'ocr-x-google-vision-key';
export const THEME_STORAGE = 'ocr-x-theme';
export const DEFAULT_API_KEY = import.meta.env.VITE_GOOGLE_VISION_API_KEY ?? '';
export const HISTORY_LIMIT = 12;
