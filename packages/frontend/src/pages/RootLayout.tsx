import {
	CellStyleModule,
	ClientSideRowModelApiModule,
	ClientSideRowModelModule,
	ColumnApiModule,
	ModuleRegistry,
	RowApiModule,
	RowDragModule,
	RowSelectionModule,
	RowStyleModule,
	ScrollApiModule,
	TooltipModule,
	ValidationModule,
} from "ag-grid-community";
import { Provider } from "jotai";
import { Suspense } from "react";
import { Outlet } from "react-router";
import { TopLoadingProgressBar } from "../features/loading";
import { LocationObserver } from "../features/location";
import { useJotaiStore } from "../useJotaiStore";

import "allotment/dist/style.css";
import "react-contexify/dist/ReactContexify.css";
import "../global.css";

export function RootLayout() {
	const store = useJotaiStore();

	ModuleRegistry.registerModules([
		RowDragModule,
		TooltipModule,
		RowSelectionModule,
		CellStyleModule,
		ClientSideRowModelModule,
		ClientSideRowModelApiModule,
		ColumnApiModule,
		RowApiModule,
		RowStyleModule,
		ScrollApiModule,
		ValidationModule,
	]);

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
