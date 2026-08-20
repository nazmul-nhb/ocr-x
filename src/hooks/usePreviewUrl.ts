import { useEffect, useState } from 'react';
import type { Nullable } from 'toolbox-x/types';

export const usePreviewUrl = (file: Nullable<File>) => {
	const [previewUrl, setPreviewUrl] = useState('');

	useEffect(() => {
		if (!file) {
			setPreviewUrl('');
			return;
		}
		const url = URL.createObjectURL(file);
		setPreviewUrl(url);
		return () => URL.revokeObjectURL(url);
	}, [file]);

	return previewUrl;
};
