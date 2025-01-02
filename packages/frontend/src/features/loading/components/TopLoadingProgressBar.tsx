import { Box, Progress } from "@chakra-ui/react";

/**
 * A progress bar that appears at the top of the viewport to indicate loading.
 *
 * Features:
 * - Fixed position at the top of the viewport
 * - Indeterminate animation for ongoing processes
 * - Full viewport width coverage
 * - High z-index to stay above other content
 *
 * @component
 */
export function TopLoadingProgressBar() {
	return (
		<>
			<Box width="100%" position="fixed" top="0" zIndex="1">
				<Progress isIndeterminate />
			</Box>
		</>
	);
}
