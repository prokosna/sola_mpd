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
- [x] All songs (Simple full-text search)
- [x] Responsive layout for tablets
- [x] Support touch devices
- [x] Browse recently added artists, albums and composers

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

### Responsive layout for tablets

![sola_mpd_responsive](https://github.com/prokosna/sola_mpd/assets/16056246/be76062a-af86-4826-a575-4869a837a524)

## How to install

Sola MPD is a web based client and needs to be deployed on your server in the local network.

It can be the same server as the MPD server or on a different server, as long as it can communicate with the MPD server.

Sola MPD only requires [Docker](https://docs.docker.com/engine/install/) and Docker Compose to be installed on the server.

If you are using the latest version of Docker, the `compose` command is already included. Otherwise, you need to [install it separately](https://docs.docker.com/compose/install/linux/).

1. Ensure a docker process is running on the server

    ```
    $ docker ps
    ```

    If you have any issues, please confirm if you installed Docker correctly.

1. Clone this repository on your server

    ```
    $ git clone git@github.com:prokosna/sola_mpd
    ```

1. Move to the folder

    ```
    $ cd sola_mpd
    ```

1. [Optional] Edit the docker-compose.yaml file if you want to change the port or other configurations

    ```
    $ vi docker-compose.yaml
    ```

1. Run the container

    ```
    $ docker compose up --build -d
    ```

1. Access to http://[Your Server IP]:3000 from your browser

1. In the setup dialog, please enter the endpoint of your mpd server which can be accessed from the Sola MPD server. 

**If you are using bridge mode and MPD is running on the same server, you need to use "host.docker.internal" instead of "localhost".**

## How to update

The main branch should be always the latest working branch.

You just need to stop the running container, pull the latest main branch and run the latest container.

```
$ cd sola_mpd
$ docker compose down
$ git pull origin main
$ docker compose up --build -d
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

1. Uncomment the Astiga plugin in `docker-compose.yaml`

1. Run the plugin container with Sola MPD

    ```
    $ docker compose up --build -d
    ```

1. On the Plugin page in Sola MPD, enter the plugin endpoint (in this case `[Your Server IP]:3001`) and configure the plugin following a dialog.

1. When the plugin is available, you will see `Sync with Astiga` in the right-click context menu and you can create a playlist with selected songs on Sola MPD as long as the exact same songs are available on Astiga as well.

This plugin is quite specific to my use case, but you can use this as a reference to develop a custom plugin for your use case.

## For developers

### Setup a development environment

Sola MPD is written in TypeScript with React, Vite, Protocol Buffers, Jotai, etc.

```
# 1. Install dependencies, set up a husky hook for format/lint
$ npm i

# 2. Build the domain package first
$ npm run -w packages/domain build

# 3. Run dev servers
$ npm run dev
```
