# JVM Memory Budget Calculator

**Use this worksheet to verify that a Spring Boot service's JVM configuration fits within its Kubernetes container memory limit.**

The key rule: **Container limit must fit ALL JVM memory, not just the heap.**

---

## Service Information

| Field | Value |
|---|---|
| Service name | |
| Kubernetes container memory limit | |
| -Xmx (max heap) | |
| -Xms (initial heap) | |
| -Xss (thread stack size, default 1MB) | |

---

## Memory Budget Breakdown

### Heap (controlled by -Xmx)

| Component | Size | How to measure |
|---|---|---|
| Max heap (-Xmx) | | From JVM flags |
| **Subtotal: Heap** | | |

### Non-Heap (NOT controlled by -Xmx — this is what catches people)

| Component | Estimated Size | How to measure | Notes |
|---|---|---|---|
| Metaspace | ~80-150 MB | `jcmd <pid> VM.native_memory` or Actuator `jvm.memory.used` tag=nonheap | Spring Boot loads 5,000-15,000 classes. More with Kafka, Hibernate, AOP. |
| Thread stacks | threads × Xss | Count threads × 1MB (default Xss) | Tomcat (200 default) + Kafka consumers (3-10) + HikariCP (10) + async pools + internal ≈ 30-50 at rest, 200+ under load |
| Code cache (JIT) | ~50-100 MB | `jcmd <pid> VM.native_memory` | Grows as JIT compiles hot methods. Plateaus after warmup. |
| Direct byte buffers | ~20-100 MB | `jcmd <pid> VM.native_memory` | Kafka consumer buffers, HikariCP, NIO. Grows with concurrency. |
| GC overhead | ~5-10% of heap | Varies by GC algorithm | G1 uses more than Serial; ZGC uses more than G1 |
| Other (JVM internal) | ~30-50 MB | `jcmd <pid> VM.native_memory` | Symbol tables, compiler data, class data sharing |
| **Subtotal: Non-Heap** | | | |

### Total

| | Size |
|---|---|
| Heap (Xmx) | |
| Non-Heap (estimated) | |
| **Total JVM memory** | |
| Container limit | |
| **Safety margin** | |
| **Safety margin %** | |

---

## Safety Check

| Check | Rule | Your value | Pass? |
|---|---|---|---|
| Heap as % of container | 60-70% recommended, never > 75% | | ✅ / ❌ |
| Safety margin | ≥ 15% of container limit | | ✅ / ❌ |
| Thread stack budget | At peak threads, stacks fit in margin | | ✅ / ❌ |
| Xms = Xmx | Set equal to avoid resize pauses | | ✅ / ❌ |

---

## Quick Reference: Common Configurations

| Container limit | Recommended -Xmx | Non-heap budget | Notes |
|---|---|---|---|
| 512 Mi | 300-350m | ~160-210 MB | Tight. Watch thread count. |
| 1 Gi | 600-700m | ~300-400 MB | Standard for most services |
| 2 Gi | 1200-1400m | ~600-800 MB | For services with large caches or many threads |
| 4 Gi | 2500-2800m | ~1200-1500 MB | For data-heavy services |

---

## Thread Count Estimation

| Thread pool | Default count | Configurable via | Memory per thread |
|---|---|---|---|
| Tomcat NIO threads | 200 max | `server.tomcat.threads.max` | 1 MB (default Xss) |
| Kafka consumer threads | 1 per partition (concurrency setting) | `spring.kafka.listener.concurrency` | 1 MB |
| HikariCP connections | 10 | `spring.datasource.hikari.maximum-pool-size` | ~5-10 MB per connection (driver buffers) |
| Spring async executor | varies | `@Async` thread pool config | 1 MB |
| Scheduled task threads | 1 (default) | `spring.task.scheduling.pool.size` | 1 MB |
| JVM internal threads | ~10-15 | Not configurable | 1 MB |

**Worst case thread count** = Tomcat max + Kafka consumers + HikariCP + async + scheduled + internal

**Worst case thread memory** = thread count × 1 MB (or your -Xss setting)

---

## Example Calculation

**Service:** loyalty-service on GKE
- Container limit: 1Gi (1024 MB)
- -Xmx: 640m
- Tomcat: 200 max threads
- Kafka consumers: 3
- HikariCP: 10
- Async pool: 5

| Component | Size |
|---|---|
| Heap | 640 MB |
| Metaspace | ~100 MB |
| Thread stacks (worst case: 220 × 1MB) | ~220 MB |
| Code cache | ~60 MB |
| Direct buffers | ~30 MB |
| GC + internal | ~40 MB |
| **Total** | **~1090 MB** |
| **Container limit** | **1024 MB** |
| **OVER BUDGET BY** | **~66 MB ❌** |

**Fix options:**
1. Reduce Tomcat threads: `server.tomcat.threads.max=100` (saves ~100 MB)
2. Reduce Xmx to 512m (brings total to ~950 MB, 7% margin)
3. Increase container limit to 1.5Gi (gives 40% margin)

---

*Template version 1.0 — JVM Training Program*
