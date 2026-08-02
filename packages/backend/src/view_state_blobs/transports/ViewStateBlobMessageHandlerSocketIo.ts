import {
	readViewStateBlobUseCase,
	saveViewStateBlobUseCase,
} from "../application/viewStateBlobUseCases.js";
import type { ViewStateBlobMessageHandler } from "./ViewStateBlobMessageHandler.js";

export class ViewStateBlobMessageHandlerSocketIo
	implements ViewStateBlobMessageHandler
{
	save = (data: string): string => {
		return saveViewStateBlobUseCase(data);
	};

	fetch = (token: string): string | undefined => {
		return readViewStateBlobUseCase(token);
	};
}
