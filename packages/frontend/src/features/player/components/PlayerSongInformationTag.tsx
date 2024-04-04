import { Tag, TagLabel, Tooltip } from "@chakra-ui/react";

import { useCurrentSongFormat } from "../hooks/useCurrentSongFormat";

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
