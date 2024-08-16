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
  useToast,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";

import { useAddMpdProfileAction } from "../actions/useAddMpdProfileAction";
import { useValidateMpdProfileInputsAction } from "../actions/useValidateMpdProfileInputsAction";
import { useMpdProfileState } from "../queries/useMpdProfileState";
import { MpdProfileInput } from "../types/profileTypes";

type MpdProfileFormProps = {
  onComplete: () => Promise<void>;
};

export function MpdProfileForm(props: MpdProfileFormProps) {
  const toast = useToast();
  const [isValidated, setIsValidated] = useState(false);
  const [validationErrorMessage, setValidationErrorMessage] = useState<
    string | undefined
  >(undefined);
  const mpdProfileState = useMpdProfileState();
  const validateMpdProfileInputsAction =
    useValidateMpdProfileInputsAction()(mpdProfileState);
  const addMpdProfileAction = useAddMpdProfileAction()(mpdProfileState);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MpdProfileInput>();

  const onClickTest = useCallback(
    async (mpdProfileInput: MpdProfileInput) => {
      const result = await validateMpdProfileInputsAction(mpdProfileInput);
      setValidationErrorMessage(result.error);
      setIsValidated(result.isOk);
    },
    [validateMpdProfileInputsAction],
  );

  const onClickSave = useCallback(
    async (mpdProfileInput: MpdProfileInput) => {
      await props.onComplete();
      await addMpdProfileAction(mpdProfileInput);
      toast({
        status: "success",
        title: "MPD profile successfully created",
        description: `${mpdProfileInput.name} profile have been created.`,
      });
    },
    [addMpdProfileAction, props, toast],
  );

  return (
    <Card w="100%" h="100%">
      <CardHeader>
        <Heading>MPD Server Information</Heading>
      </CardHeader>
      <CardBody>
        <FormControl isInvalid={!!errors.name}>
          <FormLabel>Name</FormLabel>
          <Input
            type="text"
            placeholder="Default"
            {...register("name", {
              required: true,
              onChange: () => {
                setIsValidated(false);
              },
            })}
          />
          <FormErrorMessage>
            {errors.name && errors.name.message}
          </FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.host}>
          <FormLabel>Host</FormLabel>
          <Input
            type="text"
            placeholder="host.docker.internal"
            {...register("host", {
              required: true,
              onChange: () => {
                setIsValidated(false);
              },
            })}
          />
          <FormErrorMessage>
            {errors.host && errors.host.message}
          </FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={!!errors.port}>
          <FormLabel>Port</FormLabel>
          <Input
            type="text"
            placeholder="6600"
            {...register("port", {
              required: true,
              onChange: () => {
                setIsValidated(false);
              },
              valueAsNumber: true,
            })}
          />
          <FormErrorMessage>
            {errors.port && errors.port.message}
          </FormErrorMessage>
        </FormControl>
      </CardBody>
      <Divider />
      <CardFooter>
        <ButtonGroup spacing="2">
          <Button variant="outline" onClick={handleSubmit(onClickTest)}>
            Test
          </Button>
          <Button
            variant="solid"
            isDisabled={!isValidated}
            onClick={handleSubmit(onClickSave)}
          >
            Save
          </Button>
          <Center>
            {isValidated ? (
              <Text color="brand.500" as="b">
                Successfully connected!
              </Text>
            ) : undefined}
            {validationErrorMessage !== undefined ? (
              <Text color="error.500" as="b">
                {validationErrorMessage}
              </Text>
            ) : undefined}
          </Center>
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
}
