import { Image } from 'antd';
import { usePreviewUrl } from '@/hooks/usePreviewUrl';

type Props = {
	file: File;
};

export default function FileToImage({ file }: Props) {
	const previewUrl = usePreviewUrl(file);

	return (
		<Image
			alt={file?.name ?? 'Image Preview'}
			fallback="./icon.svg"
			height={36}
			preview={{
				alt: `Preview of ${file?.name ?? 'image'}`,
				minScale: 0.5,
				scaleStep: 0.25,
				mask: { blur: true },
			}}
			src={previewUrl || './icon.svg'}
			style={{ aspectRatio: 1, objectFit: 'contain' }}
		/>
	);
}
