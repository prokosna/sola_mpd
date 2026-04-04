import express, { type Request, type Response, Router } from "express";

import { wrap } from "../utils/wrap.js";

import {
	readBrowserState,
	readCommonSongTableState,
	readMpdProfileState,
	readPluginState,
	readRecentlyAddedState,
	readSavedSearches,
	updateBrowserState,
	updateCommonSongTableState,
	updateMpdProfileState,
	updatePluginState,
	updateRecentlyAddedState,
	updateSavedSearches,
} from "./application/configStateUseCases.js";

const configsRouter: ReturnType<typeof Router> = Router();

configsRouter.use(
	express.raw({
		type: "*/*",
		limit: "256mb",
	}),
);
configsRouter.use((_req, res, next) => {
	res.setHeader("Content-Type", "application/octet-stream");
	next();
});

configsRouter.get(
	"/browser_state",
	wrap(async (_req: Request, res: Response) => {
		res.send(readBrowserState());
	}),
);

configsRouter.post(
	"/browser_state",
	wrap(async (req: Request, res: Response) => {
		updateBrowserState(req.body as Buffer);
		res.end();
	}),
);

configsRouter.get(
	"/common_song_table_state",
	wrap(async (_req: Request, res: Response) => {
		res.send(readCommonSongTableState());
	}),
);

configsRouter.post(
	"/common_song_table_state",
	wrap(async (req: Request, res: Response) => {
		updateCommonSongTableState(req.body as Buffer);
		res.end();
	}),
);

configsRouter.get(
	"/mpd_profile_state",
	wrap(async (_req: Request, res: Response) => {
		res.send(readMpdProfileState());
	}),
);

configsRouter.post(
	"/mpd_profile_state",
	wrap(async (req: Request, res: Response) => {
		updateMpdProfileState(req.body as Buffer);
		res.end();
	}),
);

configsRouter.get(
	"/plugin_state",
	wrap(async (_req: Request, res: Response) => {
		res.send(readPluginState());
	}),
);

configsRouter.post(
	"/plugin_state",
	wrap(async (req: Request, res: Response) => {
		updatePluginState(req.body as Buffer);
		res.end();
	}),
);

configsRouter.get(
	"/saved_searches",
	wrap(async (_req: Request, res: Response) => {
		res.send(readSavedSearches());
	}),
);

configsRouter.post(
	"/saved_searches",
	wrap(async (req: Request, res: Response) => {
		updateSavedSearches(req.body as Buffer);
		res.end();
	}),
);

configsRouter.get(
	"/recently_added_state",
	wrap(async (_req: Request, res: Response) => {
		res.send(readRecentlyAddedState());
	}),
);

configsRouter.post(
	"/recently_added_state",
	wrap(async (req: Request, res: Response) => {
		updateRecentlyAddedState(req.body as Buffer);
		res.end();
	}),
);

export default configsRouter;
