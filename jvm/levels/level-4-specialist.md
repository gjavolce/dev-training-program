# Level 4 — Specialist

**Focus:** Owning JVM health across multiple services and solving platform-level performance problems.

## Which of these scenarios can you handle confidently today?

- When the team needs to decide whether to switch GC algorithms (G1 to ZGC or Shenandoah) for a latency-sensitive service, I can design the experiment: define success criteria, run the before/after comparison under representative load, and produce a written recommendation with data.
  `G1GC` `ZGC` `Shenandoah` `-XX:+UseZGC` `GC pause p99` `throughput vs latency` `JFR` `benchmark`

- When a service is underperforming on GKE and the cause isn't the application code, I can investigate at the platform level: CPU throttling due to CFS quota, NUMA effects, network I/O bottlenecks, or noisy neighbour problems on the node.
  `CFS throttling` `cpu.cfs_quota_us` `throttled_time` `NUMA` `node affinity` `kubectl top node` `container_cpu_cfs_throttled_seconds_total` `noisy neighbour`

- When our Kafka consumers need to handle a dramatic increase in message volume, I can design the scaling strategy — whether that's horizontal pod scaling, partition rebalancing, or batching changes — and implement it without causing consumer group instability.
  `partition scaling` `consumer group` `HPA` `max.poll.records` `fetch.min.bytes` `fetch.max.wait.ms` `consumer concurrency` `rebalance`

- When we're building a service that must meet strict latency SLOs, I can identify the JVM sources of latency variance (GC pauses, JIT compilation, class loading at startup) and apply techniques (warmup periods, AOT hints, GC tuning) to reduce that variance.
  `GC pause` `JIT warmup` `Class Data Sharing` `CDS` `AOT` `GraalVM` `p99 latency` `safepoint`

- When a Cloud SQL connection pool problem cascades across multiple services during a traffic spike, I can trace the problem from HikariCP metrics through the Cloud SQL Auth Proxy to the database instance limits, and propose a platform-level fix rather than a per-service workaround.
  `HikariCP` `Cloud SQL Auth Proxy` `max_connections` `hikari.pool.PendingConnections` `connection cascade` `pgbouncer` `Cloud SQL` `connection limits`

## Training Track

Engineers at this level join **Track B: Advanced → Specialist** together with Level 3 engineers.
