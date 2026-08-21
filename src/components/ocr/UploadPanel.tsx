import {
	BookOpenText,
	BroomSparkles,
	FileText,
	Image,
	Sparkles,
	Upload,
	X,
} from 'lucide-react';
import { type DragEvent, Fragment, type RefObject } from 'react';
import { formatWithPlural } from 'toolbox-x';
import type { Nullable } from 'toolbox-x/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MAX_FILE_SIZE } from '@/constants/ocr';
import { useOS } from '@/hooks/useOS';
import { cn } from '@/lib/utils';
import { fileKind, formatBytes } from '@/lib/vision';
import FileToImage from './FileToImage';

type UploadPanelProps = {
	files: File[];
	error: string;
	isDragging: boolean;
	inputRef: RefObject<Nullable<HTMLInputElement>>;
	onSelect: (files: File[]) => void;
	onDrop: (event: DragEvent<HTMLDivElement>) => void;
	onDragChange: (dragging: boolean) => void;
	onPreview: (file: File) => void;
	onRemove: (index: number) => void;
	onClear: () => void;
};

export function UploadPanel({
	files,
	error,
	isDragging,
	inputRef,
	onSelect,
	onDrop,
	onDragChange,
	onPreview,
	onRemove,
	onClear,
}: UploadPanelProps) {
	const os = useOS();

	return (
		<div className="min-w-0 rounded-2xl border bg-card p-3 shadow-sm sm:p-4">
			<div
				className={cn(
					'relative flex min-h-76 flex-col overflow-hidden rounded-xl border border-dashed pt-2 pb-1 px-3 text-center transition-colors sm:min-h-88',
					{
						'items-center justify-center': !files.length,
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
					accept="image/jpeg,image/png,image/webp,application/pdf"
					className="absolute inset-0 z-10 cursor-pointer opacity-0"
					multiple
					onChange={(event) => {
						const selected = Array.from(event.target.files ?? []);
						if (selected.length > 0) onSelect(selected);
						event.target.value = '';
					}}
					ref={inputRef}
					type="file"
				/>
				{files.length > 0 ? (
					<Fragment>
						<div className="relative z-20 flex w-full items-center justify-between gap-3 border-b pb-4 text-left">
							<div>
								<h2 className="text-lg font-semibold tracking-tight sm:text-xl">
									{formatWithPlural(files.length, 'File', false)} ready to
									scan
								</h2>
								<p className="mt-1 text-sm text-muted-foreground">
									{formatWithPlural(files.length, 'file')} selected
									{files.length > 1 ? ' · will be processed in order' : ''}
								</p>
							</div>
							<Button
								className="shrink-0 gap-1.5"
								onClick={() => inputRef.current?.click()}
								size="sm"
								variant="outline"
							>
								<Upload className="size-4" />
								<span className="hidden sm:inline">Add files</span>
								<span className="sm:hidden">Add</span>
							</Button>
						</div>
						<ScrollArea className="h-60">
							<div className="relative z-20 w-full space-y-2 overflow-y-auto py-4 px-2.5 text-left ">
								{files.map((file, index) => {
									const isPdf = fileKind(file) === 'PDF';

									return (
										<div
											className="flex min-w-0 items-center gap-3 rounded-xl border bg-background/80 p-3 shadow-xs"
											key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
										>
											<span
												className={cn(
													'grid size-10 shrink-0 place-items-center rounded-lg',
													isPdf
														? 'bg-red-500/10 text-red-600 dark:text-red-400'
														: 'bg-primary/10 text-primary'
												)}
											>
												{isPdf ? (
													<FileText className="size-5" />
												) : (
													<Image className="size-5" />
												)}
											</span>
											<span className="min-w-0 flex-1">
												<strong className="block truncate text-sm font-semibold sm:text-base">
													{file.name}
												</strong>
												<span className="mt-0.5 block text-xs text-muted-foreground">
													{fileKind(file)} · {formatBytes(file.size)}
												</span>
											</span>
											{file && fileKind(file) === 'IMAGE' ? (
												<FileToImage file={file} />
											) : (
												<Button
													aria-label={`Preview ${file.name}`}
													className="shrink-0 rounded-sm p-2 size-10 text-destructive hover:bg-destructive/20 dark:hover:bg-destructive/30"
													disabled={
														os === 'ios' ||
														os === 'android' ||
														os === 'undetermined'
													}
													onClick={() => onPreview(file)}
													size="icon-lg"
													variant="ghost"
												>
													<BookOpenText className="size-7.5" />
												</Button>
											)}
											<Button
												aria-label={`Remove ${file.name}`}
												className="shrink-0 text-muted-foreground hover:text-destructive"
												onClick={() => onRemove(index)}
												size="icon"
												variant="ghost"
											>
												<X className="size-4" />
											</Button>
										</div>
									);
								})}
							</div>
						</ScrollArea>
						<div className="relative z-20 flex w-full items-center justify-between gap-3 border-t pt-1">
							<span className="text-xs text-muted-foreground">
								Images and PDFs can be mixed.
							</span>
							<Button
								className="text-xs"
								onClick={onClear}
								size="sm"
								variant="destructive"
							>
								<BroomSparkles className="size-3.5" /> Clear selection
							</Button>
						</div>
					</Fragment>
				) : (
					<Fragment>
						<div className="flex justify-center items-center">
							<div className="mb-5 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
								<Upload className="size-7" />
							</div>
						</div>
						<h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
							Drop your files here
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
								up to {MAX_FILE_SIZE / 1024 / 1024} MB each
							</span>
						</div>
					</Fragment>
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
				<span>
					{files.length > 1 ? 'Sequential processing' : 'Select one or more files'}
				</span>
			</div>
		</div>
	);
}
