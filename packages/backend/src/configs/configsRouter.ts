import { BrowserState } from "@sola_mpd/domain/src/models/browser_pb.js";
import { LayoutState } from "@sola_mpd/domain/src/models/layout_pb.js";
import { MpdProfileState } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { PluginState } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { RecentlyAddedState } from "@sola_mpd/domain/src/models/recently_added_pb.js";
import { SavedSearches } from "@sola_mpd/domain/src/models/search_pb.js";
import { SongTableState } from "@sola_mpd/domain/src/models/song_table_pb.js";
import express, { type Request, type Response, Router } from "express";

import { wrap } from "../utils/wrap.js";

import { browserStateRepository } from "./repositories/browserStateRepository.js";
import { commonSongTableStateRepository } from "./repositories/commonSongTableStateRepository.js";
import { layoutStateRepository } from "./repositories/layoutStateRepository.js";
import { mpdProfileStateRepository } from "./repositories/mpdProfileStateRepository.js";
import { pluginStateRepository } from "./repositories/pluginStateRepository.js";
import { recentlyAddedStateRepository } from "./repositories/recentlyAddedStateRepository.js";
import { savedSearchRepository } from "./repositories/savedSearchRepository.js";

const configsRouter = Router();

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
		const value = browserStateRepository.get();
		const bytes = Buffer.from(value.toBinary());
		res.send(bytes);
	}),
);

configsRouter.post(
	"/browser_state",
	wrap(async (req: Request, res: Response) => {
		const body = req.body as Buffer;
		const data = BrowserState.fromBinary(new Uint8Array(body));
		browserStateRepository.update(data);
		res.end();
	}),
);

configsRouter.get(
	"/common_song_table_state",
	wrap(async (_req: Request, res: Response) => {
		const value = commonSongTableStateRepository.get();
		const bytes = Buffer.from(value.toBinary());
		res.send(bytes);
	}),
);

configsRouter.post(
	"/common_song_table_state",
	wrap(async (req: Request, res: Response) => {
		const body = req.body as Buffer;
		const data = SongTableState.fromBinary(new Uint8Array(body));
		commonSongTableStateRepository.update(data);
		res.end();
	}),
);
configsRouter.get(
	"/layout_state",
	wrap(async (_req: Request, res: Response) => {
		const value = layoutStateRepository.get();
		const bytes = Buffer.from(value.toBinary());
		res.send(bytes);
	}),
);

configsRouter.post(
	"/layout_state",
	wrap(async (req: Request, res: Response) => {
		const body = req.body as Buffer;
		const data = LayoutState.fromBinary(new Uint8Array(body));
		layoutStateRepository.update(data);
		res.end();
	}),
);

configsRouter.get(
	"/mpd_profile_state",
	wrap(async (_req: Request, res: Response) => {
		const value = mpdProfileStateRepository.get();
		const bytes = Buffer.from(value.toBinary());
		res.send(bytes);
	}),
);

configsRouter.post(
	"/mpd_profile_state",
	wrap(async (req: Request, res: Response) => {
		const body = req.body as Buffer;
		const data = MpdProfileState.fromBinary(new Uint8Array(body));
		mpdProfileStateRepository.update(data);
		res.end();
	}),
);

configsRouter.get(
	"/plugin_state",
	wrap(async (_req: Request, res: Response) => {
		const value = pluginStateRepository.get();
		const bytes = Buffer.from(value.toBinary());
		res.send(bytes);
	}),
);

configsRouter.post(
	"/plugin_state",
	wrap(async (req: Request, res: Response) => {
		const body = req.body as Buffer;
		const data = PluginState.fromBinary(new Uint8Array(body));
		pluginStateRepository.update(data);
		res.end();
	}),
);

configsRouter.get(
	"/saved_searches",
	wrap(async (_req: Request, res: Response) => {
		const value = savedSearchRepository.get();
		const bytes = Buffer.from(value.toBinary());
		res.send(bytes);
	}),
);

configsRouter.post(
	"/saved_searches",
	wrap(async (req: Request, res: Response) => {
		const body = req.body as Buffer;
		const data = SavedSearches.fromBinary(new Uint8Array(body));
		savedSearchRepository.update(data);
		res.end();
	}),
);

configsRouter.get(
	"/recently_added_state",
	wrap(async (_req: Request, res: Response) => {
		const value = recentlyAddedStateRepository.get();
		const bytes = Buffer.from(value.toBinary());
		res.send(bytes);
	}),
);

configsRouter.post(
	"/recently_added_state",
	wrap(async (req: Request, res: Response) => {
		const body = req.body as Buffer;
		const data = RecentlyAddedState.fromBinary(new Uint8Array(body));
		recentlyAddedStateRepository.update(data);
		res.end();
	}),
);

export default configsRouter;
