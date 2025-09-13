import { Divider, Group, Stack } from "@mantine/core";
import {
	IconAi,
	IconArrowsExchange,
	IconBrowser,
	IconComet,
	IconDatabase,
	IconFileMusic,
	IconMusic,
	IconPlaylist,
	IconSearch,
} from "@tabler/icons-react";
import {
	ROUTE_HOME_ALL_SONGS,
	ROUTE_HOME_BROWSER,
	ROUTE_HOME_FILE_EXPLORE,
	ROUTE_HOME_PLAY_QUEUE,
	ROUTE_HOME_PLAYLIST,
	ROUTE_HOME_PLUGIN,
	ROUTE_HOME_RECENTLY_ADDED,
	ROUTE_HOME_SEARCH,
	ROUTE_HOME_TEXT_TO_MUSIC_SEARCH,
} from "../../../const/routes";
import { useAdvancedSearchStatsState } from "../../advanced_search";
import { CardStats } from "../../stats";
import { useSideNavigationItems } from "../hooks/useSideNavigationItems";
import {
	SideNavigationItem,
	type SideNavigationItemProps,
} from "./SideNavigationItem";

/**
 * Navigation sidebar with app sections.
 *
 * @param props.isCompact Compact mode flag
 */
export function SideNavigation({ isCompact }: { isCompact: boolean }) {
	const advancedSearchStats = useAdvancedSearchStatsState();

	const baseItems: SideNavigationItemProps[] = [
		{
			name: "Play Queue",
			icon: <IconMusic />,
			link: ROUTE_HOME_PLAY_QUEUE,
			isCompact,
		},
		{
			name: "Browser",
			icon: <IconBrowser />,
			link: ROUTE_HOME_BROWSER,
			isCompact,
		},
		{
			name: "Playlist",
			icon: <IconPlaylist />,
			link: ROUTE_HOME_PLAYLIST,
			isCompact,
		},
		{
			name: "Recently Added",
			icon: <IconComet />,
			link: ROUTE_HOME_RECENTLY_ADDED,
			isCompact,
		},
		{
			name: "Search",
			icon: <IconSearch />,
			link: ROUTE_HOME_SEARCH,
			isCompact,
		},
		{
			name: "File Explore",
			icon: <IconFileMusic />,
			link: ROUTE_HOME_FILE_EXPLORE,
			isCompact,
		},
		{
			name: "All Songs",
			icon: <IconDatabase />,
			link: ROUTE_HOME_ALL_SONGS,
			isCompact,
		},
		{
			name: "Plugins",
			icon: <IconArrowsExchange />,
			link: ROUTE_HOME_PLUGIN,
			isCompact,
		},
		{
			name: "Text-to-Music",
			icon: <IconAi />,
			link: ROUTE_HOME_TEXT_TO_MUSIC_SEARCH,
			isCompact,
		},
	];

	const sideNavigationItems = useSideNavigationItems(baseItems);

	return (
		<Stack h="100%">
			<Stack w="100%" px={10} pt={8} gap={0}>
				{sideNavigationItems
					.filter(
						(item) =>
							item.name !== "Text-to-Music" ||
							advancedSearchStats !== undefined,
					)
					.map((item) => (
						<SideNavigationItem key={item.name} {...item} />
					))}
			</Stack>
			{isCompact ? null : (
				<>
					<Divider />
					<Group w="100%" h="100%" px={24}>
						<CardStats />
					</Group>
					<Divider />
				</>
			)}
		</Stack>
	);
}
