import { Box, Center } from "@chakra-ui/react";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { ROUTE_HOME_PLAY_QUEUE } from "../../const/routes";
import {
  MpdProfileForm,
  useCurrentMpdProfileState,
} from "../../features/profile";

export function LandingPage() {
  const navigate = useNavigate();

  const profile = useCurrentMpdProfileState();

  useEffect(() => {
    if (profile !== undefined) {
      navigate(ROUTE_HOME_PLAY_QUEUE);
    }
  }, [navigate, profile]);

  const mpdProfileFormProps = {
    onComplete: useCallback(async () => {
      navigate(ROUTE_HOME_PLAY_QUEUE);
    }, [navigate]),
  };

  return (
    <>
      <Box w="100%" h="100vh" bgImage="url('/bg.png')">
        <Center w="100%" h="100%" position="relative">
          <Center zIndex="1" position="absolute" w="500px">
            <MpdProfileForm {...mpdProfileFormProps}></MpdProfileForm>
          </Center>
        </Center>
      </Box>
    </>
  );
}
