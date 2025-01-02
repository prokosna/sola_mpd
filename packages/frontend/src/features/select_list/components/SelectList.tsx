import { CircularProgress, useColorMode } from "@chakra-ui/react";
import type { GetRowIdParams } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useCallback, useEffect, useRef } from "react";

import { ContextMenu, type ContextMenuSection } from "../../context_menu";
import { useAgGridReactData } from "../hooks/useAgGridReactData";
import { useHandleRowDataUpdated } from "../hooks/useHandleRowDataUpdated";
import { useHandleSelectionChange } from "../hooks/useHandleSelectionChange";
import { useOpenContextMenu } from "../hooks/useOpenContextMenu";
import type {
	SelectListContextMenuItemParams,
	SelectListRowValue,
} from "../types/selectListTypes";

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
};

/**
 * AG Grid-based list component with selection and context menu.
 *
 * @param props.id List ID
 * @param props.values List values
 * @param props.selectedValues Selected values
 * @param props.headerTitle Header title
 * @param props.contextMenuSections Menu sections
 * @param props.isLoading Loading state
 * @param props.allowMultipleSelection Multi-select flag
 * @param props.onItemsSelected Selection callback
 * @param props.onLoadingCompleted Loading callback
 */
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

	// Color mode
	const { colorMode } = useColorMode();

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
			<div
				ref={ref}
				className={
					colorMode === "light" ? "ag-theme-alpine" : "ag-theme-alpine-dark"
				}
				style={{ height: "100%", width: "100%", position: "relative" }}
			>
				<AgGridReact
					{...(props.headerTitle === undefined && {
						headerHeight: 0,
					})}
					{...(props.headerTitle === undefined && {
						containerStyle: {
							"--ag-borders": "none",
						},
					})}
					ref={gridRef}
					rowData={rowData}
					columnDefs={columnDefs}
					onCellContextMenu={openContextMenu}
					onSelectionChanged={handleSelectionChange}
					onRowDataUpdated={handleRowDataUpdated}
					animateRows={false}
					rowSelection={props.allowMultipleSelection ? "multiple" : "single"}
					rowMultiSelectWithClick={props.allowMultipleSelection}
					suppressRowDeselection={!props.allowMultipleSelection}
					rowDragManaged={false}
					rowDragMultiRow={false}
					suppressCellFocus={true}
					suppressMultiRangeSelection={true}
					preventDefaultOnContextMenu={true}
					rowClass={
						colorMode === "light" ? "ag-theme-alpine" : "ag-theme-alpine-dark"
					}
					getRowId={getRowId}
				/>
				{props.isLoading && (
					<CircularProgress
						top={"50%"}
						left={"50%"}
						transform={"translate(-50%, -50%) scale(1)"}
						position={"absolute"}
						isIndeterminate
						color="brand.500"
					/>
				)}
			</div>
			<ContextMenu id={props.id} sections={props.contextMenuSections} />
		</>
	);
}
