# saldocasa

Sistema de controle financeiro residencial multi-household.

**Stack:** NestJS + Prisma + Postgres (api) · Next.js 15 + Tailwind + shadcn/ui (web) · Docker Compose · GitHub Actions → GHCR → SSH deploy.

## Estrutura

```
apps/
  api/   NestJS + Prisma + Postgres
  web/   Next.js 15 (App Router)
infra/
  nginx-saldocasa.conf      site nginx do host (vai pra /etc/nginx/sites-available/)
  docker-compose.prod.yml   compose que roda em /opt/saldocasa/ no servidor
.github/workflows/
  deploy.yml                CI/CD: build → GHCR → SSH deploy
```

## Dev local

```bash
pnpm install
docker compose -f infra/docker-compose.dev.yml up -d   # postgres dev
pnpm --filter api prisma migrate dev
pnpm --filter api dev    # http://localhost:3011
pnpm --filter web dev    # http://localhost:3010
```

## Produção

Push na `main` → GitHub Actions builda imagens → push pra GHCR → SSH no servidor → `docker compose pull && up -d`.

Domínio: https://saldocasa.morelidev.com
