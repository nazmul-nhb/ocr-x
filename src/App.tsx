import type { $UUID } from 'locality-idb';
import { FileOutput, ScanText, ShieldCheck, Sparkles } from 'lucide-react';
import { useCopyText, useStorage } from 'nhb-hooks';
import type { DragEvent } from 'react';
import { Fragment, useCallback, useRef, useState } from 'react';
import type { Nullable } from 'toolbox-x/types';
import { AppTabs } from '@/components/layout/AppTabs';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { FilePreviewDialog } from '@/components/ocr/FilePreviewDialog';
import { HistoryList } from '@/components/ocr/HistoryList';
import { ProgressPanel } from '@/components/ocr/ProgressPanel';
import { ResultPanel } from '@/components/ocr/ResultPanel';
import { UploadPanel } from '@/components/ocr/UploadPanel';
import { ApiKeyModal } from '@/components/settings/ApiKeyModal';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { API_KEY_STORAGE, DEFAULT_API_KEY, MAX_FILE_SIZE } from '@/constants/ocr';
import { useHistory } from '@/hooks/useHistory';
import { useTabNavigation } from '@/hooks/useTabNavigation';
import { useTheme } from '@/hooks/useTheme';
import { cipher } from '@/lib/utils';
import { extractText, isAcceptedFile, VisionApiError } from '@/lib/vision';
import type { Extraction, ProcessStatus } from '@/types/ocr';

