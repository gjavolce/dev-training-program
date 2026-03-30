# A1 — What Is the JVM and Why Should I Care?

**Track A, Session 1** | 2 hours | Profile: `default` (healthy app)

---

## Pre-Session Setup

**Trainer prep:**
- Ensure loyalty-service runs locally: `docker-compose up -d && ./mvnw spring-boot:run`
- Verify `jcmd` works: `jcmd <pid> VM.version`
- Have VisualVM installed and connected to the running app
- Load the Grafana JVM dashboard (if using GKE training instance)
- Distribute the Getting Started guide at least 3 days before this session

**Participant prep:**
- Clone the loyalty-service repo
- Run `docker-compose up -d` (PostgreSQL + Kafka)
- Run the app: `./mvnw spring-boot:run`
- Verify: `curl http://localhost:8080/actuator/health` returns UP

---

## Theory A — The JVM as a Runtime (~15 min)

### Trainer Notes

**Context:** Use an e-commerce order processing service as the theory example. Everyone has placed an online order — it's universally relatable.

**Open with:** "Every Spring Boot service we run — payments, customer onboarding, loyalty, fraud detection — runs inside a JVM. Today we're going to open the hood and look at what's actually happening in there."

**Key concepts to cover:**

**1. What the JVM actually does for you**
Your Java code compiles to bytecode (`.class` files). The JVM reads bytecode and executes it. This is why Java is "write once, run anywhere" — different JVMs exist for different platforms, but the bytecode is the same.

In practice at SEB Embedded: the same Spring Boot JAR runs on your laptop (macOS JVM) and on GKE (Linux JVM). The JVM handles the platform differences.

**2. Heap vs Stack — where things live**

```
┌─────────────────────────────────────────┐
│                  JVM                     │
│  ┌──────────────┐  ┌──────────────────┐ │
│  │    HEAP       │  │   STACK          │ │
│  │              │  │  (per thread)    │ │
│  │  Your objects │  │  Method calls   │ │
│  │  Spring beans │  │  Local variables│ │
│  │  Cached data  │  │  Parameters     │ │
│  │              │  │                  │ │
│  │  Shared by    │  │  Private to     │ │
│  │  all threads  │  │  each thread    │ │
│  └──────────────┘  └──────────────────┘ │
│  ┌──────────────┐  ┌──────────────────┐ │
│  │  METASPACE    │  │  DIRECT BUFFERS  │ │
│  │  Class defs   │  │  NIO, Kafka,    │ │
│  │  Spring AOP   │  │  HikariCP       │ │
│  │  proxies      │  │                  │ │
│  └──────────────┘  └──────────────────┘ │
└─────────────────────────────────────────┘
```

**Whiteboard this.** Draw the JVM as a box. Inside it: Heap (big), Stack (per thread, small), Metaspace, Direct Buffers. Label each with what lives there.

- **Heap:** All your objects. Every `new Object()`, every Spring bean, every database result, every Kafka message payload. Managed by the garbage collector.
- **Stack:** Per thread. Method call chain, local variables, method parameters. Small, fast, automatically cleaned up when the method returns.
- **Metaspace:** Class definitions. Spring Boot loads a LOT of classes (your code + Spring framework + AOP proxies + Kafka client + HikariCP). This lives outside the heap.
- **Direct buffers:** Used by NIO (network I/O), Kafka client, HikariCP for fast I/O. Also outside the heap.

**E-commerce example:** "When a customer places an order, the order processing service creates an `Order` object (heap), calls `orderService.process(order)` (stack frame), which uses a database connection from HikariCP (direct buffer) to save to Cloud SQL. The `OrderService` class definition itself lives in Metaspace."

**3. Why this matters for production**

The punchline: the JVM manages memory FOR you (garbage collection), but you control HOW MUCH memory it can use (`-Xmx`). If you get the budget wrong, bad things happen:
- Heap too small → frequent GC pauses → slow responses
- Heap too big for the container → OOMKilled by Kubernetes
- Too many threads → stack memory adds up → OOMKilled
- Memory leak (objects that should be GC'd but aren't) → gradual degradation → crash

