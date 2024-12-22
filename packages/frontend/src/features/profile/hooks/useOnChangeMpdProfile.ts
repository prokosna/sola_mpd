import { useCallback } from "react";

import {
  useMpdProfileState,
  useSetCurrentMpdProfile,
} from "../states/mpdProfileState";

export function useOnChangeMpdProfile() {
  const mpdProfileState = useMpdProfileState();
  const setCurrentMpdProfile = useSetCurrentMpdProfile();

  const onChangeMpdProfile = useCallback(
    async (name: string) => {
      if (mpdProfileState === undefined) {
        return;
      }

      const index = mpdProfileState.profiles.findIndex(
        (profile) => profile.name === name,
      );
      if (index < 0) {
        return;
      }

      setCurrentMpdProfile(mpdProfileState.profiles[index]);
    },
    [mpdProfileState, setCurrentMpdProfile],
  );

  return onChangeMpdProfile;
}
