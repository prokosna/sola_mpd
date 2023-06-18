"use client";
import { Button, Icon } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import React from "react";
import { IoSettings } from "react-icons/io5";

import { ROUTE_HOME_SETTINGS } from "@/const";

export default function SettingEntryButton() {
  const router = useRouter();
  return (
    <>
      <Button
        m={0}
        variant={"ghost"}
        onClick={() => {
          router.push(ROUTE_HOME_SETTINGS);
        }}
      >
        <Icon as={IoSettings} fontSize={24} />
      </Button>
    </>
  );
}
