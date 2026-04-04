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
	MpdClientPort,
	MpdSubscriptionHandler,
} from "../services/MpdClientPort.js";

export const executeMpdCommandUseCase = async (
	msg: Uint8Array,
	mpdClientPort: MpdClientPort,
): Promise<Uint8Array> => {
	const request = fromBinary(MpdRequestSchema, msg);
	const response = await mpdClientPort.execute(request);
	return toBinary(MpdResponseSchema, response);
};

export const executeMpdCommandBulkUseCase = async (
	msg: Uint8Array,
	mpdClientPort: MpdClientPort,
): Promise<void> => {
	const request = fromBinary(MpdRequestBulkSchema, msg);
	await mpdClientPort.executeBulk(request.requests);
};

type SubscribeMpdEventsUseCaseInput = {
	msg: Uint8Array;
	onEvent: (event: MpdEvent) => void;
	mpdClientPort: MpdClientPort;
};

export const subscribeMpdEventsUseCase = async ({
	msg,
	onEvent,
	mpdClientPort,
}: SubscribeMpdEventsUseCaseInput): Promise<{
	profile: MpdProfile;
	handlerPromise: Promise<MpdSubscriptionHandler>;
}> => {
	const profile = fromBinary(MpdProfileSchema, msg);
	const handlerPromise = mpdClientPort.subscribe(profile, onEvent);
	return { profile, handlerPromise };
};

type UnsubscribeMpdEventsUseCaseInput = {
	msg: Uint8Array;
	handlerPromise?: Promise<MpdSubscriptionHandler>;
	mpdClientPort: MpdClientPort;
};

export const unsubscribeMpdEventsUseCase = async ({
	msg,
	handlerPromise,
	mpdClientPort,
}: UnsubscribeMpdEventsUseCaseInput): Promise<MpdProfile | undefined> => {
	const profile = fromBinary(MpdProfileSchema, msg);
	if (handlerPromise === undefined) {
		return;
	}
	await mpdClientPort.unsubscribe(profile, await handlerPromise);
	return profile;
};

type DisconnectMpdEventsUseCaseInput = {
	profile: MpdProfile;
	handlerPromise: Promise<MpdSubscriptionHandler>;
	mpdClientPort: MpdClientPort;
};

export const disconnectMpdEventsUseCase = async ({
	profile,
	handlerPromise,
	mpdClientPort,
}: DisconnectMpdEventsUseCaseInput): Promise<void> => {
	await mpdClientPort.unsubscribe(profile, await handlerPromise);
};
