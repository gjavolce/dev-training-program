var TRACK_JVM = {
  "id": "jvm",
  "label": "Memory Management",
  "icon": "jvm",
  "desc": "How memory works in Spring Boot services on GKE. Starts with dashboards, progresses through container memory budgets and Spring Boot internals, and reaches JVM diagnostic tools for deep investigation.",
  "levels": [
    {
      "num": 1,
      "name": "Foundations",
      "desc": "I know my app uses memory and I can see it. I can find the right dashboard, recognise symptoms, and escalate with useful information.",
      "scenarios": [
        "Reading Grafana memory panels and recognising healthy vs unhealthy patterns",
        "Understanding OOMKilled — what it means and how to spot it",
        "Recognising memory configuration in deployment manifests (-Xmx, resource limits)",
        "Understanding Spring Boot warm-up and why first requests are slow",
        "Having a basic mental model of heap, stack, GC, and OutOfMemoryError"
      ]
    },
    {
      "num": 2,
      "name": "Practitioner",
      "desc": "I understand the container memory budget. When a pod gets OOMKilled, I can figure out whether it's heap or container sizing, and configure a new service correctly.",
      "scenarios": [
        "Sizing JVM memory for containers: heap + Metaspace + threads + buffers must fit the limit",
        "Applying the 60-70% rule and understanding why -Xmx = container limit causes OOMKill",
        "Recognising non-heap memory growth when heap looks healthy but pod memory climbs",
        "Reading kubectl describe pod after OOMKill and correlating with JVM config",
        "Understanding UseContainerSupport and Kubernetes resource requests vs limits"
      ]
    },
    {
      "num": 3,
      "name": "Advanced",
      "desc": "I know where memory goes inside a Spring Boot app. I can reason about consumers and make informed configuration and code review decisions.",
      "scenarios": [
        "Reasoning about Spring Boot memory consumers: HikariCP, Kafka buffers, Tomcat threads, caches",
        "Reading Actuator memory metrics and correlating with behaviour",
        "Distinguishing OutOfMemoryError types: heap space, Metaspace, unable to create native thread",
        "Flagging memory risks in code reviews: unbounded collections, missing eviction, batch accumulation",
        "Estimating a service's memory footprint from its configuration"
      ]
    },
    {
      "num": 4,
      "name": "Specialist",
      "desc": "I can find root causes using JVM diagnostic tools. Dashboard observation isn't enough — I look inside the JVM to find leaks, GC pressure, and contention.",
      "scenarios": [
        "Analysing heap dumps with Eclipse MAT to find memory leaks and retained objects",
        "Reading GC logs to identify promotion rate, pause patterns, and old-gen growth",
        "Using JFR to profile allocation hotspots and correlate with GC pressure",
        "Interpreting thread dumps to diagnose contention and pool exhaustion",
        "Investigating Metaspace growth and class loader leaks"
      ]
    },
    {
      "num": 5,
      "name": "Expert",
      "desc": "I design for memory efficiency and set standards. Proactive decisions that prevent memory problems across services.",
      "scenarios": [
        "Evaluating G1 vs ZGC for production SLAs with JFR data",
        "Designing memory budgets across thread pools and connection pools",
        "Diagnosing cold start memory dimensions and designing readiness strategies",
        "Defining org-wide JVM configuration baselines",
        "Assessing Java version upgrade memory implications"
      ]
    },
    {
      "num": 6,
      "name": "Authority",
      "desc": "I own memory strategy for the engineering organisation. Platform observability, capacity planning, SLA budgets, and technology roadmap.",
      "scenarios": [
        "Designing fleet-wide memory reliability strategy and driving adoption",
        "Translating memory behaviour into SLA performance budgets",
        "Evaluating emerging JVM capabilities (virtual threads, CRaC, GraalVM AOT)",
        "Building fleet-wide memory observability and automated diagnostics",
        "Leading deep production investigations involving native memory or driver-level issues"
      ]
    }
  ],
  "questions": [
    {
      "level": 1,
      "diff": 1,
      "scenario": 0,
      "q": "In a Grafana JVM dashboard, 'Used Heap' shows a sawtooth pattern — rises then drops sharply, over and over. What does this pattern indicate?",
      "opts": [
        "The service is crashing and restarting repeatedly — each restart clears the heap completely, producing the sharp drop before it climbs again",
        "Normal healthy behaviour — heap rises as objects are allocated, then drops when GC runs",
        "A memory leak is in progress — objects are accumulating and GC is running emergency full collections to temporarily recover space",
        "GC is misconfigured with an overly aggressive collection frequency that forces unnecessary cleanup cycles on a healthy heap",
        "The heap is undersized for the workload, causing GC to trigger constantly as it hits the ceiling on every allocation cycle"
      ],
      "ans": 1,
      "fb": "The sawtooth pattern is the signature of healthy garbage collection: objects are allocated (heap rises), GC runs and reclaims short-lived objects (heap drops sharply), and the cycle repeats. A memory leak would show a pattern where each trough is higher than the last — the baseline rises over time."
    },
    {
      "level": 1,
      "diff": 2,
      "scenario": 0,
      "q": "In Grafana, 'Used Heap' climbs steadily over 6 hours without any drops. What does this pattern suggest?",
      "opts": [
        "A memory leak — objects are being retained and GC cannot reclaim them",
        "The service is idle with no traffic, so no new objects are being allocated and GC has nothing to collect from the heap",
        "The Grafana dashboard is stale and not refreshing — the actual heap usage likely shows a normal sawtooth if you reload the panel",
        "GC has been disabled in the JVM configuration via -XX:-UseGCOverheadLimit, so no collections are occurring at all",
        "Normal behaviour — the heap has not yet reached -Xmx so the JVM has not triggered its first garbage collection cycle"
      ],
      "ans": 0,
      "fb": "Steady heap growth without drops means GC is running but cannot reclaim enough memory — objects are being retained by references the GC cannot clear. Normal behaviour produces a sawtooth pattern with periodic drops. GC runs automatically; it cannot be disabled in normal operation."
    },
    {
      "level": 1,
      "diff": 3,
      "scenario": 0,
      "q": "A Grafana panel shows 'GC Pause Duration' spiking to 500ms every few minutes. The 'Used Heap' sawtooth looks normal. What is the immediate concern?",
      "opts": [
        "Nothing to worry about — GC pauses of any duration are normal and expected in a healthy JVM running garbage collection cycles",
        "The service is about to crash with an OutOfMemoryError because high GC pauses always indicate the heap is nearly exhausted",
        "Application threads are frozen for 500ms during each pause, causing latency spikes for API callers",
        "The Grafana dashboard time range is too narrow to show a meaningful trend — widen it to 24 hours for an accurate picture",
        "The heap is too large, and the solution is to reduce -Xmx significantly so that GC has less memory to scan during each cycle"
      ],
      "ans": 2,
      "fb": "GC pauses are stop-the-world events — all application threads freeze while GC runs. A 500ms pause directly translates to a 500ms latency spike for any request in progress. G1GC's default target is 200ms — 500ms pauses indicate the heap may be too large or GC needs tuning."
    },
    {
      "level": 1,
      "diff": 1,
      "scenario": 1,
      "q": "A GKE pod is restarting repeatedly with exit code 137. What happened?",
      "opts": [
        "The container was OOM-killed by the Linux kernel — it exceeded its memory limit",
        "The pod exceeded its CPU limit and Kubernetes terminated the container with SIGKILL to reclaim processing resources",
        "The JVM threw an unhandled exception such as NullPointerException or StackOverflowError and the process exited with a fatal error",
        "A deployment rollback was triggered by Kubernetes because the new revision failed its initial health checks during rollout",
        "The liveness probe failed repeatedly and Kubernetes restarted the container after exceeding the configured failure threshold"
      ],
      "ans": 0,
      "fb": "Exit code 137 = killed by signal 9 (SIGKILL). The Linux OOM killer sends SIGKILL when a container's memory usage exceeds its cgroup limit. Liveness probe failures show different events in kubectl describe. CPU throttling slows the pod but does not kill it."
    },
    {
      "level": 1,
      "diff": 2,
      "scenario": 1,
      "q": "A pod was OOM-killed (exit code 137). The JVM logs do NOT show OutOfMemoryError. How is this possible?",
      "opts": [
        "The OOM-kill was directed at a different container running as a sidecar in the same pod, not the JVM container itself",
        "The kernel killed the container before the JVM detected it — OOMKill is external to the JVM",
        "It is not possible for an OOMKill to happen without an OutOfMemoryError — the JVM always detects heap exhaustion first",
        "The JVM log buffer was not flushed to disk before the restart, so the OutOfMemoryError was written but lost during shutdown",
        "The JVM internally suppressed the OutOfMemoryError via the -XX:+SuppressOOMErrors flag to prevent noisy log output"
      ],
      "ans": 1,
      "fb": "OOMKill (exit 137) and OutOfMemoryError are different mechanisms. OutOfMemoryError is the JVM detecting it cannot allocate heap. OOMKill is the Linux kernel detecting the entire container process exceeds its memory limit. OOMKill can happen when non-heap memory pushes total memory past the limit — the JVM heap may be fine."
    },
    {
      "level": 1,
      "diff": 3,
      "scenario": 1,
      "q": "A service restarts 3 times per day with exit code 137, always during peak traffic. Heap dashboards show the heap is only 60% full when restarts happen. What should you investigate?",
      "opts": [
        "The service is CPU throttled during peak traffic, causing the container runtime to terminate it with SIGKILL once throttle time exceeds the limit",
        "The liveness probe timeout is too aggressive during peak traffic, and Kubernetes is restarting the pod because health checks are timing out",
        "The heap is too small at -Xmx and needs to be increased — 60% utilisation means GC is struggling to keep up with allocation demand",
        "Non-heap memory (thread stacks, Kafka buffers, native memory) is growing under load and pushing total process memory past the container limit",
        "Cloud SQL is rejecting connections during peak traffic, causing the JDBC driver to throw fatal errors that crash the JVM process"
      ],
      "ans": 3,
      "fb": "Heap at 60% but container OOM-killed means the problem is outside the heap. Under peak traffic: more Tomcat threads (each ~1MB stack), more Kafka consumer buffers, JIT-compiled code — all grow. Total JVM memory = heap + Metaspace + thread stacks + direct buffers + native. If -Xmx is set too close to the container limit, there's no room for non-heap growth under load."
    },
    {
      "level": 1,
      "diff": 1,
      "scenario": 2,
      "q": "In a Kubernetes deployment manifest, what does -Xmx512m control?",
      "opts": [
        "The maximum number of threads the JVM can create — once 512 threads are active, no new threads can be spawned by the application",
        "The maximum heap memory the JVM can allocate",
        "The maximum size of a single Java object that can be allocated on the heap — objects larger than 512MB are rejected",
        "The container's total memory limit enforced by the Linux kernel via cgroups, equivalent to resources.limits.memory in Kubernetes",
        "The amount of CPU allocated to the JVM process, measured in millicores and used by the Kubernetes scheduler for placement"
      ],
      "ans": 1,
      "fb": "-Xmx512m sets the maximum Java heap size to 512 megabytes. The heap is where Java objects live. It does NOT control total JVM memory (which also includes Metaspace, thread stacks, and native memory) and it is NOT the container limit (set via resources.limits.memory)."
    },
    {
      "level": 1,
      "diff": 2,
      "scenario": 2,
      "q": "A deployment manifest shows resources.limits.memory: 1Gi and the JVM flag -Xmx900m. Is this a good configuration?",
      "opts": [
        "Yes — the heap should use as much of the container limit as possible to maximise the amount of memory available for Java objects",
        "It depends entirely on the CPU allocation — memory sizing is secondary to CPU limits when configuring JVM containers",
        "No — this leaves only ~124MB for Metaspace, thread stacks, direct byte buffers, and native memory, which is likely not enough",
        "Yes — 100MB of headroom between -Xmx and the container limit is the standard best practice recommended by the JVM documentation",
        "No — -Xmx should always equal the memory limit exactly so the JVM uses all available container memory without wasting any"
      ],
      "ans": 2,
      "fb": "Total JVM memory = heap (900MB) + Metaspace (~80-150MB) + thread stacks (threads x ~1MB) + direct byte buffers + JIT code cache + native allocations. With a 1Gi limit and 900MB heap, only ~124MB remains. Under load this is almost certainly insufficient. Safe rule: -Xmx should be 60-70% of the container limit."
    },
    {
      "level": 1,
      "diff": 3,
      "scenario": 2,
      "q": "You see -XX:+UseContainerSupport in a JVM configuration. What does this flag do?",
      "opts": [
        "Optimises the GC algorithm specifically for containerised environments by enabling container-aware pause time targets and region sizing",
        "Enables Spring Boot to detect it is running inside a Docker container and automatically adjusts its embedded server configuration",
        "Tells the JVM to read memory and CPU limits from the container's cgroup instead of the host machine",
        "Enables Kubernetes health probe integration so the JVM responds to liveness and readiness checks through a built-in HTTP endpoint",
        "Enables Java Flight Recorder profiling inside containers by unlocking the commercial JFR features for containerised deployments"
      ],
      "ans": 2,
      "fb": "Without container support, the JVM reads the host machine's total memory (e.g., 32GB on a GKE node) and may set its heap accordingly — far exceeding the container's actual limit. With UseContainerSupport, the JVM reads cgroup limits. This flag is on by default since Java 8u191 and Java 11+."
    },
    {
      "level": 1,
      "diff": 1,
      "scenario": 3,
      "q": "A Spring Boot service takes 15 seconds to start. During those first 15 seconds, API response times are 2-3x higher than normal. Why?",
      "opts": [
        "Kubernetes is throttling CPU during startup because the pod's CPU requests are too low for the container to initialise quickly",
        "The JVM's JIT compiler hasn't yet optimised hot code paths — it runs in interpreted mode initially",
        "The Cloud SQL database connection pool is slow to initialise during startup, causing all queries to queue behind the first connection",
        "The service is downloading Maven dependencies from the remote repository at startup because they were not bundled in the container image",
        "The readiness probe is misconfigured with too short an interval, causing Kubernetes to mark the pod as ready before it finishes starting"
      ],
      "ans": 1,
      "fb": "The JVM initially runs bytecode through an interpreter. The JIT compiler identifies hot methods and compiles them to native machine code over time. Until hot paths are compiled, they run significantly slower. Spring context initialisation, connection pool creation, and Kafka rebalance also add to startup time."
    },
    {
      "level": 1,
      "diff": 2,
      "scenario": 3,
      "q": "A freshly deployed pod passes its readiness probe but the first 50 API requests have 3x higher latency. What is happening?",
      "opts": [
        "The container image layers are still being downloaded from the registry during these first requests, causing I/O contention on the node",
        "The JVM is still warming up — JIT compilation, connection pool creation, and cache population haven't completed yet",
        "The Cloud SQL database needs to warm its buffer cache specifically for this pod's queries before it can serve them efficiently",
        "The Kubernetes scheduler placed the pod on an overloaded node with insufficient CPU, causing consistent latency for all requests",
        "The pod has a memory leak that manifests specifically under initial load conditions and resolves once the heap stabilises"
      ],
      "ans": 1,
      "fb": "Readiness probes check basic health (e.g., /actuator/health returns UP), but the JVM isn't fully warm yet. JIT hasn't compiled hot paths, HikariCP may create connections lazily, Spring caches are empty, and Kafka consumers may still be rebalancing."
    },
    {
      "level": 1,
      "diff": 1,
      "scenario": 4,
      "q": "What is 'garbage collection' in the JVM?",
      "opts": [
        "A Kubernetes feature that evicts idle pods from nodes when resource utilisation drops below a configured threshold in the cluster",
        "A background process running on the GKE node that removes unused Docker images and orphaned containers to reclaim disk space",
        "The JVM's automatic process of identifying and reclaiming memory occupied by objects that are no longer referenced",
        "A background process that monitors the container's filesystem and deletes unused temporary files and old log entries periodically",
        "A manual cleanup procedure that developers must trigger by calling System.gc() in their code whenever the heap gets too full"
      ],
      "ans": 2,
      "fb": "Garbage collection (GC) is the JVM's automatic memory management. It identifies objects in heap memory that are no longer reachable from any active reference chain and reclaims that memory for new allocations. Developers do not need to call it manually."
    },
    {
      "level": 1,
      "diff": 2,
      "scenario": 4,
      "q": "A log shows java.lang.OutOfMemoryError: Java heap space. What does this mean?",
      "opts": [
        "The JVM ran out of thread stack space because too many recursive calls consumed all available stack frames on the current thread",
        "The container's persistent volume or ephemeral storage disk is full, preventing the JVM from writing temporary files needed for operation",
        "The JVM could not allocate a new object because the heap is full and GC could not free enough space",
        "The Metaspace region is exhausted because too many classes were loaded into the JVM, filling the class metadata storage area",
        "The Linux kernel OOM-killed the container because total process memory exceeded the cgroup limit set by resources.limits.memory"
      ],
      "ans": 2,
      "fb": "'Java heap space' means the garbage collector ran but could not free enough heap memory for a new allocation. This is different from OOMKill (exit 137). Metaspace exhaustion produces 'OutOfMemoryError: Metaspace'. Thread issues produce 'unable to create native thread'."
    },
    {
      "level": 1,
      "diff": 3,
      "scenario": 4,
      "q": "What is the difference between OutOfMemoryError: Java heap space and the pod being OOM-killed (exit code 137)?",
      "opts": [
        "OOMKill always produces an OutOfMemoryError first — the JVM detects heap exhaustion internally before the kernel takes action to kill the process",
        "They are the same underlying mechanism — both refer to the JVM running out of memory and the process being terminated as a result",
        "OutOfMemoryError always triggers an OOMKill — whenever the JVM throws this error, the kernel immediately sends SIGKILL to the container",
        "OutOfMemoryError is the JVM's response to CPU exhaustion; OOMKill is the kernel's response to memory exhaustion — they address different resources",
        "OutOfMemoryError is the JVM detecting it can't allocate heap; OOMKill is the Linux kernel killing the container for exceeding its memory limit — they can happen independently"
      ],
      "ans": 4,
      "fb": "These are separate mechanisms at different layers. OutOfMemoryError: the JVM's internal check. OOMKill: the Linux kernel's enforcement. You can have OOMKill without OutOfMemoryError (non-heap exceeds limit while heap is fine). You can have OutOfMemoryError without OOMKill (heap full but total memory under limit)."
    },
    {
      "level": 2,
      "diff": 1,
      "scenario": 0,
      "q": "A Spring Boot service runs in a container with 1Gi memory limit. The JVM uses heap, Metaspace, thread stacks, direct byte buffers, and native memory. What must be true?",
      "opts": [
        "Only the heap (-Xmx) needs to fit within 1Gi — non-heap regions like Metaspace and thread stacks are managed separately by Kubernetes",
        "Kubernetes automatically adjusts the container limit upward to accommodate non-heap memory regions like Metaspace and thread stacks",
        "Metaspace and thread stacks are allocated outside the container's cgroup limit and do not count toward the 1Gi memory ceiling",
        "The JVM manages the container limit automatically by adjusting its internal memory regions to stay within the cgroup ceiling",
        "The sum of all JVM memory regions must fit within 1Gi, not just the heap"
      ],
      "ans": 4,
      "fb": "The container memory limit (enforced by Linux cgroups) applies to the entire process. Total = heap + Metaspace + thread stacks (each ~1MB) + direct byte buffers + JIT code cache + native allocations. If this total exceeds the container limit, the kernel sends SIGKILL (exit 137)."
    },
    {
      "level": 2,
      "diff": 2,
      "scenario": 0,
      "q": "You are sizing a new service. It has 200 Tomcat threads, 10 HikariCP connections, 3 Kafka consumers (50MB fetch buffer each). Estimated Metaspace is 120MB. What is the minimum non-heap memory needed?",
      "opts": [
        "About 50MB — non-heap memory is always a small fraction of total JVM memory and can be safely ignored during container sizing",
        "About 200MB — only Metaspace (120MB) and a small amount of native buffers (80MB) need to be considered for non-heap memory",
        "About 520MB (200 threads x 1MB stacks + 150MB Kafka buffers + 120MB Metaspace + overhead)",
        "Impossible to estimate without first taking a heap dump from a running instance and analysing it in Eclipse MAT for non-heap details",
        "About 120MB — only Metaspace needs to be counted because thread stacks and Kafka buffers are allocated inside the heap region"
      ],
      "ans": 2,
      "fb": "Thread stacks: 200 x ~1MB = 200MB. Kafka buffers: 3 x 50MB = 150MB (direct byte buffers). Metaspace: 120MB. Plus JIT code cache (~50MB), native overhead. Total non-heap ~520MB+. If container limit is 1.5Gi, that leaves ~1GB for heap."
    },
    {
      "level": 2,
      "diff": 3,
      "scenario": 0,
      "q": "A service has -Xmx=600m in a 1Gi container. After adding a new Kafka consumer group (5 threads, 50MB fetch.max.bytes each), the pod starts getting OOM-killed. Heap dashboards look normal. Why?",
      "opts": [
        "The 5 new Kafka consumers added ~250MB of direct byte buffer memory, pushing total JVM memory past the 1Gi container limit",
        "The heap is too small for the new consumer's deserialized messages — Kafka records are stored on the heap and 5 consumers overwhelm it",
        "The liveness probe is failing because the Kafka broker connection is interfering with the health check endpoint on the Actuator port",
        "The new consumer group is causing excessive GC pressure by allocating too many short-lived objects during message deserialization",
        "The Kafka client library is incompatible with the current JVM version and is leaking native memory through a known driver bug"
      ],
      "ans": 0,
      "fb": "Kafka consumer buffers (fetch.max.bytes) are allocated as direct byte buffers — outside the heap. 5 consumers x 50MB = 250MB off-heap. Before: 600MB heap + ~300MB non-heap = ~900MB. After: +250MB = ~1.15Gi > 1Gi → OOMKill."
    },
    {
      "level": 2,
      "diff": 1,
      "scenario": 1,
      "q": "Why should -Xmx be set to 60-70% of the container memory limit, not 100%?",
      "opts": [
        "Kubernetes reserves 30% of the container limit for its own system processes like kubelet, kube-proxy, and container runtime overhead",
        "The JVM does not actually use all of the configured -Xmx — it only commits memory on demand and typically stays well below the maximum",
        "The remaining 30-40% is needed for non-heap memory: Metaspace, thread stacks, direct byte buffers, JIT code cache, and native memory",
        "It is just an industry convention with no technical basis — any ratio between -Xmx and container limit works equally well in practice",
        "The GC algorithm requires 30% of the heap as internal headroom to copy and compact objects during collection cycles"
      ],
      "ans": 2,
      "fb": "The JVM uses significantly more memory than just the heap. Metaspace (~80-200MB), thread stacks (each ~1MB), direct byte buffers (NIO, Kafka, Netty), JIT compiled code cache (~50-240MB), and native allocations all live outside the heap but inside the container's memory limit."
    },
    {
      "level": 2,
      "diff": 2,
      "scenario": 1,
      "q": "A team sets -Xmx equal to resources.limits.memory (both 2Gi). The service OOM-kills on every deployment but works at steady state. What explains this?",
      "opts": [
        "Kubernetes doubles memory usage during rolling updates by running old and new pods simultaneously on the same node with shared memory",
        "The readiness probe handler causes significant extra memory allocation by exercising Spring Boot internals that require heap space",
        "During deployment, the JVM starts with heap + Metaspace for class loading + JIT compilation. Since -Xmx=2Gi and limit=2Gi, there is zero room for non-heap — any Metaspace or native allocation pushes past the limit",
        "The Kubernetes deployment manifest has a syntax error that causes the container to be created with incorrect memory limit values",
        "Deployments inherently use more memory than steady state because Kubernetes injects additional sidecar processes during the rollout"
      ],
      "ans": 2,
      "fb": "At startup, the JVM allocates heap (reserves 2Gi), loads classes into Metaspace (100-200MB), creates thread stacks, and JIT-compiles code. Since 2Gi heap + any non-heap > 2Gi limit, the kernel kills the process before it finishes starting."
    },
    {
      "level": 2,
      "diff": 3,
      "scenario": 1,
      "q": "Two identically configured services (-Xmx=512m, limit=1Gi) but one is OOM-killed weekly while the other never is. What is the most likely difference?",
      "opts": [
        "They must be on different GKE node types with different hardware memory configurations that affect how the cgroup limit is enforced",
        "The OOM-killed service has a heap memory leak — objects are being retained on the heap and GC cannot reclaim them, filling the heap",
        "The services are running different JVM versions with different default memory management behaviour and GC algorithm selections",
        "One service has more active threads, Kafka consumers, or larger caches — its non-heap memory footprint is higher, exhausting the headroom between heap and container limit",
        "Cloud SQL is configured differently for each service, with different connection pool sizes affecting how the database driver allocates memory"
      ],
      "ans": 3,
      "fb": "With identical -Xmx and container limits, the difference must be in non-heap consumption. Service A might have 50 threads (50MB stacks) + 5 Kafka consumers (250MB). Service B might have 200 threads (200MB) + 10 Kafka consumers (500MB). Same config, very different non-heap footprints."
    },
    {
      "level": 2,
      "diff": 1,
      "scenario": 2,
      "q": "Grafana shows JVM heap at 55% utilisation, but container memory usage is at 92%. What is consuming the remaining memory?",
      "opts": [
        "The heap metric is reporting incorrect values because Micrometer is misconfigured and not reading the actual heap utilisation properly",
        "Other containers running as sidecars in the same pod are consuming the additional memory and inflating the container-level metric",
        "Non-heap JVM memory: Metaspace, thread stacks, direct byte buffers, JIT code cache, and native allocations",
        "The Linux page cache is consuming the remaining memory by caching disk I/O operations inside the container's cgroup allocation",
        "Kubernetes infrastructure overhead from the kubelet, kube-proxy, and container runtime consumes the remaining memory within the pod"
      ],
      "ans": 2,
      "fb": "JVM heap metrics only show heap. Container memory shows everything the process uses. The gap is non-heap: Metaspace, thread stacks, direct byte buffers, JIT-compiled code, and native allocations."
    },
    {
      "level": 2,
      "diff": 2,
      "scenario": 2,
      "q": "A service's container memory usage grows slowly over days while heap usage stays stable. What are the most likely non-heap culprits?",
      "opts": [
        "Heap fragmentation — the G1 collector is leaving gaps between objects that inflate committed memory without increasing used heap metrics",
        "Increasing request payload sizes are causing the Tomcat NIO connector to allocate larger internal buffers on the heap for each request",
        "GC pressure is causing internal memory fragmentation within the JVM's heap regions, leading to wasted space that appears as container growth",
        "Metaspace growth (dynamic class loading) or direct byte buffer accumulation (connection/buffer leaks in NIO or Kafka)",
        "Kafka consumer lag is building up unprocessed messages in the consumer's internal buffer, which grows the container's resident memory"
      ],
      "ans": 3,
      "fb": "Stable heap + growing container memory means something outside the heap is growing. Top candidates: Metaspace (dynamic class generation), direct byte buffers (Kafka/Netty not releasing buffers), or thread count growing (leaked thread pools)."
    },
    {
      "level": 2,
      "diff": 3,
      "scenario": 2,
      "q": "After adding a new @Cacheable method using Spring's default ConcurrentMapCacheManager, heap usage grows linearly over weeks. What is the root cause?",
      "opts": [
        "The cache eviction policy is too aggressive — it is evicting entries so frequently that the application re-computes and re-caches them continuously",
        "Spring's default ConcurrentMapCacheManager has no size limit or eviction — entries accumulate indefinitely",
        "The cache key objects are too large because they contain serialised request data that consumes excessive heap per entry stored",
        "GC is not running frequently enough to reclaim expired cache entries, allowing them to accumulate in the old generation over time",
        "The @Cacheable annotation is placed on the wrong method, causing it to cache large response objects instead of the intended small results"
      ],
      "ans": 1,
      "fb": "Spring's default ConcurrentMapCacheManager uses a plain ConcurrentHashMap with no maximum size, no TTL, and no eviction. Every unique cache key adds an entry permanently. Fix: switch to Caffeine cache with maximumSize and expireAfterWrite."
    },
    {
      "level": 2,
      "diff": 1,
      "scenario": 3,
      "q": "After an OOMKill, you run kubectl describe pod. What fields tell you the container exceeded its memory limit?",
      "opts": [
        "'Last State: Terminated', 'Reason: OOMKilled', 'Exit Code: 137', and the container's memory limit in the resources section",
        "The container's image version and tag in the spec section, which reveals whether the OOMKill was introduced by a recent code change",
        "The node's disk usage section in the describe output, which shows whether ephemeral storage exhaustion triggered the container kill",
        "The pod's event log at the bottom of the describe output only — the container status section does not contain OOMKill information",
        "The pod's CPU usage section in the resources block, which shows whether CPU throttling caused the container to be terminated"
      ],
      "ans": 0,
      "fb": "kubectl describe pod shows 'Last State: Terminated, Reason: OOMKilled, Exit Code: 137'. The resources section shows limits.memory — the ceiling that was exceeded. Next step: correlate with JVM heap dashboards to determine heap vs non-heap cause."
    },
    {
      "level": 2,
      "diff": 2,
      "scenario": 3,
      "q": "A pod shows OOMKilled in kubectl describe, but the JVM's last log line before the kill was a normal request completion — no OutOfMemoryError. What does this tell you?",
      "opts": [
        "The container was killed for exceeding its CPU limit, not memory — CPU throttling can produce exit code 137 in some Kubernetes versions",
        "The application logs are incomplete because the log aggregation pipeline lost entries during the pod restart window",
        "The JVM internally suppressed the OutOfMemoryError via the -XX:+SuppressOOMErrors flag to avoid noisy log output in production",
        "The OOMKill was directed at a different container running as a sidecar in the same pod, such as the Cloud SQL Auth Proxy",
        "The JVM heap was fine — the OOMKill was caused by non-heap memory pushing total process memory past the container limit"
      ],
      "ans": 4,
      "fb": "If the JVM didn't throw OutOfMemoryError, the heap had room. The OOMKill was triggered by total process memory (heap + non-heap) exceeding the container limit. The kernel kills instantly — the JVM has no chance to log."
    },
    {
      "level": 2,
      "diff": 1,
      "scenario": 4,
      "q": "What does UseContainerSupport do for a JVM on GKE?",
      "opts": [
        "Optimises the GC algorithm specifically for containerised environments by selecting pause time targets tuned for cgroup-constrained workloads",
        "Makes the JVM read memory and CPU limits from the container's cgroup instead of the host node's total resources",
        "Enables Kubernetes health probe support so the JVM can respond to liveness and readiness checks through a built-in endpoint",
        "Enables Java Flight Recorder profiling inside containers by unlocking JFR features that are otherwise disabled in containerised deployments",
        "Allows the JVM to use swap memory from the host node when the container's physical memory limit is reached, avoiding OOMKill"
      ],
      "ans": 1,
      "fb": "Without container support, a JVM on a 32GB GKE node would see 32GB and auto-size its heap to 8GB — exceeding a 1Gi container limit and causing OOMKill. UseContainerSupport makes the JVM read cgroup limits. Default since Java 8u191+."
    },
    {
      "level": 2,
      "diff": 2,
      "scenario": 4,
      "q": "What is the difference between resources.requests.memory and resources.limits.memory for a JVM pod?",
      "opts": [
        "Requests is the scheduling guarantee (Kubernetes ensures this much on the node); limits is the kill boundary (the kernel kills the process if it exceeds this)",
        "Requests controls the JVM heap size via -Xmx; limits controls the non-heap memory regions like Metaspace and thread stacks separately",
        "Limits is advisory and the kernel will not enforce it; requests is the hard enforcement boundary that triggers OOMKill when exceeded",
        "They are the same thing — both set the container memory ceiling and the kernel enforces whichever value is higher between the two",
        "Requests sets the memory available during startup; limits sets the memory available during steady-state operation after the pod is ready"
      ],
      "ans": 0,
      "fb": "Requests: used by the scheduler to place pods. Limits: enforced by the kernel — exceeding it causes SIGKILL. For JVM workloads, set requests close to limits (JVM reserves heap at startup), and set limits to accommodate heap + non-heap."
    },
    {
      "level": 2,
      "diff": 3,
      "scenario": 4,
      "q": "A JVM pod has requests.memory=512Mi and limits.memory=1Gi. It consistently uses 800Mi. What is the risk?",
      "opts": [
        "The JVM will crash with an OutOfMemoryError once it reaches 512Mi because the request value acts as a hard limit on heap allocation",
        "No risk at all — the pod is operating within its configured limits and the scheduler has already guaranteed sufficient node resources",
        "Kubernetes will automatically autoscale the pod by adjusting the request value upward to match the observed 800Mi usage pattern",
        "The pod may be scheduled on a node without 800Mi available — the scheduler only guarantees 512Mi, and the pod could be evicted under node memory pressure",
        "The pod will be OOM-killed by the kernel once it exceeds 512Mi because the request value is the cgroup enforcement boundary"
      ],
      "ans": 3,
      "fb": "The scheduler places based on requests (512Mi). If the node is overcommitted, Kubernetes may evict Burstable pods (requests != limits). For JVM workloads with predictable memory, setting requests = limits (Guaranteed QoS) prevents eviction."
    },
    {
      "level": 3,
      "diff": 1,
      "scenario": 0,
      "q": "A Spring Boot service is using more memory than expected. Which components should you check first?",
      "opts": [
        "The JVM version — different versions have fundamentally different memory requirements and upgrading usually resolves unexpected memory growth",
        "Only the number of REST endpoints — each endpoint registers handler mappings that consume significant heap memory proportional to route count",
        "Only the heap size setting (-Xmx) — if heap is correctly sized, all other memory consumers are automatically managed by the JVM",
        "The container's CPU allocation — insufficient CPU causes the JVM to buffer more work in memory while waiting for processing time",
        "HikariCP connection pool, Kafka consumer buffers, Tomcat thread pool, and Spring caches — the major memory consumers in a typical Spring Boot service"
      ],
      "ans": 4,
      "fb": "In a typical Spring Boot service: HikariCP holds DB connections (each ~1MB), Kafka consumers allocate fetch buffers (fetch.max.bytes per consumer, off-heap), Tomcat threads each have a ~1MB stack, and Spring caches can grow unboundedly."
    },
    {
      "level": 3,
      "diff": 2,
      "scenario": 0,
      "q": "A service has spring.kafka.consumer.properties.fetch.max.bytes=52428800 (50MB) and spring.kafka.listener.concurrency=3. How much off-heap memory do the Kafka consumers use?",
      "opts": [
        "150MB — each of the 3 consumers allocates one 50MB direct byte buffer for fetching records from the broker, totalling 3 x 50MB",
        "300MB — Kafka double-buffers internally, so 3 x 50MB x 2",
        "50MB total — the fetch.max.bytes setting is a global limit shared across all consumer threads in the same consumer group",
        "It depends entirely on the number of partitions assigned to each consumer — the fetch buffer size is per-partition, not per-consumer",
        "Zero — Kafka consumer buffers are allocated on the JVM heap and are already accounted for in the -Xmx setting"
      ],
      "ans": 1,
      "fb": "Each Kafka consumer thread allocates direct byte buffers for fetching. With double-buffering (one being processed, next being filled): 3 x 50MB x 2 = 300MB of direct byte buffers — entirely outside the JVM heap."
    },
    {
      "level": 3,
      "diff": 3,
      "scenario": 0,
      "q": "Three identical pods run the same service, but pod A uses 400MB, pod B uses 600MB, and pod C uses 900MB. Same configuration. What is the most likely cause?",
      "opts": [
        "Different container limits are applied to each pod due to a misconfiguration in the deployment manifest's replica-specific overrides",
        "Random GC timing differences between pods cause one JVM to commit more memory than the others due to collection scheduling variance",
        "Different Kafka partition assignments — the pod with more partitions has more consumer buffers and cached data",
        "Different JVM versions are running on different GKE nodes, each with different default memory management behaviour and heap sizing",
        "Network latency differences between pods cause request buffering that accumulates in-memory and inflates the working set size"
      ],
      "ans": 2,
      "fb": "Kafka partitions are assigned unevenly across consumers. A pod assigned more partitions uses more fetch buffer memory and may cache more per-partition state. Configuration is identical but runtime state diverges."
    },
    {
      "level": 3,
      "diff": 1,
      "scenario": 1,
      "q": "Which Actuator metric tells you current heap usage?",
      "opts": [
        "/actuator/health — it reports memory status as part of the overall health check and includes heap utilisation percentage",
        "process.cpu.usage — high CPU correlates directly with high heap usage because GC consumes CPU proportional to heap size",
        "jvm.memory.used (with area=heap tag)",
        "jvm.threads.live — active thread count is a direct proxy for heap usage because each thread allocates objects proportional to its work",
        "hikaricp.connections.active — each active database connection consumes a fixed amount of heap memory that scales with pool size"
      ],
      "ans": 2,
      "fb": "The Micrometer metric jvm.memory.used with tag area=heap reports current heap usage. Query at /actuator/metrics/jvm.memory.used?tag=area:heap. Related: jvm.memory.max shows -Xmx, jvm.memory.committed shows reserved OS memory."
    },
    {
      "level": 3,
      "diff": 2,
      "scenario": 1,
      "q": "jvm.memory.used{area=heap} is stable but jvm.buffer.memory.used is growing. What does this indicate?",
      "opts": [
        "Direct byte buffers (off-heap) are accumulating — commonly from NIO, Kafka, or Netty not releasing buffers",
        "Metaspace is growing due to dynamic class loading, but the metric is mislabelled and actually reports class metadata memory usage",
        "GC is not running frequently enough to reclaim the buffer memory, which should be garbage collected like regular heap objects",
        "A heap memory leak is in progress — jvm.buffer.memory.used is an alternative view of heap allocation that measures buffer objects",
        "Actuator metrics are reporting incorrect values due to a known Micrometer bug that double-counts buffer allocations on recent JDK versions"
      ],
      "ans": 0,
      "fb": "jvm.buffer.memory.used tracks direct byte buffers — memory outside the heap via ByteBuffer.allocateDirect(). Growth while heap is stable indicates off-heap accumulation. This memory counts toward the container limit but not -Xmx."
    },
    {
      "level": 3,
      "diff": 3,
      "scenario": 1,
      "q": "After a load test, hikaricp.connections.active stays at 10 (pool max) and never decreases. hikaricp.connections.pending is 45. What does this tell you?",
      "opts": [
        "All 10 connections are checked out and not being returned (possible leak), while 45 threads are blocked waiting",
        "The pool is too large — 10 connections overwhelm the database, and reducing the pool size to 5 would resolve the pending queue",
        "The database is healthy and processing queries normally — 45 pending threads is expected behaviour during high-throughput load testing",
        "The load test is still running and actively generating the 45 pending requests — wait for the test to complete before drawing conclusions",
        "HikariCP is misconfigured with incorrect connection timeout or validation query settings that prevent connections from being used"
      ],
      "ans": 0,
      "fb": "Active=10 (pool max) with pending=45 means the pool is exhausted. 10 connections are held and 45 threads are queued. If this persists after load stops, it's a connection leak. Check with leakDetectionThreshold."
    },
    {
      "level": 3,
      "diff": 1,
      "scenario": 2,
      "q": "A log shows OutOfMemoryError: Metaspace. What ran out?",
      "opts": [
        "The container's total memory limit was exceeded by the combined JVM process, triggering the kernel OOM killer with a Metaspace label",
        "Thread stack space was exhausted because too many threads were created and their combined stack allocations exceeded available native memory",
        "The JVM heap ran out of space for object allocation — Metaspace is an alternative name for the old generation region of the heap",
        "The area where class definitions and metadata are stored — too many classes loaded",
        "Direct byte buffers allocated via ByteBuffer.allocateDirect() exhausted the available off-heap memory reserved for I/O operations"
      ],
      "ans": 3,
      "fb": "Metaspace stores class metadata. OutOfMemoryError: Metaspace means more classes were loaded than the configured (or default) Metaspace can hold. Common causes: dynamic class generation (CGLIB, reflection, SpEL)."
    },
    {
      "level": 3,
      "diff": 2,
      "scenario": 2,
      "q": "A service throws OutOfMemoryError: unable to create native thread. Heap is 40% full. What is the cause?",
      "opts": [
        "Kafka is creating too many partitions dynamically, and each partition requires a dedicated native thread that cannot be shared across consumers",
        "The OS cannot allocate memory for a new thread stack — either too many threads exist or remaining memory is insufficient for another ~1MB stack",
        "The heap is too small to hold the Thread objects — increasing -Xmx would allow the JVM to create more threads on the heap",
        "GC is not collecting unused Thread objects — threads that have completed their work remain on the heap and block new thread creation",
        "The thread pool is misconfigured with an incorrect rejection policy that throws OutOfMemoryError instead of RejectedExecutionException"
      ],
      "ans": 1,
      "fb": "Each thread needs a stack (~1MB by default). 'Unable to create native thread' means the OS can't allocate more stack memory. With a 1Gi container, 600MB heap, 150MB Metaspace, and 200 existing threads (200MB), only ~50MB remains."
    },
    {
      "level": 3,
      "diff": 3,
      "scenario": 2,
      "q": "OutOfMemoryError: Java heap space occurs during a batch job processing 500K records in a single @Transactional method. The same job worked for 100K records. What is the cause?",
      "opts": [
        "Hibernate's first-level cache holds all 500K entities in memory for the duration of the transaction",
        "The GC algorithm is wrong for batch workloads — G1 cannot handle large sequential processing and should be replaced with Parallel GC",
        "Kafka consumer buffers are consuming too much off-heap memory during the batch, leaving insufficient room for heap allocation of results",
        "The database query is too slow, causing the JDBC driver to buffer 500K rows in native memory while waiting for the result set to complete",
        "The heap is globally too small for any batch job of this size — increase -Xmx proportionally to the number of records being processed"
      ],
      "ans": 0,
      "fb": "Hibernate's first-level (session) cache retains every entity loaded or persisted within a transaction. With 500K entities in a single @Transactional scope, all stay in heap until commit. Fix: flush() and clear() every 1000 records."
    },
    {
      "level": 3,
      "diff": 1,
      "scenario": 3,
      "q": "When reviewing a PR, which of these patterns is a memory risk?",
      "opts": [
        "Creating a new ObjectMapper in a utility method — Jackson's ObjectMapper allocates significant internal caches on each construction call",
        "Using Spring's @Autowired for dependency injection — each injection point creates a new proxy instance that consumes heap permanently",
        "Using Stream.of() for a small collection — the Stream API creates many intermediate objects that cause GC pressure even for small inputs",
        "Using a List<String> as a local variable — local collections are not garbage collected until the enclosing method's scope is exited",
        "Adding entries to a ConcurrentHashMap field based on request data with no size limit"
      ],
      "ans": 4,
      "fb": "A ConcurrentHashMap field that grows based on request data with no size limit is a classic memory leak. Every unique key adds an entry that is never removed. Fix: use a bounded cache (Caffeine with maximumSize) or add eviction."
    },
    {
      "level": 3,
      "diff": 2,
      "scenario": 3,
      "q": "A PR adds @Cacheable('partnerRates') using Spring's default cache. The method returns exchange rates per partner per currency pair. What memory concern should you raise?",
      "opts": [
        "No concern — caching exchange rates is a best practice that reduces database load without any meaningful memory impact on the heap",
        "Spring's default ConcurrentMapCacheManager has no size limit. Many partner x currency combinations will grow the cache indefinitely",
        "@Cacheable always stores entries in off-heap direct byte buffers, so the cache does not consume heap memory and cannot cause OOM",
        "The concern is only cache staleness and stale exchange rates — memory is not an issue because Spring evicts entries after their TTL expires",
        "The concern is thread safety — ConcurrentMapCacheManager is not thread-safe and concurrent access to cached rates will cause corruption"
      ],
      "ans": 1,
      "fb": "With default Spring caching, every unique key becomes a permanent entry. 500 partners x 50 currencies = 25,000 entries. Recommend: configure Caffeine with maximumSize and expireAfterWrite."
    },
    {
      "level": 3,
      "diff": 3,
      "scenario": 3,
      "q": "A PR introduces a new @Async thread pool with corePoolSize=50 and maxPoolSize=200. The service runs in a 1Gi container with -Xmx=600m. What memory concern should you raise?",
      "opts": [
        "@Async pools do not create real OS threads — Spring uses lightweight virtual threads internally that share a single stack allocation",
        "No concern — thread pools are standard practice in Spring Boot and the JVM manages their memory allocation automatically within -Xmx",
        "The concern is only pool exhaustion and task rejection, not memory — thread stacks are allocated from the heap and bounded by -Xmx",
        "200 threads at max x ~1MB stack each = 200MB. Combined with existing threads, heap, and Metaspace, total may exceed 1Gi under load",
        "The concern is CPU contention only, not memory — thread stacks are negligible and 200 threads competing for CPU cores is the real risk"
      ],
      "ans": 3,
      "fb": "Each thread consumes ~1MB stack memory outside the heap. Budget: 600MB heap + 150MB Metaspace + existing 100 threads (100MB) + new pool 200 threads (200MB) = ~1.05GB — exceeds 1Gi. Fix: reduce maxPoolSize, reduce -Xmx, or increase container limit."
    },
    {
      "level": 3,
      "diff": 1,
      "scenario": 4,
      "q": "You need to estimate whether a new service fits within 1Gi. It has: -Xmx=500m, ~150 Tomcat threads, 5 Kafka consumers (30MB fetch buffer each), estimated Metaspace 100MB. Does it fit?",
      "opts": [
        "Yes — 500MB heap + 100MB Metaspace = 600MB total, well within the 1Gi limit with 400MB of comfortable headroom remaining",
        "Impossible to estimate without actually running the service in production and taking a heap dump to measure real memory consumption",
        "Yes — non-heap memory is negligible for a typical Spring Boot service and only the heap size needs to fit within the container limit",
        "No — 500MB heap + 150 stacks (150MB) + 5 Kafka buffers x 30MB x 2 (300MB) + 100MB Metaspace + ~50MB overhead = ~1.1GB",
        "Yes — Kubernetes automatically allocates additional memory beyond the container limit when the JVM process needs non-heap headroom"
      ],
      "ans": 3,
      "fb": "Memory budget: Heap 500MB + Stacks 150MB + Kafka buffers 300MB + Metaspace 100MB + overhead 50MB = ~1.1GB > 1Gi. Options: reduce -Xmx, reduce fetch.max.bytes, reduce Tomcat threads, or increase limit to 1.5Gi."
    },
    {
      "level": 3,
      "diff": 2,
      "scenario": 4,
      "q": "A service currently uses 800MB total in a 1Gi container. A new feature adds 3 @Cacheable methods. How do you assess whether the service still fits?",
      "opts": [
        "Caches are negligible in memory terms — Spring's cache abstraction uses lazy allocation and only stores pointers, not full objects",
        "Take a heap dump from the current service and analyse it in Eclipse MAT before making any estimation about cache memory impact",
        "Increase -Xmx by the estimated total cache size so the heap can accommodate the new entries without affecting existing working set",
        "Estimate cache sizes: number of unique keys x size per entry x 3 caches, then add to 800MB. If total exceeds 1Gi, increase limit or bound the caches",
        "Just deploy the change to a staging environment and observe the memory behaviour — theoretical estimation is unreliable for caches"
      ],
      "ans": 3,
      "fb": "Cache memory is heap memory. Estimate: if each cache holds 10K entries at 500 bytes = ~5MB per cache, 15MB total — fine. But 100K entries at 50KB each = 500MB+ — not fine. Always calculate worst-case and configure bounded caches."
    },
    {
      "level": 1,
      "diff": 1,
      "scenario": 0,
      "q": "In Grafana, the 'Used Heap' panel shows the heap dropping to near zero right after a new deployment. What is the most likely explanation?",
      "opts": [
        "GC tuning was changed in the new deployment to be more aggressive, causing immediate collection that cleared accumulated objects",
        "A memory leak that was present in the previous version was fixed in this deployment, resulting in the heap dropping to healthy levels",
        "The pod restarted as part of the deploy, so the new JVM started fresh",
        "The service is idle and receiving no traffic after the deployment, so no objects are being allocated to the heap region",
        "The Grafana dashboard panel is broken and showing stale data from before the deployment rather than the current heap state"
      ],
      "ans": 2,
      "fb": "After a deploy, pods are recreated. A new JVM starts with an almost-empty heap and grows as work is processed. This is expected baseline behaviour, not a leak fix or GC tuning effect."
    },
    {
      "level": 1,
      "diff": 1,
      "scenario": 0,
      "q": "Which Grafana panel is the best starting point if you want to know whether a Spring Boot pod is healthy from a memory standpoint?",
      "opts": [
        "Network traffic panel — high network throughput correlates directly with memory pressure because incoming data must be buffered in heap",
        "Used Heap and GC pause panels for that pod",
        "CPU usage panel — elevated CPU is the primary indicator of memory problems because GC consumes CPU proportional to heap pressure",
        "Cloud SQL connections panel — database connection count directly reflects how much memory the JVM is consuming for driver state",
        "Pod restart count only — if the restart count is zero, the pod's memory is healthy regardless of what heap metrics show"
      ],
      "ans": 1,
      "fb": "Used Heap shows whether memory is climbing or oscillating, and GC pauses show whether collection is keeping up. Together they give the most direct view of JVM memory health. The other panels are useful but not memory-specific."
    },
    {
      "level": 1,
      "diff": 2,
      "scenario": 0,
      "q": "A Grafana 'Used Heap' panel shows a sawtooth that slowly steps higher each cycle: each trough is a bit higher than the last over 12 hours. What is this pattern called and what does it suggest?",
      "opts": [
        "A slow memory leak — the baseline of retained objects is growing",
        "Container OOM is imminent due to CPU throttling — the JVM cannot run GC fast enough when CPU is being restricted by the cgroup",
        "Cache pre-loading is populating the heap gradually as the service encounters new data patterns and stores them for future reuse",
        "JIT warm-up is consuming more heap as the JIT compiler promotes interpreted methods to compiled native code over the 12-hour window",
        "Healthy GC behaviour — the rising baseline is normal as the JVM commits more heap over time to match the growing application workload"
      ],
      "ans": 0,
      "fb": "A pure sawtooth at a flat baseline is healthy. When the baseline rises trough-over-trough, GC is running but cannot reclaim everything — long-lived references are accumulating. This is the classic shape of a slow leak."
    },
    {
      "level": 1,
      "diff": 2,
      "scenario": 0,
      "q": "Two pods of the same service are shown side by side in Grafana. Pod A heap oscillates between 30-60%. Pod B heap sits flat at 85% with no oscillation. What is the most useful first observation?",
      "opts": [
        "Pod B has more traffic routed to it by the load balancer, which explains the higher steady-state heap utilisation without oscillation",
        "They are equivalent in health — different pods naturally show different heap patterns depending on request timing and GC scheduling",
        "Pod A is restarting more often due to OOMKills, causing the sawtooth pattern as the heap is cleared and rebuilt after each restart",
        "Pod B is not garbage-collecting effectively or is under memory pressure — the lack of oscillation is suspicious",
        "Pod B is healthier because the flat line indicates stable, predictable memory usage with minimal GC overhead compared to Pod A"
      ],
      "ans": 3,
      "fb": "Healthy heaps oscillate as objects are allocated and reclaimed. A flat high line means GC cannot bring usage down — either retained objects are dominating or the heap is too small for the working set. It deserves investigation."
    },
    {
      "level": 1,
      "diff": 3,
      "scenario": 0,
      "q": "You are looking at a Grafana panel for 'JVM heap committed' (not used). Committed sits at 1Gi and never moves, while 'Used' oscillates from 200MB to 800MB. A teammate worries the JVM is hoarding memory. What is the correct interpretation?",
      "opts": [
        "Used should equal committed for healthy services — a large gap between the two indicates wasted memory that needs GC tuning to reclaim",
        "The JVM is leaking 1Gi of memory because the committed heap is not being released back to the operating system after GC collects objects",
        "The container limit is set too high — reduce it closer to the actual used heap to save cluster resources and improve scheduling density",
        "GC is broken because committed is constant — a working collector would release committed memory back to the OS after each collection cycle",
        "Committed heap is the memory the JVM has reserved from the OS — it normally grows to -Xmx and does not shrink. This is expected."
      ],
      "ans": 3,
      "fb": "Committed memory is the OS-backed heap the JVM has claimed. By default the JVM does not give it back even when used drops. Only Used heap reflects live allocations. Hoarding committed memory up to -Xmx is normal."
    },
    {
      "level": 1,
      "diff": 3,
      "scenario": 0,
      "q": "In a Grafana panel labelled 'GC throughput', a value drops from 99% to 85%. What does this mean?",
      "opts": [
        "GC ran 85 times during the sampling interval, which represents an increase in collection frequency compared to the baseline of 99 collections",
        "GC paused the application for a total of 85ms during the interval, representing the cumulative stop-the-world time across all collections",
        "85% of all heap objects survived the last garbage collection cycle, indicating a high survival rate and potential old generation pressure",
        "85% of the total heap capacity is currently occupied by live objects, leaving only 15% free for new allocations before GC must run",
        "The application is running 85% of the time and GC is taking 15% of CPU time"
      ],
      "ans": 4,
      "fb": "GC throughput is the percentage of wall-clock time the application spent doing real work versus garbage collecting. Dropping from 99% to 85% means GC overhead grew significantly — usually a sign of pressure or oversized survivor traffic."
    },
    {
      "level": 1,
      "diff": 1,
      "scenario": 1,
      "q": "Where should you first look to confirm that a pod was OOM-killed rather than crashed for another reason?",
      "opts": [
        "The application's error logs only — search for OutOfMemoryError entries which are always written before any OOMKill event occurs",
        "The Grafana CPU panel — OOMKill events appear as CPU spikes because the kernel uses CPU to terminate the container process",
        "The Cloud SQL logs — if the database driver detected memory pressure, it logs the OOMKill reason in the connection audit trail",
        "The Kafka consumer lag panel — an OOMKill causes consumer lag to spike, confirming the pod was killed rather than gracefully shut down",
        "kubectl describe pod — look for the Last State 'Terminated' with Reason 'OOMKilled' and exit code 137"
      ],
      "ans": 4,
      "fb": "kubectl describe pod (or the Kubernetes UI equivalent) is authoritative. The Reason field will say OOMKilled and the exit code will be 137 when the kernel killed the container for exceeding its memory limit."
    },
    {
      "level": 1,
      "diff": 1,
      "scenario": 1,
      "q": "A pod's status reads 'CrashLoopBackOff' and the previous container exited with code 137. Which statement is correct?",
      "opts": [
        "The Kubernetes scheduler intentionally evicted the pod to rebalance workload across nodes and it will be rescheduled shortly",
        "Exit code 137 means the JVM performed a graceful shutdown via the SIGTERM handler and wrote all pending logs before exiting",
        "The application threw an unhandled NullPointerException that propagated to the main thread and caused the JVM to exit with error code 137",
        "The container was OOM-killed and Kubernetes is restarting it with backoff",
        "The pod's container image is corrupted or incompatible with the GKE node's container runtime, causing a startup failure on each attempt"
      ],
      "ans": 3,
      "fb": "Exit 137 = SIGKILL by the kernel OOM killer. CrashLoopBackOff is Kubernetes' response: restart with increasing delay. This pattern almost always points to a memory budget problem, not application logic."
    },
    {
      "level": 1,
      "diff": 2,
      "scenario": 1,
      "q": "A teammate says 'the JVM throws OutOfMemoryError when the pod is OOMKilled'. Why is this incorrect?",
      "opts": [
        "OOMKill is the Linux kernel killing the container externally — the JVM does not get a chance to detect or log anything",
        "Exit code 137 always corresponds to a Java OutOfMemoryError — the kernel translates the JVM's error into exit code 128 + 9",
        "OutOfMemoryError is the JVM's response to CPU exhaustion, not memory exhaustion — OOMKill is the actual memory-related event",
        "The JVM writes OOMKill events to /var/log/jvm-oomkill.log before the process terminates, providing a record of the kernel action",
        "Spring Boot intercepts the OOMKill signal via a shutdown hook and logs the event before the container is terminated by the kernel"
      ],
      "ans": 0,
      "fb": "OOMKill is enforced by the Linux kernel via cgroup limits. When triggered, the process receives SIGKILL and terminates immediately with no chance to flush logs or throw a Java exception. OutOfMemoryError is an entirely separate, JVM-internal mechanism."
    },
    {
      "level": 1,
      "diff": 2,
      "scenario": 1,
      "q": "After an OOMKill event, what minimum information should you collect before escalating to a senior engineer?",
      "opts": [
        "Pod name, namespace, time of kill, exit code, container limits, -Xmx setting, and a screenshot of the heap and container memory panels around the event",
        "Just the exit code from kubectl describe pod — a senior engineer can determine the root cause from exit code 137 alone without context",
        "Pod name only — the senior engineer can look up all other details from the pod name using internal tooling and observability systems",
        "Only the application error logs — the JVM always writes the root cause of an OOMKill to the application log before the process dies",
        "Only the heap dump file — if HeapDumpOnOutOfMemoryError was configured, the dump contains all the information needed for diagnosis"
      ],
      "ans": 0,
      "fb": "A senior engineer needs context to triage quickly. The pod identity, the timing, the limits and JVM flags, and a graph of memory leading up to the kill let them tell at a glance whether it's a sizing problem, a leak, or a load spike."
    },
    {
      "level": 1,
      "diff": 3,
      "scenario": 1,
      "q": "A pod is OOMKilled. The heap usage at the time of death was at only 40% of -Xmx. Which conclusion is most reasonable?",
      "opts": [
        "The pod was not really killed — exit code 137 can also be generated by Kubernetes during normal rolling deployments as a graceful shutdown signal",
        "The heap metric was stale and the heap was actually full — Grafana's scrape interval missed the spike that occurred right before the kill",
        "The OOMKill was a false positive caused by a known Linux kernel bug in cgroup v2 that over-reports memory usage in containerised workloads",
        "Non-heap memory (Metaspace, thread stacks, direct buffers, native) plus heap exceeded the container limit",
        "The Linux kernel OOM killer incorrectly targeted this container — cgroup enforcement has known race conditions that produce false kills"
      ],
      "ans": 3,
      "fb": "A pod can be OOMKilled while the heap is healthy — the container limit covers the entire process. If non-heap regions grew (more threads, more direct buffers, more loaded classes), total RSS can exceed the limit even when heap is fine."
    },
    {
      "level": 1,
      "diff": 1,
      "scenario": 2,
      "q": "Which Kubernetes manifest field sets the maximum memory the container is allowed to use?",
      "opts": [
        "env.JAVA_OPTS — this environment variable controls both the JVM heap and the container memory ceiling enforced by the kernel",
        "resources.requests.memory — this is the hard memory cap enforced by the Linux kernel that kills the container when exceeded",
        "resources.limits.memory",
        "spec.replicas — the replica count determines the per-pod memory allocation by dividing the total deployment memory budget evenly",
        "containers[0].image — the container image specification includes an embedded memory limit that the runtime enforces automatically"
      ],
      "ans": 2,
      "fb": "resources.limits.memory is the cgroup hard cap. requests.memory is what the scheduler reserves and uses for placement, but it does not cap usage. JAVA_OPTS contains JVM flags but does not control container limits."
    },
    {
      "level": 1,
      "diff": 1,
      "scenario": 2,
      "q": "What does the JVM flag -XX:MaxRAMPercentage=70 do?",
      "opts": [
        "Sets the survivor ratio in the young generation to 70%, controlling how much space is reserved for objects that survive minor GC collections",
        "Tells the JVM to size -Xmx as 70% of the available container memory",
        "Reserves 70% of the container's memory for operating system processes, leaving only 30% available for the JVM to use for heap",
        "Sets the JIT code cache size to 70% of total RAM, allowing the compiler to store more optimised native code in memory",
        "Caps the GC overhead at 70% of CPU time — if GC exceeds this percentage, the JVM throws GC overhead limit exceeded error"
      ],
      "ans": 1,
      "fb": "MaxRAMPercentage is the modern, container-aware way to set heap size. With UseContainerSupport on, the JVM reads the cgroup limit and computes -Xmx as that percentage. It is the standard alternative to hard-coding -Xmx."
    },
    {
      "level": 1,
      "diff": 2,
      "scenario": 2,
      "q": "A deployment uses '-XX:MaxRAMPercentage=80' with no explicit -Xmx, and resources.limits.memory: 2Gi. Approximately how much heap will the JVM allocate at most, and is that safe?",
      "opts": [
        "Cannot be predicted without running the service — MaxRAMPercentage interacts with JVM ergonomics in unpredictable ways per deployment",
        "About 1.6Gi — leaves only ~400MB for non-heap, which may or may not be enough depending on threads, buffers, and Metaspace",
        "About 200MB — MaxRAMPercentage limits the heap to a small fraction of the container memory to preserve room for the operating system",
        "About 800MB — the JVM applies MaxRAMPercentage after subtracting Metaspace and thread stack estimates from the container limit",
        "About 2Gi — MaxRAMPercentage is applied on top of the container limit, so the full 2Gi is available for heap regardless of the percentage"
      ],
      "ans": 1,
      "fb": "80% of 2Gi is 1.6Gi for the heap, leaving roughly 400MB for everything else (Metaspace, thread stacks, direct buffers, JIT code cache, native). Whether that is safe depends on the service profile — for a busy service it can be tight."
    },
    {
      "level": 1,
      "diff": 2,
      "scenario": 2,
      "q": "A deployment manifest contains '-Xms2g -Xmx2g'. What does setting -Xms equal to -Xmx achieve?",
      "opts": [
        "Forces the JVM to commit the full heap immediately at startup, avoiding gradual growth and resize pauses",
        "Saves CPU by telling the JVM it does not need to run GC at all because the initial and maximum heap are already the same size",
        "Makes the heap shrink dynamically below 2GB when usage drops, returning unused memory to the operating system for other processes",
        "Disables GC entirely because the JVM interprets equal -Xms and -Xmx as an instruction to operate without garbage collection",
        "Doubles the heap to 4GB total by allocating both the initial and maximum amounts as separate, additive memory regions"
      ],
      "ans": 0,
      "fb": "Setting -Xms equal to -Xmx fixes the heap size from start. The OS is asked for the full amount up front, eliminating heap-growth resize work and producing more predictable behaviour, especially in containers where bursty growth can collide with limits."
    },
    {
      "level": 1,
      "diff": 3,
      "scenario": 2,
      "q": "You see only '-Xmx512m' in a deployment with no -Xms, no MaxRAMPercentage, and no UseContainerSupport-related flag. The container limit is 1Gi and the JVM is OpenJDK 17. What is true?",
      "opts": [
        "The pod cannot start because the JVM requires an explicit UseContainerSupport flag when running inside a Kubernetes container",
        "Java 17 cannot read cgroup limits natively — it requires a third-party agent or Docker-specific JVM build to detect container boundaries",
        "UseContainerSupport is on by default in Java 17, so the JVM is container-aware regardless",
        "-Xmx is overridden by the container limit because Kubernetes injects the cgroup ceiling into the JVM's memory configuration at startup",
        "The JVM will ignore the container limit entirely and size its heap based on the host node's total physical memory instead of cgroups"
      ],
      "ans": 2,
      "fb": "Since Java 8u191 and especially in Java 11+, -XX:+UseContainerSupport is the default. The JVM reads the cgroup limit automatically. An explicit -Xmx still wins over computed defaults if set."
    },
    {
      "level": 1,
      "diff": 1,
      "scenario": 3,
      "q": "What is JIT compilation?",
      "opts": [
        "Kubernetes injecting bytecode into the container at deploy time to instrument the application for service mesh and tracing support",
        "Liquibase executing database migrations by compiling SQL change sets into optimised execution plans during application startup",
        "Spring Boot generating CGLIB proxies for all beans at startup by compiling new bytecode classes for dependency injection wiring",
        "The JVM converting hot bytecode methods into optimised native machine code while the app runs",
        "The JVM compiling Java source files (.java) into bytecode (.class files) at runtime when they are first loaded from the classpath"
      ],
      "ans": 3,
      "fb": "Just-In-Time compilation watches which methods run frequently ('hot') and compiles them from bytecode to native code, with optimisations. This is why a JVM gets faster after running for a while — and why fresh pods are slower at first."
    },
    {
      "level": 1,
      "diff": 1,
      "scenario": 3,
      "q": "Why does a freshly started Spring Boot pod respond slower to its first few requests than an established pod?",
      "opts": [
        "Spring Boot has a known startup performance bug that causes the first few requests to be slow regardless of JVM configuration or warm-up",
        "The pod has a memory leak that manifests during the initial request burst and resolves itself once the heap stabilises after warm-up",
        "Kafka is throttling the consumer during startup because the consumer group is rebalancing and the broker limits fetch throughput",
        "The container has slow disk I/O on the GKE node, causing class loading from the filesystem to bottleneck request processing initially",
        "The JVM is in interpreted mode for hot paths until JIT compiles them, caches are empty, and connection pools may not be fully established"
      ],
      "ans": 4,
      "fb": "Cold start latency is the combined effect of JIT not yet compiling hot methods, application caches being empty, and pools (HikariCP, Kafka client) not yet warmed. After a few thousand requests the JVM stabilises and latency settles."
    },
    {
      "level": 1,
      "diff": 2,
      "scenario": 3,
      "q": "A team adds a more aggressive readiness probe that hits /actuator/health every 2 seconds during the first minute. They expect this to make pods 'ready faster'. Why does this not actually warm up the JVM?",
      "opts": [
        "Probes are blocked by the GKE firewall rules during the first minute, preventing them from reaching the health endpoint on the pod",
        "Readiness probes run on a separate JVM process inside the container and do not share JIT compilation state with the main application",
        "Actuator endpoints don't exercise business code paths, so JIT and caches don't get warmed for the methods that matter",
        "Spring Boot ignores readiness probes during the first 60 seconds and only begins responding to them after the startup grace period",
        "Probes only check disk availability and filesystem health — they do not exercise any in-memory state or JVM code paths at all"
      ],
      "ans": 2,
      "fb": "Readiness probes only verify a pod is ready to receive traffic. JIT compiles the methods that actually run, and your real endpoints are different from /actuator/health. A meaningful warm-up needs the real handlers to run."
    },
    {
      "level": 1,
      "diff": 2,
      "scenario": 3,
      "q": "A pod's first response after startup takes 4 seconds, while subsequent ones take 80ms. Which warm-up factor is most likely contributing?",
      "opts": [
        "JIT compilation alone — the JVM runs the first request entirely in interpreted mode and compiles all methods to native code during that single call",
        "Cloud SQL is slow to respond to the first query because the database connection requires TLS negotiation and authentication on initial connect",
        "DNS resolution for the first request takes multiple seconds as the container's DNS cache is empty and must query the cluster DNS service",
        "Kafka consumer rebalancing blocks the HTTP thread pool during startup, preventing the first request from being processed for several seconds",
        "Class loading and Spring bean initialisation triggered lazily on the first request"
      ],
      "ans": 4,
      "fb": "Lazy initialisation is a common cold-path cost. Many Spring components only fully initialise when first accessed (DataSource connection, message converters, security filters). The first request pays this one-time cost; later requests do not."
    },
    {
      "level": 1,
      "diff": 3,
      "scenario": 3,
      "q": "A team wants to reduce cold start latency on GKE without changing the application. Which approach is most likely to help?",
      "opts": [
        "Disable JIT entirely with -Xint so the JVM does not spend time compiling methods during startup, eliminating the JIT overhead cost",
        "Increase the readiness probe initial delay so probes do not run too early — this does not speed up the JVM but avoids false failures",
        "Set the CPU limit lower to reduce the GKE node cost, allowing more replicas to be started simultaneously for faster overall availability",
        "Use a startup probe to give the JVM time to warm before liveness/readiness checks become active, and consider class-data sharing",
        "Reduce -Xmx significantly so the JVM has less memory to initialise, which decreases the time spent on heap reservation during startup"
      ],
      "ans": 3,
      "fb": "Startup probes were designed for slow-starting applications. Combined with class-data sharing or AppCDS, they let the JVM finish initialising without being killed by aggressive liveness probes — both classic JVM cold start helpers."
    },
    {
      "level": 1,
      "diff": 1,
      "scenario": 4,
      "q": "In simple terms, what is the JVM heap?",
      "opts": [
        "The region of memory where Java objects are allocated and managed by the garbage collector",
        "The disk storage used by the container for persisting application data, logs, and temporary files during runtime",
        "The CPU cache — a hardware memory region that the JVM uses to store frequently accessed bytecode instructions for faster execution",
        "Metaspace — the native memory region where class metadata, method bytecode, and JVM runtime structures are stored outside the heap",
        "The thread stack — a per-thread memory region that holds local variables, method parameters, and return addresses for each call frame"
      ],
      "ans": 0,
      "fb": "The heap is the memory area where every Java object instance lives. Garbage collection only operates on the heap. Other memory areas (stack, Metaspace, native) exist for different purposes."
    },
    {
      "level": 1,
      "diff": 1,
      "scenario": 4,
      "q": "What happens when a Java method is called?",
      "opts": [
        "GC runs a minor collection to free heap space for the method's local variables and intermediate results before execution begins",
        "A stack frame is pushed onto the calling thread's stack — local variables and the return address live there",
        "A new pod is started by Kubernetes to handle the method call, distributing workload across the cluster automatically",
        "Metaspace expands to accommodate the method's bytecode and metadata, which are loaded from the class file on each invocation",
        "A new heap region is created specifically for the method's object allocations, isolated from other methods' memory areas"
      ],
      "ans": 1,
      "fb": "Each Java thread has its own stack. A method call pushes a frame onto that stack containing local variables and bookkeeping. When the method returns the frame is popped. Recursion that grows too deep leads to StackOverflowError."
    },
    {
      "level": 1,
      "diff": 2,
      "scenario": 4,
      "q": "A teammate says 'a StackOverflowError happens when the heap is full'. Why is this wrong?",
      "opts": [
        "Heap and stack are the same memory region — StackOverflowError is just an alternative name for OutOfMemoryError: Java heap space",
        "StackOverflowError only occurs at compile time when the Java compiler detects that the code contains recursive calls that exceed limits",
        "StackOverflowError is unrelated to heap — it occurs when a thread's stack runs out of space, usually from excessive recursion",
        "StackOverflowError is a CPU error that occurs when the thread scheduler runs out of CPU time slices for the current executing thread",
        "StackOverflowError means the container's ephemeral storage disk is full, preventing the JVM from writing temporary stack data to disk"
      ],
      "ans": 2,
      "fb": "Stack memory is per-thread, separate from the heap. StackOverflowError is the JVM telling you a thread used more frames than fit in its stack — almost always unbounded recursion. The heap can be 99% empty at the same time."
    },
    {
      "level": 1,
      "diff": 2,
      "scenario": 4,
      "q": "Which of these objects lives on the heap?",
      "opts": [
        "A method return address — it is allocated on the heap so the JVM can look up where to continue after the method completes execution",
        "A stack frame — each method invocation creates a frame object on the heap that holds all local variables and execution context",
        "A loop counter — primitive loop variables like int i = 0 are stored on the heap because they may outlive the method's stack frame",
        "A new ArrayList<String> created by a service method",
        "A primitive int local variable in a method — all local variables including primitives are stored on the heap for GC management"
      ],
      "ans": 3,
      "fb": "Object instances created via 'new' are heap-allocated. Primitive locals and stack frames live on the thread stack. Distinguishing where things live is the foundation of reasoning about GC and OOM."
    },
    {
      "level": 1,
      "diff": 3,
      "scenario": 4,
      "q": "A senior engineer says 'most of our garbage is short-lived, so generational GC works well'. What does generational GC mean in practice?",
      "opts": [
        "Generations refer to JVM versions — each major Java release uses a different GC algorithm, and the generational label tracks which version introduced it",
        "All objects are treated equally by the collector — generational refers to the number of times GC has scanned the heap since the JVM started",
        "The heap is split into pods — each Kubernetes pod gets its own generation of the heap that is collected independently by the node's GC process",
        "GC runs once per generation of the codebase — each deployment triggers a full garbage collection cycle to clean up objects from the previous version",
        "The JVM groups objects by age — most allocations die young in the young generation, so GC focuses there with cheap, frequent collections"
      ],
      "ans": 4,
      "fb": "Generational GC is built on the empirical observation that most objects die young. The JVM allocates new objects in a young generation, collects it cheaply and often, and only promotes long-lived survivors to the old generation, where collection is more expensive."
    },
    {
      "level": 1,
      "diff": 1,
      "scenario": 4,
      "q": "What is Metaspace in the JVM?",
      "opts": [
        "A native (non-heap) memory region storing class metadata, method bytecode, and runtime structures",
        "A Kubernetes feature that provides shared metadata storage across pods in the same namespace for service discovery and configuration",
        "Spring Boot's internal bean cache where all singleton beans are stored alongside their dependency injection metadata and proxy classes",
        "Disk-backed swap space that the JVM uses to page out infrequently accessed heap objects to the container's ephemeral storage volume",
        "A faster heap region optimised for short-lived objects that bypasses garbage collection entirely by using direct memory allocation"
      ],
      "ans": 0,
      "fb": "Metaspace stores class definitions, method information, and runtime metadata. It lives in native memory, not the heap, and grows as classes are loaded. Apps that load many classes dynamically can exhaust Metaspace independently of heap."
    },
    {
      "level": 1,
      "diff": 2,
      "scenario": 0,
      "q": "On a Grafana panel, 'GC pause time per minute' has been climbing slowly over a week from 200ms/min to 1.2s/min. The 'Used Heap' baseline is also climbing. What does this combination suggest?",
      "opts": [
        "The Grafana panel is broken and displaying inaccurate data — GC pause time metrics are known to drift over time without a dashboard refresh",
        "Better GC tuning is taking effect — the JVM is optimising its GC behaviour over time, which naturally increases pause time measurements",
        "Too much CPU is allocated to the pod, allowing GC to run more aggressively and produce longer individual pauses between collections",
        "A healthy increase in traffic volume is causing more object allocations, which is normal and expected for a service under growing load",
        "A slow heap leak: more retained objects mean GC has more to scan and runs longer per minute"
      ],
      "ans": 4,
      "fb": "As retained live data grows, GC has more to mark and copy. Both pause time and frequency tend to climb together. Combined with a rising heap baseline, this is the canonical leak pattern."
    },
    {
      "level": 1,
      "diff": 3,
      "scenario": 1,
      "q": "You receive an alert: 'Pod restart count > 0 for service X'. The first thing you check is exit code, which is 0, and Kubernetes Reason 'Completed'. Is this an OOMKill?",
      "opts": [
        "Cannot tell from exit code and reason alone — you need to check the heap utilisation at the time of the restart to confirm or rule out OOM",
        "Yes if the heap was full at the time — exit code 0 is how the kernel reports an OOMKill when the heap was the specific cause of exhaustion",
        "Yes — exit code 0 sometimes indicates OOM when the JVM handles the OutOfMemoryError gracefully and performs a clean shutdown before dying",
        "Yes — all pod restarts are OOMKills regardless of exit code, because Kubernetes only restarts containers when they exceed memory limits",
        "No — exit code 0 with Reason Completed means the container exited normally, which is unusual but not OOM"
      ],
      "ans": 4,
      "fb": "OOMKill is exit 137 with Reason OOMKilled. Exit 0 with Completed means the main process returned normally, which for a long-running service usually means the entrypoint script finished — a configuration bug, not memory."
    },
    {
      "level": 1,
      "diff": 3,
      "scenario": 2,
      "q": "A service has resources.requests.memory: 512Mi and resources.limits.memory: 2Gi. Which is true about how the JVM, with -XX:MaxRAMPercentage=75, sizes the heap?",
      "opts": [
        "It is unaffected by container settings — MaxRAMPercentage uses the host node's total physical memory for its calculation regardless of cgroups",
        "It uses 100% of the requests value because the JVM reads resources.requests.memory as the available memory for heap sizing calculations",
        "It uses 75% of requests = 384MB, because the JVM treats the request value as the available memory limit for MaxRAMPercentage calculations",
        "It uses 75% of limits = 1.5Gi",
        "It uses 75% of the GKE node's total physical memory, ignoring both container requests and limits in the cgroup configuration"
      ],
      "ans": 3,
      "fb": "With UseContainerSupport, the JVM reads the cgroup limit (limits.memory) for sizing decisions, not the request. With 2Gi limit and 75% percentage, -Xmx becomes ~1.5Gi. requests.memory affects scheduling but not the JVM."
    },
    {
      "level": 1,
      "diff": 2,
      "scenario": 0,
      "q": "Which memory observation in Grafana is most likely a normal cold-start artefact, not a problem?",
      "opts": [
        "The first 60 seconds after a deploy show a brief spike in heap committed and GC activity that then settles",
        "Steady upward heap drift over 24 hours with each GC trough slightly higher than the last, indicating a growing retained object baseline",
        "Repeated OOMKill events with exit code 137 occurring every few hours, showing the container is consistently exceeding its memory limit",
        "A one-hour flat-line at 95% heap utilisation with no GC oscillation, indicating the heap is nearly full and GC cannot reclaim space",
        "GC pause times exceeding 2 seconds per collection, indicating the heap is too large or the collector cannot keep up with live data"
      ],
      "ans": 0,
      "fb": "During startup, the JVM allocates initial structures, loads classes, and JIT-compiles hot paths — all of which produce a brief activity spike that settles quickly. Persistent drift, sustained high usage, OOMKills, and multi-second pauses are not normal."
    },
    {
      "level": 1,
      "diff": 2,
      "scenario": 4,
      "q": "You see 'OutOfMemoryError: GC overhead limit exceeded'. What does this specific message mean?",
      "opts": [
        "Native memory allocated via Unsafe.allocateMemory() is exhausted and the JVM cannot allocate more off-heap memory for internal operations",
        "The JVM is spending more than ~98% of CPU time in GC while reclaiming less than 2% of heap — effectively the application is making no progress",
        "Metaspace is full because too many classes were loaded and the MaxMetaspaceSize limit was reached, preventing further class loading",
        "The same as OutOfMemoryError: Java heap space — both errors indicate the heap is completely full and GC cannot free any space",
        "The GC worker threads themselves crashed due to a JVM bug, leaving the heap without an active collector to manage memory reclamation"
      ],
      "ans": 1,
      "fb": "This message indicates a heap that is technically not full, but where GC churns continuously trying to free space. The JVM gives up rather than letting the app crawl forever. It usually points to a leak or grossly undersized heap."
    },
    {
      "level": 2,
      "diff": 1,
      "scenario": 0,
      "q": "Which of these is a non-heap JVM memory region you must include when sizing a container?",
      "opts": [
        "Cloud SQL storage — the database's disk allocation counts toward the container's memory limit because the Cloud SQL Auth Proxy runs in-process",
        "Pod IP table — the Kubernetes networking stack allocates memory inside each container's cgroup for IP routing and iptables rules",
        "Kubernetes API memory — the kubelet reserves a portion of each container's memory limit for API server communication and watch streams",
        "Container image layers — the filesystem layers of the Docker image are loaded into memory and count toward the container's cgroup limit",
        "Metaspace"
      ],
      "ans": 4,
      "fb": "Metaspace is part of the JVM process memory but lives outside the heap. Together with thread stacks, direct byte buffers, JIT code cache, and native allocations, it must fit alongside -Xmx within the container limit."
    },
    {
      "level": 2,
      "diff": 1,
      "scenario": 0,
      "q": "A service uses 100 Tomcat threads. Approximately how much memory do thread stacks alone consume?",
      "opts": [
        "About 10MB — thread stacks are very compact because they only store a few pointers and the stack size per thread is around 100KB",
        "About 100MB (each stack is about 1MB by default)",
        "About 10GB — each Tomcat thread allocates approximately 100MB of native memory for its stack, request buffers, and NIO channels",
        "About 1GB — each thread stack defaults to 10MB on modern JVMs because of the deep call stacks typical in Spring Boot applications",
        "Negligible — thread stacks are allocated on the heap and are already accounted for in the -Xmx setting, not separate native memory"
      ],
      "ans": 1,
      "fb": "Default thread stack size on most JVMs is around 1MB (-Xss). 100 threads → roughly 100MB just in stack space, separate from the heap. Services with very high thread counts can spend hundreds of MB on stacks alone."
    },
    {
      "level": 2,
      "diff": 2,
      "scenario": 0,
      "q": "A new microservice will run with a 2Gi container limit, expects ~150 Tomcat threads, ~20 HikariCP connections, ~100MB Metaspace, and ~150MB direct byte buffers. What is a reasonable -Xmx?",
      "opts": [
        "2Gi — the heap should equal the container limit so the JVM can use all available memory for object allocation without wasting any",
        "800MB — conservatively set -Xmx to 40% of the container limit to leave maximum headroom for non-heap regions and safety margin",
        "About 1.4Gi — leaves headroom for ~150MB stacks + 100MB Metaspace + 150MB buffers + JIT code cache and native overhead",
        "1.6Gi — set -Xmx to 80% of the container limit which is the standard best practice for all Spring Boot services regardless of thread count",
        "256MB — in a 2Gi container, most of the memory should be reserved for non-heap regions and the heap should be kept minimal"
      ],
      "ans": 2,
      "fb": "Add up non-heap: 150MB (stacks) + 100MB (Metaspace) + 150MB (direct buffers) + ~80MB (JIT code cache) + native overhead ≈ 500–600MB. Heap should fit in the remaining ~1.4Gi. Setting -Xmx=2Gi would leave no room and OOMKill on first load."
    },
    {
      "level": 2,
      "diff": 2,
      "scenario": 0,
      "q": "A team complains their service OOMKills after they doubled max connections in HikariCP from 10 to 20 — but heap utilisation is unchanged. Why?",
      "opts": [
        "CPU limit is too low — more connections require more CPU for connection management, and throttling causes the process to be killed",
        "The probes are misconfigured — doubling the pool size causes HikariCP's validation queries to overwhelm the health check endpoint",
        "The connections are not being closed properly — the old 10 connections are leaked alongside the new 20, creating 30 total open connections",
        "More connections means more direct buffers and per-connection state, plus driver native allocations — non-heap memory grew without affecting heap",
        "HikariCP allocates all connection state on the heap — doubling connections doubled the heap usage but the dashboard metric is stale"
      ],
      "ans": 3,
      "fb": "Each open JDBC connection holds driver-side state, network buffers, and possibly OS file descriptors. Doubling connections grows non-heap memory without changing heap utilisation. If headroom was tight, this is enough to push past the container limit."
    },
    {
      "level": 2,
      "diff": 3,
      "scenario": 0,
      "q": "Two services share a 1.5Gi container limit. Service A is single-threaded batch (8 threads). Service B is reactive with hundreds of small worker threads (300). They have identical -Xmx. Which is more likely to OOMKill, all else equal?",
      "opts": [
        "Neither will be OOMKilled — both services have the same -Xmx and container limit, so they have identical memory consumption profiles",
        "Service A — batch workloads process larger data sets and hold more objects in heap memory during each batch cycle than reactive services",
        "Whichever has more CPU allocated — CPU limits determine how much memory the JVM can use because GC throughput depends on CPU availability",
        "Both equally likely — thread count does not affect memory consumption because thread stacks are allocated from the heap, not native memory",
        "Service B — its thread count alone consumes ~300MB of stack space, eating into the same headroom"
      ],
      "ans": 4,
      "fb": "Thread stack memory scales linearly with thread count. 300 threads × ~1MB = ~300MB consumed before any heap is touched. With identical -Xmx, Service B has far less headroom for non-heap and is more likely to be killed."
    },
    {
      "level": 2,
      "diff": 1,
      "scenario": 1,
      "q": "What is the practical reason for the '-Xmx ≈ 60–70% of container limit' rule of thumb?",
      "opts": [
        "Java runs faster at 70% heap utilisation — the JVM's garbage collector is optimised to perform best when 30% of the heap is always free",
        "It is a Kubernetes requirement enforced by the admission controller — pods with -Xmx above 70% of their limit are rejected at deploy time",
        "CPU limits are tied to memory limits in Kubernetes — the scheduler allocates CPU proportionally and 70% ensures correct CPU allocation",
        "GC requires 30% of the heap as internal headroom for copying and compacting objects during collection cycles to avoid pauses",
        "Non-heap memory (Metaspace, thread stacks, direct buffers, JIT cache, native) typically needs 30–40% of the budget"
      ],
      "ans": 4,
      "fb": "The non-heap budget needs real space. A 60–70% heap leaves 30–40% for the rest of the JVM process. It is a starting heuristic, not an absolute — services with many threads may need more headroom, lean services may safely use a bit more."
    },
    {
      "level": 2,
      "diff": 2,
      "scenario": 1,
      "q": "A service is configured with -Xmx=1Gi in a 1Gi container. It starts and runs for a few seconds before being OOMKilled every restart. What is happening?",
      "opts": [
        "CPU is starved — the pod does not have enough CPU to complete JVM initialisation within the startup timeout, causing a forced termination",
        "The JVM commits the heap and immediately needs Metaspace and thread stacks on top — total exceeds 1Gi instantly",
        "Kubernetes is broken — the kubelet is incorrectly enforcing the cgroup limit before the container has finished its initialisation sequence",
        "The pod is mis-scheduled on a node that does not have 1Gi of free memory, causing the scheduler to evict it during startup",
        "The heap is leaking during startup — Spring Boot bean creation allocates objects faster than GC can reclaim them in the first few seconds"
      ],
      "ans": 1,
      "fb": "With -Xmx equal to the container limit, the JVM has no room for any non-heap memory. As soon as Metaspace fills with classes and threads start, total RSS passes the limit and the kernel kills the process."
    },
    {
      "level": 2,
      "diff": 2,
      "scenario": 1,
      "q": "A production service runs fine with -Xmx=1.4Gi in a 2Gi container most days. During a load spike, it OOMKills. Which adjustment most directly addresses the failure mode?",
      "opts": [
        "Add more replicas only — horizontal scaling distributes traffic and reduces per-pod memory pressure without changing JVM configuration",
        "Lower -Xmx to 1.2Gi to give more headroom for non-heap growth under load",
        "Disable GC during load spikes using -XX:-UseGCOverheadLimit so the JVM does not waste memory on garbage collection overhead",
        "Increase -Xmx to 1.8Gi so the JVM has more heap available during load spikes, preventing OutOfMemoryError under pressure",
        "Increase CPU allocation so GC runs faster during load spikes, keeping total memory consumption lower through more efficient collection"
      ],
      "ans": 1,
      "fb": "Under spike load, more threads, larger buffers, and busier JIT cache push non-heap up. Lowering -Xmx to leave more headroom is counter-intuitive but often correct. Adding replicas helps with throughput but doesn't fix per-pod sizing."
    },
    {
      "level": 2,
      "diff": 3,
      "scenario": 1,
      "q": "A team resists lowering -Xmx because 'we need the heap for caches'. The service still OOMKills under load. What is a safer first move?",
      "opts": [
        "Disable all caches entirely so the heap requirement drops significantly and -Xmx can be lowered without affecting application behaviour",
        "Set -Xmx higher than the container limit — the JVM will only commit what it needs and the kernel will not kill it unless usage is sustained",
        "Profile non-heap growth under load and either lower -Xmx or raise the container limit so total budget covers heap + observed non-heap",
        "Switch to a different language that does not use garbage collection, eliminating the heap sizing problem and the OOMKill risk entirely",
        "Restart pods more frequently on a scheduled basis to clear accumulated memory before it reaches the container limit under load"
      ],
      "ans": 2,
      "fb": "You cannot have a heap larger than the container minus non-heap. Either reduce -Xmx (and accept smaller cache), raise the container limit, or shrink non-heap (fewer threads, smaller buffers). Profiling makes the decision data-driven."
    },
    {
      "level": 2,
      "diff": 1,
      "scenario": 2,
      "q": "A pod's container memory metric shows 1.6Gi used out of 2Gi limit. The JVM heap metric shows 600MB used. What accounts for the gap?",
      "opts": [
        "Kernel modules loaded inside the container's cgroup consume the remaining memory as part of the container's resident set measurement",
        "The heap metric is reporting incorrectly — Micrometer underestimates heap usage and the actual heap is closer to 1.6Gi than 600MB",
        "Other pods co-located on the same node are sharing the cgroup, and their memory usage is being attributed to this pod's container metric",
        "Non-heap JVM memory: Metaspace, thread stacks, direct buffers, JIT code cache, and native allocations",
        "Disk usage from log files and temporary data counts toward the container's memory metric because container storage is memory-backed"
      ],
      "ans": 3,
      "fb": "Container memory captures the entire process RSS. Heap is only one slice. The 1Gi gap is everything else the JVM uses. This pattern is common and normal up to a point — concerning only if the gap keeps growing."
    },
    {
      "level": 2,
      "diff": 2,
      "scenario": 2,
      "q": "Container memory grows from 1.2Gi to 1.8Gi over several days while heap stays at 600MB. Which non-heap region is the most likely culprit, and how would you confirm?",
      "opts": [
        "Metaspace or direct buffers — read NMT (Native Memory Tracking) or Actuator memory.committed by area",
        "Container image layers — Docker decompresses additional image layers over time as the application accesses new filesystem paths",
        "CPU usage — high CPU causes the JVM to allocate more internal buffers for GC and JIT, which shows up as container memory growth",
        "Stack memory — count active threads via JFR or jstack and multiply by the default stack size to determine the thread stack contribution",
        "DNS cache — the JVM's internal DNS resolver accumulates cached entries over time in native memory with no eviction by default"
      ],
      "ans": 0,
      "fb": "With heap stable, the growth is non-heap. Metaspace (class loader leak) and direct buffers (NIO/Kafka leaks) are the usual causes. Native Memory Tracking or Spring Boot's /actuator/metrics jvm.memory.committed by area pinpoints which region is growing."
    },
    {
      "level": 2,
      "diff": 3,
      "scenario": 2,
      "q": "A service exposes Actuator metrics. jvm.memory.used{area='nonheap', id='Metaspace'} grows by 5MB per day with no deployments. Which root cause is most plausible?",
      "opts": [
        "Heap fragmentation — the G1 collector is not compacting the heap efficiently, causing Metaspace to expand to accommodate fragment metadata",
        "A disk leak — the container's ephemeral storage is growing and the metric is mislabelled as Metaspace in the Actuator endpoint",
        "A network leak — the JVM allocates native memory for socket buffers and these are tracked under the Metaspace metric in Micrometer",
        "A class loader leak — possibly dynamic class generation (proxies, scripting, hot reload) without releasing old class loaders",
        "A CPU leak — the JIT compiler is storing increasingly more compiled code in Metaspace as it optimises additional methods over time"
      ],
      "ans": 3,
      "fb": "Steady Metaspace growth without deploys means classes are accumulating. Common causes: dynamic proxy generation, scripting engines that recompile, broken hot-reload, or multiple application contexts created and never closed."
    },
    {
      "level": 2,
      "diff": 1,
      "scenario": 3,
      "q": "After an OOMKill, you run 'kubectl describe pod' and see Last State Terminated, Reason OOMKilled, Exit Code 137. Which next file or signal should you correlate this against?",
      "opts": [
        "Kafka topic configuration — check whether topic retention settings or partition count changes caused the consumer to buffer more messages",
        "Container memory and JVM heap Grafana panels around the kill timestamp",
        "Cloud SQL slow query log — long-running queries can cause the JDBC driver to accumulate result set data in memory, triggering OOMKill",
        "Container image manifest — verify the image digest matches the expected version to rule out a bad deploy that introduced a memory bug",
        "Kubernetes Service definition — check whether the service's load balancer configuration changed and is routing more traffic to this pod"
      ],
      "ans": 1,
      "fb": "With a confirmed OOMKill, the next question is whether heap or non-heap caused it. Correlating the exact kill time with the memory panels tells you whether heap was full or whether the gap (non-heap) ballooned."
    },
    {
      "level": 2,
      "diff": 2,
      "scenario": 3,
      "q": "kubectl describe pod shows Reason OOMKilled with Exit Code 137 and Restart Count 18 in 24 hours. Heap is healthy throughout. What is the most likely class of problem?",
      "opts": [
        "CPU starvation — the pod does not have enough CPU to run GC effectively, causing memory to accumulate until the kernel kills the process",
        "Either a non-heap leak or a chronic mis-sizing of -Xmx vs container limit",
        "A heap leak — the heap metrics are misleading because they show post-GC usage, but pre-GC peaks are hitting the container limit",
        "DNS resolution failures — unresolved DNS queries accumulate in the JVM's internal resolver cache, consuming native memory over time",
        "A bad container image — the image contains a different JVM version than expected, with different default memory management behaviour"
      ],
      "ans": 1,
      "fb": "Frequent OOMKills with healthy heap point to non-heap. Either the budget is wrong by design (config) or something is leaking outside the heap (Metaspace, direct buffers, threads). Both lead to the same investigation: profile non-heap."
    },
    {
      "level": 2,
      "diff": 2,
      "scenario": 3,
      "q": "You see Reason: OOMKilled but the JVM also logged 'java.lang.OutOfMemoryError: Java heap space' just before. What does this indicate?",
      "opts": [
        "A bug in Kubernetes — the kernel should not OOMKill a container that has already reported an OutOfMemoryError to the application layer",
        "Two completely unrelated errors that happened to coincide — the OutOfMemoryError was from a previous request and the OOMKill was from a different cause",
        "Both happened: the heap filled (JVM error) and the container limit was reached (kernel kill) in close sequence — most likely the heap was indeed the cause",
        "CPU throttling caused both errors — the JVM could not run GC quickly enough, leading to both heap exhaustion and container memory overflow",
        "An OOMKill always produces an OutOfMemoryError first — the kernel waits for the JVM to detect the condition before sending SIGKILL"
      ],
      "ans": 2,
      "fb": "Sometimes the JVM detects heap exhaustion just before the kernel kills the container. When you see both signals, the cause is almost certainly heap — and the heap exhaustion likely drove total RSS over the cgroup limit."
    },
    {
      "level": 2,
      "diff": 3,
      "scenario": 3,
      "q": "After an OOMKill, the JVM did not write a heap dump. The team set '-XX:+HeapDumpOnOutOfMemoryError'. Why might no heap dump have been produced?",
      "opts": [
        "Java cannot write files to the container filesystem because the ephemeral storage volume is mounted read-only by default in GKE",
        "The dump directory path specified in HeapDumpPath does not exist inside the container, causing the JVM to silently skip the dump",
        "HeapDumpOnOutOfMemoryError only fires on Java OutOfMemoryError, not on kernel OOMKill, which kills the JVM with no chance to write",
        "The flag is silently ignored in containerised environments because the JVM detects it is running inside a cgroup and disables dump writing",
        "Kubernetes automatically deletes heap dump files from terminated containers before the replacement pod starts to save ephemeral storage"
      ],
      "ans": 2,
      "fb": "OOMKill is external to the JVM and arrives as SIGKILL, which cannot be caught. The JVM has no chance to write a heap dump. To capture state, you must trigger heap dumps before the kernel intervenes — typically on OutOfMemoryError or via on-demand jcmd."
    },
    {
      "level": 2,
      "diff": 1,
      "scenario": 4,
      "q": "What does -XX:+UseContainerSupport do, and is it on by default in Java 17?",
      "opts": [
        "Enables Liquibase database migration support so the JVM can detect schema changes and apply them automatically during container startup",
        "Compiles all application bytecode to native machine code ahead of time during container startup for faster execution in containers",
        "Enables Kubernetes health probe integration so the JVM responds to liveness and readiness checks through a built-in HTTP endpoint",
        "Tells the JVM to read cgroup memory and CPU limits when computing defaults; on by default since Java 8u191/Java 11",
        "Pulls container images from the Docker registry during JVM startup to verify that the running image matches the expected version"
      ],
      "ans": 3,
      "fb": "UseContainerSupport makes the JVM container-aware. Without it, the JVM would see the host node's memory and over-size itself. It is on by default in modern Java; don't turn it off."
    },
    {
      "level": 2,
      "diff": 1,
      "scenario": 4,
      "q": "What is the difference between resources.requests.memory and resources.limits.memory in Kubernetes?",
      "opts": [
        "requests is for scheduling; limits is the cgroup hard cap above which the kernel will OOMKill",
        "They are the same — both set the container memory ceiling and the kernel enforces whichever value is specified in the deployment manifest",
        "limits is used by the Kubernetes scheduler for pod placement; requests is the cgroup hard cap that the kernel enforces via OOMKill",
        "Neither affects JVM memory — the JVM reads its memory configuration from JAVA_OPTS and ignores Kubernetes resource specifications entirely",
        "Both are advisory hints to the scheduler — neither is enforced by the kernel and the container can exceed both values without consequence"
      ],
      "ans": 0,
      "fb": "requests.memory is what the scheduler reserves to place the pod. limits.memory is what the kernel enforces — exceed it and the container is killed. Setting requests = limits gives the most predictable behaviour but reduces flexibility for the scheduler."
    },
    {
      "level": 2,
      "diff": 2,
      "scenario": 4,
      "q": "A pod has requests.memory=512Mi and limits.memory=2Gi. The JVM sets -Xmx based on the limit. Why might setting requests well below the limit be risky?",
      "opts": [
        "The JVM ignores the requests value entirely and uses only the limits value for all internal sizing decisions including heap and Metaspace",
        "Kubernetes doubles the request value internally to provide headroom, so the actual reservation is 1Gi — which still may be insufficient",
        "Java cannot read the requests value from the cgroup — it only reads the limits value, so there is no JVM-level impact from this gap",
        "The pod can be scheduled on a node that doesn't actually have 2Gi free, leading to node-level memory pressure and potential pod evictions",
        "It always causes an OOMKill — any gap between requests and limits triggers the kernel to enforce the lower value as the kill boundary"
      ],
      "ans": 3,
      "fb": "Requests influence scheduling. If you set requests low but the pod actually uses near the limit, you can over-commit a node. Under pressure, the kubelet may evict pods. Aligning requests closer to actual usage avoids surprising evictions."
    },
    {
      "level": 2,
      "diff": 2,
      "scenario": 4,
      "q": "Setting requests.memory equal to limits.memory results in the pod being assigned which Kubernetes QoS class?",
      "opts": [
        "Cheap — a QoS class that Kubernetes assigns to pods with the lowest resource requests to prioritise them for cost savings",
        "Hot — a QoS class indicating the pod is actively processing traffic and should receive priority scheduling on the node",
        "BestEffort — this QoS class is assigned when no resource requests or limits are specified, making the pod first to be evicted",
        "Burstable — this QoS class is assigned when requests and limits differ, indicating the pod may burst beyond its guaranteed allocation",
        "Guaranteed"
      ],
      "ans": 4,
      "fb": "requests == limits for both CPU and memory yields Guaranteed QoS. Guaranteed pods are last to be evicted under node pressure. For latency-sensitive services this is often desirable."
    },
    {
      "level": 2,
      "diff": 3,
      "scenario": 4,
      "q": "A team uses requests.memory=1Gi, limits.memory=2Gi for predictability but encounters frequent evictions on busy nodes. What is the trade-off they should consider?",
      "opts": [
        "Switch to Guaranteed by setting requests = limits = 2Gi, accepting higher reservation cost in exchange for stability",
        "Disable QoS enforcement in the cluster by setting the kubelet flag --qos-cgroups=false to prevent eviction-based pod management",
        "Increase replicas only — more pods spread across more nodes reduces the chance of any single node becoming overcommitted",
        "Lower the limit to match requests at 1Gi — this reduces the pod's actual memory usage and prevents it from becoming an eviction target",
        "Move to a different cluster with more available memory per node so the pods have sufficient room to burst without triggering evictions"
      ],
      "ans": 0,
      "fb": "Burstable QoS pods are more vulnerable to eviction when nodes are under memory pressure. If stability matters more than scheduling efficiency, raising requests to match limits buys Guaranteed QoS at the cost of reserving more capacity."
    },
    {
      "level": 2,
      "diff": 1,
      "scenario": 0,
      "q": "Roughly how much memory does Metaspace consume for a typical Spring Boot 3 service?",
      "opts": [
        "Always 1GB — Spring Boot requires a full gigabyte of Metaspace regardless of the number of dependencies or application complexity",
        "Roughly 80–200MB once classes are loaded",
        "Negligible — Metaspace is a few megabytes at most and does not need to be factored into container memory sizing decisions",
        "A few MB — class metadata is highly compressed and even large Spring Boot applications rarely exceed 10MB of Metaspace usage",
        "Equal to the heap — Metaspace grows proportionally with -Xmx and typically matches the heap size in a running Spring Boot service"
      ],
      "ans": 1,
      "fb": "Spring Boot loads thousands of classes from itself, dependencies, and generated proxies. Metaspace typically settles between 80 and 200MB, depending on dependencies. It is a non-trivial slice of any sizing budget."
    },
    {
      "level": 2,
      "diff": 2,
      "scenario": 0,
      "q": "A new service uses Netty for outbound HTTP calls. After enabling it, container memory grew by 200MB but heap stayed flat. Where did the memory go?",
      "opts": [
        "Direct byte buffers — Netty uses off-heap pooled buffers for I/O",
        "Cloud SQL connection overhead — the new outbound HTTP calls route through Cloud SQL Auth Proxy, which allocates 200MB of connection state",
        "Metaspace — Netty loads hundreds of additional classes that consume 200MB of class metadata in the native memory region",
        "Thread stacks — Netty creates approximately 200 additional event loop threads, each consuming ~1MB of stack memory outside the heap",
        "Disk-backed memory-mapped files — Netty uses mmap for its I/O buffers which show up in the container's RSS but are actually disk-backed"
      ],
      "ans": 0,
      "fb": "Netty allocates pooled direct ByteBuffers for I/O. They live in native memory, not the heap, so heap metrics are unaffected. The buffer pool can be sized via -Dio.netty.maxDirectMemory and observed via NMT or specific Netty metrics."
    },
    {
      "level": 2,
      "diff": 3,
      "scenario": 0,
      "q": "You suspect a service is leaking direct byte buffers. Which JVM flag enables tracking allocations from native memory regions?",
      "opts": [
        "-XX:+PrintGCDetails — this flag enables detailed GC logging that includes direct byte buffer allocation and deallocation events",
        "-Xss — this flag controls the thread stack size which indirectly limits how much native memory each thread can allocate for buffers",
        "-XX:+UseG1GC — switching to G1 enables native memory tracking as a built-in feature of the G1 garbage collector's region management",
        "-XX:+PrintHeapDump — this flag triggers automatic heap dump generation that includes native memory allocation data alongside heap objects",
        "-XX:NativeMemoryTracking=summary or =detail"
      ],
      "ans": 4,
      "fb": "NativeMemoryTracking instruments JVM allocations from native memory. With it on you can use 'jcmd <pid> VM.native_memory summary' to see memory by category and detect growth in Internal, Direct Buffers, or Class regions."
    },
    {
      "level": 2,
      "diff": 2,
      "scenario": 1,
      "q": "Which configuration is safest for a Spring Boot service in a 4Gi container with ~200 threads, ~150MB Metaspace expected, 200MB direct buffers, and JIT cache around 100MB?",
      "opts": [
        "-Xmx=3Gi (leaves ~1Gi headroom for stacks/Metaspace/buffers/JIT/native)",
        "-Xmx=1Gi — conservative sizing leaves 3Gi for non-heap, which is excessive but ensures the service never encounters OOMKill under any load",
        "-Xmx=4Gi — the heap should equal the container limit to maximise the memory available for application objects and caches",
        "-Xmx=3.8Gi — set the heap to 95% of the container limit, leaving only 200MB for non-heap which is sufficient for most services",
        "-Xmx=512m — keep the heap minimal at 12.5% of the container limit so the majority of memory is available for non-heap operations"
      ],
      "ans": 0,
      "fb": "Non-heap budget: 200MB stacks + 150MB Metaspace + 200MB buffers + 100MB JIT + ~150MB native ≈ 800MB–1Gi. -Xmx=3Gi leaves the headroom safely. -Xmx=3.8Gi may work briefly but leaves no margin for spikes."
    },
    {
      "level": 2,
      "diff": 3,
      "scenario": 2,
      "q": "A service shows committed Metaspace growing to 600MB and OOMing with 'OutOfMemoryError: Metaspace'. The team did not set -XX:MaxMetaspaceSize. What changed?",
      "opts": [
        "CPU is throttled — insufficient CPU prevents the JVM from unloading unused classes, causing Metaspace to grow because cleanup cannot keep up",
        "Disk is full — the JVM uses disk-backed swap for Metaspace when native memory runs low, and disk exhaustion triggers the OOM error",
        "Metaspace always grows to 600MB for any Spring Boot application — this is the normal steady-state size for class metadata in the framework",
        "Heap is full — when the heap runs out of space, the JVM redirects overflow allocations to Metaspace, causing it to grow and eventually OOM",
        "MaxMetaspaceSize is unlimited by default, so this is something else (a class loader leak driving uncontrolled growth)"
      ],
      "ans": 4,
      "fb": "Without MaxMetaspaceSize, Metaspace can grow until native memory is exhausted. Hitting OOM Metaspace usually means classes are accumulating — a class loader leak — not just normal growth. Setting MaxMetaspaceSize forces failure earlier and easier to diagnose."
    },
    {
      "level": 2,
      "diff": 1,
      "scenario": 3,
      "q": "You run kubectl describe pod and see 'Last State: Terminated, Exit Code: 137'. Which one number do you mention to a senior on-call as the unambiguous OOMKill signal?",
      "opts": [
        "Exit code 137 with Reason OOMKilled",
        "The pod's IP address — it changes on each restart, and a sequence of different IPs confirms the container was killed rather than gracefully stopped",
        "The image SHA digest — comparing it against the expected SHA confirms whether the OOMKill was caused by a bad image or a memory problem",
        "The restart count alone — any non-zero restart count on a production pod confirms an OOMKill because pods only restart after memory failures",
        "The pod name — the naming convention includes a suffix that encodes the termination reason when Kubernetes restarts a killed container"
      ],
      "ans": 0,
      "fb": "137 (= 128 + 9, SIGKILL) plus Reason: OOMKilled is unambiguous evidence of an OOMKill. Sharing this lets the on-call skip ambiguous troubleshooting and go straight to memory analysis."
    },
    {
      "level": 3,
      "diff": 1,
      "scenario": 0,
      "q": "In a Spring Boot service, which of the following is the largest fixed-size off-heap memory consumer per active database connection in HikariCP?",
      "opts": [
        "Spring's bean cache — each connection has a corresponding Spring bean proxy that caches method invocations and consumes significant heap memory",
        "The JDBC driver's network and prepared statement state",
        "Thread stacks — each HikariCP connection is pinned to a dedicated thread whose 1MB stack is the largest per-connection memory consumer",
        "The Java HikariDataSource bean — the singleton DataSource object stores all pool metadata and connection state in a large heap structure",
        "The Liquibase change log — each connection caches the full migration history to verify schema compatibility on every query execution"
      ],
      "ans": 1,
      "fb": "Each open JDBC connection holds driver-side state: TLS buffers, network buffers, and prepared statement caches. This adds up quickly with large pool sizes and is invisible to heap metrics."
    },
    {
      "level": 3,
      "diff": 1,
      "scenario": 0,
      "q": "Which Spring Boot setting most directly controls the number of concurrent request-handler threads in a default Tomcat-based service?",
      "opts": [
        "server.tomcat.threads.max",
        "management.server.port — this setting controls the number of management threads that handle both health checks and request processing",
        "server.tomcat.max-connections — this setting directly limits the number of threads handling HTTP requests concurrently in the server",
        "spring.datasource.hikari.maximum-pool-size — this controls Tomcat thread count because each request thread maps one-to-one with a connection",
        "spring.task.execution.pool.max-size — this is the primary setting for all Spring Boot request handling threads including Tomcat workers"
      ],
      "ans": 0,
      "fb": "server.tomcat.threads.max sets the maximum worker thread count for Tomcat. Each thread holds a stack (~1MB) and contributes to concurrency limits. max-connections is the accept-queue cap, not the thread pool."
    },
    {
      "level": 3,
      "diff": 2,
      "scenario": 0,
      "q": "A team's service has Tomcat threads.max=400, hikari pool=100, kafka.max.poll.records=500, two consumers with 64MB fetch.max.bytes. Roughly which non-heap region is dominant?",
      "opts": [
        "JIT code cache — with 400 threads executing diverse code paths, the JIT compiler generates ~400MB of compiled native code in the code cache",
        "Kafka direct buffers — about 128MB total from 2 consumers x 64MB fetch buffers, which is the dominant non-heap consumer in this profile",
        "Metaspace — with 400 threads and 100 connections, Spring Boot loads enough classes to consume 400MB or more of class metadata storage",
        "Stacks — 400 threads × ~1MB ≈ 400MB",
        "HikariCP heap usage — 100 connections each caching prepared statements and result set metadata consume the most memory in this configuration"
      ],
      "ans": 3,
      "fb": "At 400 threads, stacks alone are ~400MB — usually the largest non-heap consumer in such a profile. Kafka buffers add roughly 128MB. Right-sizing Tomcat threads is often the highest-leverage change for memory."
    },
    {
      "level": 3,
      "diff": 2,
      "scenario": 0,
      "q": "A service uses Caffeine cache with maximumSize=1_000_000 entries, each averaging 2KB. What is the steady-state heap impact of the cache when full?",
      "opts": [
        "~2MB — Caffeine stores only references to the cached objects, and the pointer overhead for 1 million entries is approximately 2MB total",
        "~2KB — Caffeine compresses all entries into a single internal data structure that only consumes the size of one average entry",
        "Cannot estimate without profiling — cache memory depends on GC behaviour, JVM version, and object alignment which vary at runtime",
        "~2GB",
        "Negligible — Caffeine uses off-heap storage by default and does not consume any heap memory regardless of the number of cached entries"
      ],
      "ans": 3,
      "fb": "1,000,000 × 2KB = 2GB. Caches with large maximumSize values are easy to underestimate. Always do back-of-envelope sizing before deploying caches; Caffeine respects maximumSize but cannot prevent you from setting an unaffordable one."
    },
    {
      "level": 3,
      "diff": 3,
      "scenario": 0,
      "q": "A Spring Boot service uses an in-process Caffeine cache and a HikariCP pool of 50. Average heap usage is fine, but Old Gen grows steadily. Which consumer is most consistent with this pattern?",
      "opts": [
        "Tomcat threads — thread stack allocations are placed in Old Gen because threads are long-lived objects that survive young generation collection",
        "JIT code cache — compiled native code is stored in Old Gen and grows as more methods are optimised, producing steady growth over time",
        "Direct buffers — Netty and NIO direct byte buffers are tracked in Old Gen via their Cleaner references, causing steady growth patterns",
        "HikariCP — each active database connection stores its prepared statement cache and result set metadata in Old Gen heap structures",
        "Caffeine cache entries that survive enough GCs to be promoted to Old Gen"
      ],
      "ans": 4,
      "fb": "Long-lived cache entries are typical Old Gen residents. As they accumulate (or eviction is loose), Old Gen grows. HikariCP allocations are mostly off-heap. Tomcat threads do not directly fill Old Gen. The cache is the natural suspect."
    },
    {
      "level": 3,
      "diff": 1,
      "scenario": 1,
      "q": "Spring Boot Actuator exposes /actuator/metrics/jvm.memory.used. Which tag distinguishes heap from non-heap?",
      "opts": [
        "kind — this tag separates heap from non-heap by labelling each memory pool as either 'managed' for heap or 'native' for non-heap regions",
        "scope — this tag distinguishes heap from non-heap by categorising memory pools as 'application' for heap or 'system' for non-heap areas",
        "level — this tag classifies memory pools by generation level, with 'young' and 'old' for heap and 'meta' for non-heap regions",
        "area (heap, nonheap)",
        "class — this tag separates memory by the Java class type that allocated it, with heap objects tagged by their fully qualified class name"
      ],
      "ans": 3,
      "fb": "The 'area' tag separates heap from nonheap. Combined with 'id' (e.g., G1 Eden, Metaspace, Compressed Class Space), it tells you exactly where memory is being used inside the JVM."
    },
    {
      "level": 3,
      "diff": 2,
      "scenario": 1,
      "q": "You query jvm.memory.used{area='nonheap', id='Compressed Class Space'} and see steady growth over 14 days. What does this region store and what is the implication?",
      "opts": [
        "Thread stacks — the Compressed Class Space region stores per-thread stack frames in a compressed format to save native memory",
        "Direct buffers — NIO and Netty direct byte buffer allocations are tracked under the Compressed Class Space metric in Micrometer",
        "Class metadata pointers; growth points to dynamically loaded classes — possibly a class loader leak",
        "Old Gen overflow — when Old Gen runs out of space, excess objects spill into the Compressed Class Space as a secondary storage area",
        "JIT code cache — Compressed Class Space stores compiled native code, and steady growth is normal as the JIT optimises more methods"
      ],
      "ans": 2,
      "fb": "Compressed Class Space holds compressed class pointers. Growth indicates classes are being loaded faster than they are unloaded. Combined with growing Metaspace, this is a strong indicator of a class loader leak."
    },
    {
      "level": 3,
      "diff": 3,
      "scenario": 1,
      "q": "In Actuator metrics, jvm.gc.pause has a tag 'cause'. You see most pauses tagged 'G1 Evacuation Pause' and a few 'G1 Humongous Allocation'. Why does the second cause matter?",
      "opts": [
        "Humongous allocations (>50% of region size) bypass normal allocation paths and can fragment the heap, often hinting at a code path allocating very large arrays",
        "It is unrelated to memory management — Humongous Allocation is a JVM logging label for CPU-intensive operations during GC scanning",
        "It means GC is broken and needs to be reconfigured — Humongous Allocation pauses should never appear in a healthy G1 collector configuration",
        "It indicates network issues — the JVM labels network buffer allocations as 'humongous' when they exceed the NIO channel's default buffer size",
        "It is purely informational logging with no performance impact — G1 logs all allocation types for debugging and the label can be safely ignored"
      ],
      "ans": 0,
      "fb": "G1 treats objects larger than half a region as 'humongous'. They are allocated in dedicated regions and are inefficient. Frequent humongous causes usually point to a specific code path allocating large arrays — worth investigating."
    },
    {
      "level": 3,
      "diff": 1,
      "scenario": 2,
      "q": "Which OutOfMemoryError message is produced when the JVM cannot allocate a new native thread?",
      "opts": [
        "unable to create native thread",
        "GC overhead limit exceeded — this error indicates the JVM cannot allocate thread stacks because GC is consuming too much CPU time",
        "Metaspace — this error appears when thread metadata cannot be stored in the class metadata region, preventing new thread creation",
        "Direct buffer memory — this error means the JVM cannot allocate the NIO buffers required for the new thread's communication channels",
        "Java heap space — this error indicates the heap is too full to allocate the Thread object that represents the new native thread"
      ],
      "ans": 0,
      "fb": "'unable to create native thread' means the OS refused thread creation. Common causes: per-process thread/PID limits, kernel.threads-max, or memory exhaustion preventing stack allocation. It is a non-heap problem despite the OOM prefix."
    },
    {
      "level": 3,
      "diff": 2,
      "scenario": 2,
      "q": "Which of these OOMs is most likely caused by a code-level memory leak rather than a sizing problem?",
      "opts": [
        "Java heap space, with the heap baseline trending up over weeks",
        "unable to create native thread — this typically indicates a code bug that creates unlimited threads rather than a resource sizing problem",
        "Direct buffer memory — this usually indicates a NIO library is not releasing buffers, which is a configuration issue rather than a code leak",
        "Metaspace — this typically reflects a class loader or dynamic proxy configuration issue rather than a leak in application-level code",
        "Compressed class space — this usually indicates too many classes loaded from dependencies rather than a bug in the application code"
      ],
      "ans": 0,
      "fb": "A heap whose baseline keeps rising for weeks is the textbook memory leak signature. The other forms can be code leaks too, but they more often reflect configuration limits being too low or dynamic class loading."
    },
    {
      "level": 3,
      "diff": 3,
      "scenario": 2,
      "q": "A service is hitting 'OutOfMemoryError: Direct buffer memory'. Which JVM option directly limits this region?",
      "opts": [
        "-XX:MaxMetaspaceSize — this flag controls the direct buffer region because direct byte buffers are stored alongside class metadata in Metaspace",
        "-XX:MaxDirectMemorySize",
        "-Xmx — this flag controls all JVM memory including direct byte buffers, because direct allocations count against the maximum heap size",
        "-XX:ReservedCodeCacheSize — this flag limits the native memory available for direct buffers by reserving space for JIT-compiled code first",
        "-Xss — this flag controls the per-thread stack size, which indirectly limits how much direct buffer memory each thread can allocate"
      ],
      "ans": 1,
      "fb": "Direct buffer memory is bounded by -XX:MaxDirectMemorySize (default ≈ -Xmx if unset). Setting it explicitly both protects against runaway allocation and makes the limit visible to ops."
    },
    {
      "level": 3,
      "diff": 1,
      "scenario": 3,
      "q": "Which of these patterns in a PR is the clearest memory red flag during code review?",
      "opts": [
        "A new logging statement using log.debug() with string concatenation — the string is constructed on every call even when debug is disabled",
        "A field of type Map<String, Object> with no eviction or maximum size, used to cache results indefinitely",
        "A new unit test that creates a Spring application context — test contexts are cached by the framework and can accumulate heap pressure",
        "A new private method that creates a temporary ArrayList — local collections consume heap proportional to their size during each invocation",
        "A new Spring bean annotated with @Component — each singleton bean adds permanent heap overhead for its proxy and dependency injection metadata"
      ],
      "ans": 1,
      "fb": "Unbounded caches are one of the most common production memory leaks. Reviewers should flag any long-lived collection that grows with input but lacks a cap, eviction, or TTL."
    },
    {
      "level": 3,
      "diff": 2,
      "scenario": 3,
      "q": "In code review you see: ThreadLocal<HeavyContext> CTX = new ThreadLocal<>(); used inside a Tomcat request thread, with no remove() in a finally block. What is the risk?",
      "opts": [
        "No risk — ThreadLocal values are automatically cleared by the GC after each request completes, so no explicit cleanup is needed in a finally block",
        "Slow startup — ThreadLocal initialisation adds latency to the first request on each thread, but has no memory impact during steady state operation",
        "HeavyContext is retained on the thread until the thread dies; thread pools recycle threads, so the value lingers across unrelated requests and can leak memory",
        "Compilation error — ThreadLocal requires a type parameter and using it without generics will cause a compilation failure in Java 17+",
        "Thread safety only — ThreadLocal values can be accessed by other threads concurrently, creating race conditions without proper synchronization"
      ],
      "ans": 2,
      "fb": "ThreadLocals on long-lived pool threads must be cleared after use, otherwise the value lives until the thread dies. This is a frequent leak source in pooled servers and is invisible to typical monitoring."
    },
    {
      "level": 3,
      "diff": 2,
      "scenario": 3,
      "q": "A code change introduces a method that accumulates results into a List inside a loop reading millions of database rows, then returns the list. Why is this a memory risk worth flagging?",
      "opts": [
        "Lists cannot hold more than Integer.MAX_VALUE items, so processing millions of rows will cause an IndexOutOfBoundsException at runtime",
        "Lists are slow for sequential access — using an array instead would avoid the overhead of ArrayList's internal capacity management",
        "Database access inside a loop is forbidden by Spring's transaction management rules and will throw an IllegalStateException",
        "Returning a list from a database method is bad style — Spring Data requires repository methods to return Stream or Page types exclusively",
        "The full result set is held in heap simultaneously; it should stream or paginate"
      ],
      "ans": 4,
      "fb": "Materialising large result sets into in-memory collections is a common cause of OOM. Streaming with cursors, batching, or pagination keeps memory bounded regardless of result size."
    },
    {
      "level": 3,
      "diff": 3,
      "scenario": 3,
      "q": "A PR adds @Async to a method that is called from a tight loop processing webhook events. What memory risk should you raise?",
      "opts": [
        "CPU usage will rise proportionally to the webhook event rate because @Async creates a new OS thread per task, consuming CPU for thread management",
        "Spring will fail to start because @Async methods cannot be called from within a synchronous loop — the proxy will throw an exception during wiring",
        "Logs will be missing because @Async methods run on different threads and MDC context is not propagated, making webhook processing untraceable",
        "@Async is forbidden on methods called from tight loops — Spring validates the call pattern at runtime and throws UnsupportedOperationException",
        "If the executor uses an unbounded queue (the default), tasks accumulate faster than they are processed and the queue grows without limit, eventually filling heap"
      ],
      "ans": 4,
      "fb": "Spring's default async executor is a SimpleAsyncTaskExecutor or a ThreadPoolTaskExecutor with an unbounded queue. Under back-pressure, queued tasks accumulate in heap. Always configure a bounded queue and a rejection policy."
    },
    {
      "level": 3,
      "diff": 1,
      "scenario": 4,
      "q": "A Spring Boot service has -Xmx=1Gi, max Tomcat threads=200, hikari pool=20, Metaspace ~150MB. Estimate total RSS at steady state.",
      "opts": [
        "About 1.5Gi — the heap plus a small amount of Metaspace is sufficient for the RSS estimate without counting thread stacks or JIT cache",
        "Cannot estimate without taking a heap dump from a running instance — theoretical calculations are unreliable for production memory sizing",
        "About 1Gi — RSS should equal -Xmx because the JVM only allocates what the heap needs, and non-heap regions are negligible in practice",
        "About 1.6–1.8Gi (1Gi heap + ~200MB stacks + ~150MB Metaspace + ~100MB JIT + native overhead)",
        "About 4Gi — the JVM typically uses 4x the heap size for total RSS because of internal overhead, native allocations, and GC metadata"
      ],
      "ans": 3,
      "fb": "Adding the slices: 1Gi (heap) + 200MB (stacks) + 150MB (Metaspace) + ~100MB (JIT code cache) + native overhead → ~1.6–1.8Gi RSS. This is the realistic container budget the service requires."
    },
    {
      "level": 3,
      "diff": 2,
      "scenario": 4,
      "q": "A service plans to run in a 1.5Gi container with 250 threads and 200MB Caffeine cache. What is the maximum sensible -Xmx?",
      "opts": [
        "Equal to the container RAM at 1.5Gi — the heap should match the container limit to maximise the memory available for the Caffeine cache",
        "256MB — keep the heap small because the 200MB Caffeine cache lives in off-heap direct byte buffers, not on the heap",
        "About 950MB — leaves ~250MB for stacks plus ~150MB Metaspace plus JIT and native; the cache also lives inside the heap and counts against -Xmx",
        "~1.5Gi — the Caffeine cache is stored in off-heap memory by default, so the full container limit can be allocated to -Xmx",
        "~1.2Gi — allocate 80% of the container limit to the heap as per the standard rule, with the remaining 20% for all non-heap regions"
      ],
      "ans": 2,
      "fb": "250 thread stacks ≈ 250MB; Metaspace ≈ 150MB; JIT ≈ 80MB; native ≈ 100MB → ~580MB non-heap. 1.5Gi - 580MB ≈ 950MB. Note the 200MB cache is heap-allocated and lives inside that 950MB, not on top."
    },
    {
      "level": 3,
      "diff": 3,
      "scenario": 4,
      "q": "A team wants to halve memory cost by moving from 2Gi to 1Gi containers. The JVM has -Xmx=1.4Gi today and Metaspace ~120MB. What is the most concrete blocker to overcome before the cut?",
      "opts": [
        "CPU must be doubled to compensate — halving memory requires doubling CPU so the GC can run twice as frequently without affecting latency",
        "-Xmx must be reduced to fit (e.g., 600MB or less), and the team must verify the working set, GC behaviour, and cache budgets still meet SLA at the smaller heap",
        "The JVM cannot run in a 1Gi container — the minimum viable container size for any Spring Boot JVM application is 1.5Gi due to framework overhead",
        "The deployment pipeline cannot deploy 1Gi pods — Kubernetes requires a minimum container limit of 1.5Gi for JVM workloads on GKE node pools",
        "Java itself is too large — the JDK runtime alone requires 1Gi of memory for class libraries, and no space remains for the application heap"
      ],
      "ans": 1,
      "fb": "The cut forces -Xmx down. The real question is whether the application can serve traffic with the smaller working set without GC thrashing. That requires load testing and possibly redesigning caches — the technical debt the cut surfaces."
    },
    {
      "level": 3,
      "diff": 1,
      "scenario": 0,
      "q": "Which Spring Boot subsystem is the most common silent off-heap consumer when scaling out HTTP server threads?",
      "opts": [
        "Spring AOP — each proxy generated for aspect-oriented programming creates a separate off-heap allocation that scales with thread count",
        "Tomcat thread stacks (each ~1MB) plus per-thread NIO buffers",
        "JIT code cache — more threads means more diverse code paths to compile, and the JIT code cache grows linearly with thread count",
        "Liquibase — the migration engine maintains a per-thread copy of the change log in off-heap memory to support concurrent schema checks",
        "The Spring bean container — singleton beans are duplicated per thread for thread safety, consuming proportionally more heap with more threads"
      ],
      "ans": 1,
      "fb": "Each Tomcat worker thread has ~1MB of stack and may hold per-thread NIO buffers. Doubling thread count doubles this slice. Reviewing thread pool sizes is one of the highest-impact memory levers."
    },
    {
      "level": 3,
      "diff": 2,
      "scenario": 1,
      "q": "You expose Actuator metrics in Prometheus. Which combination best detects an early class loader leak?",
      "opts": [
        "Just jvm.memory.used with the area=heap tag — class loader leaks primarily manifest as heap growth because loaded classes consume heap memory",
        "GC pauses only — increasing GC pause duration is the earliest and most reliable signal of a class loader leak in production services",
        "CPU usage combined with total memory — class loader leaks cause CPU spikes during class verification that correlate with memory growth",
        "Disk I/O combined with network throughput — class loading generates disk reads and network traffic that signal a leak before memory grows",
        "jvm.memory.used{area='nonheap',id='Metaspace'} trend together with jvm.classes.loaded.classes"
      ],
      "ans": 4,
      "fb": "A class loader leak shows up as both Metaspace growth and a steadily climbing class count. Tracking them together makes the leak obvious before it ends in OOM Metaspace."
    },
    {
      "level": 3,
      "diff": 3,
      "scenario": 2,
      "q": "Why does 'OutOfMemoryError: unable to create native thread' often appear suddenly with no warning, even when both heap and Metaspace are healthy?",
      "opts": [
        "It is caused by GC — garbage collection holds all threads during stop-the-world pauses, preventing new thread creation until collection completes",
        "It only happens at startup — once the JVM finishes initialising its thread pools, all threads are created and this error cannot occur at runtime",
        "Thread creation depends on native memory and OS limits (pids, threads-max, RLIMIT_NPROC). Crossing those limits is binary and unrelated to JVM heap metrics.",
        "It is random — the Linux kernel occasionally rejects thread creation requests due to scheduling contention that cannot be predicted or monitored",
        "It is a Spring Boot bug — the framework does not properly manage its internal thread pool lifecycle, causing thread exhaustion under load"
      ],
      "ans": 2,
      "fb": "Thread creation lives outside the JVM heap budget. Limits are kernel- and process-level. Crossing them is sudden and not visible in any heap-focused dashboard. Mitigation is bounding pool sizes and right-sizing the OS."
    },
    {
      "level": 3,
      "diff": 3,
      "scenario": 3,
      "q": "A reviewer sees a new endpoint that loads an entire CSV upload into memory via Files.readAllBytes() and parses it with String.split. What memory risk applies?",
      "opts": [
        "No risk — the JVM automatically streams large files in chunks and does not load the entire byte array into heap memory at once",
        "String.split is slow for large inputs but does not create additional memory pressure because it reuses the original string's backing array",
        "Compilation error — Files.readAllBytes() returns a ByteBuffer, not a byte array, so calling String.split() on it will not compile",
        "Encoding issue — Files.readAllBytes() does not specify a character encoding, causing the parsed strings to contain garbled data in production",
        "For large files, both the byte[] and the resulting array of strings live on the heap simultaneously, multiplying the input size in memory"
      ],
      "ans": 4,
      "fb": "Reading the whole file plus splitting can produce 3–4x the file size in heap due to UTF-16 strings, char[] copies, and intermediate arrays. Streaming line-by-line keeps memory bounded regardless of file size."
    },
    {
      "level": 3,
      "diff": 1,
      "scenario": 4,
      "q": "For a small Spring Boot service with -Xmx=256m, ~50 threads, expected Metaspace ~80MB, which container memory limit is the smallest realistic choice?",
      "opts": [
        "1Gi — always use at least 1Gi for any Spring Boot service regardless of heap size to provide sufficient headroom for non-heap memory",
        "256Mi — the container limit should equal -Xmx because non-heap memory for a small service with only 50 threads is negligible",
        "384Mi — add 50% to -Xmx as a standard rule of thumb, giving 256MB + 128MB = 384Mi which provides adequate non-heap headroom",
        "About 512Mi (256MB heap + 50MB stacks + 80MB Metaspace + ~50MB JIT and native)",
        "2Gi — always use 2Gi as the minimum for any JVM workload to avoid OOMKills, regardless of the actual heap and thread configuration"
      ],
      "ans": 3,
      "fb": "Sum the slices: 256 + 50 + 80 + 50 ≈ 436MB. 512Mi gives a small but workable safety margin. 384Mi is too tight; 256Mi is impossible because it equals -Xmx alone."
    },
    {
      "level": 3,
      "diff": 2,
      "scenario": 4,
      "q": "A service is moving from 500 RPS to 2000 RPS. Which non-heap region is most likely to require a dedicated re-sizing decision?",
      "opts": [
        "Metaspace — higher RPS loads more classes dynamically because each request type triggers lazy class loading of its handler chain",
        "Thread stacks, since handling more concurrency typically grows the worker pool",
        "Compressed class space — more concurrent requests require more compressed class pointers to be loaded into this Metaspace sub-region",
        "JIT code cache — the 4x traffic increase will cause the JIT compiler to generate 4x more compiled code, requiring proportionally more cache",
        "Survivor space — higher allocation rates fill the survivor regions faster, requiring them to be resized proportionally to the new RPS"
      ],
      "ans": 1,
      "fb": "More concurrency means more in-flight requests, which typically translates to more worker threads. Stack memory scales linearly with thread count and frequently dominates the non-heap budget at high concurrency."
    },
    {
      "level": 3,
      "diff": 3,
      "scenario": 0,
      "q": "A service with 800 Tomcat threads is migrated to virtual threads (Java 21). Heap usage grows by 30%. Why?",
      "opts": [
        "Per-task continuations are heap-allocated; thousands of in-flight requests can move what was previously stack memory into the heap",
        "Virtual threads use the same memory as platform threads — each still requires a 1MB native stack, so heap growth must have another cause",
        "The test environment is broken — virtual threads do not change memory characteristics and the 30% growth is likely a measurement error",
        "GC tuning is wrong — virtual threads require a different GC configuration because they create objects with different lifetime patterns",
        "CPU went up — virtual threads consume more CPU for scheduling, which causes the JVM to allocate more internal buffers for thread management"
      ],
      "ans": 0,
      "fb": "Virtual threads dramatically reduce stack memory because each is a small heap-allocated continuation. Total memory for the same workload usually drops, but the breakdown shifts: less off-heap stack, more heap. Heap budgets must be re-tuned."
    },
    {
      "level": 3,
      "diff": 2,
      "scenario": 3,
      "q": "A reviewer flags a PR that adds a synchronized static Map<String, byte[]> as a 'simple cache'. Beyond unbounded growth, what other concern should be raised?",
      "opts": [
        "Inheritance break — static fields cannot be overridden by subclasses, which prevents proper cache configuration in derived services",
        "Synchronized is too fast — the synchronized keyword provides no actual thread safety for maps and should be replaced with ReentrantReadWriteLock",
        "Static collections live for the entire JVM lifetime and are pinned in Old Gen, retaining their entries through every GC cycle",
        "Compilation issue — storing byte[] values in a Map<String, byte[]> causes autoboxing overhead that the compiler cannot optimise away",
        "Maps are not Serializable — if the service is restarted, the cache is lost and the application will throw NotSerializableException on first access"
      ],
      "ans": 2,
      "fb": "Static collections cannot be released by GC because the class is reachable for the JVM's lifetime. Combined with no eviction, this guarantees unbounded growth and Old Gen retention. Both are flagged."
    },
    {
      "level": 3,
      "diff": 1,
      "scenario": 1,
      "q": "Which Actuator endpoint is the most useful single place to inspect JVM memory areas in a running Spring Boot service?",
      "opts": [
        "/actuator/beans — this endpoint lists all Spring beans with their memory consumption, providing a breakdown of heap usage by component",
        "/actuator/metrics, querying jvm.memory.used and jvm.memory.max with their tags",
        "/actuator/env — this endpoint shows the JVM memory configuration including -Xmx and MaxMetaspaceSize, which reveals the memory areas",
        "/actuator/health — this endpoint includes detailed memory health indicators with per-region usage percentages and warning thresholds",
        "/actuator/info — this endpoint reports the JVM's current memory allocation with a summary of heap, non-heap, and direct buffer usage"
      ],
      "ans": 1,
      "fb": "jvm.memory.used and jvm.memory.max under /actuator/metrics expose every JVM memory pool with tags. Querying them gives a precise picture: heap vs non-heap, by pool name, in real time."
    },
    {
      "level": 1,
      "diff": 3,
      "scenario": 3,
      "q": "A team enables Spring Boot's lazy initialization (-Dspring.main.lazy-initialization=true) to speed up startup. What is the main memory trade-off?",
      "opts": [
        "First requests to each bean pay the initialization cost, creating unpredictable latency spikes and memory allocation bursts after deployment",
        "Memory is saved permanently — lazy initialization means unused beans are never loaded, reducing the steady-state heap footprint for the JVM",
        "No trade-off exists — lazy initialization is strictly better because it reduces both startup time and memory consumption without drawbacks",
        "CPU increases at startup because the JVM must evaluate which beans to defer, adding computational overhead during the context scan phase",
        "Spring fails to start because lazy initialization is incompatible with @Transactional beans that require eager proxy creation at boot time"
      ],
      "ans": 0,
      "fb": "Lazy init defers bean creation until first use. This shifts startup time into the first request path per bean, producing latency spikes and bursty memory allocation at unpredictable times. It improves startup but shifts the cost, not eliminates it."
    },
    {
      "level": 1,
      "diff": 3,
      "scenario": 4,
      "q": "A colleague says 'calling System.gc() will prevent OOM errors'. Why is this misleading?",
      "opts": [
        "It causes OOMKill — calling System.gc() triggers a Full GC that temporarily doubles memory usage, pushing the container past its limit",
        "It helps in containers — System.gc() forces the JVM to return committed memory to the OS, which is particularly useful in cgroup environments",
        "System.gc() always works — the JVM guarantees a full garbage collection cycle will execute synchronously whenever System.gc() is called",
        "System.gc() is efficient — it runs a lightweight incremental collection that is faster and cheaper than the automatic GC collections",
        "The JVM treats System.gc() as a suggestion, not a command — it may or may not run GC, and if there is a real leak, calling it repeatedly just wastes CPU without freeing retained objects"
      ],
      "ans": 4,
      "fb": "System.gc() is advisory. Even if GC runs, it cannot reclaim objects that are still reachable. Calling it in a loop to 'prevent OOM' masks the real problem and adds CPU overhead. Fix the leak instead."
    },
    {
      "level": 2,
      "diff": 1,
      "scenario": 2,
      "q": "A pod's container memory metric reads 1.8Gi out of 2Gi limit after running for a week, but the JVM heap shows only 500MB used. Is this normal?",
      "opts": [
        "A Kubernetes bug — the kubelet is incorrectly reporting container memory usage and the real value is much lower than 1.8Gi shown",
        "The JVM committed heap plus non-heap regions can legitimately consume that much; check whether non-heap is stable or growing before deciding",
        "A dashboard error — Grafana is double-counting the heap memory and showing it in both the heap metric and the container memory metric",
        "Always normal — every Spring Boot service uses 90% of its container limit after a week because the JVM commits all available memory over time",
        "Always a leak — a healthy JVM should never use more than 70% of its container limit, and 1.8Gi out of 2Gi indicates a clear memory problem"
      ],
      "ans": 1,
      "fb": "Container RSS includes committed heap (which may be larger than used), Metaspace, stacks, buffers, and JIT cache. If non-heap is stable, the high RSS may be expected. If it is growing, investigate."
    },
    {
      "level": 2,
      "diff": 3,
      "scenario": 1,
      "q": "A service has -Xmx=700m in a 1Gi container. It runs fine in dev but OOMKills in prod. Dev has 20 threads; prod has 200. What explains the difference?",
      "opts": [
        "200 prod threads consume ~200MB in stacks vs ~20MB in dev — the extra 180MB pushes total past the 1Gi limit in production",
        "The JVM version is different between dev and prod — different versions have different default memory management behaviour and heap sizing",
        "The container image is different — the production image includes additional monitoring agents and sidecars that consume extra memory",
        "Cloud SQL is configured differently — the production database sends larger result sets that the JDBC driver buffers in native memory",
        "Dev is broken — the development environment is not representative of production and the OOMKill in dev is a false positive to ignore"
      ],
      "ans": 0,
      "fb": "Thread count is the most common variable between dev and prod. At 1MB per stack, 200 threads vs 20 is 180MB difference — enough to tip a tight budget over the limit."
    },
    {
      "level": 2,
      "diff": 3,
      "scenario": 4,
      "q": "A team sets resources.requests.memory: 256Mi and limits: 2Gi. The scheduler places 8 pods on a node with 4Gi. What happens when they all use 1Gi each?",
      "opts": [
        "Nothing happens — Kubernetes automatically limits each pod's actual memory usage to its request value of 256Mi regardless of the limit setting",
        "Kubernetes automatically resizes the node by adding more memory from the cloud provider to accommodate the total demand of all pods",
        "Pods migrate automatically to other nodes with available capacity through the Kubernetes scheduler's live migration capability",
        "Fine — all pods fit because the limit value is only advisory and the kernel does not enforce it when the node has sufficient total memory",
        "The node becomes overcommitted (8Gi demand > 4Gi available), triggering kernel OOM-killing of pods based on QoS class and usage"
      ],
      "ans": 4,
      "fb": "Low requests enable overcommitment. The scheduler counts requests for placement but limits for enforcement. When actual usage exceeds node capacity, the kernel intervenes. Burstable pods with high gap between requests and limits are most at risk."
    },
    {
      "level": 2,
      "diff": 1,
      "scenario": 4,
      "q": "Which JVM flag, on by default since Java 11, prevents the JVM from assuming it has access to the full host memory inside a container?",
      "opts": [
        "-Xmx — this flag sets the maximum heap size but does not affect how the JVM discovers the container's memory boundary or CPU count",
        "-XX:MaxMetaspaceSize — this flag caps Metaspace growth but does not affect how the JVM detects whether it is running inside a container",
        "-XX:+UseContainerSupport",
        "-XX:+PrintGC — this flag enables GC logging but does not change how the JVM reads memory limits from the host or container environment",
        "-XX:+HeapDumpOnOutOfMemoryError — this flag captures heap dumps on OOM but does not prevent the JVM from using host memory for sizing"
      ],
      "ans": 2,
      "fb": "UseContainerSupport makes the JVM read cgroup limits instead of /proc/meminfo. It is on by default in modern JDKs. Without it, the JVM sizes itself for the host node, not the container."
    },
    {
      "level": 2,
      "diff": 2,
      "scenario": 3,
      "q": "After an OOMKill, you find that the JVM produced a heap dump file (heap.hprof). What does this tell you about the kill mechanism?",
      "opts": [
        "Kubernetes wrote the dump automatically as part of its container termination process to aid in post-mortem debugging of OOMKill events",
        "The sidecar container captured the heap dump by monitoring the main container's memory usage and triggering jcmd before the kill occurred",
        "OOMKill always produces heap dump files — the Linux kernel writes a core dump of the JVM process before sending SIGKILL to the container",
        "The JVM detected OutOfMemoryError first and wrote the dump via -XX:+HeapDumpOnOutOfMemoryError before the kernel killed the container",
        "The Linux kernel produced the dump as part of its OOM killer process, writing the JVM's heap state to the container's filesystem"
      ],
      "ans": 3,
      "fb": "A heap dump exists only if the JVM had time to write it. OOMKill by itself is instant SIGKILL. The dump indicates the JVM detected a heap-level OOM first, wrote the dump, and then the process was killed. This means the heap was full."
    },
    {
      "level": 2,
      "diff": 2,
      "scenario": 2,
      "q": "Which Kubernetes annotation or metric most directly tells you how much memory a pod is actually using at runtime?",
      "opts": [
        "Pod labels — Kubernetes encodes the current memory usage into pod labels that are updated by the kubelet on each metrics scrape interval",
        "container_memory_working_set_bytes from cAdvisor / kubelet metrics",
        "Node allocatable — this field in the node status shows how much memory is available per pod and reflects the actual usage of each container",
        "Pod annotations — the scheduler writes the observed memory usage into pod annotations that can be queried via the Kubernetes API",
        "Service mesh metrics — the Istio sidecar monitors container memory usage and exposes it as a Prometheus metric with per-pod granularity"
      ],
      "ans": 1,
      "fb": "container_memory_working_set_bytes reports actual RSS minus reclaimable cache, which is what the kernel enforces against the cgroup limit. It is the most accurate runtime metric for container memory usage."
    },
    {
      "level": 3,
      "diff": 1,
      "scenario": 2,
      "q": "What is the key difference between 'OutOfMemoryError: Java heap space' and 'OutOfMemoryError: GC overhead limit exceeded'?",
      "opts": [
        "Heap space means the heap is literally full; GC overhead means the JVM spent >98% of time in GC while reclaiming <2% — the heap is effectively full but technically has bytes left",
        "One is specific to containerised environments running on Kubernetes; the other occurs only in traditional VM deployments with direct OS access",
        "Heap space is always worse than GC overhead because it means no memory is left at all, whereas GC overhead still has recoverable headroom",
        "They are identical errors with different formatting — both indicate the heap is completely full and the JVM cannot allocate any new objects",
        "One is a fatal error that terminates the JVM; the other is a recoverable warning that the application can catch and handle gracefully"
      ],
      "ans": 0,
      "fb": "GC overhead limit exceeded is a throughput safeguard. The JVM decides the application is making no useful progress and throws rather than letting the app crawl. Both indicate heap pressure but from slightly different angles."
    },
    {
      "level": 3,
      "diff": 3,
      "scenario": 4,
      "q": "A team asks you to estimate memory for a new service: 150 threads, Metaspace ~100MB, 3 Kafka consumers with 32MB fetch buffer each, Caffeine cache target 500MB, JIT ~80MB. What container limit would you propose?",
      "opts": [
        "About 1.5Gi — set -Xmx to 1Gi for the cache and working set, plus 500MB for non-heap, which is sufficient for this service profile",
        "1Gi — the Caffeine cache is stored in off-heap memory by default, so the container only needs heap for the working set and non-heap overhead",
        "4Gi — always provision 2x the expected total memory to ensure safety margin for load spikes and non-heap growth under peak traffic",
        "Cannot estimate without running the service in production first — theoretical calculations are unreliable for container memory sizing decisions",
        "About 1.8–2Gi: heap must hold 500MB cache + working set (say 700MB heap), plus ~150MB stacks + 100MB Metaspace + 96MB Kafka + 80MB JIT + overhead ≈ 1.8Gi"
      ],
      "ans": 4,
      "fb": "Sum the slices: 700MB heap + 150MB stacks + 100MB Meta + 96MB Kafka buffers + 80MB JIT + ~100MB native ≈ 1.23Gi. Add safety margin → ~1.5-1.8Gi. 2Gi gives comfortable headroom. The cache lives inside the heap."
    },
    {
      "level": 3,
      "diff": 2,
      "scenario": 0,
      "q": "A service's Spring Boot @Scheduled job runs every 5 minutes and processes a batch of 10,000 records. After each run, heap climbs by 50MB and only partially recovers. What should you check first?",
      "opts": [
        "Network latency — slow network responses during the batch job cause the HTTP client to buffer data in memory that is not released between runs",
        "Disk I/O — the batch job writes large temporary files that are memory-mapped and remain in the container's RSS between scheduled executions",
        "Pod count — too few replicas cause each pod to process more records, which naturally increases heap usage proportionally to batch size",
        "CPU throttling — the pod does not have enough CPU to run GC effectively between batch executions, causing partial recovery after each run",
        "Whether the batch method holds references to processed records beyond its scope — leaked references in a static collection, a growing list field, or an unbounded result set"
      ],
      "ans": 4,
      "fb": "Heap that climbs and only partially recovers after a scheduled job suggests references are surviving GC. Common culprits: results accumulated in a field, static collections, or logging contexts retaining data across runs."
    },
    {
      "level": 3,
      "diff": 1,
      "scenario": 3,
      "q": "During code review, you see a Spring service injecting a prototype-scoped bean into a singleton. What is the memory concern?",
      "opts": [
        "CPU issue — prototype beans are expensive to create and injecting one into a singleton causes repeated instantiation on every method call",
        "No concern — Spring correctly handles prototype-into-singleton injection by creating a new prototype instance for each method invocation automatically",
        "The prototype scope creates a new instance per injection point, but the singleton holds one reference forever — not a leak per se, but the developer likely expected a new instance on each use",
        "Thread safety only — the prototype bean is shared across all threads via the singleton reference and needs explicit synchronisation for safe access",
        "Disk issue — prototype beans are serialised to disk by Spring to support scope transitions, consuming ephemeral storage on each injection"
      ],
      "ans": 2,
      "fb": "Injecting a prototype into a singleton gives you one instance, defeating the intent of prototype scope. It is not a leak but a design mistake. If the developer wanted per-request instances, they need a Provider<T> or ObjectFactory."
    },
    {
      "level": 3,
      "diff": 3,
      "scenario": 1,
      "q": "Actuator metrics show jvm.buffer.memory.used{id='direct'} growing by 10MB/hour but jvm.buffer.count{id='direct'} is flat. What does this combination suggest?",
      "opts": [
        "Existing direct buffers are being resized larger, not new buffers being created — likely a library or NIO channel enlarging its allocation",
        "Normal behaviour — direct buffer memory fluctuates with I/O load and growth with flat count is expected during periods of sustained traffic",
        "A class loader leak — direct buffer count is stable because the leaked class loaders are holding references to existing buffers and inflating them",
        "A thread leak — new threads are being created that share existing direct buffers, causing each buffer to grow proportionally to thread count",
        "A heap leak — the growing jvm.buffer.memory.used metric reflects heap-side buffer wrappers that accumulate alongside their off-heap allocations"
      ],
      "ans": 0,
      "fb": "Flat count + growing memory means existing buffers are growing in size. This can happen with NIO channels or libraries that dynamically resize their internal direct buffers. Identifying which library owns those buffers is the next step."
    },
    {
      "level": 3,
      "diff": 2,
      "scenario": 2,
      "q": "A service hits 'OutOfMemoryError: Metaspace' but loaded class count is only 12,000 — modest for a Spring Boot app. What else could be filling Metaspace?",
      "opts": [
        "Heap pressure — when the heap is under GC pressure, the JVM moves overflow objects into Metaspace as a secondary storage area for live data",
        "Too many threads — each thread stores its execution metadata in Metaspace, and 12,000 classes combined with many threads overwhelms the region",
        "Large method bytecode, debug info retained at runtime, or heavy use of reflection/dynamic proxies inflating per-class metadata size",
        "CPU throttling — insufficient CPU prevents the JVM from compacting Metaspace efficiently, causing fragmentation that inflates memory usage",
        "Disk I/O — the JVM pages Metaspace to disk and the metric reflects the total virtual size rather than actual resident memory consumption"
      ],
      "ans": 2,
      "fb": "Metaspace stores more than class counts suggest: method bytecode, constant pools, annotations, and debug symbols. A modest class count with large per-class metadata can still exhaust Metaspace, especially with MaxMetaspaceSize capped low."
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 0,
      "q": "A Spring Boot service's heap usage has been climbing for three days. You need to capture a heap dump from the running pod without restarting it for analysis in Eclipse MAT. Which approach do you use?",
      "opts": [
        "Wait for an OOMKill and hope HeapDumpOnOutOfMemoryError was set — this produces the most accurate dump because it captures the exact moment of failure",
        "Run kubectl logs and search for OutOfMemoryError messages to identify which object type is consuming the most heap memory in the application",
        "Run jcmd <pid> GC.heap_dump /tmp/heap.hprof inside the container to capture a live dump",
        "Download the Grafana JVM memory metrics as a CSV file and analyse the heap usage trends to identify which component is leaking memory",
        "Restart the pod and hope the problem reproduces — a fresh start with HeapDumpOnOutOfMemoryError enabled will capture the dump next time"
      ],
      "ans": 2,
      "fb": "jcmd <pid> GC.heap_dump captures a heap dump from a running JVM without restart. It briefly pauses all threads but is safe for production. Waiting for OOMKill may never produce a dump if the flag was not set. Grafana metrics cannot show individual object retention."
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 0,
      "q": "In Eclipse MAT, a ConcurrentHashMap shows 'Retained Heap' of 800MB in a 1GB heap. What does 'retained heap' mean?",
      "opts": [
        "The total memory that would be freed if this map were garbage collected — including everything it exclusively references",
        "The map's own memory usage — the internal structure, hash buckets, and node entries that make up the ConcurrentHashMap data structure itself",
        "Memory allocated by the JVM for this map but not yet used — committed but unoccupied slots in the hash table's internal backing array",
        "The maximum heap memory this map can grow to based on its initial capacity and load factor configuration parameters",
        "Memory used by the map's keys only — retained heap excludes values because they may be referenced by other objects in the heap"
      ],
      "ans": 0,
      "fb": "Retained heap = memory freed if this object and all objects it exclusively retains were GC'd. 800MB retained means the map references an object graph totalling 800MB. The map's 'shallow heap' (structure itself) might be a few MB. Retained heap is the key metric for finding leaks in MAT."
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 0,
      "q": "A heap dump shows 600MB of byte[] retained by a single LinkedHashMap with access-order enabled but no eviction. The service is multi-tenant. What is the diagnosis?",
      "opts": [
        "A Kafka consumer buffer — the byte[] arrays are fetch buffers allocated per tenant by the Kafka consumer for multi-tenant message processing",
        "An unbounded LRU-style cache accumulating entries per tenant without eviction",
        "HikariCP connection state — each database connection stores per-tenant prepared statement caches as byte[] arrays in a LinkedHashMap structure",
        "Normal serialisation buffers — Jackson or Protobuf serialisation uses a LinkedHashMap to buffer byte[] data during multi-tenant request handling",
        "A logging buffer — the logging framework accumulates per-tenant log entries as byte[] arrays in an access-ordered map for deferred writing"
      ],
      "ans": 1,
      "fb": "LinkedHashMap with access-order is an LRU cache, but without removeEldestEntry() returning true, entries accumulate forever. In multi-tenant service, each tenant's data adds permanently. Fix: switch to Caffeine with maximumSize and expireAfterWrite."
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 1,
      "q": "In GC logs, a collection event shows 'before' and 'after' heap sizes nearly equal. What does this indicate?",
      "opts": [
        "The heap is correctly sized — before and after being nearly equal means the heap has exactly the right amount of space for the working set",
        "GC ran but reclaimed almost no memory — most objects survived, suggesting a potential leak or undersized heap",
        "GC did not actually run — the log entry is a no-op marker that the JVM considered running GC but decided the heap was healthy enough",
        "GC ran efficiently — nearly equal before and after values indicate the collector only processed a small, targeted region as intended",
        "The GC log format is wrong — a corrupt or misconfigured log parser is showing identical before and after values due to a parsing error"
      ],
      "ans": 1,
      "fb": "If before ~= after, very few objects were collected — most are still reachable. Repeated pattern = strong leak signal or severely undersized heap. Healthy GC shows significant drops: before >> after."
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 1,
      "q": "GC logs show frequent minor GCs with high allocation rate, but old-gen stays stable. Is this a problem?",
      "opts": [
        "No — high allocation of short-lived objects is normal under load. Stable old-gen means objects are collected in young gen. It's throughput, not a leak.",
        "No — but only if the allocation rate stays below 1GB/s; above that threshold, the young generation cannot keep up and promotion to old gen begins",
        "Yes — frequent minor GC is always problematic because each collection pauses application threads and degrades latency for in-flight requests",
        "Yes — frequent minor GC with high allocation rate is the early stage of a memory leak before it becomes visible in old generation growth",
        "Yes — Eden space is too small for the allocation rate and should be increased by raising -XX:NewRatio to give young generation more room"
      ],
      "ans": 0,
      "fb": "High allocation rate with stable old-gen = healthy high-throughput pattern. Short-lived objects created and collected in young gen. If old-gen were rising, that would indicate promotion and a leak signal."
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 1,
      "q": "After a leak fix, GC logs show old-gen growth has slowed but not stopped. Over 24 hours, old-gen rises by 50MB. Is the fix complete?",
      "opts": [
        "No — a complete fix would produce stable old-gen baseline with sawtooth. Ongoing growth means retained objects still accumulating. Further profiling needed.",
        "Wait a week before drawing conclusions — 24 hours of data is insufficient to determine whether old-gen growth has truly stabilised or not",
        "Yes — 50MB/day of old-gen growth is normal for any Spring Boot service because long-lived beans and caches naturally accumulate in old gen",
        "Yes — slow growth is acceptable because G1 will eventually run a full collection to reclaim the accumulated old-gen objects automatically",
        "No — switch GC algorithms from G1 to ZGC or Shenandoah, which handle old-gen growth differently and would resolve the remaining growth"
      ],
      "ans": 0,
      "fb": "A properly fixed service shows stable old-gen — rises and falls with GC around a baseline. 50MB/day x 30 days = 1.5GB — eventual crisis. Take two heap dumps 4 hours apart, compare in MAT."
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 2,
      "q": "A service has high GC overhead but Grafana only shows aggregate heap and pause metrics. You need to find which code paths are creating the most garbage. Which tool gives you method-level allocation detail in production?",
      "opts": [
        "JFR (Java Flight Recorder) — it profiles allocation hotspots at method level with <1% overhead, showing exactly which call sites produce the most objects",
        "Use kubectl top pod to identify which pods have the highest memory usage and correlate that with GC overhead to find the allocation source",
        "Take a heap dump every hour and compare them in Eclipse MAT to identify which objects are growing, which reveals the allocation hotspot",
        "Increase Grafana retention to 90 days so you can correlate GC overhead with historical deployment changes and identify the code change responsible",
        "Add more log statements around suspected allocation paths and measure how much garbage each code path produces by logging object creation counts"
      ],
      "ans": 0,
      "fb": "JFR profiles at method level: which methods allocate the most bytes, allocation rate per call site, and object sizes. Grafana shows aggregates only. Heap dumps show retained state but not allocation flow. JFR is production-safe with negligible overhead."
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 2,
      "q": "A JFR recording shows the top allocator is byte[] from ch.qos.logback.classic.Logger at 300MB/s. What does this mean?",
      "opts": [
        "The service generates enormous log output, and string formatting allocates byte arrays at massive rate, increasing GC pressure",
        "Logback has a memory leak that retains log message buffers in a growing internal cache without eviction or size limits configured",
        "The bytes are from Kafka consumer fetch buffers that happen to be allocated in the same stack frame as the logger due to thread reuse",
        "JFR is miscounting allocations — the Logback stack frame appears as the top allocator due to a known sampling bias in TLAB profiling",
        "Logback needs upgrading to a newer version that uses a more efficient byte[] pooling strategy for log message formatting operations"
      ],
      "ans": 0,
      "fb": "Log message formatting creates temporary byte[] and String objects. At DEBUG level with high request volume, this produces hundreds of MB/s of garbage. Fix: set production logging to INFO, use parameterised logging (log.info('msg {}', var))."
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 2,
      "q": "JFR shows TierEvaluationContext objects being promoted to old gen despite being short-lived. What explains this?",
      "opts": [
        "JFR is misreporting — the allocation events are tagged with the wrong generation due to a known sampling artifact in the TLAB event parser",
        "The objects are too large for the young generation regions and are allocated directly into old gen as humongous objects by the G1 collector",
        "The tier calculation spans multiple minor GC cycles — objects survive collections during processing and get promoted",
        "The objects are static singletons created during Spring context initialisation that are placed directly in old gen by the JVM's allocator",
        "Old gen is undersized — with a larger old generation region, these objects would have room to be collected before they cause promotion pressure"
      ],
      "ans": 2,
      "fb": "Promotion happens when objects survive enough young gen collections. If calculation takes longer than minor GC interval, objects created at the start survive and get promoted. Fix: make calculations faster or increase young gen size."
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 3,
      "q": "A thread dump shows 150 threads in TIMED_WAITING inside HikariPool.getConnection. What does this indicate?",
      "opts": [
        "There is a deadlock between the HikariCP pool threads — two connections are waiting for each other's locks and blocking the entire pool",
        "The connection pool is exhausted — 150 threads are queued waiting for a connection",
        "The database is performing normally — TIMED_WAITING in getConnection is the standard state for idle threads waiting for work assignments",
        "Too many threads are configured in the application — reducing server.tomcat.threads.max would eliminate the TIMED_WAITING state",
        "Kafka consumer threads are blocked on database connections and causing a cascade that appears as HikariPool contention in the thread dump"
      ],
      "ans": 1,
      "fb": "TIMED_WAITING inside HikariPool.getConnection means threads are waiting for a connection from the pool. 150 waiting = pool fully checked out. Cascades into HTTP timeouts. Root cause: leaked connections, slow queries, or undersized pool."
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 3,
      "q": "A thread dump shows deadlock: Thread A holds lock X, waits for Y. Thread B holds lock Y, waits for X. Both in @Transactional methods. Most likely cause?",
      "opts": [
        "Two transactions acquiring database row locks in different orders",
        "A JVM bug — the HotSpot JVM has a known issue with monitor inflation that can produce false deadlock reports in thread dumps",
        "Kafka consumer threads interfering — the consumer rebalance protocol acquires internal locks that conflict with the @Transactional method locks",
        "HikariCP internal deadlock — the connection pool's internal synchronization can deadlock when two connections are checked out simultaneously",
        "Spring's proxy mechanism — the CGLIB proxy wrapping the @Transactional method introduces an additional monitor that conflicts with the method's lock"
      ],
      "ans": 0,
      "fb": "Classic lock-ordering deadlock at the database level. Thread A locks row X then needs Y; Thread B locked Y then needs X. Fix: consistent lock ordering (always lower ID first) or optimistic locking (@Version)."
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 3,
      "q": "A thread dump shows 200 threads — 180 in RUNNABLE inside java.util.HashMap.put. What could cause this?",
      "opts": [
        "GC interfering — a concurrent GC cycle is holding all 180 threads in a safe-point barrier while it relocates the HashMap's backing array",
        "Normal HashMap usage — 180 threads performing concurrent put operations is expected behaviour under high load and RUNNABLE is the healthy state",
        "The map is too large — HashMap performance degrades linearly with size, and the large number of entries causes put operations to take longer",
        "The hashCode computation is slow — a poorly implemented hashCode method on the key class causes each put to spend excessive CPU on hashing",
        "A non-thread-safe HashMap used concurrently — multiple threads cause infinite loop in bucket chains"
      ],
      "ans": 4,
      "fb": "HashMap is not thread-safe. Concurrent modification can form cycles in bucket chains. Threads get stuck in infinite loops inside put(), appearing RUNNABLE but burning CPU forever. Fix: use ConcurrentHashMap or synchronise access."
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 4,
      "q": "A service's Metaspace usage grows slowly over weeks, long after startup. What is the most likely cause?",
      "opts": [
        "Metaspace fragmentation — the JVM cannot compact Metaspace, so freed class metadata leaves gaps that inflate the committed memory over time",
        "The JVM loading more classpath classes over time — Spring Boot defers loading of many framework classes until weeks after startup as features are used",
        "GC not running on Metaspace — the garbage collector does not manage Metaspace by default and classes are never unloaded without explicit configuration",
        "Dynamic class generation — CGLIB proxies, SpEL compilation, reflection-based serialisation creating new classes at runtime",
        "Normal class loading during every request — each HTTP request loads a fresh set of handler classes from the classpath for request processing"
      ],
      "ans": 3,
      "fb": "After startup, classpath is fully loaded and Metaspace should plateau. Continued growth means runtime class creation. Common: CGLIB proxy regeneration, SpEL per unique expression, Groovy scripts creating classloaders."
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 4,
      "q": "Metaspace grows 5MB/day. At this rate, the container will eventually be OOM-killed. What is the two-part fix?",
      "opts": [
        "Switch to ZGC — ZGC handles Metaspace growth more efficiently than G1 and can reclaim class metadata without stop-the-world pauses",
        "Set -XX:MaxMetaspaceSize as safety net (e.g., 256m) AND investigate what generates classes at runtime",
        "Just reduce -Xmx to leave more room for Metaspace growth within the container limit, accommodating the 5MB/day growth rate longer",
        "Just increase the container limit to accommodate the Metaspace growth — adding 2Gi of headroom gives 400 days before the next issue",
        "Restart the pod daily on a cron schedule to clear accumulated Metaspace entries before they grow large enough to cause an OOMKill"
      ],
      "ans": 1,
      "fb": "Part 1: MaxMetaspaceSize converts silent OOMKill into visible OutOfMemoryError: Metaspace. Part 2: Use JFR class loading events or -verbose:class to find the source. Common fixes: disable DevTools in prod, cache compiled SpEL, switch serialisation libraries."
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 0,
      "q": "In Eclipse MAT, you open a heap dump and see the Dominator Tree. You notice the top entry retains 70% of the heap. What should you do first?",
      "opts": [
        "Expand the dominator entry and use 'Path to GC Roots — exclude weak/soft references' to trace what keeps this object alive and determine if it is a leak or a legitimate large structure",
        "Delete the heap dump and take a new one after restarting the service, because the first dump was captured at an unrepresentative moment",
        "Restart the service immediately — a single object retaining 70% of the heap is always a critical leak that requires an immediate restart",
        "Increase the heap to 2x its current size so the dominator object has more room and does not cause GC pressure during normal operation",
        "Check CPU metrics — the dominator tree often misattributes CPU-intensive objects as memory-dominant due to JIT compilation overhead"
      ],
      "ans": 0,
      "fb": "The Dominator Tree shows objects that exclusively retain large amounts of memory. When one entry dominates, tracing its GC roots reveals whether it is anchored by a static field, a Spring singleton, or a legitimate data structure. This determines leak vs design."
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 0,
      "q": "In Eclipse MAT, you find a single ConcurrentHashMap retaining 600MB on the dominator tree. Inspecting its key/value class shows User → SessionContext. Which next analysis confirms a leak vs an oversized cache?",
      "opts": [
        "Use jstack to capture a thread dump and correlate thread activity with the ConcurrentHashMap to identify which threads are populating it",
        "Restart the pod to clear the map and observe whether it regrows — if it does, the leak is confirmed and if it doesn't, it was a one-time event",
        "Open the JVM application logs and search for session creation events to determine whether the User→SessionContext entries are being logged",
        "Look at retained size only — if retained size exceeds 500MB, it is definitively a leak; if under 500MB, it is a correctly sized cache",
        "Use 'Path to GC Roots — exclude weak/soft references' to see what is keeping the map alive and check the entry count vs expected user count"
      ],
      "ans": 4,
      "fb": "Path to GC Roots reveals whether the map is held by a static or a long-lived bean (a leak signature) versus a Cache abstraction with a configured size. If entries vastly exceed the expected user count, it is a leak."
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 0,
      "q": "A heap dump's dominator tree shows 70% retained by class 'org.springframework.cglib.proxy.Enhancer'. Heap dumps from a healthy pod do not show this. What hypothesis fits best?",
      "opts": [
        "CGLib is allocating proxy structures in off-heap direct byte buffers, which explains why the heap dump shows high retained size in the Enhancer",
        "Spring is broken — the framework has a known bug where CGLib proxy metadata accumulates in the dominator tree during prolonged operation",
        "CPU is starved — the JVM cannot complete CGLib proxy compilation fast enough, causing partially constructed proxy objects to accumulate in heap",
        "CGLib is generating proxies repeatedly without releasing — class loader leak via dynamic proxying",
        "The heap is too small for the number of Spring beans — increasing -Xmx would give CGLib enough room to manage its proxy cache efficiently"
      ],
      "ans": 3,
      "fb": "CGLib generates new classes for proxies. If application code creates new application contexts or scopes that generate fresh proxies without cleaning up the old ones, those generated classes accumulate via class loaders. This is a classic class loader leak path."
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 1,
      "q": "GC logs from a struggling service show mostly 'pause (mixed)' events with long durations, whereas a healthy version of the same service shows mostly 'pause (young)' events. What does the shift to mixed pauses indicate?",
      "opts": [
        "Mixed pauses are always bad — they indicate the G1 collector is struggling and should be replaced with ZGC or Shenandoah immediately",
        "The shift to mixed pauses means G1 is now evacuating old-gen regions alongside young, indicating old-gen has accumulated enough garbage (or live data) to require collection — a sign of increased promotion or retention",
        "Mixed pauses use less CPU than young pauses because they process fewer regions at once, so the shift actually indicates improved efficiency",
        "The GC algorithm changed — the JVM automatically switched from young-only G1 to mixed-mode G1 as a tuning optimisation after observing the workload",
        "Young pauses stopped working — the young generation is exhausted and G1 fell back to mixed-mode as a degraded operation mode"
      ],
      "ans": 1,
      "fb": "G1 young pauses evacuate only young regions. Mixed pauses additionally evacuate old regions identified during concurrent marking. A shift toward mixed pauses indicates more objects are surviving to old gen — either higher promotion rate or a leak."
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 1,
      "q": "GC logs show steadily growing 'Heap before GC' values across many cycles, even after young collections. Which metric should you compute next?",
      "opts": [
        "Disk I/O — heap growth often correlates with disk activity because the JVM pages heap data to the container's ephemeral storage under pressure",
        "JIT compilation count — increasing compilations consume more code cache which shows up as heap growth in the GC log summary",
        "CPU usage — GC-related CPU consumption indicates how much processing time is spent on collections versus application logic per second",
        "Promotion rate (bytes promoted to Old Gen per second)",
        "Network bandwidth — incoming data volume correlates directly with heap growth because each received byte is buffered as a heap-allocated object"
      ],
      "ans": 3,
      "fb": "Steady heap growth despite frequent young collections means objects are surviving long enough to be promoted. Promotion rate quantifies how fast Old Gen fills, which lets you predict full collections and identify leaks vs working-set growth."
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 1,
      "q": "GC logs show many 'to-space exhausted' events. What does this indicate and what is the typical fix?",
      "opts": [
        "G1 ran out of free regions to evacuate live objects into; common fixes are increasing heap, increasing G1ReservePercent, or reducing allocation rate",
        "Corrupt GC logs — the to-space exhausted message is a log parsing artifact that appears when the log file is truncated or rotated mid-write",
        "A JIT compilation problem — the JIT compiler is consuming too many regions for compiled code storage, leaving insufficient space for evacuation",
        "Disk full — the JVM uses disk-backed overflow for heap regions when memory is tight, and to-space exhausted means the disk is out of space",
        "A network issue — the JVM is waiting for remote memory pages from the container runtime and times out during the evacuation phase"
      ],
      "ans": 0,
      "fb": "To-space exhaustion forces G1 into more expensive collections (sometimes Full GC). Solutions include enlarging the heap, increasing the reserve, or addressing allocation pressure. It is a strong sign the heap is near capacity for the workload."
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 2,
      "q": "You open a JFR recording in JDK Mission Control to find allocation hotspots. The recording has many event types. Which event type directly tells you which methods are creating the most objects on the heap?",
      "opts": [
        "jdk.CPULoad — it shows CPU pressure which correlates with allocation rate because GC consumes CPU proportional to object creation volume",
        "jdk.FileRead — file I/O correlates with allocations because reading files creates byte[] arrays that are the most common heap allocation type",
        "jdk.GCHeapSummary — it shows heap totals after each collection, which can be used to infer which methods allocated the most objects",
        "jdk.ThreadSleep — it shows thread idle patterns which inversely correlate with allocation rate per thread during active processing phases",
        "jdk.ObjectAllocationInNewTLAB and jdk.ObjectAllocationOutsideTLAB — they capture heap allocations with the full stack trace of the allocating method"
      ],
      "ans": 4,
      "fb": "TLAB allocation events capture every significant heap allocation with the allocating stack trace. Sorting by total allocated bytes pinpoints exactly where GC pressure originates. CPULoad shows aggregate CPU, not allocation detail."
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 2,
      "q": "In JFR, the 'Allocation in new TLAB' event for a 60s recording lists one stack frame (a JSON serializer) as 60% of allocations. What action is most appropriate?",
      "opts": [
        "Reduce thread count to lower the overall allocation rate because fewer threads means fewer concurrent serialization operations producing garbage",
        "Increase -Xmx to give the JVM more room for the serializer's temporary allocations so GC runs less frequently during serialization",
        "Ignore the finding — JFR is unreliable for allocation profiling because its sampling introduces significant bias toward high-frequency call sites",
        "Disable JFR because the profiling overhead itself is causing the allocation spike that appears concentrated in the serializer path",
        "Investigate that serializer: maybe it's allocating large temporary buffers or recreating objects unnecessarily"
      ],
      "ans": 4,
      "fb": "JFR's allocation events directly identify where the JVM creates pressure on GC. Concentrated allocation in one site is the easiest optimisation lever. Pre-allocating buffers, reusing instances, or switching to streaming often makes a measurable difference."
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 2,
      "q": "A JFR recording shows allocation rate of 1.2 GB/s. The heap is only 4 GB. What does this combination tell you about GC pressure?",
      "opts": [
        "CPU bound — the high allocation rate indicates a CPU bottleneck because object creation is proportional to instruction throughput on the processor",
        "Disk bound — the 1.2 GB/s allocation rate suggests the service is reading large files from disk and buffering them on the heap during processing",
        "Very high allocation churn — young generation will fill rapidly and force frequent collections, raising overhead and pause frequency",
        "No pressure — 1.2 GB/s is within the normal allocation range for a busy Spring Boot service and does not indicate any GC concern",
        "Low pressure — a 4 GB heap can easily handle 1.2 GB/s allocation because G1 collects the young generation incrementally without overhead"
      ],
      "ans": 2,
      "fb": "High allocation rate relative to heap size produces frequent young collections. Even if individual pauses are short, the cumulative GC overhead grows. Either reduce allocation churn or grow the heap so collections happen less often."
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 3,
      "q": "You take a thread dump with jstack. Hundreds of threads are in state BLOCKED waiting on the same monitor. What does this indicate?",
      "opts": [
        "Network slowness — the threads are blocked waiting for TCP responses from an external service and the shared monitor is the network socket pool",
        "CPU starvation — the pod does not have enough CPU cores to run all threads concurrently, causing them to queue on the kernel scheduler",
        "A memory leak — the threads are blocked waiting for GC to free heap space, and the monitor is the GC synchronization barrier",
        "Lock contention on a single object — likely a bottleneck",
        "Healthy concurrency — threads temporarily entering BLOCKED state is normal under load and does not indicate any performance concern"
      ],
      "ans": 3,
      "fb": "Many threads BLOCKED on the same monitor is the classic signature of contention. The next step is to identify which object is being locked and whether the critical section can be reduced or replaced with a lock-free structure."
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 3,
      "q": "A thread dump shows all 100 HikariCP-managed worker threads in WAITING on getConnection. What conclusion is most likely?",
      "opts": [
        "A JVM bug — the HotSpot JVM has a known issue where HikariCP worker threads enter a permanent WAITING state after a GC safe-point event",
        "A deadlock between two connections — each connection is waiting for the other to release a database lock, creating a circular dependency",
        "CPU bound — the threads are waiting for CPU time because the pod does not have enough CPU resources to process all 100 connections concurrently",
        "Network bandwidth — the threads are waiting for network buffers to become available because the connection pool shares a single network channel",
        "Connection pool exhaustion — connections are not being released or the pool is too small for the workload"
      ],
      "ans": 4,
      "fb": "Threads waiting in getConnection means no connection is available. Causes: a leak (connections not closed), long-running queries holding connections, or pool size too small. Investigation starts with leak detection and slow query analysis."
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 3,
      "q": "Hundreds of threads sit in BLOCKED on a synchronized method of an internal logging utility class. What is the likely architectural issue?",
      "opts": [
        "Logging is fast — the synchronized block is necessary for correctness and the BLOCKED state is temporary and will resolve as load decreases",
        "CPU is high — the logging utility is consuming excessive CPU for string formatting and the BLOCKED threads are waiting for CPU time slices",
        "The heap is full — the logging utility is allocating large log message strings that fill the heap and cause all threads to wait for GC",
        "DNS is slow — the logging utility resolves hostnames for remote log shipping and DNS latency causes all threads to wait on the lookup",
        "A poorly chosen lock granularity in the logger creates a global serialization point under load"
      ],
      "ans": 4,
      "fb": "Logging is invoked by every request. A coarse-grained lock around log writes serialises the whole service. Modern loggers use lock-free or per-appender concurrency. Migrating or fixing the lock granularity removes the bottleneck."
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 4,
      "q": "NMT summary shows 'Class' memory at 280MB but Actuator reports Metaspace used at 200MB and Compressed Class Space at 80MB. A junior asks why the numbers don't match. What is the correct explanation?",
      "opts": [
        "CCS is for direct buffers — Compressed Class Space stores compressed direct byte buffer references and is separate from Metaspace entirely",
        "NMT is inaccurate — it over-counts by including both Metaspace and CCS separately, when they should be reported as a single combined value",
        "The numbers should be identical because Metaspace and CCS measure the same thing and 280MB vs 200MB+80MB indicates a measurement discrepancy",
        "Compressed Class Space is a sub-region within Metaspace that stores compressed class pointers — the 200MB Metaspace + 80MB CCS = 280MB total, matching NMT's Class category",
        "The 80MB of Compressed Class Space is allocated on the heap and should be subtracted from jvm.memory.used{area=heap} for accurate heap reporting"
      ],
      "ans": 3,
      "fb": "Compressed Class Space uses smaller pointers when heap is under 32GB. It is a slice of Metaspace with its own size cap (-XX:CompressedClassSpaceSize). NMT's 'Class' category covers both. Understanding this split matters when diagnosing which sub-region is growing."
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 4,
      "q": "A service shows MaxMetaspaceSize defaulting to unlimited and Metaspace climbing day over day. What is the diagnostic next step before assuming a class loader leak?",
      "opts": [
        "Rewrite the service in a language without Metaspace to eliminate the class metadata overhead that causes growth in long-running applications",
        "Restart the pod to clear the accumulated Metaspace and observe how quickly it regrows to determine the leak rate per hour of uptime",
        "Check whether classes are being loaded that should be unloaded — list class loaders via jcmd VM.classloader_stats and look for many small loaders",
        "Remove dependencies — fewer libraries means fewer classes loaded, which reduces Metaspace consumption and eliminates the growth pattern",
        "Increase the heap — Metaspace growth is caused by heap pressure forcing the JVM to move class metadata out of the heap into native memory"
      ],
      "ans": 2,
      "fb": "VM.classloader_stats lists class loaders and how many classes each holds. Many small or duplicate loaders indicate dynamic generation without unloading — the fingerprint of a leak. This step proves the hypothesis before pursuing fixes."
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 4,
      "q": "A service uses Groovy scripts that are recompiled at runtime to evaluate user-supplied rules. Metaspace grows by 200MB per day. What is the architectural fix, not just a tuning fix?",
      "opts": [
        "Increase the heap to give the JVM more room for the class metadata that Groovy generates, which is stored on the heap in newer JVM versions",
        "Disable Groovy entirely and rewrite the user-supplied rules in Java, which does not generate classes at runtime for evaluation logic",
        "Reboot the pod daily on a cron schedule to clear the accumulated Groovy class definitions before they exhaust Metaspace capacity",
        "Increase MaxMetaspaceSize to accommodate the growth rate — at 200MB/day, setting it to 2GB gives 10 days of headroom between restarts",
        "Cache compiled scripts by content hash so identical scripts are not recompiled, ensuring class definitions are stable and unloadable"
      ],
      "ans": 4,
      "fb": "Recompiling identical content creates a new class loader and class definition each time. Caching by content hash means a given script compiles once. Without this, no MaxMetaspaceSize is large enough to hide the underlying churn."
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 0,
      "q": "In Eclipse MAT, you open the 'Leak Suspects' report. It shows two suspects — one retaining 40MB, one retaining 200MB. Which should you investigate first and why?",
      "opts": [
        "Whichever has more instances — a higher instance count indicates a more active allocation path that is more likely to be the true leak source",
        "Both equally — they are independent leaks and should be investigated in parallel because neither depends on the other",
        "The 200MB suspect — it represents more retained memory and is more likely the primary leak source",
        "Neither — Leak Suspects is unreliable and should not be used for diagnosis; use the Dominator Tree and Path to GC Roots directly instead",
        "The 40MB suspect — smaller leaks are easier to fix quickly, and resolving it first may release objects that reduce the larger suspect too"
      ],
      "ans": 2,
      "fb": "MAT ranks leak suspects by retained heap. The larger retained size is almost always the more impactful leak. Starting there maximises the return on investigation time. The smaller suspect may also be real, but address the biggest impact first."
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 1,
      "q": "GC logs show concurrent mark cycles starting back-to-back. What does this say about the heap?",
      "opts": [
        "The heap is filling fast enough that concurrent marking cannot keep up between cycles — Old Gen is under sustained pressure",
        "GC is broken — back-to-back concurrent mark cycles indicate a misconfigured collector that should be replaced with ZGC or Shenandoah",
        "The heap is too large — reducing -Xmx would force collections to finish faster, preventing the back-to-back marking cycle pattern",
        "The network is busy — high network throughput causes the GC to initiate concurrent marking to reclaim buffer objects before they overwhelm the heap",
        "CPU is too low — the JVM does not have enough CPU cores to complete concurrent marking fast enough, requiring it to restart immediately"
      ],
      "ans": 0,
      "fb": "Back-to-back concurrent marks indicate G1 cannot reclaim Old Gen as fast as it fills. If this persists, full collections become likely. Either reduce promotion rate or grow the heap."
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 2,
      "q": "A JFR recording shows TLAB allocations dominated by byte[] of size ~1MB created in a JSON parsing path. What is the most surgical fix?",
      "opts": [
        "Add more replicas to distribute the JSON parsing load across pods, reducing the per-pod allocation rate proportionally to replica count",
        "Switch to XML serialisation because XML parsers use SAX streaming by default and do not allocate large intermediate byte buffers per call",
        "Increase the heap to accommodate the 1MB per-call allocations — with a larger young generation, the GC can handle the allocation rate",
        "Disable JSON parsing entirely and switch to Protobuf or Avro which do not allocate byte arrays during their deserialisation pipeline",
        "Reuse a single, thread-local byte buffer for JSON parsing instead of allocating per-call"
      ],
      "ans": 4,
      "fb": "Parsing-time allocations are easy wins because they are short-lived but high-volume. Reusing a buffer (with a thread-local or a pool) cuts allocation pressure dramatically without changing semantics."
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 3,
      "q": "You want to detect a HikariCP connection leak in production with minimal risk. Which configuration helps?",
      "opts": [
        "Disable HikariCP entirely and let Spring Boot manage raw JDBC connections directly to eliminate the pool as a potential source of leaks",
        "Reduce the pool size to 1 connection so any leak is immediately visible as a complete connection exhaustion with a clear stack trace",
        "Set hikari.leakDetectionThreshold=30000 — HikariCP logs the stack trace of any connection held longer than the threshold",
        "Restart pods on a schedule to clear any leaked connections before they accumulate enough to exhaust the pool under normal traffic",
        "Disable connection pool logging to reduce I/O overhead and let the pool operate at maximum throughput without diagnostic interference"
      ],
      "ans": 2,
      "fb": "leakDetectionThreshold turns suspected leaks into actionable stack traces. Set it just above your normal max connection hold time so it does not produce false positives. It is one of the most useful HikariCP settings for diagnosis."
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 4,
      "q": "A service runs Java 17, has Metaspace stable but Compressed Class Space growing. Which configuration would let you cap CCS specifically?",
      "opts": [
        "-Xss — this flag controls the per-thread stack size and indirectly limits how much Compressed Class Space each thread can use for lookups",
        "-XX:+UseG1GC — switching to G1 enables better management of Compressed Class Space because G1 compacts class metadata more efficiently",
        "-Xms — the initial heap size affects how much native memory is reserved for Compressed Class Space at JVM startup before classes are loaded",
        "-XX:CompressedClassSpaceSize=256m",
        "-XX:NewRatio — this flag controls the ratio between young and old generation, which affects how much room is left for class metadata storage"
      ],
      "ans": 3,
      "fb": "CompressedClassSpaceSize caps the compressed class space sub-region. Setting it explicitly forces failure earlier and prevents native memory from being silently consumed by class metadata growth."
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 0,
      "q": "In Eclipse MAT, a HashMap shows 'Shallow Heap: 2MB' but 'Retained Heap: 500MB'. A teammate says the map only uses 2MB. Why is this dangerously wrong?",
      "opts": [
        "The map is corrupted — the large retained heap indicates internal data structure corruption causing MAT to over-estimate the memory footprint",
        "MAT is miscounting — the tool double-counts entries that are referenced by multiple keys, inflating the retained heap beyond actual usage",
        "Retained heap counts shared objects too — even objects referenced by other data structures are included, making the number unreliable for leaks",
        "Shallow heap is just the map's own structure; retained heap is the 500MB of objects exclusively kept alive through the map — if the map were collected, 500MB would be freed",
        "The 500MB is stored on disk — MAT reports the full serialised size of the map including entries that have been paged to the container's storage"
      ],
      "ans": 3,
      "fb": "Shallow heap measures only the object's own fields. Retained heap includes everything the object exclusively keeps alive. For leak analysis, retained heap is the metric that matters — it shows the true memory impact of removing a reference chain."
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 1,
      "q": "GC logs show frequent 'Full GC (System.gc())' lines. Which is the most likely cause?",
      "opts": [
        "A Kubernetes cron job that triggers Full GC externally via the Kubernetes API to proactively manage memory on JVM workloads in the cluster",
        "Healthy GC behaviour — Full GC (System.gc()) is the normal mechanism G1 uses for periodic old generation cleanup in production workloads",
        "Application or library code calling System.gc() — sometimes via java.nio.Bits when Direct buffers are exhausted",
        "A JVM bug — the HotSpot JVM occasionally triggers unexpected Full GC events that are labelled as System.gc() due to an internal logging error",
        "Kubernetes triggering GC — the kubelet sends a SIGUSR1 signal to the JVM to request garbage collection when the node is under memory pressure"
      ],
      "ans": 2,
      "fb": "Explicit Full GCs are unusual. Common culprits are application code calling System.gc() directly, frameworks doing it, or java.nio.Bits invoking it when direct buffer reservations fail. -XX:+DisableExplicitGC suppresses such calls if you confirm none are required."
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 2,
      "q": "You see 'OutOfMemoryError: Direct buffer memory' in production. JFR shows the leak path runs through a third-party HTTP client. What is the most defensible mitigation while a fix is developed?",
      "opts": [
        "Set -XX:MaxDirectMemorySize explicitly and add monitoring/alerts on direct buffer usage; bound the client's connection pool",
        "Restart pods every hour on a cron schedule to clear accumulated direct buffers before they reach the limit and cause the OOM error",
        "Remove the third-party HTTP client entirely and replace it with raw java.net.HttpURLConnection calls that do not leak direct buffers",
        "Increase -Xmx to give the JVM more room for direct buffer allocations, since direct buffers are bounded by -Xmx when MaxDirectMemorySize is unset",
        "Disable monitoring and alerting for direct buffer usage to reduce the noise from false-positive alerts while the upstream fix is developed"
      ],
      "ans": 0,
      "fb": "Bounding direct memory and the connection pool turns an unbounded leak into a controlled failure mode. Monitoring catches it early. These are mitigations, not fixes — the underlying client misuse must still be corrected."
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 3,
      "q": "A thread dump captured under load shows ~5 threads in RUNNABLE state stuck in java.util.regex.Matcher.match. What does this suggest?",
      "opts": [
        "Disk I/O — the regex engine reads pattern definitions from the filesystem on each match invocation, and slow disk is blocking the threads",
        "A GC pause — the threads are in a safe-point barrier waiting for GC to complete, but jstack misreports them as RUNNABLE in Matcher.match",
        "Catastrophic backtracking in a regex — pathological input is causing exponential matching time",
        "Network slowness — the regex engine is fetching pattern updates from a remote configuration service and network latency blocks each match call",
        "Healthy load — 5 threads in RUNNABLE performing regex matching is normal under peak traffic and does not indicate any performance concern"
      ],
      "ans": 2,
      "fb": "Long RUNNABLE time inside Matcher is the signature of regex backtracking. A small number of stuck threads matching a complex regex on adversarial input can saturate the CPU. Mitigation: simpler regex or input validation."
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 4,
      "q": "A service shows Metaspace=400MB and growing slowly. Number of loaded classes is stable at 18,000. Which conclusion is most defensible?",
      "opts": [
        "Normal behaviour — Metaspace always grows gradually even with a stable class count because the JVM reserves additional metadata space over time",
        "A class loader leak — even though the class count is stable, the leak manifests as retained class loader state that inflates Metaspace usage",
        "The growth is not new classes — investigate Metaspace fragmentation or NMT 'Class' detail; it may be internal CCS growth, not a leak",
        "CPU starvation — insufficient CPU prevents the JVM from compacting Metaspace efficiently, causing fragmentation that inflates committed memory",
        "Disk full — the JVM uses disk-backed storage for Metaspace overflow and the growing metric reflects both in-memory and on-disk class metadata"
      ],
      "ans": 2,
      "fb": "If class count is stable, it is not a class loader leak in the simple sense. Metaspace bookkeeping and fragmentation, or growth in native structures backing Metaspace, can still increase committed memory. NMT detail confirms which slice grew."
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 0,
      "q": "What kind of GC roots most frequently anchor leaks involving Spring beans?",
      "opts": [
        "Synchronization monitors — objects used as lock targets become permanent GC roots that prevent any referenced bean from being collected",
        "Local variables — beans referenced by local variables in active methods are the most common GC roots for Spring-related memory leaks",
        "Class loaders only — Spring beans are anchored exclusively through their class loaders, which retain all instances of each loaded class",
        "Static fields and ApplicationContext/SingletonBeanRegistry references",
        "Thread stack frames — beans referenced from active thread stacks are the primary root type because Tomcat threads run for the JVM's lifetime"
      ],
      "ans": 3,
      "fb": "Spring singletons live for the JVM's lifetime via the application context. Leaks rooted there will not be reclaimed regardless of GC. Static fields have the same effect. MAT's GC roots view exposes both clearly."
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 2,
      "q": "A JFR recording stored on a busy node has a high overhead. Which configuration reduces overhead while keeping useful data?",
      "opts": [
        "Disable JFR entirely on busy nodes — the profiling overhead is too high for production and it should only be used in staging environments",
        "Use the 'default' template, lower sample frequency, and shorter recording duration",
        "Use the 'profile' template — it provides more detailed data per event which reduces the total number of events needed for analysis",
        "Switch to async-profiler only — it has zero overhead compared to JFR because it uses hardware performance counters instead of software instrumentation",
        "Increase the heap by 20% to compensate for JFR's internal memory usage, which stores recording data in heap-allocated ring buffers"
      ],
      "ans": 1,
      "fb": "JFR's 'default' template is intentionally low overhead (~1%). Increasing duration and lowering sampling further reduces impact while still capturing aggregate trends. 'profile' is more detailed but higher overhead — keep for short investigations."
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 3,
      "q": "You analyse a thread dump and notice 200 threads named 'pool-7-thread-N' in WAITING on a LinkedBlockingQueue. The application is hanging. What is the typical root cause?",
      "opts": [
        "Disk I/O — the worker threads are waiting for tasks that are blocked on slow disk reads, and the LinkedBlockingQueue backs up while I/O completes",
        "An ExecutorService whose worker threads are waiting for tasks while the producer is also blocked elsewhere — likely a thread pool deadlock or starvation across pools",
        "CPU starvation — the pod does not have enough CPU cores for 200 threads, causing them to wait in the kernel scheduler's run queue for time slices",
        "The heap is full — the LinkedBlockingQueue's internal node allocations are failing due to heap exhaustion, causing threads to wait for GC to free space",
        "Healthy idle workers — 200 threads waiting on a LinkedBlockingQueue is the normal idle state of a thread pool that has no tasks to process"
      ],
      "ans": 1,
      "fb": "Pools waiting on their queues with the system hung often indicate inter-pool dependency problems: producer pool blocked, consumer pool idle, or shared resource contention. Map the dependency between pools to find the deadlock."
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 1,
      "q": "You need to capture a JFR recording on a running production JVM. Which command works without requiring a restart?",
      "opts": [
        "Run async-profiler instead since JFR requires a JVM restart with -XX:+UnlockCommercialFeatures before it can capture any recording data",
        "jcmd <pid> JFR.start name=trace duration=120s filename=trace.jfr — this starts an in-process recording immediately",
        "Take a heap dump with jmap -dump:live,format=b,file=/tmp/heap.hprof — heap dumps include allocation traces that serve the same purpose as JFR",
        "Restart the pod with JFR flags added to JAVA_OPTS — JFR must be configured at startup and cannot be enabled on a running JVM process",
        "Edit the deployment manifest to add -XX:FlightRecorderOptions and trigger a rolling restart to enable JFR on the next pod startup"
      ],
      "ans": 1,
      "fb": "jcmd JFR.start triggers a recording in-process without requiring a JVM restart. Modern JDKs include JFR by default. A 60-120s recording is usually enough to characterise allocation hotspots and GC behaviour."
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 0,
      "q": "A heap dump shows 40% retained by java.lang.ref.Finalizer references. What does this indicate?",
      "opts": [
        "Normal behaviour — Finalizer references naturally retain 30-40% of the heap in any application that uses file handles or network connections",
        "The heap is too small — increasing -Xmx would give the Finalizer thread more room to process its queue before references accumulate",
        "GC is broken — the collector should clear Finalizer references during each collection cycle but a configuration error is preventing cleanup",
        "A JVM bug — the Finalizer queue processing has a known issue in OpenJDK 17 where references are retained longer than necessary",
        "Objects with finalize() methods are queuing faster than the Finalizer thread can process them, retaining memory until finalisation completes"
      ],
      "ans": 4,
      "fb": "Objects overriding finalize() are moved to a finalisation queue after becoming unreachable. If the queue backs up, these objects and everything they reference stays retained. Modern code should use Cleaner or try-with-resources instead."
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 3,
      "q": "A thread dump shows a thread in TIMED_WAITING inside sun.misc.Unsafe.park, owned by a ForkJoinPool. 500 other tasks are queued. What is the architectural problem?",
      "opts": [
        "Normal pool behaviour — ForkJoinPool threads enter TIMED_WAITING between tasks as a power-saving mechanism and 500 queued tasks is within limits",
        "The ForkJoinPool is undersized for the workload — blocking tasks are monopolising worker threads while hundreds of tasks wait in the queue",
        "CPU starvation — the pod does not have enough CPU cores for the ForkJoinPool's parallelism level, causing tasks to queue behind CPU scheduling",
        "The heap is full — the 500 queued task objects are consuming significant heap memory and GC pressure is preventing the pool from dequeuing them",
        "Network slowness — the queued tasks are waiting for network responses and the ForkJoinPool cannot process them until the external calls complete"
      ],
      "ans": 1,
      "fb": "ForkJoinPool works best with non-blocking tasks. Blocking operations (I/O, locks) pin worker threads and starve the queue. The fix is either a dedicated thread pool for blocking work or using ManagedBlocker to expand the pool."
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 0,
      "q": "In Eclipse MAT, the histogram shows 50,000 instances of byte[] totalling 800MB. What is the most useful next step?",
      "opts": [
        "Check CPU metrics to determine whether the byte[] arrays are being actively processed or are idle objects waiting for garbage collection",
        "Delete the heap dump and take a new one because 50,000 byte[] instances is too many for MAT to analyse reliably in a single dump",
        "Sort by retained heap and inspect the largest byte[] instances via their GC root paths to identify which objects are holding them",
        "Restart the pod immediately — 800MB of byte[] is a critical leak that will OOMKill the service imminently if not cleared by a restart",
        "Increase the heap to accommodate the 800MB of byte[] data, which may be a legitimate working set for the application's data processing"
      ],
      "ans": 2,
      "fb": "Large byte[] arrays are common leak payloads (serialised data, buffers, images). Tracing their GC roots tells you which data structure retains them — often a cache, queue, or static map."
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 4,
      "q": "A Metaspace OOM occurs every 3 days. You set -XX:MaxMetaspaceSize=512m to catch it earlier and enable -verbose:class. The log shows repeated loading of classes like 'GeneratedMethodAccessor'. What is the likely root cause?",
      "opts": [
        "Network buffer accumulation — the GeneratedMethodAccessor classes are wrappers around network I/O that consume Metaspace proportional to connection count",
        "A JIT compilation issue — the JIT compiler is generating method accessor classes that are never unloaded because the code cache retains them",
        "A heap issue — the GeneratedMethodAccessor classes are heap-allocated proxies that the GC cannot reclaim due to strong references from Spring beans",
        "Java reflection inflates accessors after a threshold — repeated inflation with different class loaders can leak Metaspace if the inflation count is unbounded",
        "Normal reflection behaviour — GeneratedMethodAccessor classes are created once per reflected method and remain stable after initial application warmup"
      ],
      "ans": 3,
      "fb": "After ~15 reflective calls, the JVM generates a bytecode accessor class. If something causes fresh generation repeatedly (new class loaders, framework reloads), these accumulate. -Dsun.reflect.inflationThreshold can control this."
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 0,
      "q": "A service's container RSS has grown 400MB over two weeks but heap, Metaspace, and direct buffer metrics are all stable. You enable -XX:NativeMemoryTracking=detail and run jcmd VM.native_memory summary.diff after 24 hours. The diff shows +300MB in 'Internal'. What does this point to?",
      "opts": [
        "GC overhead — the 300MB growth in Internal reflects additional data structures the GC creates to track an increasingly fragmented heap",
        "The 'Internal' category covers JVM-internal allocations like direct byte buffers, unsafe allocations, and native data structures — a 300MB growth here often indicates a library using Unsafe.allocateMemory or sun.misc.Unsafe without releasing",
        "Metaspace fragmentation — the Internal category captures fragmented Metaspace regions that are committed but unusable due to non-contiguous allocations",
        "Thread stack growth — NMT tracks thread stacks under the Internal category, and 300MB growth indicates approximately 300 new threads were created",
        "A heap leak that NMT misattributes to Internal — the growth is actually retained heap objects that the NMT accounting system categorises incorrectly"
      ],
      "ans": 1,
      "fb": "NMT's 'Internal' category captures allocations the JVM makes outside the standard pools. Libraries using Unsafe.allocateMemory, JNI allocations, or internal data structures grow this category. The diff mode pinpoints growth over time. Next step: correlate with library usage patterns."
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 0,
      "q": "NMT summary shows total committed at 1.8GB in a 2Gi container, but Linux RSS (from /proc/<pid>/status) reads 2.05GB. The pod is intermittently OOM-killed. What explains the 250MB gap between NMT and RSS?",
      "opts": [
        "RSS includes swap memory — the 250MB gap is swapped-out pages that count toward RSS but are not tracked by NMT because they are on disk",
        "NMT only tracks JVM-managed memory — the gap is native memory allocated outside the JVM: JNI libraries, glibc malloc arena fragmentation, memory-mapped files, or the C runtime itself",
        "NMT is broken — a known bug in NMT causes it to under-report committed memory when -XX:NativeMemoryTracking=summary is used instead of detail",
        "The kernel is over-counting container memory — cgroup v2 includes shared page cache pages in the RSS metric that are not actually private to the process",
        "Container metrics are wrong — cAdvisor over-reports container_memory_working_set_bytes when the JVM uses large pages or transparent huge pages"
      ],
      "ans": 1,
      "fb": "NMT tracks what the JVM allocates. Third-party native libraries, JNI code, glibc malloc fragmentation (arenas), and mmap'd regions are invisible to NMT. Diagnosing the gap requires pmap or /proc/<pid>/smaps to identify anonymous mappings outside JVM regions."
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 4,
      "q": "You suspect a native memory issue but need to enable Native Memory Tracking on a running service. A colleague says you can turn NMT on with jcmd at runtime. Is this correct?",
      "opts": [
        "No — NMT must be enabled at JVM startup via -XX:NativeMemoryTracking=summary or =detail; it cannot be toggled at runtime because the JVM needs to instrument allocations from the start",
        "Yes — jcmd VM.native_memory enable can turn on NMT on a running JVM without restart, though it only tracks allocations from that point forward",
        "NMT is a Kubernetes feature — it is part of the kubelet's memory tracking subsystem and is configured via pod annotations, not JVM flags",
        "NMT requires a JVM restart with the flag enabled and a heap dump to capture the baseline — both are needed before any native memory analysis",
        "NMT is only for heap memory tracking — it does not cover native memory regions like Metaspace, thread stacks, or direct byte buffers"
      ],
      "ans": 0,
      "fb": "NMT instruments JVM allocation paths from startup. Enabling it later would miss all prior allocations, making the data incomplete. The baseline must be set at JVM start. Once enabled, jcmd VM.native_memory summary and baseline/diff commands work at runtime."
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 2,
      "q": "A service has high CPU usage and GC overhead, but JFR's default template shows limited allocation detail. You attach async-profiler in allocation mode (--event alloc) for 60 seconds. The flame graph shows 70% of allocations in a single method: TenantContextSerializer.serialize(). What is the most actionable interpretation?",
      "opts": [
        "Allocation events do not relate to GC pressure — the serializer allocates objects but GC handles them efficiently and they are not the cause of overhead",
        "Async-profiler is inaccurate for allocation profiling — its sampling introduces significant bias toward high-frequency call sites like serializers",
        "The flame graph is upside down — async-profiler's allocation flame graphs should be read bottom-up, and the serializer is actually the leaf, not the root",
        "That serializer is the dominant source of GC pressure — it likely creates large temporary objects per call and should be optimised (buffer reuse, streaming, or caching)",
        "The issue is CPU, not memory — the serializer appears in the allocation flame graph because it uses CPU for computation, not because it allocates objects"
      ],
      "ans": 3,
      "fb": "Async-profiler's allocation flame graph directly shows where heap pressure originates. 70% concentrated in one method is a clear optimisation target. Buffer reuse, streaming serialization, or caching serialized results can dramatically reduce allocation rate."
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 2,
      "q": "You need to diagnose why a service's CPU spikes correlate with GC pauses. You capture both a CPU flame graph (async-profiler --event cpu) and an allocation flame graph (--event alloc). The CPU flame graph shows 25% in GC threads, while the allocation flame graph shows a Jackson ObjectMapper.readValue() path creating 800MB/s of temporary objects. How do these connect?",
      "opts": [
        "GC threads should be ignored in CPU flame graphs because they represent JVM overhead that cannot be reduced through application-level optimisation",
        "CPU profiling cannot show GC threads — async-profiler only samples application threads, so the 25% attributed to GC is a measurement artifact",
        "They are unrelated — the CPU flame graph measures execution time while the allocation flame graph measures object creation, which are independent",
        "The ObjectMapper is not the problem — Jackson allocation rate is normal for JSON processing and the GC overhead has a different root cause",
        "The high allocation rate from Jackson deserialization fills young gen rapidly, forcing frequent GC collections that consume 25% CPU — reducing allocation rate in the deserialization path would lower both GC frequency and CPU usage"
      ],
      "ans": 4,
      "fb": "Cross-tool reasoning: allocation profiling identifies the source of garbage, CPU profiling shows how much time GC spends cleaning it up. Together they prove the causal chain: Jackson allocations -> GC pressure -> CPU overhead. Fixing the allocation source (reusing ObjectMapper, streaming parsing) addresses both symptoms."
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 0,
      "q": "Your fleet runs 12 Spring Boot services with different latency requirements. Three user-facing services need P99 < 30ms; the rest are batch or internal. Which collector strategy is most defensible?",
      "opts": [
        "G1 for everything — it is the default in modern JDKs and using a single collector simplifies configuration and troubleshooting across the fleet",
        "Use low-pause collectors (ZGC or Shenandoah) only for the three latency-sensitive services; keep G1 for batch and internal services where throughput matters more than tail latency",
        "Let each team choose their own GC without guidance — teams know their workloads best and should have full autonomy over JVM configuration",
        "ZGC for everything — lower pauses are always better regardless of workload type, and the higher CPU and footprint cost is worth the consistency",
        "Serial collector for everything — simpler is better and the single-threaded collector avoids the complexity of concurrent GC algorithms entirely"
      ],
      "ans": 1,
      "fb": "Collector choice should match SLO requirements. ZGC/Shenandoah trade CPU and footprint for sub-millisecond pauses — worthwhile for tight P99 targets but wasteful for batch jobs that tolerate pauses. A tiered strategy matches cost to need."
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 0,
      "q": "You have JFR data from a service running G1 with 6Gi heap. P99 latency is 90ms; analysis shows 30ms is GC pause. What is the most evidence-based next step?",
      "opts": [
        "Lower the heap to reduce the amount of memory G1 must scan per collection, which should bring pause times below the 30ms contribution",
        "Switch to ZGC immediately across all replicas — ZGC guarantees sub-millisecond pauses and there is no downside to switching in production",
        "Increase the heap to give G1 more room for concurrent marking, which should reduce the frequency and duration of stop-the-world pauses",
        "Disable JFR to eliminate its profiling overhead — the 30ms pause may be partially caused by JFR's safe-point interaction with the collector",
        "Compare a parallel canary run on ZGC under identical traffic; verify CPU and footprint cost is acceptable"
      ],
      "ans": 4,
      "fb": "Switching collectors is a tuning decision. Without a controlled comparison you don't know if ZGC's lower pauses outweigh its higher CPU and footprint. A canary with the same JFR setup gives a defensible answer."
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 0,
      "q": "A service migrated from G1 to ZGC. P99 dropped from 90ms to 25ms but container memory rose by ~25%. The finance team questions the cost increase. How do you frame the trade-off?",
      "opts": [
        "Revert to G1 to save money — the 25% memory increase is not worth the P99 improvement because latency is less important than cost efficiency",
        "Ignore the cost increase — 25% more memory is within normal variance and does not require justification or communication to the finance team",
        "ZGC's coloured pointers and concurrent relocation require additional metadata. Calculate: the P99 improvement serves N more requests within SLA, translating to measurable business value. Present the cost per avoided SLA violation.",
        "JIT churn caused the memory growth — ZGC's different safe-pointing mechanism causes the JIT compiler to generate more code, inflating the code cache",
        "Ask for a bigger budget without quantitative justification — the engineering team knows the memory cost is necessary and finance should trust that"
      ],
      "ans": 2,
      "fb": "Engineering decisions with cost implications need business framing. Quantifying the P99 improvement in terms of SLA compliance, customer impact, or revenue protection makes the memory cost justifiable. Pure technical arguments rarely win cost discussions."
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 1,
      "q": "You are designing a memory budget for a service with two thread pools: 100 Tomcat workers and 200 background workers. What is the first sizing question to answer?",
      "opts": [
        "The pod's IP address range — different IP ranges have different network buffer allocations that affect per-thread memory consumption",
        "Whether the two pools can run at peak concurrency simultaneously",
        "The CPU model of the GKE node — different processors have different memory controller behaviour that affects how the JVM commits pages",
        "Which JIT compiler to use — C1 and C2 have different memory footprints that affect the non-heap budget for thread pool memory sizing",
        "The container image size — larger images consume more memory at runtime because layers are decompressed into memory for filesystem access"
      ],
      "ans": 1,
      "fb": "Memory budgets must account for worst-case concurrency, not average. If both pools can be active at the same time, stack memory and per-thread state must be sized for the sum. If they cannot, the overlap can be bounded smaller."
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 1,
      "q": "Two services share a Cloud SQL database. Service A uses Hikari pool=50; Service B uses pool=100. The DB max_connections=200. What is the systemic risk?",
      "opts": [
        "Disk I/O — the database's disk throughput is the constraint, not connections, and both services should be evaluated against IOPS limits instead",
        "If both services scale to 3 replicas each, they collectively can demand 50x3 + 100x3 = 450 connections, exceeding 200 — connection storms during deploy",
        "No risk — Cloud SQL automatically adjusts max_connections based on the number of connected clients and there is no hard ceiling to worry about",
        "CPU pressure — the database server's CPU will be overwhelmed by 150 concurrent connections from both services running queries simultaneously",
        "Heap pressure — each connection consumes heap memory on the Spring Boot side and the combined pool sizes will cause OOMKills across both services"
      ],
      "ans": 1,
      "fb": "Per-pod pool sizes multiplied by replica count is the real demand on the database. Without a budget across the fleet, a deploy or autoscaling event can cause connection exhaustion at the DB. Centralised budgeting prevents this."
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 1,
      "q": "You want to bound HikariCP pool size based on database capacity, not application optimism. What is the most defensible upper bound rule?",
      "opts": [
        "Always 200 — this is the standard HikariCP pool size that works for all database workloads regardless of query complexity or concurrency level",
        "Number of HTTP threads — set the pool size equal to the Tomcat thread count so each request thread has a dedicated database connection",
        "Total connection budget across all pods <= database max_connections x safety margin (e.g., 0.7)",
        "Number of users — set the pool size proportional to the expected concurrent user count because each user session needs a dedicated connection",
        "The number of CPU cores — database connections should match the CPU count because each core can process one query at a time efficiently"
      ],
      "ans": 2,
      "fb": "DB capacity is the constraint, not the JVM. Pool size x pod count x replica count must stay safely under database max_connections, with margin for migrations and reconnect storms. This prevents one team from starving the database."
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 2,
      "q": "For services with strict cold-start SLOs, which JVM feature most directly reduces startup time?",
      "opts": [
        "A larger heap — increasing -Xmx gives the JVM more room during startup for bean creation and class loading, reducing startup GC pressure",
        "More CPU — allocating additional CPU cores lets the JVM parallelise class loading, JIT compilation, and bean creation during startup",
        "Class Data Sharing (AppCDS) or CDS-with-AOT in newer JDKs",
        "G1GC — switching to G1 improves startup time because its concurrent marking phase handles class loading metadata more efficiently than other collectors",
        "A smaller container image — reducing the image size decreases the time the container runtime spends extracting layers before the JVM can start"
      ],
      "ans": 2,
      "fb": "Class data sharing pre-loads class metadata at startup, eliminating significant repeat work. Combined with AOT in modern JDKs, it can shave seconds off cold start. It is the canonical JVM-level cold-start optimisation."
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 2,
      "q": "A service with a 30-second cold start fails its 20-second readiness probe. What is the cleanest Kubernetes-level fix that does not silently mask warm-up issues?",
      "opts": [
        "Add a startupProbe with a generous failureThreshold so liveness/readiness only become active after the JVM has warmed",
        "Increase replicas so other pods serve traffic while new pods start — this does not fix the probe failure but masks it with redundancy",
        "Increase container memory to speed up Spring Boot startup — more heap means faster bean creation and class loading during initialisation",
        "Disable liveness probes entirely so the slow-starting pod is never killed during its 30-second initialisation window or after warm-up",
        "Disable readiness probes so the pod receives traffic immediately after container start without waiting for the JVM to finish initialising"
      ],
      "ans": 0,
      "fb": "startupProbe was added precisely for slow-starting applications. It defers liveness/readiness until the app is up, without weakening those probes' behaviour at steady state. Disabling probes hides real problems."
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 2,
      "q": "After migrating to GraalVM native image, cold start dropped from 25s to 200ms but P99 latency under load increased ~30%. Why?",
      "opts": [
        "CPU change only — GraalVM native images require more CPU for the same throughput because ahead-of-time compilation produces less efficient code",
        "Disk slowness — native images are loaded from disk on each request because they cannot be kept entirely in memory like JVM bytecode",
        "GraalVM is broken — the native image compilation has a known performance regression bug that should be resolved in the next release",
        "Native images lack JIT, so they cannot adaptively optimise hot paths the way HotSpot does at steady state",
        "The heap increased — GraalVM native images use a different garbage collector that requires a larger heap to achieve the same throughput"
      ],
      "ans": 3,
      "fb": "Native images trade peak throughput for fast startup and small footprint. Without JIT, optimisation is limited to ahead-of-time compilation. For services where steady-state latency matters most, this is a real cost to weigh."
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 3,
      "q": "Multiple teams configure JVMs differently. One team has no GC logging, no HeapDumpOnOutOfMemoryError, and -Xmx at 95% of container limit. What is the risk?",
      "opts": [
        "Only a risk for the platform team — individual service teams are not affected because they can override JVM settings in their own deployment manifests",
        "GC logging has too much overhead — modern GC logging adds measurable latency and should only be enabled during active debugging, not as a default",
        "No risk — each team knows best and should have full autonomy over their JVM configuration without central standards or guidelines imposed",
        "No diagnostic data when memory issues occur, and -Xmx at 95% leaves almost no room for non-heap, making OOMKill likely under any load increase",
        "Only slightly higher memory usage — running at 95% of the container limit wastes a small amount of headroom but is otherwise safe for production"
      ],
      "ans": 3,
      "fb": "Without GC logging, no visibility into allocation patterns. Without HeapDumpOnOutOfMemoryError, OOM crashes produce no evidence. With -Xmx at 95%, guaranteed OOMKill under load. Modern GC logging has negligible overhead."
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 3,
      "q": "You are defining an org-wide Spring Boot JVM baseline. Which set is the most defensible starting point?",
      "opts": [
        "Disable GC logging fleet-wide — GC logging adds overhead and should only be enabled when an active memory investigation is in progress",
        "-Xmx=1g for everyone — standardise on a single 1GB heap across all services to simplify configuration and make memory behaviour predictable",
        "-Xmx=4g for everyone — standardise on a large 4GB heap so no service ever hits OOM regardless of its actual working set requirements",
        "Use only -Xmx and nothing else — the heap size is the only JVM flag that matters for memory, and additional flags add unnecessary complexity",
        "-XX:MaxRAMPercentage=70, -XX:+ExitOnOutOfMemoryError, -XX:+HeapDumpOnOutOfMemoryError, -XX:HeapDumpPath=/dumps, -XX:NativeMemoryTracking=summary"
      ],
      "ans": 4,
      "fb": "This baseline gives container-aware sizing, fail-fast on OOM, automatic dump capture, and non-trivial diagnostics — all without committing to a particular GC. It is enough to remove the worst footguns and enable diagnosis when problems arise."
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 3,
      "q": "You roll out a new memory baseline. Two service teams refuse: one has a custom GC config, one runs a legacy JVM. What is the most pragmatic approach?",
      "opts": [
        "Force adoption by overriding their JVM configuration centrally — standards must be universal or they lose credibility across the organisation",
        "Remove their deployment access until they comply with the baseline — escalation through access restriction ensures compliance with standards",
        "Block their deploys through the admission policy — teams that do not meet the baseline should not be allowed to deploy to production",
        "Define an exception process: teams can opt out with a documented reason and a sunset plan, while the baseline becomes default for new services and gradually for old ones",
        "Ignore them — two holdout teams out of the entire fleet are not worth the political cost of engagement and the standard will win naturally"
      ],
      "ans": 3,
      "fb": "Forcing rollout creates resentment and risk. An explicit exception process keeps the baseline credible while acknowledging real constraints. Combined with a default-on for new services, the standard wins by attrition without confrontation."
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 4,
      "q": "A team is evaluating moving from Java 17 to Java 21. Which memory-related feature is the headline change relevant to a Spring Boot service?",
      "opts": [
        "No memory changes — Java 21 is focused on language features like pattern matching and sealed classes without any JVM memory management improvements",
        "Smaller Metaspace — Java 21 compresses class metadata more efficiently, reducing baseline Metaspace consumption by approximately 30% for Spring Boot services",
        "Generational ZGC (preview/stable depending on version) and improvements in virtual threads' interaction with memory",
        "No GC changes — Java 21 retains the same GC algorithms as Java 17 with only minor internal implementation improvements to G1 throughput",
        "Removal of the heap — Java 21 moves all object allocation to stack-based memory management, eliminating the need for garbage collection entirely"
      ],
      "ans": 2,
      "fb": "Java 21 introduced generational ZGC, which improves throughput at similar pause characteristics. Virtual threads also stabilised. Both are headline memory-related changes worth evaluating, especially for latency-sensitive services."
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 4,
      "q": "You evaluate Java 21 virtual threads for a service that blocks heavily on JDBC. What is the key memory concern to test before adopting?",
      "opts": [
        "Whether HikariCP or any blocking library pins virtual threads (defeats the benefit) and whether ThreadLocals retained per virtual thread bloat the heap",
        "DNS resolution latency — virtual threads create a new DNS lookup per task and the JVM's internal resolver does not cache results across virtual threads",
        "Disk usage — virtual threads store their continuation state on the container's ephemeral storage, which can fill up under high concurrency workloads",
        "Container image size — virtual threads require additional JDK libraries that increase the base image size and affect startup time significantly",
        "CPU usage — virtual threads consume significantly more CPU than platform threads because each context switch requires a full register save and restore"
      ],
      "ans": 0,
      "fb": "Pinning happens when virtual threads are stuck on monitors or native frames, preventing the carrier thread from being released — losing the scalability benefit. ThreadLocal-heavy libraries also retain memory per virtual thread. Both must be tested."
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 4,
      "q": "A team plans to upgrade JVM versions across the fleet. Which signal would you use to define 'safe to roll out' for memory specifically?",
      "opts": [
        "A canary cohort running for 7+ days under production traffic with monitoring on heap baseline, GC pause distribution, Metaspace, and direct buffer usage compared to the previous version",
        "CPU only — if CPU usage stays stable or decreases after the upgrade, the new JVM version is safe to roll out across the remaining fleet",
        "No signal needed — just upgrade all services simultaneously since newer JVM versions are always backward-compatible in memory behaviour",
        "Disk only — monitor ephemeral storage usage because newer JVM versions may write larger JFR and GC log files that consume disk space",
        "Pod restart count only — if no pods restart within 24 hours of the upgrade, the new JVM version is confirmed safe for fleet-wide rollout"
      ],
      "ans": 0,
      "fb": "A canary with a long observation window captures slow leaks and tail behaviour the unit tests will not. Comparing memory regions side-by-side with the prior version makes the rollout decision evidence-based."
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 0,
      "q": "A workload is throughput-oriented (batch ETL, no human users). Which collector is generally the simplest reasonable default?",
      "opts": [
        "Serial — the single-threaded collector minimises memory overhead for batch jobs since it does not require concurrent GC thread memory allocation",
        "ZGC — its sub-millisecond pauses benefit batch workloads by ensuring consistent progress even during long-running data processing operations",
        "Shenandoah — its concurrent compaction prevents heap fragmentation during batch operations that create and discard many large temporary objects",
        "CMS — the Concurrent Mark Sweep collector is optimised for throughput workloads and remains the best choice for batch processing in modern JDKs",
        "G1 (default in modern JDK), or even Parallel for pure throughput"
      ],
      "ans": 4,
      "fb": "For batch workloads where pause times don't matter, throughput-oriented collectors win. G1 is a safe modern default; Parallel can squeeze out more throughput at the cost of long pauses. Low-pause collectors trade throughput for latency, which batch doesn't need."
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 1,
      "q": "A service has Tomcat=300, Hikari=50, and a Kafka consumer pool of 20. Each pool can be saturated independently. Total threads = 370. Stack budget?",
      "opts": [
        "Negligible — thread stacks are allocated on the heap and are already included in the -Xmx budget, so they do not need separate sizing",
        "Cannot estimate without profiling — thread stack memory depends on call depth, local variable count, and JIT compilation state at runtime",
        "~3.7GB — each thread stack defaults to 10MB on modern JVMs because of the deep call stacks typical in Spring Boot with framework layers",
        "~370MB",
        "~37MB — thread stacks are very compact at roughly 100KB each, since most of the stack is virtual memory that is not physically committed"
      ],
      "ans": 3,
      "fb": "At default 1MB stacks, 370 threads = 370MB. This must be reserved in the container budget on top of -Xmx, Metaspace, JIT, and direct buffers. Capping pool sizes (or moving to virtual threads) directly reduces the stack share."
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 2,
      "q": "A team wants to use CRaC (Coordinated Restore at Checkpoint) for cold-start improvements. What is the principal risk to a stateful Spring Boot service?",
      "opts": [
        "Slower startup — CRaC adds overhead to the restore process that makes cold start even slower than a normal JVM startup for Spring Boot services",
        "More CPU — CRaC requires additional CPU for checkpoint/restore operations that consume resources during both the checkpoint and restore phases",
        "Less heap — CRaC reduces the available heap by reserving memory for the checkpoint image metadata that must be kept resident during operation",
        "Larger container image — CRaC embeds the full JVM checkpoint state in the container image, significantly increasing its size and pull time",
        "Restoring a JVM checkpoint can resurrect open file descriptors, sockets, and connection pools — if those external resources have changed, the restored process is in an inconsistent state"
      ],
      "ans": 4,
      "fb": "CRaC checkpoints captured live state. After a long pause, sockets, DB connections, and tokens may no longer be valid. Restoration must trigger reconnect and revalidation logic, otherwise the service will fail in subtle ways."
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 3,
      "q": "An org-wide JVM baseline is hard to enforce because configurations live in many repositories. What is the most leveraged way to enforce defaults?",
      "opts": [
        "Email reminders sent to team leads monthly asking them to verify their JVM configurations are aligned with the org-wide standard document",
        "No enforcement — publish the baseline as a recommendation and trust teams to adopt it voluntarily based on their own assessment of its value",
        "A wiki page documenting the baseline configuration with examples — teams can reference it when setting up new services or reviewing existing ones",
        "Manual review of every deployment manifest by the platform team before each production deploy to verify JVM flags meet the baseline standard",
        "Central base Docker images that already set the JVM flags, plus a Kubernetes admission policy that blocks deploys without container-aware sizing"
      ],
      "ans": 4,
      "fb": "Defaults set in the base image apply to every service that uses it without changing application code. Admission policies catch outliers. Combined, they make the baseline the path of least resistance, which is the only enforcement that works at scale."
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 4,
      "q": "You are assessing an upgrade from Java 17 to Java 21 for a high-throughput service. Which memory-relevant test would you weight highest?",
      "opts": [
        "Microbenchmarks using JMH to measure method-level performance differences between JVM versions in isolation from real workload patterns",
        "Container image size comparison — a newer JVM version with a smaller runtime would reduce pod startup time and memory consumption",
        "Long-running production-shaped load test comparing GC pause distribution, allocation rate, Old Gen growth, and direct buffer use across versions",
        "Startup time only — if the new version starts faster, it is safe to deploy because startup exercises all the memory-intensive code paths",
        "Compile time — if the new JVM version compiles the application faster, it indicates better memory management during JIT compilation"
      ],
      "ans": 2,
      "fb": "Memory characteristics emerge over hours of realistic load, not in microbenchmarks. A long, production-shaped run is the only way to compare GC pauses, leaks, and pressure under conditions that match real usage."
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 0,
      "q": "Which production scenario most strongly favours Shenandoah or ZGC over G1?",
      "opts": [
        "Batch ETL jobs — their long-running nature benefits most from ZGC's concurrent collection because batches cannot afford any stop-the-world interruption",
        "CPU-only workloads with no I/O — ZGC reduces GC interference with computation by running concurrently alongside the application threads",
        "User-facing services with strict P99 latency goals and large heaps",
        "Tiny services with small heaps under 512MB — ZGC's concurrent design is most efficient on small heaps where collection completes in microseconds",
        "Single-threaded workloads — ZGC's concurrent collector operates on a separate thread so it does not compete with the application's single thread"
      ],
      "ans": 2,
      "fb": "Shenandoah and ZGC shine when pauses must be small even at large heap sizes. G1 is fine until the heap grows large enough that its pauses become noticeable. P99 SLOs and big heaps are the joint signal."
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 2,
      "q": "You design a 'warm-up endpoint' that the platform calls after pod startup, before traffic. What should it exercise to be effective?",
      "opts": [
        "DNS lookups — resolve all service hostnames during warm-up to populate the JVM's DNS cache and ensure network paths are established for routing",
        "Realistic representative requests against the actual business endpoints, ideally including DB and Kafka calls, to JIT-compile hot paths and warm pools",
        "Health checks against /actuator/health — exercising the health endpoint warms the Actuator subsystem and triggers JIT compilation of core Spring paths",
        "/actuator/info requests — this endpoint exercises Spring's internal metadata resolution and triggers JIT compilation of the framework's request pipeline",
        "Random URLs that return 404 — any HTTP request exercises the Tomcat NIO connector and JIT-compiles the request handling pipeline regardless of the endpoint"
      ],
      "ans": 1,
      "fb": "Warm-up only helps if it exercises the same code paths real traffic will use. Realistic synthetic requests cause JIT to compile the right methods, populate caches, and trigger pool establishment."
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 3,
      "q": "Across the fleet, ~30% of services have -Xmx >= container limit. As an expert leading a remediation, what is the smallest, highest-leverage fix to apply first?",
      "opts": [
        "Block all deploys fleet-wide until every service has been manually reviewed and reconfigured with correct -Xmx settings by the platform team",
        "Do nothing — the 30% of services with incorrect settings have been running fine, and changing them now risks introducing instability",
        "Mass migration — update all 30% of services simultaneously in a single deployment window to fix the configuration fleet-wide in one pass",
        "Email all team leads asking them to fix their JVM settings and provide a deadline for compliance with the new memory configuration standard",
        "Provide a fixed base image and admission policy that enforce -XX:MaxRAMPercentage <= 75 unless explicitly overridden, and migrate the worst offenders manually"
      ],
      "ans": 4,
      "fb": "Most teams with bad sizing copied an old config. A central default fixes the majority quietly. Manual migration of the worst cases handles the long tail. This combines automation with targeted human attention."
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 4,
      "q": "A new Java version proposes deprecating a GC you currently use in production. How do you scope the impact assessment?",
      "opts": [
        "List every service using that GC, prioritise by SLO sensitivity and heap size, and define a migration test plan per group",
        "Switch a random selection of services to test the new GC in production without a systematic approach — organic discovery is faster than planning",
        "Ignore the deprecation — the GC will remain available in the JDK for years and there is no urgency to migrate until it is actually removed",
        "Stay on the old JVM version forever — avoiding the upgrade eliminates the migration risk and the current GC configuration works well enough",
        "Migrate everything immediately — the longer you wait, the harder it gets, so a fleet-wide migration in a single weekend minimises the total effort"
      ],
      "ans": 0,
      "fb": "A targeted assessment based on SLO sensitivity focuses effort on the services where the GC choice actually matters. Grouped migrations reduce duplicated work. Drift to old JVMs creates bigger problems later."
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 1,
      "q": "In a fleet, you see services with hikari max pool sizes ranging from 10 to 200. What is the principled way to set defaults?",
      "opts": [
        "Allow anything — each team knows their workload best and should have full autonomy over HikariCP pool sizing without central constraints",
        "Default per service tier based on connection budget and observed P99 connection wait time, with central guidance and exceptions documented",
        "Disable HikariCP and use raw JDBC connections fleet-wide — connection pools add complexity and hide connection leaks behind pool abstractions",
        "No default — pool sizing is too workload-specific to standardise and any default value will be wrong for most services in the fleet",
        "Pick 100 for everyone — a single pool size applied uniformly across all services simplifies configuration and eliminates per-service tuning"
      ],
      "ans": 1,
      "fb": "A single number does not fit all services. Tier-based defaults derived from real connection budgets and observed waits are defensible and scale better than one-size-fits-all."
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 2,
      "q": "Which is the most useful pre-warm signal that your readiness probe should require for memory-sensitive services?",
      "opts": [
        "Pod start event — the moment the container starts running is sufficient to mark it as ready because the JVM initialises quickly in modern Java versions",
        "CPU under 50% — wait until CPU usage drops below 50% after the startup burst, indicating the JVM has finished JIT compilation and bean initialisation",
        "DNS resolution success — verify that the pod can resolve all service hostnames before marking it ready, since DNS failure would prevent request handling",
        "A first set of representative requests has succeeded with latency under threshold, indicating JIT and pools are warm",
        "Heap committed above 50% of -Xmx — wait until the JVM has committed at least half of the configured heap, indicating sufficient memory is allocated"
      ],
      "ans": 3,
      "fb": "Synthetic warm-up traffic that meets a latency target is a strong functional signal that the JVM is ready. It captures JIT, pools, and caches together — real signals that 'ready' is meaningful."
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 4,
      "q": "You assess an upgrade to a JVM version that introduces CDS by default. What should you measure to claim the change is net positive for memory?",
      "opts": [
        "Disk usage — CDS stores a class data archive on disk and the impact should be measured by the additional ephemeral storage consumed per container",
        "CPU only — if CPU usage is lower or equal after enabling CDS, the change is net positive because class loading consumes CPU during startup",
        "Compare both startup time and resident set size at steady state, since CDS changes class metadata residency too",
        "Just heap — if heap usage is stable after enabling CDS, the change is net positive because CDS only affects class loading, not heap allocation",
        "DNS resolution time — CDS pre-loads network-related classes that affect DNS resolution performance, so DNS latency is the most relevant metric"
      ],
      "ans": 2,
      "fb": "CDS speeds startup but also changes how class metadata is shared. RSS comparison ensures the change is not silently increasing footprint elsewhere. Measuring both is the honest assessment."
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 0,
      "q": "In an A/B canary comparing G1 and ZGC under identical traffic, which metric set best decides the winner for a latency-sensitive service?",
      "opts": [
        "Pod count — if one collector allows fewer replicas to serve the same traffic, it wins regardless of per-pod latency or resource consumption",
        "Container image size — a collector that produces a smaller runtime image reduces pull times and storage costs, which is the primary selection criterion",
        "P99 latency, GC CPU overhead, container RSS, throughput at SLO — together",
        "Just heap utilisation — whichever collector produces lower average heap usage is more efficient and should be chosen for all latency-sensitive services",
        "CPU only — the collector that uses less CPU overhead wins because CPU is typically more expensive than memory in GKE node cost calculations"
      ],
      "ans": 2,
      "fb": "No single metric captures the trade-off. ZGC may win on P99 but lose on CPU and footprint. The decision is multi-dimensional and should be made with the service's SLOs in mind."
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 3,
      "q": "What is the single most impactful JVM flag to standardise across the fleet for post-mortem diagnosis?",
      "opts": [
        "-XX:+PrintGCDetails — GC logging captures the most diagnostic information by recording every collection event with before/after heap sizes and timing",
        "-XX:+HeapDumpOnOutOfMemoryError — it captures a heap dump automatically at the moment of failure, enabling root-cause analysis after the fact",
        "-XX:+TraceClassLoading — tracking which classes are loaded at runtime provides the most actionable post-mortem data for memory leak investigations",
        "-XX:+PrintCompilation — logging JIT compilation events helps identify which methods were being compiled when the OOM occurred for root-cause analysis",
        "-verbose:class — verbose class loading output captures the full class loading lifecycle which is the most common source of production memory leaks"
      ],
      "ans": 1,
      "fb": "A heap dump at OOM is the single most valuable diagnostic artefact. Without it, post-mortems rely on inference. With it, tools like MAT can identify the leak in minutes. Every service should have this flag."
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 4,
      "q": "Java 21 stabilised virtual threads. What is the key memory implication for a Spring Boot service?",
      "opts": [
        "No change — virtual threads have identical memory characteristics to platform threads and do not affect heap, stack, or non-heap allocation patterns",
        "Less heap — virtual threads reduce heap consumption by storing task state in native memory continuations instead of heap-allocated thread objects",
        "Less CPU — virtual threads reduce CPU overhead by eliminating the OS thread scheduling cost, which indirectly reduces GC-related CPU consumption",
        "More Metaspace — virtual threads load additional runtime classes for the continuation framework that increase the baseline Metaspace consumption",
        "Virtual threads use heap-allocated continuations instead of OS thread stacks, dramatically reducing per-thread memory but increasing heap usage for high concurrency"
      ],
      "ans": 4,
      "fb": "Virtual threads replace ~1MB OS stacks with small heap continuations. For services with thousands of concurrent tasks, this can save hundreds of MB of stack memory while shifting pressure onto the heap."
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 0,
      "q": "A team runs G1 with -XX:MaxGCPauseMillis=50 but observes P99 pauses of 120ms. Which tuning direction is most defensible?",
      "opts": [
        "Increase the heap to give G1 more room for concurrent marking — a larger heap reduces the frequency of mixed collections that cause long pauses",
        "Increase the pause target to -XX:MaxGCPauseMillis=200 — setting a more realistic target gives G1 the flexibility to collect larger regions per cycle",
        "Disable G1 and switch to the Parallel collector — its simpler stop-the-world approach avoids the variance that G1 introduces with concurrent phases",
        "Reduce heap to shrink the amount of work per collection, or switch to ZGC if the workload cannot tolerate G1's pause variance at that heap size",
        "Add CPU — more CPU cores let G1's concurrent marking threads run faster, completing marking before the heap fills and reducing pause durations"
      ],
      "ans": 3,
      "fb": "G1's pause target is a best-effort goal. Large heaps and high allocation rates can exceed it. Reducing heap or moving to ZGC are the two most effective paths to tighter pauses."
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 3,
      "q": "You are writing an org-wide JVM configuration standard. Which two flags together provide the best safety net?",
      "opts": [
        "-Xmx and -Xms — fixing the heap size at startup prevents resize pauses and produces the most predictable memory behaviour in containers",
        "-Xss and -XX:MaxMetaspaceSize — capping thread stacks and Metaspace prevents the two most common non-heap memory regions from growing unboundedly",
        "-verbose:gc and -verbose:class — detailed GC and class loading logs provide comprehensive diagnostic data but add measurable runtime overhead",
        "-XX:+PrintGC and -XX:+PrintCompilation — GC and JIT compilation logging together capture both memory and CPU diagnostic data for post-mortem analysis",
        "-XX:+HeapDumpOnOutOfMemoryError and -XX:+ExitOnOutOfMemoryError — the first captures diagnosis data, the second ensures the pod fails fast and restarts cleanly"
      ],
      "ans": 4,
      "fb": "HeapDumpOnOOM captures the evidence; ExitOnOOM ensures the JVM does not limp along in a degraded state. Together they turn an OOM from a silent corruption risk into a diagnosed, clean restart."
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 4,
      "q": "You evaluate Java 21's generational ZGC. What is the key improvement over non-generational ZGC?",
      "opts": [
        "Lower CPU — generational ZGC uses fewer CPU cycles per collection because the young generation is smaller and faster to scan than the full heap",
        "Better throughput for workloads with many short-lived objects, because young-gen collections avoid scanning the entire heap",
        "Less Metaspace — generational ZGC compresses class metadata more efficiently, reducing the baseline Metaspace consumption for Spring Boot services",
        "Faster startup — generational ZGC pre-allocates the young generation during JVM initialisation, reducing the time to first GC-ready state",
        "Smaller footprint — generational ZGC uses less total memory than non-generational ZGC because the young generation replaces part of the heap"
      ],
      "ans": 1,
      "fb": "Generational ZGC adds a young generation, so short-lived objects are collected cheaply without scanning old objects. This improves throughput while maintaining ZGC's sub-millisecond pauses."
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 1,
      "q": "You are building a fleet-wide memory capacity model. Five services share a Cloud SQL instance with max_connections=300. Each service runs 3 replicas. What is the first calculation to prevent connection exhaustion?",
      "opts": [
        "Measure CPU usage per service — CPU consumption correlates with connection demand and high CPU services should receive larger pool allocations",
        "Count the number of REST endpoints per service — each endpoint represents a potential concurrent query, so pool size should match endpoint count",
        "Check disk space on the Cloud SQL instance — insufficient disk affects query performance which causes connections to be held longer under load",
        "Sum max pool sizes per pod across all services and multiply by replica count — if sum exceeds 300 x 0.7 (safety margin), pools must be reduced",
        "Count the number of Kafka topics consumed by each service — each topic partition requires a dedicated database connection for transactional processing"
      ],
      "ans": 3,
      "fb": "Fleet capacity planning starts with shared resource constraints. Connection pools x replicas is the peak demand. A 70% safety margin accounts for reconnect storms during deploys. Without this calculation, autoscaling or deploys can exhaust the database."
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 1,
      "q": "You are designing tiered memory budgets for the fleet. Tier 1 services are latency-sensitive user-facing (need ZGC headroom). Tier 2 are internal APIs. Tier 3 are batch jobs. What principle should drive the container limit differences?",
      "opts": [
        "Only Tier 1 services need memory budgets — internal APIs and batch jobs can use any heap size because their memory behaviour does not affect users",
        "Base limits on team headcount — larger teams build more complex services that need more memory, so team size is a reasonable proxy for container sizing",
        "All tiers get the same container limit — uniformity simplifies scheduling and avoids the complexity of managing multiple resource profiles across the fleet",
        "Tier 1 needs the largest limit to accommodate ZGC's higher RSS, and the strictest pool coordination to prevent memory waste. Tier 3 can use Parallel GC with a smaller footprint. Tiering connects GC choice to resource allocation.",
        "Tier 3 gets the most memory because batch jobs process large data sets — batch workloads inherently require more heap than request-handling services"
      ],
      "ans": 3,
      "fb": "Tiered budgeting aligns resource cost with service importance. ZGC's higher footprint is justified by P99 SLOs. Batch services can trade latency for smaller footprint. Without tiering, all services over-provision or the critical ones under-provision."
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 1,
      "q": "A fleet of 40 services runs 3 replicas each at 2Gi per pod. Average utilisation is 55%. Leadership asks you to reduce memory spend by 25%. What is the most defensible approach?",
      "opts": [
        "Identify the 10 services with the lowest peak utilisation over 30 days, right-size their limits based on P95 usage + non-heap headroom, and present the projected savings with a rollback plan per service",
        "Wait for Kubernetes Vertical Pod Autoscaler to auto-size all 40 services — VPA will converge on optimal limits without manual intervention",
        "Cut all container limits by 25% uniformly across every service — a uniform reduction ensures the savings target is met with a single configuration change",
        "Switch all services to 512Mi containers — the smallest viable container size for Spring Boot would maximise savings but requires significant rework",
        "Remove 25% of replicas across all services — reducing pod count achieves the same cost reduction without changing any JVM or container configuration"
      ],
      "ans": 0,
      "fb": "Uniform cuts are dangerous — some services are well-sized. Data-driven right-sizing targets the waste without creating risk. A per-service rollback plan ensures quick recovery if a cut causes OOMKills. The savings should be projected, not guessed."
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 2,
      "q": "A platform team proposes enabling AppCDS for all Spring Boot services in the fleet. What is the primary memory benefit beyond startup speed?",
      "opts": [
        "Less GC overhead — AppCDS reduces the number of classes that need to be garbage collected, lowering GC frequency and improving application throughput",
        "AppCDS allows multiple JVM instances to share read-only class metadata mappings in memory, reducing per-pod Metaspace footprint on the same node",
        "Smaller container images — AppCDS pre-packages class data in the image, eliminating the need to include the full JDK class library in each image",
        "More heap space — AppCDS moves class metadata from Metaspace into a shared memory region, freeing Metaspace budget for heap allocation instead",
        "Less disk space — AppCDS compresses the class archive on disk, reducing the ephemeral storage consumed by class files at runtime per container"
      ],
      "ans": 1,
      "fb": "AppCDS maps a shared archive into memory as read-only. On nodes running multiple pods, the same class metadata pages are physically shared across processes, reducing total node memory consumption. This is a fleet-level benefit beyond individual startup speed."
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 1,
      "q": "A service has 200 Tomcat threads but profiling shows only 40 are ever active concurrently. The remaining 160 idle threads consume 160MB of stack memory. What is the most effective memory optimisation?",
      "opts": [
        "Reduce server.tomcat.threads.max to 60 (active concurrency + margin) — this saves ~140MB of stack memory without affecting throughput",
        "Switch to ZGC — its concurrent collection eliminates idle thread overhead by not scanning stacks during safe-points, saving the same 140MB",
        "Add more replicas to distribute the traffic — more pods with lower thread counts achieve the same throughput with less per-pod memory waste",
        "Remove Tomcat and switch to a non-blocking server like Netty — reactive servers use fewer threads and eliminate the stack memory overhead entirely",
        "Increase the heap by 160MB to absorb the idle thread stack cost — this keeps the thread pool unchanged while accommodating the extra memory"
      ],
      "ans": 0,
      "fb": "Idle threads still consume stack memory. Right-sizing the thread pool to observed concurrency plus headroom frees significant native memory. This is often the single highest-leverage non-heap optimisation for Spring Boot services."
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 4,
      "q": "Your team discovers that Spring Security stores a SecurityContext in a ThreadLocal. With platform threads this is manageable (200 threads = 200 contexts). What changes with virtual threads?",
      "opts": [
        "Spring Security is incompatible with virtual threads — the framework's authentication filters require platform threads and throw an exception on virtual threads",
        "With virtual threads, thousands or millions of concurrent tasks each get their own ThreadLocal copy, potentially consuming gigabytes of heap for security contexts alone — a ThreadLocal audit is essential before adoption",
        "ThreadLocals are faster with virtual threads because the JVM optimises their access patterns when running on the virtual thread scheduler",
        "Virtual threads do not use ThreadLocals at all — the virtual thread implementation bypasses the ThreadLocal storage mechanism and uses a shared context",
        "Nothing changes — virtual threads have identical ThreadLocal behaviour to platform threads and the 200-context model applies regardless of thread type"
      ],
      "ans": 1,
      "fb": "ThreadLocal scales by thread count. With platform threads, 200 copies are manageable. With virtual threads handling millions of tasks, each copy is a heap allocation. Libraries like Spring Security, MDC, and transaction managers all use ThreadLocals. An audit of ThreadLocal usage is the first step in any virtual thread adoption."
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 4,
      "q": "You are planning a virtual thread rollout for three services. Service A uses Spring MVC + JDBC. Service B uses WebFlux (already non-blocking). Service C has heavy synchronized blocks around a shared cache. Which should pilot first?",
      "opts": [
        "All three simultaneously — virtual threads are production-ready in Java 21 and all services benefit equally from the migration regardless of workload type",
        "None — virtual threads are not production-ready and should not be adopted until the next LTS release demonstrates long-term stability in large fleets",
        "Service A — it benefits most from virtual threads replacing blocking I/O threads, while Service B already uses non-blocking I/O and Service C's synchronized blocks will pin carrier threads",
        "Service C — its synchronized blocks need virtual threads most because virtual threads handle lock contention more efficiently than platform threads",
        "Service B — WebFlux benefits most from virtual threads because the reactive programming model maps naturally to the virtual thread scheduling model"
      ],
      "ans": 2,
      "fb": "Virtual threads benefit blocking I/O workloads most (Service A). WebFlux is already non-blocking, so the benefit is minimal. Synchronized blocks pin carrier threads, defeating virtual thread benefits. Service A is the safest, highest-return pilot."
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 4,
      "q": "After adopting virtual threads in a service, you observe carrier thread pinning warnings in logs. The pinning occurs inside a third-party payment gateway client that uses synchronized for thread safety. What is the most pragmatic resolution?",
      "opts": [
        "Wrap the payment client calls in a dedicated bounded platform thread pool using Executors.newFixedThreadPool(), limiting the pinning scope while the rest of the service uses virtual threads. File an issue with the vendor for ReentrantLock migration.",
        "Ignore the warnings — carrier thread pinning is a debug-level log message and does not affect production performance or correctness in practice",
        "Disable virtual threads entirely for the service — if any library causes pinning, the entire service should revert to platform threads for safety",
        "Remove the payment client and implement payment processing inline using raw HTTP calls that do not require the third-party library's synchronization",
        "Rewrite the payment client internally to replace all synchronized blocks with ReentrantLock, eliminating the pinning issue at the source"
      ],
      "ans": 0,
      "fb": "Pinning from third-party code cannot be fixed locally. Isolating it on a dedicated platform thread pool bounds the damage while virtual threads serve the rest of the workload. Filing upstream ensures a long-term fix. Disabling virtual threads entirely throws away the benefit for the entire service."
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 0,
      "q": "You are evaluating the cost impact of switching from G1 to ZGC across 5 latency-sensitive services (3 replicas each, 4Gi containers). ZGC needs 5Gi per pod. What is the annual cost increase and how do you justify it?",
      "opts": [
        "The increase is (5Gi - 4Gi) x 15 pods = 15Gi additional memory. Calculate the GKE node cost for that delta. Justify by quantifying the P99 improvement in terms of SLA compliance rate and customer-facing latency reduction.",
        "ZGC is always free — its concurrent design uses less total memory than G1 because it does not need extra headroom for evacuation reserves",
        "No cost change — ZGC's memory overhead is offset by reduced GC CPU consumption, resulting in the same total resource cost per pod",
        "Switch to smaller containers to offset the memory cost — reduce from 4Gi to 3Gi per pod while using ZGC's more efficient memory layout",
        "Reduce replicas from 3 to 2 per service to offset the per-pod memory increase while maintaining the same total memory budget"
      ],
      "ans": 0,
      "fb": "Cost justification requires both sides: the resource delta in dollars and the performance improvement in business terms. A 1Gi increase per pod across 15 pods is material. But if P99 drops from 100ms to 5ms, the SLA compliance improvement may be worth multiples of the memory cost."
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 0,
      "q": "Three teams want different GC configurations: Team A wants ZGC for low latency, Team B wants G1 with aggressive tuning, Team C wants Parallel for batch throughput. As the expert, how do you balance standardisation vs autonomy?",
      "opts": [
        "Define 3 supported GC profiles (low-latency, general-purpose, batch-throughput) with documented flags, monitoring expectations, and upgrade paths. Teams select a profile; custom configs require an exception with justification.",
        "Allow any GC configuration without oversight — teams are the best judges of their workload and centralised GC standards stifle innovation and autonomy",
        "Let each team discover their own optimal GC settings through experimentation — organic discovery produces better results than top-down standardisation",
        "Force G1 for everyone — a single GC algorithm eliminates the testing matrix and makes fleet-wide behaviour predictable and easier to support",
        "Ban GC tuning entirely — use the JVM's default GC settings for all services and prohibit any team from modifying GC-related JVM flags"
      ],
      "ans": 0,
      "fb": "A profile-based approach balances standardisation with legitimate diversity. Each profile is tested and monitored. Custom exceptions are tracked. This prevents drift while respecting that different workloads have genuinely different needs."
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 0,
      "q": "You are designing a fleet-wide memory reliability strategy. What should it include?",
      "opts": [
        "Only automated restarts on high memory — configure Kubernetes to restart pods when heap exceeds 90% and rely on self-healing for reliability",
        "Only Grafana dashboards — build comprehensive memory dashboards for every service and rely on engineers to monitor them proactively during shifts",
        "Standard JVM config, mandatory HeapDumpOnOutOfMemoryError, GC anomaly alerting, automated JFR on threshold breach, and fleet-wide per-service memory dashboards",
        "Only incident runbooks — document step-by-step procedures for memory incidents and train teams to follow them when alerts fire in production",
        "Just standardised -Xmx values — enforce a single heap size across all services so memory behaviour is uniform and predictable fleet-wide"
      ],
      "ans": 2,
      "fb": "Complete strategy: prevention (standard config), detection (anomaly alerting, growth trends), diagnosis (auto heap dump, triggered JFR), visibility (per-service dashboards, not averages). Shifts from reactive to proactive."
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 0,
      "q": "Your fleet dashboard shows average JVM heap at 45% across 20 services. A stakeholder says 'memory is fine.' Why might this be misleading?",
      "opts": [
        "45% is indeed healthy — fleet average heap below 50% indicates adequate headroom and no service requires immediate attention or investigation",
        "The dashboard is measuring incorrectly — Grafana's averaging function across multiple Prometheus targets introduces known aggregation errors",
        "Averages are always accurate for fleet health — if the average is healthy, by definition most services are healthy and exceptions are negligible",
        "The average hides outliers — one service at 95% with a growing leak is invisible when averaged with 19 at 40%. Show per-service MAX or P95 instead.",
        "Averages are fine as long as alerts exist — if no alert has fired, the average confirms that no individual service is in a dangerous memory state"
      ],
      "ans": 3,
      "fb": "Fleet averages are dangerous. 19 healthy at 40% + 1 leaking at 95% = average 43%. Fix: per-service panels, MAX() as top indicator, alert on per-service P95 memory."
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 1,
      "q": "How does GC behaviour translate into SLA latency commitments?",
      "opts": [
        "GC impact is too small to measure — modern collectors like G1 produce sub-millisecond pauses that are negligible compared to network and database latency",
        "GC pauses directly add to P99 latency — a 100ms pause means any in-flight request experiences 100ms+ additional latency. Memory configuration must be validated against SLA targets.",
        "GC has no SLA impact — GC pauses are absorbed by the HTTP client's retry and timeout mechanisms and do not affect end-user-visible response times",
        "Only heap size matters for SLAs — if the heap is correctly sized, GC pauses are always within acceptable bounds regardless of collector choice",
        "SLAs should exclude GC — infrastructure overhead like garbage collection is outside the application's control and should not be counted in latency budgets"
      ],
      "ans": 1,
      "fb": "GC pauses are stop-the-world. If SLA promises P99 < 50ms but the service has 100ms pauses every 30s, ~3% of requests violate purely from GC. GC algorithm, heap sizing, and allocation rate optimisation are SLA engineering."
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 2,
      "q": "When evaluating virtual threads (Java 21) for your Spring Boot services, what is the key memory implication?",
      "opts": [
        "Virtual threads reduce heap usage because their lightweight implementation requires less memory per thread than traditional platform thread objects",
        "Virtual threads are only for batch workloads because they lack the concurrency guarantees needed for latency-sensitive request-handling services",
        "Virtual threads eliminate the need for connection pools because each virtual thread can hold its own database connection without memory overhead",
        "Virtual threads have much smaller stacks (heap-allocated), enabling millions of tasks — but ThreadLocal-heavy libraries may leak memory per virtual thread",
        "Virtual threads use the same memory as platform threads — each still requires a 1MB native stack allocated by the operating system"
      ],
      "ans": 3,
      "fb": "Platform threads: ~1MB OS stack each. Virtual threads: tiny heap-allocated continuations. But: ThreadLocal per virtual thread can cause heap growth (millions of virtual threads x ThreadLocal copy). HikariCP, Spring Security use ThreadLocal extensively. Evaluation must include ThreadLocal audit."
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 0,
      "q": "A fleet-wide initiative aims to reduce OOMKills by 80% in a quarter. Which one input is most predictive of success?",
      "opts": [
        "Number of meetings held between teams to discuss memory improvement strategies — more meetings indicate stronger organisational commitment",
        "A catchy initiative slogan that teams can rally around — naming the effort helps create visibility and drives participation across the org",
        "Dedicated funding for a specialised memory engineering team — without budget for new hires, the initiative cannot make meaningful progress",
        "An accurate baseline measurement of OOMKill frequency by service and the ability to tag responsible owners — without this, you cannot prioritise or measure progress",
        "The count of observability tools deployed across the fleet — more tools means better diagnosis capability and faster time to resolution"
      ],
      "ans": 3,
      "fb": "You cannot improve what you cannot measure. A clean baseline with ownership lets you target the highest-impact services first and prove progress. Without it, the initiative is anecdotal."
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 0,
      "q": "Two services dominate fleet OOMKill counts. Service A has many small leaks; Service B has one big sizing bug. Which do you prioritise?",
      "opts": [
        "Service A — fixing many small leaks produces more engineering learning and builds broader leak detection capability across the team",
        "Neither — the initiative should focus on preventing future OOMKills through standards rather than fixing existing services retrospectively",
        "Service B — it is a single, high-leverage fix with immediate, measurable impact, which builds momentum for the broader initiative",
        "Both equally — divide the team's effort between the two services to make parallel progress on both the leak and the sizing issue simultaneously",
        "Random selection — pick whichever service's team is most available this sprint and fix the other one in the next sprint based on team capacity"
      ],
      "ans": 2,
      "fb": "Initiatives need early wins. A single sizing fix on Service B can be deployed in days and quoted as a 50% reduction in fleet OOMKills. Service A's many small leaks are real but slower to address; do them after the momentum is established."
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 0,
      "q": "A fleet-wide reliability initiative meets resistance from a high-status team that insists their custom JVM settings are necessary. What is the most effective leadership move?",
      "opts": [
        "Force compliance by overriding their JVM configuration centrally — the standard must be universal to maintain credibility across the organisation",
        "Block their deployments through the admission policy until they adopt the standard configuration — compliance through enforcement is the only reliable approach",
        "Ignore the resistance — two holdout teams are not worth the political cost and the standard will eventually win by attrition as teams see its benefits",
        "Escalate to HR — resistance to org-wide technical standards is a performance issue that should be handled through the formal management process",
        "Co-author the standard with them — incorporate their valid concerns, document the exception explicitly, and use them as a reference adopter"
      ],
      "ans": 4,
      "fb": "High-status holdouts often have legitimate requirements and can become powerful allies when included. Co-authoring turns resistance into endorsement and produces a better standard. Forcing rarely works at this level."
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 1,
      "q": "Translating GC pauses to SLA budgets: a service has a 50ms P99 SLA and observes 100ms G1 pauses every 30 seconds. Roughly what fraction of requests at peak load could be SLA-violating from GC alone?",
      "opts": [
        "0% — GC pauses at 100ms every 30 seconds affect so few requests at typical service throughput that the SLA violation rate is statistically zero",
        "Small but meaningful — proportional to (pause x concurrency) / interval; for typical services this can mean a measurable percentage of requests",
        "Half — approximately 50% of all requests are affected because GC pauses occur frequently enough that every other request encounters a pause window",
        "Negligible always — GC pauses do not affect request latency because the Tomcat NIO connector queues requests transparently during pause events",
        "100% — every request experiences a GC pause because the 30-second interval is shorter than the average request processing time at peak load"
      ],
      "ans": 1,
      "fb": "Any in-flight request when GC pauses suffers the full pause length. The fraction depends on concurrency and pause frequency, but with 100ms pauses and a 50ms SLO, even modest concurrency produces measurable violations."
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 1,
      "q": "A platform-wide P99 latency budget is 100ms. JIT and GC together account for ~30ms. As an architect, which lever would you propose first?",
      "opts": [
        "Reduce CPU allocation to save cost — GC overhead is a fixed percentage and reducing CPU proportionally reduces the absolute pause contribution",
        "Increase the SLA target from 100ms to 150ms — adjusting the SLA is simpler than changing JVM memory configuration across the fleet",
        "Add CPU to run GC faster — more CPU cores let the concurrent collector complete marking and evacuation phases in less wall-clock time",
        "Tighten the GC pause target via collector choice and heap sizing, then re-measure — leaving room in the budget for other latency contributors",
        "Disable GC overhead measurement — the 30ms attributed to GC is a measurement artifact and excluding it from the budget gives a more accurate picture"
      ],
      "ans": 3,
      "fb": "GC consumption of 30% of the latency budget is high. Collector choice and heap sizing are the most direct levers. Tightening here frees budget for other unavoidable contributors like network and DB latency."
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 1,
      "q": "You are asked to translate a fleet-wide '99.9% requests under 100ms' SLO into a JVM memory standard. Which standard would best support that SLO?",
      "opts": [
        "Use any heap size — individual teams can set -Xmx based on their own judgement and the SLO will be met through application-level optimisations",
        "Mandate pause-time-oriented collector, cap heap size by tier, require dump-on-OOM and NMT on, define maximum acceptable pause distribution per tier",
        "No standard is needed — each team should tune their own JVM based on their service's unique requirements rather than following a fleet-wide rule",
        "Use any GC algorithm — collector choice has minimal impact on tail latency and the SLO can be met regardless of which collector is configured",
        "Ignore JVM configuration entirely — the SLO should be achieved through application architecture and code optimisation, not infrastructure tuning"
      ],
      "ans": 1,
      "fb": "A meaningful standard pins down the dimensions that affect tail latency: collector choice, heap caps, observability, and explicit pause distribution targets. This connects an SLA to operational JVM choices."
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 2,
      "q": "What is the principal memory benefit of GraalVM native image for a Spring Boot service?",
      "opts": [
        "Lower CPU — native images require less CPU because ahead-of-time compilation eliminates the JIT compiler's background processing overhead entirely",
        "Smaller container image only — native images are smaller but do not change the runtime memory footprint or startup characteristics of the service",
        "Larger heap — native images require a larger heap because AOT compilation produces less memory-efficient object layouts than JIT-compiled code",
        "Higher peak throughput — native images achieve better steady-state performance because AOT compilation applies global optimisations unavailable to JIT",
        "Lower steady-state RSS and very fast startup, at the cost of giving up JIT optimisations"
      ],
      "ans": 4,
      "fb": "Native images consume less memory and start in milliseconds, useful for serverless and short-lived workloads. The trade-off is loss of JIT, which can hurt steady-state throughput on long-running services."
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 2,
      "q": "You are asked to evaluate CRaC (Coordinated Restore at Checkpoint) for the fleet. Which service profile would benefit most safely?",
      "opts": [
        "Database services — CRaC works best with JDBC connections because the checkpoint captures warm connection pools that restore instantly",
        "Background workers with open file handles — CRaC is designed for services that hold external resources because it manages their lifecycle during restore",
        "All services simultaneously — CRaC is production-ready for all workload types and the fleet should adopt it uniformly for maximum cold-start benefit",
        "Long-running stateful payment processors — they benefit most because CRaC preserves the JIT-warmed state that handles financial transaction processing",
        "Stateless services with no long-lived external resources at the moment of checkpoint, such as request handlers behind a stateless API gateway"
      ],
      "ans": 4,
      "fb": "CRaC restores resurrect held resources. Stateless services with minimal external state are the safest first targets because they have less to revalidate. Long-lived stateful services carry the most risk."
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 2,
      "q": "You produce a structured assessment of virtual threads for the platform. Which dimension is most often missed?",
      "opts": [
        "Image registry compatibility — some container registries do not support the additional JDK modules required by virtual threads in Java 21",
        "CPU overhead — virtual thread scheduling consumes significant CPU that is often underestimated in evaluations focused on concurrency benefits",
        "ThreadLocal retention per virtual thread, which can drive heap up sharply for libraries that use ThreadLocals heavily (security context, MDC, transaction binding)",
        "Performance degradation — virtual threads are slower than platform threads for CPU-bound workloads due to cooperative scheduling overhead",
        "Container image size — the virtual threads runtime adds approximately 200MB to the JDK base image, increasing pull times and registry costs"
      ],
      "ans": 2,
      "fb": "ThreadLocals scale by thread count. With millions of virtual threads, ThreadLocal-heavy libraries can convert thread-cheap concurrency into a heap explosion. This is the most common surprise in evaluations."
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 3,
      "q": "What is the highest-leverage component of fleet-wide memory observability?",
      "opts": [
        "A consistent set of JVM metrics and labels exported by every service: heap, non-heap by area, GC pauses, allocation rate, threads, classes loaded",
        "Network throughput metrics — monitoring bytes in/out per service reveals memory pressure because incoming data is buffered in heap before processing",
        "DNS resolution latency — slow DNS lookups correlate with memory issues because the JVM caches DNS results in native memory that can leak over time",
        "Disk I/O metrics — monitoring read/write throughput per pod reveals when the JVM is swapping heap data to ephemeral storage under memory pressure",
        "Per-pod CPU usage only — CPU metrics are the most universal diagnostic signal because GC overhead appears as CPU consumption proportional to memory pressure"
      ],
      "ans": 0,
      "fb": "Consistency is what makes fleet observability useful. When every service exposes the same labels, dashboards and alerts can be reused, comparisons become possible, and platform tools can be built once."
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 3,
      "q": "You are designing automated diagnostics that capture context around an OOMKill. Which capture is most useful given that the JVM has already been killed?",
      "opts": [
        "Nothing can be captured — once the JVM is killed by the kernel, all diagnostic state is lost and post-mortem analysis is impossible",
        "A heap dump taken after the OOMKill by the replacement pod — the new JVM can read the previous container's memory state from shared storage",
        "Just the application logs from the previous pod — search for OutOfMemoryError or warning messages that preceded the kill event",
        "Just the exit code from kubectl describe pod — exit code 137 alone provides sufficient information to diagnose the root cause of the OOMKill",
        "Pre-kill snapshots: periodic short JFR recordings, recent jvm.memory.* metric history, and Metaspace + thread count time series, retained on a sidecar volume"
      ],
      "ans": 4,
      "fb": "OOMKill leaves no live JVM. The only useful diagnostics are the ones captured before the event. Periodic short JFR snapshots and dense metric retention give you the breadcrumbs to triage after the fact."
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 3,
      "q": "A platform tool aims to detect class loader leaks fleet-wide automatically. What is the most reliable algorithmic signal?",
      "opts": [
        "A steady, sustained increase in jvm.classes.loaded.classes that is not correlated with deploys, combined with rising Metaspace",
        "Pod restart count — frequent restarts correlate with class loader leaks because OOMKills from Metaspace exhaustion are the eventual symptom",
        "CPU usage — class loader leaks cause increasing CPU overhead for class verification and linking, which is a more reliable signal than memory growth",
        "Heap usage — class loader leaks manifest as heap growth because leaked class loaders retain their loaded classes as heap-allocated objects",
        "Thread count — class loader leaks cause thread count growth because each leaked class loader creates daemon threads for class monitoring"
      ],
      "ans": 0,
      "fb": "A class loader leak shows up as continuously rising loaded class count without deploys. Pairing it with Metaspace growth filters out incidental class loading. This combination is robust enough for automated detection."
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 4,
      "q": "During a deep production investigation, you suspect a native (non-JVM) memory leak from a JNI library. Which tool gives the clearest first signal?",
      "opts": [
        "jstack — thread dumps reveal native memory leaks because leaked JNI threads appear as unnamed threads that accumulate over time in the dump",
        "Linux pmap/smaps showing growing anonymous regions outside the JVM heap, and /proc/<pid>/status RssAnon",
        "jmap — heap dumps include JNI-allocated memory regions and can be analysed in MAT to find native objects retained through JNI global references",
        "Grafana dashboards — JVM memory metrics include native allocations from JNI libraries and can be tracked through the jvm.memory.used metric",
        "Eclipse MAT — the heap dump analysis tool includes a native memory view that shows JNI allocations alongside heap objects in the dominator tree"
      ],
      "ans": 1,
      "fb": "Native leaks live below the JVM. pmap and /proc/<pid>/status show resident segments by mapping. Growing anonymous segments not attributable to JVM regions are the signature of native leaks. NMT may not capture them since they originate outside the JVM."
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 4,
      "q": "A driver-level memory leak is suspected in a third-party library. What is the most defensible mitigation while you negotiate an upstream fix?",
      "opts": [
        "Force the upstream vendor to prioritise the fix by threatening to switch to a competitor library if the memory leak is not patched within 30 days",
        "Restart pods on a schedule based on observed leak rate, monitor via Grafana, document the trade-off, and pin the library version",
        "Switch to a different programming language that does not use the affected native driver, eliminating the leak at the cost of rewriting the service",
        "Disable observability monitoring for the affected service — removing monitoring overhead may reduce the native memory pressure enough to avoid the leak",
        "Ignore the leak — if the service has sufficient headroom in its container limit, the leak rate may never cause an OOMKill during the library's lifecycle"
      ],
      "ans": 1,
      "fb": "Scheduled restarts are an honest, bounded mitigation when the root cause is outside your control. Combined with monitoring and documentation, they keep the system stable without pretending the underlying problem is fixed."
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 4,
      "q": "You lead a deep production investigation that crosses multiple teams: app, database driver, and kernel. Which artefact is most valuable to produce at the end?",
      "opts": [
        "A single graph showing the memory timeline during the incident — visual evidence is the most effective communication tool for cross-team alignment",
        "A meeting with all three teams to present findings verbally — face-to-face discussion is more effective than written documentation for complex issues",
        "A blame report identifying which team's component was the primary cause of the failure, with recommendations for that team's remediation actions",
        "An email summary sent to all involved teams with a brief description of the root cause and the fix that was applied to resolve the issue",
        "A timeline-based incident write-up with evidence (heap dumps, NMT, pmap, kernel logs), root cause, contributing factors, and concrete preventive actions per team"
      ],
      "ans": 4,
      "fb": "Cross-team incidents are forgotten unless documented honestly and constructively. A timeline with evidence and concrete actions per team turns the investigation into organisational learning and prevents recurrence."
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 1,
      "q": "A leadership question: 'What is the cost of our current GC pauses to user experience?' What is the most credible way to answer?",
      "opts": [
        "A user survey asking customers whether they have noticed latency issues — subjective feedback provides the most credible evidence of GC impact",
        "A measurement: percentage of P99 latency budget consumed by GC pauses, expressed in real ms and as a percentage of SLA",
        "Anecdotes from on-call engineers about incidents where GC pauses were suspected of causing user-visible latency, compiled into a narrative",
        "Benchmarks comparing GC performance across different algorithms in a synthetic test environment that simulates production traffic patterns",
        "An educated guess based on typical GC overhead percentages from JVM documentation, applied to the fleet's average heap size and traffic volume"
      ],
      "ans": 1,
      "fb": "Leadership wants impact in their language. Translating GC into SLA budget consumption is concrete and decision-useful. It also bridges the gap between engineering metrics and business outcomes."
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 2,
      "q": "A platform team proposes adopting Project Loom virtual threads org-wide. What is the most responsible scoping move?",
      "opts": [
        "Ban it — virtual threads are too experimental for production financial workloads and should not be adopted until the next LTS Java version",
        "Roll out everywhere simultaneously — virtual threads are strictly better than platform threads and all services benefit equally from adoption",
        "Pilot in a small set of services with mixed workloads (I/O bound, CPU bound, ThreadLocal heavy), measure heap and pinning, then expand based on evidence",
        "Mandate adoption across all services with a firm deadline — teams that do not migrate by the deadline have their deployments blocked",
        "Email everyone announcing virtual thread availability and let teams self-select without providing any guidance on evaluation or adoption criteria"
      ],
      "ans": 2,
      "fb": "Loom's benefits depend on workload. A small pilot covering different patterns surfaces pinning, ThreadLocal, and library compatibility issues before they affect the fleet. Evidence-based expansion is the responsible path."
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 0,
      "q": "Six months into a fleet memory initiative, OOMKills are down 70%, but two services regressed and now drive most remaining OOMKills. What is the most strategic response?",
      "opts": [
        "Stop the initiative — the 70% improvement is sufficient and further effort has diminishing returns given the remaining two services' resistance",
        "Treat the regression as a signal that the standard does not yet cover those services' workload — extend the standard or define a new tier, and add the regression cases to the rollout playbook",
        "Kick them out of the initiative — services that regress should be excluded from the standard and left to manage their own memory configuration",
        "Blame the teams for not following the standard correctly — if they had implemented the baseline as specified, the regression would not have occurred",
        "Declare victory with the 70% improvement — the remaining two services are outliers that will be addressed in a future quarter's planning cycle"
      ],
      "ans": 1,
      "fb": "Regressions in late-adopters are usually evidence that the standard's assumptions don't fit them. Adapting the standard rather than blaming the teams expands its coverage and shows the initiative is willing to learn — both required for durable adoption."
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 1,
      "q": "A new SLA requires P99 < 30ms. The current GC config produces 50ms pauses. As authority, what cross-team conversation must you initiate first?",
      "opts": [
        "Disable GC pauses by switching to a no-pause collector — Epsilon GC eliminates pauses entirely and is suitable for latency-sensitive production services",
        "Order the team to change their GC configuration immediately — as authority, you can mandate ZGC adoption for all services that violate the new SLA",
        "Reset the SLA discussion: explain the JVM constraints to product, present the cost of meeting the new target (footprint, CPU), and decide jointly which service tiers actually need it",
        "Add more servers and replicas — scaling horizontally reduces per-pod load, which reduces GC frequency and brings pause times under the 30ms target",
        "Switch to a non-JVM language — the 50ms GC pauses are inherent to JVM-based services and meeting P99 < 30ms requires a platform without GC overhead"
      ],
      "ans": 2,
      "fb": "SLAs that ignore JVM physics are unrealistic. The authority's job is to bring engineering reality into the SLA conversation so the business can choose with full information. Sometimes the answer is 'only the user-facing tier needs that SLA'."
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 2,
      "q": "You evaluate CRaC for a fleet that handles regulated financial transactions. What is the strongest reason to delay adoption?",
      "opts": [
        "State validation: a restored process must re-validate every external resource, token, and connection to avoid acting on stale state — for regulated workloads this is a non-trivial correctness risk",
        "Performance — CRaC's restore overhead adds latency to the first few requests, which may violate the stringent P99 SLAs of financial services",
        "CPU — CRaC's checkpoint/restore mechanism consumes additional CPU resources that may exceed the budget allocated for financial transaction processing",
        "Cost — CRaC requires larger container images to store the checkpoint state, increasing storage and network transfer costs across the fleet",
        "Container image size — the checkpoint data embedded in the image significantly increases its size, impacting pull times and registry storage costs"
      ],
      "ans": 0,
      "fb": "Regulated workloads cannot afford acting on stale state. CRaC's restore semantics make this a real risk. The mitigation cost (validating everything on restore) often outweighs the cold-start benefit at the current maturity."
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 3,
      "q": "A fleet-wide observability project wants to capture continuous JFR profiles. What is the most realistic constraint?",
      "opts": [
        "JFR is too slow for production — always-on profiling adds unacceptable overhead to latency-sensitive services and should only be used in staging",
        "JFR is unsupported in containerised environments — the recording mechanism requires host-level access that is not available inside Kubernetes pods",
        "Storage and indexing cost: hundreds of services x always-on JFR can be expensive — limit to short rotating recordings and centralised analysis on demand",
        "JFR cannot be enabled at runtime — it must be configured at JVM startup via deployment manifest changes, requiring a rolling restart of each service",
        "JFR is broken on recent JDK versions — known bugs in the recording subsystem produce corrupted files that cannot be opened in JDK Mission Control"
      ],
      "ans": 2,
      "fb": "JFR runtime overhead is small with the default template, but storing and indexing recordings at fleet scale is significant. Rotating short recordings retained centrally for on-demand analysis is the usual realistic balance."
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 4,
      "q": "A driver-level memory issue is escalated to you after an outage. Two engineers disagree about root cause. What approach gives the clearest answer?",
      "opts": [
        "Vote — let the two engineers present their hypotheses and have the broader team vote on which root cause is most plausible based on experience",
        "Define a controlled reproduction with NMT on, pmap snapshots, and a representative load — if reproducible, capture before/after to attribute the leak; if not, the disagreement is unresolved by data and that fact must be stated",
        "Pick a side based on seniority — the more experienced engineer's hypothesis should be accepted as the root cause without further investigation",
        "Restart the affected service and move on — if the issue does not recur within a week, the root cause is irrelevant and the disagreement is moot",
        "Email the driver vendor immediately and ask them to investigate — the root cause is their responsibility and internal debugging wastes engineering time"
      ],
      "ans": 1,
      "fb": "The honest authority acknowledges when data does not yet decide a question. A controlled reproduction is the only way to resolve technical disagreements about root cause. If reproduction fails, that failure is itself a data point."
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 3,
      "q": "What is the simplest, most universal automated diagnostic to add to every service in the fleet?",
      "opts": [
        "A heap dump taken on startup to capture the baseline memory state — comparing startup dumps with crash dumps reveals what accumulated over time",
        "Just application logs with structured JSON output — search for OutOfMemoryError messages and stack traces to identify the root cause of failures",
        "No diagnostics — observability tools add overhead and complexity that outweigh their benefit for most services that rarely experience memory issues",
        "Restart on OOM only — configure -XX:+ExitOnOutOfMemoryError so the pod restarts cleanly, and rely on Grafana metrics for post-mortem analysis",
        "-XX:+HeapDumpOnOutOfMemoryError with HeapDumpPath pointing to a persistent location, plus a sidecar that uploads the dump to object storage"
      ],
      "ans": 4,
      "fb": "This single combination captures a heap dump at the moment of OOM and gets it off the dying pod before restart. It is cheap, universal, and produces the artefact that makes post-mortem analysis tractable."
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 4,
      "q": "You are leading a deep investigation where the JVM is exonerated and the issue lies in a Linux kernel/cgroup interaction. As authority, what is your reporting responsibility?",
      "opts": [
        "Stay quiet — the finding exonerates the JVM and there is no need to publicise that the investigation pointed to an external component",
        "Document the finding clearly, share with the platform/SRE team, raise with the OS vendor, and update internal knowledge so the next team does not repeat the investigation",
        "Blame Java anyway — the JVM was involved in the incident even if not the root cause, and the team should focus on JVM-level mitigations",
        "Move on to the next investigation — the issue is resolved and spending time on documentation delays work on other production priorities",
        "Hide the result to avoid embarrassment — reporting that the issue was kernel-level rather than JVM may undermine confidence in the platform team"
      ],
      "ans": 1,
      "fb": "Authority means circulating learnings. Many investigations stop at exoneration because the team is exhausted, but the next team will repeat the work without a documented finding. Sharing closes the loop and prevents recurrence."
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 1,
      "q": "A new business line proposes a 99.99% / 20ms SLA. What is the most defensible technical position regarding JVM memory management?",
      "opts": [
        "A 20ms tail SLA at 99.99% is feasible only with low-pause collectors, capped heap sizes, dedicated nodes, and engineered backpressure — and even then carries cost; commit only to what current measurements support",
        "Sure, anything is possible — commit to the SLA and figure out the implementation details later once the business commitment is made",
        "Maybe — it depends on factors outside engineering's control and the answer cannot be determined until the service is built and measured",
        "No — a 20ms tail SLA at 99.99% is physically impossible with any GC algorithm because stop-the-world pauses always exceed 20ms in practice",
        "Yes always — modern JVM collectors like ZGC guarantee sub-millisecond pauses at any heap size, making any latency SLA achievable on the JVM"
      ],
      "ans": 0,
      "fb": "At those numbers, GC pauses, scheduling jitter, and noisy neighbours all matter. A defensible position quantifies the engineering required and refuses unrealistic commitments. Setting expectations now prevents broken promises later."
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 0,
      "q": "You publish a quarterly fleet memory report. Which single chart most clearly motivates further investment?",
      "opts": [
        "Disk usage trends per service — growing ephemeral storage consumption from heap dumps and GC logs indicates memory instability across the fleet",
        "Average heap usage across all services — showing that the fleet runs at 45% heap utilisation demonstrates headroom and justifies current investment",
        "Total pod count per service — more pods indicate memory pressure because services that OOMKill frequently need additional replicas for availability",
        "OOMKills per service per week, ranked, with the top 5 highlighted — it makes pain concrete and shows where the next quarter's effort should go",
        "CPU usage trends per service — GC-related CPU consumption reveals which services have the most memory pressure without looking at memory metrics"
      ],
      "ans": 3,
      "fb": "OOMKills are the single most visible failure mode. Ranking them turns abstract reliability into concrete service-level pain that leadership can prioritise. Combined with trend lines, it justifies investment without rhetoric."
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 4,
      "q": "You lead a deep investigation into a native memory issue that turns out to be a known JDK bug. What is the most valuable output beyond fixing the immediate service?",
      "opts": [
        "A meeting with the affected team to explain the JDK bug and the workaround — verbal knowledge transfer is the most effective way to share findings",
        "An email to the engineering mailing list summarising the bug — this provides a searchable record but is easily lost in inbox clutter over time",
        "A Jira ticket only — file the upstream bug report and close the internal investigation, since the fix will arrive in a future JDK release automatically",
        "A documented write-up shared internally and an upstream bug report, so other teams recognise the symptoms and the fix is tracked to a JDK release",
        "Nothing beyond fixing the immediate service — the bug is known upstream and other teams will encounter it naturally and find the fix themselves"
      ],
      "ans": 3,
      "fb": "Investigations that end in known JDK bugs are valuable learning for the whole org. A write-up with symptoms and workarounds prevents other teams from repeating the investigation. An upstream report ensures the fix is tracked."
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 3,
      "q": "You are designing a fleet-wide automated memory anomaly detector. Which signal has the best precision-recall trade-off for detecting slow leaks?",
      "opts": [
        "CPU usage — rising CPU consumption correlates with memory leaks because GC overhead grows proportionally to the amount of retained live data",
        "GC pause count — an increasing number of GC pauses per hour indicates growing heap pressure, but it does not distinguish leaks from normal traffic growth",
        "A 7-day linear regression on jvm.memory.used{area='heap'} minimum (trough) values — a positive slope indicates retained object growth independent of traffic",
        "Peak heap — tracking the maximum heap usage per day reveals leaks because the peak should be bounded by the working set size under normal conditions",
        "Pod restart count — an increasing restart count indicates memory instability, but it only detects leaks after they have already caused OOMKill events"
      ],
      "ans": 2,
      "fb": "Trough-over-trough growth is the canonical leak signal. Regressing on minimum values filters out allocation noise and traffic variation. A 7-day window provides enough data to distinguish leaks from seasonal patterns."
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 3,
      "q": "A fleet-wide observability rollout needs buy-in from 15 service teams. What is the most effective adoption strategy?",
      "opts": [
        "Wait for teams to ask for observability tooling — adoption should be demand-driven rather than supply-driven to ensure only teams with real needs are onboarded",
        "Mandate adoption by email — send a directive requiring all 15 teams to integrate the standard metrics within 30 days, with non-compliance escalated",
        "Force all teams to adopt simultaneously — schedule a fleet-wide deployment that adds the standard metrics to every service in a single coordinated rollout",
        "Ship a Grafana dashboard template that works out-of-the-box with the standard metrics, and fix the first production incident using it publicly — teams adopt tools that prove their value",
        "Hire consultants to implement the observability rollout — external expertise accelerates adoption and removes the burden from internal teams"
      ],
      "ans": 3,
      "fb": "Adoption follows demonstrated value. A ready-made dashboard lowering the effort plus a visible incident win provides both the easy path and the proof. Mandates without value create compliance theater."
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 1,
      "q": "An SLA review reveals that 3 services violate P99 targets during GC. Leadership asks for a fix timeline. What is the most responsible answer?",
      "opts": [
        "6 months — GC migration is a complex project that requires extensive testing, and committing to a shorter timeline would risk production stability",
        "Cannot be fixed — GC pauses are inherent to JVM-based services and meeting tight P99 targets requires accepting the current pause distribution",
        "Present a tiered plan: quick wins (GC tuning, heap resizing) in 2 weeks for the worst offender, collector migration for the other two in 6-8 weeks with canary validation — and state explicitly which improvements are certain vs experimental",
        "2 weeks — all three services can be tuned simultaneously by adjusting -XX:MaxGCPauseMillis and heap sizes in a single deployment per service",
        "Tomorrow — switching the GC algorithm is a one-line configuration change that can be deployed immediately without any risk to production stability"
      ],
      "ans": 2,
      "fb": "Responsible answers decompose the problem: what can be tuned quickly, what requires a collector change, and what is uncertain. Committing to timelines for each tier, with explicit risk, is what leadership needs to plan around."
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 2,
      "q": "What is the primary technical difference between CRaC and GraalVM native image for startup improvement?",
      "opts": [
        "They are the same",
        "CRaC is for native code",
        "Neither helps startup",
        "CRaC checkpoints a running HotSpot JVM (including JIT-compiled code) and restores it; native image compiles ahead-of-time to a standalone binary with no JIT",
        "Native image uses JIT"
      ],
      "ans": 3,
      "fb": "CRaC preserves the JIT-warmed state by checkpointing the process. Native image pre-compiles everything at build time. CRaC gets both fast start and peak performance; native image trades peak performance for smaller footprint."
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 4,
      "q": "You are investigating a production issue where RSS grows but NMT shows no growth in any JVM category. What is the most likely explanation?",
      "opts": [
        "The growth is in native memory allocated outside the JVM — a JNI library, a native driver, or glibc malloc fragmentation",
        "Heap is leaking",
        "NMT is broken",
        "Thread stacks are growing",
        "Metaspace is leaking"
      ],
      "ans": 0,
      "fb": "NMT only tracks allocations the JVM itself makes. Native libraries using malloc directly, glibc arena fragmentation, and JNI allocations are invisible to NMT. pmap and /proc/<pid>/smaps are needed to identify the source."
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 4,
      "q": "A cross-team production investigation reveals that a JDBC driver allocates native memory proportional to result set size, and large analytical queries cause RSS to spike past the container limit. The fix requires a driver upgrade that is blocked by a vendor certification cycle. What is the most defensible interim strategy?",
      "opts": [
        "Implement query result pagination at the application layer to cap per-query native allocation, add RSS monitoring alerts, and document the driver constraint with a timeline for the certified upgrade",
        "Increase all container limits fleet-wide",
        "Switch databases",
        "Ignore it until the vendor certifies",
        "Remove the analytical queries"
      ],
      "ans": 0,
      "fb": "The interim strategy must reduce exposure while the root fix is blocked. Pagination bounds the per-query native allocation. RSS alerts detect regression. Documentation with a timeline ensures the upstream fix is tracked and not forgotten."
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 4,
      "q": "During a major production outage, you discover a JVM bug causing RSS growth under specific CFS (Completely Fair Scheduler) throttling conditions on GKE. The bug is fixed in a newer JDK patch release. As authority, what is the complete response beyond patching the affected service?",
      "opts": [
        "Add it to a backlog",
        "Patch the affected service, audit all fleet services for the same JDK version, publish an internal advisory with symptoms and detection criteria, add the JDK version to the fleet compliance dashboard, and schedule a fleet-wide JDK patch cycle",
        "Email the team",
        "Patch and move on",
        "File a JDK bug only"
      ],
      "ans": 1,
      "fb": "A single-service fix leaves the fleet exposed. The authority response identifies all affected services, publishes detection criteria so teams can self-assess, tracks compliance, and schedules the fleet patch. This is the difference between fixing an incident and preventing the next one."
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 0,
      "q": "Which artefact is the most useful to hand to other teams when launching a fleet-wide memory reliability initiative?",
      "opts": [
        "A 100-page comprehensive report covering every aspect of JVM memory management from theory to fleet-specific configuration recommendations",
        "A wiki link to the existing JVM documentation on the internal knowledge base, with instructions for teams to self-serve their configuration needs",
        "No artefact — schedule a series of workshops instead where each team receives personalised guidance on their specific memory configuration",
        "An email to all engineering teams announcing the initiative and asking them to review their JVM configuration against the new guidelines",
        "A short, opinionated baseline standard plus a one-page rollout guide and a working reference image"
      ],
      "ans": 4,
      "fb": "Adoption is driven by friction. A clear baseline, a one-page guide, and a working reference let teams adopt without re-deriving the answer. Long reports rarely change behaviour."
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 0,
      "q": "You are presenting a three-year JVM technology roadmap to engineering leadership. What is the most important element to include regarding memory management?",
      "opts": [
        "Only GraalVM evaluation",
        "Only the next Java version",
        "A timeline mapping LTS Java versions, GC improvements, and platform features (CRaC, virtual threads) to fleet adoption milestones — with cost and risk projections for each phase",
        "A list of all JVM flags",
        "A promise to eliminate all OOMKills"
      ],
      "ans": 2,
      "fb": "Roadmaps must connect technology evolution to business outcomes. Mapping LTS releases and features to adoption milestones with cost/risk projections gives leadership the information to commit resources. Vague promises without timelines are not actionable."
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 0,
      "q": "The CTO asks: 'Should we standardise on one JVM vendor or allow multiple?' You run OpenJDK, Amazon Corretto, and Azul Zulu across the fleet. What is the most defensible recommendation?",
      "opts": [
        "It does not matter",
        "Allow any vendor",
        "Use GraalVM for everything",
        "Standardise on a single vendor (e.g., the one with best GKE support and LTS alignment) for all new services, with a documented exception process for teams with vendor-specific needs. This reduces testing matrix and upgrade complexity.",
        "Ban all non-Oracle JDKs"
      ],
      "ans": 3,
      "fb": "Multiple JVM vendors multiply the testing and upgrade burden. Standardising reduces the matrix while exceptions preserve legitimate choices. The key is that the default is clear and the exception process is real, not a rubber stamp."
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 0,
      "q": "You are planning the fleet's Java 21 to Java 25 LTS migration. Java 25 removes a deprecated API that 8 services depend on. The migration window is 18 months. What is the most strategic sequencing?",
      "opts": [
        "Start immediately: audit all services for deprecated API usage, create a compatibility shim or migration guide, pilot with the least critical service first, then batch-migrate in risk-ordered cohorts — with a rollback plan per cohort",
        "Skip Java 25",
        "Wait until the deadline",
        "Migrate all services simultaneously",
        "Ask each team to figure it out independently"
      ],
      "ans": 0,
      "fb": "Large migrations succeed through risk-ordered phasing. Early audit quantifies scope. A compatibility shim reduces per-team effort. Piloting with low-risk services validates the approach. Batch migration with rollback plans bounds blast radius. Independent migration creates duplicated work and inconsistent outcomes."
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 1,
      "q": "You are building a business case for investing in JVM memory reliability improvements. Which metric most directly translates to financial impact?",
      "opts": [
        "Revenue-weighted SLA compliance rate: the percentage of requests meeting latency targets, weighted by the revenue each service tier generates",
        "Fleet average heap utilisation",
        "Number of heap dumps collected",
        "Number of services migrated to ZGC",
        "Lines of code changed"
      ],
      "ans": 0,
      "fb": "Revenue-weighted SLA compliance connects engineering work to business outcomes. A 1% improvement on a high-revenue service is worth more than 10% on an internal tool. This framing justifies investment in terms leadership understands."
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 1,
      "q": "Your fleet spends $120K/year on memory across 40 services. You identify that 10 services are over-provisioned by ~40%. What is the most defensible cost optimisation approach?",
      "opts": [
        "Wait for costs to become a crisis",
        "Cut all services by 40%",
        "Reduce replicas instead",
        "Ask teams to self-optimise",
        "Model the savings from right-sizing those 10 services based on 30-day P95 usage + non-heap headroom. Present the projected $48K annual savings alongside the risk (increased OOMKill probability per service) and the monitoring plan."
      ],
      "ans": 4,
      "fb": "Cost optimisation must be data-driven with explicit risk. Modelling savings from specific services, quantifying the OOMKill risk, and defining the monitoring plan turns a cost-cutting exercise into an engineering decision that leadership can confidently approve."
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 3,
      "q": "After a major cross-team memory incident, you want to establish a blameless post-mortem culture. What is the single most important structural element?",
      "opts": [
        "Skipping the review entirely to avoid conflict",
        "A blame-free declaration without follow-through",
        "A private report shared only with management",
        "A structured post-mortem template that separates timeline/facts from contributing factors and action items, with a facilitator who enforces 'what happened' over 'who caused it'",
        "Verbal discussion with no written record"
      ],
      "ans": 3,
      "fb": "Blameless post-mortems require structure. A template forces factual reconstruction. A facilitator prevents blame drift. Written action items create accountability. Without all three, 'blameless' becomes an empty promise and teams stop reporting incidents honestly."
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 3,
      "q": "You notice that post-mortem action items from memory incidents are completed only 40% of the time. Teams say they are too busy. How do you increase completion without creating an adversarial dynamic?",
      "opts": [
        "Track action item completion on the same fleet dashboard as OOMKills, making the gap between incidents and follow-through visible. Pair high-priority items with dedicated time allocations in the next sprint.",
        "Mandate 100% completion",
        "Stop doing post-mortems",
        "Escalate every incomplete item to leadership",
        "Assign all items to the platform team"
      ],
      "ans": 0,
      "fb": "Visibility drives accountability better than mandates. Showing incomplete items alongside recurring incidents creates a natural feedback loop: teams see that unfixed items cause future incidents. Dedicated time allocation removes the 'too busy' blocker without confrontation."
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 3,
      "q": "You are building an organisation-wide knowledge base for JVM memory investigations. Three teams independently investigated and solved the same class loader leak pattern in the past year. What structural change prevents this waste?",
      "opts": [
        "Email everyone after each incident",
        "More meetings",
        "Build a searchable incident pattern library indexed by symptoms (Metaspace growth, class count, GC behaviour) with tagged resolution patterns. Integrate it into the incident triage runbook so investigators check it before starting from scratch.",
        "Centralise all debugging to one team",
        "Nothing — duplication is inevitable"
      ],
      "ans": 2,
      "fb": "Searchable pattern libraries indexed by symptoms transform individual investigations into organisational knowledge. Integrating with the triage runbook ensures investigators check known patterns first. This is how engineering organisations scale their expertise beyond individual engineers."
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 4,
      "q": "You are asked to estimate the annual cost of JVM memory incidents across the fleet. Which inputs produce the most credible estimate?",
      "opts": [
        "Pod restart count only — multiply the total restarts by an average per-restart cost estimate to get a rough annual cost figure for leadership",
        "Guesses from senior engineers about how much time they spend on memory issues — experienced estimates are usually accurate enough for budgeting",
        "Total fleet memory cost — the annual GKE compute spend on memory is the most relevant metric because OOMKills drive container over-provisioning",
        "Number of heap dumps collected — more dumps indicate more incidents, and the storage cost of heap dump files provides a proxy for incident frequency",
        "Number of OOMKill events x average time-to-resolve x engineer cost per hour, plus estimated customer impact (SLA violations, support tickets) — broken down by service tier"
      ],
      "ans": 4,
      "fb": "Credible cost estimates combine engineering time with business impact. OOMKills x resolution time gives engineering cost. SLA violations and support tickets give customer cost. Breaking down by service tier shows where investment has the highest return."
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 2,
      "q": "You are evaluating whether to invest in GraalVM native image compilation for the fleet's 10 serverless-style services. What is the most complete cost-benefit analysis framework?",
      "opts": [
        "Compare: build pipeline complexity increase + maintenance burden of native image compatibility vs cold start time reduction x invocation frequency x cost per cold start. Include the P99 latency regression at steady state for services that need peak throughput.",
        "Just measure startup time",
        "Native image is always better",
        "Native image is never worth it",
        "Only consider image size"
      ],
      "ans": 0,
      "fb": "Native image cost-benefit must capture both sides: the operational savings (faster cold start, lower RSS) and the engineering costs (build complexity, library compatibility, lost JIT). For services invoked frequently with short lifetimes, the savings dominate. For long-running services, the JIT loss may dominate."
    }
  ]
};
