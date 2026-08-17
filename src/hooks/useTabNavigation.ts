import { useCallback, useEffect, useState } from 'react';
import type { AppTab } from '../types/ocr';

const TAB_PARAM = 'tab';
const tabs: AppTab[] = ['scan', 'extracted', 'history'];

function readTab() {
	const requested = new URLSearchParams(window.location.search).get(
		TAB_PARAM
	) as AppTab | null;
	return requested && tabs.includes(requested) ? requested : 'scan';
}

export function useTabNavigation() {
	const [activeTab, setActiveTab] = useState<AppTab>(readTab);

	useEffect(() => {
		const handlePopState = () => setActiveTab(readTab());
		window.addEventListener('popstate', handlePopState);
		return () => window.removeEventListener('popstate', handlePopState);
	}, []);

	const navigateTo = useCallback((tab: AppTab) => {
		const url = new URL(window.location.href);
		url.searchParams.set(TAB_PARAM, tab);
		window.history.pushState({ tab }, '', url);
		setActiveTab(tab);
	}, []);

	return { activeTab, navigateTo };
}
