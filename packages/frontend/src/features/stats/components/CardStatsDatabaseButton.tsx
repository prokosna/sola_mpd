import { Button, useToast } from "@chakra-ui/react";
import { MpdRequest } from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import { useCallback } from "react";

import { useMpdClientState } from "../../mpd";
import { usePlayerStatusState } from "../../player";
import { useCurrentMpdProfileState } from "../../profile";

export function CardStatsDatabaseButton() {
  const toast = useToast();

  const profile = useCurrentMpdProfileState();
  const mpdClient = useMpdClientState();
  const playerStatus = usePlayerStatusState();

  const onClickDatabaseUpdateButton = useCallback(async () => {
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
    toast({
      title: "Update MPD Database",
      description: "Database is now updating...",
    });
  }, [mpdClient, profile, toast]);

  return (
    <>
      <Button
        isLoading={playerStatus?.isDatabaseUpdating}
        loadingText="Updating Database..."
        w="100%"
        variant="outline"
        onClick={() => {
          if (!playerStatus?.isDatabaseUpdating) {
            onClickDatabaseUpdateButton();
          }
        }}
      >
        Update Database
      </Button>
    </>
  );
}
