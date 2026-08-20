import { Copyright, FileClock, FilePlus2, History } from 'lucide-react';
import {
	Sidebar as ShadcnSidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
} from '@/components/ui/sidebar';
import { version } from '../../../package.json';
import type { AppTab } from '../../types/ocr';

type SidebarProps = {
	activeTab: AppTab;
	historyCount: number;
	onNewScan: () => void;
	onHistory: () => void;
};

export function Sidebar({ activeTab, historyCount, onNewScan, onHistory }: SidebarProps) {
	return (
		<ShadcnSidebar className="border-sidebar-border bg-sidebar" collapsible="offcanvas">
			<SidebarHeader className="p-5">
				<div className="flex items-center gap-3 text-lg font-semibold tracking-tight text-sidebar-foreground">
					<span className="grid size-8 place-items-center rounded-xs bg-primary text-primary-foreground shadow-sm">
						<svg
							height="1.5em"
							viewBox="0 0 20 20"
							width="1.5em"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path d="M0 0h20v20H0z" fill="none" />
							<path
								d="M3 17h5v2H1v-7h2zm16 2h-7v-2h5v-5h2z"
								fill="currentColor"
							/>
							<path
								d="M15 15H5v-2h10zm-2-4H7V9h6zM8 3H3v5H1V1h7zm11 5h-2V3h-5V1h7z"
								fill="currentColor"
							/>
							<path d="M15 7H5V5h10z" fill="currentColor" />
						</svg>
					</span>
					<span>
						ocr<span className="text-primary">.</span>x
					</span>
				</div>
				<p className="mt-2 text-sm text-sidebar-foreground/60">Document Intelligence</p>
			</SidebarHeader>
			<SidebarSeparator className="mx-4 w-auto" />
			<SidebarContent>
				<SidebarGroup className="px-3 py-5">
					<SidebarGroupLabel className="px-3 text-xs uppercase tracking-[0.16em] text-sidebar-foreground/50">
						Workspace
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									isActive={activeTab === 'scan'}
									onClick={onNewScan}
									size="lg"
									tooltip="New Scan"
								>
									<FilePlus2 />
									<span>New Scan</span>
									<kbd className="ml-auto rounded border border-sidebar-border px-1.5 py-1 text-[10px] text-sidebar-foreground/50 flex items-center justify-center">
										N
									</kbd>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton
									isActive={activeTab === 'history'}
									onClick={onHistory}
									size="lg"
									tooltip="History"
								>
									<History />
									<span>History</span>
								</SidebarMenuButton>
								{historyCount > 0 && (
									<SidebarMenuBadge>{historyCount}</SidebarMenuBadge>
								)}
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter className="gap-3 p-4">
				<div className="flex items-center gap-3 rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3">
					<span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px] shadow-emerald-500/10" />
					<div className="min-w-0">
						<p className="text-sm font-medium text-sidebar-foreground">
							Local History
						</p>
						<p className="truncate text-xs text-sidebar-foreground/60">
							Saved on this Device
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2 px-2 text-xs text-sidebar-foreground/45">
					<FileClock className="size-3.5" />
					OCR X · v{version}
				</div>
				<div className="flex items-center gap-2 px-2 text-xs text-sidebar-foreground/45">
					<Copyright className="size-3.5" />
					{new Date().getFullYear()} · Nazmul Hassan
				</div>
			</SidebarFooter>
		</ShadcnSidebar>
	);
}
