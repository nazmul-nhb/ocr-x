import { FileText, Image, Sparkles, Upload, X } from 'lucide-react';
import type { DragEvent, RefObject } from 'react';
import { MAX_FILE_SIZE } from '../../constants/ocr';
import { cn } from '../../lib/utils';
import { fileKind, formatBytes } from '../../lib/vision';

type UploadPanelProps = {
	file: File | null;
	error: string;
	isDragging: boolean;
	inputRef: RefObject<HTMLInputElement | null>;
	onSelect: (file: File) => void;
	onDrop: (event: DragEvent<HTMLDivElement>) => void;
	onDragChange: (dragging: boolean) => void;
	onRemove: () => void;
};

export function UploadPanel({
	file,
	error,
	isDragging,
	inputRef,
	onSelect,
	onDrop,
	onDragChange,
	onRemove,
}: UploadPanelProps) {
	const isPdf = file ? fileKind(file) === 'PDF' : false;
	return (
		<div className="min-w-0 rounded-2xl border bg-card p-3 shadow-sm sm:p-4">
			<div
				className={cn(
					`relative flex min-h-76 flex-col  overflow-hidden rounded-xl border border-dashed p-6 text-center transition-colors sm:min-h-88`,
					{
						'flex-row gap-4 sm:gap-5': file,
						'items-start justify-start': file,
						'items-center justify-center': !file,
						'border-primary bg-primary/10': isDragging,
						'border-border bg-muted/20 hover:border-primary/50 hover:bg-primary/3':
							!isDragging,
					}
				)}
				onDragEnter={(event) => {
					event.preventDefault();
					onDragChange(true);
				}}
				onDragLeave={(event) => {
					if (event.currentTarget === event.target) onDragChange(false);
				}}
				onDragOver={(event) => event.preventDefault()}
				onDrop={onDrop}
			>
				<input
					accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
					className="absolute inset-0 z-10 cursor-pointer opacity-0"
					onChange={(event) => {
						const picked = event.target.files?.[0];
						if (picked) onSelect(picked);
					}}
					ref={inputRef}
					type="file"
				/>
				{file ? (
					<>
						<div
							className={`grid size-16 shrink-0 place-items-center rounded-2xl ${isPdf ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-primary/10 text-primary'}`}
						>
							{isPdf ? (
								<FileText className="size-7" />
							) : (
								<Image className="size-7" />
							)}
						</div>
						<div className="min-w-0 text-left">
							<strong className="block truncate text-base font-semibold sm:text-lg">
								{file.name}
							</strong>
							<span className="mt-1 block text-sm text-muted-foreground">
								{fileKind(file)} · {formatBytes(file.size)}
							</span>
						</div>
						<button
							aria-label="Remove file"
							className="relative z-20 ml-auto grid size-10 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
							onClick={(event) => {
								event.stopPropagation();
								onRemove();
							}}
							type="button"
						>
							<X className="size-5" />
						</button>
					</>
				) : (
					<>
						<div className="mb-5 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
							<Upload className="size-7" />
						</div>
						<h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
							Drop your file here
						</h2>
						<p className="mt-2 text-base text-muted-foreground">
							or{' '}
							<button
								className="relative z-20 font-semibold text-primary underline-offset-4 hover:underline"
								onClick={(event) => {
									event.stopPropagation();
									inputRef.current?.click();
								}}
								type="button"
							>
								browse from your computer
							</button>
						</p>
						<div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground">
							<span className="rounded-md border bg-background px-2.5 py-1.5">
								JPG
							</span>
							<span className="rounded-md border bg-background px-2.5 py-1.5">
								PNG
							</span>
							<span className="rounded-md border bg-background px-2.5 py-1.5">
								WEBP
							</span>
							<span className="rounded-md border bg-background px-2.5 py-1.5">
								PDF
							</span>
							<span className="px-1 font-normal tracking-normal">
								up to {MAX_FILE_SIZE / 1024 / 1024} MB
							</span>
						</div>
					</>
				)}
			</div>
			{error ? (
				<div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
					<X className="mt-0.5 size-4 shrink-0" />
					<span>{error}</span>
				</div>
			) : null}
			<div className="flex flex-wrap items-center justify-between gap-2 px-1 pt-4 text-xs text-muted-foreground">
				<span className="inline-flex items-center gap-1.5">
					<Sparkles className="size-3.5 text-primary" /> AI-powered extraction
				</span>
				<span>One file at a time</span>
			</div>
		</div>
	);
}
