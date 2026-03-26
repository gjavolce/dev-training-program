# CLAUDE.md — Engineering Training Quiz

## What this project is

An adaptive quiz that discovers which training level an engineer belongs to across 4 competency tracks. It's not a test — it's a placement tool that finds the engineer's "zone" so they can be grouped with peers at a similar level.

Single standalone HTML file (`quiz.html`). No build step, no dependencies, no server required.

## File structure

```
quiz.html               — Complete standalone quiz (HTML + CSS + JS + all track data inlined)
questions-database.js    — Database Engineering questions (separate copy for editing)
questions-jvm.js         — JVM Understanding questions (structure ready, needs questions)
questions-design.js      — Solution Design questions (structure ready, needs questions)
questions-cloud.js       — Cloud & Observability questions (structure ready, needs questions)
CLAUDE.md                — This file
level-guide.html         — Reference: full level guide with all tracks and scenarios
```

The `.js` files are reference/editing copies. The HTML inlines everything for standalone use. When you edit questions, update both the `.js` file and the corresponding section in `quiz.html`.

## The 4 tracks

| Track ID   | Label                  | Icon | Status         |
|------------|------------------------|------|----------------|
| `database` | Database Engineering   | DB   | 54 questions   |
| `jvm`      | JVM Understanding      | JVM  | needs questions |
| `design`   | Solution Design        | SD   | needs questions |
| `cloud`    | Cloud & Observability  | CO   | needs questions |

Tracks with 0 questions show as "Coming soon" (grayed out) on the start screen. They auto-enable the moment questions are added.

## Data structure

All track data lives in `quiz.html` in the first `<script>` block as a `TRACKS` object:

```javascript
var TRACKS = {
  database: { id, label, icon, desc, levels: [...], questions: [...] },
  jvm:      { id, label, icon, desc, levels: [...], questions: [...] },
  design:   { id, label, icon, desc, levels: [...], questions: [...] },
  cloud:    { id, label, icon, desc, levels: [...], questions: [...] }
};
```

Each track has 6 levels with 5 scenarios each. Each question maps to a level, difficulty, and scenario:

```javascript
{
  "level": 2,        // 1-6
  "diff": 2,         // 1=easy, 2=medium, 3=hard (within the level's scope)
  "scenario": 2,     // 0-4, maps to that level's scenarios array
  "q": "Scenario-based question text...",
  "opts": ["A","B","C","D","E"],  // exactly 5 options
  "ans": 1,          // correct answer index (0-4)
  "fb": "Explanation...",
  "context": { "Key": "Value" }   // optional evidence panels
}
```

## Adaptive engine

5 phases: `ASSESS → EXPLORE → BONUS → CONFIRM → MAP → finish`

**ASSESS** — Questions at current level. Streak of 2 correct → explore up. After 3+ questions, if wrong ≥ 2 and wrong ≥ 2×correct → drop down and confirm.

**EXPLORE** — 3 questions at next level. 0-1 wrong = promote. 2 wrong = bonus. 3 wrong = settle back.

**BONUS** — 1 extra question. Correct = promote. Wrong = settle back to confirm.

**CONFIRM** — 3 questions at settled level. 0-1 wrong = confirmed. 2+ wrong and level > 0 = cascade down one more level and re-confirm.

**MAP** — Gather scenario coverage (≥4 questions at settled level). Streak of 2 can re-explore up.

**Finish:** pool exhausted, 30 questions reached, or MAP has enough data.

## Adding questions to a track

### 1. Generate questions

Use this prompt with Claude. Replace the scenario list with the correct track (see scenario lists at the bottom of this file).

