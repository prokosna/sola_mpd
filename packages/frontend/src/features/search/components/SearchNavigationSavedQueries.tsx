import { Box } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { FullWidthSkeleton } from "../../loading";
import { SelectList } from "../../select_list";
import { useSavedSearchesSelectListProps } from "../hooks/useSavedSearchesSelectListProps";
import type { SearchFormValues } from "../types/searchTypes";

export function SearchNavigationSavedQueries({
	form,
}: {
	form: UseFormReturnType<SearchFormValues>;
}) {
	const selectListProps = useSavedSearchesSelectListProps({ form });

	if (selectListProps === undefined) {
		return <FullWidthSkeleton />;
	}

	return (
		<Box w="100%" h="100%">
			<SelectList {...selectListProps} />
		</Box>
	);
}
