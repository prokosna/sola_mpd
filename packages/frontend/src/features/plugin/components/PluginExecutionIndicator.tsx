import { Box, CircularProgress, CircularProgressLabel } from "@chakra-ui/react";
import { PluginExecuteResponse } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";

import {
  useSetIsPluginExecutionModalOpenState,
  usePluginExecutionLatestResponseState,
  usePluginExecutionPropsState,
} from "../states/execution";

export function PluginExecutionIndicator() {
  const setIsPluginExecutionModalOpen = useSetIsPluginExecutionModalOpenState();
  const latestResponse = usePluginExecutionLatestResponseState();
  const { plugin } = usePluginExecutionPropsState();

  if (plugin === undefined) {
    return <></>;
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
        ) : (
          <></>
        )}
      </Box>
    </>
  );
}
