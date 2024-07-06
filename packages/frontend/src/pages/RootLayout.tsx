import { Outlet } from "react-router-dom";

import "allotment/dist/style.css";
import "react-contexify/dist/ReactContexify.css";
import "ag-grid-community/styles/ag-grid.min.css";
import "ag-grid-community/styles/ag-theme-alpine.min.css";
import "../agGrid.css";
import "../global.css";
import { LocationObserver } from "../features/location";

export function RootLayout() {
  return (
    <>
      <Outlet />
      <LocationObserver />
    </>
  );
}
