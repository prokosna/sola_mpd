/**
 * Props for the ContextMenu component.
 * @template T - The type of data passed to the onClick handlers.
 */
export type ContextMenuProps<T> = {
  id: string;
  sections: ContextMenuSection<T>[];
};

/**
 * Represents a section in the context menu.
 * @template T - The type of data passed to the onClick handlers of menu items.
 */
export type ContextMenuSection<T> = {
  items: ContextMenuItem<T>[];
};

/**
 * Represents an item in the context menu.
 * @template T - The type of data passed to the onClick handler.
 */
export type ContextMenuItem<T> = {
  name: string;
  onClick?: (params: T | undefined) => Promise<void>;
  subItems?: ContextMenuSubItem<T>[];
};

/**
 * Represents a sub-item in the context menu.
 * @template T - The type of data passed to the onClick handler.
 */
export type ContextMenuSubItem<T> = {
  name: string;
  onClick: (params: T | undefined) => Promise<void>;
};
