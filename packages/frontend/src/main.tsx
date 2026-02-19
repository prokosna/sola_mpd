import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router/dom";

import { Providers } from "./providers";
import router from "./router";

// biome-ignore lint/style/noNonNullAssertion: Must not be null.
ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<Providers>
			<RouterProvider router={router} />
		</Providers>
	</React.StrictMode>,
);
