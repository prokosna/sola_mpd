"use client";
import {
  Box,
  Button,
  Divider,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import React from "react";

import { useCardStats } from "../hooks/useCardStats";

export default function CardStats() {
  const {
    songsCount,
    artistsCount,
    albumsCount,
    totalDuration,
    isSelectedVisible,
    isDatabaseUpdating,
    onDatabaseUpdateClicked,
  } = useCardStats();

  return (
    <>
      <Box w="100%" h="full" pb={0} px={6} pt={2}>
        <Stat>
          <StatLabel color={isSelectedVisible ? "brand.400" : undefined}>
            {isSelectedVisible ? "Songs Selected" : "Songs in DB"}
          </StatLabel>
          <StatNumber>
            {songsCount === undefined ? "Loading" : songsCount}
          </StatNumber>
          <StatHelpText></StatHelpText>
        </Stat>
        <Divider mb={2}></Divider>
        <Stat>
          <StatLabel color={isSelectedVisible ? "brand.400" : undefined}>
            {isSelectedVisible ? "Artists of Selected Songs" : "Artists in DB"}
          </StatLabel>
          <StatNumber>
            {artistsCount === undefined ? "Loading" : artistsCount}
          </StatNumber>
          <StatHelpText></StatHelpText>
        </Stat>
        <Divider mb={2}></Divider>
        <Stat>
          <StatLabel color={isSelectedVisible ? "brand.400" : undefined}>
            {isSelectedVisible ? "Albums of Selected Songs" : "Albums in DB"}
          </StatLabel>
          <StatNumber>
            {albumsCount === undefined ? "Loading" : albumsCount}
          </StatNumber>
          <StatHelpText></StatHelpText>
        </Stat>
        <Divider mb={2}></Divider>
        <Stat>
          <StatLabel color={isSelectedVisible ? "brand.400" : undefined}>
            {isSelectedVisible
              ? "Duration of Selected Songs"
              : "Duration of Songs in DB"}
          </StatLabel>
          <StatNumber>
            {totalDuration === undefined ? "Loading" : totalDuration}
          </StatNumber>
          <StatHelpText></StatHelpText>
        </Stat>
        <Divider mb={2}></Divider>
        <Box pb={2}>
          <Button
            isLoading={isDatabaseUpdating}
            loadingText="Updating DB"
            w="100%"
            variant="outline"
            onClick={() => {
              if (!isDatabaseUpdating) {
                onDatabaseUpdateClicked();
              }
            }}
          >
            Update DB
          </Button>
        </Box>
      </Box>
    </>
  );
}
