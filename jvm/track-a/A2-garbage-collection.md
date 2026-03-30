# A2 — Garbage Collection: What's Happening Under the Hood

**Track A, Session 2** | 2 hours | Profile: `gc-pressure`

---

## Pre-Session Setup

**Trainer prep:**
- Run loyalty-service with default profile first — confirm healthy GC baseline
- Then switch to gc-pressure profile: `SPRING_PROFILES_ACTIVE=gc-pressure ./mvnw spring-boot:run`
- Verify GC logging works: `JAVA_OPTS="-Xlog:gc*:stdout:time"`
- Have the GC Log Reading Template printed/ready for participants
- Pre-generate a 2-minute GC log from both profiles for comparison (in case local setup fails)

**Participant prep:**
- Completed Session 1 between-session exercise (know their team's -Xmx and container limit)
- loyalty-service running locally

---

## Theory A — Why Garbage Collection Exists (~15 min)

### Trainer Notes

**E-commerce context:** "When a customer browses the product catalog, the order service creates objects: Product DTOs, List collections, JSON serialization buffers, database ResultSets. After the response is sent, those objects are no longer needed. Who cleans them up?"

**Key concepts:**

**1. The alternative: manual memory management**
In C/C++, the programmer allocates and frees memory. Forget to free → memory leak. Free too early → crash (use-after-free). Free twice → crash (double-free). This is the #1 source of security vulnerabilities in C code.

The JVM takes this burden away: the garbage collector automatically identifies objects that are no longer reachable and reclaims their memory.

**2. The generational hypothesis**
Observation: most objects die young. A temporary ArrayList created during request processing? Gone in milliseconds. A Spring bean? Lives forever.

The JVM exploits this by dividing the heap into generations:

```
┌─────────────────────────────────────────────┐
│                    HEAP                      │
│  ┌───────────────────┐  ┌────────────────┐  │
│  │  YOUNG GENERATION  │  │ OLD GENERATION │  │
│  │                   │  │                │  │
│  │  ┌─────┐ ┌─────┐ │  │  Long-lived    │  │
│  │  │Eden │ │Surv.│ │  │  objects:       │  │
│  │  │     │ │     │ │  │  Spring beans,  │  │
│  │  │ New │ │Copy │ │  │  caches,        │  │
│  │  │ obj.│ │here │ │  │  connection     │  │
│  │  │     │ │first│ │  │  pools          │  │
│  │  └─────┘ └─────┘ │  │                │  │
│  └───────────────────┘  └────────────────┘  │
└─────────────────────────────────────────────┘
```

- **Eden:** Where new objects are born. Cheap to allocate (bump pointer). When Eden fills up → **minor GC** (also called young GC).
- **Survivor spaces:** Objects that survive one minor GC get copied here. Survive several minor GCs → promoted to Old Generation.
- **Old Generation:** Long-lived objects. Spring beans, caches, connection pool objects. Only cleaned by **major GC** (also called old GC or full GC), which is more expensive.

**E-commerce example:** "When a customer adds items to their cart, the `CartItem` objects are created in Eden. When the request finishes, those objects become unreachable. The next minor GC sweeps Eden and they're gone — very fast, barely noticeable. But the `HikariDataSource` bean that manages database connections? That was created at startup and lives in Old Gen for the entire service lifetime."

**3. Minor GC vs Major GC**

| | Minor GC | Major GC |
|---|---|---|
| What it cleans | Young generation (Eden + Survivors) | Old generation (+ optionally young) |
| How often | Frequently (seconds to minutes) | Rarely (minutes to hours) |
| How long | Short (1-20ms typically) | Longer (50-500ms, sometimes seconds) |
| When it's triggered | Eden is full | Old gen is filling up |
| Impact | Usually negligible | Can cause noticeable latency spikes |

**Don't cover:** G1 region layout, ZGC colored pointers, concurrent marking details. Those are Session 7 (and Track B).

### Ask the Room
- "When your service has a latency spike, what's the first thing you check? Have you ever considered GC?"
- "Quick show of hands: who has read a GC log before?"

---

## Capstone A — Reading GC Logs from the Healthy App (~20 min)

### Core Exercise

**Task:** Run the loyalty-service with GC logging, generate load, and read the output.

1. Start with GC logging enabled:
```bash
JAVA_OPTS="-Xlog:gc*:stdout:time,level,tags" ./mvnw spring-boot:run
```

2. Generate 2 minutes of steady load:
```bash
for i in $(seq 1 1000); do
    curl -s http://localhost:8080/api/rewards > /dev/null
    curl -s http://localhost:8080/api/members/1/points > /dev/null
done
```

3. Capture the GC log output. For **5 GC events**, fill in the GC Log Reading Template:

| Field | Event 1 | Event 2 | Event 3 | Event 4 | Event 5 |
|---|---|---|---|---|---|
| Timestamp | | | | | |
| GC type (minor/major) | | | | | |
| Pause duration (ms) | | | | | |
| Heap before | | | | | |
| Heap after | | | | | |
| Memory freed | | | | | |

4. Answer: Were all events minor GCs or were there any major GCs? Is that expected for light load?

**How to read a GC log line (trainer reference):**
```
[2024-01-15T10:30:45.123+0000][info][gc] GC(42) Pause Young (Normal) (G1 Evacuation Pause) 256M->48M(512M) 4.321ms
                                                    ─── type ───       ─── cause ───         before→after(max) duration
```

### Medium Exercise

**Task:** Compare the GC log from the Actuator metrics endpoint.

1. Before generating load:
```bash
curl -s http://localhost:8080/actuator/metrics/jvm.gc.pause | python3 -m json.tool
curl -s http://localhost:8080/actuator/metrics/jvm.gc.memory.allocated | python3 -m json.tool
```

2. Generate 2000 requests. Re-check the same metrics.

3. Calculate:
   - Total GC pause time during the load period
   - Average allocation rate (memory.allocated delta / time)
   - Average GC frequency (number of pauses / time)

4. Is this healthy? For reference: a well-behaved Spring Boot service typically has <10ms average minor GC pause, and allocates 100-500 MB/sec under moderate load.

### Hard Exercise

**Task:** Use VisualVM to watch GC in real-time.

1. Connect VisualVM to the loyalty-service
2. Open the Monitor tab — watch the Heap graph
3. Install the VisualGC plugin (Tools → Plugins → Available Plugins → Visual GC)
4. Open the Visual GC tab — this shows Eden, Survivor, Old Gen separately
5. Generate load and observe:
   - Eden fills up and drops (minor GC)
   - Survivor spaces alternate
   - Old Gen grows slowly (promotions from young gen)
6. Screenshot the Visual GC view and annotate: where is Eden? Where is the GC clearing? Is Old Gen growing? At what rate?
7. Write a one-paragraph assessment: "The loyalty-service GC behavior under moderate load is [healthy/concerning] because..."

---

## Theory B — When GC Goes Wrong (~15 min)

### Trainer Notes

**E-commerce context:** "Your order processing service is normally fast — 10ms per request. But every 30 seconds, there's a 200ms spike. Customers notice. The load balancer notices. What's causing it?"

**Key concepts:**

**1. GC pressure — too much allocation**
If your code creates too many short-lived objects, Eden fills up faster, minor GCs happen more often, and they take longer because there's more to scan. Common causes:
- Inefficient string concatenation in loops (`+` instead of `StringBuilder`)
- Creating new objects where you could reuse (`new BigDecimal(...)` on every calculation)
- Copying collections unnecessarily (`new ArrayList<>(existingList)`)
- Using `SimpleDateFormat` (creates lots of internal objects)

**E-commerce example:** "The order service has a pricing calculation that creates a new BigDecimal for every item, every discount, every tax calculation. For an order with 50 items, that's 200+ BigDecimal objects per request. Multiply by 1000 requests/sec and Eden fills up every second."

**2. Memory leak — objects that should die but don't**
If objects are reachable but no longer useful, GC can't collect them. The heap fills up, GC works harder and harder, eventually you get OutOfMemoryError. Common causes:
- Unbounded caches (add entries but never evict)
- Event listeners that are registered but never removed
- Static collections that grow over time
- ThreadLocal variables not cleaned up

"We'll diagnose a real memory leak in Session 3."

**3. GC thrashing — the death spiral**
When the heap is nearly full, GC runs constantly but can barely free any memory. The application spends more time in GC than doing actual work. Symptoms:
- GC logs show major GCs happening every few seconds
- Each GC frees very little memory
- Application response times go from milliseconds to seconds
- CPU is high but throughput is near zero

"This is the worst state your service can be in. It's responsive enough that Kubernetes doesn't kill it, but too slow to be useful."

**Don't cover:** GC algorithm specifics (G1 regions, ZGC load barriers). That's Session 7.

### Ask the Room
- "Has anyone's service had mysterious latency spikes that went away on their own? Could that have been GC?"
- "What's the difference between a slow service and a service with GC pressure? How would you tell?"

---

## Capstone B — GC Pressure in the Loyalty Service (~25 min)

### Core Exercise

**Task:** Switch to the `gc-pressure` profile and observe the difference.

1. Stop the app. Restart with:
```bash
SPRING_PROFILES_ACTIVE=gc-pressure JAVA_OPTS="-Xlog:gc*:stdout:time,level,tags" ./mvnw spring-boot:run
```

2. Generate load — trigger the points calculation endpoint:
```bash
for i in $(seq 1 200); do
    curl -s -X POST http://localhost:8080/api/members/$((RANDOM % 100 + 1))/points/calculate > /dev/null
done
```

3. Compare GC logs to the healthy run from Capstone A:

| Metric | Default profile | gc-pressure profile |
|---|---|---|
| Minor GC frequency (per minute) | | |
| Average minor GC pause (ms) | | |
| Max minor GC pause (ms) | | |
| Any major GCs? | | |
| Heap after GC (does it return to baseline?) | | |

4. Which profile generates more garbage? How can you tell from the GC log?

**Expected:** gc-pressure profile shows 3-5x more frequent minor GCs, longer average pauses, higher allocation rate. The heap pattern is still sawtooth (not a leak), but the teeth are much more frequent.

### Medium Exercise

**Task:** Use the Actuator to quantify the difference.

1. Record these metrics for BOTH profiles (restart between them, same load):
```bash
# Before load
curl -s http://localhost:8080/actuator/metrics/jvm.gc.pause
# After 200 points/calculate requests
curl -s http://localhost:8080/actuator/metrics/jvm.gc.pause
curl -s http://localhost:8080/actuator/metrics/jvm.gc.memory.allocated
```

2. Calculate the allocation rate difference (MB/sec) between the two profiles.

3. The gc-pressure profile has intentionally wasteful code in `PointsService`. Without looking at the source code, based ONLY on the GC behavior, write a hypothesis: "The gc-pressure version is allocating more because it's probably creating [what kind of objects?] [where in the code?]"

4. Now look at the source code for `PointsService` under the gc-pressure profile. How close was your hypothesis?

**Learning point:** GC behavior tells you THAT something is allocating too much. Profiling (Session 5, JFR) tells you WHAT and WHERE.

### Hard Exercise

**Task:** Measure the user-visible impact of GC pressure.

1. Run the default profile. Measure p50 and p99 latency for 500 requests:
```bash
# Use the load generator or measure manually
for i in $(seq 1 500); do
    start=$(date +%s%N)
    curl -s http://localhost:8080/api/members/$((RANDOM % 100 + 1))/points/calculate > /dev/null
    end=$(date +%s%N)
    echo $(( (end - start) / 1000000 ))
done | sort -n | awk 'BEGIN{n=0}{a[n++]=$1}END{print "p50: "a[int(n*0.5)]"ms, p99: "a[int(n*0.99)]"ms"}'
```

2. Repeat with the gc-pressure profile. Same load, same measurement.

3. Compare:

| | Default | gc-pressure |
|---|---|---|
| p50 latency | | |
| p99 latency | | |
| Total GC time during test | | |

4. If this service had a p99 SLA of 100ms, would the gc-pressure version breach it?

5. Write a brief: "The gc-pressure version is [X]ms slower at p99 because GC pauses add [Y]ms of overhead during [Z]% of requests."

---

## Group Challenge — GC Detective (~20 min)

Split into groups of 3-4. Present this scenario:

> Your team's payment processing service has been running fine for months. This week, the monitoring dashboard shows:
> - Minor GC frequency increased from 5/min to 25/min
> - Average GC pause increased from 3ms to 12ms
> - No change in traffic volume
> - No deployments this week
> - Heap after GC is the same (no leak — GC is reclaiming memory fine)
>
> Something changed. But what?

**Discussion questions (10 min):**

1. If traffic didn't change and there's no leak, what could cause MORE allocation? List at least 4 possibilities.

2. A teammate suggests "just increase -Xmx." Would that help? Why or why not?

3. How would you find the specific code path that's allocating more? (Hint: which tool from Session 5's preview would help?)

