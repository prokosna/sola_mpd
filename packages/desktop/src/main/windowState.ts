export type WindowState = {
	width: number;
	height: number;
	x?: number;
	y?: number;
	isMaximized?: boolean;
};

export type DisplayWorkArea = {
	x: number;
	y: number;
	width: number;
	height: number;
};

export const DEFAULT_WINDOW_STATE: WindowState = { width: 1280, height: 800 };

export function isVisibleOnAnyDisplay(
	x: number,
	y: number,
	width: number,
	height: number,
	workAreas: DisplayWorkArea[],
): boolean {
	return workAreas.some((workArea) => {
		return (
			x < workArea.x + workArea.width &&
			x + width > workArea.x &&
			y < workArea.y + workArea.height &&
			y + height > workArea.y
		);
	});
}

export function parseWindowState(
	raw: string,
	workAreas: DisplayWorkArea[],
): WindowState {
	try {
		const parsed = JSON.parse(raw) as Partial<WindowState>;
		if (
			typeof parsed.width === "number" &&
			typeof parsed.height === "number" &&
			parsed.width >= 200 &&
			parsed.height >= 200
		) {
			const hasPosition =
				typeof parsed.x === "number" &&
				typeof parsed.y === "number" &&
				isVisibleOnAnyDisplay(
					parsed.x,
					parsed.y,
					parsed.width,
					parsed.height,
					workAreas,
				);
			return {
				width: parsed.width,
				height: parsed.height,
				x: hasPosition ? parsed.x : undefined,
				y: hasPosition ? parsed.y : undefined,
				isMaximized: parsed.isMaximized === true,
			};
		}
	} catch {
		// Fall through to default.
	}
	return DEFAULT_WINDOW_STATE;
}
