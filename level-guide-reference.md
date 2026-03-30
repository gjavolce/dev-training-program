# SEB Embedded — Engineering Training Program: Level Guide

> **Purpose**: Machine-readable source of truth for all level descriptors, scenario-based assessments, and keywords across all four competency areas. Use this file as context when generating quiz questions, placement assessments, session materials, or level-specific exercises.
>
> **Companion file**: `level-guide.html` — interactive browser version with collapsible keyword drill-downs.

---

## How levels work

- **6 levels per area**: Foundations (L1) → Practitioner (L2) → Adept (L3) → Veteran (L4) → Expert (L5) → Authority (L6)
- **3 training tracks**: Track A (L1→L2), Track B (L2→L3), Track C (L3→L4)
- **Mentor track (M)**: L5–L6 engineers lead workshops, not attend them
- **Per-area assignment**: An engineer can be L1 in one area and L3 in another
- **Scenario-based**: Each level is defined by "When X happens, I can do Y" — not knowledge checklists

## How to read each level

- **Focus**: One sentence describing what this level is about
- **Scenarios**: 5-6 "When X happens, I can do Y" statements — the self-assessment criteria
- **Topics**: What the training covers at this level (preview, not assessment target)
- **Keywords**: Grouped by scenario — the specific tools, commands, concepts an engineer at this level works with

---

# DATABASE ENGINEERING

PostgreSQL on Cloud SQL (GCP). Covers everything from writing your first JOIN to running organisation-wide DR drills.

## DB Level 1 — Foundations
- **Track**: A (paired with L2 engineers)
- **Focus**: Getting data in and out, and understanding how it's organised.
- **Scenarios**:
  1. When a colleague asks me to pull specific data from the database, I can write a query that joins the right tables and filters to the correct result set.
  2. When I need to add a new field to the application, I can trace how the data model maps to database tables and understand which table needs to change.
  3. When I see a slow page or API endpoint, I can check the application logs to see what SQL the ORM is generating and spot obvious problems like N+1 queries.
  4. When I need to connect to our database to inspect data, I can get connected through Cloud SQL Auth Proxy or a database client without needing someone to walk me through it each time.
  5. When a colleague mentions indexes or transactions in a code review, I understand the concepts well enough to follow the conversation, even if I wouldn't make those decisions myself yet.
- **Topics**: SQL fundamentals (JOINs, WHERE, GROUP BY), table structure and relationships, how ORMs generate SQL, connecting to Cloud SQL, basic index and transaction concepts.
- **Keywords per scenario**:
  1. SELECT, JOIN, INNER JOIN, LEFT JOIN, WHERE, GROUP BY, HAVING, aliases, subqueries
  2. JPA, @Entity, @Column, @Table, @ManyToOne, @OneToMany, Hibernate, schema inspection
  3. N+1 queries, Hibernate SQL logging, spring.jpa.show-sql, @Transactional, FetchType.LAZY, FetchType.EAGER
  4. Cloud SQL Auth Proxy, psql, JDBC connection string, IAM database authentication, Cloud SQL instance connection name
  5. B-tree index, PRIMARY KEY, FOREIGN KEY, COMMIT, ROLLBACK, ACID, transaction isolation

## DB Level 2 — Practitioner
- **Track**: A (paired with L1 engineers)
- **Focus**: Designing features end-to-end from schema to migration, and understanding why queries are slow.
- **Scenarios**:
  1. When I'm building a new feature, I can design the database schema myself — choosing tables, columns, relationships, and constraints — without needing a senior engineer to review the fundamentals.
  2. When a query is slow, I can run EXPLAIN ANALYZE and understand the output well enough to identify the problem and propose a fix.
  3. When I need to add a column, change a type, or add a constraint in production, I can write a migration that won't lock the table or cause downtime.
  4. When choosing between different index strategies for a new table, I can reason about which columns to index, whether a composite index makes sense, and what the write overhead will be.
  5. When a bug involves unexpected data states (phantom reads, lost updates), I can reason about which transaction isolation level is in play and whether it's the right choice.
  6. When I suspect a query performance issue, I can find the relevant query in Cloud SQL Query Insights and use the data there to confirm or reject my hypothesis.
- **Topics**: Window functions, schema normalisation, EXPLAIN ANALYZE deep-dive, indexing strategies, transaction isolation levels, safe migration patterns, Cloud SQL monitoring and Query Insights.
- **Keywords per scenario**:
  1. normalization, foreign key constraints, NOT NULL, UNIQUE, CHECK constraints, CASCADE, schema design, data types
  2. EXPLAIN ANALYZE, Seq Scan, Index Scan, Bitmap Heap Scan, cost estimates, actual rows, planning time, execution time
  3. Liquibase, ADD COLUMN, ALTER TABLE, ACCESS EXCLUSIVE lock, NOT VALID, VALIDATE CONSTRAINT, concurrent index creation
  4. CREATE INDEX CONCURRENTLY, composite index, index selectivity, write amplification, pg_stat_user_indexes, index bloat
  5. READ COMMITTED, REPEATABLE READ, SERIALIZABLE, phantom read, lost update, dirty read, SET TRANSACTION ISOLATION LEVEL
  6. Cloud SQL Query Insights, pg_stat_statements, query fingerprint, mean execution time, Cloud Monitoring

