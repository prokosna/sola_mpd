import { useToast } from "@chakra-ui/react";
import { produce } from "immer";
import { useCallback, useEffect } from "react";

import { useAppStore } from "../store/AppStore";

export function useProfileSelector() {
  const profileState = useAppStore((state) => state.profileState);
  const mpdDevices = useAppStore((state) => state.mpdDevices);
  const pullProfileState = useAppStore((state) => state.pullProfileState);
  const pullMpdDevices = useAppStore((state) => state.pullMpdDevices);
  const updateProfileState = useAppStore((state) => state.updateProfileState);
  const toast = useToast();

  // Init profiles
  useEffect(() => {
    pullProfileState();
  }, [pullProfileState]);

  // Update outputs when profiles are changed
  useEffect(() => {
    if (
      profileState === undefined ||
      profileState?.currentProfile === undefined
    ) {
      return;
    }
    pullMpdDevices(profileState.currentProfile);
  }, [profileState, profileState?.currentProfile, pullMpdDevices]);

  const onChangeProfile = useCallback(
    (name: string) => {
      if (profileState === undefined) {
        return;
      }
      const index = profileState.profiles.findIndex((v) => v.name === name);
      if (index < 0) {
        return;
      }
      const newProfileState = produce(profileState, (draft) => {
        draft.currentProfile = draft.profiles[index];
      });
      toast({
        status: "success",
        title: "Profile changed",
        description: `MPD profile was changed to ${name}`,
      });
      updateProfileState(newProfileState);
    },
    [profileState, toast, updateProfileState],
  );
  const enabledOutputDevice = mpdDevices?.filter((v) => v.isEnabled)[0];

  return {
    profileState,
    onChangeProfile,
    enabledOutputDevice,
  };
}
