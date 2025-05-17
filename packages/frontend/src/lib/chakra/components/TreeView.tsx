import { Accordion, Box, List, ListItem } from "@chakra-ui/react";
import * as React from "react";

import type { TreeNode } from "../types/treeViewTypes";

export type TreeViewProps = {
	nodes: TreeNode[];
};

export function TreeView(props: TreeViewProps) {
	return (
		<Accordion.Root multiple>
			{props.nodes.map((item) => (
				<React.Fragment key={item.id}>
					{item.children.length > 0 ? (
						<Accordion.Item value={item.id}>
							<Accordion.ItemTrigger>
								<Box flex="1" textAlign="left" truncate>
									{item.label}
								</Box>
							</Accordion.ItemTrigger>
							<Accordion.ItemContent pb={3}>
								<TreeView nodes={item.children} />
							</Accordion.ItemContent>
						</Accordion.Item>
					) : (
						<List.Root>
							<ListItem
								px={4}
								py={1}
								cursor={item.onClick ? "pointer" : "default"}
								onClick={() => item.onClick?.(item.id)}
								_hover={
									item.onClick
										? {
												bg: "ag-grid.hover",
											}
										: undefined
								}
								bg={item.isSelected ? "ag-grid.selected" : undefined}
								transition="all 0.3s"
							>
								<Box truncate>{item.label}</Box>
							</ListItem>
						</List.Root>
					)}
				</React.Fragment>
			))}
		</Accordion.Root>
	);
}
