import { Box, Title } from "@mantine/core";
import { useRouteError } from "react-router";

export function ErrorPage() {
	const error = useRouteError() as Error;
	console.error(error);

	return (
		<Box p={12}>
			<Title>Oops!</Title>
			<p>Something went wrong. Please try reloading the page.</p>
			<p>
				<i>Error: {error.message}</i>
			</p>
		</Box>
	);
}
