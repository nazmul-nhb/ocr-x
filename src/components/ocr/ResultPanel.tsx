import { Check, Clipboard, Download, FileText } from 'lucide-react';

type ResultPanelProps = {
	filename: string;
	text: string;
	copied: boolean;
	onTextChange: (text: string) => void;
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
		<section className="result-panel">
			<div className="result-heading">
				<div>
					<span className="section-kicker">EXTRACTED TEXT</span>
					<h2>
						<FileText size={17} />
						{filename}
					</h2>
				</div>
				<div className="result-actions">
					<button onClick={onCopy} type="button">
						{copied ? <Check size={15} /> : <Clipboard size={15} />}
						{copied ? 'Copied' : 'Copy text'}
					</button>
					<button onClick={onDownload} type="button">
						<Download size={15} />
						Export .txt
					</button>
				</div>
			</div>
			<textarea
				aria-label={`Extracted text from ${filename}`}
				className="result-body"
				onChange={(event) => onTextChange(event.target.value)}
				spellCheck="false"
				value={text}
			/>
		</section>
	);
}
