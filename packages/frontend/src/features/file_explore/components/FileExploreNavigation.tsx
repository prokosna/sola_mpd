import {
	Divider,
	Group,
	ScrollArea,
	Stack,
	Text,
	useComputedColorScheme,
	useMantineTheme,
} from "@mantine/core";
import { NavLink } from "@mantine/core";
import { FullWidthSkeleton } from "../../loading";
import { useFileExploreTreeViewNodes } from "../hooks/useFileExploreTreeViewNodes";
import type { TreeNode } from "../types/treeViewTypes";

/**
 * Navigation component for the file explorer's folder tree.
 *
 * Features:
 * - Hierarchical folder structure display
 * - Interactive folder navigation
 * - Loading state handling
 * - Scrollable container
 * - Theme-aware styling
 *
 * Layout:
 * - Tree view for folder hierarchy
 * - Overflow handling for long lists
 * - Loading skeleton during data fetch
 *
 * @returns Rendered navigation component with tree view
 */
function DirectoryNavLink({ node }: { node: TreeNode }) {
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
						<DirectoryNavLink key={child.id} node={child} />
					))
				: undefined}
		</NavLink>
	);
}

export function FileExploreNavigation() {
	const scheme = useComputedColorScheme();
	const theme = useMantineTheme();
	const nodes = useFileExploreTreeViewNodes();

	if (nodes === undefined) {
		return <FullWidthSkeleton />;
	}

	return (
		<>
			<Stack h="100%" gap={0}>
				<Group
					w="100%"
					mih="32px"
					mah="32px"
					bg={scheme === "light" ? theme.colors.gray[2] : theme.colors.dark[6]}
					px={8}
					m={0}
				>
					<Text fw={700} size="sm">
						Directories
					</Text>
				</Group>
				<Divider p={0} m={0} />
				<ScrollArea h="100%" style={{ background: "transparent" }}>
					{nodes.map((node) => (
						<DirectoryNavLink key={node.id} node={node} />
					))}
				</ScrollArea>
			</Stack>
		</>
	);
}
