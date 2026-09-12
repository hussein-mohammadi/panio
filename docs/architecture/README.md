# Telegram Shop SaaS Architecture

This directory contains the architecture proposal, ERD, user flows, and phased implementation plan for the Telegram-first shop management SaaS described in the product brief.

## Documents

- [architecture-proposal.md](architecture-proposal.md)
- [erd.md](erd.md)
- [user-flows.md](user-flows.md)
- [implementation-plan.md](implementation-plan.md)

## Repository status

The workspace is currently empty. No existing application code, database schema, or runtime configuration was available to validate against. The architecture below therefore follows the product brief and Telegram platform constraints, while explicitly marking assumptions that are not verified in this repository.

## Core direction

- Telegram Bot and Mini App are adapters; business logic lives in application/domain services.
- Every tenant-scoped data access must be explicit about shopId.
- Payment, entitlements, and Telegram integrations are isolated behind abstractions.
- The system is designed for serverless-friendly deployment with PostgreSQL and Redis.
