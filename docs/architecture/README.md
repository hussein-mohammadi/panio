# Telegram Shop SaaS Architecture

This directory contains the architecture proposal, ERD, user flows, and phased implementation plan for the Telegram-first shop management SaaS described in the product brief.

## Documents

- [architecture-proposal.md](architecture-proposal.md)
- [erd.md](erd.md)
- [user-flows.md](user-flows.md)
- [implementation-plan.md](implementation-plan.md)

## Repository status

Implemented: the app runs entirely on Cloudflare Workers (no separate server) — see
`src/worker/`, D1 schema in `src/infrastructure/db/`, and the Mini App frontend in
`public/app/`. The stack section of `architecture-proposal.md` (§11) has been updated to
match; the rest of that document's principles (tenant scoping, provider abstractions,
adapters-not-business-logic) still hold and are what the Worker code follows. See
`DEPLOY.md` at the repo root for the deployment runbook.

## Core direction

- Telegram Bot and Mini App are adapters; business logic lives in application/domain services.
- Every tenant-scoped data access must be explicit about shopId.
- Payment, entitlements, and Telegram integrations are isolated behind abstractions.
- The system runs serverlessly on Cloudflare Workers, with D1 (SQLite) for persistence and
  KV for ephemeral bot conversation state — no Postgres/Redis/Node server, by requirement.
