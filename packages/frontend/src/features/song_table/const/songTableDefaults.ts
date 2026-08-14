import type { SongTableDeviceLayout } from "../types/songTableTypes";

/** Applied by composition to any tag absent from the device layout (DESIGN.md §6). */
export const DEFAULT_COLUMN_WIDTH_FLEX = 1;

export const DEFAULT_SONG_TABLE_DEVICE_LAYOUT: SongTableDeviceLayout = {
	widthFlexByTag: {},
	sort: [],
};
