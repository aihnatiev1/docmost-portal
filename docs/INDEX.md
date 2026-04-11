# Docs Index

Манифест документации. Агент читает этот файл, чтобы решить, что загружать.

## Дизайн-система

**Midnight Electric v1.0** — единственный источник правды для UI.

- Live Storybook: https://commitdoc.com/ds/
- Файлы: `/var/www/commitdoc-ds/` (на сервере), исходники `/root/commitdoc-ds/commitdoc/`
- Токены: `tokens.css` — цвета, типографика, отступы, тени, радиусы, z-index, motion
- Утилиты: `utilities.js` — toast, modal, validate, shortcuts, portal (namespace `ME.*`)
- Анимации: `animations.js`
- Иконки: `icons.js`
- TypeScript: `types.d.ts`
- React adapter: `react.tsx`
- Storybook hub: `08-storybook.html` (71 story, 9 групп)

## Архитектура

- `architecture/overview.md` — общая картина проекта CommitDoc (Docmost fork)

## База данных

- `db/schema.sql` — актуальная схема PostgreSQL (автоэкспорт)
- Миграции: `apps/server/src/database/migrations/`
- ORM: Kysely (type-safe query builder)
- Codegen: `pnpm --filter server migration:codegen` → `apps/server/src/database/types/db.d.ts`

## Операции

- Сервер: `213.239.218.169`
- Домен: `commitdoc.com` (Cloudflare → nginx → Docker)
- SSL: Let's Encrypt, автопродление, истекает 2026-07-10
- Docker Compose: `/root/docmost/docker-compose.yml`
- Nginx: `/root/nginx.conf` (внутри контейнера `nginx`, image `registryrw/nginx-vts:1.21.4`)
- PostgreSQL: порт 5434 (127.0.0.1), user `docmost`, db `docmost`
- Redis: порт 6381 (127.0.0.1)

## Разработка

- `dev/onboarding.md` — поднять проект

## Справочники

- `adr/` — Architecture Decision Records

## Правила обновления

- Каждый PR, меняющий поведение, обновляет релевантный файл
- `db/schema.sql` — не править руками, выгружается командой:
  ```bash
  docker exec docmost-db-1 pg_dump -U docmost -d docmost --schema-only --no-owner --no-privileges > docs/db/schema.sql
  ```
- При изменении/обновлении файлов дизайн-системы — обновить `/var/www/commitdoc-ds/` и выполнить:
  ```bash
  docker cp /var/www/commitdoc-ds nginx:/var/www/commitdoc-ds
  docker exec -u root nginx chmod -R a+rX /var/www/commitdoc-ds/
  ```
