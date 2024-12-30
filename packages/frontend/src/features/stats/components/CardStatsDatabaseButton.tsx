import { Button } from "@chakra-ui/react";
import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { useCallback } from "react";

import { useNotification } from "../../../lib/chakra/hooks/useNotification";
import { useMpdClientState } from "../../mpd";
import { usePlayerStatusIsDatabaseUpdatingState } from "../../player";
import { useCurrentMpdProfileState } from "../../profile";

/**
 * CardStatsDatabaseButton component renders a button that triggers an update of the MPD database.
 * It uses MPD client, current profile, and player status to manage the update process.
 * The component also provides user feedback through notifications.
 *
 * @returns {JSX.Element} A button component for updating the MPD database
 */
export function CardStatsDatabaseButton() {
  const notify = useNotification();

  const profile = useCurrentMpdProfileState();
  const mpdClient = useMpdClientState();
  const playerStatusIsDatabaseUpdating =
    usePlayerStatusIsDatabaseUpdatingState();

  const handleDatabaseUpdateButtonClick = useCallback(async () => {
    if (profile === undefined || mpdClient === undefined) {
      return;
    }
    await mpdClient.command(
      new MpdRequest({
        profile,
        command: {
          case: "update",
          value: {},
        },
      }),
    );
    notify({
      status: "info",
      title: "Update MPD Database",
      description: "Database is now updating...",
    });
  }, [mpdClient, profile, notify]);

  return (
    <>
      <Button
        isLoading={playerStatusIsDatabaseUpdating}
        loadingText="Updating Database..."
        w="100%"
        variant="outline"
        onClick={() => {
          if (!playerStatusIsDatabaseUpdating) {
            handleDatabaseUpdateButtonClick();
          }
        }}
      >
        Update Database
      </Button>
    </>
  );
}
