// Components
export {
	ColumnEditModal,
	type ColumnEditModalProps,
} from "./components/ColumnEditModal";
export { SongTable, type SongTableProps } from "./components/SongTable";
export { MantineSongTable } from "./components/MantineSongTable";

// Hooks
export { useColumnEditModalProps } from "./hooks/useColumnEditModalProps";
export { useHandleSongDoubleClick } from "./hooks/useHandleSongDoubleClick";

// Services
export type { SongTableStateRepository } from "./services/SongTableStateRepository";

// States
export {
	useSelectedSongsState,
	useSetSelectedSongsState,
} from "./states/selectedSongs";
export {
	useSongTableState,
	useUpdateSongTableState,
} from "./states/songTableState";

// Types
export {
	type SongTableContextMenuItemParams,
	SongTableKeyType,
} from "./types/songTableTypes";

// Utils
export {
	getTargetSongsForContextMenu,
	convertSongMetadataTagToDisplayName,
	convertSongMetadataTagFromDisplayName,
	convertOrderingToOperations,
	getSongTableKey,
} from "./utils/songTableTableUtils";
export {
	getSongTableContextMenuAdd,
	getSongTableContextMenuAddToPlaylist,
	getSongTableContextMenuEditColumns,
	getSongTableContextMenuReplace,
} from "./utils/songTableMenuItemUtils";
