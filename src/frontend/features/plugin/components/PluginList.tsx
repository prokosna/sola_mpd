"use client";
import {
  Box,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  Heading,
  Stack,
  Wrap,
  WrapItem,
  Text,
  Button,
  AbsoluteCenter,
  IconButton,
  Tag,
  TagLabel,
  useDisclosure,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";
import { IoAdd } from "react-icons/io5";

import { usePluginListLogic } from "../hooks/usePluginListLogic";

import PluginAddModal from "./PluginAddModal";

export default function PluginList() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { plugins, removePlugin } = usePluginListLogic();
  const availableColor = useColorModeValue("brand.50", "brand.700");
  const unavailableColor = useColorModeValue("gray.50", "gray.600");
  const endpointColor = useColorModeValue("brand.600", "brand.300");
  const addPluginColor = useColorModeValue("gray.200", "gray.700");

  return (
    <>
      <Box
        className="layout-border-top layout-border-left"
        w="100%"
        h="full"
        p="30px"
      >
        <Wrap spacing="30px">
          {plugins.map((plugin, index) => (
            <WrapItem key={plugin.info?.name + `_${index}`}>
              <Card
                w="300px"
                h="350px"
                backgroundColor={
                  plugin.isAvailable ? availableColor : unavailableColor
                }
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
                      onClick={() => removePlugin(plugin)}
                    >
                      Remove
                    </Button>
                  </ButtonGroup>
                </CardFooter>
              </Card>
            </WrapItem>
          ))}
          <WrapItem></WrapItem>
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
                    onClick={() => onOpen()}
                  />
                </AbsoluteCenter>
              </CardBody>
            </Card>
          </WrapItem>
        </Wrap>
      </Box>

      <PluginAddModal onClose={onClose} isOpen={isOpen}></PluginAddModal>
    </>
  );
}
