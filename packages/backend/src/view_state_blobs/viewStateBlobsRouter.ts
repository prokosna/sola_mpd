import express, { type Request, type Response, Router } from "express";

import {
	readViewStateBlobUseCase,
	saveViewStateBlobUseCase,
} from "./application/viewStateBlobUseCases.js";

// This endpoint is unauthenticated and writable by anyone, unlike configsRouter's
// 256mb limit. A small explicit cap is required to prevent abuse.
const VIEW_STATE_BLOB_BODY_LIMIT = "256kb";

const viewStateBlobsRouter: ReturnType<typeof Router> = Router();

viewStateBlobsRouter.use(
	express.text({
		type: "*/*",
		limit: VIEW_STATE_BLOB_BODY_LIMIT,
	}),
);

viewStateBlobsRouter.put("/", async (req: Request, res: Response) => {
	const token = saveViewStateBlobUseCase(req.body as string);
	res.type("text/plain").send(token);
});

viewStateBlobsRouter.get("/:token", async (req: Request, res: Response) => {
	const data = readViewStateBlobUseCase(req.params.token);
	if (data === undefined) {
		res.sendStatus(404);
		return;
	}
	res.json({ data });
});

export default viewStateBlobsRouter;
