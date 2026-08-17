import { KeyRound, LockKeyhole, X } from 'lucide-react';

type ApiKeyModalProps = {
	value: string;
	message: string;
	onChange: (value: string) => void;
	onClose: () => void;
	onSave: () => void;
};

export function ApiKeyModal({ value, message, onChange, onClose, onSave }: ApiKeyModalProps) {
	return (
		<div
			className="modal-backdrop"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget) onClose();
			}}
			role="presentation"
		>
			<div
				aria-labelledby="settings-title"
				aria-modal="true"
				className="settings-modal"
				role="dialog"
			>
				<button
					aria-label="Close API key dialog"
					className="modal-close"
					onClick={onClose}
					type="button"
				>
					<X size={18} />
				</button>
				<div className="modal-icon">
					<KeyRound size={21} />
				</div>
				<span className="section-kicker">GOOGLE VISION</span>
				<h2 id="settings-title">Update your API key</h2>
				<p>
					{message ||
						'Your current Google Vision key was rejected or has reached its limit. Add a replacement key to continue.'}
				</p>
				<label htmlFor="api-key">Browser API key</label>
				<input
					id="api-key"
					onChange={(event) => onChange(event.target.value)}
					placeholder="AIza..."
					type="password"
					value={value}
				/>
				<div className="modal-note">
					<LockKeyhole size={14} /> Restrict this key to the Vision API and your site
					in Google Cloud.
				</div>
				<button
					className="primary-button"
					disabled={!value.trim()}
					onClick={onSave}
					type="button"
				>
					Save key and continue <KeyRound size={16} />
				</button>
			</div>
		</div>
	);
}
