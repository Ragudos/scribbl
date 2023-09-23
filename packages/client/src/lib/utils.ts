import type { RGB } from "@scribbl/shared-types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const hexToRgb = (hex: string): RGB | null => {
	const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function (r, g, b) {
		return r + r + g + g + b + b;
	});
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? [
				parseInt(result[1], 16),
				parseInt(result[2], 16),
				parseInt(result[3], 16),
		  ]
		: null;
};
export const rgbToHex = (rgb: RGB | undefined) =>
	rgb
		? `#${((1 << 24) | (rgb[0] << 16) | (rgb[1] << 8)).toString(16).slice(1)}`
		: "#000000";