## DB Level 3 — Adept
- **Track**: B (paired with L4 engineers)
- **Focus**: Handling complex regulated domains, diagnosing production issues, and understanding what's happening under the hood.
- **Scenarios**:
  1. When I'm designing a schema for a domain with regulatory requirements, I can choose the right patterns (soft deletes, audit columns, temporal tables) and explain why.
  2. When queries degrade over weeks, I can investigate whether the cause is table bloat, stale statistics, or autovacuum not keeping up.
  3. When I need a non-trivial schema change to a production table, I can plan a multi-step migration that avoids locking.
  4. When the team needs multi-tenant data isolation, I can design and implement a row-level security strategy.
  5. When an incident involves blocking queries, I can identify the blocking chain and determine whether it's safe to terminate the offending transaction.
  6. When choosing an indexing strategy for a complex pattern, I can evaluate partial, expression, and covering indexes.
- **Topics**: Complex domain schema patterns, PostgreSQL MVCC and vacuum internals, zero-downtime migration strategies, row-level security, lock diagnosis, advanced indexing.
- **Keywords per scenario**:
  1. audit table, temporal tables, soft delete, pgaudit, SOX, PCI-DSS
  2. autovacuum, table bloat, pg_stat_user_tables, n_dead_tup, VACUUM ANALYZE, dead tuples
  3. ADD COLUMN DEFAULT, backfill, NOT VALID, VALIDATE CONSTRAINT, Liquibase, shadow column
  4. ROW LEVEL SECURITY, CREATE POLICY, current_setting, tenant_id, security barrier
  5. pg_stat_activity, pg_locks, pg_blocking_pids(), wait_event, idle in transaction, lock modes
  6. partial index, expression index, covering index, INCLUDE, GIN index, index-only scan

## DB Level 4 — Veteran
- **Track**: C (paired with L3 engineers)
- **Focus**: Operating at scale, managing platform-level database concerns, and ensuring compliance.
- **Scenarios**:
  1. When a table grows to tens of millions of rows, I can evaluate partitioning, design the strategy, and plan the migration.
  2. When Cloud SQL fails over, I can explain what happened and suggest reconnection improvements.
  3. When we're hitting connection limits, I can trace the problem through the full stack and propose the right fix.
  4. When a compliance review asks about database encryption and data retention, I can answer confidently.
  5. When someone proposes changing a PostgreSQL flag on Cloud SQL, I can evaluate it safely on a clone and measure impact.
  6. When debugging a system-level performance pattern, I can use Cloud Monitoring metrics and PostgreSQL stats views.
- **Topics**: Table partitioning, Cloud SQL HA and failover, connection pooling at scale, PostgreSQL tuning, compliance patterns (CMEK, audit, retention), system-level performance.
- **Keywords per scenario**:
  1. PARTITION BY RANGE/LIST/HASH, pg_partman, declarative partitioning, partition pruning
  2. Cloud SQL HA, failover replica, HikariCP reconnect, spring.datasource.hikari
  3. HikariCP, maximumPoolSize, connectionTimeout, max_connections, PgBouncer
  4. CMEK, Cloud KMS, encryption at rest, pgaudit, data retention, PCI-DSS, SOX
  5. Cloud SQL flags, work_mem, shared_buffers, checkpoint_completion_target, clone instance
  6. pg_stat_bgwriter, cache hit ratio, Cloud Monitoring, disk I/O metrics, WAL write rate

## DB Level 5 — Expert
- **Track**: Mentor (leads Track A, B, and C workshops)
- **Focus**: Architecture decisions affecting multiple teams, operating at the boundary between database engineering and platform strategy.
- **Scenarios**:
  1. When deciding whether a domain should have its own Cloud SQL instance, I can lead the analysis weighing isolation, cost, and compliance.
  2. When a team needs read-replica routing, I can design the strategy and define consistency trade-offs.
  3. When a large schema change needs migration planning, I can own it end-to-end: estimate, runbook, monitoring, rollback, communication.
  4. When a slow query needs deep planner analysis, I can understand why it chose a particular strategy and guide it better.
  5. When reviewing another team's database design, I can identify risks and contribute to shared standards.
  6. When reviewing Cloud SQL costs, I can break down drivers and propose changes with performance implications.
- **Topics**: Architecture reviews, cross-team mentoring, and production decisions. Leads workshops across all tracks.
- **Keywords per scenario**:
  1. Cloud SQL instance isolation, blast radius, compliance boundaries, ADR, cost modelling
  2. read replica, replication lag, replica routing, read-after-write consistency, AbstractRoutingDataSource
  3. Cloud SQL clone, migration runbook, lock monitoring, rollback plan, pg_repack
  4. query planner, pg_stats, default_statistics_target, join order, enable_hashjoin
  5. ADR, Terraform Cloud SQL module, schema review, naming conventions, shared standards
  6. Cloud SQL pricing, instance tier, HA standby, replica cost, committed use discounts

