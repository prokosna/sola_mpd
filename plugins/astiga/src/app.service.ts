import { Injectable } from "@nestjs/common";
import { Observable, Subject } from "rxjs";
import {} from "./models/plugin/plugin_service";
import { Song, SongMetadataTag } from "./models/song";
import {
  PluginExecuteResponse,
  PluginExecuteResponseStatus,
} from "./models/plugin/plugin";
import { AstigaClient } from "./astiga";
import { getSongMetadataAsString, sleep } from "./utils";

@Injectable()
export class AppService {
  sync(
    url: string,
    user: string,
    password: string,
    playlistName: string,
    songs: Song[]
  ): Observable<PluginExecuteResponse> {
    const subject = new Subject<PluginExecuteResponse>();

    (async () => {
      try {
        const client = new AstigaClient(url, user, password);

        subject.next(
          PluginExecuteResponse.create({
            message: "Calculating difference...",
            progressPercentage: 0,
            status: PluginExecuteResponseStatus.OK,
          })
        );

        let playlist = await client.getOrCreatePlaylist(playlistName);
        const existingSongs = await client.fetchSongs(playlist);

        let diffSongs = await client.diff(songs, existingSongs);
        if (diffSongs === undefined) {
          subject.next(
            PluginExecuteResponse.create({
              message:
                "Existing songs don't match to target songs. Deleting playlist...",
              progressPercentage: 0,
              status: PluginExecuteResponseStatus.OK,
            })
          );
          await client.delete(playlist);
          playlist = await client.getOrCreatePlaylist(playlistName);
          diffSongs = songs;
        }

        const total = diffSongs.length;
        for (const [index, song] of diffSongs.entries()) {
          const title = getSongMetadataAsString(song, SongMetadataTag.TITLE);
          subject.next(
            PluginExecuteResponse.create({
              message: `(${
                index + 1
              }/${total}) Adding "${title}" to ${playlistName} `,
              progressPercentage: Math.floor(((index + 1) / total) * 100),
              status: PluginExecuteResponseStatus.OK,
            })
          );

          const astigaSong = await client.find(song);
          if (astigaSong === undefined) {
            subject.next(
              PluginExecuteResponse.create({
                message: `Failed to find "${title}" in Astiga`,
                progressPercentage: Math.floor(((index + 1) / total) * 100),
                status: PluginExecuteResponseStatus.WARN,
              })
            );
            continue;
          }
          await client.add(astigaSong, playlist);
          await sleep(100);
        }

        subject.complete();
      } catch (e) {
        subject.error(e);
      }
    })();

    return subject.asObservable();
  }
}
