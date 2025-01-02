import {
	Box,
	CloseButton,
	Icon,
	Input,
	InputGroup,
	InputLeftElement,
	InputRightElement,
} from "@chakra-ui/react";
import { useRef } from "react";
import { IoSearchOutline } from "react-icons/io5";

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
export function GlobalFilterBox() {
	const handleGlobalFilterTextChange =
		useHandleGlobalFilterTextChangeWithDebounce();
	const inputRef = useRef<HTMLInputElement>(null);

	return (
		<>
			<Box w="35%" minW="100px" maxW="500px">
				<InputGroup>
					<InputLeftElement
						pointerEvents="none"
						color="gray.500"
						fontSize="1.2em"
					>
						<Icon as={IoSearchOutline} />
					</InputLeftElement>
					<Input
						ref={inputRef}
						placeholder="Filter songs..."
						onChange={(e) => {
							handleGlobalFilterTextChange(e.target.value);
						}}
					/>
					<InputRightElement color="gray.500" fontSize="1.2em">
						<CloseButton
							onClick={() => {
								if (inputRef.current != null) {
									inputRef.current.value = "";
								}
								handleGlobalFilterTextChange("");
							}}
						/>
					</InputRightElement>
				</InputGroup>
			</Box>
		</>
	);
}
