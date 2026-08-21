import './styles.css';

import { TitleProvider } from 'nhb-hooks';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.tsx';

const root = document.getElementById('root') as HTMLElement;

createRoot(root).render(
	<StrictMode>
		<TitleProvider config={{ siteTitle: 'OCR X by Nazmul Hassan' }}>
			<App />
		</TitleProvider>
	</StrictMode>
);
