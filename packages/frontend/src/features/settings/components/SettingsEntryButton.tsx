import { Button, Icon } from "@chakra-ui/react";
import { IoSettings } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

import { ROUTE_HOME_SETTINGS } from "../../../const/routes";

/**
 * Settings page navigation button.
 *
 * This component routes users to the settings interface and maintains consistent styling.
 *
 * @component
 * @example
 * ```tsx
 * // In header or navigation area:
 * <SettingsEntryButton />
 * ```
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
