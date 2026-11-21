import {
	readViewStateBlobUseCase,
	saveViewStateBlobUseCase,
} from "../application/viewStateBlobUseCases.js";
import type { ViewStateBlobRepository } from "../repositories/ViewStateBlobRepository.js";
import type { ViewStateBlobMessageHandler } from "./ViewStateBlobMessageHandler.js";

export class ViewStateBlobMessageHandlerSocketIo
	implements ViewStateBlobMessageHandler
{
	constructor(private readonly repository: ViewStateBlobRepository) {}

	save = (data: string): string => {
		return saveViewStateBlobUseCase(this.repository, data);
	};

	fetch = (token: string): string | undefined => {
		return readViewStateBlobUseCase(this.repository, token);
	};
}
