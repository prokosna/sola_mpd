import { useMemo } from "react";

import {
	useFileExploreFoldersState,
	useSelectedFileExploreFolderState,
	useSetSelectedFileExploreFolderState,
} from "../states/fileExploreFoldersState";
import type { TreeNode } from "../types/treeViewTypes";

/**
 * Properties for the file explorer tree view.
 *
 * Features:
 * - Hierarchical folder structure
 * - Selection state tracking
 *
 * @property nodes - Tree nodes representing folder hierarchy
 * @property selectedId - Currently selected folder path
 */
export type FileExploreTreeViewProps = {
	nodes: TreeNode[];
	selectedId?: string;
};

/**
 * Hook for generating and managing file explorer tree view structure.
 *
 * Features:
 * - Hierarchical folder organization
 * - Path-based node relationships
 * - Selection state management
 * - Automatic node mapping
 *
 * Implementation:
 * - Converts flat folder list to tree structure
 * - Maintains parent-child relationships
 * - Handles folder selection events
 * - Memoizes tree structure for performance
 *
 * @returns Root-level tree nodes or undefined if loading
 */
export function useFileExploreTreeViewNodes() {
	const fileExploreFolders = useFileExploreFoldersState();
	const selectedFolder = useSelectedFileExploreFolderState();
	const setSelectedFileExploreFolder = useSetSelectedFileExploreFolderState();

	const treeNodes = useMemo(() => {
		if (fileExploreFolders === undefined) return undefined;

		const nodeMap = new Map<string, TreeNode>();

		for (const node of fileExploreFolders) {
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
		}

		for (const node of fileExploreFolders) {
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
		}

		return fileExploreFolders
			.filter((node) => !node.path.includes("/"))
			.map((node) => nodeMap.get(node.path))
			.filter((node): node is TreeNode => node !== undefined);
	}, [fileExploreFolders, selectedFolder, setSelectedFileExploreFolder]);

	if (treeNodes === undefined) return undefined;

	return treeNodes;
}
