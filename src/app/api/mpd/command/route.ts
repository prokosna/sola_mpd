import { NextRequest } from "next/server";

import { mpdClient } from "@/backend/mpd/MpdClient";
import { MpdRequest, MpdResponse } from "@/models/mpd/mpd_command";

async function handler(req: NextRequest) {
  const body = await req.arrayBuffer();
  const request = MpdRequest.decode(new Uint8Array(body));

  try {
    const res = await mpdClient.execute(request);
    const bytes = MpdResponse.encode(res).finish();
    return new Response(bytes, { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("", { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return handler(req);
}

export async function POST(req: NextRequest) {
  return handler(req);
}
