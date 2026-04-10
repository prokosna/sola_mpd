import { Button, Table } from "@mantine/core";
import type {
	MpdProfile,
	MpdProfileState,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { useSetAtom } from "jotai";
import { useCallback } from "react";
import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import { UpdateMode } from "../../../types/stateTypes";
import { updateMpdProfileStateActionAtom } from "../../profile";
import { removeProfileFromState } from "../../profile/functions/profileConstruction";

export type ProfilesProfileProps = {
	index: number;
	profile: MpdProfile;
	mpdProfileState: MpdProfileState;
};

export function ProfilesProfile(props: ProfilesProfileProps) {
	const { index, profile, mpdProfileState } = props;

	const notify = useNotification();

	const updateMpdProfileState = useSetAtom(updateMpdProfileStateActionAtom);

	const handleProfileDeleted = useCallback(() => {
		const newState = removeProfileFromState(mpdProfileState, profile.name);
		if (newState === undefined) {
			return;
		}
		updateMpdProfileState({
			state: newState,
			mode: UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
		});
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
			<Table.Td>{profile.password ? "••••" : ""}</Table.Td>
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
