import { fromBinary, toBinary } from "@bufbuild/protobuf";
import {
	MpdRequestBulkSchema,
	MpdRequestSchema,
	MpdResponseSchema,
} from "@sola_mpd/shared/src/models/mpd/mpd_command_pb.js";
import type { MpdEvent } from "@sola_mpd/shared/src/models/mpd/mpd_event_pb.js";
import type { MpdProfile } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import { MpdProfileSchema } from "@sola_mpd/shared/src/models/mpd/mpd_profile_pb.js";
import type {
	MpdClient,
	MpdSubscriptionHandler,
} from "../services/MpdClient.js";

export const executeMpdCommandUseCase = async (
	msg: Uint8Array,
	mpdClient: MpdClient,
): Promise<Uint8Array> => {
	const request = fromBinary(MpdRequestSchema, msg);
	const response = await mpdClient.execute(request);
	return toBinary(MpdResponseSchema, response);
};

export const executeMpdCommandBulkUseCase = async (
	msg: Uint8Array,
	mpdClient: MpdClient,
): Promise<void> => {
	const request = fromBinary(MpdRequestBulkSchema, msg);
	await mpdClient.executeBulk(request.requests);
};

type SubscribeMpdEventsUseCaseInput = {
	msg: Uint8Array;
	onEvent: (event: MpdEvent) => void;
	mpdClient: MpdClient;
};

export const subscribeMpdEventsUseCase = async ({
	msg,
	onEvent,
	mpdClient,
}: SubscribeMpdEventsUseCaseInput): Promise<{
	profile: MpdProfile;
	handlerPromise: Promise<MpdSubscriptionHandler>;
}> => {
	const profile = fromBinary(MpdProfileSchema, msg);
	const handlerPromise = mpdClient.subscribe(profile, onEvent);
	return { profile, handlerPromise };
};

type UnsubscribeMpdEventsUseCaseInput = {
	msg: Uint8Array;
	handlerPromise?: Promise<MpdSubscriptionHandler>;
	mpdClient: MpdClient;
};

export const unsubscribeMpdEventsUseCase = async ({
	msg,
	handlerPromise,
	mpdClient,
}: UnsubscribeMpdEventsUseCaseInput): Promise<MpdProfile | undefined> => {
	const profile = fromBinary(MpdProfileSchema, msg);
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
