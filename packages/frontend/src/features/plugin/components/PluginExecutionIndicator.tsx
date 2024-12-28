import { Box, CircularProgress, CircularProgressLabel } from "@chakra-ui/react";
import { PluginExecuteResponse } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";

import {
  useSetIsPluginExecutionModalOpenState,
  usePluginExecutionLatestResponseState,
  usePluginExecutionPropsState,
} from "../states/executionState";

/**
 * PluginExecutionIndicator component
 *
 * This component displays the execution progress of a plugin.
 * It shows a circular progress indicator when a plugin is running,
 * and an error indicator if the execution fails.
 *
 * The component uses various hooks to access the current plugin state,
 * execution response, and to control the visibility of the execution modal.
 *
 * @returns JSX.Element | null
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
