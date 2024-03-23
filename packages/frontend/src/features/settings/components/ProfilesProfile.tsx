import { IconButton, Td, Tr, useToast } from "@chakra-ui/react";
import {
  MpdProfile,
  MpdProfileState,
} from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { useCallback } from "react";
import { IoTrash } from "react-icons/io5";

import { useSetMpdProfileState } from "../../profile";

export type ProfilesProfileProps = {
  index: number;
  profile: MpdProfile;
  mpdProfileState: MpdProfileState;
};

export function ProfilesProfile(props: ProfilesProfileProps) {
  const { index, profile, mpdProfileState } = props;

  const toast = useToast();
  const setMpdProfileState = useSetMpdProfileState();

  const onDelete = useCallback(() => {
    const newMpdProfileState = mpdProfileState.clone();
    const index = newMpdProfileState.profiles.findIndex(
      (p) => p.name === profile.name,
    );
    if (index < 0) {
      return;
    }
    newMpdProfileState.profiles.splice(index, 1);
    setMpdProfileState(newMpdProfileState);
    toast({
      status: "success",
      title: "Profile successfully deleted",
      description: `${profile.name} profile has been deleted.`,
    });
  }, [mpdProfileState, profile.name, toast, setMpdProfileState]);

  return (
    <>
      <Tr>
        <Td>{profile.name}</Td>
        <Td>{profile.host}</Td>
        <Td isNumeric>{profile.port}</Td>
        {index !== 0 ? (
          <Td>
            <IconButton
              variant="outline"
              aria-label="Delete"
              size="xs"
              icon={<IoTrash />}
              onClick={onDelete}
            />
          </Td>
        ) : (
          <Td></Td>
        )}
      </Tr>
    </>
  );
}
