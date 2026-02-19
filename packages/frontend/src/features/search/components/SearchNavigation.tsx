import { isNotEmpty, useForm } from "@mantine/form";
import clsx from "clsx";
import equal from "fast-deep-equal";
import {
	Panel,
	Group as PanelGroup,
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
		storage: globalThis.localStorage,
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
		<PanelGroup
			orientation="vertical"
			defaultLayout={defaultLayout}
			onLayoutChanged={onLayoutChanged}
		>
			<Panel minSize="10%" id="search-navigation-query">
				<SearchNavigationQueryEditor
					form={form}
					editingSearchStatus={editingSearchStatus}
				/>
			</Panel>
			<Separator className={clsx(styles.handle, styles.horizontal)} />
			<Panel minSize="10%" id="search-navigation-saved">
				<SearchNavigationSavedQueries form={form} />
			</Panel>
		</PanelGroup>
	);
}
