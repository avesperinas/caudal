.PHONY: up dev stop down prod prod-migrate prod-logs prod-stop help

help:
	@echo ""
	@echo "  Desarrollo:"
	@echo "    make up           — Levantar desde cero (npm install, DB, migraciones, Next.js dev)"
	@echo "    make dev          — Lanzar rapido (DB + Next.js, asume deps instaladas)"
	@echo "    make stop         — Parar contenedores sin eliminarlos (datos conservados)"
	@echo "    make down         — Tirar contenedores sin borrar volumenes (datos conservados)"
	@echo ""
	@echo "  Produccion (servidor con Cloudflare Tunnel):"
	@echo "    make prod         — Build y arranque de todo (app + postgres + backup + tunnel)"
	@echo "    make prod-migrate — Aplicar migraciones (correr tras 'make prod')"
	@echo "    make prod-logs    — Ver logs en streaming"
	@echo "    make prod-stop    — Parar todos los servicios de produccion"
	@echo ""

# Levanta todo desde cero: DB, deps, migraciones y servidor de desarrollo
up:
	docker compose up -d --wait
	npm install
	npx prisma migrate deploy
	npx prisma generate
	npm run dev

# Lanzar (deps ya instaladas): arranca DB si no corre y lanza Next.js
dev:
	docker compose up -d --wait
	npm run dev

# Parar contenedores (se pueden reanudar con `make dev`)
stop:
	docker compose stop

# Eliminar contenedores; los volumenes y datos persisten
down:
	docker compose down

# ─── Produccion ──────────────────────────────────────────────────────────────

prod:
	docker compose --env-file .env.local --profile prod up -d --build

prod-migrate:
	docker compose --env-file .env.local --profile prod exec app npx prisma migrate deploy

prod-logs:
	docker compose --env-file .env.local --profile prod logs -f

prod-stop:
	docker compose --env-file .env.local --profile prod down
