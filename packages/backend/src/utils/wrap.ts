import { Request, Response, NextFunction, RequestHandler } from "express";

export const wrap =
  (fn: RequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
