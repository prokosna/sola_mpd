/**
 * Context menu item parameters.
 *
 * @property clickedValue Clicked row value
 * @property selectedValues Selected row values
 * @property values All row values
 */
export type SelectListContextMenuItemParams = {
  clickedValue: SelectListRowValue;
  selectedValues: SelectListRowValue[];
  values: SelectListRowValue[];
};

/**
 * Row value type.
 */
export type SelectListRowValue = string;

/**
 * Row key-value pair.
 */
export type SelectListRowKeyValue = [string, SelectListRowValue];

/**
 * Row data structure.
 */
export type SelectListRowData = {
  [tag: string]: SelectListRowValue;
};

/**
 * Column configuration.
 *
 * @property field Column ID
 * @property flex Width ratio
 * @property resizable Resize flag
 * @property sortable Sort flag
 * @property cellDataType Data type flag
 */
export type SelectListColumnDefinition = {
  field: string;
  flex: number;
  resizable: boolean;
  sortable: boolean;
  cellDataType?: boolean;
};