**Don't cover:** JIT compilation, bytecode details, class loading internals. Those are Track B topics.

### Ask the Room
- "Has anyone seen an OOMKilled pod restart? What was your first reaction?"
- "When you deploy a Spring Boot service, do you know what `-Xmx` is set to?"

---

## Capstone A — Inspect a Running JVM (~20 min)

### Context
The loyalty-service is running locally on the default (healthy) profile. Engineers will use `jcmd` and the Actuator to look at a living JVM.

### Core Exercise (everyone)

**Task:** Inspect the loyalty-service JVM and document what you find.

1. Find the PID of the running loyalty-service:
```bash
jcmd
# or
jps -l
```

2. Get the JVM version and flags:
```bash
jcmd <pid> VM.version
jcmd <pid> VM.flags
```

3. Get the current heap information:
```bash
jcmd <pid> GC.heap_info
```

4. Check the Spring Boot Actuator metrics:
```bash
curl -s http://localhost:8080/actuator/metrics/jvm.memory.used | python3 -m json.tool
curl -s http://localhost:8080/actuator/metrics/jvm.memory.max | python3 -m json.tool
curl -s http://localhost:8080/actuator/metrics/jvm.threads.live | python3 -m json.tool
```

5. Fill in this table:

| Property | Value |
|---|---|
| Java version | |
| GC algorithm | |
| Heap max (-Xmx) | |
| Heap current used | |
| Metaspace used | |
| Live thread count | |
| Number of GC collections | |

**Answer key (approximate, for trainer):**
- Java 21, G1GC, Xmx depends on configuration (default 512m), heap ~100-200m at rest, Metaspace ~60-80m (Spring loads many classes), ~30-40 threads at rest (Tomcat + Kafka consumers + HikariCP + internal), 5-20 GC collections since startup.

### Medium Exercise

**Task:** The loyalty-service has been running for 5 minutes. Generate some load and observe how the JVM responds.

1. In another terminal, hit the rewards endpoint repeatedly:
```bash
for i in $(seq 1 500); do curl -s http://localhost:8080/api/rewards > /dev/null; done
```

2. While the load is running, check heap info again:
```bash
jcmd <pid> GC.heap_info
```

3. Check GC count before and after:
```bash
curl -s http://localhost:8080/actuator/metrics/jvm.gc.pause
```

4. Answer: Did the heap usage go up during load? Did it come back down after? How many GC pauses occurred? Were they long or short?

**What to observe:** Heap goes up during load (objects being created), GC cleans up short-lived objects, heap returns to baseline after load stops. This is normal, healthy behavior — next session we'll see what unhealthy looks like.

### Hard Exercise

**Task:** Connect VisualVM to the running loyalty-service and build a baseline picture.

1. Open VisualVM, connect to the loyalty-service PID
2. Go to the Monitor tab. Screenshot or note:
   - Heap usage pattern (sawtooth = healthy)
   - Thread count (stable = healthy)
   - CPU usage (low at rest = healthy)
3. Go to the Threads tab. Categorize:
   - How many threads are RUNNABLE?
   - How many are WAITING or TIMED_WAITING?
   - Can you identify: Tomcat threads, Kafka consumer threads, HikariCP threads?
4. Generate load again while watching VisualVM. Document what changes.
5. Write a brief "JVM health baseline" for the loyalty-service: heap pattern, thread count, GC frequency, CPU at rest vs under load.

**Why this matters:** Session 9 asks engineers to diagnose a "sick" service. Having a documented healthy baseline makes it possible to spot what's wrong.

---

## Theory B — What Spring Boot Does at Startup (~15 min)

### Trainer Notes

**Context:** Still using the e-commerce order service as the example.

**Key concepts:**

**1. Spring Boot startup is JVM-intensive**

When you run a Spring Boot service, the JVM does an enormous amount of work:
- Loads 5,000-15,000 classes (your code is maybe 100, the rest is Spring, Hibernate, Kafka client, etc.)
- Creates Spring beans: component scan, dependency injection, proxy generation (AOP)
- Opens database connections: HikariCP pool initialization
- Starts Kafka consumers: connection to brokers, consumer group join, partition assignment
- JIT compilation hasn't kicked in yet: first requests are always slower

