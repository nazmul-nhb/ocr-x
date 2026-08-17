import { Clock3, FileText, History, Trash2 } from 'lucide-react';
import type { Extraction } from '../../types/ocr';

type HistoryListProps = {
	entries: Extraction[];
	isLoading: boolean;
	onSelect: (entry: Extraction) => void;
	onDelete: (entry: Extraction) => void;
	onClear: () => void;
};

function formatDate(value: string) {
	const date = new Date(value);
	return new Intl.DateTimeFormat(undefined, {
		dateStyle: 'medium',
		timeStyle: 'short',
	}).format(date);
}

export function HistoryList({
	entries,
	isLoading,
	onSelect,
	onDelete,
	onClear,
}: HistoryListProps) {
	return (
		<section className="recent-section">
			<div className="section-title-row">
				<div>
					<span className="section-kicker">LOCAL HISTORY</span>
					<h2>Previous Extractions</h2>
				</div>
				<div className="history-heading-actions">
					<span className="history-retention">
						<History size={14} /> Text only · stored locally
					</span>
					{entries.length > 0 && (
						<button
							className="clear-history-button"
							onClick={onClear}
							type="button"
						>
							<Trash2 size={14} /> Clear all
						</button>
					)}
				</div>
			</div>
			{isLoading ? (
				<div className="history-empty">Loading history…</div>
			) : entries.length === 0 ? (
				<div className="history-empty">
					<History size={20} />
					<strong>No extractions yet</strong>
					<span>
						Completed scans will appear here with their filename and extracted text.
					</span>
				</div>
			) : (
				<div className="history-grid">
					{entries.map((entry) => (
						<div className="history-card" key={entry.id}>
							<button
								className="history-open"
								onClick={() => onSelect(entry)}
								type="button"
							>
								<span className="history-icon">
									<FileText size={18} />
								</span>
								<span className="history-copy">
									<strong>{entry.filename}</strong>
									<small>
										<Clock3 size={12} />
										{formatDate(entry.createdAt)} ·{' '}
										{entry.text.length.toLocaleString()} characters
									</small>
									<span>
										{entry.text.slice(0, 110).replace(/\s+/g, ' ')}
										{entry.text.length > 110 ? '…' : ''}
									</span>
								</span>
							</button>
							<button
								aria-label={`Delete ${entry.filename}`}
								className="history-delete"
								onClick={() => onDelete(entry)}
								type="button"
							>
								<Trash2 size={15} />
							</button>
						</div>
					))}
				</div>
			)}
		</section>
	);
}
