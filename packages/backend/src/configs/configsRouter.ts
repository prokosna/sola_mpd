import { fromBinary, toBinary } from "@bufbuild/protobuf";
import { BrowserStateSchema } from "@sola_mpd/domain/src/models/browser_pb.js";
import { MpdProfileStateSchema } from "@sola_mpd/domain/src/models/mpd/mpd_profile_pb.js";
import { PluginStateSchema } from "@sola_mpd/domain/src/models/plugin/plugin_pb.js";
import { RecentlyAddedStateSchema } from "@sola_mpd/domain/src/models/recently_added_pb.js";
import { SavedSearchesSchema } from "@sola_mpd/domain/src/models/search_pb.js";
import { SongTableStateSchema } from "@sola_mpd/domain/src/models/song_table_pb.js";
import express, { type Request, type Response, Router } from "express";

import { wrap } from "../utils/wrap.js";

import { browserStateRepository } from "./repositories/browserStateRepository.js";
import { commonSongTableStateRepository } from "./repositories/commonSongTableStateRepository.js";
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
		const bytes = Buffer.from(toBinary(BrowserStateSchema, value));
		res.send(bytes);
	}),
);

configsRouter.post(
	"/browser_state",
	wrap(async (req: Request, res: Response) => {
		const body = req.body as Buffer;
		const data = fromBinary(BrowserStateSchema, new Uint8Array(body));
		browserStateRepository.update(data);
		res.end();
	}),
);

configsRouter.get(
	"/common_song_table_state",
	wrap(async (_req: Request, res: Response) => {
		const value = commonSongTableStateRepository.get();
		const bytes = Buffer.from(toBinary(SongTableStateSchema, value));
		res.send(bytes);
	}),
);

configsRouter.post(
	"/common_song_table_state",
	wrap(async (req: Request, res: Response) => {
		const body = req.body as Buffer;
		const data = fromBinary(SongTableStateSchema, new Uint8Array(body));
		commonSongTableStateRepository.update(data);
		res.end();
	}),
);

configsRouter.get(
	"/mpd_profile_state",
	wrap(async (_req: Request, res: Response) => {
		const value = mpdProfileStateRepository.get();
		const bytes = Buffer.from(toBinary(MpdProfileStateSchema, value));
		res.send(bytes);
	}),
);

configsRouter.post(
	"/mpd_profile_state",
	wrap(async (req: Request, res: Response) => {
		const body = req.body as Buffer;
		const data = fromBinary(MpdProfileStateSchema, new Uint8Array(body));
		mpdProfileStateRepository.update(data);
		res.end();
	}),
);

configsRouter.get(
	"/plugin_state",
	wrap(async (_req: Request, res: Response) => {
		const value = pluginStateRepository.get();
		const bytes = Buffer.from(toBinary(PluginStateSchema, value));
		res.send(bytes);
	}),
);

configsRouter.post(
	"/plugin_state",
	wrap(async (req: Request, res: Response) => {
		const body = req.body as Buffer;
		const data = fromBinary(PluginStateSchema, new Uint8Array(body));
		pluginStateRepository.update(data);
		res.end();
	}),
);

configsRouter.get(
	"/saved_searches",
	wrap(async (_req: Request, res: Response) => {
		const value = savedSearchRepository.get();
		const bytes = Buffer.from(toBinary(SavedSearchesSchema, value));
		res.send(bytes);
	}),
);

configsRouter.post(
	"/saved_searches",
	wrap(async (req: Request, res: Response) => {
		const body = req.body as Buffer;
		const data = fromBinary(SavedSearchesSchema, new Uint8Array(body));
		savedSearchRepository.update(data);
		res.end();
	}),
);

configsRouter.get(
	"/recently_added_state",
	wrap(async (_req: Request, res: Response) => {
		const value = recentlyAddedStateRepository.get();
		const bytes = Buffer.from(toBinary(RecentlyAddedStateSchema, value));
		res.send(bytes);
	}),
);

configsRouter.post(
	"/recently_added_state",
	wrap(async (req: Request, res: Response) => {
		const body = req.body as Buffer;
		const data = fromBinary(RecentlyAddedStateSchema, new Uint8Array(body));
		recentlyAddedStateRepository.update(data);
		res.end();
	}),
);

export default configsRouter;
