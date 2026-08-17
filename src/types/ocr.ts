export type ProcessStatus = 'idle' | 'processing' | 'complete' | 'error';

export type Theme = 'light' | 'dark';

export type AppTab = 'scan' | 'extracted' | 'history';
export type ExtractionId = `${string}-${string}-${string}-${string}-${string}`;

export type ConnectionLike = {
	downlink?: number;
};

export type Extraction = {
	id: ExtractionId;
	filename: string;
	text: string;
	createdAt: string;
};

export type ScanCallbacks = {
	onProgress: (value: number) => void;
	onLabel: (value: string) => void;
};
