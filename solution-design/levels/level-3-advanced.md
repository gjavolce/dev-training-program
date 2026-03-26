# Level 3 — Advanced

**Focus:** Designing systems that handle complex domains, failure modes, and regulatory constraints.

## Which of these scenarios can you handle confidently today?

- When a domain has strict auditability requirements (PCI-DSS, SOX), I can design the data flow and event sourcing strategy so that every state change is traceable — choosing between event sourcing, audit tables, and change data capture depending on what the compliance requirement actually demands.
  `event sourcing` `audit log` `change data capture` `CDC` `Debezium` `PCI-DSS` `SOX` `append-only table` `event store` `immutable records`
- When a business process needs to span multiple services and must be reliable even if one service is temporarily unavailable, I can design the saga — deciding between orchestration and choreography, defining the compensation logic, and identifying where idempotency is required.
  `saga pattern` `orchestration` `choreography` `compensation transaction` `idempotency key` `distributed transaction` `outbox pattern` `Spring State Machine`
- When an API needs to evolve without breaking existing consumers, I can design the versioning strategy: whether to use URL versioning, content negotiation, or field-level backwards compatibility — and I can explain to the team what "breaking change" actually means in each case.
  `API versioning` `URL versioning` `content negotiation` `Accept header` `backwards compatibility` `breaking change` `additive change` `consumer-driven contracts` `Pact`
- When a service needs to handle data for multiple tenants in our BaaS platform, I can design the tenancy model — data isolation strategy, how tenant context flows through the call stack, and how we prevent cross-tenant data leaks at the application and database layers.
  `multi-tenancy` `tenant isolation` `row-level security` `tenant context` `ThreadLocal` `schema-per-tenant` `data leakage` `PostgreSQL RLS` `Spring Security`
- When a new integration with an external financial system is proposed, I can identify the integration failure modes, design the retry and dead-letter strategy for Kafka consumers, and define what "at-least-once" vs "exactly-once" delivery means for that specific use case.
  `dead-letter topic` `DLT` `at-least-once delivery` `exactly-once semantics` `idempotent consumer` `retry backoff` `@RetryableTopic` `Kafka transactions` `poison pill`

## Training Track

Engineers at this level join **Track B: Advanced → Specialist** together with Level 4 engineers.
