import { Button, Card, Group, Stack, Text, Title } from "@mantine/core";
import { useNavigate } from "react-router";
import {
	ROUTE_HOME_BROWSER,
	ROUTE_HOME_PLUGIN,
	ROUTE_HOME_RECENTLY_ADDED,
	ROUTE_HOME_SEARCH,
} from "../../../const/routes";
import { ScopeNote } from "./ScopeNote";

// These five settings are all Workspace-scoped (shared by every device and
// profile — docs/design/state-scoping.md §11) but each already has a
// dedicated editing surface elsewhere in the app. Rather than duplicate that
// UI here, this tab names each concern, states its scope, and links to where
// it's actually edited.
const LIBRARY_SECTIONS: {
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
		title: "Browser filter structure",
		description:
			"Right-click a filter panel on the Browser page to add, remove, or " +
			"change which tag it browses by.",
		route: ROUTE_HOME_BROWSER,
		linkLabel: "Open Browser",
	},
	{
		title: "Recently Added filter structure",
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
			'Columns" to change which columns show and their order.',
	},
	{
		title: "Plugin registrations",
		description: "Register, connect, and remove plugins from the Plugins page.",
		route: ROUTE_HOME_PLUGIN,
		linkLabel: "Open Plugins",
	},
];

export function Library() {
	const navigate = useNavigate();

	return (
		<Stack gap={16}>
			<Title order={1} size="lg">
				Library
			</Title>
			{LIBRARY_SECTIONS.map((section) => (
				<Card key={section.title} withBorder maw="70%">
					<Stack gap={8}>
						<Group justify="space-between">
							<Title order={2} size="md">
								{section.title}
							</Title>
							<ScopeNote scope="workspace" />
						</Group>
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
