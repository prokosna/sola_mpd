import { Badge, Button, Group, Stack, Table, Tooltip } from "@mantine/core";
import type {
	MpdProfile,
	MpdProfileState,
} from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { IconCloud, IconDeviceDesktop } from "@tabler/icons-react";
import { useSetAtom } from "jotai";
import { useCallback } from "react";
import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import { UpdateMode } from "../../../types/stateTypes";
import {
	deleteMpdProfileActionAtom,
	updateCurrentMpdProfileActionAtom,
} from "../../profile";

export type ProfilesProfileProps = {
	index: number;
	profile: MpdProfile;
	mpdProfileState: MpdProfileState;
	isActiveOnThisDevice: boolean;
};

export function ProfilesProfile(props: ProfilesProfileProps) {
	const { index, profile, mpdProfileState, isActiveOnThisDevice } = props;

	const notify = useNotification();

	const deleteMpdProfile = useSetAtom(deleteMpdProfileActionAtom);
	const updateCurrentMpdProfile = useSetAtom(updateCurrentMpdProfileActionAtom);

	const isDefaultProfile =
		mpdProfileState.currentProfile?.name === profile.name;

	const handleProfileDeleted = useCallback(() => {
		deleteMpdProfile({ profileName: profile.name });
		notify({
			status: "success",
			title: "Profile successfully deleted",
			description: `${profile.name} profile has been deleted.`,
		});
	}, [deleteMpdProfile, notify, profile.name]);

	const handleSetAsDefault = useCallback(() => {
		// This changes the workspace default for new devices, not what this
		// device is currently using (that's a separate, per-device selection
		// made by switching profiles in the header). LOCAL_STATE is still
		// needed here so the local mirror of currentProfile — and therefore
		// the "Default for new devices" badge — updates immediately instead
		// of only on the next refetch.
		updateCurrentMpdProfile({
			profile,
			mode: UpdateMode.LOCAL_STATE | UpdateMode.PERSIST,
		});
		notify({
			status: "success",
			title: "Default profile updated",
			description: `${profile.name} is now the default profile for new devices.`,
		});
	}, [notify, profile, updateCurrentMpdProfile]);

	const canRemove = !(index === 0 && mpdProfileState.profiles.length === 1);

	return (
		<Table.Tr>
			<Table.Td>{profile.name}</Table.Td>
			<Table.Td>{profile.host}</Table.Td>
			<Table.Td>{profile.port}</Table.Td>
			<Table.Td>{profile.password ? "••••" : ""}</Table.Td>
			<Table.Td>
				{/* A profile can hold both statuses at once, and the two labels are
				    too wide to sit side by side in a table cell — laid out
				    vertically so neither is clipped, with the full meaning in a
				    tooltip rather than in the badge text. */}
				<Stack gap={4} align="flex-start">
					{isActiveOnThisDevice && (
						<Tooltip
							withArrow
							label="This device is connected to this profile. Every device picks its own."
						>
							<Badge
								size="sm"
								variant="light"
								color="blue"
								leftSection={<IconDeviceDesktop size={12} />}
							>
								This device
							</Badge>
						</Tooltip>
					)}
					{isDefaultProfile && (
						<Tooltip
							withArrow
							label="Devices that have not picked a profile yet start with this one."
						>
							<Badge
								size="sm"
								variant="light"
								color="green"
								leftSection={<IconCloud size={12} />}
							>
								Default
							</Badge>
						</Tooltip>
					)}
				</Stack>
			</Table.Td>
			<Table.Td>
				<Group gap={8} wrap="nowrap">
					{!isDefaultProfile && (
						<Button variant="outline" size="xs" onClick={handleSetAsDefault}>
							Set as default
						</Button>
					)}
					{canRemove && (
						<Button
							color="red"
							variant="outline"
							size="xs"
							onClick={handleProfileDeleted}
						>
							Remove
						</Button>
					)}
				</Group>
			</Table.Td>
		</Table.Tr>
	);
}
