import { Box, Divider, Stack } from "@mantine/core";
import { TextToMusicSearchContent } from "./TextToMusicSearchContent";
import { TextToMusicSearchQuery } from "./TextToMusicSearchQuery";

export function TextToMusicSearch() {
	return (
		<Stack w="100%" h="100%" gap={0}>
			<Box>
				<TextToMusicSearchQuery />
			</Box>
			<Divider />
			<Box style={{ flex: 1, minHeight: 0 }}>
				<TextToMusicSearchContent />
			</Box>
		</Stack>
	);
}
