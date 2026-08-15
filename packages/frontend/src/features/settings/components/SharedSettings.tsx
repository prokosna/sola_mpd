import { Button, Card, Group, Stack, Text, Title } from "@mantine/core";
import { useNavigate } from "react-router";
import {
	ROUTE_HOME_BROWSER,
	ROUTE_HOME_PLUGIN,
	ROUTE_HOME_RECENTLY_ADDED,
	ROUTE_HOME_SEARCH,
} from "../../../const/routes";
import { ScopeNote } from "./ScopeNote";

// Nothing here is edited on this tab; it lists what other devices see and
// links to where each one is edited.
const SHARED_SECTIONS: {
	title: string;
	description: string;
	route?: string;
	linkLabel?: string;
}[] = [
	{
		title: "Saved Searches",
		description: "Create, rename, and delete saved searches.",
		route: ROUTE_HOME_SEARCH,
		linkLabel: "Open Search",
	},
	{
		title: "Browser filters",
		description:
			"Right-click a filter panel to change which tag it browses by. " +
			"The selection itself is not shared.",
		route: ROUTE_HOME_BROWSER,
		linkLabel: "Open Browser",
	},
	{
		title: "Recently Added filters",
		description:
			"Right-click a filter panel to change which tag it browses by.",
		route: ROUTE_HOME_RECENTLY_ADDED,
		linkLabel: "Open Recently Added",
	},
	{
		title: "Song table columns",
		description:
			'Right-click a column header and choose "Edit Columns" to change ' +
			"which columns appear. Column widths and sort order stay on each device.",
	},
	{
		title: "Plugins",
		description: "Register, connect, and remove plugins.",
		route: ROUTE_HOME_PLUGIN,
		linkLabel: "Open Plugins",
	},
];

export function SharedSettings() {
	const navigate = useNavigate();

	return (
		<Stack gap={16}>
			<Stack gap={4}>
				<Title order={1} size="lg">
					Shared Settings
				</Title>
				<ScopeNote scope="workspace" />
			</Stack>
			<Text size="sm" c="dimmed" maw={720}>
				Stored on the server. Every device connected to it sees the same values.
			</Text>
			{SHARED_SECTIONS.map((section) => (
				<Card key={section.title} withBorder maw={720}>
					<Stack gap={8}>
						<Title order={2} size="md">
							{section.title}
						</Title>
						<Text size="sm">{section.description}</Text>
						{section.route !== undefined && (
							<Group>
								<Button
									variant="outline"
									size="xs"
									onClick={() => {
										if (section.route === undefined) {
											return;
										}
										navigate(section.route);
									}}
								>
									{section.linkLabel}
								</Button>
							</Group>
						)}
					</Stack>
				</Card>
			))}
		</Stack>
	);
}