## DB Level 6 — Authority
- **Track**: Mentor (leads Track A, B, and C workshops)
- **Focus**: Organisational strategy, disaster recovery validation, and technology direction.
- **Scenarios**:
  1. When the organisation needs a multi-region database strategy, I can design the approach including replication, failover, and cost trade-offs.
  2. When evaluating Cloud SQL vs alternatives (AlloyDB, self-managed), I can run a structured evaluation with benchmarks.
  3. When validating DR, I can design and run a failover drill with success criteria and gap analysis.
  4. When reviewing internal tooling (CI migration checks, Terraform modules), I can ensure it meets multi-team needs.
  5. When leadership asks about scaling timeline and cost, I can produce a grounded capacity projection.
- **Topics**: Cross-cutting decisions, DR drills, technology evaluations, platform capabilities. This level shapes the programme.
- **Keywords per scenario**:
  1. cross-region replication, RTO, RPO, data residency, PITR, failover topology, CAP theorem
  2. AlloyDB, pgbench, benchmark criteria, TCO, managed vs self-hosted, technology evaluation
  3. DR drill, PITR restore, RTO measurement, runbook validation, gap analysis
  4. Terraform module, Liquibase CI, schema validation, platform tooling
  5. capacity planning, storage growth rate, connection trends, cost projection, scaling thresholds

---

# MEMORY MANAGEMENT

How memory works in our Spring Boot services on GKE. Starts with what you can see in dashboards, progresses through container memory budgets and Spring Boot internals, and reaches JVM diagnostic tools for deep investigation.

**Progression logic**: L1-L2 focus on observation and container sizing (where most production incidents start). L3 opens the Spring Boot box to understand memory consumers. L4 is where JVM-specific diagnostic tools arrive. L5-L6 synthesize across all layers for standards and strategy.

## MM Level 1 — Foundations
- **Track**: A (paired with L2 engineers)
- **Focus**: I know my app uses memory and I can see it. I can find the right dashboard, recognize symptoms, and escalate with useful information.
- **Scenarios**:
  1. When I look at Grafana dashboards, I can find memory-related panels (pod memory, heap usage, GC pauses, restart counts) and tell "steady" from "growing" from "spiking."
  2. When a pod restarts and someone says "it got OOMKilled," I understand that means it used more memory than allowed — even if I don't know where the memory went.
  3. When I see memory configuration in deployment manifests (-Xmx, resource limits), I know these control memory allocation, even if I can't evaluate the values.
  4. When a Spring Boot service behaves differently right after deployment versus 10 minutes later, I'm aware that "warming up" is real.
  5. When someone mentions heap, stack, garbage collection, or OutOfMemoryError, I have a rough mental model.
- **Topics**: Reading Grafana memory panels, understanding OOMKilled vs OutOfMemoryError, basic JVM memory vocabulary, Spring Boot warm-up, deployment manifest memory configuration.
- **Keywords per scenario**:
  1. jvm.memory.used, jvm.memory.max, container_memory_usage_bytes, Grafana, sawtooth pattern
  2. OOMKilled, exit code 137, kubectl describe pod, resources.limits.memory, pod restart count
  3. -Xmx, -Xms, resources.requests.memory, resources.limits.memory, JAVA_OPTS, deployment manifest
  4. JIT compilation, cold start, warm-up, readinessProbe, Spring Boot startup, class loading
  5. heap, stack, garbage collection, OutOfMemoryError, GC pause, memory leak

## MM Level 2 — Practitioner
- **Track**: A (paired with L1 engineers)
- **Focus**: I understand the container memory budget. When a pod gets OOMKilled, I can figure out whether it's heap or container sizing, and configure a new service correctly.
- **Scenarios**:
  1. When sizing a service for GKE, I understand JVM memory = heap + Metaspace + thread stacks + direct byte buffers + native, and the container limit must fit all of it.
  2. When configuring a service, I apply -Xmx ≈ 60-70% of container limit, leaving room for non-heap, and understand why -Xmx = container limit causes OOMKill.
  3. When Grafana shows healthy heap but pod memory is climbing, I recognize something outside the heap is growing — Metaspace, threads, Kafka buffers, HikariCP.
  4. When reading kubectl describe pod after OOMKill, I can extract container limit, termination reason, restart count, and correlate with configured heap size.
  5. When I see UseContainerSupport, I understand why the JVM needs container awareness — and what goes wrong without it.
  6. When setting resource requests and limits, I understand requests (scheduling) vs limits (kill boundary) for JVM workloads.