**E-commerce example:** "When the order service starts, it loads Spring, Hibernate, the Kafka client, HikariCP, and all your order-processing beans. HikariCP opens connections to Cloud SQL. Kafka consumers join the consumer group. The first order that comes in is processed slower than order #1000 — the JVM hasn't optimized the hot paths yet."

**2. The "warm-up" effect**

The JVM gets faster over time:
- JIT compiler identifies "hot" methods (called frequently) and compiles them from bytecode to native machine code
- After a few thousand requests, the JVM has optimized the common paths
- This is why a freshly deployed service has higher p99 latency than one that's been running for 10 minutes

**In practice:** This is why Kubernetes readiness probes matter. You don't want traffic hitting a cold JVM. At SEB Embedded, services should have readiness probes that wait for Spring context initialization + a brief warmup period.

**3. `-Xmx` and `-Xms` — the first flags you should know**

- `-Xmx512m`: Maximum heap size. The JVM will NEVER use more heap than this.
- `-Xms512m`: Initial heap size. The JVM starts with this much heap allocated.
- Setting them equal (`-Xms512m -Xmx512m`) avoids resize pauses. This is our standard practice.

**Where to find them in our stack:** Kubernetes deployment manifests → `env` section → `JAVA_OPTS` or `JDK_JAVA_OPTIONS`.

**Don't cover:** JIT compiler internals, tiered compilation, class loading delegation model. Mention JIT exists and makes things faster, don't explain how.

### Ask the Room
- "After you deploy a service, do you look at it differently for the first few minutes vs after it's been running a while?"
- "Do you know where -Xmx is configured for your team's services?"

---

## Capstone B — Spring Boot Startup Observation (~20 min)

### Core Exercise

**Task:** Watch the loyalty-service start up and document the JVM's startup behavior.

1. Stop the loyalty-service if running. Start it with GC logging:
```bash
JAVA_OPTS="-Xlog:gc*:stdout:time" ./mvnw spring-boot:run
```

2. In the console output, find:
   - How many GC events happened during startup?
   - Were they minor (young gen) or major (old gen)?
   - How long did the longest pause take?

3. Check startup time:
```bash
# Spring Boot logs "Started LoyaltyServiceApplication in X seconds"
```

4. Immediately after startup, before any traffic:
```bash
jcmd <pid> GC.heap_info
curl -s http://localhost:8080/actuator/metrics/jvm.classes.loaded
```

5. Fill in:

| Metric | At startup | After 500 requests |
|---|---|---|
| Heap used | | |
| Classes loaded | | |
| GC count (young) | | |
| GC count (old) | | |
| Thread count | | |

6. Hit the rewards endpoint 500 times and fill in the "After 500 requests" column.

**Learning point:** Classes loaded increases slightly after first requests (lazy loading), heap usage is higher during load but GC handles it, thread count may increase slightly as Tomcat creates threads on demand.

### Medium Exercise

**Task:** Compare cold vs warm response times.

1. Restart the loyalty-service (fresh JVM)
2. Immediately measure response time for the first 10 requests:
```bash
for i in $(seq 1 10); do
    time curl -s http://localhost:8080/api/rewards > /dev/null
done 2>&1 | grep real
```
3. Now generate 1000 requests to warm up:
```bash
for i in $(seq 1 1000); do curl -s http://localhost:8080/api/rewards > /dev/null; done
```
4. Measure 10 more requests:
```bash
for i in $(seq 1 10); do
    time curl -s http://localhost:8080/api/rewards > /dev/null
done 2>&1 | grep real
```
5. Compare: How much faster are the "warm" requests? Why?

**Expected:** Cold requests: 50-200ms. Warm requests: 5-20ms. The difference is JIT compilation, Spring context fully initialized, HikariCP connections established, Kafka consumers stable.

### Hard Exercise

