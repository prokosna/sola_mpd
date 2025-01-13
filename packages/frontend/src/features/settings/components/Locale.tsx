import { Select, Text, VStack } from "@chakra-ui/react";
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
			<VStack spacing={"12px"} align={"start"}>
				<Text fontSize="md">Locale (for language-aware sorting)</Text>
				<Select
					value={localeState}
					size="md"
					width="200px"
					onChange={(e) => setLocaleState(e.target.value)}
				>
					{Object.entries(supportedLocalesState).map(
						([localeName, localeCode]) => (
							<option key={localeCode} value={localeCode}>
								{localeName}
							</option>
						),
					)}
				</Select>
			</VStack>
		</>
	);
}
