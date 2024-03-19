import NextTopLoader from "nextjs-toploader";

import { Providers } from "./providers";

import "allotment/dist/style.css";
import "react-contexify/dist/ReactContexify.css";
import "ag-grid-community/styles/ag-grid.min.css";
import "ag-grid-community/styles/ag-theme-alpine.min.css";
import "@/app/agGrid.css";
import "./global.css";

export const metadata = {
  title: "Sola MPD",
  description: "MPD client",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NextTopLoader />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
