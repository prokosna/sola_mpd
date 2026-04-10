import { Group } from "@mantine/core";
import { CenterSpinner } from "../../../loading";
import {
	PlaylistSelectModal,
	type PlaylistSelectModalProps,
} from "../../../playlist";
import type { ColumnEditModalProps } from "../../../song_table";
import {
	ColumnEditModal,
	SongTable,
	type SongTableProps,
} from "../../../song_table";

type BrowserContentViewProps = {
	songTableProps?: SongTableProps;
	playlistSelectModalProps: PlaylistSelectModalProps;
	columnEditModalProps?: ColumnEditModalProps;
};

export function BrowserContentView(props: BrowserContentViewProps) {
	const { songTableProps, playlistSelectModalProps, columnEditModalProps } =
		props;

	if (songTableProps === undefined || columnEditModalProps === undefined) {
		return <CenterSpinner />;
	}

	return (
		<Group w="100%" h="100%">
			<SongTable {...songTableProps} />
			<PlaylistSelectModal {...playlistSelectModalProps} />
			<ColumnEditModal {...columnEditModalProps} />
		</Group>
	);
}
