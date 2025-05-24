import { createListCollection, Field, Portal, Select } from "@chakra-ui/react";
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
		(names: string[]) => {
			if (names.length === 0) {
				setErrorMessage("Please select a playlist.");
				return;
			}
			const name = names[0];
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

	const playlistsCollection = createListCollection({
		items: (playlists || []).map((playlist) => playlist.name),
	});

	return (
		<>
			<Field.Root invalid={errorMessage !== ""}>
				<Select.Root
					collection={playlistsCollection}
					onValueChange={(e) => handleSelect(e.value)}
				>
					<Select.HiddenSelect />
					<Select.Control>
						<Select.Trigger>
							<Select.ValueText placeholder="Select a playlist" />
						</Select.Trigger>
						<Select.IndicatorGroup>
							<Select.Indicator />
						</Select.IndicatorGroup>
					</Select.Control>
					<Portal>
						<Select.Positioner>
							<Select.Content>
								{playlistsCollection.items.map((name) => (
									<Select.Item key={name} item={name}>
										{name}
									</Select.Item>
								))}
							</Select.Content>
						</Select.Positioner>
					</Portal>
				</Select.Root>
				{errorMessage !== "" ? (
					<Field.ErrorText>{errorMessage}</Field.ErrorText>
				) : null}
			</Field.Root>
		</>
	);
}
