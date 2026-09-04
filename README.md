# Resolve

Base de um SaaS B2B de help desk multi-tenant. O repositório começa pela fundação do monólito modular: web React, API Fastify e pacotes compartilhados.

## Estrutura

- `apps/web` — aplicação React/Vite
- `apps/api` — API REST Fastify
- `packages/types` — contratos de domínio compartilhados
- `packages/validation` — schemas Zod compartilhados

## Pré-requisitos

Node.js 22+ e pnpm 9+ (via Corepack).

```bash
corepack pnpm install
Copy-Item .env.example .env
docker compose up -d postgres
corepack pnpm --filter @resolve/api db:migrate
corepack pnpm dev
```

Use `corepack pnpm typecheck`, `corepack pnpm test` e `corepack pnpm build` antes de enviar alterações.

## Próximo incremento

Autenticação, organizações e memberships, com o contexto de organização aplicado no backend antes da criação de customers e tickets.
