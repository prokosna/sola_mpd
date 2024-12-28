import {
  Button,
  ButtonGroup,
  Divider,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Progress,
  Text,
  Textarea,
} from "@chakra-ui/react";
import {
  Plugin,
  PluginExecuteResponse,
} from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";

import {
  usePluginExecutionLatestResponseState,
  usePluginExecutionWarningLogsState,
  useSetIsPluginExecutionModalOpenState,
} from "../states/executionState";

type PluginExecutionModalProgressProps = {
  plugin: Plugin;
};

/**
 * PluginExecutionModalProgress component
 *
 * This component displays the progress of a plugin execution in a modal.
 * It shows the current status, progress bar, and any warning logs.
 *
 * @param props - The props for the component
 * @param props.plugin - The plugin being executed
 *
 * @returns JSX element representing the progress modal content
 */
export function PluginExecutionModalProgress(
  props: PluginExecutionModalProgressProps,
) {
  const { plugin } = props;
  const latestResponse = usePluginExecutionLatestResponseState();
  const warningLogs = usePluginExecutionWarningLogsState();
  const setIsPluginExecutionModalOpen = useSetIsPluginExecutionModalOpenState();

  if (plugin.info === undefined) {
    return <Text>Invalid plugin: No information</Text>;
  }

  const error = latestResponse instanceof Error ? latestResponse : undefined;
  const response =
    latestResponse instanceof PluginExecuteResponse
      ? latestResponse
      : undefined;

  return (
    <>
      <ModalHeader>{plugin.info.contextMenuTitle}</ModalHeader>
      <ModalBody>
        {error === undefined ? (
          <Text noOfLines={1}>
            {response?.message || "No plugin execution."}
          </Text>
        ) : (
          <Text noOfLines={1} color="red">
            {error.message}
          </Text>
        )}
        <Progress
          hasStripe={response?.progressPercentage !== 100}
          value={response?.progressPercentage || 0}
        ></Progress>
        <Divider my={3}></Divider>
        <Text size="sm">Warning logs</Text>
        <Textarea
          overflow={"auto"}
          value={warningLogs.join("\n")}
          readOnly={true}
        ></Textarea>
      </ModalBody>
      <ModalFooter>
        <ButtonGroup spacing="2">
          <Button
            variant="outline"
            onClick={() => setIsPluginExecutionModalOpen("closed")}
          >
            Dismiss
          </Button>
        </ButtonGroup>
      </ModalFooter>
    </>
  );
}
