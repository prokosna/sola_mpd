import {
	ActionIcon,
	Badge,
	Breadcrumbs,
	Group,
	Tooltip,
	useComputedColorScheme,
} from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useCallback } from "react";
import { removeBrowserSelectionValue } from "../functions/browserFilter";
import type { BrowserSelection } from "../types/browserSelection";

type BrowserNavigationBreadcrumbsViewProps = {
	selection?: BrowserSelection;
	updateSelection: (selection: BrowserSelection) => Promise<void>;
};

export function BrowserNavigationBreadcrumbsView(
	props: BrowserNavigationBreadcrumbsViewProps,
) {
	const { selection, updateSelection } = props;
	const scheme = useComputedColorScheme();

	const handleResetClick = useCallback(() => {
		updateSelection([]);
	}, [updateSelection]);

	const handleCloseClick = useCallback(
		(tag: BrowserSelection[number]["tag"], value: string) => {
			if (selection === undefined) {
				return;
			}
			updateSelection(removeBrowserSelectionValue(selection, tag, value));
		},
		[selection, updateSelection],
	);

	if (selection === undefined || selection.length === 0) {
		return null;
	}

	return (
		<Group
			w="100%"
			h="100%"
			justify="space-between"
			bg={scheme === "dark" ? "dark.9" : "brand.1"}
		>
			<Group>
				<ActionIcon
					variant="transparent"
					c="gray.5"
					size="md"
					onClick={handleResetClick}
				>
					<IconX />
				</ActionIcon>
			</Group>

			<Group justify="center" flex={1}>
				<Breadcrumbs separator=">" separatorMargin="xs">
					{selection.map((entry) => (
						<Group key={`breadcrumb_item_${entry.tag}`} gap={0}>
							{entry.values.map((value) => (
								<Tooltip key={value} label={value} withArrow>
									<Badge
										c="brand"
										variant="outline"
										size="xs"
										maw={150}
										rightSection={
											<ActionIcon
												size="xs"
												color="gray.5"
												variant="transparent"
												onClick={() => handleCloseClick(entry.tag, value)}
											>
												<IconX />
											</ActionIcon>
										}
									>
										{value}
									</Badge>
								</Tooltip>
							))}
						</Group>
					))}
				</Breadcrumbs>
			</Group>
		</Group>
	);
}
