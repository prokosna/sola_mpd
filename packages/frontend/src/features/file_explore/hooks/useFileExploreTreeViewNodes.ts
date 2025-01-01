import { useMemo } from "react";

import { TreeNode } from "../../../lib/chakra/types/treeViewTypes";
import {
  useFileExploreFoldersState,
  useSelectedFileExploreFolderState,
  useSetSelectedFileExploreFolderState,
} from "../states/fileExploreFoldersState";

export type FileExploreTreeViewProps = {
  nodes: TreeNode[];
  selectedId?: string;
};

/**
 * Custom hook for managing File Explorer Tree View properties.
 *
 * This hook handles the state and callbacks for the file explorer tree,
 * including folder selection and tree node generation.
 *
 * @returns The tree view props or undefined if folders are not loaded
 */
export function useFileExploreTreeViewNodes() {
  const fileExploreFolders = useFileExploreFoldersState();
  const selectedFolder = useSelectedFileExploreFolderState();
  const setSelectedFileExploreFolder = useSetSelectedFileExploreFolderState();

  const treeNodes = useMemo(() => {
    if (fileExploreFolders === undefined) return undefined;

    const nodeMap = new Map<string, TreeNode>();

    fileExploreFolders.forEach((node) => {
      const elements = node.path.split("/");
      const label = elements[elements.length - 1];
      nodeMap.set(node.path, {
        id: node.path,
        label,
        children: [],
        isSelected: node.path === selectedFolder?.path,
        onClick: async (id) => {
          const folder = fileExploreFolders.find((f) => f.path === id);
          if (folder !== undefined) {
            setSelectedFileExploreFolder(folder);
          }
        },
      });
    });

    fileExploreFolders.forEach((node) => {
      const elements = node.path.split("/");
      if (elements.length > 1) {
        const parentPath = elements.slice(0, -1).join("/");
        if (nodeMap.has(parentPath)) {
          const parent = nodeMap.get(parentPath);
          const current = nodeMap.get(node.path);
          if (parent && current) {
            parent.children.push(current);
          }
        }
      }
    });

    return fileExploreFolders
      .filter((node) => !node.path.includes("/"))
      .map((node) => nodeMap.get(node.path))
      .filter((node): node is TreeNode => node !== undefined);
  }, [fileExploreFolders, selectedFolder, setSelectedFileExploreFolder]);

  if (treeNodes === undefined) return undefined;

  return treeNodes;
}
