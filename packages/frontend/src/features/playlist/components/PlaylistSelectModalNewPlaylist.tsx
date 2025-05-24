import { Field, Input } from "@chakra-ui/react";
import { useCallback, useState } from "react";

import { usePlaylistsState } from "../states/playlistState";

export type PlaylistSelectModalNewPlaylistProps = {
	onInput: (playlistName: string, isOk: boolean) => void;
};



/**
 * Input field for new playlist creation.
 *
 * @param props Component props
 * @param props.onInput Input callback with name and validity
 * @returns Input field component
 */
export function PlaylistSelectModalNewPlaylist(
	props: PlaylistSelectModalNewPlaylistProps,
) {
	const playlists = usePlaylistsState();
	const [errorMessage, setErrorMessage] = useState("");

	const onInput = useCallback(
		(names: string[]) => {
			const name = names.length >= 1 ? names[0] : "";
			if (name === "") {
				setErrorMessage("The playlist name can't be empty.");
				props.onInput(name, false);
				return;
			}
			const playlist = (playlists || []).find(
				(playlist) => playlist.name === name,
			);
			if (playlist !== undefined) {
				setErrorMessage("The playlist name is already used.");
				props.onInput(name, false);
				return;
			}
			setErrorMessage("");
			props.onInput(name, true);
		},
		[playlists, props],
	);

	return (
		<>
			<Field.Root invalid={errorMessage !== ""}>
				<Input onValueChanged={(e) => onInput(e.target.value)} />
				{errorMessage !== "" ? (
					<Field.ErrorText>{errorMessage}</Field.ErrorText>
				) : null}
			</Field.Root>
		</>
	);
}
