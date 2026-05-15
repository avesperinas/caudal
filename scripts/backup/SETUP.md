# Configuración del sistema de backups

## Qué hace

El día 5 de cada mes a las 08:00, el servicio exporta los datos de cada usuario
como CSVs comprimidos en un ZIP y los guarda localmente. Si está configurado
Resend, también envía el ZIP por email al usuario.

Retención local: últimos 12 meses en el volumen Docker `backups`.

## Activar el email (Resend)

1. Crear cuenta en https://resend.com (plan gratuito: 3.000 emails/mes)
2. Verificar el dominio desde el que se enviará (panel Resend → Domains)
3. Generar una API key (panel Resend → API Keys)
4. Añadir al `.env.local`:

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
BACKUP_FROM_EMAIL=backup@tu-dominio.com
```

5. Reiniciar el servicio:

```bash
docker compose up -d backup
```

## Ejecutar un backup manualmente

```bash
docker compose exec backup /backup.sh
```

## Ver los backups guardados

```bash
docker compose exec backup ls -lh /backups/
```

## Ver logs del cron

```bash
docker compose exec backup cat /var/log/backup.log
```

## Restaurar datos de un ZIP

Descomprime el ZIP. Dentro hay un CSV por tabla. Importar en este orden:

```
Entity → Product → PersonalCategory → SharedCategory →
ProductSnapshot → PersonalTransaction → SharedYearConfig →
SharedPersonIncome → SharedExpense → SharedDeposit
```

Ejemplo para una tabla:

```bash
docker compose exec -T postgres psql -U finances my_finances \
  -c "\COPY \"Entity\" FROM STDIN CSV HEADER" < Entity.csv
```
