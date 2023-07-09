"use client";
import { Button, Icon, useColorMode } from "@chakra-ui/react";
import React from "react";
import { IoMoon, IoSunny } from "react-icons/io5";

export default function ColorModeSwitchButton() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <>
      <Button m={0} variant={"ghost"} onClick={toggleColorMode}>
        <Icon as={colorMode === "light" ? IoMoon : IoSunny} fontSize={24} />
      </Button>
    </>
  );
}
