import { isNotEmpty, useForm } from "@mantine/form";
import clsx from "clsx";
import equal from "fast-deep-equal";
import {
	Group,
	Panel,
	Separator,
	useDefaultLayout,
} from "react-resizable-panels";

import styles from "../../../ResizeHandle.module.css";
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
	const savedSearches = useSavedSearchesState();
	const editingSearchStatus = useEditingSearchStatusState();
	const setEditingSearchStatus = useSetEditingSearchState();
	const { defaultLayout, onLayoutChanged } = useDefaultLayout({
		id: "search-navigation",
		panelIds: ["search-navigation-query", "search-navigation-saved"],
		storage: localStorage,
	});

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
		<Group
			id="search-navigation"
			orientation="vertical"
			defaultLayout={defaultLayout}
			onLayoutChanged={onLayoutChanged}
		>
			<Panel id="search-navigation-query" minSize="20%">
				<SearchNavigationQueryEditor
					form={form}
					editingSearchStatus={editingSearchStatus}
				/>
			</Panel>
			<Separator className={clsx(styles.handle, styles.horizontal)} />
			<Panel id="search-navigation-saved" minSize="20%">
				<SearchNavigationSavedQueries form={form} />
			</Panel>
		</Group>
	);
}
