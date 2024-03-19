import { API_CONFIGS_LAYOUT_STATE } from "@sola_mpd/domain/src/const/api.js";
import { LayoutState } from "@sola_mpd/domain/src/models/layout_pb.js";

import { HttpApiClient } from "../../http_api";

export async function fetchLayoutState() {
  return await HttpApiClient.get<LayoutState>(
    API_CONFIGS_LAYOUT_STATE,
    LayoutState.fromBinary,
  );
}

export async function sendLayoutState(layoutState: LayoutState) {
  await HttpApiClient.post(API_CONFIGS_LAYOUT_STATE, layoutState.toBinary());
  return layoutState;
}
