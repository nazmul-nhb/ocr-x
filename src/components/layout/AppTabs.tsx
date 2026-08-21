import { FileOutput, FileScan, History } from 'lucide-react';
import { useTitle } from 'nhb-hooks';
import { toTitleCase } from 'toolbox-x/change-case';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { AppTab } from '@/types/ocr';

type AppTabsProps = {
	activeTab: AppTab;
	onChange: (tab: AppTab) => void;
	hasResult: boolean;
	historyCount: number;
};

export function AppTabs({ activeTab, onChange, hasResult, historyCount }: AppTabsProps) {
	useTitle(toTitleCase(activeTab));

	return (
		<Tabs className="mb-6 w-full" onValueChange={onChange} value={activeTab}>
			<TabsList variant="line">
				<TabsTrigger value="scan">
					<FileScan className="size-4 shrink-0" />
					<span className="truncate text-xs sm:text-base">New Scan</span>
				</TabsTrigger>
				<TabsTrigger value="extracted">
					<FileOutput className="size-4 shrink-0" />
					<span className="truncate text-xs sm:text-base">Extracted Text</span>
					{hasResult ? (
						<span className="size-2 shrink-0 rounded-full bg-emerald-500" />
					) : null}
				</TabsTrigger>
				<TabsTrigger value="history">
					<History className="size-4 shrink-0" />
					<span className="truncate text-xs sm:text-base">History</span>
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
