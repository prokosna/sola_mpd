import { NextRequest } from "next/server";

import { layoutStateRepository } from "@/backend/repositories/LayoutStateRepository";
import { LayoutState } from "@/models/layout";

export async function GET(req: NextRequest) {
  const v = layoutStateRepository.get();
  const bytes = LayoutState.encode(v).finish();
  return new Response(bytes, { status: 200 });
}

export async function POST(req: NextRequest) {
  const body = await req.arrayBuffer();
  const data = LayoutState.decode(new Uint8Array(body));
  layoutStateRepository.update(data);
  return new Response("", { status: 200 });
}