**Task:** Map the loyalty-service's full JVM memory landscape at rest and under load.

1. Start the loyalty-service with Native Memory Tracking:
```bash
JAVA_OPTS="-XX:NativeMemoryTracking=summary" ./mvnw spring-boot:run
```

2. After startup, get the full memory breakdown:
```bash
jcmd <pid> VM.native_memory summary
```

3. Document:

| Memory region | Size |
|---|---|
| Java Heap (reserved) | |
| Java Heap (committed) | |
| Class (Metaspace) | |
| Thread (count × stack size) | |
| Code (JIT compiled) | |
| GC (GC internal data) | |
| Internal | |
| Other | |
| **Total committed** | |

4. Compare: Total committed vs your Xmx setting. How much memory does the JVM use BEYOND the heap?

5. Now start the load generator (500 requests) and re-run `VM.native_memory summary`. What grew?

**Key insight:** The JVM uses significantly more memory than just `-Xmx`. If your container limit is 512Mi and Xmx is 450m, you're in danger. The non-heap memory (Metaspace + threads + JIT code + GC + direct buffers) can easily be 100-200MB. This is why Session 4 exists.

---

## Group Challenge — JVM Quiz and Discussion (~20 min)

Split into groups of 3-4. Each group gets this scenario:

> Your team deploys a Spring Boot loyalty service to GKE. The deployment manifest has:
> - Container memory limit: 1Gi
> - `-Xmx768m -Xms768m`
> - No other JVM flags
>
> The service starts fine but after 2 hours under normal traffic, the pods restart with OOMKilled status. CPU usage was normal. GC logs show no full GCs.

**Questions for each group (10 min discussion, 10 min share-out):**

1. If it's not a heap issue (GC logs are clean, no full GCs), what else in the JVM could be consuming memory? List at least 3 things.

2. The `-Xmx768m` is 75% of the 1Gi container limit. Is that too much, too little, or about right? What ratio would you use?

3. What JVM flags would you add to this deployment to make the NEXT OOMKill incident easier to diagnose?

4. Bonus: Without any JVM changes, what Kubernetes config could help prevent abrupt OOMKill restarts?

**Trainer answer notes:**
1. Metaspace (Spring + Kafka + Hibernate classes), thread stacks (200 Tomcat threads × 1MB default = 200MB), direct byte buffers (Kafka consumer, HikariCP), JIT code cache, GC internal structures.
2. 75% is borderline dangerous. 60-70% is the safe range, leaving 300-400MB for non-heap. With 768m heap in a 1Gi container, that leaves only ~256MB for everything else.
3. `-XX:+HeapDumpOnOutOfMemoryError`, `-XX:HeapDumpPath=/tmp/`, `-XX:NativeMemoryTracking=summary`, `-Xlog:gc*:file=/tmp/gc.log`.
4. Kubernetes: set memory request = limit (guaranteed QoS), configure liveness/readiness probes with appropriate timeouts, consider a preStop hook for graceful drain.

---

## Wrap-up (~5 min)

**Key takeaways:**
- The JVM is more than just the heap — Metaspace, thread stacks, direct buffers, and GC all consume memory
- `-Xmx` controls heap, but your container needs to fit everything else too
- A freshly started JVM is slower than a warm one (JIT compilation)
- `jcmd` is your Swiss Army knife: `VM.version`, `VM.flags`, `GC.heap_info`, `VM.native_memory`
- A healthy JVM has a sawtooth heap pattern in VisualVM — that's GC doing its job

**Preview of Session 2:** "Today we looked at a healthy JVM. Next time we'll break it — we'll generate garbage collection pressure and learn to read GC logs. You'll learn why some objects die young and others stick around forever."

**Between-session exercise:**
Find the Kubernetes deployment manifest for one of your team's services. Document:
- What `-Xmx` is set to
- What the container memory limit is
- What percentage of the container limit is allocated to heap
- Whether there are any other JVM flags configured

Bring this to Session 2 — we'll use it as context for the container memory discussion in Session 4.

---

*Tags:* #training-program #jvm #track-a #session-1 #materials
