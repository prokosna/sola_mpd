# Sola MPD

![screenshot](https://github.com/prokosna/sola_mpd/assets/16056246/337d705e-801f-4e7d-8ecb-e8723f140621)

Sola MPD is a web based MPD client.
This client has the following features:

- Player
- Play queue
- Metadata browser (inspired by [GMPC](http://gmpclient.org/))
- Playlist
- Search
  - AND, OR, regular expression, etc
  - Saved searches (a.k.a Smart Playlist inspired by [MusicBee](https://www.getmusicbee.com/))
- File Explore (inspired by GMPC)
- Quick search box (inspired by MusicBee)
- Plugin for integration with other services
- Flexible song table layout including multi-column sorting (powered by [AG Grid](https://www.ag-grid.com/))

On the other hand, the following features are out of scope:

- Cover art
- Metadata editing
- ...etc

## How to use

Sola MPD can be deployed using Docker in your local network.

It can be deployed on the same server as the MPD server or on a different server, as long as it can communicate with the MPD server.

1. [Install Docker Engine on your server](https://docs.docker.com/engine/install/)
2. Clone this repository on your server

```
$ git clone git@github.com:prokosna/sola_mpd
```

3. Move to the folder

```
$ cd sola_mpd
```

4. Build a docker image

```
$ docker/build.sh
```

5. And run (The default port is 3000, but you can change it by `--port` argument.)

```
$ docker/start.sh [--port 3000]
```

6. Access to http://[Your Server IP]:3000 from your browser

When you want to update, the following commands are what you need:

```
$ cd sola_mpd
$ git pull origin main
$ docker/remove.sh
$ docker/build.sh
$ docker/start.sh
```

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

Sola MPD is built in TypeScript with utilizing React, Next.js, Protocol Buffers and so on.

```
# 1. Install dependencies, set up a husky hook for format/lint
$ npm i

# 2. Compile protobuf messages as all objects are defined in the Protobuf format
$ npm run proto

# 3. Run a dev server (Currently hot-reload doesn't work due to the custom server issue of Next.js)
$ npm run dev
```
