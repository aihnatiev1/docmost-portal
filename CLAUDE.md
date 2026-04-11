# Project: CommitDoc

Платформа документации с AI-powered редактором, real-time collaboration и публичным порталом. Fork Docmost v0.70.2.

## Stack

- Backend: TypeScript, NestJS, Kysely ORM
- Frontend: TypeScript, React 18, Vite, Mantine UI, TipTap editor
- Collaboration: Hocuspocus (Yjs-based CRDT)
- DB: PostgreSQL 16
- Cache/Queue: Redis 7
- Infra: Docker Compose, nginx (registryrw/nginx-vts:1.21.4), Cloudflare DNS

## Design System

**Midnight Electric v1.0** — единственный источник правды для UI.

- Live Storybook: https://commitdoc.com/ds/
- Токены: `tokens.css`
- Утилиты: `utilities.js` (namespace `ME.toast`, `ME.modal`, `ME.validate`, `ME.shortcuts`)
- Файлы на сервере: `/var/www/commitdoc-ds/`, исходники `/root/commitdoc-ds/commitdoc/`

## Repo layout

- `apps/server` — NestJS backend (REST API, WebSocket, collaboration server)
- `apps/client` — React SPA (Vite, Mantine, TipTap)
- `packages/editor-ext` — TipTap extensions
- `packages/ee` — Enterprise features
- `docs/` — документация (см. `docs/INDEX.md`)

## Где что искать

- Документация: `docs/INDEX.md` (манифест — читай первым)
- Схема БД: `docs/db/schema.sql` (автоэкспорт)
- Миграции: `apps/server/src/database/migrations/`
- DB types: `apps/server/src/database/types/db.d.ts`
- API модули: `apps/server/src/core/` (page, space, user, group, workspace, comment, attachment, share, search, docs-portal)
- Фронт фичи: `apps/client/src/features/`
- Дизайн-система: https://commitdoc.com/ds/

## Команды

```bash
pnpm install            # установка зависимостей
pnpm dev                # локальный запуск (frontend + backend)
pnpm run server:dev     # только backend
pnpm run client:dev     # только frontend
pnpm run server:build   # сборка backend
pnpm run client:build   # сборка frontend
pnpm build              # сборка всего

# Миграции
pnpm --filter server migration:create <name>   # создать миграцию
pnpm --filter server migration:latest          # применить все
pnpm --filter server migration:down            # откатить последнюю
pnpm --filter server migration:codegen         # перегенерировать типы

# Docker (production)
cd /root/docmost && sudo docker compose up -d   # запуск
sudo docker compose logs -f docmost             # логи

# Обновить дизайн-систему на сервере
sudo docker cp /var/www/commitdoc-ds nginx:/var/www/commitdoc-ds
sudo docker exec -u root nginx chmod -R a+rX /var/www/commitdoc-ds/

# Экспорт схемы БД
sudo docker exec docmost-db-1 pg_dump -U docmost -d docmost --schema-only --no-owner --no-privileges > docs/db/schema.sql
```

## Правила для агента

### Можно без подтверждения

- Править код внутри `apps/` и `packages/`
- Добавлять тесты
- Обновлять документацию в `docs/`

### Требует подтверждения

- Миграции БД
- Зависимости (`package.json`)
- CI/CD конфиги (`.github/`)
- Изменения `docker-compose.yml`

### Запрещено

- Коммитить секреты, `.env`, ключи
- Прямые операции на production БД
- `git push --force` на main
- Массовые рефакторинги без задачи

## Definition of Done

1. Линтер зелёный (`pnpm lint`)
2. Типы проверены (`tsc --noEmit`)
3. Тесты написаны и проходят
4. Обновлены релевантные файлы в `docs/`
5. Коммиты по Conventional Commits

## Стратегия поиска контекста

1. `docs/INDEX.md` → нужный файл документации
2. `grep`/`rg` по коду
3. Схема БД (`docs/db/schema.sql`)
4. Дизайн-система: https://commitdoc.com/ds/
5. Веб — только в последнюю очередь

## Анти-паттерны

- Прямые SQL-запросы в контроллерах — только через `database/repos/`
- `any` в TypeScript — используй точные типы или `unknown`
- `console.log` в продовом коде — только через NestJS Logger
- Бизнес-логика в React-компонентах — выноси в hooks/services
- `innerHTML` без DOMPurify — проект уже использует `dompurify`
- Новые зависимости без обоснования

## Deployment

- Сервер: `213.239.218.169`
- Домен: `commitdoc.com` (Cloudflare Proxied)
- SSL: Let's Encrypt (auto-renew)
- Nginx конфиг: `/root/nginx.conf`
- APP_URL: `https://commitdoc.com`

## Контакты

- Last updated: 2026-04-11
