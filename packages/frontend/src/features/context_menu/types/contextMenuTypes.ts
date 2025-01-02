/**
 * Properties for the ContextMenu component.
 *
 * Features:
 * - Unique menu identification
 * - Multiple menu sections
 * - Generic data type support
 *
 * @template T - Type of data passed to click handlers
 */
export type ContextMenuProps<T> = {
	id: string;
	sections: ContextMenuSection<T>[];
};

/**
 * Section within a context menu.
 * Sections are separated by dividers and contain a list of menu items.
 *
 * @template T - Type of data passed to item click handlers
 */
export type ContextMenuSection<T> = {
	items: ContextMenuItem<T>[];
};

/**
 * Item within a context menu section.
 * Can be a simple clickable item or a submenu parent.
 *
 * Features:
 * - Display name
 * - Optional click handler
 * - Optional nested items
 *
 * @template T - Type of data passed to click handler
 */
export type ContextMenuItem<T> = {
	name: string;
	onClick?: (params: T | undefined) => Promise<void>;
	subItems?: ContextMenuSubItem<T>[];
};

/**
 * Nested item within a submenu.
 * Always requires a click handler.
 *
 * Features:
 * - Display name
 * - Required click handler
 * - No further nesting support
 *
 * @template T - Type of data passed to click handler
 */
export type ContextMenuSubItem<T> = {
	name: string;
	onClick: (params: T | undefined) => Promise<void>;
};
