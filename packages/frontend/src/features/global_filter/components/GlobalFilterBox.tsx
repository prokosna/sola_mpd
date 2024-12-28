import {
  Box,
  CloseButton,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from "@chakra-ui/react";
import { useRef } from "react";
import { IoSearchOutline } from "react-icons/io5";

import { useHandleGlobalFilterTextChangeWithDebounce } from "../hooks/useHandleGlobalFilterTextChangeWithDebounce";

/**
 * GlobalFilterBox component provides a search input for global filtering.
 * It uses a debounced text change handler to optimize performance.
 *
 * @returns A React component that renders an input box for global filtering.
 */
export function GlobalFilterBox() {
  const handleGlobalFilterTextChange =
    useHandleGlobalFilterTextChangeWithDebounce();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Box w="35%" minW="100px" maxW="500px">
        <InputGroup>
          <InputLeftElement
            pointerEvents="none"
            color="gray.500"
            fontSize="1.2em"
          >
            <Icon as={IoSearchOutline}></Icon>
          </InputLeftElement>
          <Input
            ref={inputRef}
            placeholder="Filter songs..."
            onChange={(e) => {
              handleGlobalFilterTextChange(e.target.value);
            }}
          />
          <InputRightElement color="gray.500" fontSize="1.2em">
            <CloseButton
              onClick={() => {
                if (inputRef.current != null) {
                  inputRef.current.value = "";
                }
                handleGlobalFilterTextChange("");
              }}
            />
          </InputRightElement>
        </InputGroup>
      </Box>
    </>
  );
}
