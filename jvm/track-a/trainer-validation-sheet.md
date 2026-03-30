# Trainer Validation Sheet — JVM Track A

**Use this to verify submitted exercise templates. Check that the engineer's numbers fall within the expected range for their assigned variant.**

---

## How to Use

1. Check the engineer's submitted template for their **Variant** field (top of every template)
2. Find that variant's column below for the relevant session
3. Verify numbers fall within the expected range
4. If numbers are outside range: likely wrong variant, wrong profile, or copied from someone else
5. If numbers are within range but analysis is generic/vague: the engineer may have filled in numbers but not engaged with the exercise — ask follow-up questions

---

## Session 1 — What Is the JVM

*Profile: default (healthy). Variant affects: nothing in Session 1 — this is baseline.*

All engineers should see similar values since the default profile has no variant-dependent behavior. Session 1 is not individually validated — it's about setup and orientation.

| Metric | Expected (all variants) |
|---|---|
| GC algorithm | G1 |
| Heap max | Per -Xmx setting (512m default) |
| Heap used at rest | 80-250 MB |
| Metaspace used | 50-100 MB |
| Live threads at rest | 25-50 |
| Classes loaded | 8,000-15,000 |

---

## Session 2 — Garbage Collection

*Profile: gc-pressure. Variant affects: allocation rate (list copies, string loop size).*

### Core Exercise — GC Log Reading (after 200 /points/calculate requests)

| Metric | A | B | C | D | E | F |
|---|---|---|---|---|---|---|
| Minor GC/min | 10-18 | 15-25 | 13-22 | 18-32 | 11-20 | 16-26 |
| Avg pause (ms) | 3-8 | 5-12 | 4-9 | 7-15 | 4-9 | 6-13 |
| Max pause (ms) | 8-20 | 12-30 | 10-25 | 15-40 | 8-22 | 14-32 |
| Major GC count | 0 | 0 | 0 | 0-1 | 0 | 0-1 |

### Medium Exercise — Allocation Rate Comparison

| Metric | A | B | C | D | E | F |
|---|---|---|---|---|---|---|
| Allocation rate (MB/sec) | 80-150 | 130-220 | 100-180 | 160-280 | 90-160 | 140-230 |

### Hard Exercise — p99 Latency Impact

| Metric | A | B | C | D | E | F |
|---|---|---|---|---|---|---|
| Default p99 (ms) | 10-40 | 10-40 | 10-40 | 10-40 | 10-40 | 10-40 |
| gc-pressure p99 (ms) | 15-60 | 25-80 | 20-70 | 30-100 | 18-65 | 25-85 |

*The delta between default and gc-pressure p99 is the key observation, not the absolute numbers.*

---

## Session 3 — Heap Dumps

*Profile: leak. Variant affects: leak rate (entries per request, payload size).*

### Core Exercise — Leak Suspects Report (after 1000 requests)

| Metric | A | B | C | D | E | F |
|---|---|---|---|---|---|---|
| Suspected class | RewardsCacheService map | same | same | same | same | same |
| Map entry count | ~1,000 | ~2,000 | ~1,000 | ~3,000 | ~2,000 | ~1,000 |
| Retained size (approx) | ~8 MB | ~8 MB | ~12 MB | ~9 MB | ~12 MB | ~10 MB |

*The leak class should always be identified as the cache map in RewardsCacheService. Variant changes the numbers, not the diagnosis.*

### Hard Exercise — Growth Rate Extrapolation

| Metric | A | B | C | D | E | F |
|---|---|---|---|---|---|---|
| Growth per request | ~8 KB | ~8 KB | ~12 KB | ~9 KB | ~12 KB | ~10 KB |
| Requests to fill 256 MB | ~32K | ~32K | ~21K | ~28K | ~21K | ~25K |
| At 50 req/s, time to OOM | ~10 min | ~10 min | ~7 min | ~9 min | ~7 min | ~8 min |

---

## Session 4 — Container Memory

*Profile: oom. Variant affects: container limit and Xmx (via k8s manifest variant).*

### Core Exercise — Identify Which Config is Broken

| Variant | Container limit | Xmx | Headroom | Will OOMKill? |
|---|---|---|---|---|
| A | 512 Mi | 460m | 10% (~52 MB) | Yes, under load |
| B | 512 Mi | 440m | 14% (~72 MB) | Likely under heavy load |
| C | 640 Mi | 580m | 9% (~60 MB) | Yes, under load |
| D | 640 Mi | 560m | 12% (~80 MB) | Borderline |
| E | 512 Mi | 470m | 8% (~42 MB) | Yes, quickly |
| F | 640 Mi | 550m | 14% (~90 MB) | Less likely, but possible |

