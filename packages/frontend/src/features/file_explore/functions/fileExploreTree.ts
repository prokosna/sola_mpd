import type { Folder } from "@sola_mpd/shared/src/models/file_explore_pb.js";

export type FileExploreTreeNode = {
	id: string;
	label: string;
	children: FileExploreTreeNode[];
	isSelected: boolean;
};

export function buildFolderTree(
	folders: Folder[],
	selectedPath: string | undefined,
): FileExploreTreeNode[] {
	const nodeMap = new Map<string, FileExploreTreeNode>();

	for (const folder of folders) {
		const elements = folder.path.split("/");
		const label = elements[elements.length - 1];
		nodeMap.set(folder.path, {
			id: folder.path,
			label,
			children: [],
			isSelected: folder.path === selectedPath,
		});
	}

	for (const folder of folders) {
		const elements = folder.path.split("/");
		if (elements.length > 1) {
			const parentPath = elements.slice(0, -1).join("/");
			const parent = nodeMap.get(parentPath);
			const current = nodeMap.get(folder.path);
			if (parent && current) {
				parent.children.push(current);
			}
		}
	}

	return folders
		.filter((folder) => !folder.path.includes("/"))
		.map((folder) => nodeMap.get(folder.path))
		.filter((node): node is FileExploreTreeNode => node !== undefined);
}
