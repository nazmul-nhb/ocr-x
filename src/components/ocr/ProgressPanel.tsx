import { CheckCircle2, Clock3, Layers3, LoaderCircle, ScanLine } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { estimatedScanTime, fileKind } from '../../lib/vision';
import type { ProcessStatus } from '../../types/ocr';

type ProgressPanelProps = {
	file: File | null;
	status: ProcessStatus;
	progress: number;
	label: string;
	onStart: () => void;
};

export function ProgressPanel({ file, status, progress, label, onStart }: ProgressPanelProps) {
	const statusLabel =
		status === 'processing'
			? 'Processing'
			: status === 'complete'
				? 'Complete'
				: status === 'error'
					? 'Needs attention'
					: 'Waiting';
	return (
		<div className="min-w-0 rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
			<div className="flex items-start justify-between gap-3">
				<div>
					<span className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">
						SCAN STATUS
					</span>
					<h3 className="mt-2 text-2xl font-semibold tracking-tight">
						{status === 'complete'
							? 'Ready to review'
							: status === 'processing'
								? 'Working on it'
								: 'Ready to scan'}
					</h3>
				</div>
				<Badge
					className="shrink-0 gap-1.5 px-2.5 py-1 text-xs"
					variant={
						status === 'error'
							? 'destructive'
							: status === 'complete'
								? 'secondary'
								: 'outline'
					}
				>
					<span
						className={`size-1.5 rounded-full ${status === 'processing' ? 'bg-primary' : status === 'complete' ? 'bg-emerald-500' : status === 'error' ? 'bg-destructive-foreground' : 'bg-muted-foreground'}`}
					/>
					{statusLabel}
				</Badge>
			</div>
			<div className="mt-8 flex items-center gap-5">
				<div
					className="relative grid size-20 shrink-0 place-items-center rounded-full"
					style={{
						background: `conic-gradient(var(--primary) ${progress * 3.6}deg, var(--muted) 0deg)`,
					}}
				>
					<div className="grid size-[4.25rem] place-items-center rounded-full bg-card text-primary">
						{status === 'processing' ? (
							<LoaderCircle className="size-6 animate-spin" />
						) : status === 'complete' ? (
							<CheckCircle2 className="size-6 text-emerald-500" />
						) : (
							<span className="text-lg font-semibold">{progress}%</span>
						)}
					</div>
				</div>
				<div className="min-w-0">
					<strong className="block text-3xl font-semibold tracking-tight">
						{progress}%
					</strong>
					<span className="mt-1 block truncate text-sm text-muted-foreground">
						{label}
					</span>
				</div>
			</div>
			<div className="mt-7 h-2 overflow-hidden rounded-full bg-muted">
				<span
					className="block h-full rounded-full bg-primary transition-[width] duration-500"
					style={{ width: `${progress}%` }}
				/>
			</div>
			<div className="mt-6 space-y-4 text-sm">
				<div className="flex items-center justify-between gap-3">
					<span className="inline-flex items-center gap-2 text-muted-foreground">
						<Clock3 className="size-4" /> Estimated time
					</span>
					<strong>{estimatedScanTime(file)}</strong>
				</div>
				<div className="flex items-center justify-between gap-3">
					<span className="inline-flex items-center gap-2 text-muted-foreground">
						<Layers3 className="size-4" /> Processing mode
					</span>
					<strong>
						{file
							? fileKind(file) === 'PDF'
								? 'Page by page'
								: 'Single image'
							: 'Automatic'}
					</strong>
				</div>
			</div>
			<Button
				className="mt-7 h-12 w-full gap-2 text-base"
				disabled={!file || status === 'processing'}
				onClick={onStart}
			>
				{status === 'processing' ? (
					<>
						<LoaderCircle className="size-5 animate-spin" /> Processing…
					</>
				) : (
					<>
						<ScanLine className="size-5" />{' '}
						{status === 'complete' ? 'Scan again' : 'Start extraction'}
						<span className="ml-auto hidden text-xs opacity-60 sm:inline">⌘ ↵</span>
					</>
				)}
			</Button>
		</div>
	);
}
