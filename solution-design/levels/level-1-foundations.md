# Level 1 — Foundations

**Focus:** Understanding existing system designs and contributing to discussions with confidence.

## Which of these scenarios can you handle confidently today?

- When I read a service's API contract (OpenAPI spec or Confluence doc), I can understand what it does, what inputs it expects, and what error responses it might return — well enough to integrate against it without needing the owning team to walk me through it.
  `OpenAPI` `Swagger` `HTTP verbs` `status codes` `request/response schema` `error responses` `path parameters` `query parameters`
- When I join a design discussion, I can follow the conversation — understanding what's being traded off and why — even if I'm not yet the one proposing options.
  `trade-off analysis` `synchronous vs asynchronous` `consistency vs availability` `service boundaries` `latency` `bounded context`
- When I'm asked to implement a small feature that touches an existing service boundary, I can identify whether my change requires a schema change, a new API endpoint, or an event — and flag the right people before I start coding.
  `service boundary` `API contract` `Kafka topic` `schema migration` `Liquibase` `REST endpoint` `event-driven`
- When I read an Architecture Decision Record for a system I work in, I understand the structure: the context, the decision, the alternatives considered, and the consequences.
  `ADR` `Architecture Decision Record` `context` `consequences` `alternatives` `MADR` `decision log`
- When a bug turns out to be a design problem (e.g. two services caching the same data independently), I can articulate why it happened structurally — not just what the code did wrong.
  `cache invalidation` `data consistency` `single source of truth` `service coupling` `shared state` `stale data`

## Training Track

Engineers at this level join **Track A: Foundations → Practitioner** together with Level 2 engineers.
