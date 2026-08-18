import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { AppTab, Theme } from '../../types/ocr';

type TopbarProps = { activeTab: AppTab; theme: Theme; onToggleTheme: () => void };

export function Topbar({ activeTab, theme, onToggleTheme }: TopbarProps) {
	const label =
		activeTab === 'history'
			? 'History'
			: activeTab === 'extracted'
				? 'Extracted Text'
				: 'New Scan';
	return (
		<header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur md:px-8">
			<div className="flex items-center gap-3">
				<SidebarTrigger className="md:hidden" />
				<div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
					<span>OCR workspace</span>
					<span>/</span>
					<span className="font-medium text-foreground">{label}</span>
				</div>
				<span className="text-sm font-medium text-foreground sm:hidden">OCR X</span>
			</div>
			<div className="flex items-center gap-2">
				<span className="hidden text-xs text-muted-foreground lg:inline">
					Your files stay in your browser
				</span>
				<Button
					aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
					onClick={onToggleTheme}
					size="icon"
					variant="ghost"
				>
					{theme === 'light' ? (
						<Moon className="size-4" />
					) : (
						<Sun className="size-4" />
					)}
				</Button>
			</div>
		</header>
	);
}
