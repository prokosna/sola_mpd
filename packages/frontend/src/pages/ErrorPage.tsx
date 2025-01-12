import { useRouteError } from "react-router";

export function ErrorPage() {
	const error = useRouteError() as Error;
	console.error(error);

	return (
		<div id="error-page">
			<h1>Oops!</h1>
			<p>Something went wrong. Please try reloading the page.</p>
			<p>
				<i>{error.message}</i>
			</p>
		</div>
	);
}
