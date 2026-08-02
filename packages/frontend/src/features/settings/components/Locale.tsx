import { Select, Stack, Title } from "@mantine/core";
import { useAtomValue, useSetAtom } from "jotai";
import { localeAtom, supportedLocalesAtom } from "../states/atoms/localeAtom";

export function Locale() {
	const localeState = useAtomValue(localeAtom);
	const supportedLocalesState = useAtomValue(supportedLocalesAtom);
	const setLocaleState = useSetAtom(localeAtom);

	return (
		<Stack gap={12}>
			<Title order={2} size="md">
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
	);
}
