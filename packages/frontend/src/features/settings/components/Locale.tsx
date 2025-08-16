import { Select, Stack, Title } from "@mantine/core";
import {
	useLocaleState,
	useSetLocaleState,
	useSupportedLocalesState,
} from "../states/settingsLocale";

export function Locale() {
	const localeState = useLocaleState();
	const supportedLocalesState = useSupportedLocalesState();
	const setLocaleState = useSetLocaleState();

	return (
		<>
			<Stack gap={16}>
				<Title order={1} size="lg">
					Locale (for language-aware sorting)
				</Title>
				<Select
					value={localeState}
					size="md"
					w="200"
					onChange={(value) => {
						if (value == null) {
							return;
						}
						setLocaleState(value);
					}}
					data={Object.entries(supportedLocalesState).map(
						([localeName, localeCode]) => ({
							label: localeName,
							value: localeCode,
						}),
					)}
				/>
			</Stack>
		</>
	);
}