- **Topics**: JVM memory model (heap + non-heap), container memory budgeting, the 60-70% rule, UseContainerSupport, Kubernetes requests vs limits, diagnosing OOMKill vs OutOfMemoryError.
- **Keywords per scenario**:
  1. -Xmx, Metaspace, thread stacks, -Xss, direct byte buffers, native memory, total JVM footprint
  2. heap ratio, non-heap memory, OOMKill, container memory budget, 60-70% rule
  3. non-heap growth, Metaspace, direct buffers, Kafka consumer buffers, HikariCP
  4. kubectl describe pod, Reason: OOMKilled, exit code 137, restart count
  5. UseContainerSupport, MaxRAMPercentage, cgroup memory, container awareness
  6. resources.requests.memory, resources.limits.memory, QoS class, Guaranteed, Burstable

## MM Level 3 — Adept
- **Track**: B (paired with L4 engineers)
- **Focus**: I know where memory goes inside a Spring Boot app. I can reason about consumers and make informed configuration and code review decisions.
- **Scenarios**:
  1. When a service uses more memory than expected, I can reason about consumers: HikariCP, Kafka buffers, Tomcat threads, Spring caches — and estimate how they add up.
  2. When reading Actuator metrics, I understand what jvm.memory.used, jvm.buffer.memory.used, and hikaricp.connections.active tell me.
  3. When I see an OutOfMemoryError, I can distinguish types: heap space, Metaspace, unable to create native thread.
  4. When reviewing a PR, I can flag memory risks: unbounded Map, List accumulated in batch, missing cache eviction, thread pool without memory consideration.
  5. When pods have inconsistent memory (one climbing, others stable), I can reason about Kafka partition assignment, cache divergence, or traffic distribution.
  6. When estimating memory footprint from config, I add up thread counts × stacks + pool sizes × connection overhead + heap, and check container fit.
- **Topics**: Spring Boot memory consumers (HikariCP, Kafka, Tomcat, caches), Actuator metrics, OutOfMemoryError types, memory-aware code review, per-pod variance, budget estimation.
- **Keywords per scenario**:
  1. HikariCP, maximumPoolSize, Kafka consumer, fetch.max.bytes, server.tomcat.threads.max, @Cacheable
  2. /actuator/metrics, jvm.memory.used, jvm.buffer.memory.used, hikaricp.connections.active, Micrometer
  3. OutOfMemoryError: Java heap space, OutOfMemoryError: Metaspace, unable to create native thread
  4. unbounded Map, ConcurrentHashMap, @Cacheable, Caffeine, eviction policy, batch accumulation
  5. Kafka partition assignment, cache divergence, connection pool state, pod memory variance
  6. memory budget calculation, thread stacks, -Xss, HikariCP connections, container limit, safety margin

## MM Level 4 — Veteran
- **Track**: C (paired with L3 engineers)
- **Focus**: I can find root causes using JVM diagnostic tools. I look inside the JVM to find leaks, GC pressure, and contention.
- **Scenarios**:
  1. When I suspect a memory leak, I can take heap dumps with jcmd, compare in Eclipse MAT, and trace the growing object graph to responsible code.
  2. When GC logs show increasing Full GC or rising old-gen occupancy, I can read the lines, understand promotion rate and pause impact, and correlate with application behaviour.
  3. When I capture a JFR recording, I can analyse allocation hotspots — which methods create the most objects and whether they cause excessive GC pressure.
  4. When a thread dump shows BLOCKED or TIMED_WAITING threads, I can trace what they're contending on and reason about memory implications.
  5. When diagnosing production memory issues, I know the sequence: Grafana → JFR → heap dump → thread dump, and I reach for the right tool first.
  6. When Metaspace is growing steadily, I can investigate class loader leaks and set -XX:MaxMetaspaceSize as a safety net.
- **Topics**: Heap dump analysis (Eclipse MAT), GC log reading, JFR allocation profiling, thread dump interpretation, structured diagnostic sequence, Metaspace investigation.
- **Keywords per scenario**:
  1. jcmd, GC.heap_dump, Eclipse MAT, dominator tree, retained size, GC roots, leak suspects
  2. GC logs, -Xlog:gc*, Full GC, old generation, promotion rate, concurrent marking, GC pause
  3. JFR, jcmd JFR.start, JDK Mission Control, allocation hotspots, allocation rate, object age
  4. thread dump, jcmd Thread.print, BLOCKED, TIMED_WAITING, HikariCP, synchronized, pool exhaustion
  5. diagnostic sequence, Grafana, JFR, heap dump, thread dump, production diagnosis
  6. Metaspace, class loader leak, Spring AOP, dynamic proxies, -XX:MaxMetaspaceSize

