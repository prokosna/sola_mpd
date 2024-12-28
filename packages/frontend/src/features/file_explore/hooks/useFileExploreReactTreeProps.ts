import { TreeNodeId } from "@naisutech/react-tree";
import { useCallback, useMemo } from "react";

import {
  useFileExploreFoldersState,
  useSetSelectedFileExploreFolderState,
} from "../states/fileExploreFoldersState";

/**
 * Custom hook for managing File Explorer React Tree properties.
 *
 * This hook handles the state and callbacks for the file explorer tree,
 * including folder selection and tree node generation.
 *
 * @returns An object containing the tree nodes and folder selection handler.
 */
export function useFileExploreReactTreeProps() {
  const fileExploreFolders = useFileExploreFoldersState();
  const setSelectedFileExploreFolder = useSetSelectedFileExploreFolderState();

  const nodes = useMemo(() => {
    if (fileExploreFolders === undefined) {
      return;
    }
    return fileExploreFolders.map((folder) => {
      const id = folder.path;
      const elements = folder.path.split("/");
      const parentId =
        elements.length > 1 ? elements.slice(0, -1).join("/") : null;
      const label = elements.slice(-1)[0];
      return {
        id,
        label,
        parentId,
      };
    });
  }, [fileExploreFolders]);

  const handleFolderSelected = useCallback(
    (nodes: TreeNodeId[]) => {
      if (fileExploreFolders === undefined) {
        return;
      }
      const selectedNodes = fileExploreFolders.filter((folder) =>
        nodes.includes(folder.path),
      );
      if (selectedNodes.length === 0) {
        return;
      }
      setSelectedFileExploreFolder(selectedNodes[0]);
    },
    [fileExploreFolders, setSelectedFileExploreFolder],
  );

  return {
    nodes,
    handleFolderSelected,
  };
}
