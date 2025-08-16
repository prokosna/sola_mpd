import { Card, Center, Title, useComputedColorScheme } from "@mantine/core";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { ROUTE_HOME_PLAY_QUEUE } from "../../const/routes";
import {
	MpdProfileForm,
	useCurrentMpdProfileState,
} from "../../features/profile";

export function LandingPage() {
	const navigate = useNavigate();
	const profile = useCurrentMpdProfileState();
	const scheme = useComputedColorScheme();

	useEffect(() => {
		if (profile !== undefined) {
			navigate(ROUTE_HOME_PLAY_QUEUE);
		}
	}, [navigate, profile]);

	const mpdProfileFormProps = {
		onProfileCreated: useCallback(async () => {
			navigate(ROUTE_HOME_PLAY_QUEUE);
		}, [navigate]),
		onCancelled: async () => {},
		disableCancelButton: true,
	};

	return (
		<Center w="100%" h="100vh" bg={scheme === "light" ? "white" : "dark.7"}>
			<Card>
				<Title size="lg">MPD Server Information</Title>
				<MpdProfileForm {...mpdProfileFormProps} />
			</Card>
		</Center>
	);
}
