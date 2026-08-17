import { Copyright, FileClock, FilePlus2, History, Moon, ScanLine, Sun } from 'lucide-react';
import { version } from './../../../package.json';
import type { AppTab, Theme } from '../../types/ocr';

type SidebarProps = {
	historyCount: number;
	activeTab: AppTab;
	theme: Theme;
	onNewScan: () => void;
	onHistory: () => void;
	onToggleTheme: () => void;
};

export function Sidebar({
	historyCount,
	theme,
	activeTab,
	onNewScan,
	onHistory,
	onToggleTheme,
}: SidebarProps) {
	return (
		<aside className="sidebar">
			<div className="brand">
				<span className="brand-mark">
					<ScanLine size={19} strokeWidth={2.1} />
				</span>
				<span>
					ocr<span className="brand-dot">.</span>x
				</span>
			</div>
			<nav aria-label="Main navigation" className="side-nav">
				<p className="nav-label">Workspace</p>
				<button
					className={`nav-item ${activeTab === 'scan' ? 'active' : ''}`}
					key="scan"
					onClick={onNewScan}
					type="button"
				>
					<FilePlus2 size={17} />
					<span>New Scan</span>
					<kbd>N</kbd>
				</button>
				<button
					className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
					key="history"
					onClick={onHistory}
					type="button"
				>
					<History size={17} />
					<span>History</span>
					{historyCount > 0 && <span className="nav-count">{historyCount}</span>}
				</button>
			</nav>
			<div className="sidebar-bottom">
				<div className="privacy-note">
					<span className="privacy-dot" />
					<div>
						<strong>Local History</strong>
						<small>Saved on this device</small>
					</div>
				</div>
				<button className="theme-toggle" onClick={onToggleTheme} type="button">
					<span>{theme === 'light' ? <Sun size={16} /> : <Moon size={16} />}</span>
					<span>{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
					<span className="theme-state">On</span>
				</button>
				<div className="version-label">
					<FileClock size={13} /> OCR X · v{version}
				</div>
				<div className="version-label">
					<Copyright size={13} /> Nazmul Hassan
				</div>
			</div>
		</aside>
	);
}