export default function App() {
	const [files, setFiles] = useState<File[]>([]);
	const [previewFile, setPreviewFile] = useState<Nullable<File>>(null);
	const [status, setStatus] = useState<ProcessStatus>('idle');
	const [progress, setProgress] = useState(0);
	const [progressLabel, setProgressLabel] = useState('Ready when you are');
	const [result, setResult] = useState('');
	const [resultFilename, setResultFilename] = useState('');
	const [error, setError] = useState('');
	const [isDragging, setIsDragging] = useState(false);
	const [showSettings, setShowSettings] = useState(false);
	const [settingsMessage, setSettingsMessage] = useState('');
	const [showClearHistoryDialog, setShowClearHistoryDialog] = useState(false);

	const { set: setApiKey, value: apiKey } = useStorage<string, string>({
		key: API_KEY_STORAGE,
		defaultValue: DEFAULT_API_KEY,
		serialize: (value) => cipher.encrypt(value),
		deserialize: (value) => cipher.decrypt(value),
	});

	const [selectedHistoryId, setSelectedHistoryId] = useState<Nullable<$UUID>>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const { history, isLoading, add, remove, clear, update } = useHistory();
	const { theme, toggleTheme } = useTheme();
	const { activeTab, navigateTo } = useTabNavigation();

	const selectFiles = useCallback((nextFiles: File[]) => {
		const rejected: string[] = [];
		const accepted = nextFiles.filter((nextFile) => {
			if (!isAcceptedFile(nextFile)) {
				rejected.push(`${nextFile.name}: unsupported file type`);
				return false;
			}
			if (nextFile.size > MAX_FILE_SIZE) {
				rejected.push(
					`${nextFile.name}: larger than ${MAX_FILE_SIZE / 1024 / 1024} MB`
				);
				return false;
			}
			return true;
		});
		setFiles((current) => {
			const existing = new Set(
				current.map((file) => `${file.name}-${file.size}-${file.lastModified}`)
			);
			const unique = accepted.filter((file) => {
				const key = `${file.name}-${file.size}-${file.lastModified}`;
				if (existing.has(key)) return false;
				existing.add(key);
				return true;
			});
			return [...current, ...unique];
		});
		if (accepted.length > 0) {
			setStatus('idle');
			setProgress(0);
			setProgressLabel('Ready to extract');
			setResult('');
			setResultFilename('');
			setSelectedHistoryId(null);
		}
		setError(rejected.length > 0 ? `Some files were skipped: ${rejected.join('; ')}` : '');
	}, []);

	const handleDrop = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setIsDragging(false);
		const droppedFiles = Array.from(event.dataTransfer.files);
		if (droppedFiles.length > 0) selectFiles(droppedFiles);
	};

	const startScan = async () => {
		if (files.length === 0) return;
		const filesToScan = files;
		const totalFiles = filesToScan.length;
		setStatus('processing');
		setError('');
		setResult('');
		setResultFilename('');
		setProgress(3);
		setProgressLabel('Preparing document');
		try {
			const extractedFiles: Array<{ filename: string; text: string }> = [];
			for (const [index, currentFile] of filesToScan.entries()) {
				const prefix = totalFiles > 1 ? `File ${index + 1} of ${totalFiles} · ` : '';
				setProgressLabel(`${prefix}Preparing document`);
				const text = await extractText(currentFile, apiKey?.trim(), {
					onProgress: (value) =>
						setProgress(
							Math.min(98, Math.round((index * 100 + value) / totalFiles))
						),
					onLabel: (label) => setProgressLabel(`${prefix}${label}`),
				});
				if (!text)
					throw new VisionApiError(
						`No readable text was found in ${currentFile.name}.`
					);
				extractedFiles.push({ filename: currentFile.name, text });
			}
			const text = extractedFiles
				.map(({ filename, text: extractedText }) =>
					totalFiles > 1
						? `===== ${filename} =====\n\n${extractedText}`
						: extractedText
				)
				.join('\n\n')
				.trim();
			setProgress(100);
			setProgressLabel('Extraction complete');
			setResult(text);
			setResultFilename(
				totalFiles === 1 ? filesToScan[0].name : `${totalFiles}_files_${Date.now()}`
			);
			setSelectedHistoryId(null);
			setStatus('complete');
			for (const extractedFile of extractedFiles)
				await add(extractedFile.filename, extractedFile.text);
			navigateTo('extracted');
		} catch (scanError) {
			console.error(error);

			setStatus('error');
			setProgressLabel('Could not finish scan');
			if (
				scanError instanceof VisionApiError &&
				(scanError.kind === 'auth' || scanError.kind === 'limit')
			) {
				setSettingsMessage(
					scanError.kind === 'limit'
						? 'Google Vision has reached the quota for this key. Add a replacement key to continue.'
						: 'Google Vision rejected the current key. Add a replacement key to continue.'
				);
				setShowSettings(true);
			}
			setError(
				scanError instanceof Error
					? scanError.message
					: 'Something went wrong while scanning.'
			);
		}
	};

	const reset = () => {
		setFiles([]);
		setPreviewFile(null);
		setResult('');
		setResultFilename('');
		setSelectedHistoryId(null);
		setError('');
		setProgress(0);
		setStatus('idle');
		setProgressLabel('Ready when you are');
		if (inputRef.current) inputRef.current.value = '';
	};

	const saveApiKey = () => {
		const nextKey = apiKey?.trim();
		if (!nextKey) return;
		setApiKey(nextKey);
		setShowSettings(false);
		setSettingsMessage('');
		setStatus('idle');
		setError('API key updated. Start extraction to try again.');
	};

	const { copiedText, copyToClipboard } = useCopyText();

	const downloadResult = () => {
		if (!result) return;
		const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = `${resultFilename.replace(/\.[^/.]+$/, '') || 'ocr-result'}.txt`;
		anchor.click();
		URL.revokeObjectURL(url);
	};

	const selectHistory = (entry: Extraction) => {
		setFiles([]);
		setResult(entry.text);
		setResultFilename(entry.filename);
		setSelectedHistoryId(entry.id);
		setProgress(100);
		setProgressLabel('Loaded from local history');
		setStatus('complete');
		setError('');
		navigateTo('extracted');
	};

	const handleDeleteHistory = async (entry: Extraction) => {
		await remove(entry.id);
		if (selectedHistoryId === entry.id) {
			setResult('');
			setResultFilename('');
			setSelectedHistoryId(null);
			navigateTo('history');
		}
	};

	const confirmClearHistory = async () => {
		await clear();
		setShowClearHistoryDialog(false);
		setResult('');
		setResultFilename('');
		setSelectedHistoryId(null);
		navigateTo('history');
	};

	return (
		<TooltipProvider>
			<SidebarProvider defaultOpen>
				<Sidebar
					activeTab={activeTab}
					historyCount={history.length}
					onHistory={() => navigateTo('history')}
					onNewScan={() => {
						reset();
						navigateTo('scan');
					}}
				/>
				<SidebarInset className="min-h-svh bg-background">
					<Topbar activeTab={activeTab} onToggleTheme={toggleTheme} theme={theme} />
					<main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
						<section className="mb-8 flex flex-col justify-between gap-6 lg:mb-10 lg:flex-row lg:items-end">
							<div className="min-w-0">
								<div className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-primary sm:text-sm">
									<span className="h-px w-8 bg-primary" /> DOCUMENT
									INTELLIGENCE
								</div>
								<h1 className="text-5xl font-semibold leading-[0.98] tracking-[-0.06em] text-foreground sm:text-6xl lg:text-7xl">
									Turn documents{' '}
									<span className="text-primary">into text.</span>
								</h1>
								<p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
									Extract clear, accurate text from images and PDFs with the
									power of Google Vision.
								</p>
							</div>
							<div className="flex shrink-0 flex-col gap-2 text-sm text-muted-foreground sm:items-end">
								<span className="inline-flex items-center gap-2 font-medium text-foreground">
									<ShieldCheck className="size-4 text-emerald-500" /> Text
									Only History
								</span>
								<span>Files are never stored</span>
							</div>
						</section>
						<AppTabs
							activeTab={activeTab}
							hasResult={Boolean(result)}
							historyCount={history.length}
							onChange={navigateTo}
						/>
						{activeTab === 'scan' && (
							<Fragment>
								<section className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(20rem,0.7fr)]">
									<UploadPanel
										error={error}
										files={files}
										inputRef={inputRef}
										isDragging={isDragging}
										onClear={reset}
										onDragChange={setIsDragging}
										onDrop={handleDrop}
										onPreview={setPreviewFile}
										onRemove={(index) => {
											setFiles((current) =>
												current.filter(
													(_, fileIndex) => fileIndex !== index
												)
											);
											setStatus('idle');
											setProgress(0);
											setProgressLabel('Ready to extract');
										}}
										onSelect={selectFiles}
									/>
									<ProgressPanel
										files={files}
										label={progressLabel}
										onStart={startScan}
										progress={progress}
										status={status}
									/>
								</section>
								<div className="mt-5 flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-muted-foreground sm:items-center">
									<Sparkles className="mt-0.5 size-4 shrink-0 text-primary sm:mt-0" />
									<p>
										<strong className="font-semibold text-foreground">
											Tip:
										</strong>{' '}
										For best results, use clear, well-lit scans with high
										contrast.
									</p>
								</div>
							</Fragment>
						)}
						{activeTab === 'extracted' &&
							(result ? (
								<ResultPanel
									copied={Boolean(copiedText)}
									filename={resultFilename}
									onCopy={() => {
										copyToClipboard(result, 'Text copied successfully!');
									}}
									onDownload={downloadResult}
									onTextChange={async (text) => {
										setResult(text);

										if (selectedHistoryId) {
											await update(selectedHistoryId, text);
										}
									}}
									text={result}
								/>
							) : (
								<div className="flex min-h-88 flex-col items-center justify-center rounded-2xl border border-dashed bg-card px-6 py-12 text-center shadow-sm gap-2">
									<span className="mb-4 grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
										<FileOutput className="size-6" />
									</span>
									<strong className="text-xl font-semibold">
										No extracted text yet
									</strong>
									<span className="mt-2 text-base leading-7 text-muted-foreground">
										Run a scan or choose from History to edit its text.
									</span>
									<Button
										onClick={() => navigateTo('scan')}
										size="lg"
										variant="outline"
									>
										<ScanText />
										Start Scanning
									</Button>
								</div>
							))}
						{activeTab === 'history' && (
							<HistoryList
								entries={history}
								isLoading={isLoading}
								onClear={() => setShowClearHistoryDialog(true)}
								onDelete={(entry) => void handleDeleteHistory(entry)}
								onSelect={selectHistory}
							/>
						)}
					</main>
				</SidebarInset>
				{showSettings ? (
					<ApiKeyModal
						message={settingsMessage}
						onChange={setApiKey}
						onClose={() => setShowSettings(false)}
						onSave={saveApiKey}
						value={apiKey}
					/>
				) : null}
				<FilePreviewDialog file={previewFile} onClose={() => setPreviewFile(null)} />
				<Dialog onOpenChange={setShowClearHistoryDialog} open={showClearHistoryDialog}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Clear local history?</DialogTitle>
							<DialogDescription>
								This removes every saved extraction from this browser. Your
								uploaded files are not stored.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<DialogClose render={<Button variant="outline" />}>
								Cancel
							</DialogClose>
							<Button
								onClick={() => void confirmClearHistory()}
								variant="destructive"
							>
								Clear history
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</SidebarProvider>
		</TooltipProvider>
	);
}
