import { NextRequest } from "next/server";

import { pluginStateRepository } from "@/backend/repositories/PluginStateRepository";
import { PluginState } from "@/models/plugin/plugin";

export async function GET(req: NextRequest) {
  const v = pluginStateRepository.get();
  const bytes = PluginState.encode(v).finish();
  return new Response(bytes, { status: 200 });
}

export async function POST(req: NextRequest) {
  const body = await req.arrayBuffer();
  const data = PluginState.decode(new Uint8Array(body));
  pluginStateRepository.update(data);
  return new Response("", { status: 200 });
}
