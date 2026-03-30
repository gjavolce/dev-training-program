# Level 2 — Practitioner

**Focus:** I understand the container memory budget.

*Production lens: When a pod gets OOMKilled, I can figure out whether it's a heap problem or a container-sizing problem, and I can configure a new service so it doesn't get killed.*

## Which of these scenarios can you handle confidently today?

- When I size a new service for GKE, I understand that JVM memory = heap + Metaspace + thread stacks + direct byte buffers + native memory, and the container limit must fit all of it — not just the heap.
  `-Xmx` `Metaspace` `thread stacks` `-Xss` `direct byte buffers` `native memory` `NIO` `total JVM footprint`

- When configuring a service, I can apply the rule that `-Xmx` should be ~60–70% of the container memory limit, leaving room for non-heap memory, and I understand why setting `-Xmx` equal to the container limit causes OOMKill.
  `-Xmx` `resources.limits.memory` `heap ratio` `non-heap memory` `OOMKill` `container memory budget` `60-70% rule`

- When Grafana shows healthy heap metrics but pod-level memory is climbing toward the container limit, I recognize that something outside the heap is growing — and I know the likely suspects in our stack (Metaspace, thread stacks, Kafka buffers, HikariCP).
  `jvm.memory.used` `container_memory_usage_bytes` `non-heap growth` `Metaspace` `thread stacks` `direct buffers` `Kafka consumer buffers` `HikariCP`

- When reading `kubectl describe pod` after an OOMKill, I can extract the relevant information — container memory limit, last termination reason, restart count — and correlate it with the JVM's configured heap size.
  `kubectl describe pod` `Last State: Terminated` `Reason: OOMKilled` `resources.limits.memory` `-Xmx` `restart count` `exit code 137`

- When I see `UseContainerSupport` in JVM documentation, I understand why the JVM needs to know it's running in a container — and what goes wrong if it doesn't (the JVM sees the node's total memory instead of the container's limit).
  `UseContainerSupport` `MaxRAMPercentage` `cgroup memory` `container awareness` `JVM container detection` `ActiveProcessorCount`

- When setting resource requests and limits for a Spring Boot service, I understand the difference between requests (scheduling guarantee) and limits (kill boundary) and can set them appropriately for a JVM workload.
  `resources.requests.memory` `resources.limits.memory` `QoS class` `Guaranteed` `Burstable` `scheduling` `OOMKill threshold`

> **What this level is about:** The container is the real memory wall. Most production OOMKills are a misconfigured budget, not a leak. This is the highest-ROI knowledge for production reliability.

## Training Track

Engineers at this level join **Track A: Foundations → Practitioner** together with Level 1 engineers.

**Cross-reference with Cloud & Observability:** Cloud & Observability L2 covers other pod failure modes (probe failures, CrashLoopBackOff, config issues) and the broader infrastructure and instrumentation skills. Memory Management owns the "why did it run out of memory" question; Cloud & Observability owns everything else about the pod lifecycle.

---

*Tags:* #training-program #memory-management #level-2 #track-a
