# JVM Track A — Materials Inventory

**What needs to exist before the JVM training can run**

Organized by: shared infrastructure (build first), per-session materials, and templates.

---

## Shared Infrastructure

### 1. Loyalty Service Spring Boot Application

The training app. A single Spring Boot 3.x project with Spring profiles that activate different JVM problems per session. Engineers run it locally (docker-compose) or on GKE (for container-memory sessions).

**Status:** Spec complete (`jvm/shared/loyalty-service-spec.md`), Claude Code prompts ready (`jvm/shared/claude-code-prompts.md`), code not yet generated.

**Build with:** Claude Code (see prompts), NOT in this repo. The generated project will live in its own Git repo (`loyalty-service/`).

### 2. Getting Started Guide

Distributed before Session 1. Covers:
- How to clone and run the loyalty-service locally (docker-compose)
- How to verify it's working (curl endpoints, check actuator)
- How to install VisualVM and connect to a local JVM
- How to install JDK Mission Control (JMC) for JFR analysis
- How to use `jcmd` commands
- How to access Grafana dashboards (if training instance is on GKE)

**File:** `jvm/shared/getting-started.md`

### 3. JVM Templates

Reusable worksheets for exercises across sessions.

| Template | Used in | Contents |
|---|---|---|
| **GC Log Reading Template** | A2, A7, A9 | Structured form: GC event type, pause duration, memory before/after, frequency assessment |
| **Heap Dump Analysis Template** | A3, A9 | Structured form: top objects by retained size, dominator tree path, suspected leak chain, root cause |
| **JFR Analysis Template** | A5, A9 | Structured form: hot methods (CPU), top allocators, GC summary, lock contention, thread activity |
| **Thread Dump Reading Template** | A6, A9 | Structured form: thread state summary, blocked threads (what/who), deadlock detection, pool utilization |
| **JVM Config Audit Checklist** | A8, A9 | Checklist: heap sizing, GC algorithm, container awareness, diagnostics, Spring Boot specifics |
| **Memory Budget Calculator** | A4, A8 | Worksheet: container limit, Xmx, Metaspace, thread stacks (count × Xss), direct buffers, safety margin |

**Location:** `jvm/shared/templates/`

---

## Per-Session Materials

Each session file follows the DB Track A format:

```
Session title and metadata
├── Theory A (~15 min) — with e-commerce context
│   └── Trainer notes, whiteboard diagrams, key concepts
├── Capstone A (~20-25 min) — loyalty program exercise
│   └── Core + Medium + Hard tiers
├── Theory B (~15 min) — with e-commerce context
│   └── Trainer notes, whiteboard diagrams, key concepts
├── Capstone B (~20-25 min) — loyalty program exercise
│   └── Core + Medium + Hard tiers
├── Group Challenge (~20-25 min)
│   └── Team exercise with discussion prompts
└── Wrap-up (~5 min)
    └── Key takeaways, preview of next session
```

### Session Files

| File | Topic | Theory context | Capstone focus |
|---|---|---|---|
| `A1-what-is-the-jvm.md` | JVM basics, jcmd, heap info | E-commerce order service JVM inspection | Run loyalty-service, inspect its JVM |
| `A2-garbage-collection.md` | GC concepts, GC logs | E-commerce cart service allocation patterns | Points calculation GC pressure (gc-pressure profile) |
| `A3-heap-dumps.md` | Memory leaks, Eclipse MAT | E-commerce product catalog cache leak | Rewards catalog cache leak (leak profile) |
| `A4-container-memory.md` | JVM + Kubernetes OOMKill | E-commerce service container sizing | loyalty-service OOMKill diagnosis (oom profile) |
| `A5-jfr-profiling.md` | Java Flight Recorder, JMC | E-commerce checkout latency profiling | Tier evaluation batch slowness (slow-batch profile) |
| `A6-thread-dumps.md` | Thread states, deadlocks, pool exhaustion | E-commerce payment processing contention | HikariCP + thread pool contention (contention profile) |
| `A7-gc-algorithms.md` | G1 vs ZGC comparison | E-commerce order processing SLA | Points redemption latency SLA (g1/zgc profiles) |
| `A8-jvm-flags.md` | Production JVM configuration | E-commerce deployment review | loyalty-service config audit (misconfigured profile) |
| `A9-diagnose-sick-service.md` | Full diagnosis exercise | — (no theory, team exercise) | Multi-root-cause team challenge (sick profile) |

**Location:** `jvm/track-a/`

---

## Train-the-Trainer Guide

A companion document for facilitators covering all 9 sessions:
- Per-session prep checklist (what to read, what to set up, time estimate)
- How to run the training app with the correct profile
- How to generate load for the exercises
- Common questions engineers ask, with answers
- Timing guidance (where sessions tend to run over)
- How to handle mixed-level groups

**File:** `jvm/track-a/train-the-trainer.md`

---

## Build Priority

### Phase 1 — Enough to start (before Session 1)
1. ✅ Loyalty service spec
2. ✅ Claude Code prompts
3. ⬜ Getting Started guide
4. ⬜ Templates: GC Log Reading, Memory Budget Calculator
5. ⬜ Session A1 full materials
6. ⬜ Session A2 full materials
7. ⬜ Session A3 full materials
8. Generate the loyalty-service code via Claude Code

### Phase 2 — Sessions 4-6 (can lag by 2-4 weeks)
9. ⬜ Templates: Heap Dump Analysis, JFR Analysis, Thread Dump Reading
10. ⬜ Sessions A4, A5, A6 full materials
11. ⬜ Train-the-Trainer guide (first draft)

### Phase 3 — Sessions 7-9 (can lag by 4-6 weeks)
12. ⬜ Template: JVM Config Audit Checklist
13. ⬜ Sessions A7, A8, A9 full materials
14. ⬜ Train-the-Trainer guide (complete)

---

*Tags:* #training-program #jvm #track-a #materials-inventory
