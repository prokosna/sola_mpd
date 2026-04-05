import {
	ActionIcon,
	Button,
	Divider,
	Group,
	Stack,
	Text,
	TextInput,
	useComputedColorScheme,
	useMantineTheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconSearch, IconX } from "@tabler/icons-react";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { refreshTextToMusicSearchSongsActionAtom } from "../states/actions/refreshTextToMusicSearchSongsActionAtom";
import { setIsTextToMusicSearchLoadingActionAtom } from "../states/actions/setIsTextToMusicSearchLoadingActionAtom";
import { setTextToMusicSearchTextActionAtom } from "../states/actions/setTextToMusicSearchTextActionAtom";
import { isTextToMusicSearchLoadingAtom } from "../states/atoms/textToMusicSearchUiAtom";

export function TextToMusicSearchQuery() {
	const scheme = useComputedColorScheme();
	const theme = useMantineTheme();

	const setIsTextToMusicSearchLoading = useSetAtom(
		setIsTextToMusicSearchLoadingActionAtom,
	);
	const isTextToMusicSearchLoading = useAtomValue(
		isTextToMusicSearchLoadingAtom,
	);
	const setTextToMusicSearchText = useSetAtom(
		setTextToMusicSearchTextActionAtom,
	);
	const refreshTextToMusicSearchSongsState = useSetAtom(
		refreshTextToMusicSearchSongsActionAtom,
	);

	const form = useForm({
		mode: "uncontrolled",
		initialValues: {
			query: "",
		},
		validate: {
			query: (value) => {
				if (value === "") {
					return "Query is required.";
				}
				const regex = /^[a-zA-Z0-9 ]*$/;
				if (!regex.test(value)) {
					return "Query must contain only ASCII characters.";
				}
				return undefined;
			},
		},
	});

	const handleSubmit = useCallback(
		(values: typeof form.values) => {
			const query = values.query;
			setIsTextToMusicSearchLoading(true);
			setTextToMusicSearchText(query);
			refreshTextToMusicSearchSongsState();
		},
		[
			setIsTextToMusicSearchLoading,
			setTextToMusicSearchText,
			refreshTextToMusicSearchSongsState,
		],
	);

	return (
		<Stack h="100%" gap={0}>
			<Group
				w="100%"
				mih="32px"
				mah="32px"
				bg={scheme === "light" ? theme.colors.gray[2] : theme.colors.dark[6]}
				px={8}
				m={0}
			>
				<Text fw={700} size="sm">
					Text-to-Music
				</Text>
			</Group>
			<Divider p={0} m={0} />
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Group p={16} wrap="nowrap">
					<TextInput
						size="md"
						w="500"
						maw="50%"
						leftSection={
							<ActionIcon variant="transparent" color="gray.5">
								<IconSearch />
							</ActionIcon>
						}
						rightSection={
							<ActionIcon
								variant="transparent"
								color="gray.5"
								onClick={() => {
									form.reset();
								}}
							>
								<IconX />
							</ActionIcon>
						}
						key={form.key("query")}
						{...form.getInputProps("query")}
					/>
					<Button type="submit" size="md" loading={isTextToMusicSearchLoading}>
						Search
					</Button>
				</Group>
			</form>
		</Stack>
	);
}
