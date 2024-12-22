import {
  MpdRequest,
  MpdRequestBulk,
} from "@sola_mpd/domain/src/models/mpd/mpd_command_pb.js";
import express, { Request, Response } from "express";

import { wrap } from "../utils/wrap.js";

import { mpdClient } from "./mpdClient.js";

const mpdRouter = express.Router();

mpdRouter.use(
  express.raw({
    type: "*/*",
    limit: "1024mb",
  }),
);
mpdRouter.use((req, res, next) => {
  res.setHeader("Content-Type", "application/octet-stream");
  next();
});

async function executeCommand(req: Request): Promise<Uint8Array> {
  const body = req.body as Buffer;
  const request = MpdRequest.fromBinary(new Uint8Array(body));
  const res = await mpdClient.execute(request);
  return res.toBinary();
}

async function executeCommandBulk(req: Request): Promise<void> {
  const body = req.body as Buffer;
  const request = MpdRequestBulk.fromBinary(new Uint8Array(body));
  return mpdClient.executeBulk(request.requests);
}

mpdRouter.use(
  "/command",
  wrap(async (req: Request, res: Response, next) => {
    const data = await executeCommand(req);
    res.send(data);
  }),
);

mpdRouter.use(
  "/command_bulk",
  wrap(async (req: Request, res: Response, next) => {
    await executeCommandBulk(req);
    res.end();
  }),
);

export default mpdRouter;
