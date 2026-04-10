import { Skeleton, Stack } from "@mantine/core";

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
