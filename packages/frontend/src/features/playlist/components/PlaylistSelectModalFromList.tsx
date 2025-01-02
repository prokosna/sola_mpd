import { FormControl, FormErrorMessage, Select } from "@chakra-ui/react";
import { useCallback, useState } from "react";

import { usePlaylistsState } from "../states/playlistState";

export type PlaylistSelectModalFromListProps = {
	onSelect: (playlistName: string) => void;
};

/**
 * Select input for existing playlists.
 *
 * @param props Component props
 * @param props.onSelect Selection callback
 * @returns Select input component
 */
export function PlaylistSelectModalFromList(
	props: PlaylistSelectModalFromListProps,
) {
	const playlists = usePlaylistsState();
	const [errorMessage, setErrorMessage] = useState("");

	const handleSelect = useCallback(
		(name: string) => {
			const playlist = (playlists || []).find(
				(playlist) => playlist.name === name,
			);
			if (playlist === undefined) {
				setErrorMessage(
					"Selected playlist doesn't exist. Please try reloading the browser.",
				);
				return;
			}
			setErrorMessage("");
			props.onSelect(name);
		},
		[playlists, props],
	);

	return (
		<>
			<FormControl isInvalid={errorMessage !== ""}>
				<Select
					placeholder="Select a playlist"
					onChange={(e) => handleSelect(e.target.value)}
				>
					{(playlists || []).map((playlist) => (
						<option key={playlist.name} value={playlist.name}>
							{playlist.name}
						</option>
					))}
				</Select>
				{errorMessage !== "" ? (
					<FormErrorMessage>{errorMessage}</FormErrorMessage>
				) : null}
			</FormControl>
		</>
	);
}
