import { Box } from "@chakra-ui/react";
import { CenterSpinner } from "../../../loading";
import {
	PlaylistSelectModal,
	type PlaylistSelectModalProps,
} from "../../../playlist";
import {
	ColumnEditModal,
	SongTable,
	type SongTableProps,
} from "../../../song_table";
import type { ColumnEditModalProps } from "../../../song_table";

type BrowserContentViewProps = {
	songTableProps?: SongTableProps;
	playlistSelectModalProps: PlaylistSelectModalProps;
	columnEditModalProps?: ColumnEditModalProps;
};

/**
 * Renders the content view for the browser, including a song table, playlist selection modal, and column edit modal.
 *
 * This component handles the display of songs in a table format, allows for playlist management,
 * and provides column editing capabilities. It also manages loading states.
 *
 * @param props The properties passed to the BrowserContentView component
 */
export function BrowserContentView(props: BrowserContentViewProps) {
	const { songTableProps, playlistSelectModalProps, columnEditModalProps } =
		props;

	if (songTableProps === undefined || columnEditModalProps === undefined) {
		return <CenterSpinner className="layout-border-top layout-border-left" />;
	}

	return (
		<>
			<Box w="100%" h="full">
				<SongTable {...songTableProps} />
				<PlaylistSelectModal {...playlistSelectModalProps} />
				<ColumnEditModal {...columnEditModalProps} />
			</Box>
		</>
	);
}
