import { FileText, Image, Sparkles, Upload, X } from 'lucide-react';
import type { DragEvent, RefObject } from 'react';
import { MAX_FILE_SIZE } from '../../constants/ocr';
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
	return (
		<div className="upload-panel">
			<div
				className={`dropzone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
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
					onChange={(event) => {
						const picked = event.target.files?.[0];
						if (picked) onSelect(picked);
					}}
					ref={inputRef}
					type="file"
				/>
				{file ? (
					<>
						<div className={`file-icon ${fileKind(file) === 'PDF' ? 'pdf' : ''}`}>
							{fileKind(file) === 'PDF' ? (
								<FileText size={25} />
							) : (
								<Image size={25} />
							)}
						</div>
						<div className="selected-file">
							<strong>{file.name}</strong>
							<span>
								{fileKind(file)} · {formatBytes(file.size)}
							</span>
						</div>
						<button
							aria-label="Remove file"
							className="remove-file"
							onClick={(event) => {
								event.stopPropagation();
								onRemove();
							}}
							type="button"
						>
							<X size={17} />
						</button>
					</>
				) : (
					<>
						<div className="upload-icon">
							<Upload size={25} />
						</div>
						<h2>Drop your file here</h2>
						<p>
							or{' '}
							<button onClick={() => inputRef.current?.click()} type="button">
								browse from your computer
							</button>
						</p>
						<div className="file-types">
							<span>JPG</span>
							<span>PNG</span>
							<span>WEBP</span>
							<span>PDF</span>
							<span className="type-limit">
								up to {MAX_FILE_SIZE / 1024 / 1024} MB
							</span>
						</div>
					</>
				)}
			</div>
			{error && (
				<div className="error-message">
					<X size={15} />
					<span>{error}</span>
				</div>
			)}
			<div className="upload-footer">
				<span>
					<Sparkles size={15} /> AI-powered extraction
				</span>
				<span>One file at a time</span>
			</div>
		</div>
	);
}
