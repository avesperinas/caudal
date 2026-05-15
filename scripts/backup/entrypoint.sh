#!/bin/sh
# Si se pasa "backup" como argumento, ejecuta el script directamente (para testing)
if [ "$1" = "backup" ]; then
  exec /backup.sh
fi

echo "[backup] Servicio iniciado. Ejecutará backup el día 5 de cada mes a las 08:00."
exec crond -f -l 8
