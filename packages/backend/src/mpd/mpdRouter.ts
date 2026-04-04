import express, { type Request, type Response, Router } from "express";

import { wrap } from "../utils/wrap.js";

import {
	executeMpdCommandBulkUseCase,
	executeMpdCommandUseCase,
} from "./application/mpdUseCases.js";
import { mpdClientAdaptorMpd3 } from "./services/MpdClientAdaptorMpd3.js";

const mpdRouter: ReturnType<typeof Router> = Router();

mpdRouter.use(
	express.raw({
		type: "*/*",
		limit: "1024mb",
	}),
);
mpdRouter.use((_req, res, next) => {
	res.setHeader("Content-Type", "application/octet-stream");
	next();
});

mpdRouter.use(
	"/command",
	wrap(async (req: Request, res: Response, _next) => {
		const data = await executeMpdCommandUseCase(
			new Uint8Array(req.body as Buffer),
			mpdClientAdaptorMpd3,
		);
		res.send(data);
	}),
);

mpdRouter.use(
	"/command_bulk",
	wrap(async (req: Request, res: Response, _next) => {
		await executeMpdCommandBulkUseCase(
			new Uint8Array(req.body as Buffer),
			mpdClientAdaptorMpd3,
		);
		res.end();
	}),
);

export default mpdRouter;
