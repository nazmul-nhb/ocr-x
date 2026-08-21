import type { $UUID } from 'locality-idb';
import { useCallback, useEffect, useState } from 'react';
import {
	clearExtractions,
	deleteExtraction,
	listExtractions,
	saveExtraction,
	updateExtraction,
} from '@/lib/history-db';
import type { Extraction } from '@/types/ocr';

export function useHistory() {
	const [history, setHistory] = useState<Extraction[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const refresh = useCallback(async () => {
		try {
			setHistory(await listExtractions());
		} catch {
			setHistory([]);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		void refresh();
	}, [refresh]);

	const add = useCallback(async (filename: string, text: string) => {
		const entry = await saveExtraction(filename, text);
		setHistory((current) => [entry, ...current]);
		return entry;
	}, []);

	const remove = useCallback(async (id: $UUID) => {
		await deleteExtraction(id);
		setHistory((current) => current.filter((entry) => entry.id !== id));
	}, []);

	const clear = useCallback(async () => {
		await clearExtractions();
		setHistory([]);
	}, []);

	const update = useCallback(
		async (id: $UUID, text: string) => {
			await updateExtraction(id, text);
			refresh();
		},
		[refresh]
	);

	return { history, isLoading, add, remove, update, clear, refresh };
}
