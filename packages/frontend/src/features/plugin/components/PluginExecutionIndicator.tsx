import { Box, CircularProgress, CircularProgressLabel } from "@chakra-ui/react";
import { PluginExecuteResponse } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";

import {
  useSetIsPluginExecutionModalOpenState,
  usePluginExecutionLatestResponseState,
  usePluginExecutionPropsState,
} from "../states/executionState";

/**
 * Plugin execution progress indicator.
 *
 * Shows circular progress or error state.
 *
 * @returns Progress indicator or null
 */
export function PluginExecutionIndicator() {
  const { plugin } = usePluginExecutionPropsState();
  const latestResponse = usePluginExecutionLatestResponseState();
  const setIsPluginExecutionModalOpen = useSetIsPluginExecutionModalOpenState();

  if (plugin === undefined) {
    return null;
  }

  return (
    <>
      <Box
        onClick={() => setIsPluginExecutionModalOpen("progress")}
        cursor="pointer"
      >
        {latestResponse instanceof PluginExecuteResponse ? (
          <CircularProgress
            size="40px"
            color="brand.400"
            value={latestResponse.progressPercentage}
          >
            <CircularProgressLabel>
              {latestResponse.progressPercentage} %
            </CircularProgressLabel>
          </CircularProgress>
        ) : latestResponse instanceof Error ? (
          <CircularProgress isIndeterminate size="40px" color="red.400">
            <CircularProgressLabel>Error</CircularProgressLabel>
          </CircularProgress>
        ) : null}
      </Box>
    </>
  );
}
