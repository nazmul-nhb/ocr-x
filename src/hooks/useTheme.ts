import { useStorage } from 'nhb-hooks';
import { useEffect } from 'react';
import { THEME_STORAGE } from '../constants/ocr';
import type { Theme } from '../types/ocr';

export function useTheme() {
	const { value, set } = useStorage<Theme>({ key: THEME_STORAGE });

	useEffect(() => {
		document.documentElement.classList.toggle('dark', value === 'dark');
		document.documentElement.dataset.theme = value ?? 'light';
	}, [value]);

	return {
		theme: value ?? 'light',
		toggleTheme: () => set(value === 'light' ? 'dark' : 'light'),
	};
}
