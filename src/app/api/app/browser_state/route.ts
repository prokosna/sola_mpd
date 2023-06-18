import { NextRequest } from "next/server";

import { browserStateRepository } from "@/backend/repositories/BrowserStateRepository";
import { BrowserState } from "@/models/browser";

export async function GET(req: NextRequest) {
  const v = browserStateRepository.get();
  const bytes = BrowserState.encode(v).finish();
  return new Response(bytes, { status: 200 });
}

export async function POST(req: NextRequest) {
  const body = await req.arrayBuffer();
  const data = BrowserState.decode(new Uint8Array(body));
  browserStateRepository.update(data);
  return new Response("", { status: 200 });
}
