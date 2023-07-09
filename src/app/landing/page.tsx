"use client";
import { Center } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

import { ROUTE_HOME_PLAY_QUEUE } from "@/const";
import { MpdProfileForm } from "@/frontend/features/global/components/MpdProfileForm";
import { useAppStore } from "@/frontend/features/global/store/AppStore";

export default function Landing() {
  const profile = useAppStore((state) => state.profileState?.currentProfile);
  const router = useRouter();

  useEffect(() => {
    if (profile !== undefined) {
      router.replace(ROUTE_HOME_PLAY_QUEUE);
    }
  }, [profile, router]);

  return (
    <>
      <Center w="100%" h="100%" position="relative">
        <Center zIndex="1" position="absolute" w="500px">
          <MpdProfileForm></MpdProfileForm>
        </Center>
      </Center>
    </>
  );
}
