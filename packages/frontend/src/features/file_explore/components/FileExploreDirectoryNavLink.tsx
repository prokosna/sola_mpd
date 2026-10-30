import { NavLink } from "@mantine/core";

import type { TreeNode } from "../types/treeViewTypes";

export function FileExploreDirectoryNavLink({ node }: { node: TreeNode }) {
	const hasChildren = node.children?.length > 0;
	return (
		<NavLink
			key={node.id}
			label={node.label}
			active={node.isSelected}
			onClick={
				hasChildren
					? undefined
					: () => {
							if (node.onClick !== undefined) {
								node.onClick(node.id);
							}
						}
			}
			noWrap
		>
			{hasChildren
				? node.children?.map((child) => (
						<FileExploreDirectoryNavLink key={child.id} node={child} />
					))
				: undefined}
		</NavLink>
	);
}
