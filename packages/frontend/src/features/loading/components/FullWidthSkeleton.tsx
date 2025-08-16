import { Skeleton, Stack } from "@mantine/core";

/**
 * A skeleton loading placeholder that spans the full width of its container.
 *
 * Features:
 * - Shows 6 lines of animated loading placeholders
 * - Consistent spacing (4 units) between lines
 * - Uniform height (2 units) for each skeleton line
 * - Padding around content (6 units)
 * - Takes up full width and height of container
 *
 * @component
 */
export const FullWidthSkeleton = (props: { lineCount?: number }) => {
	const { lineCount = 6 } = props;

	return (
		<Stack w="100%" h="100%" p={16}>
			{Array.from({ length: lineCount }, (_, i) => {
				const key = `skeleton-${i}`;
				const isLast = i === lineCount - 1;

				return <Skeleton key={key} h={6} w={isLast ? "70%" : "100%"} />;
			})}
		</Stack>
	);
};
