# Engineering Training Program — Master Summary

**SEB Embedded | Started March 2026 | Status: Database track fully developed, 3 other tracks have levels defined**

---

## What This Is

A competency development program for engineers at SEB Embedded. Engineers self-assess across five technical areas, get assigned to a training track based on their level, and grow through structured workshops over ~5 months. It's branded as a **training program with self-assessment** — not a performance review or KPI framework.

## Core Design Decisions

These were iterated on extensively and should be treated as settled unless there's a strong reason to change:

### Framing
- **"How comfortable do you feel?"** — not "what do you know" or "prove your competence"
- **Training program, not performance review** — the self-assessment is the entry point to learning, not a grade
- **Levels are a growth map, not a score** — nobody is penalized for where they start

### Level Naming
**Foundations → Practitioner → Advanced → Specialist → Expert → Authority**

Why these names:
- "Foundations" and "Practitioner" tested well with sample groups — non-threatening, growth-oriented
- "Advanced" and "Specialist" signal increasing depth without implying seniority or management
- "Expert" and "Authority" are the mentors/workshop leads, not students

### Descriptor Style — Scenario-Based (Version B)
We iterated through three approaches:
1. **Specific knowledge items** ("know MVCC, dead tuples") — rejected because it creates checkbox mentality
2. **Vague comfort statements** ("comfortable with internals") — rejected because it's unmeasurable
3. **Scenario-based** ("When X happens, I can do Y") — **chosen** because it's measurable but doesn't prescribe how you learn it

Each level has 5–6 scenario descriptors plus a "Topics you'll explore in training" hint that previews curriculum content without making it the assessment target.

### Training Track Structure
| Track | Levels | Goal |
|---|---|---|
| **Track A** | Levels 1–2 (Foundations + Practitioner) | Move up ~1 level of confidence |
| **Track B** | Levels 3–4 (Advanced + Specialist) | Move up ~1 level of confidence |
| **Mentors** | Levels 5–6 (Expert + Authority) | Run the workshops, not students |

### Session Format
- 2 hours every other week, ~9 sessions over 4–5 months
- Every session: Real-world hook (10 min) → Theory (20–25 min) → Live walkthrough (25–30 min) → Exercises (45–50 min) → Wrap-up (5–10 min)
- **Tiered exercises** per session to solve the mixed-level problem:
  - **Core** — everyone completes, scaffolded, training environments
  - **Medium** — stretch for lower level, comfort zone for upper level, more ambiguity
  - **Hard** — stretch for upper level, uses your team's actual codebase/production, produces real artifacts (ADRs, runbooks, dashboards, gap analyses)

### Train-the-Trainer
Facilitators are engineers willing to prep, not subject-matter experts. Each session has a facilitator guide with:
- **Your Prep** — what to read, how long (~1.5–2h)
- **Theory block** — what to cover AND what NOT to cover
- **Live walkthrough** — step-by-step examples to run on the training instance
- **Real-world hook** — opening story connecting to BaaS work
- **Questions to ask the room** — keep it interactive, not a lecture

---

## Five Competency Areas

| Area | Levels Defined | Track A Curriculum | Track B Curriculum | Train-the-Trainer |
|---|---|---|---|---|
| **Database Engineering** (PostgreSQL on Cloud SQL) | ✅ V1 + V2 (scenario) | ✅ With tiered exercises | ✅ With tiered exercises | ✅ Track A complete |
| **JVM Understanding** (Spring Boot on GKE) | ✅ Updated for Spring Boot/Kafka/Cloud SQL | ✅ With tiered exercises | ❌ Not yet | ❌ Not yet |
| **Solution Design & Architecture** | ✅ Scenario-based | ❌ Not yet | ❌ Not yet | ❌ Not yet |
| **Cloud, Monitoring & Observability** (GCP/GKE) | ✅ Scenario-based | ❌ Not yet | ❌ Not yet | ❌ Not yet |
| **Process & Testing** | ❌ Levels not yet defined | ❌ Not yet | ❌ Not yet | ❌ Not yet |

---

## What's In This Vault

```
Training-Program/
├── README.md                        ← This file
├── Solution-Design-Levels.md        ← 6 levels, scenario-based
├── Cloud-Observability-Levels.md    ← 6 levels, scenario-based
├── JVM-Understanding-Levels.md      ← 6 levels, updated for Spring Boot/Kafka/Cloud SQL
└── JVM-Track-A-Curriculum.md        ← 9 sessions with Core/Medium/Hard exercises
```

### Files Created But Not Yet In This Vault

