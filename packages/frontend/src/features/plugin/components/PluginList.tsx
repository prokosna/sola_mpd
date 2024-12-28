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
import { usePluginState } from "../states/pluginState";

import { PluginListInfoCard } from "./PluginListInfoCard";

type PluginListProps = {
  onOpen: () => void;
};

/**
 * PluginList component displays a list of plugins and an add button.
 * It handles the rendering of plugin cards and the add plugin button.
 *
 * @param props - The props for the PluginList component
 * @param props.onOpen - Function to call when the add plugin button is clicked
 * @returns JSX element representing the PluginList
 */
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
