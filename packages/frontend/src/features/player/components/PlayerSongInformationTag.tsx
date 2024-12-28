import { Tag, TagLabel, Tooltip } from "@chakra-ui/react";

import { useCurrentSongFormat } from "../hooks/useCurrentSongFormat";

/**
 * PlayerSongInformationTag component displays a tag with audio format information.
 * It uses the useCurrentSongFormat hook to determine the audio quality
 * and displays an appropriate tag (DSD, Hi-Res, or standard) with a tooltip.
 *
 * @returns A React component displaying the audio format tag
 */
export function PlayerSongInformationTag() {
  const { isHiRes, isDsd, formatString } = useCurrentSongFormat();

  if (formatString === "") {
    return <></>;
  } else if (isDsd) {
    return (
      <Tooltip label={formatString} placement="top-end">
        <Tag px={1} ml={2} size={"sm"} variant="outline" colorScheme="teal">
          <TagLabel>DSD</TagLabel>
        </Tag>
      </Tooltip>
    );
  } else if (isHiRes) {
    return (
      <Tooltip label={formatString} placement="top-end">
        <Tag px={1} ml={2} size={"sm"} variant="outline" colorScheme="teal">
          <TagLabel>Hi-Res</TagLabel>
        </Tag>
      </Tooltip>
    );
  } else {
    return (
      <Tooltip label={formatString} placement="top-end">
        <Tag px={1} ml={2} size={"sm"} variant="outline" colorScheme="teal">
          <TagLabel>PCM</TagLabel>
        </Tag>
      </Tooltip>
    );
  }
}
