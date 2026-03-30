# A3 — Heap Dumps and Finding Memory Problems

**Track A, Session 3** | 2 hours | Profile: `leak`

---

## Pre-Session Setup

**Trainer prep:**
- Run loyalty-service with `leak` profile: `SPRING_PROFILES_ACTIVE=leak ./mvnw spring-boot:run`
- Hit `/api/rewards` ~2000 times to build up the leak before the session
- Verify heap usage is growing in Actuator: `curl -s http://localhost:8080/actuator/metrics/jvm.memory.used`
- Have Eclipse MAT installed and verified it can open `.hprof` files
- Pre-capture two heap dumps (one early, one after 2000 requests) as backup
- Have the Heap Dump Analysis Template printed/ready

**Participant prep:**
- Eclipse MAT installed (download from eclipse.org/mat)
- loyalty-service running locally
- Completed between-session GC log exercise from Session 2

---

## Theory A — What Is a Heap Dump? (~15 min)

### Trainer Notes

**E-commerce context:** "Your product catalog service has been running for 3 days. It started using 200MB of heap. Now it's using 450MB. It hasn't crashed yet, but the trend is clear — something is holding onto memory that should have been released. How do you find out WHAT?"

**Key concepts:**

**1. A heap dump is a snapshot of everything on the heap**
Think of it as a photograph of every object in memory at one instant. It captures:
- Every object: its class, its size, what it references
- The reference graph: which objects point to which other objects
- GC roots: the "anchors" that keep objects alive (static fields, thread stacks, JNI references)

Size: a heap dump of a 512MB heap produces a ~512MB `.hprof` file. On production services with 2-4GB heaps, dumps can be 2-4GB.

**2. When to take a heap dump**
- **Suspected memory leak:** Heap usage growing over time without plateauing
- **OutOfMemoryError:** If `-XX:+HeapDumpOnOutOfMemoryError` is set, the JVM auto-captures a dump at OOM
- **High memory usage:** Service using more memory than expected, want to know what's consuming it
- **Proactive baseline:** Capture what "healthy" looks like so you can compare later

**3. How to take one**

```bash
# From outside the JVM (safest, production-friendly)
jcmd <pid> GC.heap_dump /tmp/heap.hprof

# From JVM flags (auto-capture on OOM)
-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/
```

**E-commerce example:** "The catalog service is at 450MB heap. We run `jcmd 12345 GC.heap_dump /tmp/catalog-heap.hprof`. This pauses the JVM briefly (a few seconds for a 512MB heap) while it writes the dump. Then we download the file and open it in Eclipse MAT on our laptop."

**Warning:** Taking a heap dump pauses the JVM. For large heaps (4GB+), this can be 10-30 seconds. On production services behind a load balancer, this is usually acceptable — the LB routes traffic to other pods during the pause. But don't take a heap dump on a single-instance service without warning.

**4. Tools for analysis**
- **Eclipse MAT (Memory Analyzer Tool):** The standard. Opens `.hprof` files, shows dominator tree, leak suspects, histogram. This is what we'll use today.
- **VisualVM:** Can take and browse heap dumps, but less powerful analysis than MAT.
- **IntelliJ Profiler:** Built into IntelliJ, good for quick looks but MAT is better for deep analysis.

**Don't cover:** Object header layout, TLAB allocation, reference types (soft, weak, phantom). Those are Track B topics.

### Ask the Room
- "Has anyone ever taken a heap dump in production? What was the experience like?"
- "If I told you an object is 'retained' by another object, what do you think that means?"

---

## Capstone A — Taking and Reading a Heap Dump (~25 min)

### Core Exercise

**Task:** The loyalty-service is running on the `leak` profile. It has a memory leak. Find it.

1. Start the app with the leak profile:
```bash
SPRING_PROFILES_ACTIVE=leak ./mvnw spring-boot:run
```

