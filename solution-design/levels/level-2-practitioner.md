# Level 2 — Practitioner

**Focus:** Designing features that span service boundaries and documenting those decisions clearly.

## Which of these scenarios can you handle confidently today?

- When I'm building a new feature that involves multiple services, I can design the interaction: define the API contract, identify who owns what data, and choose between synchronous HTTP and async Kafka messaging based on the consistency and latency requirements.
  `OpenAPI` `Kafka topic` `REST` `synchronous vs asynchronous` `eventual consistency` `data ownership` `@KafkaListener` `Spring WebClient`
- When I need to document a technical decision I've made, I can write an ADR that explains the context clearly, states the decision, lists what I considered and rejected, and describes the consequences — including the downsides.
  `ADR` `Architecture Decision Record` `MADR` `decision log` `trade-off` `consequences` `alternatives considered`
- When I design a new REST endpoint, I can reason about the right HTTP verb and status codes, what goes in the URL vs the body, how pagination should work, and what error responses the client needs to handle.
  `HTTP verbs` `idempotency` `PUT vs PATCH` `cursor pagination` `RFC 9457` `problem+json` `400 vs 422` `REST conventions`
- When I'm designing the data model for a new feature, I can identify what the aggregate root is, where the consistency boundary sits, and whether any data needs to be replicated across services — and I can explain the trade-offs to my team.
  `aggregate root` `consistency boundary` `DDD` `bounded context` `data replication` `eventual consistency` `domain event` `foreign key vs event`
- When someone proposes a design in a PR or design doc, I can give concrete feedback: not just "I don't like this" but specific concerns about consistency, error handling, backwards compatibility, or missing failure modes.
  `backwards compatibility` `error propagation` `failure mode` `idempotency` `contract versioning` `non-functional requirements` `edge cases`

## Training Track

Engineers at this level join **Track A: Foundations → Practitioner** together with Level 1 engineers.
