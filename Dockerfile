# syntax=docker/dockerfile:1

# ---------- dependencias ----------
FROM node:22-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci


# ---------- build ----------
FROM node:22-alpine AS builder

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build
# La cache de build no sirve para nada en runtime y pesa cientos de MB.
RUN rm -rf .next/cache


# ---------- runtime ----------
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -g 10001 -S nodeapp && adduser -u 10001 -S nodeapp -G nodeapp

# Se copia solo lo necesario para servir: queda fuera el codigo fuente y
# .next/cache, que es lo que engordaba la imagen anterior.
COPY --from=builder --chown=nodeapp:nodeapp /app/node_modules   ./node_modules
COPY --from=builder --chown=nodeapp:nodeapp /app/.next          ./.next
COPY --from=builder --chown=nodeapp:nodeapp /app/public         ./public
COPY --from=builder --chown=nodeapp:nodeapp /app/package.json   ./package.json
COPY --from=builder --chown=nodeapp:nodeapp /app/next.config.ts ./next.config.ts
# El esquema y las migraciones hacen falta en runtime para `migrate deploy`.
COPY --from=builder --chown=nodeapp:nodeapp /app/prisma         ./prisma

COPY --chown=nodeapp:nodeapp docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod 755 /usr/local/bin/docker-entrypoint.sh

USER nodeapp

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "start"]
