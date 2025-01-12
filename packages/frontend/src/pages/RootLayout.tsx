import { Provider } from "jotai";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";

import "allotment/dist/style.css";
import "react-contexify/dist/ReactContexify.css";
import "ag-grid-community/styles/ag-grid.min.css";
import "ag-grid-community/styles/ag-theme-alpine.min.css";
import "../agGrid.css";
import "../global.css";
import {
	ClientSideRowModelApiModule,
	ClientSideRowModelModule,
	ColumnApiModule,
	ModuleRegistry,
	RowApiModule,
	RowDragModule,
	RowSelectionModule,
	RowStyleModule,
	TooltipModule,
	ValidationModule,
	provideGlobalGridOptions,
} from "ag-grid-community";
import { TopLoadingProgressBar } from "../features/loading";
import { LocationObserver } from "../features/location";
import { useJotaiStore } from "../useJotaiStore";

export function RootLayout() {
	const store = useJotaiStore();

	ModuleRegistry.registerModules([
		RowDragModule,
		TooltipModule,
		RowSelectionModule,
		ClientSideRowModelModule,
		ClientSideRowModelApiModule,
		ColumnApiModule,
		RowApiModule,
		RowStyleModule,
		ValidationModule,
	]);
	// TODO: Migrate to new theme API
	provideGlobalGridOptions({ theme: "legacy" });

	return (
		<>
			<Suspense fallback={<TopLoadingProgressBar />}>
				<Provider store={store}>
					<Outlet />
					<LocationObserver />
				</Provider>
			</Suspense>
		</>
	);
}
