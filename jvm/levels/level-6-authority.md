# Level 6 — Authority

**Focus:** I own memory strategy for the engineering organisation.

*Production lens: I define how we think about memory at the platform level — observability, capacity planning, SLA budgets, and the technology roadmap.*

## Which of these scenarios can you handle confidently today?

- When the organisation needs a memory reliability strategy (standard JVM base images, mandatory heap dump capture on OOM, GC anomaly alerting, automated JFR on threshold breach), I can design the end-to-end approach and drive adoption across all teams.
  `JVM base images` `HeapDumpOnOutOfMemoryError` `GC anomaly alerting` `automated JFR` `platform reliability` `fleet-wide standards`

- When defining performance budgets for BaaS SLAs, I can translate memory behavior (GC pause impact on p99 latency, cold start memory ramp, connection pool saturation under burst traffic) into measurable commitments and ensure our configurations support the promises we make to partners.
  `SLA budgets` `p99 latency` `GC pause impact` `cold start` `burst traffic` `capacity planning` `performance budget`

- When evaluating emerging JVM capabilities (virtual threads at scale, CRaC checkpoint/restore for instant cold starts, ahead-of-time compilation with GraalVM), I can run structured evaluations against our actual workloads and produce an adoption roadmap.
  `virtual threads` `CRaC` `Project Leyden` `GraalVM native image` `AOT compilation` `technology evaluation` `adoption roadmap`

- When building fleet-wide memory observability (per-service GC dashboards, automated heap dump collection, connection pool saturation alerts, Metaspace growth tracking), I can define what we need and drive implementation with the platform team.
  `fleet-wide observability` `GC dashboards` `heap dump collection` `connection pool alerts` `Metaspace tracking` `platform tooling`

- When a critical production incident requires deep analysis (native memory leak in a third-party driver, interaction between JVM memory management and Cloud SQL driver under connection storms, Kafka client memory behavior during partition rebalances), I can lead the diagnosis or know when to bring in external expertise.
  `native memory leak` `Cloud SQL driver` `Kafka rebalance memory` `deep analysis` `incident leadership` `external expertise`

> **What this level is about:** You own the memory story for the engineering organisation. Strategy, standards, tooling, and the expertise pipeline that keeps the organisation capable.

## Role in Training Program

Engineers at this level serve as **Mentors & Workshop Leads** for Track A, Track B, and Track C.

---

*Tags:* #training-program #memory-management #level-6 #authority #mentor