## MM Level 5 — Expert
- **Track**: Mentor (leads Track A, B, and C workshops)
- **Focus**: I design for memory efficiency and set standards. Proactive decisions that prevent memory problems across services.
- **Scenarios**:
  1. When a latency-sensitive service needs consistent response times, I can evaluate G1 vs ZGC — measuring pause times, throughput, memory overhead — backed by JFR data.
  2. When designing pool configurations, I can reason about total memory budget and ensure it fits the container with headroom.
  3. When a service has slow cold starts, I can diagnose contributing factors and design readiness probes accounting for memory dimensions.
  4. When teams configure JVMs inconsistently, I can define a standard baseline: heap ratio, mandatory flags, non-heap budget formula.
  5. When evaluating Java upgrades (17→21), I can assess memory implications: GC defaults, virtual threads, dependency readiness.
  6. When a cascading failure involves memory (GC pauses causing timeouts), I can trace the chain and propose fixes.
- **Topics**: Cross-team standards, incident leadership, architecture-level memory decisions. Leads workshops.
- **Keywords per scenario**:
  1. G1GC, ZGC, -XX:+UseZGC, GC pause p99, throughput vs latency, MaxGCPauseMillis
  2. memory budget design, Tomcat threads, HikariCP connections, Kafka consumers, container limit
  3. cold start, JIT, Spring context, connection pool warmup, Kafka rebalance, readinessProbe
  4. JVM baseline, HeapDumpOnOutOfMemoryError, UseContainerSupport, GC logging, platform standards
  5. Java 21, virtual threads, GC defaults, Spring Boot compatibility, migration risk
  6. cascading failure, GC pause cascade, timeout storm, connection pool exhaustion, Resilience4j

## MM Level 6 — Authority
- **Track**: Mentor (leads Track A, B, and C workshops)
- **Focus**: I own memory strategy for the engineering organisation. Platform observability, capacity planning, SLA budgets, technology roadmap.
- **Scenarios**:
  1. When the organisation needs a memory reliability strategy (standard base images, heap dump capture, GC alerting, automated JFR), I can design it end-to-end and drive adoption.
  2. When defining performance budgets for BaaS SLAs, I can translate memory behaviour into measurable commitments.
  3. When evaluating emerging JVM capabilities (virtual threads at scale, CRaC, GraalVM AOT), I can run structured evaluations against our workloads.
  4. When building fleet-wide memory observability, I can define requirements and drive implementation with the platform team.
  5. When a critical incident requires deep analysis (native memory leak, driver-level issues), I can lead the diagnosis or bring in external expertise.
- **Topics**: Technology strategy, tooling investment, engineering culture. This level defines what the programme covers.
- **Keywords per scenario**:
  1. JVM base images, HeapDumpOnOutOfMemoryError, GC anomaly alerting, automated JFR, fleet-wide standards
  2. SLA budgets, p99 latency, GC pause impact, cold start, burst traffic, performance budget
  3. virtual threads, CRaC, Project Leyden, GraalVM native image, AOT, technology evaluation
  4. fleet-wide observability, GC dashboards, heap dump collection, connection pool alerts, Metaspace tracking
  5. native memory leak, Cloud SQL driver, Kafka rebalance memory, incident leadership

---

# SOLUTION DESIGN

Architecture and system design for distributed BaaS services. Covers API design, data modelling, event-driven patterns, and cross-team architectural decisions.

## SD Level 1 — Foundations
- **Track**: A (paired with L2 engineers)
- **Focus**: Understanding existing system designs and contributing to discussions with confidence.
- **Scenarios**:
  1. When I read a service's API contract, I can understand what it does, what inputs it expects, and what errors it returns — well enough to integrate without the owning team walking me through it.
  2. When I join a design discussion, I can follow the conversation and understand the trade-offs being made.
  3. When implementing a feature that touches a service boundary, I can identify whether my change requires a schema change, API endpoint, or event.
  4. When I read an ADR, I understand the structure: context, decision, alternatives, consequences.
  5. When a bug turns out to be a design problem, I can articulate why it happened structurally.
- **Topics**: Service boundaries, OpenAPI specs, request/response vs event patterns, ADR format, BaaS platform structure.
- **Keywords per scenario**:
  1. OpenAPI, Swagger, HTTP verbs, status codes, error responses, path parameters
  2. trade-off analysis, synchronous vs asynchronous, consistency vs availability, bounded context
  3. service boundary, API contract, Kafka topic, schema migration, REST endpoint
  4. ADR, Architecture Decision Record, context, consequences, alternatives, MADR
  5. cache invalidation, data consistency, single source of truth, service coupling

## SD Level 2 — Practitioner
- **Track**: A (paired with L1 engineers)
- **Focus**: Designing features that span service boundaries and documenting decisions clearly.
- **Scenarios**:
  1. When building a feature involving multiple services, I can design the interaction, define API contracts, and choose between sync HTTP and async Kafka.
  2. When documenting a technical decision, I can write an ADR with clear context, decision, alternatives, and consequences.
  3. When designing a REST endpoint, I can reason about HTTP verbs, status codes, URL structure, pagination, and error responses.
  4. When designing a data model, I can identify aggregate roots, consistency boundaries, and cross-service replication needs.
  5. When reviewing a design, I can give concrete feedback about consistency, error handling, backwards compatibility, and failure modes.
