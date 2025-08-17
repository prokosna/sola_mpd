import type { NextFunction, Request, RequestHandler, Response } from "express";

export const wrap =
	(fn: RequestHandler): RequestHandler =>
	(req: Request, res: Response, next: NextFunction) =>
		Promise.resolve()
			.then(() => fn(req, res, next))
			.catch(next);
