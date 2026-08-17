import { Menu, Moon, Sun } from 'lucide-react';
import type { Theme } from '../../types/ocr';

type TopbarProps = { theme: Theme; onToggleTheme: () => void; onMenu: () => void };

export function Topbar({ theme, onToggleTheme, onMenu }: TopbarProps) {
	return (
		<header className="topbar">
			<button
				aria-label="Open navigation"
				className="mobile-menu"
				onClick={onMenu}
				type="button"
			>
				<Menu size={19} />
			</button>
			<div className="breadcrumbs">
				<span>OCR Workspace</span>
				<span>/</span>
				<strong>New Scan</strong>
			</div>
			<div className="top-actions">
				<span className="top-caption">Your files stay in your browser</span>
				<button
					aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
					className="icon-button theme-button"
					onClick={onToggleTheme}
					type="button"
				>
					{theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
				</button>
			</div>
		</header>
	);
}