- **Topics**: REST API design, sync vs async patterns, event-driven basics with Kafka, aggregate design, ADRs, backwards compatibility.
- **Keywords per scenario**:
  1. OpenAPI, Kafka topic, REST, synchronous vs asynchronous, eventual consistency, @KafkaListener
  2. ADR, MADR, decision log, trade-off, consequences, alternatives considered
  3. HTTP verbs, idempotency, PUT vs PATCH, cursor pagination, RFC 9457, REST conventions
  4. aggregate root, consistency boundary, DDD, bounded context, domain event
  5. backwards compatibility, error propagation, failure mode, contract versioning

## SD Level 3 — Adept
- **Track**: B (paired with L4 engineers)
- **Focus**: Designing systems that handle complex domains, failure modes, and regulatory constraints.
- **Scenarios**:
  1. When a domain has auditability requirements (PCI-DSS, SOX), I can design the data flow and event sourcing strategy for traceability.
  2. When a business process spans services reliably, I can design the saga — orchestration vs choreography, compensation, idempotency.
  3. When an API needs to evolve without breaking consumers, I can design the versioning strategy.
  4. When handling multi-tenant data, I can design the tenancy model — isolation, tenant context propagation, cross-tenant leak prevention.
  5. When integrating with external financial systems, I can identify failure modes and design retry/dead-letter strategies.
- **Topics**: Event sourcing, saga patterns, idempotency, API versioning, multi-tenancy, Kafka delivery semantics.
- **Keywords per scenario**:
  1. event sourcing, audit log, CDC, Debezium, PCI-DSS, SOX, append-only table, immutable records
  2. saga pattern, orchestration, choreography, compensation, idempotency key, outbox pattern
  3. API versioning, content negotiation, backwards compatibility, breaking change, Pact
  4. multi-tenancy, tenant isolation, row-level security, ThreadLocal, schema-per-tenant, data leakage
  5. dead-letter topic, at-least-once delivery, idempotent consumer, @RetryableTopic, Kafka transactions

## SD Level 4 — Veteran
- **Track**: C (paired with L3 engineers)
- **Focus**: Owning cross-service designs end-to-end and raising the quality bar across the domain.
- **Scenarios**:
  1. When a feature requires coordinated changes across 3+ services, I can lead the design session, produce shared contracts, and maintain coherence.
  2. When a performance problem can't be solved in one service, I can redesign the boundary: CQRS, read-models, caching.
  3. When something has been built elsewhere, I can identify overlap and propose reuse or consolidation.
  4. When reviewing another team's design, I can identify systemic risks: retry storms, thundering herds, ordering assumptions.
  5. When compliance asks how a transaction flows end-to-end, I can trace it across all services with consistency model at each step.
- **Topics**: Cross-team API design, CQRS, distributed caching, system-level failure modes, compliance traceability.
- **Keywords per scenario**:
  1. cross-team API contract, design session facilitation, sequencing dependencies, Pact
  2. CQRS, read model, distributed cache, Redis, eventual consistency, materialised view
  3. platform component, inner source, API gateway, reuse vs coupling, Conway's Law
  4. retry storm, thundering herd, circuit breaker, Resilience4j, ordering guarantee, cascading failure
  5. end-to-end traceability, correlation ID, audit trail, OpenTelemetry, settlement flow

## SD Level 5 — Expert
- **Track**: Mentor (leads Track A, B, and C workshops)
- **Focus**: Setting architectural standards and leading the highest-complexity design work.
- **Scenarios**:
  1. When teams are making diverging architectural decisions, I can identify the pattern, propose the standard, and get buy-in.
  2. When considering a major architectural shift, I can scope the work, identify risks, and present a phased approach to leadership.
  3. When a team is stuck on a design problem, I can facilitate the decision: surface trade-offs, challenge assumptions, separate preference from constraint.
  4. When evaluating new technology for adoption, I can lead the evaluation with criteria, prototypes, and honest assessment.
  5. When the training programme needs solution design content, I can define the curriculum and progression.
- **Topics**: Cross-team standards, architecture facilitation, technology strategy. Leads workshops.
- **Keywords per scenario**:
  1. ADR, architectural standard, design guild, RFC process, Conway's Law
  2. strangler fig, event-driven architecture, phased rollout, architectural runway
  3. facilitation, trade-off analysis, assumption mapping, architectural fitness function
  4. technology evaluation, proof of concept, fit assessment, vendor lock-in
  5. curriculum design, scenario-based learning, workshop facilitation

## SD Level 6 — Authority
- **Track**: Mentor (leads Track A, B, and C workshops)
- **Focus**: Architectural governance, technology strategy, and building the organisation's design capability.
- **Scenarios**:
  1. When the organisation needs architecture for a new strategic direction, I can lead from first principles: domain modelling, boundaries, data strategy, platform requirements.
  2. When architectural decision-making is inconsistent, I can redesign the process: when ADRs are required, who's involved, how decisions are revisited.
  3. When an audit questions our system design, I can own the response: evidence, gaps, and architectural remediations.
  4. When assessing technical debt across the platform, I can map the architecture, identify highest-risk coupling, and propose a sequenced improvement roadmap.
  5. When engineers lack shared vocabulary for architecture, I can build it: standards, design guild, reference architectures.
