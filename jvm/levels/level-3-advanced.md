# Level 3 — Advanced

**Focus:** Diagnosing non-obvious production problems and tuning the runtime under real load.

## Which of these scenarios can you handle confidently today?

- When a service's heap usage grows slowly over days until it triggers a restart, I can collect and analyse a heap dump to identify which objects are accumulating, which GC roots are keeping them alive, and whether the cause is a code bug or a configuration problem.
  `heap dump` `Eclipse MAT` `VisualVM` `jmap` `GC roots` `retained heap` `dominator tree` `memory leak`

- When a service intermittently stalls under load and the cause isn't obvious from logs, I can take a thread dump at the right moment, read the output, and identify whether the stall is caused by lock contention, a thread pool being saturated, or a blocked I/O call.
  `thread dump` `jstack` `BLOCKED` `WAITING` `synchronized` `thread pool saturation` `virtual threads` `deadlock`

- When Kafka consumer rebalancing is causing repeated processing pauses or duplicate processing, I can trace the cause — whether it's `max.poll.interval.ms` being exceeded, insufficient heartbeat threads, or a partition assignment strategy mismatch — and fix it.
  `max.poll.interval.ms` `session.timeout.ms` `heartbeat.interval.ms` `partition assignment` `CooperativeStickyAssignor` `rebalance listener` `duplicate processing` `consumer group coordinator`

- When a service is consuming more CPU than expected on GKE, I can use async-profiler or JFR CPU profiling to identify which code paths are hot and distinguish between application logic, GC overhead, and framework overhead.
  `async-profiler` `JFR` `CPU profiling` `flame graph` `jvm.gc.overhead` `safepoint` `JIT compilation` `profiling overhead`

- When a Spring Boot service starts leaking database connections under load, I can trace the leak: identify which code paths are acquiring connections without releasing them, verify the fix with load testing, and add the right HikariCP metrics to catch it early in future.
  `HikariCP` `leakDetectionThreshold` `hikari.pool.ActiveConnections` `hikari.pool.PendingConnections` `connection leak` `@Transactional` `DataSource` `load testing`

## Training Track

Engineers at this level join **Track B: Advanced → Specialist** together with Level 4 engineers.
