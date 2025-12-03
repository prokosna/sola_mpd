import { Box, Title } from "@mantine/core";
import { useRouteError } from "react-router";

export function ErrorPage() {
	const error = useRouteError() as Error;
	console.error(error);

	return (
		<Box p={24}>
			<Title>Oops!</Title>
			<p>
				Something went wrong. Please make sure that your MPD server is running
				and try reloading the page.
			</p>
			<p>
				<i>Error: {error.message}</i>
			</p>
		</Box>
	);
}
