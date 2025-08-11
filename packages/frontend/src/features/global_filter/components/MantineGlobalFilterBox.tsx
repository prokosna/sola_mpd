import { useRef } from "react";

import { ActionIcon, Group, TextInput } from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";
import { useHandleGlobalFilterTextChangeWithDebounce } from "../hooks/useHandleGlobalFilterTextChangeWithDebounce";

/**
 * Search input component for global song filtering.
 *
 * Features:
 * - Debounced text input handling
 * - Clear button functionality
 * - Search icon indication
 * - Responsive width constraints
 * - Theme-aware styling
 *
 * Layout:
 * - Left: Search icon
 * - Center: Text input field
 * - Right: Clear button
 *
 * Performance:
 * - Debounced input handling to prevent excessive updates
 * - Ref-based input value management
 *
 * @returns Rendered search input component
 */
export function MantineGlobalFilterBox() {
	const handleGlobalFilterTextChange =
		useHandleGlobalFilterTextChangeWithDebounce();
	const inputRef = useRef<HTMLInputElement>(null);

	return (
		<>
			<Group w="35%" miw="100px" maw="500px">
				<TextInput
					ref={inputRef}
					size="md"
					placeholder="Filter songs..."
					leftSection={
						<ActionIcon variant="transparent" color="gray.5">
							<IconSearch />
						</ActionIcon>
					}
					leftSectionPointerEvents="none"
					onChange={(e) => {
						handleGlobalFilterTextChange(e.target.value);
					}}
					rightSection={
						<ActionIcon
							variant="transparent"
							color="gray.5"
							onClick={() => {
								if (inputRef.current != null) {
									inputRef.current.value = "";
								}
								handleGlobalFilterTextChange("");
							}}
						>
							<IconX />
						</ActionIcon>
					}
				/>
			</Group>
		</>
	);
}
