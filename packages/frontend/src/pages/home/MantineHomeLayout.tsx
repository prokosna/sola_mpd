import { ActionIcon, AppShell, Group, ScrollArea, Space } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Suspense, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

import { IconMenu2 } from "@tabler/icons-react";
import { ROUTE_HOME, ROUTE_HOME_PLAY_QUEUE } from "../../const/routes";
import { MantineGlobalFilterBox } from "../../features/global_filter/components/MantineGlobalFilterBox";
import { CenterSpinner } from "../../features/loading";
import { MantineBrandLogo } from "../../features/logo/components/MantineBrandLogo";
import { MpdEventObserver } from "../../features/mpd";
import { Player } from "../../features/player";
import {
	PluginExecutionIndicator,
	PluginExecutionModal,
} from "../../features/plugin";
import { MantineMpdProfileSelector } from "../../features/profile/components/MantineMpdProfileSelector";
import { MantineColorModeSwitchButton } from "../../features/settings/components/MantineColorModeSwitchButton";
import { MantineSettingsEntryButton } from "../../features/settings/components/MantineSettingsEntryButton";
import { MantineSideNavigation } from "../../features/side_navigation/components/MantineSideNavigation";
import {
	useIsCompactMode,
	useUserDeviceType,
} from "../../features/user_device";

export function MantineHomeLayout() {
	const location = useLocation();
	const navigate = useNavigate();
	const isCompactMode = useIsCompactMode();
	const [isOpen, { toggle }] = useDisclosure(!isCompactMode);
	const userDeviceType = useUserDeviceType();

	useEffect(() => {
		if (location.pathname === ROUTE_HOME) {
			navigate(ROUTE_HOME_PLAY_QUEUE);
		}
	}, [location, navigate]);

	return (
		<>
			<AppShell
				header={{ height: 60 }}
				navbar={{
					width: isOpen ? 200 : 69,
					breakpoint: 0,
					collapsed: { mobile: false, desktop: false },
				}}
				footer={{ height: 100 }}
			>
				<AppShell.Header>
					<Group h="100%" gap={0} wrap="nowrap">
						<Group
							maw={userDeviceType === "large" ? 200 : 69}
							miw={userDeviceType === "large" ? 200 : 69}
							justify="space-between"
							wrap="nowrap"
							gap={0}
						>
							<MantineBrandLogo />
							<Space />
							<ActionIcon size="md" variant="transparent" onClick={toggle}>
								<IconMenu2 />
							</ActionIcon>
							<Space />
						</Group>
						<Group
							style={{ flexGrow: 1 }}
							justify="space-between"
							wrap="nowrap"
						>
							<MantineGlobalFilterBox />
							<Group justify="flex-end" wrap="nowrap" gap="md">
								<PluginExecutionIndicator />
								<MantineMpdProfileSelector />
								<MantineColorModeSwitchButton />
								<MantineSettingsEntryButton />
								<Space />
							</Group>
						</Group>
					</Group>
				</AppShell.Header>

				<AppShell.Navbar p={0}>
					<ScrollArea>
						<MantineSideNavigation isCompact={!isOpen} />
					</ScrollArea>
				</AppShell.Navbar>

				<AppShell.Main p={0}>
					<Suspense fallback={<CenterSpinner />}>
						<Outlet />
					</Suspense>
				</AppShell.Main>

				<AppShell.Footer p={0}>
					<Player />
				</AppShell.Footer>
			</AppShell>
			<MpdEventObserver />
			<PluginExecutionModal />
		</>
	);
}
