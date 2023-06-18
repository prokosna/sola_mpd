FROM alpine:latest

RUN set -e && \
    apk add --no-cache mpd && \
    mkdir -p /music && \
    mkdir -p /playlists && \
    mkdir -p /var/lib/mpd

COPY mpd.conf /etc/mpd.conf
VOLUME /var/lib/mpd
EXPOSE 6600

CMD ["mpd", "--stdout", "--no-daemon"]
