import { useEffect, useLayoutEffect, useState } from 'react';
import { isBrowser } from 'toolbox-x/guards';
import type { LooseLiteral } from 'toolbox-x/types/utils';

export const useIsomorphicEffect =
	typeof document !== 'undefined' ? useLayoutEffect : useEffect;

export type KnownOS = LooseLiteral<
	'undetermined' | 'macos' | 'ios' | 'windows' | 'android' | 'linux' | 'chromeos'
>;

function isMacOS(userAgent: string): boolean {
	const macosPattern = /(Macintosh)|(MacIntel)|(MacPPC)|(Mac68K)/i;

	return macosPattern.test(userAgent);
}

function isIOS(userAgent: string): boolean {
	const iosPattern = /(iPhone)|(iPad)|(iPod)/i;

	return iosPattern.test(userAgent);
}

function isWindows(userAgent: string): boolean {
	const windowsPattern = /(Win32)|(Win64)|(Windows)|(WinCE)/i;

	return windowsPattern.test(userAgent);
}

function isAndroid(userAgent: string): boolean {
	const androidPattern = /Android/i;

	return androidPattern.test(userAgent);
}

function isLinux(userAgent: string): boolean {
	const linuxPattern = /Linux/i;

	return linuxPattern.test(userAgent);
}

function isChromeOS(userAgent: string): boolean {
	const chromePattern = /CrOS/i;
	return chromePattern.test(userAgent);
}

function getOS(): KnownOS {
	if (!isBrowser()) {
		return 'undetermined';
	}

	const { userAgent } = window.navigator;

	if (isIOS(userAgent) || (isMacOS(userAgent) && 'ontouchend' in document)) {
		return 'ios';
	}
	if (isMacOS(userAgent)) {
		return 'macos';
	}
	if (isWindows(userAgent)) {
		return 'windows';
	}
	if (isAndroid(userAgent)) {
		return 'android';
	}
	if (isChromeOS(userAgent)) {
		return 'chromeos';
	}
	if (isLinux(userAgent)) {
		return 'linux';
	}

	return 'undetermined';
}

export interface UseOsOptions {
	getValueInEffect: boolean;
}

export function useOS(options?: UseOsOptions): KnownOS {
	const { getValueInEffect = true } = options || {};

	const [value, setValue] = useState<KnownOS>(getValueInEffect ? 'undetermined' : getOS());

	useEffect(() => {
		if (getValueInEffect) {
			setValue(getOS);
		}
	}, [getValueInEffect]);

	return value;
}
