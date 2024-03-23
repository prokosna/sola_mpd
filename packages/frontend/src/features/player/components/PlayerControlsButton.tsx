import { IconButton, Tooltip } from "@chakra-ui/react";

export type PlayerControlsButtonProps = {
  label: string;
  isDisabled: boolean;
  onClick: () => Promise<void>;
  icon: React.ReactElement;
  variant: string;
};

export function PlayerControlsButton(props: PlayerControlsButtonProps) {
  return (
    <>
      <Tooltip label={props.label} placement="top">
        <IconButton
          isDisabled={props.isDisabled}
          onClick={props.onClick}
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
