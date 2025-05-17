import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router/dom";

import { Provider } from "./provider.tsx";
import router from "./router.tsx";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<Provider>
			<RouterProvider router={router} />
		</Provider>
	</React.StrictMode>,
);
