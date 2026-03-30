# GC Log Reading Template

**Use this template when analyzing GC log output from a Spring Boot service.**

Fill in one row per GC event you're analyzing. For a health assessment, capture at least 10 events across 2+ minutes of runtime.

---

## Service Information

| Field | Value |
|---|---|
| Service name | |
| Environment (local / staging / prod) | |
| JVM flags (especially -Xmx, -Xms, GC algorithm) | |
| Load conditions during capture | |
| Capture duration | |

---

## GC Event Log

| # | Timestamp | Type (Minor/Major/Full) | Cause | Heap Before | Heap After | Freed | Pause (ms) |
|---|---|---|---|---|---|---|---|
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |
| 4 | | | | | | | |
| 5 | | | | | | | |
| 6 | | | | | | | |
| 7 | | | | | | | |
| 8 | | | | | | | |
| 9 | | | | | | | |
| 10 | | | | | | | |

---

## How to Read a G1 GC Log Line

```
[2024-01-15T10:30:45.123+0000][info][gc] GC(42) Pause Young (Normal) (G1 Evacuation Pause) 256M->48M(512M) 4.321ms
 │                                         │      │          │         │                     │              │
 │                                         │      │          │         │                     │              └─ Pause duration
 │                                         │      │          │         │                     └─ before→after(max)
 │                                         │      │          │         └─ Cause
 │                                         │      │          └─ Normal vs Concurrent Start
 │                                         │      └─ Young = minor, Mixed = mixed, Full = full
 │                                         └─ GC event number (sequential)
 └─ Timestamp
```

**GC Types:**
- **Pause Young (Normal):** Minor GC — cleans young generation only. Should be fast (1-20ms).
- **Pause Young (Concurrent Start):** Minor GC that also starts a concurrent marking cycle. Happens when old gen is filling up.
- **Pause Mixed:** G1-specific. Cleans young gen AND some old gen regions. More work than a young GC.
- **Pause Full:** Full GC — cleans everything. Slow. Should be rare. If you see these frequently, something is wrong.

---

## Summary Assessment

| Metric | Value | Healthy range | Assessment |
|---|---|---|---|
| Total GC events | | — | |
| Minor GC count | | — | |
| Major/Full GC count | | Should be 0 under normal load | |
| Average minor GC pause | | < 10ms | ✅ / ⚠️ / ❌ |
| Max GC pause | | < 50ms | ✅ / ⚠️ / ❌ |
| GC frequency (per minute) | | 5-30 for moderate load | ✅ / ⚠️ / ❌ |
| Heap after GC (stable?) | | Should return to a consistent baseline | ✅ / ⚠️ / ❌ |
| % time in GC | | < 5% | ✅ / ⚠️ / ❌ |

**Overall assessment:** ☐ Healthy ☐ Elevated but acceptable ☐ Needs investigation ☐ Critical

**Notes / observations:**

---

## Red Flags Checklist

- [ ] Full GCs happening under normal load (not just at shutdown)
- [ ] GC pause > 100ms
- [ ] Heap after GC is rising over time (possible leak)
- [ ] GC frequency > 60/min (excessive allocation)
- [ ] More than 10% of time spent in GC
- [ ] Concurrent marking cycles starting frequently (old gen filling up)

---

*Template version 1.0 — JVM Training Program*
