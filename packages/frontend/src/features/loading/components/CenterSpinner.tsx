import { Center, Spinner } from "@chakra-ui/react";

export function CenterSpinner({ className }: { className?: string }) {
  return (
    <>
      <Center w="100%" h="100%" className={className}>
        <Spinner boxSize="24" thickness="6px" color="brand.500"></Spinner>
      </Center>
    </>
  );
}
