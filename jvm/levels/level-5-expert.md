# Level 5 — Expert

**Focus:** Setting JVM and runtime standards that apply across the organisation and mentoring teams through complex production issues.

## Which of these scenarios can you handle confidently today?

- When multiple teams are independently tuning their JVM configurations and arriving at inconsistent results, I can consolidate what works, define org-wide baseline settings for GKE Spring Boot services, and explain the reasoning so teams understand why rather than just following rules.
  `MaxRAMPercentage` `UseContainerSupport` `G1GC` `ZGC` `JVM baseline` `GKE resource limits` `platform standards` `Spring Boot defaults`

- When a team hits a JVM problem they can't diagnose themselves, I can join a production incident, work through the evidence (heap dumps, thread dumps, JFR recordings, GC logs), and get to a root cause — and turn the incident into a learning session for the team afterwards.
  `heap dump` `thread dump` `JFR` `GC logs` `incident retrospective` `Eclipse MAT` `async-profiler` `root cause analysis`

- When we're evaluating new Java versions or JVM distributions for the platform, I can design and run the evaluation: identify the relevant changes, test against our actual workloads (Spring Boot + HikariCP + Kafka), and produce a migration recommendation with a rollout plan.
  `Java LTS` `Java 21` `virtual threads` `GraalVM` `JDK migration` `Spring Boot compatibility` `Testcontainers` `canary rollout`

- When a service's performance under load doesn't match what local testing suggested, I can design a realistic load test using our actual traffic patterns, identify the discrepancy, and determine whether it's a test fidelity problem or a genuine production-only behaviour.
  `load testing` `k6` `Gatling` `traffic shaping` `JFR` `throughput` `p99 latency` `production traffic patterns`

- When teams ask how we should instrument our Spring Boot services for observability, I can define the standard: which JVM and application metrics to expose, how to structure custom spans in OpenTelemetry, and how to connect JVM behaviour to business-level SLOs in Grafana.
  `Micrometer` `OpenTelemetry` `jvm.memory.used` `jvm.gc.pause` `custom spans` `SLO` `Grafana` `Spring Boot Actuator`

## Role in Training Program

Engineers at this level serve as **Mentors & Workshop Leads** for Track A and Track B.