4. Could this be caused by something OUTSIDE your code? (Think: a library upgrade, a data pattern change, a config change)

**Trainer answer notes:**
1. New feature branch merged with inefficient code, upstream service sending larger payloads, a database query returning more rows than before (triggering more object creation during mapping), a logging library change that creates more string objects, a JSON serializer change, a Spring Boot auto-config change from a library bump.
2. More heap = more memory for objects before GC triggers, so GC frequency goes down. But the ROOT CAUSE is still there — you're just hiding it. The allocation rate is still high, and you'll need more memory again later. Fix the code, not the symptoms.
3. JFR (Java Flight Recorder) — it shows allocation hotspots. "We'll learn this in Session 5."
4. Absolutely. A Kafka client upgrade that changes deserialization behavior. A Jackson upgrade that changes how JSON is parsed. A Spring Boot version bump that changes auto-configuration. Even a database driver upgrade.

---

## Wrap-up (~5 min)

**Key takeaways:**
- The JVM divides the heap into young and old generations because most objects die young
- Minor GC cleans young gen (fast, frequent), major GC cleans old gen (slow, rare)
- GC pressure = too much allocation = more frequent, longer GC pauses = higher latency
- GC logs tell you THAT there's a problem; profiling (Session 5) tells you WHERE
- "Just increase -Xmx" is a band-aid, not a fix

**Preview of Session 3:** "Today we saw GC working hard but successfully. Next time we'll see GC FAIL — a memory leak where objects pile up and can never be collected. You'll learn to take a heap dump, open it in Eclipse MAT, and trace the leak to the exact line of code."

**Between-session exercise:**
Enable GC logging on the loyalty-service with default profile and leave it running for 30 minutes under light load. Save the GC log. Bring it to Session 3 — we'll use it as a comparison baseline.

Optional: If your team has a staging environment, try adding `-Xlog:gc*:file=/tmp/gc.log` to one service's JVM flags (in a test environment only). Capture 10 minutes of GC log. How does it compare to the training app?

---

*Tags:* #training-program #jvm #track-a #session-2 #materials