2. Check the current heap usage:
```bash
curl -s http://localhost:8080/actuator/metrics/jvm.memory.used | python3 -m json.tool
```

3. Generate traffic to trigger the leak — hit the rewards endpoint 1000 times:
```bash
for i in $(seq 1 1000); do curl -s http://localhost:8080/api/rewards > /dev/null; done
```

4. Check heap again. Did it go up? By how much?

5. Take a heap dump:
```bash
jcmd $(jcmd | grep loyalty | awk '{print $1}') GC.heap_dump /tmp/loyalty-heap.hprof
```

6. Open the dump in Eclipse MAT. When it asks, select "Leak Suspects Report."

7. MAT's Leak Suspects report will highlight suspicious objects. From the report, fill in:

| Field | Your finding |
|---|---|
| Suspected leak class | |
| Number of instances | |
| Total retained size | |
| What's holding the reference? (retention path) | |

**Expected finding:** A `HashMap` (or `ConcurrentHashMap`) in `RewardsCacheService` containing thousands of entries. Each entry holds a copy of the rewards catalog. The map grows because entries are added on every request but never evicted.

### Medium Exercise

**Task:** Use the Histogram view instead of Leak Suspects for a more manual investigation.

1. Open the heap dump in MAT → click "Histogram"
2. Sort by "Retained Heap" (descending)
3. The top entries will include:
   - `java.util.HashMap$Node[]` — the array backing a HashMap
   - `com.seb.loyalty.model.RewardItem` — lots of instances
   - `java.lang.String` — strings from reward names/descriptions

4. Right-click the suspicious HashMap → "List Objects" → "with incoming references"
5. Follow the chain: HashMap → field in RewardsCacheService → what's the field name?

6. Right-click the HashMap → "Path to GC Roots" → "exclude weak/soft references"
7. This shows you WHY GC can't collect it: it's rooted in a Spring bean (RewardsCacheService) that lives for the lifetime of the application.

8. Document the full retention chain: GC Root → [what class] → [what field] → HashMap → RewardItem objects

### Hard Exercise

**Task:** Take two heap dumps 5 minutes apart and compare them.

1. Take the first dump:
```bash
jcmd <pid> GC.heap_dump /tmp/loyalty-heap-1.hprof
```

2. Generate 500 more requests:
```bash
for i in $(seq 1 500); do curl -s http://localhost:8080/api/rewards > /dev/null; done
```

3. Wait 2 minutes. Take the second dump:
```bash
jcmd <pid> GC.heap_dump /tmp/loyalty-heap-2.hprof
```

4. Open BOTH dumps in Eclipse MAT. Use the "Compare to Another Heap Dump" feature:
   - In MAT: open both dumps, then use "Compare Baskets" or manually compare Histograms

5. Identify:
   - Which class grew the most between dump 1 and dump 2?
   - How many new instances were created?
   - What's the per-request memory growth rate?

6. Extrapolate: at this growth rate, if the service handles 100 req/sec, how long until it runs out of a 512MB heap?

7. Write a brief incident report:
   - **Symptom:** Heap growing over time, not returning to baseline after GC
   - **Root cause:** [what you found]
   - **Impact:** Service will OOM in approximately [your calculation]
   - **Fix:** [your recommendation]

---

## Theory B — Common Leak Patterns in Spring Boot (~15 min)

### Trainer Notes

**E-commerce context:** "You've found one type of leak — an unbounded cache. But memory leaks in Spring Boot services come in several flavors. Let's look at the most common ones our teams encounter."

**Key patterns:**

**1. Unbounded caches (what we just found)**
```java
// BAD: grows forever
private final Map<Long, Product> cache = new ConcurrentHashMap<>();
public Product getProduct(Long id) {
    return cache.computeIfAbsent(id, this::loadFromDb);
}
```
Fix: Use a bounded cache (Caffeine, Guava Cache) with max size and TTL.
```java
// GOOD: bounded with eviction
private final Cache<Long, Product> cache = Caffeine.newBuilder()
    .maximumSize(10_000)
    .expireAfterWrite(Duration.ofMinutes(5))
    .build();
```

