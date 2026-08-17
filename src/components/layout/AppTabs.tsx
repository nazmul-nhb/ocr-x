import { FileOutput, FileScan, History } from 'lucide-react';
import type { AppTab } from '../../types/ocr';

type AppTabsProps = {
	activeTab: AppTab;
	onChange: (tab: AppTab) => void;
	hasResult: boolean;
	historyCount: number;
};

const tabItems: Array<{ id: AppTab; label: string; icon: typeof FileScan }> = [
	{ id: 'scan', label: 'New Scan', icon: FileScan },
	{ id: 'extracted', label: 'Extracted Text', icon: FileOutput },
	{ id: 'history', label: 'History', icon: History },
];

export function AppTabs({ activeTab, onChange, hasResult, historyCount }: AppTabsProps) {
	return (
		<nav aria-label="OCR workspace tabs" className="app-tabs">
			{tabItems.map(({ id, label, icon: Icon }) => (
				<button
					aria-current={activeTab === id ? 'page' : undefined}
					className={`app-tab ${activeTab === id ? 'active' : ''}`}
					key={id}
					onClick={() => onChange(id)}
					type="button"
				>
					<Icon size={16} />
					<span>{label}</span>
					{id === 'extracted' && hasResult && <span className="tab-state-dot" />}
					{id === 'history' && historyCount > 0 && (
						<span className="tab-count">{historyCount}</span>
					)}
				</button>
			))}
		</nav>
	);
}
