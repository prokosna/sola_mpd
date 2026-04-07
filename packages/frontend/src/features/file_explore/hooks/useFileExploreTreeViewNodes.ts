import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useMemo } from "react";

import {
	buildFolderTree,
	type FileExploreTreeNode,
} from "../functions/fileExploreTree";
import { setSelectedFileExploreFolderActionAtom } from "../states/actions/setSelectedFileExploreFolderActionAtom";
import {
	fileExploreFoldersAtom,
	selectedFileExploreFolderAtom,
} from "../states/atoms/fileExploreFoldersAtom";
import type { TreeNode } from "../types/treeViewTypes";

export type FileExploreTreeViewProps = {
	nodes: TreeNode[];
	selectedId?: string;
};

export function useFileExploreTreeViewNodes() {
	const fileExploreFolders = useAtomValue(fileExploreFoldersAtom);
	const selectedFolder = useAtomValue(selectedFileExploreFolderAtom);
	const setSelectedFileExploreFolder = useSetAtom(
		setSelectedFileExploreFolderActionAtom,
	);

	const handleClick = useCallback(
		async (id: string) => {
			const folder = fileExploreFolders?.find((f) => f.path === id);
			if (folder !== undefined) {
				setSelectedFileExploreFolder(folder);
			}
		},
		[fileExploreFolders, setSelectedFileExploreFolder],
	);

	const treeNodes = useMemo(() => {
		if (fileExploreFolders === undefined) return undefined;

		const tree = buildFolderTree(fileExploreFolders, selectedFolder?.path);

		const addOnClick = (nodes: FileExploreTreeNode[]): TreeNode[] =>
			nodes.map((node) => ({
				...node,
				onClick: handleClick,
				children: addOnClick(node.children),
			}));

		return addOnClick(tree);
	}, [fileExploreFolders, selectedFolder, handleClick]);

	return treeNodes;
}
