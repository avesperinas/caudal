#!/bin/sh
# Aplica las migraciones pendientes antes de servir trafico.
#
# `prisma migrate deploy` es idempotente: si no hay nada pendiente, no hace nada.
# Si falla, el contenedor no arranca, el healthcheck no pasa y el reconciliador
# del server revierte al tag anterior.
set -e

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "[entrypoint] aplicando migraciones de Prisma..."
  npx prisma migrate deploy
  echo "[entrypoint] migraciones al dia"
fi

exec "$@"
