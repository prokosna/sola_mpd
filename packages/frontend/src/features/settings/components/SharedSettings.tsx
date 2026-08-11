import { Button, Card, Group, Stack, Text, Title } from "@mantine/core";
import { useNavigate } from "react-router";
import {
	ROUTE_HOME_BROWSER,
	ROUTE_HOME_PLUGIN,
	ROUTE_HOME_RECENTLY_ADDED,
	ROUTE_HOME_SEARCH,
} from "../../../const/routes";
import { ScopeNote } from "./ScopeNote";

// Each of these is edited elsewhere in the app; this tab answers "which of my
// settings do other devices see?" and links to where they are edited.
const SHARED_SECTIONS: {
	title: string;
	description: string;
	route?: string;
	linkLabel?: string;
}[] = [
	{
		title: "Saved Searches",
		description:
			"Create, rename, and delete saved searches from the Search page.",
		route: ROUTE_HOME_SEARCH,
		linkLabel: "Open Search",
	},
	{
		title: "Browser filters",
		description:
			"Right-click a filter panel on the Browser page to add, remove, or " +
			"change which tag it browses by. What you have selected in those " +
			"filters is not shared — it lives in the page URL.",
		route: ROUTE_HOME_BROWSER,
		linkLabel: "Open Browser",
	},
	{
		title: "Recently Added filters",
		description:
			"Right-click a filter panel on the Recently Added page to add, " +
			"remove, or change which tag it browses by.",
		route: ROUTE_HOME_RECENTLY_ADDED,
		linkLabel: "Open Recently Added",
	},
	{
		title: "Song table columns",
		description:
			"Right-click any song table's column header and choose \"Edit " +
			'Columns" to change which columns show and their order. How wide ' +
			"each column is, and how the table is sorted, stay on each device.",
	},
	{
		title: "Plugins",
		description: "Register, connect, and remove plugins from the Plugins page.",
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
				These are stored on the server, so changing one changes it for every
				device and browser connected to it. MPD profiles are shared the same way
				and have their own tab.
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
