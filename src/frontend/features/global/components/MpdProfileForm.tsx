"use client";
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Center,
  Divider,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Text,
} from "@chakra-ui/react";
import React from "react";

import { useMpdProfileForm } from "../hooks/useMpdProfileForm";

export function MpdProfileForm() {
  const form = useMpdProfileForm();

  return (
    <Card w="100%" h="100%">
      <CardHeader>
        <Heading>MPD Server Information</Heading>
      </CardHeader>
      <CardBody>
        <FormControl isInvalid={form.nameError !== ""}>
          <FormLabel>Name</FormLabel>
          <Input
            type="text"
            placeholder="Default"
            value={form.name}
            onChange={form.onNameChange}
          />
          {form.nameError !== "" ? (
            <FormErrorMessage>{form.nameError}</FormErrorMessage>
          ) : undefined}
        </FormControl>
        <FormControl isInvalid={form.hostError !== ""}>
          <FormLabel>Host</FormLabel>
          <Input
            type="text"
            placeholder="localhost"
            value={form.host}
            onChange={form.onHostChange}
          />
          {form.hostError !== "" ? (
            <FormErrorMessage>{form.hostError}</FormErrorMessage>
          ) : undefined}
        </FormControl>
        <FormControl isInvalid={form.portError !== ""}>
          <FormLabel>Port</FormLabel>
          <Input
            type="number"
            placeholder="6600"
            value={form.port}
            onChange={form.onPortChange}
          />
          {form.portError !== "" ? (
            <FormErrorMessage>{form.portError}</FormErrorMessage>
          ) : undefined}
        </FormControl>
      </CardBody>
      <Divider />
      <CardFooter>
        <ButtonGroup spacing="2">
          <Button variant="outline" onClick={form.validate}>
            Test
          </Button>
          <Button
            variant="solid"
            isDisabled={!form.isValidated}
            onClick={form.submit}
          >
            Save
          </Button>
          <Center>
            {form.isValidated ? (
              <Text color="brand.500" as="b">
                Successfully connected!
              </Text>
            ) : undefined}
            {form.validationError !== "" ? (
              <Text color="error.500" as="b">
                {form.validationError}
              </Text>
            ) : undefined}
          </Center>
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
}
