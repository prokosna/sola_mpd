import NextTopLoader from "nextjs-toploader";

import { Providers } from "./providers";

// There is an issue that ag-grid css is not applied if it is specified here
// Need to put css imports in every files which include <AgGridReact>
import "allotment/dist/style.css";
import "react-contexify/dist/ReactContexify.css";
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
