import { Box, Select, useToast } from "@chakra-ui/react";

import { useEnabledMpdDevice } from "../../output_devices";
import { useChangeMpdProfileAction } from "../actions/useChangeMpdProfileAction";
import { useMpdProfileState } from "../queries/useMpdProfileState";

export function MpdProfileSelector() {
  const toast = useToast();

  const mpdProfileState = useMpdProfileState();
  const enabledOutputDevice = useEnabledMpdDevice();
  const changeMpdProfileAction = useChangeMpdProfileAction()(mpdProfileState);

  return (
    <>
      <Box px={0} minW="100px" maxW="300px">
        {mpdProfileState?.currentProfile === undefined ||
        enabledOutputDevice === undefined ? (
          <Select placeholder="Loading profiles..."></Select>
        ) : (
          <Select
            value={mpdProfileState.currentProfile.name}
            onChange={(e) => {
              changeMpdProfileAction(e.target.value);
              toast({
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
