import { Clock3, FileText, History, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Extraction } from '../../types/ocr';

type HistoryListProps = {
	entries: Extraction[];
	isLoading: boolean;
	onSelect: (entry: Extraction) => void;
	onDelete: (entry: Extraction) => void;
	onClear: () => void;
};

function formatDate(value: string) {
	return new Intl.DateTimeFormat(undefined, {
		dateStyle: 'medium',
		timeStyle: 'short',
	}).format(new Date(value));
}

export function HistoryList({
	entries,
	isLoading,
	onSelect,
	onDelete,
	onClear,
}: HistoryListProps) {
	return (
		<section>
			<div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
				<div>
					<span className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">
						LOCAL HISTORY
					</span>
					<h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
						Previous extractions
					</h2>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Badge className="gap-1.5 px-2.5 py-1 text-xs" variant="secondary">
						<History className="size-3.5" /> Text only · stored locally
					</Badge>
					{entries.length > 0 && (
						<Button
							className="gap-1.5"
							onClick={onClear}
							size="sm"
							variant="outline"
						>
							<Trash2 className="size-3.5" /> Clear all
						</Button>
					)}
				</div>
			</div>
			{isLoading ? (
				<div className="flex min-h-48 items-center justify-center rounded-2xl border bg-card text-base text-muted-foreground shadow-sm">
					<span className="animate-pulse">Loading history…</span>
				</div>
			) : entries.length === 0 ? (
				<div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed bg-card px-6 py-12 text-center shadow-sm">
					<History className="mb-4 size-8 text-muted-foreground" />
					<strong className="text-xl font-semibold">No extractions yet</strong>
					<span className="mt-2 max-w-md text-base leading-7 text-muted-foreground">
						Completed scans will appear here with their filename and extracted text.
					</span>
				</div>
			) : (
				<div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
					{entries.map((entry) => (
						<div
							className="flex min-w-0 items-stretch rounded-xl border bg-card shadow-sm transition hover:border-primary/40 hover:shadow-md"
							key={entry.id}
						>
							<button
								className="flex min-w-0 flex-1 items-start gap-3 p-4 text-left sm:gap-4 sm:p-5"
								onClick={() => onSelect(entry)}
								type="button"
							>
								<span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
									<FileText className="size-5" />
								</span>
								<span className="min-w-0">
									<strong className="block truncate text-base font-semibold sm:text-lg">
										{entry.filename}
									</strong>
									<small className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
										<Clock3 className="size-3.5" />
										{formatDate(entry.createdAt)} ·{' '}
										{entry.text.length.toLocaleString()} characters
									</small>
									<span className="mt-3 block line-clamp-2 text-sm leading-6 text-muted-foreground">
										{entry.text.slice(0, 110).replace(/\s+/g, ' ')}
										{entry.text.length > 110 ? '…' : ''}
									</span>
								</span>
							</button>
							<button
								aria-label={`Delete ${entry.filename}`}
								className="m-3 grid size-9 shrink-0 place-items-center self-start rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
								onClick={() => onDelete(entry)}
								type="button"
							>
								<Trash2 className="size-4" />
							</button>
						</div>
					))}
				</div>
			)}
		</section>
	);
}
