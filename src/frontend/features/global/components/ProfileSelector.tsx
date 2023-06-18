"use client";
import { Box, Select } from "@chakra-ui/react";
import React from "react";

import { useProfileSelector } from "../hooks/useProfileSelector";

export default function ProfileSelector() {
  const { profileState, enabledOutputDevice, onChangeProfile } =
    useProfileSelector();

  return (
    <>
      <Box px={0} minW="300px">
        {profileState?.currentProfile === undefined ||
        enabledOutputDevice === undefined ? (
          <Select placeholder="Loading profiles..."></Select>
        ) : (
          <Select
            value={profileState.currentProfile.name}
            onChange={(e) => onChangeProfile(e.target.value)}
          >
            {profileState.profiles.map((v, i) => {
              const isSelected = v.name === profileState.currentProfile?.name;
              const text =
                v.name + (isSelected ? ` - ${enabledOutputDevice?.name}` : "");
              return (
                <option key={i} value={v.name}>
                  {text}
                </option>
              );
            })}
          </Select>
        )}
      </Box>
    </>
  );
}
