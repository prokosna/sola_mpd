"use client";
import {
  Center,
  Flex,
  Text,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  Tag,
  TagLabel,
  IconButton,
  Divider,
  SliderThumb,
  Grid,
  GridItem,
  Stack,
  Tooltip,
} from "@chakra-ui/react";
import React from "react";
import {
  IoPause,
  IoPlay,
  IoPlaySkipBack,
  IoPlaySkipForward,
  IoRepeatOutline,
  IoRestaurantOutline,
  IoShuffleOutline,
  IoStop,
  IoVolumeMute,
} from "react-icons/io5";

import { usePlayer } from "../hooks/usePlayer";

import { MpdPlayerStatusPlaybackState } from "@/models/mpd/mpd_player";

export default function Player() {
  const {
    currentSong,
    songFirstLine,
    songSecondLine,
    songThirdLine,
    playbackState,
    durationPercentage,
    volume,
    isHiRes,
    isDsd,
    formatString,
    isRepeat,
    isRandom,
    isConsume,
    onPreviousClicked,
    onStopClicked,
    onResumeClicked,
    onNextClicked,
    onRandomToggled,
    onRepeatToggled,
    onConsumeToggled,
    onVolumeClicked,
    onSeekClicked,
  } = usePlayer();

  function getFormatTag(): React.ReactNode {
    if (currentSong === undefined) {
      return <></>;
    }
    if (isDsd) {
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
    }
    return (
      <Tooltip label={formatString} placement="top-end">
        <Tag px={1} ml={2} size={"sm"} variant="outline" colorScheme="teal">
          <TagLabel>PCM</TagLabel>
        </Tag>
      </Tooltip>
    );
  }

  return (
    <>
      <Flex direction={"column"} w="100vw" h="full">
        <Slider
          m={0}
          p={0}
          w="100%"
          min={0}
          max={100}
          value={durationPercentage}
          colorScheme="brand"
          onChange={(v) => {
            onSeekClicked(v);
          }}
        >
          <SliderTrack h="10px">
            <SliderFilledTrack h="15px"></SliderFilledTrack>
          </SliderTrack>
        </Slider>
        <Grid
          className="player-surface-grid"
          templateAreas={`"info control"`}
          gridTemplateColumns={"minmax(0, 1fr) 366px"}
          h="full"
          gap="0"
        >
          <GridItem area={"info"}>
            <Flex h="full" pl="3" pt="2" align={"center"} justify={"start"}>
              <Stack spacing={1} maxW="100%">
                <Flex>
                  <Text noOfLines={1} flex={1}>
                    {songFirstLine}
                    {getFormatTag()}
                  </Text>
                </Flex>
                <Text noOfLines={1} flex={1}>
                  {songSecondLine}
                </Text>
                <Text noOfLines={1} flex={1}>
                  {songThirdLine}
                </Text>
              </Stack>
            </Flex>
          </GridItem>
          <GridItem area={"control"}>
            <Flex h="full" pr="5" align={"center"} justify={"end"}>
              <Tooltip label="Play previous" placement="top">
                <IconButton
                  isDisabled={currentSong === undefined}
                  onClick={onPreviousClicked}
                  variant="ghost"
                  colorScheme="brand"
                  aria-label="Play previous"
                  size={"md"}
                  icon={<IoPlaySkipBack size={"24"} />}
                  m={1}
                />
              </Tooltip>
              <Tooltip label="Stop" placement="top">
                <IconButton
                  isDisabled={currentSong === undefined}
                  onClick={onStopClicked}
                  variant="ghost"
                  colorScheme="brand"
                  aria-label="Stop"
                  size={"md"}
                  icon={<IoStop size={"24"} />}
                  m={1}
                />
              </Tooltip>
              {playbackState === MpdPlayerStatusPlaybackState.PAUSE ||
              playbackState === MpdPlayerStatusPlaybackState.STOP ? (
                <Tooltip label="Resume" placement="top">
                  <IconButton
                    isDisabled={currentSong === undefined}
                    onClick={onResumeClicked}
                    variant="ghost"
                    colorScheme="brand"
                    aria-label="Resume"
                    size={"md"}
                    icon={<IoPlay size={"24"} />}
                    m={1}
                  />
                </Tooltip>
              ) : playbackState === MpdPlayerStatusPlaybackState.PLAY ? (
                <Tooltip label="Pause" placement="top">
                  <IconButton
                    isDisabled={currentSong === undefined}
                    onClick={onResumeClicked}
                    variant="ghost"
                    colorScheme="brand"
                    aria-label="Pause"
                    size={"md"}
                    icon={<IoPause size={"24"} />}
                    m={1}
                  />
                </Tooltip>
              ) : (
                <Tooltip label="Disabled" placement="top">
                  <IconButton
                    isDisabled={true}
                    variant="ghost"
                    colorScheme="brand"
                    aria-label="Pause"
                    size={"md"}
                    icon={<IoPlay size={"24"} />}
                    m={1}
                  />
                </Tooltip>
              )}
              <Tooltip label="Play next" placement="top">
                <IconButton
                  isDisabled={currentSong === undefined}
                  onClick={onNextClicked}
                  variant="ghost"
                  colorScheme="brand"
                  aria-label="Play next"
                  size={"md"}
                  icon={<IoPlaySkipForward size={"24"} />}
                  m={1}
                />
              </Tooltip>
              <Center h="50%">
                <Divider orientation="vertical"></Divider>
              </Center>
              <Tooltip
                label={isRandom === true ? "Random enabled" : "Random disabled"}
                placement="top"
              >
                <IconButton
                  isDisabled={currentSong === undefined}
                  onClick={onRandomToggled}
                  variant={isRandom === true ? "solid" : "ghost"}
                  colorScheme="brand"
                  aria-label="Shuffle"
                  size={"md"}
                  icon={<IoShuffleOutline size={"24"} />}
                  m={1}
                />
              </Tooltip>
              <Tooltip
                label={isRepeat === true ? "Repeat enabled" : "Repeat disabled"}
                placement="top"
              >
                <IconButton
                  isDisabled={currentSong === undefined}
                  onClick={onRepeatToggled}
                  variant={isRepeat === true ? "solid" : "ghost"}
                  colorScheme="brand"
                  aria-label="Repeat"
                  size={"md"}
                  icon={<IoRepeatOutline size={"24"} />}
                  m={1}
                />
              </Tooltip>
              <Tooltip
                label={
                  isConsume === true ? "Consume enabled" : "Consume disabled"
                }
                placement="top"
              >
                <IconButton
                  isDisabled={currentSong === undefined}
                  onClick={onConsumeToggled}
                  variant={isConsume === true ? "solid" : "ghost"}
                  colorScheme="brand"
                  aria-label="Consume"
                  size={"md"}
                  icon={<IoRestaurantOutline size={"24"} />}
                  m={1}
                />
              </Tooltip>
              <Center h="50%">
                <Divider orientation="vertical"></Divider>
              </Center>
              <Tooltip
                label={volume < 0 ? "Disabled" : volume}
                placement="left-start"
              >
                {volume < 0 ? (
                  <IconButton
                    isDisabled={true}
                    variant={"ghost"}
                    colorScheme="brand"
                    aria-label="Volume disabled"
                    size={"md"}
                    icon={<IoVolumeMute size={"24"} />}
                    m={1}
                  />
                ) : (
                  <Center h="100%">
                    <Slider
                      ml={3}
                      aria-label="Volume"
                      defaultValue={30}
                      min={0}
                      max={100}
                      orientation="vertical"
                      h="60%"
                      onChangeEnd={(v) => onVolumeClicked(v)}
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb />
                    </Slider>
                  </Center>
                )}
              </Tooltip>
            </Flex>
          </GridItem>
        </Grid>
      </Flex>
    </>
  );
}
