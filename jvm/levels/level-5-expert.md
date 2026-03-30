# Level 5 — Expert

**Focus:** I design for memory efficiency and set standards across services.

*Production lens: I make proactive decisions that prevent memory problems across services, and I define the configurations other engineers follow.*

## Which of these scenarios can you handle confidently today?

- When a latency-sensitive service needs consistent response times, I can evaluate G1 vs ZGC for our specific workload — measuring actual pause times under production-like load, comparing throughput and memory overhead, and making a recommendation backed by JFR data.
  `G1GC` `ZGC` `Shenandoah` `-XX:+UseZGC` `GC pause p99` `throughput vs latency` `JFR` `benchmark` `MaxGCPauseMillis`

- When designing thread pool and connection pool configurations, I can reason about the total memory budget: each Tomcat thread × stack size + each HikariCP connection × buffer overhead + Kafka consumers × partition buffers — and ensure it all fits within the container limit with headroom.
  `memory budget design` `Tomcat threads` `HikariCP connections` `Kafka consumers` `stack size` `buffer overhead` `container limit` `headroom`

- When a Spring Boot service has slow cold starts on GKE, I can diagnose the contributing factors (JIT compilation, Spring context initialization, connection pool warmup, Kafka consumer group rebalance) and design readiness probes that account for the memory dimension of each.
  `cold start` `JIT compilation` `Spring context` `connection pool warmup` `Kafka rebalance` `readinessProbe` `startup time` `CDS` `AOT`

- When multiple teams are configuring JVMs inconsistently, I can define a standard memory configuration baseline: heap ratio to container limit, mandatory flags (`HeapDumpOnOutOfMemoryError`, container awareness, GC logging), and non-heap budget formula.
  `JVM baseline` `HeapDumpOnOutOfMemoryError` `UseContainerSupport` `GC logging` `platform standards` `non-heap budget` `org-wide config`

- When evaluating a Java version upgrade (17 → 21), I can assess memory-related implications: changed GC defaults, virtual thread memory model, dependency readiness (HikariCP, Kafka client, Cloud SQL driver under the new threading model).
  `Java 17` `Java 21` `virtual threads` `GC defaults` `Spring Boot compatibility` `HikariCP` `Kafka client` `migration risk`

- When a production incident involves memory-related cascading failure (one service's GC pauses causing timeout storms in callers, connection pool exhaustion propagating), I can trace the chain and propose both immediate fixes and architectural improvements.
  `cascading failure` `GC pause cascade` `timeout storm` `connection pool exhaustion` `circuit breaker` `Resilience4j` `cross-service impact`

> **What this level is about:** You're not reacting to memory problems, you're preventing them. You set standards, make architecture-level memory decisions, and lead incident diagnosis.

## Role in Training Program

Engineers at this level serve as **Mentors & Workshop Leads** for Track A, Track B, and Track C.

---

*Tags:* #training-program #memory-management #level-5 #mentor