**2. Listeners and callbacks not deregistered**
```java
// BAD: registering a listener that's never removed
eventBus.register(new OrderEventListener(order));
// If OrderEventListener holds a reference to Order, neither can be GC'd
```
Common in Spring: `@EventListener` on prototype beans, Kafka consumer interceptors that hold state.

**3. ThreadLocal not cleaned up**
```java
// BAD: ThreadLocal in a web server (threads are reused!)
private static final ThreadLocal<UserContext> context = new ThreadLocal<>();
public void handleRequest() {
    context.set(new UserContext(currentUser()));
    // ... process ...
    // forgot context.remove() !
}
```
Since Tomcat reuses threads, the ThreadLocal value from request 1 is still there for request 2. If UserContext holds large objects, they accumulate.

Fix: Always use try/finally to clean up ThreadLocal.

**4. Connection or stream not closed**
```java
// BAD: connection leak
Connection conn = dataSource.getConnection();
Statement stmt = conn.createStatement();
ResultSet rs = stmt.executeQuery("SELECT ...");
// exception thrown here — connection never returned to pool!
```
HikariCP has `leakDetectionThreshold` to warn about this. We set it to 60 seconds in our config.

**5. Spring caches without bounds**
```java
@Cacheable("products")
public Product getProduct(Long id) { ... }
// Spring's default ConcurrentMapCacheManager has NO eviction!
```
If you use `@Cacheable` without configuring a proper CacheManager (Caffeine, Redis), Spring uses an unbounded ConcurrentHashMap as the backing store.

**E-commerce example:** "The order service used `@Cacheable` on the customer lookup. 200K unique customers over a month meant 200K Customer objects permanently in memory. Switching to Caffeine with a 10,000 max size and 5-minute TTL fixed it."

### Ask the Room
- "Has anyone seen `@Cacheable` used without a configured CacheManager in your codebase?"
- "How would you know if a ThreadLocal leak was happening? What would the heap dump show?"

---

## Capstone B — Fix the Leak and Verify (~20 min)

### Core Exercise

**Task:** Now that you've found the leak, think about how to fix it.

