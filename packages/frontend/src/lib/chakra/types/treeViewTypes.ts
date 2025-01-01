export type TreeNode = {
  id: string;
  label: string;
  children: TreeNode[];
  isSelected: boolean;
  onClick?: (id: string) => Promise<void>;
};
