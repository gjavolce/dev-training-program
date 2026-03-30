# Heap Dump Analysis Template

**Use this template when investigating a memory issue using Eclipse MAT (Memory Analyzer Tool).**

---

## Dump Information

| Field | Value |
|---|---|
| Service name | |
| Dump taken at (timestamp) | |
| Dump trigger (manual / OOM / scheduled) | |
| Heap size at time of dump | |
| Total objects | |
| Environment | |
| Load conditions | |

---

## Step 1: Leak Suspects Report

Open the dump in Eclipse MAT → "Leak Suspects Report" (auto-generated).

| Suspect # | Class / Object | Retained Size | % of heap | Suspect description |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

**Is there an obvious suspect?** ☐ Yes (proceed to Step 2) ☐ No (skip to Step 3)

---

## Step 2: Trace the Retention Path

For the primary suspect, right-click → "Path to GC Roots" → "exclude weak/soft references."

**Retention chain** (fill in from GC Root to the suspect):

```
GC Root type: ☐ Thread ☐ Static field ☐ JNI ☐ Other: ___________
    ↓
Class: _______________________ Field: _______________________
    ↓
Class: _______________________ Field: _______________________
    ↓
Class: _______________________ Field: _______________________
    ↓
[Suspected leaking collection/object]: _______________________
    ↓
Accumulated objects: _____________ (count: _____, size: _____)
```

**Why can't GC collect this?**

(Explain in one sentence why the objects are still reachable)

---

## Step 3: Histogram Analysis

Open Histogram view. Sort by "Retained Heap" descending.

| Rank | Class name | Instance count | Shallow size | Retained size |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |

**Anything unexpected?** (e.g., 500K instances of your domain object when you expected 1K)

---

## Step 4: Dominator Tree

Open Dominator Tree. This shows which objects "dominate" (retain) the most memory.

| Rank | Dominator object | Retained size | What it holds |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |

**Key question:** Is the largest dominator a Spring bean, a cache, a collection, or something else?

---

## Step 5: Comparison (if two dumps available)

If you have two dumps taken at different times:

| Metric | Dump 1 | Dump 2 | Delta |
|---|---|---|---|
| Total heap used | | | |
| Top class instance count | | | |
| Suspected collection size | | | |
| Time between dumps | | | — |
| Estimated growth rate | | | per minute |

**Extrapolation:** At this rate, heap will be full in _________ (minutes/hours).

---

## Diagnosis Summary

| Field | Your finding |
|---|---|
| **Is there a memory leak?** | ☐ Yes ☐ No ☐ Inconclusive |
| **Root cause class** | |
| **Root cause field/collection** | |
| **Why objects accumulate** | |
| **Growth rate** | |
| **Time to OOM (estimated)** | |

---

## Recommended Fix

| Priority | Action |
|---|---|
| **Immediate** (stop the bleeding) | |
| **Short-term** (code fix) | |
| **Prevention** (avoid recurrence) | |

---

## Common Patterns Quick Reference

| Heap dump pattern | Likely cause | Where to look |
|---|---|---|
| One huge HashMap/ConcurrentHashMap | Unbounded cache | Check for missing eviction policy |
| Thousands of identical DTOs | N+1 query or unbatched processing | Check service/repository layer |
| Large byte[] arrays | File/stream not closed, large payloads buffered | Check I/O and integration code |
| Growing ThreadLocal$ThreadLocalMap | ThreadLocal not cleaned in web container | Check filters, interceptors |
| Many String objects with similar content | Excessive logging or string concatenation | Check log statements in hot paths |
| Spring proxy objects accumulating | Prototype-scoped beans with listeners | Check @Scope("prototype") beans |

---

*Template version 1.0 — JVM Training Program*
