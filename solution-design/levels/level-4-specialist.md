# Level 4 — Specialist

**Focus:** Owning cross-service designs end-to-end and raising the quality bar across your domain.

## Which of these scenarios can you handle confidently today?

- When a feature requires coordinated changes across three or more services owned by different teams, I can lead the design: facilitate the cross-team design session, produce the shared contract, identify the sequencing dependencies, and maintain the overall design coherence as implementation details emerge.
  `cross-team API contract` `OpenAPI` `RFC process` `design session facilitation` `sequencing dependencies` `interface versioning` `consumer-driven contracts` `Pact`
- When a performance or scalability problem can't be solved within a single service, I can redesign the system boundary: propose caching, CQRS, or read-model patterns, evaluate the consistency trade-offs, and own the migration from the current design to the new one.
  `CQRS` `read model` `event projection` `distributed cache` `Redis` `eventual consistency` `materialised view` `write model` `cache invalidation`
- When the team is about to build something that's been built before in a slightly different form elsewhere in the org, I can identify the overlap, propose reuse or consolidation, and explain what we gain and what we lose by sharing the solution.
  `platform component` `shared library` `inner source` `API gateway` `consolidation` `reuse vs coupling` `Conway's Law` `bounded context`
- When I review a design from another team, I can identify systemic risks they may have missed — not just local code issues but things like retry storms, thundering herds, inconsistent error propagation, or an unstated assumption about ordering guarantees.
  `retry storm` `thundering herd` `circuit breaker` `Resilience4j` `ordering guarantee` `error propagation` `backpressure` `fan-out` `cascading failure`
- When a compliance audit asks how a specific financial transaction flows through our system from initiation to settlement, I can trace it end-to-end across all the services involved, explain the consistency model at each step, and identify any gaps in our audit trail.
  `end-to-end traceability` `correlation ID` `audit trail` `PCI-DSS` `SOX` `distributed tracing` `OpenTelemetry` `consistency model` `settlement flow`

## Training Track

Engineers at this level join **Track B: Advanced → Specialist** together with Level 3 engineers.
