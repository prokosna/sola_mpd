# Sola MPD

Sola MPD is a web-based MPD client focused on usability with flexible browsing and search.

The primary goal of this client is to help users efficiently find specific songs within large music libraries and freely organize them into a queue and playlists. If you're looking for a table-oriented UI for better music management, this client might be a good fit. However, if you're seeking a player with fancy visual design, this may not be what you're looking for.

This client has the following features:

- [x] Playback control (Play, Resume, Next, and so on)
- [x] Play queue
- [x] Flexible metadata browser (inspired by [GMPC](http://gmpclient.org/))
- [x] MPD Playlist management
- [x] Flexible search
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
- [x] Supports touch devices
- [x] Browse recently added artists, albums and composers
- [x] Playlist sync with Subsonic API compatible service (via plugin)
- [x] Advanced search (Beta, requires [lainbow](https://github.com/prokosna/lainbow) integration)
  - Text-to-Music search (MuQ-MuLan)
  - Similarity search (MuQ)

On the other hand, the following features are out of scope for now:

- [ ] Cover art

Feel free to file an issue if you are interested in any of missing capabilities.

**Sola MPD only supports MPD version 0.21 or later.**

Some features may use MPD's API in a suboptimal way (e.g., loading all songs at once). While the client has been tested and works well in my environment (with a library of approximately 85,000 songs), it might consume excessive memory with significantly larger libraries.

## Screenshot gifs

### Intuitive control

![sola_mpd_usage_queue](https://github.com/user-attachments/assets/003e7a98-3918-440c-929a-8c7e601c9100)

### Flexible browsing

![sola_mpd_usage_browser](https://github.com/user-attachments/assets/ed3d16f2-55cc-4b5a-9a55-aa66326fa82a)

### Advanced search

![sola_mpd_usage_search](https://github.com/user-attachments/assets/b1e59b46-1f35-4186-ad90-28b7aa86188a)

### File explore

![sola_mpd_usage_file_explore](https://github.com/user-attachments/assets/c7213d09-a48e-4ebd-a975-30c57b6801dd)

### Light/Dark theme

![sola_mpd_usage_dark](https://github.com/user-attachments/assets/6aefa0ec-4b66-4562-a9c3-9bbdeb1b8dbc)

### Responsive layout for tablet and mobile

![sola_mpd_responsive](https://github.com/user-attachments/assets/04e0eae5-a3ac-46dc-9078-2b247ff1c217)

### Similarity search

![sola_mpd_similarity_search](https://github.com/user-attachments/assets/27ebfff2-a099-4eb9-b78f-37c9d455bd6f)

### Text-to-Music search

![sola_mpd_text_to_music_search](https://github.com/user-attachments/assets/8935c616-806a-45d1-8331-80fd68136a58)

## How to install

Sola MPD is a web based client and needs to be deployed on your server in the local network.

It can be the same server as the MPD server or on a different server, as long as it can communicate with the MPD server.

Sola MPD only requires [Docker](https://docs.docker.com/engine/install/) and Docker Compose to be installed on the server.

If you are using the latest version of Docker, the `compose` command is already included. Otherwise, you need to [install it separately](https://docs.docker.com/compose/install/linux/).

1. Ensure a docker process is running on the server

    ```bash
    docker ps
    ```

    If you have any issues, please confirm if you installed Docker correctly.

1. Clone this repository on your server

    ```bash
    git clone https://github.com/prokosna/sola_mpd.git
    cd sola_mpd
    ```

1. [Optional] Edit the docker-compose.yaml file if you want to change the port or other configurations

    ```
    $ vi docker-compose.yaml
    ```

1. **For users migrating from `docker/start.sh`:**
   If you were using the previous version with `docker/start.sh`, run the migration script before starting the new version:

   ```bash
   ./docker/migrate_db.sh
   ```

   This will copy your existing database from the old `sola_db` volume to the new one.

1. Start the application

    ```bash
    docker compose up -d
    ```

1. Access to http://[Your Server IP]:3000 (or the port you configured) from your browser

1. In the setup dialog, please enter the endpoint of your mpd server which can be accessed from the Sola MPD server. 

    **If you are using bridge mode and MPD is running on the same server, you need to use "host.docker.internal" instead of "localhost".**

## How to update

The main branch should be always the latest working branch.

You just need to stop the running container, pull the latest main branch and run the latest container.

```bash
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

## Advanced search (Beta)

You can unlock the following features by setting up [lainbow](https://github.com/prokosna/lainbow).

- Text-to-Music search ([MuQ-MuLan](https://huggingface.co/OpenMuQ/MuQ-MuLan-large))
- Similarity search ([MuQ](https://huggingface.co/OpenMuQ/MuQ-large-msd-iter))

Once you have set up [lainbow](https://github.com/prokosna/lainbow), you can just uncomment the following line in [docker-compose.yaml](docker-compose.yaml),

```yaml
      args:
        LAINBOW_ENDPOINT: "http://your.lainbow.endpoint:port/"
```

then restart the container.

```bash
$ docker compose down
$ docker compose up --build -d
```

Sola MPD requires MuQ and MuQ-MuLan embeddings in the vector database for these features.
After restarting the container, the "Advanced Search" tab will be available in the Settings page.
If you use Settings > Advanced Search > Scan Library and Analyze buttons to prepare the vector database, only MuQ and MuQ-MuLan embeddings will be generated.

<img width="734" height="323" alt="2025-09-13 173633" src="https://github.com/user-attachments/assets/f2d623bb-de82-4b44-96af-1b8fa19ff1a7" />

Please note that lainbow requires a NVIDIA GPU to generate embeddings. It works with CPU but it takes much longer time to generate embeddings.

**This feature may require some engineering skill to set up. Feel free to let me know if you are interested in this feature but having some trouble setting it up.**

## Plugin

Sola MPD has a plugin system to integrate with other services.

For example, I have a use case to synchronize MPD songs with a playlist in an application compatible with [Subsonic API](https://www.subsonic.org/pages/api.jsp) and have developed the Subsonic plugin.

To use the Subsonic plugin:

1. Uncomment the Subsonic plugin in `docker-compose.yaml`

1. Run the plugin container with Sola MPD

    ```
    $ docker compose up --build -d
    ```

1. On the Plugin page in Sola MPD, enter the plugin endpoint (in this case `[Your Server IP]:3001`) and configure the plugin following a dialog.

1. When the plugin is available, you will see `Sync with Subsonic` in the right-click context menu and you can create a playlist with selected songs on Sola MPD as long as the exact same songs are available on Subsonic as well.

This plugin is quite specific to my use case, but you can use this as a reference to develop a custom plugin for your use case.

## For developers

### Setup a development environment

Sola MPD is written in TypeScript with React, Vite, Protocol Buffers, Jotai, etc.

```
# 1. Install dependencies, set up a husky hook for format/lint
$ pnpm install

# 2. Build the domain package first
$ pnpm --filter @sola_mpd/domain build

# 3. Run dev servers
$ pnpm dev
```
