import express, { type Request, type Response, Router } from "express";

import {
	executeMpdCommandBulkUseCase,
	executeMpdCommandUseCase,
} from "./application/mpdUseCases.js";
import { mpdClientMpd3 } from "./services/MpdClientMpd3.js";

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

mpdRouter.use("/command", async (req: Request, res: Response) => {
	const data = await executeMpdCommandUseCase(
		new Uint8Array(req.body as Buffer),
		mpdClientMpd3,
	);
	res.send(data);
});

mpdRouter.use("/command_bulk", async (req: Request, res: Response) => {
	await executeMpdCommandBulkUseCase(
		new Uint8Array(req.body as Buffer),
		mpdClientMpd3,
	);
	res.end();
});

export default mpdRouter;
