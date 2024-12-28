import { IconButton, Tooltip } from "@chakra-ui/react";

export type PlayerControlsButtonProps = {
  label: string;
  isDisabled: boolean;
  onButtonClicked: () => Promise<void>;
  icon: React.ReactElement;
  variant: string;
};

/**
 * Renders a player control button with a tooltip.
 *
 * @param props - The properties for the PlayerControlsButton component
 * @param props.label - The label text for the button and tooltip
 * @param props.isDisabled - Whether the button is disabled
 * @param props.onButtonClicked - The function to be called when the button is clicked
 * @param props.icon - The icon to be displayed on the button
 * @param props.variant - The visual variant of the button
 * @returns A PlayerControlsButton component
 */
export function PlayerControlsButton(props: PlayerControlsButtonProps) {
  return (
    <>
      <Tooltip label={props.label} placement="top">
        <IconButton
          isDisabled={props.isDisabled}
          onClick={props.onButtonClicked}
          variant={props.variant}
          colorScheme="brand"
          aria-label={props.label}
          size={"md"}
          icon={props.icon}
          m={1}
        />
      </Tooltip>
    </>
  );
}
