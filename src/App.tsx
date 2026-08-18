import { FileOutput, ShieldCheck, Sparkles } from 'lucide-react';
import { useCopyText, useStorage } from 'nhb-hooks';
import type { DragEvent } from 'react';
import { useCallback, useRef, useState } from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppTabs } from './components/layout/AppTabs';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { HistoryList } from './components/ocr/HistoryList';
import { ProgressPanel } from './components/ocr/ProgressPanel';
import { ResultPanel } from './components/ocr/ResultPanel';
import { UploadPanel } from './components/ocr/UploadPanel';
import { ApiKeyModal } from './components/settings/ApiKeyModal';
import { API_KEY_STORAGE, DEFAULT_API_KEY, MAX_FILE_SIZE } from './constants/ocr';
import { useHistory } from './hooks/useHistory';
import { useTabNavigation } from './hooks/useTabNavigation';
import { useTheme } from './hooks/useTheme';
import { cipher } from './lib/utils';
import { extractText, isAcceptedFile, VisionApiError } from './lib/vision';
import type { Extraction, ProcessStatus } from './types/ocr';

export default function App() {
	const [file, setFile] = useState<File | null>(null);
	const [status, setStatus] = useState<ProcessStatus>('idle');
	const [progress, setProgress] = useState(0);
	const [progressLabel, setProgressLabel] = useState('Ready when you are');
	const [result, setResult] = useState('');
	const [resultFilename, setResultFilename] = useState('');
	const [error, setError] = useState('');
	const [isDragging, setIsDragging] = useState(false);
	const [showSettings, setShowSettings] = useState(false);
	const [settingsMessage, setSettingsMessage] = useState('');

	const { set: setApiKey, value: apiKey } = useStorage<string, string>({
		key: API_KEY_STORAGE,
		defaultValue: DEFAULT_API_KEY,
		serialize: (value) => cipher.encrypt(value),
		deserialize: (value) => cipher.decrypt(value),
	});

	const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const { history, isLoading, add, remove, clear } = useHistory();
	const { theme, toggleTheme } = useTheme();
	const { activeTab, navigateTo } = useTabNavigation();

	const selectFile = useCallback((nextFile: File) => {
		if (!isAcceptedFile(nextFile)) {
			setError('Please choose a JPG, PNG, WEBP, GIF, or PDF file.');
			setStatus('error');
			return;
		}
		if (nextFile.size > MAX_FILE_SIZE) {
			setError(
				`That file is larger than ${MAX_FILE_SIZE / 1024 / 1024} MB. Try a smaller scan.`
			);
			setStatus('error');
			return;
		}
		setFile(nextFile);
		setStatus('idle');
		setProgress(0);
		setProgressLabel('Ready to extract');
		setError('');
		setResult('');
		setResultFilename('');
		setSelectedHistoryId(null);
	}, []);

	const handleDrop = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setIsDragging(false);
		const droppedFile = event.dataTransfer.files[0];
		if (droppedFile) selectFile(droppedFile);
	};

	const startScan = async () => {
		if (!file) return;
		setStatus('processing');
		setError('');
		setResult('');
		setResultFilename('');
		setProgress(4);
		setProgressLabel('Preparing document');
		try {
			const text = await extractText(file, apiKey?.trim(), {
				onProgress: setProgress,
				onLabel: setProgressLabel,
			});
			if (!text) throw new VisionApiError('No readable text was found in this document.');
			setProgress(100);
			setProgressLabel('Extraction complete');
			setResult(text);
			setResultFilename(file.name);
			setSelectedHistoryId(null);
			setStatus('complete');
			await add(file.name, text);
			navigateTo('extracted');
		} catch (scanError) {
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
		setFile(null);
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
		setFile(null);
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

	const handleClearHistory = async () => {
		if (!window.confirm('Clear all saved extractions from this device?')) return;
		await clear();
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
							<>
								<section className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(20rem,0.7fr)]">
									<UploadPanel
										error={error}
										file={file}
										inputRef={inputRef}
										isDragging={isDragging}
										onDragChange={setIsDragging}
										onDrop={handleDrop}
										onRemove={reset}
										onSelect={selectFile}
									/>
									<ProgressPanel
										file={file}
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
							</>
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
									onTextChange={setResult}
									text={result}
								/>
							) : (
								<div className="flex min-h-88 flex-col items-center justify-center rounded-2xl border border-dashed bg-card px-6 py-12 text-center shadow-sm">
									<span className="mb-4 grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
										<FileOutput className="size-6" />
									</span>
									<strong className="text-xl font-semibold">
										No extracted text yet
									</strong>
									<span className="mt-2 text-base leading-7 text-muted-foreground">
										Run a scan or choose from History to edit its text.
									</span>
									<button
										className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
										onClick={() => navigateTo('scan')}
										type="button"
									>
										Start a scan
									</button>
								</div>
							))}
						{activeTab === 'history' && (
							<HistoryList
								entries={history}
								isLoading={isLoading}
								onClear={() => void handleClearHistory()}
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
			</SidebarProvider>
		</TooltipProvider>
	);
}
