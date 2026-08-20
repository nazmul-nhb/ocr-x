import { type $UUID, column, defineSchema, Locality } from 'locality-idb';

export const historySchema = defineSchema({
	extractions: {
		id: column.uuid().pk(),
		filename: column.text(),
		text: column.text(),
		createdAt: column.timestamp(),
	},
});

export const historyDb = new Locality({
	dbName: 'ocr-x-history',
	version: 3,
	schema: historySchema,
});

export async function listExtractions() {
	return await historyDb.from('extractions').orderBy('createdAt', 'desc').findAll();
}

export async function saveExtraction(filename: string, text: string) {
	return historyDb.insert('extractions').values({ filename, text }).run();
}

export async function deleteExtraction(id: $UUID) {
	await historyDb.delete('extractions').where('id', id).run();
}

export async function clearExtractions() {
	await historyDb.clearTable('extractions');
}
