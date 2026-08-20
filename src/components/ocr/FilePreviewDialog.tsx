import { FileText, Image as ImageIcon } from 'lucide-react';
import type { Nullable } from 'toolbox-x/types';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { usePreviewUrl } from '@/hooks/usePreviewUrl';
import { fileKind, formatBytes } from '@/lib/vision';
import { ScrollArea } from '../ui/scroll-area';

type FilePreviewDialogProps = {
	file: Nullable<File>;
	onClose: () => void;
};

export function FilePreviewDialog({ file, onClose }: FilePreviewDialogProps) {
	const previewUrl = usePreviewUrl(file);

	const isPdf = file ? fileKind(file) === 'PDF' : false;

	return (
		<Dialog
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
			open={Boolean(file)}
		>
			<DialogContent className="flex max-h-[92vh] max-w-[calc(100vw-1rem)] flex-col overflow-hidden p-4 sm:max-w-5xl sm:p-6">
				<DialogHeader className="pr-8">
					<DialogTitle className="flex min-w-0 items-center gap-2 text-xl sm:text-2xl">
						{isPdf ? (
							<FileText className="size-5 shrink-0 text-red-500" />
						) : (
							<ImageIcon className="size-5 shrink-0 text-primary" />
						)}
						<span className="truncate">{file?.name ?? 'File preview'}</span>
					</DialogTitle>
					<DialogDescription>
						{file
							? `${fileKind(file)} · ${formatBytes(file.size)}`
							: 'Preview selected file'}
					</DialogDescription>
				</DialogHeader>
				<div className="min-h-0 flex-1 overflow-auto rounded-xl border bg-muted/30 p-2 sm:p-4">
					{previewUrl ? (
						isPdf ? (
							<iframe
								className="h-[66vh] w-full border bg-background"
								src={previewUrl}
								title={`Preview of ${file?.name ?? 'PDF'}`}
							/>
						) : (
							<ScrollArea className="min-h-0 flex-1">
								<div className="flex min-h-full min-w-0 items-center justify-center">
									<img
										alt={`Preview of ${file?.name ?? 'image'}`}
										className="block h-auto max-h-[66vh] w-auto max-w-full object-contain"
										src={previewUrl}
									/>
								</div>
							</ScrollArea>
						)
					) : null}
				</div>
			</DialogContent>
		</Dialog>
	);
}
