var TRACK_JVM = {
  "id": "jvm",
  "label": "JVM Understanding",
  "icon": "jvm",
  "desc": "Spring Boot 3 on GKE with PostgreSQL on Cloud SQL and Kafka. Covers JVM internals, memory management, thread behaviour, and production diagnosis.",
  "levels": [
    {
      "num": 1, "name": "Foundations",
      "desc": "Reading what the application is telling you and understanding the basic runtime model.",
      "scenarios": [
        "Reading stack traces and understanding OOM/StackOverflow errors",
        "Using logs and Actuator endpoints for initial diagnosis",
        "Reading JVM dashboards in Grafana (heap, GC pauses)",
        "Understanding Pod restarts and probe configuration on GKE",
        "Understanding HikariCP connection pool basics"
      ]
    },
    {
      "num": 2, "name": "Practitioner",
      "desc": "Configuring the runtime correctly for your service and diagnosing the most common production problems.",
      "scenarios": [
        "Sizing JVM heap and GKE resource limits correctly",
        "Reading GC logs and distinguishing allocation surges from leaks",
        "Diagnosing Kafka consumer lag and tuning consumer config",
        "Using JFR for production investigation without downtime",
        "Writing reliable integration tests with Testcontainers"
      ]
    },
    {
      "num": 3, "name": "Advanced",
      "desc": "Diagnosing non-obvious production problems and tuning the runtime under real load.",
      "scenarios": [
        "Analysing heap dumps to find memory leaks and retained objects",
        "Reading thread dumps to diagnose stalls and lock contention",
        "Diagnosing Kafka consumer rebalancing and duplicate processing",
        "CPU profiling with async-profiler or JFR to find hot code paths",
        "Tracing HikariCP connection leaks under load"
      ]
    },
    {
      "num": 4, "name": "Specialist",
      "desc": "Owning JVM health across multiple services and solving platform-level performance problems.",
      "scenarios": [
        "Comparing GC algorithms (G1/ZGC/Shenandoah) under production load",
        "Investigating platform-level issues (CFS throttling, NUMA, noisy neighbours)",
        "Designing Kafka consumer scaling strategies for volume spikes",
        "Reducing JVM latency variance for SLO-sensitive services",
        "Diagnosing cross-service connection pool cascades"
      ]
    },
    {
      "num": 5, "name": "Expert",
      "desc": "Setting JVM and runtime standards across the organisation and mentoring teams through complex production issues.",
      "scenarios": [
        "Defining org-wide JVM baseline configurations for GKE Spring Boot services",
        "Owning production incident diagnosis and turning incidents into learning sessions",
        "Evaluating new Java versions and JVM distributions for the platform",
        "Designing realistic load tests that match production traffic patterns",
        "Defining observability standards for Spring Boot services (metrics, spans, SLOs)"
      ]
    },
    {
      "num": 6, "name": "Authority",
      "desc": "JVM platform strategy, tooling investment, and organisation-wide runtime governance.",
      "scenarios": [
        "Leading long-term JVM strategy decisions (LTS versions, GraalVM, container-native tuning)",
        "Building and adopting standardised JVM observability tooling across all services",
        "Owning complex cross-team production incident investigations",
        "Producing structured assessments for major platform shifts (e.g. Java 17→21)",
        "Identifying training gaps and building the JVM curriculum for the organisation"
      ]
    }
  ],
  "questions": []
};
