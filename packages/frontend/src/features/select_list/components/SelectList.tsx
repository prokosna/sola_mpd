import type { BodyScrollEvent, GetRowIdParams } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useCallback, useEffect, useRef } from "react";

import { useAgGridTheme } from "../../../lib/agGrid/hooks/useAgGridTheme";
import { ContextMenu, type ContextMenuSection } from "../../context_menu";
import { CenterSpinnerOverlay } from "../../loading/components/CenterSpinnerOverlay";
import { useAgGridReactData } from "../hooks/useAgGridReactData";
import { useHandleRowDataUpdated } from "../hooks/useHandleRowDataUpdated";
import { useHandleSelectionChange } from "../hooks/useHandleSelectionChange";
import { useOpenContextMenu } from "../hooks/useOpenContextMenu";
import type {
	SelectListContextMenuItemParams,
	SelectListRowValue,
} from "../types/selectListTypes";

const DEFAULT_NEAR_BOTTOM_THRESHOLD = 5;

export type SelectListProps = {
	id: string;
	values: SelectListRowValue[];
	selectedValues: SelectListRowValue[];
	headerTitle?: string;
	contextMenuSections: ContextMenuSection<SelectListContextMenuItemParams>[];
	isLoading: boolean;
	allowMultipleSelection: boolean;
	onItemsSelected: (selectedValues: SelectListRowValue[]) => Promise<void>;
	onLoadingCompleted: () => Promise<void>;
	// Fires when the user has scrolled within `nearBottomThreshold` rows of the
	// last row. Callers may use this to trigger progressive loading. Only fired
	// for vertical scroll events.
	onScrolledNearBottom?: () => void;
	nearBottomThreshold?: number;
};

export function SelectList(props: SelectListProps) {
	const ref = useRef(null);
	const gridRef = useRef<AgGridReact>(null);

	// AgGridReact format
	const { rowData, columnDefs } = useAgGridReactData(
		props.values,
		props.headerTitle,
	);

	// Context menu
	const openContextMenu = useOpenContextMenu(props.id);

	// Get Row ID
	const getRowId = useCallback((params: GetRowIdParams) => {
		return String(params.data.key);
	}, []);

	// Handlers
	const handleSelectionChange = useHandleSelectionChange(props.onItemsSelected);
	const handleRowDataUpdated = useHandleRowDataUpdated(
		props.onLoadingCompleted,
	);

	const onScrolledNearBottom = props.onScrolledNearBottom;
	const nearBottomThreshold =
		props.nearBottomThreshold ?? DEFAULT_NEAR_BOTTOM_THRESHOLD;
	const handleBodyScroll = useCallback(
		(event: BodyScrollEvent) => {
			if (
				onScrolledNearBottom === undefined ||
				event.direction !== "vertical"
			) {
				return;
			}
			const total = event.api.getDisplayedRowCount();
			const lastIndex = event.api.getLastDisplayedRowIndex();
			if (total > 0 && lastIndex >= total - nearBottomThreshold) {
				onScrolledNearBottom();
			}
		},
		[onScrolledNearBottom, nearBottomThreshold],
	);

	// Color mode
	const theme = useAgGridTheme();

	// Sync with selectedValues which can be updated outside of this component
	const api = gridRef.current?.api;
	useEffect(() => {
		if (api === undefined) {
			return;
		}

		api.forEachNode((node) => {
			const value = String(node.data.key);
			if (node.isSelected() && !props.selectedValues.includes(value)) {
				node.setSelected(false);
			} else if (!node.isSelected() && props.selectedValues.includes(value)) {
				node.setSelected(true);
			}
		});
	}, [props.selectedValues, api]);

	return (
		<>
			<CenterSpinnerOverlay visible={props.isLoading}>
				<div ref={ref} style={{ height: "100%", width: "100%" }}>
					<AgGridReact
						{...(props.headerTitle === undefined && {
							headerHeight: 0,
						})}
						{...(props.headerTitle === undefined && {
							containerStyle: {
								"--ag-wrapper-border": "none", // Remove border to avoid duplication with layout border
							},
						})}
						ref={gridRef}
						theme={theme}
						rowData={rowData}
						columnDefs={columnDefs}
						onCellContextMenu={openContextMenu}
						onSelectionChanged={handleSelectionChange}
						onRowDataUpdated={handleRowDataUpdated}
						onBodyScroll={handleBodyScroll}
						animateRows={false}
						rowSelection={{
							mode: props.allowMultipleSelection ? "multiRow" : "singleRow",
							checkboxes: false,
							headerCheckbox: false,
							enableSelectionWithoutKeys: props.allowMultipleSelection,
							enableClickSelection: true,
						}}
						rowDragManaged={false}
						rowDragMultiRow={false}
						suppressCellFocus={true}
						preventDefaultOnContextMenu={true}
						getRowId={getRowId}
					/>
				</div>
			</CenterSpinnerOverlay>
			<ContextMenu id={props.id} sections={props.contextMenuSections} />
		</>
	);
}