```
I need new quiz questions for the [TRACK NAME] training quiz.

Here is the level structure — each level has 5 scenarios indexed 0-4:

[paste scenario list for the track]

Generate [N] new questions for level [X]. For each question:

1. Map it to one of the 5 scenarios (index 0-4) for that level
2. Assign a difficulty: 1 (foundational), 2 (applied), 3 (challenging)
   - diff 1: tests recognition and basic understanding
   - diff 2: tests application in a realistic work context
   - diff 3: tests judgment in ambiguous or high-stakes situations
3. Write a realistic scenario-based question (not trivia)
4. Provide exactly 5 answer options where:
   - Exactly 1 is clearly correct
   - 2-3 are plausible but wrong (common misconceptions)
   - 1-2 are clearly wrong but not absurd
5. Write feedback explaining WHY the answer is right and why tempting wrong answers fail
6. Optionally add context key-value pairs for evidence panels

Output as a JSON array:
[
  {
    "level": X, "diff": 1|2|3, "scenario": 0|1|2|3|4,
    "q": "...", "opts": ["A","B","C","D","E"], "ans": 0-4,
    "fb": "...", "context": { "Key": "Value" }
  }
]

Tech stack context:
- PostgreSQL on Cloud SQL (GCP), Spring Boot 3, HikariCP
- GKE, Kafka, Liquibase, Cloud SQL Auth Proxy
- Multi-tenant BaaS platform, PCI-DSS/SOX compliance
- OpenTelemetry, Grafana, Cloud Monitoring
```

### 2. Add to quiz.html

Find the track in the `TRACKS` object and paste into its `questions` array:

```javascript
jvm: {
  // ...
  questions: [
    // ← paste generated questions here
  ]
},
```

### 3. Update the separate .js file

Keep `questions-[track].js` in sync as the editable reference copy.

### Quality checklist

- [ ] Correct answer is unambiguously best
- [ ] Wrong options reflect real misconceptions
- [ ] Difficulty matches the level
- [ ] Scenario index (0-4) matches what the question tests
- [ ] Feedback teaches, doesn't just restate
- [ ] No duplicates or near-duplicates
- [ ] Tests judgment, not trivia

### Coverage check

```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('quiz.html', 'utf8');
const match = html.match(/var TRACKS = (\{[\s\S]*?\});/);
const data = eval('(' + match[1] + ')');
Object.keys(data).forEach(tid => {
  const t = data[tid];
  console.log('\n' + t.label + ' (' + t.questions.length + ' questions):');
  if (!t.questions.length) { console.log('  (empty)'); return; }
  t.levels.forEach(l => {
    const qs = t.questions.filter(q => q.level === l.num);
    const byS = [0,1,2,3,4].map(s => qs.filter(q => q.scenario === s).length);
    const byD = [1,2,3].map(d => qs.filter(q => q.diff === d).length);
    console.log('  L' + l.num + ' ' + l.name + ': ' + qs.length + 'q  scenarios:[' + byS + ']  diff:[' + byD + ']');
  });
});
"
```

Target: ≥ 9 questions per level (3 per difficulty), all 5 scenarios covered.

## Engine tuning

| What | Where | Current | Effect |
|------|-------|---------|--------|
| Streak to explore | ASSESS | `streak >= 2` | Lower = faster up |
| Demotion trigger | ASSESS | `wrong >= 2 && wrong >= correct*2` | Higher ratio = more forgiving |
| Explore questions | EXPLORE | `eAsked >= 3` | More = more evidence |
| Confirm questions | CONFIRM | `confirmAsked >= 3` | More = thorough check |
| Map coverage | askNextOrFinish | `asked >= 4` | More = better results |
| Hard stop | nextStep | `maxQuestions: 30` | Absolute max |
| Needle weight | nudgeNeedle | easy=0.8, med=1.0, hard=1.3 | Sensitivity |

## Scenario lists for question generation

### Database Engineering