- **Topics**: Architectural governance, strategic design, organisational capability. This level defines what good design looks like.
- **Keywords per scenario**:
  1. domain modelling, bounded context, context mapping, event storming, strategic DDD
  2. ADR governance, decision process, review board, RFC process, design guild
  3. PCI-DSS, SOX, data flow diagram, regulatory audit, gap analysis, remediation
  4. technical debt, coupling analysis, dependency mapping, improvement roadmap, fitness function
  5. reference architecture, design guild, pattern library, community of practice, golden path

---

# CLOUD & OBSERVABILITY

GCP, GKE, and the full observability stack: Cloud Monitoring, OpenTelemetry, Grafana, structured logging, and distributed tracing. Includes autoscaling, SLO design, and platform strategy.

## CO Level 1 — Foundations
- **Track**: A (paired with L2 engineers)
- **Focus**: I know where our services run and I can look at them. Find a service, check if it's running, read basic health signals.
- **Scenarios**:
  1. When a Grafana alert fires, I can open the dashboard, understand the panel, and tell genuine alerts from noise.
  2. When a pod is restarting, I can use kubectl to get status, read logs, and identify OOM kill, probe failure, or crash.
  3. When I need a specific log line, I can use Cloud Logging to filter by service, severity, and time range.
  4. When an alert fires for a service I don't own, I can follow the runbook and escalate with a useful summary.
  5. When looking at Cloud SQL metrics, I can read CPU, connection count, and storage usage.
- **Topics**: GCP Console, GKE pod lifecycle, kubectl basics, Cloud Logging, Grafana dashboards, alert anatomy, Cloud SQL metrics.
- **Keywords per scenario**:
  1. Grafana, alert state, evaluation interval, thresholds, dashboard panels
  2. kubectl describe pod, kubectl logs --previous, OOMKilled, liveness probe, CrashLoopBackOff
  3. Cloud Logging, Log Explorer, resource.type, severity filter, jsonPayload
  4. runbook, alert annotations, escalation path, incident summary
  5. Cloud SQL metrics, database/cpu/utilization, num_backends, storage utilization

## CO Level 2 — Practitioner
- **Track**: A (paired with L1 engineers)
- **Focus**: I can build infrastructure, instrument services, and troubleshoot basic failures without escalating.
- **Scenarios**:
  1. When a service needs infrastructure, I can write Terraform resources and deploy through our pipeline.
  2. When deploying to Kubernetes, I can troubleshoot common failures (CrashLoopBackOff, failed probes, image pull errors) without escalating.
  3. When building features, I add structured logging and Micrometer metrics as part of the work.
  4. When creating a Grafana dashboard, I can write PromQL for key indicators and set up basic alerting.
  5. When asked about metrics vs logs vs traces, I can explain when to use each with concrete examples.
  6. When looking at GCP networking (VPCs, subnets, firewall rules), I can follow the structure.
- **Topics**: Terraform, Kubernetes troubleshooting, structured logging, Micrometer, PromQL, Grafana, GCP networking.
- **Keywords per scenario**:
  1. Terraform, google_sql_database_instance, google_service_account, terraform apply, CI pipeline
  2. CrashLoopBackOff, ImagePullBackOff, failed probes, kubectl rollout status, pod events
  3. structured logging, JSON log format, MDC, log severity levels, Cloud Logging jsonPayload
  4. PromQL, rate(), histogram_quantile, Grafana panel editor, Micrometer, /actuator/prometheus
  5. metrics vs logs vs traces, observability pillars, OpenTelemetry, Cloud Trace
  6. VPC, subnet, firewall rules, Cloud NAT, GKE networking, Service, Ingress

## CO Level 3 — Adept
- **Track**: B (paired with L4 engineers)
- **Focus**: I can trace problems across services, design meaningful alerts and SLOs, and configure autoscaling.
- **Scenarios**:
  1. When a request spans services, I can use distributed tracing to find the bottleneck — not just guess from logs.
  2. When asked "is this API healthy?", I can define SLIs and SLOs and explain why "zero errors" isn't useful.
  3. When alerting is noisy or quiet, I can redesign: severity levels, routing, burn-rate alerts.
  4. When adding OpenTelemetry, I understand trace context propagation across HTTP and Kafka.
  5. When troubleshooting, I can correlate metrics, logs, and traces into a complete picture.
  6. When a service needs autoscaling, I can configure HPA appropriately — knowing it depends on correct pod sizing (cross-ref Memory Management L2).
  7. When managing Terraform for GKE and Cloud SQL, I can read/modify modules and understand state drift.
