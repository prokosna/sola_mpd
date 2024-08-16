export type ContextMenuProps<T> = {
  id: string;
  sections: ContextMenuSection<T>[];
};

export type ContextMenuSection<T> = {
  items: (ContextMenuItem<T> | ContextMenuSubItemsParent<T>)[];
};

export type ContextMenuItem<T> = {
  type: "Item";
  name: string;
  onClick: (params: T | undefined) => Promise<void>;
};

export type ContextMenuSubItemsParent<T> = {
  type: "SubItemsParent";
  name: string;
  subItems: ContextMenuSubItem<T>[];
};

export type ContextMenuSubItem<T> = {
  name: string;
  onClick: (params: T | undefined) => Promise<void>;
};
