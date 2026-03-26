# Level 2 — Practitioner

**Focus:** Configuring the runtime correctly for your service and diagnosing the most common production problems.

## Which of these scenarios can you handle confidently today?

- When I size a new service for GKE, I can set JVM heap limits (-Xmx) and GKE resource requests/limits so the container doesn't get OOM-killed — and I understand why the JVM doesn't automatically respect the container's memory limit without explicit configuration.
  `-Xmx` `-Xms` `UseContainerSupport` `MaxRAMPercentage` `resources.requests` `resources.limits` `OOMKilled` `cgroup memory`

- When GC pause times are elevated or GC frequency spikes, I can read the GC logs or JFR data well enough to distinguish between a temporary allocation surge and a genuine memory leak, and I know which one needs immediate action.
  `GC logs` `-Xlog:gc` `jvm.gc.pause` `allocation rate` `heap pressure` `Java Flight Recorder` `JFR` `G1GC`

- When a Kafka consumer in our service starts falling behind on lag, I can check whether the cause is slow processing, insufficient concurrency, or a downstream bottleneck, and I can adjust the consumer thread pool or `max.poll.records` to address it.
  `consumer lag` `max.poll.records` `max.poll.interval.ms` `consumer group` `kafka.consumer.fetch-latency-avg` `concurrency` `partition` `@KafkaListener`

- When I need to investigate a production issue without a debugger, I can attach a JFR recording to a running pod, pull the file, and open it in JMC to identify hot methods or lock contention without taking the service down.
  `Java Flight Recorder` `JFR` `jcmd` `Java Mission Control` `JMC` `jcmd VM.unlock_commercial_features` `kubectl cp` `lock contention`

- When I write integration tests with Testcontainers for a Spring Boot service, I understand why the test JVM and container startup sequence matters and how to avoid flaky tests caused by connection timing.
  `Testcontainers` `@SpringBootTest` `@Container` `waitingFor` `withStartupTimeout` `Spring Boot test slices` `flaky tests` `DataSourceAutoConfiguration`

## Training Track

Engineers at this level join **Track A: Foundations → Practitioner** together with Level 1 engineers.
