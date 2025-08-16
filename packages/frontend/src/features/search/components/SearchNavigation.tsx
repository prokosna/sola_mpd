import { Allotment } from "allotment";

import { Stack, useComputedColorScheme } from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";
import equal from "fast-deep-equal";
import { useSavedSearchesState } from "../states/savedSearchesState";
import {
	useEditingSearchStatusState,
	useSetEditingSearchState,
} from "../states/searchEditState";
import {
	EditingSearchStatus,
	type SearchFormValues,
} from "../types/searchTypes";
import {
	convertSearchToFormValues,
	getDefaultSearch,
} from "../utils/searchUtils";
import { SearchNavigationQueryEditor } from "./SearchNavigationQueryEditor";
import { SearchNavigationSavedQueries } from "./SearchNavigationSavedQueries";

/**
 * Search navigation section.
 *
 * Contains query editor and saved queries.
 *
 * @returns Navigation component
 */
export function SearchNavigation() {
	const scheme = useComputedColorScheme();
	const savedSearches = useSavedSearchesState();
	const editingSearchStatus = useEditingSearchStatusState();
	const setEditingSearchStatus = useSetEditingSearchState();

	const form = useForm<SearchFormValues>({
		mode: "uncontrolled",
		initialValues: convertSearchToFormValues(getDefaultSearch()),
		validate: {
			name: isNotEmpty("Name is required."),
		},
		onValuesChange(values) {
			const search = savedSearches?.searches.find(
				(s) => s.name === values.name,
			);
			if (search === undefined) {
				setEditingSearchStatus(EditingSearchStatus.NOT_SAVED);
				return;
			}
			if (!equal(values, convertSearchToFormValues(search))) {
				setEditingSearchStatus(EditingSearchStatus.NOT_SAVED);
				return;
			}
			setEditingSearchStatus(EditingSearchStatus.SAVED);
		},
	});

	return (
		<>
			<Stack h="100%" gap={0}>
				<Allotment
					className={scheme === "light" ? "allotment-light" : "allotment-dark"}
					vertical={true}
				>
					<Allotment.Pane minSize={20}>
						<SearchNavigationQueryEditor
							form={form}
							editingSearchStatus={editingSearchStatus}
						/>
					</Allotment.Pane>
					<Allotment.Pane minSize={20}>
						<SearchNavigationSavedQueries form={form} />
					</Allotment.Pane>
				</Allotment>
			</Stack>
		</>
	);
}
