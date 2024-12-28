import { Button, Icon } from "@chakra-ui/react";
import { IoSettings } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

import { ROUTE_HOME_SETTINGS } from "../../../const/routes";

/**
 * A button component that navigates to the settings page when clicked.
 * Uses react-router's useNavigate hook for navigation and Chakra UI for styling.
 *
 * @returns A Button component with a settings icon.
 */
export function SettingsEntryButton() {
  const navigate = useNavigate();

  return (
    <>
      <Button
        m={0}
        p={0}
        variant={"ghost"}
        onClick={() => {
          navigate(ROUTE_HOME_SETTINGS);
        }}
      >
        <Icon as={IoSettings} fontSize={24} />
      </Button>
    </>
  );
}
