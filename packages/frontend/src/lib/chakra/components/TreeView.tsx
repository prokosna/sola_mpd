import {
	Accordion,
	AccordionButton,
	AccordionIcon,
	AccordionItem,
	AccordionPanel,
	Box,
	List,
	ListItem,
} from "@chakra-ui/react";
import * as React from "react";

import type { TreeNode } from "../types/treeViewTypes";

export type TreeViewProps = {
	nodes: TreeNode[];
};

export function TreeView(props: TreeViewProps) {
	return (
		<Accordion allowMultiple>
			{props.nodes.map((item) => (
				<React.Fragment key={item.id}>
					{item.children.length > 0 ? (
						<AccordionItem>
							<AccordionButton>
								<AccordionIcon />
								<Box flex="1" textAlign="left" isTruncated>
									{item.label}
								</Box>
							</AccordionButton>
							<AccordionPanel pb={3}>
								<TreeView nodes={item.children} />
							</AccordionPanel>
						</AccordionItem>
					) : (
						<List>
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
								<Box isTruncated>{item.label}</Box>
							</ListItem>
						</List>
					)}
				</React.Fragment>
			))}
		</Accordion>
	);
}
