import { clone } from "@bufbuild/protobuf";
import { Button, Table } from "@mantine/core";
import {
	type MpdProfile,
	type MpdProfileState,
	MpdProfileStateSchema,
} from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { useCallback } from "react";
import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import { UpdateMode } from "../../../types/stateTypes";
import { useUpdateMpdProfileState } from "../../profile";

export type ProfilesProfileProps = {
	index: number;
	profile: MpdProfile;
	mpdProfileState: MpdProfileState;
};

/**
 * Single MPD profile row.
 *
 * @param props.index Profile index
 */
export function ProfilesProfile(props: ProfilesProfileProps) {
	const { index, profile, mpdProfileState } = props;

	const notify = useNotification();

	const updateMpdProfileState = useUpdateMpdProfileState();

	const handleProfileDeleted = useCallback(() => {
		const newMpdProfileState = clone(MpdProfileStateSchema, mpdProfileState);
		const index = newMpdProfileState.profiles.findIndex(
			(p) => p.name === profile.name,
		);
		if (index < 0) {
			return;
		}
		newMpdProfileState.profiles.splice(index, 1);
		updateMpdProfileState(
			newMpdProfileState,
			UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
		);
		notify({
			status: "success",
			title: "Profile successfully deleted",
			description: `${profile.name} profile has been deleted.`,
		});
	}, [mpdProfileState, notify, profile.name, updateMpdProfileState]);

	return (
		<Table.Tr>
			<Table.Td>{profile.name}</Table.Td>
			<Table.Td>{profile.host}</Table.Td>
			<Table.Td>{profile.port}</Table.Td>
			{index === 0 && mpdProfileState.profiles.length === 1 ? (
				<Table.Td />
			) : (
				<Table.Td>
					<Button
						color="red"
						variant="outline"
						size="xs"
						onClick={handleProfileDeleted}
					>
						Remove
					</Button>
				</Table.Td>
			)}
		</Table.Tr>
	);
}
