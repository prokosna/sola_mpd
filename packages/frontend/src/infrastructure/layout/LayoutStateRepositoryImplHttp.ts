import { API_CONFIGS_LAYOUT_STATE } from "@sola_mpd/domain/src/const/api.js";
import { LayoutState } from "@sola_mpd/domain/src/models/layout_pb.js";

import type { LayoutStateRepository } from "../../features/layout";
import type { HttpClient } from "../http/HttpClient";

/**
 * Implementation of LayoutStateRepository using HttpClient.
 */
export class LayoutStateRepositoryImplHttp implements LayoutStateRepository {
	constructor(private readonly client: HttpClient) {}

	fetch = async (): Promise<LayoutState> => {
		return this.client.get<LayoutState>(
			API_CONFIGS_LAYOUT_STATE,
			LayoutState.fromBinary,
		);
	};

	save = async (layoutState: LayoutState): Promise<void> => {
		return this.client.post(API_CONFIGS_LAYOUT_STATE, layoutState.toBinary());
	};
}
