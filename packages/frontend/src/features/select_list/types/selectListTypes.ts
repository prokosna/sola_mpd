export type SelectListContextMenuItemParams = {
	clickedValue: SelectListRowValue;
	selectedValues: SelectListRowValue[];
	values: SelectListRowValue[];
};

export type SelectListRowValue = string;

export type SelectListRowKeyValue = [string, SelectListRowValue];

export type SelectListRowData = {
	[tag: string]: SelectListRowValue;
};

export type SelectListColumnDefinition = {
	field: string;
	flex: number;
	resizable: boolean;
	sortable: boolean;
	cellDataType?: boolean;
};
