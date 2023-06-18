import { NextRequest } from "next/server";

import { mpdProfileStateRepository } from "@/backend/repositories/MpdProfileStateRepository";
import { MpdProfileState } from "@/models/mpd/mpd_profile";

export async function GET(req: NextRequest) {
  const v = mpdProfileStateRepository.get();
  const bytes = MpdProfileState.encode(v).finish();
  return new Response(bytes, { status: 200 });
}

export async function POST(req: NextRequest) {
  const body = await req.arrayBuffer();
  const data = MpdProfileState.decode(new Uint8Array(body));
  mpdProfileStateRepository.update(data);
  return new Response("", { status: 200 });
}
