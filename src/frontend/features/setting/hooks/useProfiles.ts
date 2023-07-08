import { useToast } from "@chakra-ui/react";
import { produce } from "immer";
import { useCallback } from "react";

import { useAppStore } from "../../global/store/AppStore";

import { MpdProfile } from "@/models/mpd/mpd_profile";

export function useProfiles() {
  const profileState = useAppStore((state) => state.profileState);
  const updateProfileState = useAppStore((state) => state.updateProfileState);
  const toast = useToast();

  const deleteProfile = useCallback(
    (profile: MpdProfile) => {
      const index = profileState?.profiles?.findIndex(
        (v) => v.name === profile.name,
      );
      if (index === undefined || index < 0) {
        return;
      }
      const newProfileState = produce(profileState, (draft) => {
        if (draft === undefined) {
          return;
        }
        draft.profiles.splice(index, 1);
        if (draft.currentProfile?.name === profile.name) {
          draft.currentProfile = draft.profiles[0];
        }
      });
      if (newProfileState === undefined) {
        return;
      }
      toast({
        status: "success",
        title: "Profile removed",
        description: `MPD profile "${profile.name}" was removed.`,
      });
      updateProfileState(newProfileState);
    },
    [profileState, toast, updateProfileState],
  );

  return {
    profiles: profileState?.profiles,
    deleteProfile,
  };
}
