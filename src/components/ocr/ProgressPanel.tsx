import { CheckCircle2, Clock3, Layers3, LoaderCircle, ScanLine } from 'lucide-react';
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
		<div className="progress-panel">
			<div className="panel-heading">
				<div>
					<span className="section-kicker">SCAN STATUS</span>
					<h3>
						{status === 'complete'
							? 'Ready to review'
							: status === 'processing'
								? 'Working on it'
								: 'Ready to scan'}
					</h3>
				</div>
				<span className={`status-pill ${status}`}>
					<span />
					{statusLabel}
				</span>
			</div>
			<div className="progress-orb">
				<div
					className="orb-ring"
					style={{
						background: `conic-gradient(#5b57ed ${progress * 3.6}deg, var(--progress-track) 0deg)`,
					}}
				>
					<div className="orb-inner">
						{status === 'processing' ? (
							<LoaderCircle className="animate-spin" size={22} />
						) : status === 'complete' ? (
							<CheckCircle2 size={22} />
						) : (
							<span>{progress}%</span>
						)}
					</div>
				</div>
				<div>
					<strong>{progress}%</strong>
					<span>{label}</span>
				</div>
			</div>
			<div className="progress-line">
				<span style={{ width: `${progress}%` }} />
			</div>
			<div className="progress-details">
				<span>
					<Clock3 size={14} /> Estimated time
				</span>
				<strong>{estimatedScanTime(file)}</strong>
			</div>
			<div className="progress-details">
				<span>
					<Layers3 size={14} /> Processing mode
				</span>
				<strong>
					{file
						? fileKind(file) === 'PDF'
							? 'Page by page'
							: 'Single image'
						: 'Automatic'}
				</strong>
			</div>
			<button
				className="primary-button"
				disabled={!file || status === 'processing'}
				onClick={onStart}
				type="button"
			>
				{status === 'processing' ? (
					<>
						<LoaderCircle className="animate-spin" size={17} /> Processing…
					</>
				) : (
					<>
						<ScanLine size={17} />{' '}
						{status === 'complete' ? 'Scan again' : 'Start extraction'}
						<span>⌘ ↵</span>
					</>
				)}
			</button>
		</div>
	);
}