```
Level 1 (Foundations):
  0: Writing queries that join tables and filter correctly
  1: Tracing how the data model maps to database tables
  2: Spotting ORM-generated SQL problems like N+1 queries
  3: Connecting to Cloud SQL via Auth Proxy
  4: Understanding basic index and transaction concepts

Level 2 (Practitioner):
  0: Designing schemas independently with correct relationships
  1: Reading EXPLAIN ANALYZE and diagnosing slow queries
  2: Writing safe zero-downtime migrations
  3: Choosing effective indexing strategies
  4: Reasoning about transaction isolation and data anomalies

Level 3 (Advanced):
  0: Designing schemas for regulated domains (audit, temporal, ledgers)
  1: Diagnosing table bloat, vacuum issues, and degradation over time
  2: Planning zero-downtime migrations on live production tables
  3: Implementing row-level security for multi-tenant isolation
  4: Diagnosing lock contention and blocking queries

Level 4 (Specialist):
  0: Designing partitioning strategies for large tables
  1: Managing Cloud SQL HA, failover, and reconnection
  2: Diagnosing connection pooling issues across the stack
  3: Handling compliance requirements (CMEK, audit, retention)
  4: Tuning PostgreSQL configuration and system-level performance

Level 5 (Expert):
  0: Leading cross-team database architecture decisions
  1: Designing read-replica and query routing strategies
  2: Owning large-scale migration plans end-to-end
  3: Tuning the query planner and setting platform standards
  4: Managing Cloud SQL costs and capacity at scale

Level 6 (Authority):
  0: Leading technology evaluations (Cloud SQL vs alternatives)
  1: Designing disaster recovery and cross-region strategy
  2: Owning the platform cost narrative at the leadership level
  3: Defining compliance and security standards across teams
  4: Building platform capabilities other teams depend on
```

### JVM Understanding

```
Level 1 (Foundations):
  0: Reading stack traces and understanding OOM/StackOverflow errors
  1: Using logs and Actuator endpoints for initial diagnosis
  2: Reading JVM dashboards in Grafana (heap, GC pauses)
  3: Understanding Pod restarts and probe configuration on GKE
  4: Understanding HikariCP connection pool basics

Level 2 (Practitioner):
  0: Sizing JVM heap and GKE resource limits correctly
  1: Reading GC logs and distinguishing allocation surges from leaks
  2: Diagnosing Kafka consumer lag and tuning consumer config
  3: Using JFR for production investigation without downtime
  4: Writing reliable integration tests with Testcontainers

Level 3 (Advanced):
  0: Analysing heap dumps to find memory leaks and retained objects
  1: Reading thread dumps to diagnose stalls and lock contention
  2: Diagnosing Kafka consumer rebalancing and duplicate processing
  3: CPU profiling with async-profiler or JFR to find hot code paths
  4: Tracing HikariCP connection leaks under load

Level 4 (Specialist):
  0: Comparing GC algorithms (G1/ZGC/Shenandoah) under production load
  1: Investigating platform-level issues (CFS throttling, NUMA, noisy neighbours)
  2: Designing Kafka consumer scaling strategies for volume spikes
  3: Reducing JVM latency variance for SLO-sensitive services
  4: Diagnosing cross-service connection pool cascades

Level 5 (Expert):
  0: Defining org-wide JVM baseline configurations for GKE Spring Boot services
  1: Owning production incident diagnosis and turning incidents into learning sessions
  2: Evaluating new Java versions and JVM distributions for the platform
  3: Designing realistic load tests that match production traffic patterns
  4: Defining observability standards for Spring Boot services (metrics, spans, SLOs)

Level 6 (Authority):
  0: Leading long-term JVM strategy decisions (LTS versions, GraalVM, container-native tuning)
  1: Building and adopting standardised JVM observability tooling across all services
  2: Owning complex cross-team production incident investigations
  3: Producing structured assessments for major platform shifts (e.g. Java 17 to 21)
  4: Identifying training gaps and building the JVM curriculum for the organisation
```

### Solution Design

