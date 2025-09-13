// Components
export {
	ColumnEditModal,
	type ColumnEditModalProps,
} from "./components/ColumnEditModal";
export { SongTable, type SongTableProps } from "./components/SongTable";

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
export {
	getSongTableContextMenuAdd,
	getSongTableContextMenuAddToPlaylist,
	getSongTableContextMenuEditColumns,
	getSongTableContextMenuReplace,
	getSongTableContextMenuSimilarSongs,
} from "./utils/songTableMenuItemUtils";
// Utils
export {
	convertOrderingToOperations,
	convertSongMetadataTagFromDisplayName,
	convertSongMetadataTagToDisplayName,
	getSongTableKey,
	getTargetSongsForContextMenu,
} from "./utils/songTableTableUtils";
