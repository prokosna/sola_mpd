import { TreeNodeId } from "@naisutech/react-tree";
import { useCallback, useEffect, useMemo } from "react";

import { useAppStore } from "../../global/store/AppStore";

export function useFileExploreTreePane() {
  const profile = useAppStore((state) => state.profileState?.currentProfile);
  const pullFileExploreFolders = useAppStore(
    (state) => state.pullFileExploreFolders
  );
  const updateSelectedFileExploreFolder = useAppStore(
    (state) => state.updateSelectedFileExploreFolder
  );
  const fileExploreFolders = useAppStore((state) => state.fileExploreFolders);

  // Initial loading
  useEffect(() => {
    if (profile === undefined) {
      return;
    }
    pullFileExploreFolders(profile);
  }, [profile, pullFileExploreFolders]);

  const data = useMemo(() => {
    if (fileExploreFolders === undefined) {
      return undefined;
    }

    return fileExploreFolders.map((songFolder) => {
      const id = songFolder.path;
      const elms = songFolder.path.split("/");
      const parentId = elms.length > 1 ? elms.slice(0, -1).join("/") : null;
      const label = elms.slice(-1)[0];
      return {
        id,
        label,
        parentId,
      };
    });
  }, [fileExploreFolders]);

  const onSongFoldersSelected = useCallback(
    (nodes: TreeNodeId[]) => {
      if (fileExploreFolders === undefined) {
        return;
      }
      const selectedNodes = fileExploreFolders.filter((v) =>
        nodes.includes(v.path)
      );
      const selectedNode = selectedNodes[0];
      if (selectedNode === undefined) {
        return;
      }
      updateSelectedFileExploreFolder(selectedNode);
    },
    [fileExploreFolders, updateSelectedFileExploreFolder]
  );

  return {
    data,
    onSongFoldersSelected,
  };
}
