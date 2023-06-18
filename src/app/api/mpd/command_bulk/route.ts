import { NextRequest } from "next/server";

import { mpdClient } from "@/backend/mpd/MpdClient";
import { MpdRequestBulk } from "@/models/mpd/mpd_command";

async function handler(req: NextRequest) {
  const body = await req.arrayBuffer();
  const request = MpdRequestBulk.decode(new Uint8Array(body));

  try {
    await mpdClient.executeBulk(request.requests);
    return new Response("", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("{}", { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return handler(req);
}

export async function POST(req: NextRequest) {
  return handler(req);
}
