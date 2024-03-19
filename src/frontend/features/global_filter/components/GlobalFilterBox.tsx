"use client";
import {
  Box,
  CloseButton,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from "@chakra-ui/react";
import React, { useRef } from "react";
import { IoSearchOutline } from "react-icons/io5";

import { useGlobalFilterBox } from "../hooks/useGlobalFilterBox";

export default function GlobalFilterBox() {
  const { onTextChanged, onTextCleared } = useGlobalFilterBox();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Box w="35%" minW="300px" maxW="500px">
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
            placeholder="Type search words..."
            onChange={(e) => {
              onTextChanged(e.target.value);
            }}
          />
          <InputRightElement color="gray.500" fontSize="1.2em">
            <CloseButton
              onClick={() => {
                if (inputRef.current != null) {
                  inputRef.current.value = "";
                }
                onTextCleared();
              }}
            />
          </InputRightElement>
        </InputGroup>
      </Box>
    </>
  );
}
