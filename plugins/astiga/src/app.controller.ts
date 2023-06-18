import { Controller } from "@nestjs/common";
import { AppService } from "./app.service";
import {
  PluginServiceController,
  PluginServiceControllerMethods,
} from "./models/plugin/plugin_service";
import { Observable, throwError } from "rxjs";
import {
  PluginExecuteRequest,
  PluginExecuteResponse,
  PluginInfo,
  PluginPluginType,
  PluginRegisterRequest,
  PluginRegisterResponse,
} from "./models/plugin/plugin";
import { GrpcStreamMethod } from "@nestjs/microservices";
import { SongList } from "./models/song";

@Controller()
@PluginServiceControllerMethods()
export class AppController implements PluginServiceController {
  constructor(private readonly appService: AppService) {}

  register(
    _: PluginRegisterRequest
  ):
    | PluginRegisterResponse
    | Promise<PluginRegisterResponse>
    | Observable<PluginRegisterResponse> {
    return PluginRegisterResponse.create({
      info: PluginInfo.create({
        name: "Astiga",
        version: process.env.npm_package_version,
        description: "Plugin to synchronize songs with a Astiga playlist.",
        contextMenuTitle: "Sync with Astiga",
        contextMenuDescription: "Start synchronization to the Astiga playlist.",
        supportedTypes: [
          PluginPluginType.ON_BROWSER,
          PluginPluginType.ON_FILE_EXPLORE,
          PluginPluginType.ON_PLAYLIST,
          PluginPluginType.ON_PLAY_QUEUE,
          PluginPluginType.ON_SAVED_SEARCH,
        ],
        requiredPluginParameters: ["URL", "User", "Password"],
        requiredRequestParameters: ["Playlist Name"],
      }),
    });
  }

  @GrpcStreamMethod()
  execute(request: PluginExecuteRequest): Observable<PluginExecuteResponse> {
    try {
      const url = request.pluginParameters["URL"];
      const user = request.pluginParameters["User"];
      const password = request.pluginParameters["Password"];
      const playlistName = request.requestParameters["Playlist Name"];
      const songs = SongList.decode(new Uint8Array(request.payload)).songs;
      const ret = this.appService.sync(
        url,
        user,
        password,
        playlistName,
        songs
      );
      return ret;
    } catch (e) {
      return throwError(() => e);
    }
  }
}
