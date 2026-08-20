import type { ConnectionLike } from './types/ocr';

declare global {
	interface Navigator extends ConnectionLike {}

	interface Window {
		navigator: Navigator;
	}
}
