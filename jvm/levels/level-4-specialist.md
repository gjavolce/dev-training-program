# Level 4 — Veteran

**Focus:** I can find root causes using JVM diagnostic tools.

*Production lens: Something is actually wrong — a leak, GC pressure, thread contention causing memory buildup. Dashboard observation isn't enough; I need to look inside the JVM.*

## Which of these scenarios can you handle confidently today?

- When I suspect a memory leak, I can take heap dumps at intervals using `jcmd`, compare them in Eclipse MAT, and identify the growing object graph — tracing it back to the responsible code (a Spring cache, a Kafka offset tracker, a connection that isn't being released).
  `jcmd` `GC.heap_dump` `Eclipse MAT` `dominator tree` `retained size` `GC roots` `leak suspects` `memory leak`

- When GC logs show increasing Full GC frequency or rising old-generation occupancy, I can read the log lines, understand what they mean (promotion rate, concurrent marking failures, long pauses), and correlate with application behavior.
  `GC logs` `-Xlog:gc*` `Full GC` `old generation` `promotion rate` `concurrent marking` `GC pause` `allocation rate`

- When I capture a JFR recording, I can analyze allocation hotspots — which methods are creating the most objects, what the allocation rate is, and whether short-lived allocations are causing excessive GC pressure.
  `Java Flight Recorder` `JFR` `jcmd JFR.start` `JDK Mission Control` `JMC` `allocation hotspots` `allocation rate` `object age`

- When a thread dump shows many threads in BLOCKED or TIMED_WAITING, I can trace what they're contending on — a HikariCP connection, a synchronized block, a full executor pool — and reason about the memory implications of thread accumulation.
  `thread dump` `jstack` `jcmd Thread.print` `BLOCKED` `TIMED_WAITING` `HikariCP` `synchronized` `thread pool exhaustion`

- When diagnosing a production memory issue, I know the sequence: check Grafana metrics first, then escalate to JFR if I need allocation details, heap dump if it's a leak, thread dump if it's contention — and I reach for the right tool first.
  `diagnostic sequence` `Grafana` `JFR` `heap dump` `thread dump` `production diagnosis` `escalation path`

- When Spring Boot's Metaspace is growing steadily, I can investigate whether it's a class loader leak (common with dynamic proxies, Spring AOP, or reflection-heavy code) and know how to set `-XX:MaxMetaspaceSize` as a safety net.
  `Metaspace` `class loader leak` `Spring AOP` `dynamic proxies` `reflection` `-XX:MaxMetaspaceSize` `class loading` `Metaspace growth`

> **What this level is about:** You've crossed from "observe and reason" to "instrument and investigate." You operate the JVM's diagnostic tools and find root causes that dashboards can't reveal.

## Training Track

Engineers at this level join **Track C: Adept → Veteran** together with Level 3 engineers completing Track B.

**Cross-reference with Cloud & Observability:** Cloud & Observability L4 covers platform infrastructure, cost management, compliance, and chaos engineering — horizontal, cross-cutting concerns. This level goes vertical: deep inside one service's memory. An engineer at L4 in both tracks can diagnose deep AND wide.

---

*Tags:* #training-program #memory-management #level-4 #track-c