*Key check: does the engineer calculate the correct headroom percentage and identify it as dangerously low?*

---

## Session 5 — JFR Profiling

*Profile: slow-batch. Variant affects: sleep duration per member.*

### Core Exercise — JFR Analysis (batch tier-evaluation for 1000 members sample)

| Metric | A | B | C | D | E | F |
|---|---|---|---|---|---|---|
| Top CPU method | synchronized block | same | same | same | same | same |
| Total batch time (1K members) | ~3-4s | ~2-3s | ~4-6s | ~2-3s | ~3-4s | ~4-6s |
| Lock contention visible? | yes | yes | yes | yes | yes | yes |
| N+1 query pattern visible? | yes | yes | yes | yes | yes | yes |

*The diagnosis is the same for all variants (synchronized + N+1). The batch duration differs, which means the JFR recording looks quantitatively different.*

---

## Session 6 — Thread Dumps

*Profile: contention. Variant affects: pool sizes.*

### Core Exercise — Thread Dump Analysis

| Metric | A | B | C | D | E | F |
|---|---|---|---|---|---|---|
| HikariCP pool size | 3 | 2 | 4 | 2 | 3 | 4 |
| Executor pool size | 2 | 3 | 2 | 2 | 3 | 3 |
| Primary bottleneck | DB pool | Mixed | Executor | Both | Mixed | Executor |
| Threads BLOCKED on HikariCP | 5-15 | 8-20 | 2-8 | 8-20 | 5-15 | 2-8 |
| Threads WAITING on executor | 3-10 | 2-8 | 5-15 | 5-15 | 2-8 | 3-10 |

*Key check: does the engineer correctly identify WHICH pool is the bottleneck? This differs by variant.*

---

## Session 7 — G1 vs ZGC

*Variant affects: target p99 SLA only. Same workload for all.*

| Variant | Target p99 SLA | G1 meets it? | ZGC meets it? |
|---|---|---|---|
| A | 50 ms | Borderline | Yes |
| B | 40 ms | Likely no | Yes |
| C | 60 ms | Likely yes | Yes |
| D | 35 ms | No | Yes |
| E | 45 ms | Borderline | Yes |
| F | 55 ms | Likely yes | Yes |

*Key check: does the engineer's conclusion match whether G1 or ZGC is needed for THEIR specific SLA target? Variants B and D should conclude ZGC is necessary; C and F may correctly conclude G1 is sufficient.*

---

## Session 8 — JVM Config Audit

*Variant affects: which misconfigurations are present.*

| Issue | A | B | C | D | E | F |
|---|---|---|---|---|---|---|
| Missing HeapDumpOnOOM | ✓ find | — | ✓ find | — | ✓ find | — |
| Xms ≠ Xmx | — | ✓ find | — | ✓ find | — | ✓ find |
| No container awareness | ✓ find | ✓ find | — | — | ✓ find | ✓ find |
| GC logging to stdout | — | — | ✓ find | ✓ find | — | — |
| No JFR enabled | ✓ find | — | — | ✓ find | — | ✓ find |
| Wrong GC for workload | — | ✓ find | ✓ find | — | ✓ find | — |
| **Total to find** | **3** | **3** | **3** | **3** | **3** | **3** |

*Key check: does the engineer find all 3 issues for their variant? The checklist they submit should match the correct 3 for their letter.*

---

## Session 9 — Diagnose a Sick Service

*Profile: sick. Variant affects: relative severity of each root cause.*

This is a team exercise. Validation is based on the team presentation, not individual templates. The team should identify all three root causes regardless of the variant mix in their group.

Expected root causes (all variants):
1. Memory leak in RewardsCacheService
2. Thread pool / connection pool contention
3. Kafka consumer lag from GC-induced heartbeat timeouts

*Teams with mixed variants will see different "loudest" symptoms depending on which variant each member ran during pre-investigation. This is by design — it forces the team to synthesize across different observations.*

---

## Red Flags (Across All Sessions)

| Red flag | What it means |
|---|---|
| Numbers are exactly the same as another engineer's | Copied. Check if they have different variants — if yes, definitely copied. |
| Numbers are in range but analysis contradicts the data | Filled in numbers from running the app, wrote analysis from someone else's template. |
| Numbers are outside range for the assigned variant but match a different variant | Ran the wrong variant, or mixed up variant letters. Ask them to re-run. |
| Template is perfectly formatted but missing the "Notes/observations" field | Likely copied the data, skipped the thinking. Ask a verbal follow-up question. |
| All numbers are suspiciously round (e.g., "GC pause: 10ms", "15 GC/min") | Estimated rather than measured. Real JVM numbers are messy (e.g., "7.3ms", "13 GC/min"). |

---

*Trainer Validation Sheet v1.0 — JVM Training Program*
