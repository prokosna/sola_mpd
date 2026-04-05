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
export { refreshSongTableStateActionAtom } from "./states/actions/refreshSongTableStateActionAtom";
export { updateSongTableStateActionAtom } from "./states/actions/updateSongTableStateActionAtom";
// States
export { selectedSongsAtom } from "./states/atoms/selectedSongsAtom";
export { songTableStateAtom } from "./states/atoms/songTableAtom";

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
