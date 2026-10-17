import {
	Button,
	Divider,
	Group,
	NumberInput,
	Text,
	TextInput,
} from "@mantine/core";
import { isInRange, isNotEmpty, useForm } from "@mantine/form";
import { useAtomValue } from "jotai";
import { useCallback, useState } from "react";
import { useNotification } from "../../../lib/mantine/hooks/useNotification";
import {
	buildProfileInputFromForm,
	validateProfileName,
} from "../functions/mpdProfileFormValidation";
import { useAddMpdProfile } from "../hooks/useAddMpdProfile";
import { useValidateMpdProfile } from "../hooks/useValidateMpdProfile";
import { mpdProfileStateAtom } from "../states/atoms/mpdProfileAtom";
import type { ValidationResult } from "../types/validationTypes";

type MpdProfileFormProps = {
	onProfileCreated: () => Promise<void>;
	onCancelled: () => Promise<void>;
	disableCancelButton?: boolean;
};

export function MpdProfileForm(props: MpdProfileFormProps) {
	const notify = useNotification();
	const validateMpdProfile = useValidateMpdProfile();
	const addMpdProfile = useAddMpdProfile();
	const mpdProfiles = useAtomValue(mpdProfileStateAtom)?.profiles;

	const [validationResult, setValidationResult] = useState<
		ValidationResult | undefined
	>(undefined);
	const isValidated = validationResult?.isValid === true;

	const form = useForm({
		mode: "uncontrolled",
		initialValues: {
			name: "",
			host: "",
			port: undefined as number | undefined,
			password: "",
		},
		validate: {
			name: (value) =>
				validateProfileName(
					value,
					mpdProfiles?.map((profile) => profile.name) ?? [],
				),
			host: isNotEmpty("Host is required"),
			port: isInRange(
				{ min: 1, max: 65535 },
				"Port must be between 1 and 65535",
			),
		},
	});

	const handleTest = useCallback(
		async (values: typeof form.values) => {
			const profileInput = buildProfileInputFromForm(values);
			setValidationResult(await validateMpdProfile(profileInput));
		},
		[validateMpdProfile],
	);

	const handleSubmit = useCallback(
		async (values: typeof form.values) => {
			const profileInput = buildProfileInputFromForm(values);
			await addMpdProfile(profileInput);
			notify({
				status: "success",
				title: "MPD profile successfully created",
				description: `${values.name} profile have been created.`,
			});
			await props.onProfileCreated();
			setValidationResult(undefined);
			form.reset();
		},
		[addMpdProfile, props, notify, form],
	);

	const handleClose = useCallback(() => {
		setValidationResult(undefined);
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
			<TextInput
				w="400"
				label="Password"
				placeholder="(optional)"
				type="password"
				key={form.key("password")}
				{...form.getInputProps("password")}
			/>
			<Divider my={8} />
			<Group justify="space-between">
				<Group>
					{isValidated ? <Text>Successfully connected!</Text> : undefined}
					{validationResult?.isValid === false ? (
						<Text c="red">{validationResult.message}</Text>
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
			{validationResult?.hint !== undefined ? (
				<Text w="400" mt={8} size="sm">
					{validationResult.hint}
				</Text>
			) : undefined}
		</form>
	);
}
