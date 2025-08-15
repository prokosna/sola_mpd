import { useCallback, useState } from "react";

import {
	Button,
	Divider,
	Group,
	NumberInput,
	Text,
	TextInput,
} from "@mantine/core";
import { isInRange, isNotEmpty, useForm } from "@mantine/form";
import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import { useAddMpdProfile } from "../hooks/useAddMpdProfile";
import { useValidateMpdProfile } from "../hooks/useValidateMpdProfile";
import { useMpdProfileState } from "../states/mpdProfileState";
import type { ProfileInput } from "../types/profileTypes";

type MpdProfileFormProps = {
	onProfileCreated: () => Promise<void>;
	onCancelled: () => Promise<void>;
	disableCancelButton?: boolean;
};

/**
 * Form for MPD profile creation and validation.
 *
 * @param props Component props
 * @param props.onProfileCreated Success callback
 */
export function MpdProfileForm(props: MpdProfileFormProps) {
	const notify = useNotification();
	const validateMpdProfile = useValidateMpdProfile();
	const addMpdProfile = useAddMpdProfile();
	const mpdProfiles = useMpdProfileState()?.profiles;

	const [isValidated, setIsValidated] = useState(false);
	const [validationErrorMessage, setValidationErrorMessage] = useState<
		string | undefined
	>(undefined);

	const form = useForm({
		mode: "uncontrolled",
		initialValues: {
			name: "",
			host: "",
			port: undefined,
		},
		validate: {
			name: (value) => {
				if (value === "") {
					return "Name is required";
				}
				if (mpdProfiles?.find((profile) => profile.name === value)) {
					return "Name already exists";
				}
			},
			host: isNotEmpty("Host is required"),
			port: isInRange(
				{ min: 1, max: 65535 },
				"Port must be between 1 and 65535",
			),
		},
	});

	const handleTest = useCallback(
		async (values: typeof form.values) => {
			const profileInput: ProfileInput = {
				name: values.name,
				host: values.host,
				port: values.port ?? 6600,
			};
			const result = await validateMpdProfile(profileInput);
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

	const handleSubmit = useCallback(
		async (values: typeof form.values) => {
			const profileInput: ProfileInput = {
				name: values.name,
				host: values.host,
				port: values.port ?? 6600,
			};
			await addMpdProfile(profileInput);
			notify({
				status: "success",
				title: "MPD profile successfully created",
				description: `${values.name} profile have been created.`,
			});
			await props.onProfileCreated();
			setIsValidated(false);
			setValidationErrorMessage(undefined);
			form.reset();
		},
		[addMpdProfile, props, notify, form],
	);

	const handleClose = useCallback(() => {
		setIsValidated(false);
		setValidationErrorMessage(undefined);
		form.reset();
		props.onCancelled();
	}, [form, props]);

	return (
		<form onSubmit={form.onSubmit(handleSubmit)}>
			<TextInput
				w="400"
				withAsterisk
				label="Name"
				placeholder="Default"
				key={form.key("name")}
				{...form.getInputProps("name")}
			/>
			<TextInput
				w="400"
				withAsterisk
				label="Host"
				placeholder="localhost"
				key={form.key("host")}
				{...form.getInputProps("host")}
			/>
			<NumberInput
				w="400"
				withAsterisk
				label="Port"
				placeholder="6600"
				key={form.key("port")}
				{...form.getInputProps("port")}
			/>
			<Divider my={8} />
			<Group justify="space-between">
				<Group>
					{isValidated ? <Text>Successfully connected!</Text> : undefined}
					{validationErrorMessage !== undefined ? (
						<Text c="red">{validationErrorMessage}</Text>
					) : undefined}
				</Group>
				<Group justify="flex-end">
					<Button
						variant="outline"
						onClick={() => handleTest(form.getValues())}
					>
						Test
					</Button>
					<Button type="submit" disabled={!isValidated}>
						Save
					</Button>
					{props.disableCancelButton ? null : (
						<Button variant="default" onClick={handleClose}>
							Cancel
						</Button>
					)}
				</Group>
			</Group>
		</form>
	);
}
