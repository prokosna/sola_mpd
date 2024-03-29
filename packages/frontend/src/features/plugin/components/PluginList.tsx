import {
  AbsoluteCenter,
  Card,
  CardBody,
  IconButton,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { IoAdd } from "react-icons/io5";

import { CenterSpinner } from "../../loading";
import { usePluginDisplayColors } from "../hooks/usePluginDisplayColors";
import { usePluginState } from "../states/persistent";

import { PluginListInfoCard } from "./PluginListInfoCard";

type PluginListProps = {
  onOpen: () => void;
};

export function PluginList(props: PluginListProps) {
  const pluginState = usePluginState();
  const { unavailableColor, addPluginColor } = usePluginDisplayColors();

  if (pluginState === undefined) {
    return <CenterSpinner className="layout-border-top layout-border-left" />;
  }

  return (
    <>
      <Wrap spacing="30px">
        {pluginState.plugins.map((plugin, index) => (
          <WrapItem key={plugin.info?.name + `_${index}`}>
            <PluginListInfoCard {...{ plugin }} />
          </WrapItem>
        ))}
        <WrapItem>
          <Card
            w="300px"
            h="350px"
            backgroundColor={unavailableColor}
            variant="elevated"
            borderRadius={"36px"}
          >
            <CardBody>
              <AbsoluteCenter axis="both">
                <IconButton
                  color={addPluginColor}
                  aria-label="add plugin"
                  variant="ghost"
                  fontSize={"96px"}
                  size="8xl"
                  icon={<IoAdd />}
                  onClick={props.onOpen}
                />
              </AbsoluteCenter>
            </CardBody>
          </Card>
        </WrapItem>
      </Wrap>
    </>
  );
}
