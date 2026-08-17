import { column, defineSchema, Locality } from 'locality-idb';
import type { Extraction, ExtractionId } from '../types/ocr';

const historySchema = defineSchema({
	extractions: {
		id: column.uuid().pk(),
		filename: column.text(),
		text: column.text(),
		createdAt: column.timestamp(),
	},
});

const historyDb = new Locality({ dbName: 'ocr-x-history', version: 1, schema: historySchema });

export async function listExtractions() {
	await historyDb.ready();
	const entries = await historyDb.from('extractions').findAll();
	return entries
		.sort((first, second) => second.createdAt.localeCompare(first.createdAt))
		.slice(0, 12) as Extraction[];
}

export async function saveExtraction(filename: string, text: string) {
	await historyDb.ready();
	return historyDb
		.insert('extractions')
		.values({ filename, text })
		.run() as Promise<Extraction>;
}

export async function deleteExtraction(id: ExtractionId) {
	await historyDb.ready();
	await historyDb.delete('extractions').where('id', id).run();
}

export async function clearExtractions(entries: Extraction[]) {
	await Promise.all(entries.map((entry) => deleteExtraction(entry.id)));
}
