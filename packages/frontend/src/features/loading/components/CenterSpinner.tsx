import { Center, Spinner } from "@chakra-ui/react";

/**
 * A component that displays a large, centered loading spinner.
 *
 * Features:
 * - Fixed size (24px) spinner with thick lines (6px)
 * - Uses brand color for consistency
 * - Centered both horizontally and vertically
 * - Takes up full width and height of container
 *
 * @component
 * @param props.className Optional CSS class for styling the container
 */
export function CenterSpinner({ className }: { className?: string }) {
  return (
    <>
      <Center w="100%" h="100%" className={className}>
        <Spinner boxSize="24" thickness="6px" color="brand.500"></Spinner>
      </Center>
    </>
  );
}