```
Level 1 (Foundations):
  0: Reading API contracts (OpenAPI specs) and integrating against them independently
  1: Following design discussions and understanding trade-offs being made
  2: Identifying whether a change requires a schema change, new endpoint, or event
  3: Reading and understanding Architecture Decision Records (ADRs)
  4: Articulating why a bug is a design problem, not just a code problem

Level 2 (Practitioner):
  0: Designing multi-service interactions (API contracts, sync vs async, Kafka vs HTTP)
  1: Writing ADRs that explain context, decision, alternatives, and consequences
  2: Designing REST endpoints with correct HTTP verbs, status codes, and pagination
  3: Identifying aggregate roots, consistency boundaries, and data replication trade-offs
  4: Giving concrete design feedback in PRs and design docs

Level 3 (Advanced):
  0: Designing audit and event sourcing strategies for regulated domains (PCI-DSS, SOX)
  1: Designing sagas (orchestration vs choreography) with compensation and idempotency
  2: Designing API versioning strategies and managing breaking changes
  3: Designing multi-tenancy patterns (data isolation, tenant context propagation)
  4: Designing Kafka retry and dead-letter strategies for external integrations

Level 4 (Specialist):
  0: Leading cross-team design sessions and maintaining design coherence
  1: Redesigning system boundaries (CQRS, read models, caching) for scale
  2: Identifying reuse opportunities and proposing consolidation across teams
  3: Identifying systemic risks in designs (retry storms, thundering herds, ordering assumptions)
  4: Tracing a financial transaction end-to-end across all services for compliance

Level 5 (Expert):
  0: Identifying diverging architectural decisions across teams and driving standards
  1: Scoping major architectural shifts and presenting phased approaches to leadership
  2: Facilitating stuck design decisions by surfacing real trade-offs and hidden assumptions
  3: Leading technology evaluations (new messaging systems, service meshes, API gateways)
  4: Defining the solution design curriculum for the training programme

Level 6 (Authority):
  0: Leading architecture for new strategic directions (new markets, new BaaS products)
  1: Redesigning the architectural decision-making process (when ADRs are required, who is involved)
  2: Owning audit/regulatory responses about system design (data flows, failure handling)
  3: Producing structured technical debt assessments with sequenced improvement roadmaps
  4: Building shared architectural vocabulary (standards, design guild, reference architectures)
```

### Cloud & Observability

```
Level 1 (Foundations):
  0: Reading Grafana dashboards and distinguishing real alerts from noise
  1: Using kubectl to diagnose pod restarts (OOM, probe failures, crash loops)
  2: Using Cloud Logging to filter and find specific log entries
  3: Following runbook triage steps and escalating with useful context
  4: Reading Cloud SQL metrics dashboards (CPU, connections, storage)

Level 2 (Practitioner):
  0: Configuring GKE resource requests/limits and verifying service health in Cloud Monitoring
  1: Adding structured log statements with trace ID, tenant ID, and operation context
  2: Instrumenting custom metrics with Micrometer and building Grafana panels
  3: Using distributed tracing (Cloud Trace / Grafana Tempo) to follow requests across services
  4: Defining alert conditions with appropriate thresholds and runbook links

Level 3 (Advanced):
  0: Correlating distributed traces with metrics to diagnose cross-service latency
  1: Investigating GKE node-level resource issues (throttling, pod scheduling)
  2: Tuning OpenTelemetry configuration (sampling, cardinality, noisy spans)
  3: Designing golden-signals dashboards for business-critical flows
  4: Reading and modifying Terraform modules for GKE and Cloud SQL

Level 4 (Specialist):
  0: Leading SLO/SLI definition and error budget management for critical services
  1: Analysing GCP cost breakdowns and proposing concrete optimisations
  2: Designing zero-downtime deployment sequencing with observability checkpoints
  3: Producing reusable observability guides (logging, metrics, tracing, alerts, dashboards)
  4: Planning and executing Cloud SQL maintenance with minimal disruption

Level 5 (Expert):
  0: Defining org-wide instrumentation standards and driving adoption
  1: Taking incident commander role for major cross-team incidents
  2: Leading evaluations of new observability tools against current stack
  3: Analysing GKE platform costs and modelling optimisation scenarios for leadership
  4: Defining runbook standards and running peer-review sessions

Level 6 (Authority):
  0: Leading long-term GCP strategy (managed vs GKE vs serverless, multi-region)
  1: Designing and running DR drills with success criteria and gap analysis
  2: Owning the cloud cost narrative at the executive level
  3: Producing audit evidence for security event detection and response
  4: Leading platform capability rollouts that teams adopt because they are useful
```
