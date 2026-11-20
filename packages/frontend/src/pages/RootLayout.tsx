import {
	CellStyleModule,
	ClientSideRowModelApiModule,
	ColumnApiModule,
	enableDevValidations,
	ModuleRegistry,
	RowApiModule,
	RowDragModule,
	RowSelectionModule,
	RowStyleModule,
	ScrollApiModule,
	TooltipModule,
} from "ag-grid-community";
import { Provider } from "jotai";
import { Suspense } from "react";
import { Outlet } from "react-router";
import { TopLoadingProgressBar } from "../features/loading";
import { LocationObserver } from "../features/location";
import { useJotaiStore } from "../useJotaiStore";
import "react-contexify/dist/ReactContexify.css";
import "../global.css";

if (import.meta.env.DEV) {
	enableDevValidations();
}

ModuleRegistry.registerModules([
	RowDragModule,
	TooltipModule,
	RowSelectionModule,
	CellStyleModule,
	ClientSideRowModelApiModule,
	ColumnApiModule,
	RowApiModule,
	RowStyleModule,
	ScrollApiModule,
]);

export function RootLayout() {
	const store = useJotaiStore();

	return (
		<Suspense fallback={<TopLoadingProgressBar />}>
			<Provider store={store}>
				<Outlet />
				<LocationObserver />
			</Provider>
		</Suspense>
	);
}
