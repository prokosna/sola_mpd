# Sola MPD

Sola MPD is a web-based MPD client focused on usability with flexible browsing and advanced search.

This client has the following features:

- [x] Playback control (Play, Resume, Next, and so on)
- [x] Play queue
- [x] Flesible metadata browser (inspired by [GMPC](http://gmpclient.org/))
- [x] MPD Playlist management
- [x] Advanced search
  - `=`, `!=`, `has`, `regular expression`, etc
  - Flexible AND/OR combinations
  - Saved searches (a.k.a Smart Playlist inspired by [MusicBee](https://www.getmusicbee.com/))
- [x] Database file tree
- [x] Quick filtering box (inspired by MusicBee)
- [x] Plugin for integration with other services
- [x] Intuitive song table editing (powered by [AG Grid](https://www.ag-grid.com/))
- [x] Multiple MPD servers
- [x] Dark theme

On the other hand, the following features are out of scope for now:

- [ ] Cover art

Feel free to file an issue if you are interested in some of missing capabilities.

**Sola MPD only supports MPD version 0.21 or later.**

## Screenshot gifs

### Intuitive control

![sola_mpd_usage_queue](https://github.com/prokosna/sola_mpd/assets/16056246/8da62b48-c8f2-4c2f-a669-74fdfffe36c7)

### Flexible browsing

![sola_mpd_usage_browser](https://github.com/prokosna/sola_mpd/assets/16056246/22f8c76d-6f35-4da2-9cba-94b539dc35fa)

### Advanced search

![sola_mpd_usage_search](https://github.com/prokosna/sola_mpd/assets/16056246/203ad3e9-f1a2-420d-a66b-38ad1a44f6a6)

### Dark theme

![sola_mpd_usage_dark](https://github.com/prokosna/sola_mpd/assets/16056246/de0133fb-bfc4-4a30-be02-e0338397fb24)

## How to install

Sola MPD is a web based client and needs to be deployed on your server in the local network.

It can be the same server as the MPD server or on a different server, as long as it can communicate with the MPD server.

Sola MPD only requires [Docker](https://docs.docker.com/engine/install/) installed on the server.

1. Ensure a docker process is running on the server

```
$ docker ps
```

If you have any issues, please confirm if you installed Docker correctly.

2. Clone this repository on your server

```
$ git clone git@github.com:prokosna/sola_mpd
```

3. Move to the folder

```
$ cd sola_mpd
```

4. Build a docker image (It takes several minutes. Please have a :coffee:)

```
$ docker/build.sh
```

5. And run (The default port is 3000, but you can change it by `--port` argument.)

```
$ docker/start.sh [--port 3000]
```

6. Access to http://[Your Server IP]:3000 from your browser

7. In the setup dialog, please enter the endpoint of your mpd server which can be accessed from the Sola MPD server. **If your mpd server is running on the same server, you need to use "host.docker.internal" instead of "localhost".**

## How to update

The main branch should be always the latest working branch.

You just need to stop the running container, pull the latest main branch and run the latest container.

```
$ cd sola_mpd
$ git pull origin main
$ docker/remove.sh
$ docker/build.sh
$ docker/start.sh
```

## Usage tips (operations & shortcut keys)

| Action                      | Description                                                                                                                 |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Double click                | Add the song to the end of the play queue and play that song                                                                |
| Shift + select a song       | Range selection                                                                                                             |
| Ctrl + select a song        | Multiple selection                                                                                                          |
| Ctrl + A                    | Select all visible songs                                                                                                    |
| Space                       | Pause or resume playback                                                                                                    |
| Add (Context menu)          | Add the selected songs to the play queue                                                                                    |
| Replace (Context menu)      | Replace the current play queue with the selected songs                                                                      |
| Edit Columns (Context menu) | Edit the metadata to be used as columns - The order can be changed by directly dragging & dropping the column on the table. |

## Plugin

Sola MPD has a plugin system to integrate with other services.

For example, I have a use case to synchronize MPD songs with a [Astiga](https://asti.ga/) playlist and have developed the Astiga plugin.

To use the Astiga plugin:

1. Move to the plugin folder

```
$ cd sola_mpd/plugins/astiga
```

2. Run the plugin

```
$ docker/build.sh
$ docker/start.sh [--port 3001]
```

3. On the Plugin page in Sola MPD, enter the plugin endpoint (in this case `[Your Server IP]:3001`) and configure the plugin following a dialog.
4. When the plugin is available, the right-click context menu has `Sync with Astiga` and you can create a playlist with selected songs on Sola MPD as long as the exact same songs are available on Astiga as well.

This plugin is quite specific to my use case, but you can use this as a reference to develop a custom plugin for your use case.

## For developers

Sola MPD is written in TypeScript with React, Next.js, Protocol Buffers and so on.

```
# 1. Install dependencies, set up a husky hook for format/lint
$ npm i

# 2. Compile protobuf messages as all objects are defined in the Protobuf format
$ npm run proto

# 3. Run a dev server (Currently hot-reload doesn't work due to the custom server issue of Next.js)
$ npm run dev
```
