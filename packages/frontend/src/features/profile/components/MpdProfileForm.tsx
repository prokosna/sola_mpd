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
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";

import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import { useAddMpdProfile } from "../hooks/useAddMpdProfile";
import { useValidateMpdProfile } from "../hooks/useValidateMpdProfile";
import type { ProfileInput } from "../types/profileTypes";

type MpdProfileFormProps = {
	onProfileCreated: () => Promise<void>;
};

/**
 * Form for MPD profile creation and validation.
 *
 * @param props Component props
 * @param props.onProfileCreated Success callback
 */
export function MpdProfileForm(props: MpdProfileFormProps) {
	const notify = useNotification();

	const [isValidated, setIsValidated] = useState(false);
	const [validationErrorMessage, setValidationErrorMessage] = useState<
		string | undefined
	>(undefined);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ProfileInput>();

	const validateMpdProfile = useValidateMpdProfile();
	const addMpdProfile = useAddMpdProfile();

	const handleTestClick = useCallback(
		async (data: ProfileInput) => {
			const result = await validateMpdProfile(data);
			if (result.isValid) {
				setValidationErrorMessage(undefined);
				setIsValidated(true);
			} else {
				setValidationErrorMessage(result.message);
				setIsValidated(false);
			}
		},
		[validateMpdProfile],
	);

	const handleSaveClick = useCallback(
		async (input: ProfileInput) => {
			await addMpdProfile(input);
			notify({
				status: "success",
				title: "MPD profile successfully created",
				description: `${input.name} profile have been created.`,
			});
			await props.onProfileCreated();
		},
		[addMpdProfile, props, notify],
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
					<FormErrorMessage>{errors.name?.message}</FormErrorMessage>
				</FormControl>
				<FormControl isInvalid={!!errors.host}>
					<FormLabel>Host</FormLabel>
					<Input
						type="text"
						placeholder="localhost"
						{...register("host", {
							required: true,
							onChange: () => {
								setIsValidated(false);
							},
						})}
					/>
					<FormErrorMessage>{errors.host?.message}</FormErrorMessage>
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
					<FormErrorMessage>{errors.port?.message}</FormErrorMessage>
				</FormControl>
			</CardBody>
			<Divider />
			<CardFooter>
				<ButtonGroup spacing="2">
					<Button variant="outline" onClick={handleSubmit(handleTestClick)}>
						Test
					</Button>
					<Button
						variant="solid"
						isDisabled={!isValidated}
						onClick={handleSubmit(handleSaveClick)}
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
