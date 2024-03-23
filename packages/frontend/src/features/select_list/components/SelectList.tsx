import { CircularProgress, useColorMode } from "@chakra-ui/react";
import { AgGridReact } from "ag-grid-react";
import { useEffect, useRef } from "react";

import { ContextMenu, ContextMenuSection } from "../../context_menu";
import { useAgGridReactData } from "../hooks/useAgGridReactData";
import { useOnOpenContextMenu } from "../hooks/useOnOpenContextMenu";
import { useOnRowDataUpdated } from "../hooks/useOnRowDataUpdated";
import { useOnSelectionChanged } from "../hooks/useOnSelectionChanged";
import { SelectListContextMenuItemParams } from "../types/selectList";

export type SelectListProps = {
  id: string;
  values: string[];
  selectedValues: string[];
  header?: string;
  contextMenuSections: ContextMenuSection<SelectListContextMenuItemParams>[];
  isLoading: boolean;
  allowMultipleSelection: boolean;
  onSelectValues: (selectedValues: string[]) => Promise<void>;
  onCompleteLoading: () => Promise<void>;
};

export function SelectList(props: SelectListProps) {
  const ref = useRef(null);
  const gridRef = useRef<AgGridReact>(null);

  // AgGridReact format
  const { rowData, columnDefs } = useAgGridReactData(
    props.values,
    props.header,
  );

  // Context menu
  const onOpenContextMenu = useOnOpenContextMenu(props.id);

  // Handlers
  const onSelectionChanged = useOnSelectionChanged(props.onSelectValues);
  const onRowDataUpdated = useOnRowDataUpdated(props.onCompleteLoading);

  // Color mode
  const { colorMode } = useColorMode();

  // Sync with selectedValues which can be updated outside of this component
  const model = gridRef.current?.api.getModel();
  useEffect(() => {
    if (model === undefined) {
      return;
    }

    model.forEachNode((node) => {
      const value = String(node.data.key);
      if (node.isSelected() && !props.selectedValues.includes(value)) {
        node.setSelected(false);
      } else if (!node.isSelected() && props.selectedValues.includes(value)) {
        node.setSelected(true);
      }
    });
  }, [props.selectedValues, model]);

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
          {...(props.header === undefined && {
            headerHeight: 0,
          })}
          {...(props.header === undefined && {
            containerStyle: {
              "--ag-borders": "none",
            },
          })}
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          onCellContextMenu={onOpenContextMenu}
          onSelectionChanged={onSelectionChanged}
          onRowDataUpdated={onRowDataUpdated}
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
        ></AgGridReact>
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
      <ContextMenu
        id={props.id}
        sections={props.contextMenuSections}
      ></ContextMenu>
    </>
  );
}
