import { KeyRound, LockKeyhole, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
			className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget) onClose();
			}}
			role="presentation"
		>
			<div
				aria-labelledby="settings-title"
				aria-modal="true"
				className="relative w-full max-w-md rounded-2xl border bg-background p-6 shadow-2xl sm:p-7"
				role="dialog"
			>
				<button
					aria-label="Close API key dialog"
					className="absolute right-4 top-4 grid size-9 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
					onClick={onClose}
					type="button"
				>
					<X className="size-5" />
				</button>
				<div className="mb-5 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
					<KeyRound className="size-6" />
				</div>
				<span className="text-xs font-semibold tracking-[0.16em] text-muted-foreground">
					GOOGLE VISION
				</span>
				<h2 className="mt-2 text-2xl font-semibold tracking-tight" id="settings-title">
					Update your API key
				</h2>
				<p className="mt-3 text-sm leading-6 text-muted-foreground">
					{message ||
						'Your current Google Vision key was rejected or has reached its limit. Add a replacement key to continue.'}
				</p>
				<label className="mt-6 block text-sm font-medium" htmlFor="api-key">
					Browser API key
				</label>
				<Input
					autoFocus
					className="mt-2 h-11"
					id="api-key"
					onChange={(event) => onChange(event.target.value)}
					placeholder="AIza..."
					type="password"
					value={value}
				/>
				<p className="mt-3 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
					<LockKeyhole className="mt-0.5 size-4 shrink-0" /> Restrict this key to the
					Vision API and your site in Google Cloud.
				</p>
				<Button
					className="mt-6 h-11 w-full gap-2 text-base"
					disabled={!value.trim()}
					onClick={onSave}
				>
					Save key and continue <KeyRound className="size-4" />
				</Button>
			</div>
		</div>
	);
}