The database track was developed first and most extensively. These files exist as downloads or in another vault and should be migrated here:

**Database levels (scenario-based V2):**
- DB-Level-1-Foundations.md through DB-Level-6-Authority.md
- Specific to PostgreSQL on Cloud SQL (GCP), Cloud SQL Auth Proxy, Query Insights, CMEK, HA/failover

**Database curricula (V2 with tiered exercises):**
- DB-Track-A-Curriculum.md — 9 sessions, Foundations → Practitioner
- DB-Track-B-Curriculum.md — 9 sessions, Advanced → Specialist

**Database Train-the-Trainer:**
- DB-Track-A-Train-The-Trainer.md — full facilitator guide for all 9 Track A sessions

**PowerPoint presentations (for stakeholder communication):**
- training-program.pptx — 11-slide concept deck (how it works, levels, database showcase, curricula, timeline)
- train-the-trainer-track-a.pptx — 12-slide facilitator reference deck for DB Track A

---

## How to Continue Development

### Next Steps (Priority Order)

1. **Migrate database files** into this vault under `Training-Program/Database/`

2. **Define Process & Testing levels** — the fifth and final competency area. Follow the same pattern:
   - 6 levels (Foundations → Authority)
   - Scenario-based descriptors ("When X happens, I can do Y")
   - Ground in your actual stack: JUnit, Mockito, Testcontainers, Pact, Gatling/k6, GitHub Actions, feature flags, Cloud SQL clones for migration testing
   - "Topics you'll explore" hints per level
   - Track A (L1–2) and Track B (L3–4) assignments

3. **Build remaining curricula** — for each competency area that has levels but no curriculum:
   - Solution Design Track A + Track B
   - Cloud & Observability Track A + Track B
   - JVM Track B
   - Process & Testing Track A + Track B
   - Each curriculum: 9 sessions, Core/Medium/Hard tiered exercises, self-driven exercises between sessions

4. **Build Train-the-Trainer guides** — for each curriculum, following the DB Track A pattern:
   - Per-session facilitator guide
   - Theory block (what to cover + what NOT to cover)
   - Live walkthrough steps
   - Real-world hook + "Ask the Room" questions

5. **Build the self-assessment survey** — probably a Google Form or similar tool where engineers:
   - Read the scenario descriptors for each competency area
   - Select which level they identify with
   - Optionally comment on mixed levels within an area ("I'm L3 on querying but L2 on internals")

6. **Create training environment** — for hands-on exercises:
   - A shared Cloud SQL instance for database exercises
   - Sample Spring Boot apps with intentional problems (memory leaks, deadlocks, slow queries) for JVM and DB sessions
   - Terraform modules for Cloud/Observability exercises
   - A "broken" service for the design challenge sessions

### When Working With Claude on This

**Context to provide:**
- We use: Spring Boot (Java 21), PostgreSQL on Cloud SQL (GCP), GKE, Kafka, Terraform, OpenTelemetry, Grafana, HikariCP
- The organization is SEB Embedded (Banking-as-a-Service within SEB group, Sweden)
- Regulated environment: PCI-DSS, SOX, PSD2
- Teams: Credit Lifecycle, Fincrime, Payments, Build Platform, Runtime Platform, Security Engineering
- Engineer levels: Associate, Intermediate, Senior

**Patterns to follow:**
- Scenario-based descriptors: "When X happens, I can do Y"
- Tiered exercises: Core (scaffolded) → Medium (ambiguous) → Hard (your real codebase)
- Train-the-Trainer: facilitators are prepared engineers, not experts. 1.5–2h prep per session.
- Level naming: Foundations → Practitioner → Advanced → Specialist → Expert → Authority
- Always ground in the actual stack, not abstract concepts

**What to avoid:**
- Specific knowledge checklists (creates checkbox mentality)
- Vague comfort statements (unmeasurable)
- Content that's too academic or disconnected from daily BaaS work
- Levels 5–6 that are unrealistically deep (JIT compiler internals, GraalVM AOT) — keep them focused on org-level leadership grounded in the real stack
- Using "KPI Framework" or "performance review" language

### Key Design Insight: The Exercises Are The Product

The training program's most valuable output isn't knowledge transfer — it's the artifacts from Hard exercises. Over 5 months, engineers produce:
- Schema reviews of their own team's code
- Index audits of production databases
- Migration runbooks tested on Cloud SQL clones
- JVM health assessments with JFR data
- Monitoring dashboards with real alerting
- Architecture Decision Records for actual proposals

This means the program pays for itself: the "homework" is real work that improves the codebase, observability, and documentation of every team that participates.
