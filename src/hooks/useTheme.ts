import { useEffect, useState } from 'react';
import { THEME_STORAGE } from '../constants/ocr';
import type { Theme } from '../types/ocr';

export function useTheme() {
	const [theme, setTheme] = useState<Theme>(
		() => (localStorage.getItem(THEME_STORAGE) as Theme | null) ?? 'light'
	);

	useEffect(() => {
		document.documentElement.dataset.theme = theme;
		localStorage.setItem(THEME_STORAGE, theme);
	}, [theme]);

	return {
		theme,
		toggleTheme: () => setTheme((current) => (current === 'light' ? 'dark' : 'light')),
	};
}
