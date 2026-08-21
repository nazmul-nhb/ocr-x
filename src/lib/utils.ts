import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Cipher } from 'toolbox-x/hash';
import { CIPHER_KEY } from '@/constants/ocr';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const cipher = new Cipher(CIPHER_KEY);
