FROM postgres:16-alpine

RUN apk add --no-cache curl zip jq

COPY entrypoint.sh /entrypoint.sh
COPY backup.sh /backup.sh
COPY crontab /etc/crontabs/root

RUN chmod +x /entrypoint.sh /backup.sh

ENTRYPOINT ["/entrypoint.sh"]
