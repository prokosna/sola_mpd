import { createBrowserRouter } from "react-router-dom";

import {
  ROUTE_HOME,
  ROUTE_HOME_BROWSER,
  ROUTE_HOME_FILE_EXPLORE,
  ROUTE_HOME_PLAYLIST,
  ROUTE_HOME_PLAY_QUEUE,
  ROUTE_HOME_PLUGIN,
  ROUTE_HOME_SEARCH,
  ROUTE_HOME_SETTINGS,
  ROUTE_LANDING,
} from "./const/routes";
import ErrorPage from "./pages/ErrorPage";
import RootLayout from "./pages/RootLayout";
import RootPage from "./pages/RootPage";
import BrowserPage from "./pages/home/BrowserPage";
import { FileExplorePage } from "./pages/home/FileExplorePage";
import HomeLayout from "./pages/home/HomeLayout";
import PlayQueuePage from "./pages/home/PlayQueuePage";
import { PlaylistPage } from "./pages/home/PlaylistPage";
import { PluginsPage } from "./pages/home/PluginsPage";
import { SearchPage } from "./pages/home/SearchPage";
import { SettingsPage } from "./pages/home/SettingsPage";
import LandingPage from "./pages/landing/LandingPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <RootPage />,
      },
      {
        path: ROUTE_HOME,
        element: <HomeLayout />,
        children: [
          {
            path: ROUTE_HOME_PLAY_QUEUE.split("/").filter(Boolean).pop(),
            element: <PlayQueuePage />,
          },
          {
            path: ROUTE_HOME_BROWSER.split("/").filter(Boolean).pop(),
            element: <BrowserPage />,
          },
          {
            path: ROUTE_HOME_PLAYLIST.split("/").filter(Boolean).pop(),
            element: <PlaylistPage />,
          },
          {
            path: ROUTE_HOME_SEARCH.split("/").filter(Boolean).pop(),
            element: <SearchPage />,
          },
          {
            path: ROUTE_HOME_FILE_EXPLORE.split("/").filter(Boolean).pop(),
            element: <FileExplorePage />,
          },
          {
            path: ROUTE_HOME_PLUGIN.split("/").filter(Boolean).pop(),
            element: <PluginsPage />,
          },
          {
            path: ROUTE_HOME_SETTINGS.split("/").filter(Boolean).pop(),
            element: <SettingsPage />,
          },
        ],
      },
      {
        path: ROUTE_LANDING,
        element: <LandingPage />,
      },
    ],
  },
]);

export default router;