- **Topics**: OpenTelemetry, SLI/SLO, alerting design, trace propagation, incident correlation, HPA, Terraform.
- **Keywords per scenario**:
  1. Grafana Tempo, trace correlation, span attributes, OpenTelemetry, service-to-service latency
  2. SLI, SLO, error budget, burn rate, 99th percentile, Cloud Monitoring SLO
  3. burn rate alert, severity levels, routing rules, runbook links, alert fatigue
  4. W3C Trace Context, Kafka header trace, OpenTelemetry Java agent, context propagation
  5. incident correlation, metrics + logs + traces, timeline reconstruction, exemplars
  6. HPA, Horizontal Pod Autoscaler, custom metrics, scale-down stabilization
  7. terraform plan, terraform state, state drift, module variables

## CO Level 4 — Veteran
- **Track**: C (paired with L3 engineers)
- **Focus**: I design infrastructure, manage observability at scale, handle compliance, and configure advanced autoscaling.
- **Scenarios**:
  1. When defining SLOs for a critical service, I can lead the process and explain error budgets to stakeholders.
  2. When GCP costs grow faster than traffic, I can analyse drivers and propose changes with implications.
  3. When a change needs rolling update + DB migration simultaneously, I can design the deployment sequencing with rollback triggers.
  4. When another team needs observability setup, I can produce a reusable guide with standard logging, metrics, tracing, alerts, dashboards.
  5. When basic CPU autoscaling isn't sufficient, I can configure custom metrics HPA, VPA, and tune scale-down stabilisation.
  6. When a compliance review asks about infrastructure security, I can explain VPC design, PCI-DSS zones, IAM, and audit logging.
- **Topics**: SLO design, GCP cost optimisation, deployment sequencing, observability templates, advanced autoscaling, compliance.
- **Keywords per scenario**:
  1. Cloud Monitoring SLO, SLI definition, error budget, burn rate alert, request-based SLI
  2. GCP Billing export, GKE cost breakdown, Cloud SQL tier, committed use discounts, Spot VMs
  3. kubectl rollout, rolling update strategy, deployment observability gate, rollback trigger
  4. observability template, standard log format, Micrometer metrics, OTEL config, Grafana JSON
  5. VPA, custom metrics autoscaling, Kafka consumer lag HPA, scale-down stabilization, flapping
  6. VPC design, network segmentation, PCI-DSS zones, IAM policies, Cloud Audit Logs

## CO Level 5 — Expert
- **Track**: Mentor (leads Track A, B, and C workshops)
- **Focus**: I define observability strategy and make architecture decisions. I set standards, run evaluations, and lead incident response.
- **Scenarios**:
  1. When teams instrument inconsistently, I can define the standard and drive adoption without bureaucracy.
  2. When a major incident spans multiple teams, I can take incident commander role with systematic investigation.
  3. When evaluating a new observability tool, I can lead the evaluation with criteria, prototypes, and honest comparison.
  4. When platform costs are a leadership concern, I can provide analysis: cost by workload, optimisation opportunities, modelled savings.
  5. When teams don't know how to write good runbooks, I can define the standard and run a peer-review session.
- **Topics**: Cross-team standards, incident command, platform strategy. Leads workshops.
- **Keywords per scenario**:
  1. OTEL SDK configuration, shared logging library, standard metric naming, trace sampling policy
  2. incident command, stakeholder communication, hypothesis-driven diagnosis, post-mortem
  3. tool evaluation criteria, APM comparison, OTEL backend compatibility, total cost of ownership
  4. GKE cost by namespace, Spot VMs, VPA, node pool rightsizing, committed use discounts
  5. runbook structure, alert-to-runbook linking, runbook testing, on-call readiness

## CO Level 6 — Authority
- **Track**: Mentor (leads Track A, B, and C workshops)
- **Focus**: Cloud platform strategy, reliability engineering at organisational level, technology direction.
- **Scenarios**:
  1. When the organisation needs a long-term GCP strategy, I can lead the analysis and produce a technology direction document.
  2. When validating DR procedures, I can design and run the drill with success criteria, team coordination, measurement, and gap analysis.
  3. When Cloud spend is reviewed at executive level, I can own the cost narrative: drivers, optimisations, and a credible roadmap.
  4. When an audit requires evidence of security event detection and response, I can produce it.
  5. When building a platform capability for all teams, I can lead design and rollout through usefulness, not mandate.
- **Topics**: Cloud strategy, organisational reliability, platform investment. This level shapes the direction.
- **Keywords per scenario**:
  1. GKE vs Cloud Run vs Autopilot, multi-region, managed services trade-offs, technology radar
  2. DR drill, Cloud SQL failover, RTO/RPO, GKE multi-region, success criteria, chaos engineering
  3. GCP Billing export, BigQuery cost dashboard, FinOps, cost roadmap, unit economics
  4. Cloud Audit Logs, IAM audit trail, Cloud KMS, Security Command Center, PCI-DSS/SOX
  5. Terraform module registry, shared observability stack, OTEL collector, platform engineering

---
