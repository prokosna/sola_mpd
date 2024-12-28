import { IconButton, Td, Tr } from "@chakra-ui/react";
import {
  MpdProfile,
  MpdProfileState,
} from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { useCallback } from "react";
import { IoTrash } from "react-icons/io5";

import { useNotification } from "../../../lib/chakra/hooks/useNotification";
import { UpdateMode } from "../../../types/stateTypes";
import { useUpdateMpdProfileState } from "../../profile";

export type ProfilesProfileProps = {
  index: number;
  profile: MpdProfile;
  mpdProfileState: MpdProfileState;
};

/**
 * ProfilesProfile component for rendering individual MPD profile entries.
 *
 * This component displays a single MPD profile in a table row format,
 * including the profile's name, host, and port. It also provides
 * functionality to delete the profile.
 *
 * @param props - The properties for the ProfilesProfile component
 * @param props.index - The index of the profile in the list
 * @param props.profile - The MpdProfile object containing profile details
 * @param props.mpdProfileState - The current state of all MPD profiles
 * @returns JSX element representing a single profile row
 */
export function ProfilesProfile(props: ProfilesProfileProps) {
  const { index, profile, mpdProfileState } = props;

  const notify = useNotification();

  const updateMpdProfileState = useUpdateMpdProfileState();

  const handleProfileDeleted = useCallback(() => {
    const newMpdProfileState = mpdProfileState.clone();
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
              onClick={handleProfileDeleted}
            />
          </Td>
        ) : (
          <Td></Td>
        )}
      </Tr>
    </>
  );
}
