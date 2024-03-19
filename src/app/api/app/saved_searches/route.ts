import { NextRequest } from "next/server";

import { savedSearchRepository } from "@/backend/repositories/SavedSearchRepository";
import { SavedSearches } from "@/models/search";

export async function GET(req: NextRequest) {
  const v = savedSearchRepository.get();
  const bytes = SavedSearches.encode(v).finish();
  return new Response(bytes, { status: 200 });
}

export async function POST(req: NextRequest) {
  const body = await req.arrayBuffer();
  const data = SavedSearches.decode(new Uint8Array(body));
  savedSearchRepository.update(data);
  return new Response("", { status: 200 });
}
