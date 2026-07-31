.PHONY: up dev stop down release help

help:
	@echo ""
	@echo "  Desarrollo:"
	@echo "    make up           — Levantar desde cero (npm install, DB, migraciones, Next.js dev)"
	@echo "    make dev          — Lanzar rapido (DB + Next.js, asume deps instaladas)"
	@echo "    make stop         — Parar contenedores sin eliminarlos (datos conservados)"
	@echo "    make down         — Tirar contenedores sin borrar volumenes (datos conservados)"
	@echo ""
	@echo "  Produccion:"
	@echo "    make release V=v1.3.0  — Taggear y publicar. El resto es automatico."
	@echo ""
	@echo "    El despliegue lo hace GitHub Actions + el reconciliador del server."
	@echo "    Las migraciones se aplican solas al arrancar el contenedor."
	@echo "    Estado desplegado: github.com/avesperinas/infra"
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

# Publica una version. GitHub Actions construye las imagenes y el server las
# recoge solo en menos de un minuto.
release:
ifndef V
	$(error Falta la version. Uso: make release V=v1.3.0)
endif
	@git diff --quiet || { echo "Hay cambios sin commitear."; exit 1; }
	git tag $(V)
	git push origin $(V)
	@echo "Seguimiento: https://github.com/avesperinas/caudal/actions"
