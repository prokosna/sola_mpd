import { Box, Select } from "@chakra-ui/react";

import { useNotification } from "../../../lib/chakra/hooks/useNotification";
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
      <Box px={0} minW="100px" maxW="300px">
        {mpdProfileState?.currentProfile === undefined ||
        enabledOutputDevice === undefined ? (
          <Select placeholder="Loading profiles..."></Select>
        ) : (
          <Select
            value={mpdProfileState.currentProfile.name}
            onChange={async (e) => {
              await changeCurrentMpdProfile(e.target.value);
              notify({
                status: "info",
                title: "MPD profile changed",
                description: `MPD profile is changed to ${e.target.value}`,
              });
            }}
          >
            {mpdProfileState.profiles.map((profile, index) => {
              const isSelected =
                profile.name === mpdProfileState.currentProfile?.name;
              const text =
                profile.name +
                (isSelected ? ` - ${enabledOutputDevice?.name}` : "");
              return (
                <option key={index} value={profile.name}>
                  {text}
                </option>
              );
            })}
          </Select>
        )}
      </Box>
    </>
  );
}
