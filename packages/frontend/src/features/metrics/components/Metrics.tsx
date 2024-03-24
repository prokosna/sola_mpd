import { List, ListItem, ListIcon, Text, Flex } from "@chakra-ui/react";
import { ReactNode } from "react";
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoRemoveCircleOutline,
} from "react-icons/io5";

import { useMetrics } from "../states/tracker";
import { Metric } from "../types/metric";

export function Metrics() {
  const metrics = useMetrics();

  function getTextWithIcon(metric: Metric): ReactNode {
    const text = `${metric.page} (${metric.action}): ${Math.floor(metric.elapsedTimeMillisecond)} ms`;
    if (metric.elapsedTimeMillisecond < 500) {
      return (
        <>
          <ListIcon as={IoCheckmarkCircleOutline} color="green.400" />
          <Text fontSize={"xs"}>{text}</Text>
        </>
      );
    } else if (metric.elapsedTimeMillisecond < 1000) {
      return (
        <>
          <ListIcon as={IoRemoveCircleOutline} color="gray.400" />
          <Text fontSize={"xs"}>{text}</Text>
        </>
      );
    } else {
      return (
        <>
          <ListIcon as={IoCloseCircleOutline} color="red.400" />
          <Text fontSize={"xs"}>{text}</Text>
        </>
      );
    }
  }

  return (
    <>
      <List spacing={3}>
        {metrics
          .filter((metric) => Math.floor(metric.elapsedTimeMillisecond) > 0)
          .map((metric, index) => (
            <ListItem key={index}>
              <Flex>{getTextWithIcon(metric)}</Flex>
            </ListItem>
          ))}
      </List>
    </>
  );
}
