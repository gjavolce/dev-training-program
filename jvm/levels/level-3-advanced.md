# Level 3 — Adept

**Focus:** I know where memory goes inside a Spring Boot app.

*Production lens: Memory usage is higher than expected. I can reason about which components are consuming it and adjust configuration or flag the right area of code.*

## Which of these scenarios can you handle confidently today?

- When a Spring Boot service is using more memory than expected, I can reason about the likely consumers: HikariCP connection pool (connections × buffer size), Kafka consumer buffers (concurrency × fetch size × partitions), Tomcat thread pool (threads × stack size), and Spring caches (`@Cacheable` backed by ConcurrentHashMap = unbounded by default).
  `HikariCP` `maximumPoolSize` `Kafka consumer` `fetch.max.bytes` `concurrency` `server.tomcat.threads.max` `@Cacheable` `ConcurrentMapCacheManager`

- When reading Spring Boot Actuator metrics (`/actuator/metrics`), I can find memory-related metrics and understand what `jvm.memory.used`, `jvm.memory.max`, `jvm.buffer.memory.used`, and `hikaricp.connections.active` are telling me about the service's memory footprint.
  `/actuator/metrics` `jvm.memory.used` `jvm.memory.max` `jvm.buffer.memory.used` `hikaricp.connections.active` `Micrometer` `Spring Boot Actuator`

- When I see an `OutOfMemoryError` in logs, I can distinguish the common types — heap space (objects), Metaspace (classes), unable to create native thread (too many threads or not enough OS memory) — and understand what each implies about where memory ran out.
  `OutOfMemoryError: Java heap space` `OutOfMemoryError: Metaspace` `OutOfMemoryError: unable to create native thread` `GC overhead limit exceeded`

- When reviewing a PR, I can flag memory risks: an unbounded `Map` that grows with traffic, a `List` accumulated across a batch job, a missing eviction policy on a cache, a new thread pool without considering the stack memory cost.
  `unbounded Map` `ConcurrentHashMap` `@Cacheable` `Caffeine` `eviction policy` `batch accumulation` `thread pool sizing` `memory risk`

- When a service has inconsistent memory behavior across pods (one pod's memory climbing while others are stable), I can reason about what might differ: Kafka partition assignment, cached data divergence, connection pool state, or traffic distribution.
  `Kafka partition assignment` `cache divergence` `connection pool state` `pod memory variance` `traffic distribution` `stateful consumers`

- When estimating a service's memory footprint from its configuration, I can add up: thread counts × stack sizes + pool sizes × connection overhead + configured heap, and check if it fits the container limit with headroom.
  `memory budget calculation` `thread stacks` `-Xss` `HikariCP connections` `Kafka consumers` `container limit` `safety margin`

> **What this level is about:** You've opened the Spring Boot box. You can connect configuration knobs to actual memory consumption and make informed decisions about sizing and code review.

## Training Track

Engineers at this level join **Track B: Practitioner → Adept** together with Level 2 engineers completing Track A.

**Cross-reference with Cloud & Observability:** Cloud & Observability L3 covers distributed tracing, SLOs, and alerting design. The Actuator metrics knowledge here complements the broader metrics/tracing instrumentation covered there.

---

*Tags:* #training-program #memory-management #level-3 #track-b
