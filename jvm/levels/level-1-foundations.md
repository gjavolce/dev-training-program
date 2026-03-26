# Level 1 — Foundations

**Focus:** Reading what the application is telling you and understanding the basic runtime model.

## Which of these scenarios can you handle confidently today?

- When an application throws an OutOfMemoryError or StackOverflowError, I can read the stack trace, understand what it means, and know where to start looking — even if I haven't seen that specific error before.
  `OutOfMemoryError` `StackOverflowError` `heap space` `metaspace` `GC overhead limit exceeded` `stack trace` `java.lang.Error` `OOM killer`

- When a service is slow or unresponsive, I can check the logs and Spring Boot Actuator health endpoints to get an initial picture of what's wrong before escalating.
  `Spring Boot Actuator` `/actuator/health` `/actuator/metrics` `structured logging` `liveness` `readiness` `application logs` `kubectl logs`

- When I look at a Grafana dashboard showing JVM heap usage or GC pause time, I can follow what the chart is measuring and tell whether what I'm seeing is normal or not.
  `jvm.memory.used` `jvm.gc.pause` `heap committed` `eden space` `old gen` `Grafana` `Cloud Monitoring` `GC frequency`

- When I deploy a Spring Boot service to GKE, I understand what a Pod restart means for in-flight requests, and I know to check whether the liveness and readiness probes are configured correctly.
  `livenessProbe` `readinessProbe` `Pod restart` `terminationGracePeriodSeconds` `OOMKilled` `CrashLoopBackOff` `kubectl describe pod` `GKE`

- When HikariCP logs a "connection timeout" warning, I understand that it means the pool is exhausted and I know the first place to look: how many connections are open and whether any are stuck.
  `HikariCP` `connection timeout` `hikari.pool.ActiveConnections` `hikari.pool.PendingConnections` `maximumPoolSize` `connectionTimeout` `pool exhausted` `Cloud SQL`

## Training Track

Engineers at this level join **Track A: Foundations → Practitioner** together with Level 2 engineers.
