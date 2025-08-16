import { Group, Select } from "@mantine/core";
import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import { useEnabledOutputDevice } from "../../output_devices";
import { useChangeCurrentMpdProfile } from "../hooks/useChangeCurrentMpdProfile";
import { useMpdProfileState } from "../states/mpdProfileState";

/**
 * Dropdown for MPD profile selection.
 *
 * Shows available profiles with current output device.
 *
 * @returns Selection component
 */
export function MpdProfileSelector() {
	const notify = useNotification();

	const mpdProfileState = useMpdProfileState();
	const enabledOutputDevice = useEnabledOutputDevice();
	const changeCurrentMpdProfile = useChangeCurrentMpdProfile();

	return (
		<>
			<Group px={0} w="100%" miw={100} maw={300}>
				{mpdProfileState?.currentProfile === undefined ||
				enabledOutputDevice === undefined ? (
					<Select w="100%" size="md" placeholder="Loading profiles..." />
				) : (
					<Select
						w="100%"
						size="md"
						value={mpdProfileState.currentProfile.name}
						data={mpdProfileState.profiles.map((profile) => {
							const isSelected =
								profile.name === mpdProfileState.currentProfile?.name;
							const text =
								profile.name +
								(isSelected ? ` - ${enabledOutputDevice?.name}` : "");
							return {
								value: profile.name,
								label: text,
							};
						})}
						onChange={async (value) => {
							if (value == null) {
								return;
							}
							await changeCurrentMpdProfile(value);
							notify({
								status: "info",
								title: "MPD profile changed",
								description: `MPD profile is changed to ${value}`,
							});
						}}
					/>
				)}
			</Group>
		</>
	);
}
