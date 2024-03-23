export type ContextMenuProps<T> = {
  id: string;
  sections: ContextMenuSection<T>[];
};

export type ContextMenuSection<T> = {
  items: ContextMenuItem<T>[];
};

export type ContextMenuItem<T> = {
  name: string;
  onClick?: (params: T | undefined) => Promise<void>;
  subItems?: ContextMenuSubItem<T>[];
};

export type ContextMenuSubItem<T> = {
  name: string;
  onClick: (params: T | undefined) => Promise<void>;
};
