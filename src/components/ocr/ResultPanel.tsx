import { Check, Clipboard, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '../ui/scroll-area';

type ResultPanelProps = {
	filename: string;
	text: string;
	copied: boolean;
	onTextChange: (text: string) => Promise<void>;
	onCopy: () => void;
	onDownload: () => void;
};

export function ResultPanel({
	filename,
	text,
	copied,
	onTextChange,
	onCopy,
	onDownload,
}: ResultPanelProps) {
	return (
		<section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-7">
			<div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
				<div className="min-w-0">
					<span className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">
						EXTRACTED TEXT
					</span>
					<h2 className="mt-2 flex min-w-0 items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
						<FileText className="size-5 shrink-0 text-primary" />
						<span className="truncate">{filename}</span>
					</h2>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button onClick={onCopy} size="sm" variant="outline">
						{copied ? (
							<Check className="size-4" />
						) : (
							<Clipboard className="size-4" />
						)}
						{copied ? 'Copied' : 'Copy Extracted'}
					</Button>
					<Button onClick={onDownload} size="sm" variant="outline">
						<Download className="size-4" />
						Export .txt
					</Button>
				</div>
			</div>
			<ScrollArea className="mt-6 h-80 sm:h-90">
				<Textarea
					aria-label={`Extracted text from ${filename}`}
					className="resize-y font-mono text-sm leading-7 sm:text-base rounded-none"
					onChange={async (event) => await onTextChange(event.target.value)}
					spellCheck="false"
					value={text}
				/>
			</ScrollArea>
		</section>
	);
}
