import { FileOutput, FileScan, History } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { AppTab } from '../../types/ocr';

type AppTabsProps = {
	activeTab: AppTab;
	onChange: (tab: AppTab) => void;
	hasResult: boolean;
	historyCount: number;
};

export function AppTabs({ activeTab, onChange, hasResult, historyCount }: AppTabsProps) {
	return (
		<Tabs className="mb-6 w-full" onValueChange={onChange} value={activeTab}>
			<TabsList className="" variant="line">
				<TabsTrigger
					// className="min-w-0 gap-1.5 px-2 text-xs sm:gap-2 sm:px-3 sm:text-base"
					value="scan"
				>
					<FileScan className="size-4 shrink-0" />
					<span className="truncate">New Scan</span>
				</TabsTrigger>
				<TabsTrigger
					// className="min-w-0 gap-1.5 px-2 text-xs sm:gap-2 sm:px-3 sm:text-base"
					value="extracted"
				>
					<FileOutput className="size-4 shrink-0" />
					<span className="truncate">Extracted Text</span>
					{hasResult ? (
						<span className="size-2 shrink-0 rounded-full bg-emerald-500" />
					) : null}
				</TabsTrigger>
				<TabsTrigger
					// className="min-w-0 gap-1.5 px-2 text-xs sm:gap-2 sm:px-3 sm:text-base"
					value="history"
				>
					<History className="size-4 shrink-0" />
					<span className="truncate">History</span>
					{historyCount > 0 && (
						<span className="shrink-0 rounded-full bg-primary/10 px-1.5 text-xs text-primary">
							{historyCount}
						</span>
					)}
				</TabsTrigger>
			</TabsList>
		</Tabs>
	);
}
