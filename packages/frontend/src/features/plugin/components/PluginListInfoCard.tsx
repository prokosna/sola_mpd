import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  Heading,
  Stack,
  Tag,
  TagLabel,
  Text,
} from "@chakra-ui/react";
import { Plugin } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";

import { useOnRemovePlugin } from "../hooks/useOnRemovePlugin";
import { usePluginDisplayColors } from "../hooks/usePluginDisplayColors";

export type PluginListInfoCardProps = {
  plugin: Plugin;
};

export function PluginListInfoCard(props: PluginListInfoCardProps) {
  const { plugin } = props;

  const { availableColor, unavailableColor, endpointColor } =
    usePluginDisplayColors();
  const onRemovePlugin = useOnRemovePlugin(plugin);

  return (
    <Card
      w="300px"
      h="350px"
      backgroundColor={plugin.isAvailable ? availableColor : unavailableColor}
      variant={"elevated"}
      borderRadius={"36px"}
    >
      <CardBody>
        <Stack mt="2" spacing="3">
          <Heading size="md">
            {plugin.info?.name} {plugin.info?.version}
            {plugin.isAvailable ? (
              <Tag
                ml="6px"
                py="2px"
                size="sm"
                variant="outline"
                borderRadius="full"
                colorScheme="green"
              >
                <TagLabel>Available</TagLabel>
              </Tag>
            ) : (
              <Tag
                ml="6px"
                py="2px"
                size="sm"
                variant="outline"
                borderRadius="full"
                colorScheme="red"
              >
                <TagLabel>Not available</TagLabel>
              </Tag>
            )}
          </Heading>
          <Text color={endpointColor} fontSize="xl">
            {`${plugin.host}:${plugin.port}`}
          </Text>
          <Text maxH={"140px"} overflow={"clip"}>
            {plugin.info?.description}
          </Text>
        </Stack>
      </CardBody>
      <CardFooter>
        <ButtonGroup spacing="1">
          <Button
            variant="outline"
            colorScheme="brand"
            onClick={onRemovePlugin}
          >
            Remove
          </Button>
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
}
