/**
 * Represents the parameters for a context menu item in a select list.
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
 * Row data type.
 */
export type SelectListRowData = {
  [tag: string]: SelectListRowValue;
};

/**
 * Column definition type.
 */
export type SelectListColumnDefinition = {
  field: string;
  flex: number;
  resizable: boolean;
  sortable: boolean;
  cellDataType?: boolean;
};
