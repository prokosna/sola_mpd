import { Center, Spinner } from "@chakra-ui/react";

/**
 * A component that displays a centered spinner.
 * @param {Object} props - The component props.
 * @param {string} [props.className] - Optional CSS class name for additional styling.
 * @returns {JSX.Element} A centered spinner component.
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
