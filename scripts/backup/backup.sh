#!/bin/sh
set -e

# ─── Configuración ────────────────────────────────────────────────────────────
export PGPASSWORD="${POSTGRES_PASSWORD}"
PGHOST="${POSTGRES_HOST:-postgres}"
PGUSER="${POSTGRES_USER:-finances}"
PGDB="${POSTGRES_DB:-my_finances}"

BACKUP_MONTH=$(date +%Y-%m)
BACKUP_DATE=$(date +%Y-%m-%d)
BASE_DIR="/backups/${BACKUP_MONTH}"
TMP_DIR="/tmp/backup_${BACKUP_DATE}_$$"

# Tablas a exportar (en orden de restauración)
TABLES="Entity Product PersonalCategory SharedCategory ProductSnapshot \
        PersonalTransaction SharedYearConfig SharedPersonIncome \
        SharedExpense SharedDeposit"

mkdir -p "${BASE_DIR}"
mkdir -p "${TMP_DIR}"

echo "[backup] ========================================="
echo "[backup] Iniciando backup: ${BACKUP_DATE}"
echo "[backup] ========================================="

# ─── Exportar datos de cada usuario ──────────────────────────────────────────
psql -h "${PGHOST}" -U "${PGUSER}" -d "${PGDB}" -t -A \
  -c 'SELECT id, email, COALESCE(name, email) FROM "User" WHERE email IS NOT NULL' \
  | while IFS='|' read -r uid email uname; do

  echo "[backup] Procesando usuario: ${email}"
  USER_TMP="${TMP_DIR}/${uid}"
  mkdir -p "${USER_TMP}"

  # Registro del usuario
  psql -h "${PGHOST}" -U "${PGUSER}" -d "${PGDB}" \
    -c "\COPY (SELECT id, name, email, \"createdAt\" FROM \"User\" WHERE id = '${uid}') TO STDOUT CSV HEADER" \
    > "${USER_TMP}/User.csv"

  # Todas las tablas del dominio
  for tbl in ${TABLES}; do
    psql -h "${PGHOST}" -U "${PGUSER}" -d "${PGDB}" \
      -c "\COPY (SELECT * FROM \"${tbl}\" WHERE \"userId\" = '${uid}') TO STDOUT CSV HEADER" \
      > "${USER_TMP}/${tbl}.csv" 2>/dev/null || true
  done

  # Crear ZIP
  SAFE_EMAIL=$(echo "${email}" | tr '@.' '_')
  ZIP_NAME="${SAFE_EMAIL}_${BACKUP_DATE}.zip"
  ZIP_PATH="${BASE_DIR}/${ZIP_NAME}"

  cd "${TMP_DIR}"
  zip -qr "${ZIP_PATH}" "${uid}/"
  ZIP_SIZE=$(du -sh "${ZIP_PATH}" | cut -f1)
  echo "[backup] Backup local guardado: ${ZIP_PATH} (${ZIP_SIZE})"

  # ─── Enviar email ──────────────────────────────────────────────────────────
  if [ -z "${RESEND_API_KEY}" ] || [ -z "${BACKUP_FROM_EMAIL}" ]; then
    echo "[backup] RESEND_API_KEY o BACKUP_FROM_EMAIL no configurados — omitiendo email"
    continue
  fi

  B64=$(base64 -w 0 "${ZIP_PATH}")

  PAYLOAD=$(jq -n \
    --arg from  "${BACKUP_FROM_EMAIL}" \
    --arg to    "${email}" \
    --arg subj  "Backup mensual My Finances — ${BACKUP_MONTH}" \
    --arg uname "${uname}" \
    --arg date  "${BACKUP_DATE}" \
    --arg fname "${ZIP_NAME}" \
    --arg data  "${B64}" \
    '{
      from: $from,
      to: [$to],
      subject: $subj,
      html: ("<p>Hola \($uname),</p><p>Adjunto encontrarás el backup mensual de tus datos financieros correspondiente a <strong>\($date)</strong>.</p><p>El ZIP contiene un CSV por cada tabla. Para restaurar, importa los archivos en este orden:<br/><code>Entity → Product → PersonalCategory → SharedCategory → ProductSnapshot → PersonalTransaction → SharedYearConfig → SharedPersonIncome → SharedExpense → SharedDeposit</code></p><p>— My Finances</p>"),
      attachments: [{ filename: $fname, content: $data }]
    }')

  HTTP_CODE=$(curl -s -o /tmp/resend_out.txt -w "%{http_code}" \
    -X POST https://api.resend.com/emails \
    -H "Authorization: Bearer ${RESEND_API_KEY}" \
    -H "Content-Type: application/json" \
    -d "${PAYLOAD}")

  if [ "${HTTP_CODE}" = "200" ] || [ "${HTTP_CODE}" = "201" ]; then
    echo "[backup] Email enviado a ${email}"
  else
    echo "[backup] ERROR enviando email a ${email} (HTTP ${HTTP_CODE}):"
    cat /tmp/resend_out.txt
  fi
done

# ─── Limpieza ─────────────────────────────────────────────────────────────────
rm -rf "${TMP_DIR}"

# Rotación: conservar últimos 12 meses
find /backups -maxdepth 1 -type d -name "20*" | sort | head -n -12 | xargs -r rm -rf

echo "[backup] ========================================="
echo "[backup] Backup completado: ${BACKUP_DATE}"
echo "[backup] ========================================="
