import type { DragEvent } from 'react';
import { useCallback, useRef, useState } from 'react';
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
	const [apiKey, setApiKey] = useState(
		() => localStorage.getItem(API_KEY_STORAGE) ?? DEFAULT_API_KEY
	);
	const [copied, setCopied] = useState(false);
	const [sidebarOpen, setSidebarOpen] = useState(false);
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
			setError('That file is larger than 20 MB. Try a smaller scan.');
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
			const text = await extractText(file, apiKey.trim(), {
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
		const nextKey = apiKey.trim();
		if (!nextKey) return;
		localStorage.setItem(API_KEY_STORAGE, nextKey);
		setApiKey(nextKey);
		setShowSettings(false);
		setSettingsMessage('');
		setStatus('idle');
		setError('API key updated. Start extraction to try again.');
	};

	const copyResult = async () => {
		if (!result) return;
		await navigator.clipboard.writeText(result);
		setCopied(true);
		window.setTimeout(() => setCopied(false), 1800);
	};

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

	const navigateFromSidebar = (tab: 'scan' | 'history') => {
		setSidebarOpen(false);
		navigateTo(tab);
	};

	return (
		<div className="app-shell">
			<Sidebar
				activeTab={activeTab}
				historyCount={history.length}
				onHistory={() => navigateFromSidebar('history')}
				onNewScan={() => {
					reset();
					navigateFromSidebar('scan');
				}}
				onToggleTheme={toggleTheme}
				theme={theme}
			/>
			{sidebarOpen && (
				<button
					aria-label="Close navigation"
					className="mobile-scrim"
					onClick={() => setSidebarOpen(false)}
					type="button"
				/>
			)}
			<div className="main-area">
				<Topbar
					onMenu={() => setSidebarOpen((open) => !open)}
					onToggleTheme={toggleTheme}
					theme={theme}
				/>
				<main className="content">
					<section className="intro">
						<div>
							<div className="eyebrow">
								<span className="eyebrow-line" />
								DOCUMENT INTELLIGENCE
							</div>
							<h1>
								Turn documents
								<br />
								<em>into text.</em>
							</h1>
							<p>
								Extract clear, accurate text from images and PDFs
								<br className="desktop-break" /> with the power of Google
								Vision.
							</p>
						</div>
						<div className="intro-meta">
							<div className="secure-chip">
								<span className="secure-check">✓</span>
								<span>Text only history</span>
							</div>
							<span className="meta-note">Files are never stored</span>
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
							<section className="scan-layout">
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
							<div className="tip-bar">
								<div className="tip-icon">✦</div>
								<p>
									<strong>Tip:</strong> For best results, use clear, well-lit
									scans with high contrast.
								</p>
							</div>
						</>
					)}
					{activeTab === 'extracted' &&
						(result ? (
							<ResultPanel
								copied={copied}
								filename={resultFilename}
								onCopy={copyResult}
								onDownload={downloadResult}
								onTextChange={setResult}
								text={result}
							/>
						) : (
							<div className="tab-empty">
								<FileOutputIcon />
								<strong>No extracted text yet</strong>
								<span>
									Run a scan or choose an item from History to edit its text
									here.
								</span>
								<button onClick={() => navigateTo('scan')} type="button">
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
			</div>
			{showSettings && (
				<ApiKeyModal
					message={settingsMessage}
					onChange={setApiKey}
					onClose={() => setShowSettings(false)}
					onSave={saveApiKey}
					value={apiKey}
				/>
			)}
		</div>
	);
}

function FileOutputIcon() {
	return (
		<span className="tab-empty-icon">
			<span>✦</span>
		</span>
	);
}
