.PHONY: up dev stop down help

help:
	@echo ""
	@echo "  make up    — Levantar desde cero (npm install, DB, migraciones, Next.js dev)"
	@echo "  make dev   — Lanzar rapido (DB + Next.js, asume deps instaladas)"
	@echo "  make stop  — Parar contenedores sin eliminarlos (datos conservados)"
	@echo "  make down  — Tirar contenedores sin borrar volumenes (datos conservados)"
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
