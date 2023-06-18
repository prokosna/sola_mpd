import { NextRequest } from "next/server";

import { commonSongTableStateRepository } from "@/backend/repositories/CommonSongTableStateRepository";
import { CommonSongTableState } from "@/models/song_table";

export async function GET(req: NextRequest) {
  const v = commonSongTableStateRepository.get();
  const bytes = CommonSongTableState.encode(v).finish();
  return new Response(bytes, { status: 200 });
}

export async function POST(req: NextRequest) {
  const body = await req.arrayBuffer();
  const data = CommonSongTableState.decode(new Uint8Array(body));
  commonSongTableStateRepository.update(data);
  return new Response("", { status: 200 });
}
