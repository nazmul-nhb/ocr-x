import type { InferSelectType } from 'locality-idb';
import type { historySchema } from '../lib/history-db';

export type ProcessStatus = 'idle' | 'processing' | 'complete' | 'error';

export type Theme = 'light' | 'dark';

export type AppTab = 'scan' | 'extracted' | 'history';

export type ConnectionLike = {
	downlink?: number;
};

export type Extraction = InferSelectType<(typeof historySchema)['extractions']>;

export type ScanCallbacks = {
	onProgress: (value: number) => void;
	onLabel: (value: string) => void;
};