1. Look at the `RewardsCacheService` source code (the leak profile version)
2. Identify the specific line(s) that cause the unbounded growth
3. Write pseudocode for the fix (you don't need to write actual Java — describe the change):
   - What data structure would you use instead?
   - What eviction policy?
   - What max size?
   - What TTL (time-to-live)?

4. Answer: If the rewards catalog has 500 items and each item is ~2KB in memory, what should the max cache size be? How much memory would a properly bounded cache use?

**Expected answer:** A Caffeine cache with maxSize=1000 (2x the catalog for safety), TTL of 5 minutes, total memory ~2MB. Compare to the leak: after 10,000 requests, the unbounded map holds 10,000 × 500 items × 2KB = ~10GB (obviously would OOM long before that).

### Medium Exercise

**Task:** Use VisualVM to watch the leak in real-time, then watch it stop after a simulated fix.

1. Connect VisualVM to the loyalty-service (leak profile)
2. Watch the Heap graph while generating traffic:
```bash
while true; do curl -s http://localhost:8080/api/rewards > /dev/null; sleep 0.01; done
```
3. The heap should show a steadily rising baseline (leak pattern — NOT a sawtooth)
4. Screenshot this — this is what a memory leak looks like in real-time monitoring

5. Stop the load. Trigger a full GC:
```bash
jcmd <pid> GC.run
```
6. Did the heap drop significantly? (For a true leak: NO. The objects are reachable, GC can't free them.)

7. Now restart the app with the DEFAULT profile (no leak). Repeat the same load. Observe that the heap returns to baseline after GC. Screenshot for comparison.

8. Side-by-side comparison: annotate which pattern is "healthy sawtooth" and which is "leak."

### Hard Exercise

**Task:** Estimate the production impact and write a remediation plan.

Given:
- The loyalty-service runs on GKE with 1Gi container limit, -Xmx640m
- Production traffic: 50 req/sec to `/api/rewards`
- Each request adds ~100KB to the leak (measured from your heap dump comparison)

Calculate:
1. How much memory does the leak consume per minute?
2. How long until the heap is full (640MB)?
3. What happens when the heap is full? (Describe the GC thrashing → OOM → restart cycle)
4. After a Kubernetes restart, how long until the problem recurs?
5. If Kubernetes restarts the pod every N minutes, and each restart takes 30 seconds, what's the effective downtime per day?

Write a remediation plan:
- **Immediate mitigation:** What can you do RIGHT NOW without a code change? (Hint: restart cadence, memory increase, monitoring alert)
- **Short-term fix:** The code change (bounded cache)
- **Prevention:** What practice prevents this class of bug in the future? (Code review checklist item, dependency on Caffeine for all caching, static analysis rule)

---

## Group Challenge — Leak or Not Leak? (~20 min)

Present these 4 Grafana heap graphs (describe them verbally or sketch on whiteboard):

**Graph A:** Sawtooth pattern, peaks at 400MB, drops to 150MB, stable over hours.

**Graph B:** Steady rise from 200MB to 500MB over 6 hours. No drops. Then sudden drop to 200MB (full GC). Immediately starts rising again.

**Graph C:** Stable at 300MB for hours. Sudden jump to 600MB. Stays at 600MB. No further growth.

**Graph D:** Sawtooth pattern, but the "valleys" are slowly rising: 150MB → 160MB → 170MB → 180MB over several hours. The peaks stay the same distance above the valleys.

**For each graph, groups answer:**
1. Is this a memory leak?
2. What's the most likely explanation?
3. What would you do next?

**Trainer answers:**
- **A:** Healthy. Normal sawtooth = GC working fine. No action needed.
- **B:** Classic memory leak. Objects accumulate until full GC can't free enough, then OOM/restart. Take a heap dump before the next OOM.
- **C:** Not a leak — likely a one-time event. A large dataset was loaded into memory (cache warmup, a big query result, a file upload). If it stays stable, it's fine — just a step change. Check what happened at the jump time.
- **D:** Slow leak. The valleys rising means some objects survive each GC cycle and accumulate. This is harder to catch because it takes hours/days to become a problem. Take two heap dumps 2 hours apart, compare in MAT.

---

## Wrap-up (~5 min)

**Key takeaways:**
- A heap dump is a snapshot of every object in memory — it tells you WHAT is consuming memory
- `jcmd <pid> GC.heap_dump` is production-safe (brief pause)
- Eclipse MAT's "Leak Suspects" report finds the obvious leaks; Histogram + dominator tree finds the subtle ones
- Common Spring Boot leak patterns: unbounded caches, @Cacheable without eviction, ThreadLocal not cleaned, connection/stream not closed
- A rising baseline in the heap graph (not returning to normal after GC) is the telltale sign of a leak

**Preview of Session 4:** "We've been looking at the heap — the part of JVM memory you control with -Xmx. But the JVM uses memory OUTSIDE the heap too: Metaspace, thread stacks, direct buffers. Next session, we'll see what happens when the total JVM memory exceeds the Kubernetes container limit — even when the heap is fine."

**Between-session exercise:**
- Add `-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp/` to the loyalty-service's JVM flags
- Run the leak profile with a small heap (`-Xmx128m`) and let it OOM
- Verify that a heap dump was automatically captured
- Open it in MAT and confirm you can find the same leak

This proves the setup works — so when a REAL OOM happens in production, the dump is already there waiting for you.

---

*Tags:* #training-program #jvm #track-a #session-3 #materials
