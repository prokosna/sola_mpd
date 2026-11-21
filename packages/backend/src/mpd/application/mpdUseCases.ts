import type {
	MpdRequest,
	MpdRequestBulk,
	MpdResponse,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import type { MpdEvent } from "@sola_mpd/shared/src/models/mpd/mpd_event_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type {
	MpdClient,
	MpdSubscriptionHandler,
} from "../services/MpdClient.js";

export const executeMpdCommandUseCase = (
	request: MpdRequest,
	mpdClient: MpdClient,
): Promise<MpdResponse> => {
	return mpdClient.execute(request);
};

export const executeMpdCommandBulkUseCase = async (
	bulk: MpdRequestBulk,
	mpdClient: MpdClient,
): Promise<void> => {
	await mpdClient.executeBulk(bulk.requests);
};

type SubscribeMpdEventsUseCaseInput = {
	profile: MpdProfile;
	onEvent: (event: MpdEvent) => void;
	mpdClient: MpdClient;
};

export const subscribeMpdEventsUseCase = async ({
	profile,
	onEvent,
	mpdClient,
}: SubscribeMpdEventsUseCaseInput): Promise<{
	profile: MpdProfile;
	handlerPromise: Promise<MpdSubscriptionHandler>;
}> => {
	const handlerPromise = mpdClient.subscribe(profile, onEvent);
	return { profile, handlerPromise };
};

type UnsubscribeMpdEventsUseCaseInput = {
	profile: MpdProfile;
	handlerPromise?: Promise<MpdSubscriptionHandler>;
	mpdClient: MpdClient;
};

export const unsubscribeMpdEventsUseCase = async ({
	profile,
	handlerPromise,
	mpdClient,
}: UnsubscribeMpdEventsUseCaseInput): Promise<MpdProfile | undefined> => {
	if (handlerPromise === undefined) {
		return;
	}
	await mpdClient.unsubscribe(profile, await handlerPromise);
	return profile;
};

type DisconnectMpdEventsUseCaseInput = {
	profile: MpdProfile;
	handlerPromise: Promise<MpdSubscriptionHandler>;
	mpdClient: MpdClient;
};

export const disconnectMpdEventsUseCase = async ({
	profile,
	handlerPromise,
	mpdClient,
}: DisconnectMpdEventsUseCaseInput): Promise<void> => {
	await mpdClient.unsubscribe(profile, await handlerPromise);
};
