# SEB Embedded — Engineering Training Program: Complete Curriculum Reference

> **Purpose**: Machine-readable source of truth for all curriculum content. Use this file as context when generating session materials, exercise code, blocker implementations, loyalty-service features, or train-the-trainer guides.
>
> **Companion file**: `curriculum-matrices.html` — interactive browser version for human navigation.

---

## Program structure

- **4 competency areas**: Database Engineering, Memory Management, Solution Design, Cloud & Observability
- **6 proficiency levels**: Foundations (L1) → Practitioner (L2) → Adept (L3) → Veteran (L4) → Expert (L5) → Authority (L6)
- **3 education tracks**: Track A (L1→L2), Track B (L2→L3), Track C (L3→L4)
- **Track continuity**: Track B entry = completed Track A capstone. Track C entry = completed Track B capstone.
- **L5–L6 engineers** serve as mentors and workshop leads across all tracks.
- **Per-topic track assignment**: An engineer can be Track A in Database but Track B in Solution Design.

## Two-project model

| Project | Role | Domain |
|---|---|---|
| **Credit scoring rule engine** | Theory & worked examples — trainer demonstrates concepts | Rules, weights, applicant profiles, score history, bureau integration |
| **Loyalty program** | Capstone — engineers apply concepts independently | Members, tiers, points, rewards, redemptions, partner integration |

Engineers learn a concept using credit scoring data, then apply it independently in the loyalty program. The transfer across domains is where real learning happens.

## Session format (per session, 2 hours)

| Block | Duration | Description |
|---|---|---|
| Real-world hook | 5 min | Production story connecting to BaaS work |
| Ask the room (opening) | 5 min | Pull knowledge from participants before teaching |
| Theory (credit scoring context) | 15 min | Concept taught using the scoring domain |
| Checkpoint quiz | 3 min | 3 self-check questions (not graded) |
| Capstone exercises (loyalty program) | 50-60 min | Core → Medium → Hard tiers, includes planted blocker |
| Show-your-work lightning (sessions 3, 6, 9 only) | 15 min | 3-4 engineers present between-session findings |
| Cross-area connection | 2 min | Link to other competency areas |
| Ask the room (closing) | 5 min | Reflection and commitment |
| Self-assessment check (sessions 1, 5, 9 only) | 5 min | Private re-read of level descriptors |

## Exercise tiers

| Tier | Audience | Setting | Output |
|---|---|---|---|
| **Core** | Everyone completes | Loyalty training environment | Verified understanding |
| **Medium** | Stretch for lower level, comfort for upper | Loyalty training environment with ambiguity | Deeper understanding |
| **Hard** | Stretch for upper level | Engineer's own team codebase/production | Real artifacts (ADRs, runbooks, assessments) |

## Engagement elements per session

| Element | Description |
|---|---|
| **Planted blocker** | A realistic failure/error embedded in the exercise environment that engineers must diagnose and fix |
| **Prediction prompt** | Before each exercise: "Write down your hypothesis before running it" |
| **Collaborative debugging** | Track A: pair debugging (driver/navigator). Track B: mob diagnosis (rotate driver every 3 min). Track C: red team / blue team |
| **Cheat sheet takeaway** | 1-page reference with the 3-5 most useful commands/patterns from the session |
| **Between-session work** | Bridges to the next session; produces small artifacts or observations |

## Variant system

Each table of 3-4 engineers gets a different loyalty program variant (passed via `VARIANT=X` env variable):

| Variant | Profile | Characteristics |
|---|---|---|
| A | Retail bank | High volume, low value transactions |
| B | Corporate card issuer | Low volume, high value |
| C | Digital wallet | Extremely high volume, micro-transactions |
| D | Multi-currency | SEK, EUR, USD — exchange rate complications |
| E | Partner network | Cross-partner earn/burn |
| F | Tiered enterprise | Different SLAs per tier |

## Tech stack reference

- **Application**: Spring Boot 3.x (Java 21), HikariCP connection pool
- **Database**: PostgreSQL 15+ on Cloud SQL (GCP), Liquibase migrations
- **Messaging**: Apache Kafka
- **Infrastructure**: GKE (Google Kubernetes Engine), Terraform
- **Observability**: OpenTelemetry, Micrometer, Prometheus, Grafana, Loki
- **Compliance**: PCI-DSS, SOX, PSD2

---

# DATABASE ENGINEERING

## DB Track A: Foundations → Practitioner (L1 → L2)

Entry: Self-assessment at L1. Exit: Confidence at L2.

### DB-A1: SQL beyond the basics

- **Topic**: GROUP BY, HAVING, subqueries, CTEs
- **Theory (credit scoring)**: Query applicant data, bureau scores, and risk categories using CTEs and subqueries. Aggregate score distributions per risk tier.
- **Planted blocker**: _Query returns wrong count._ A loyalty CTE query returns 0 rows when it should return 47. The CTE has WHERE status = 'active' but test data uses status = 'ACTIVE' — PostgreSQL string comparison is case-sensitive.
- **Core exercise**: Write 5 queries against the loyalty DB — points per member (GROUP BY), high-value members (HAVING > threshold), tier qualification (subquery), top earners (CTE), monthly earn/burn summary.
- **Medium exercise**: A loyalty report currently computed in Java aggregates points by partner and category. Rewrite as a single SQL query with CTEs. Compare execution plan and time.
- **Hard exercise**: Enable Hibernate SQL logging on your team's service. Capture 10 minutes of ORM-generated SQL. Find one query that surprised you (N+1, unnecessary JOINs, missing WHERE). Bring to session 2.
- **Between sessions**: Review the loyalty service's repository layer. Identify 3 ORM-generated queries. Write equivalent hand-crafted SQL. Note differences.
- **Prediction prompt**: Before running your CTE query, predict: how many rows will it return? Write it down.
- **Ask the room (opening)**: How many of you have looked at the SQL your ORM generates this month? What surprised you?
- **Ask the room (closing)**: What's one thing you'll do differently the next time you write a repository method?
- **Checkpoint quiz**: (1) What's the difference between WHERE and HAVING? (2) When is a CTE preferable to a subquery? (3) Does a correlated subquery run once or once per outer row?
- **Cross-area connection**: The queries you write here determine memory allocation in your Spring Boot service (Memory Management), how your API responds (Solution Design), and what shows up in Query Insights (Cloud & Observability).
- **Cheat sheet items**: GROUP BY + HAVING syntax, CTE template (WITH name AS (...) SELECT ...), correlated vs uncorrelated subquery decision, EXPLAIN prefix for checking plans

### DB-A2: Window functions and practical patterns

- **Topic**: ROW_NUMBER, RANK, LAG/LEAD, running totals, PARTITION BY
- **Theory (credit scoring)**: Running score averages per applicant over time, rank applicants by score within each risk tier, detect score trend changes using LAG.
- **Planted blocker**: _Running balance goes negative._ The running points balance query using SUM() OVER (ORDER BY earned_at) produces negative intermediate balances. Root cause: the ORDER BY is not deterministic — transactions with the same timestamp are ordered randomly, and burn events sometimes sort before earn events. Fix: add a tiebreaker column (ORDER BY earned_at, id).
- **Core exercise**: 4 window function queries on loyalty — running balance per member, rank within tier, find gaps in sequential reward IDs, compare each transaction to the previous one (LAG).
- **Medium exercise**: Replace a batch "monthly tier snapshot" job with a window function query over the raw points ledger.
- **Hard exercise**: Find application code in your team that could be a window function. Document the pattern and the SQL alternative.
- **Between sessions**: Write a query showing each member's current tier alongside their previous tier using LAG.
- **Prediction prompt**: Before running the running balance query, predict: will any intermediate balances be negative? Why or why not?
- **Ask the room (opening)**: Has anyone written a Java loop to find "the latest X per group"? How did it perform?
- **Ask the room (closing)**: Where in your daily work could window functions replace application-side processing?
- **Checkpoint quiz**: (1) How does PARTITION BY differ from GROUP BY? (2) What does LAG(column, 1) return for the first row in a partition? (3) Does a window function reduce the number of rows in the result?
- **Cross-area connection**: Window functions that scan large partitions affect memory (Memory Management — large result set buffering) and latency (Cloud & Observability — shows up as slow queries in Query Insights).
- **Cheat sheet items**: ROW_NUMBER() OVER (PARTITION BY x ORDER BY y), running total SUM() OVER (ORDER BY ... ROWS UNBOUNDED PRECEDING), LAG/LEAD syntax, RANK vs DENSE_RANK vs ROW_NUMBER differences

### DB-A3: Schema design for a feature

- **Topic**: Normalization, keys, foreign keys, designing for queries
- **Theory (credit scoring)**: Design schema for a scoring rule engine — rules table, weights, score history, applicant profiles. Walk through normalization decisions and deliberate denormalization (snapshot score at decision time).
- **Planted blocker**: _Foreign key prevents data insertion._ Engineers try to INSERT a loyalty redemption but get FK constraint violation. The rewards table is empty — the seed script loads rewards AFTER redemptions. Fix: reorder the seed script.
- **Core exercise**: Design the loyalty schema — members, tiers, points, rewards catalog, redemptions. Write CREATE TABLE statements. Peer review in pairs.
- **Medium exercise**: Same brief plus 6 known query patterns. Adjust the schema to optimize for those queries. Justify each denormalization.
- **Hard exercise**: Pull your team's schema. Sketch the ER diagram. Note one design improvement.
- **Between sessions**: Extend your loyalty schema to handle point expiry rules with partner-specific overrides.
- **Prediction prompt**: Before peer review, predict: what will your partner find as the biggest issue with your schema?
- **Ask the room (opening)**: When you design a schema, do you start from the data model or from the queries you need to run?
- **Ask the room (closing)**: If you could redesign one schema your team owns, which one and why?
- **Checkpoint quiz**: (1) Why does the order table snapshot unit_price instead of joining to the product table? (2) UUID vs BIGSERIAL — when do you pick each? (3) What does ON DELETE RESTRICT do?
- **Cross-area connection**: Schema choices drive connection pool behavior (Memory Management — joins need more connections), API contract design (Solution Design — what the API can return efficiently), and monitoring patterns (Cloud & Observability — table size growth).
- **Cheat sheet items**: Normalization decision tree, UUID vs BIGSERIAL guidelines, FK ON DELETE options (RESTRICT/CASCADE/SET NULL), "design for queries" checklist

### DB-A4: Indexing fundamentals

- **Topic**: B-tree basics, composite indexes, write overhead, pg_stat_user_indexes
- **Theory (credit scoring)**: Composite index on (applicant_id, score_date), demonstrate column order impact when querying by date range vs by applicant.
- **Planted blocker**: _Index exists but query still does seq scan._ Engineers add an index on (member_id, earned_at) but EXPLAIN still shows Seq Scan. Root cause: the table has only 200 rows in the training seed — planner chooses Seq Scan for small tables. Fix: load 500K rows of seed data. Teaches: the planner is cost-based, not rule-based.
- **Core exercise**: 5 slow queries on the loyalty training DB. For each: identify the missing index, add it, run EXPLAIN before and after, document the change.
- **Medium exercise**: Find 2 redundant or unused indexes using pg_stat_user_indexes. Propose removals. Verify no regression.
- **Hard exercise**: Run pg_stat_user_indexes on your team's Cloud SQL instance. Find one index with zero scans.
- **Between sessions**: Add a composite index for "member points history by date range." Test column order impact with EXPLAIN.
- **Prediction prompt**: Before adding the index, predict: will EXPLAIN show Index Scan or Bitmap Index Scan? Why?
- **Ask the room (opening)**: How do you currently decide whether a query needs an index?
- **Ask the room (closing)**: What's the cost of adding an index? When would you choose NOT to add one?
- **Checkpoint quiz**: (1) An index on (a, b) helps queries on which column combinations? (2) What does pg_stat_user_indexes.idx_scan = 0 mean? (3) Does adding an index speed up writes or slow them down?
- **Cross-area connection**: Indexes speed up reads but slow writes — every INSERT/UPDATE must update the index (Memory Management — index maintenance allocates objects). Missing indexes show up as slow queries in Query Insights (Cloud & Observability).
- **Cheat sheet items**: CREATE INDEX CONCURRENTLY syntax, composite index column order rule, pg_stat_user_indexes query for unused indexes, selectivity concept (high = good for index)

### DB-A5: Reading EXPLAIN plans

- **Topic**: EXPLAIN vs EXPLAIN ANALYZE, scan types, join strategies, Cloud SQL Query Insights
- **Theory (credit scoring)**: EXPLAIN ANALYZE on a complex scoring join. Walk through node types, costs, actual vs estimated rows.
- **Planted blocker**: _EXPLAIN ANALYZE shows 50x more rows than estimated._ A loyalty query shows estimated rows: 10 but actual rows: 4,800. The members table has never been ANALYZEd — stale statistics. Fix: run ANALYZE members; plan switches from Nested Loop to Hash Join.
- **Core exercise**: Run EXPLAIN ANALYZE on 5 loyalty queries. Fill in the structured template for each: scan type, join strategy, actual vs estimated rows, execution time.
- **Medium exercise**: 3 loyalty queries with suboptimal plans. Diagnose and fix each (missing index, bad join order, stale stats).
- **Hard exercise**: Find the slowest query in your team's Cloud SQL Query Insights. Pull and annotate the EXPLAIN plan.
- **Between sessions**: Run EXPLAIN on your tier qualification query. Is it using the indexes you designed in session 4?
- **Prediction prompt**: For each query, predict: Seq Scan or Index Scan? How many rows? Write it down before running EXPLAIN.
- **Ask the room (opening)**: Who has used EXPLAIN before? What did you learn from it?
- **Ask the room (closing)**: What's the single most useful thing EXPLAIN tells you?
- **Checkpoint quiz**: (1) What's the difference between EXPLAIN and EXPLAIN ANALYZE? (2) When does PostgreSQL choose Seq Scan over Index Scan? (3) If estimated rows = 1 but actual rows = 10,000, what's likely wrong?
- **Cross-area connection**: Query plans determine how much memory the query uses (Memory Management — Hash Join builds a hash table in memory). EXPLAIN output is what Cloud SQL Query Insights is built on (Cloud & Observability).
- **Cheat sheet items**: EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) template, scan type meanings (Seq/Index/Bitmap), join type meanings (Nested Loop/Hash/Merge), "actual vs estimated rows" diagnosis, ANALYZE command to fix stale stats

### DB-A6: Transactions — what can go wrong

- **Topic**: ACID, isolation levels, lost updates, phantom reads, long transactions
- **Theory (credit scoring)**: Race condition when two concurrent applications trigger rescoring simultaneously. Lost update under Read Committed. Fix with Repeatable Read.
- **Planted blocker**: _Point balance goes negative after concurrent operations._ Two concurrent point-burn requests both succeed despite insufficient balance. Each reads balance=500, checks 500>=300, deducts. Final balance: -100. Fix: SELECT ... FOR UPDATE or Repeatable Read with retry.
- **Core exercise**: Reproduce a lost update in the loyalty DB with two concurrent psql sessions. Fix with correct isolation level. Document what happened.
- **Medium exercise**: Fix a race condition in the "points transfer" endpoint. Write a test proving concurrent transfers produce correct total.
- **Hard exercise**: Assess your team's most important write operation's isolation level. Is it correct for the use case?
- **Between sessions**: Design transaction boundaries for the "redeem reward" operation: deduct points + create redemption + update inventory.
- **Prediction prompt**: Before running the concurrent test, predict: will the final balance be correct? What value?
- **Ask the room (opening)**: Has anyone seen "impossible" data in production — a negative balance, a duplicate, two conflicting statuses?
- **Ask the room (closing)**: If you could only change one thing about how your team handles transactions, what would it be?
- **Checkpoint quiz**: (1) What isolation level does PostgreSQL use by default? (2) What happens in Repeatable Read when a concurrent transaction modifies data you've read? (3) Why are long transactions bad for vacuum?
- **Cross-area connection**: Transaction scope affects connection pool hold time (Memory Management — connections held longer = fewer available). Transaction isolation choices are architectural decisions (Solution Design — eventual consistency vs strong consistency).
- **Cheat sheet items**: Isolation level comparison table, SELECT ... FOR UPDATE syntax, the retry pattern for serialization failures, idle_in_transaction_session_timeout setting

### DB-A7: Writing your first safe migration

- **Topic**: Table locks, CREATE INDEX CONCURRENTLY, NOT VALID pattern
- **Theory (credit scoring)**: Unsafe migration on score_history — NOT NULL column with DEFAULT locks the table for 45 seconds. Show the safe 3-step alternative.
- **Planted blocker**: _Migration locks table for 45 seconds._ A Liquibase changeset adds NOT NULL with DEFAULT to loyalty points table (500K rows). ALTER TABLE acquires ACCESS EXCLUSIVE lock, blocking all reads/writes. Fix: split into add nullable → backfill in batches → add constraint NOT VALID → validate.
- **Core exercise**: 3 unsafe migration scripts for the loyalty DB. Identify the problem in each. Rewrite as safe alternatives. Observe locking with pg_locks.
- **Medium exercise**: Design safe migration for adding NOT NULL "expiry_date" to loyalty points table (5M rows). Write multi-step Liquibase changeset with duration estimate.
- **Hard exercise**: Assess the last 3 Liquibase migrations your team ran for safety.
- **Between sessions**: Write a Liquibase changeset for a CONCURRENT index on the loyalty points table. Include rollback step.
- **Prediction prompt**: Before running the unsafe migration, predict: how long will the table be locked?
- **Ask the room (opening)**: Has anyone had a migration cause downtime? What happened?
- **Ask the room (closing)**: What's the first thing you'll check the next time you review a migration PR?
- **Checkpoint quiz**: (1) Why is CREATE INDEX CONCURRENTLY safer than CREATE INDEX? (2) What does NOT VALID mean on a constraint? (3) Which lock mode does ALTER TABLE ADD COLUMN acquire?
- **Cross-area connection**: Migrations that lock tables cause connection pool exhaustion (Memory Management — threads waiting for connections). Migration safety is a design concern (Solution Design — schema evolution strategy).
- **Cheat sheet items**: CREATE INDEX CONCURRENTLY template, NOT VALID + VALIDATE two-step pattern, batched backfill template (UPDATE WHERE id BETWEEN $start AND $end), pg_locks query for monitoring during migration

### DB-A8: Getting comfortable with Cloud SQL

- **Topic**: GCP Console, Query Insights, Cloud Monitoring, Auth Proxy
- **Theory (credit scoring)**: Tour Cloud SQL for the scoring database — CPU, slow queries, backup schedule, instance flags.
- **Planted blocker**: _Cannot connect via Auth Proxy._ Connection refused on 127.0.0.1:5432. The Auth Proxy sidecar listens on port 5433 but the datasource URL points to 5432. Fix: align ports.
- **Core exercise**: Console scavenger hunt — find CPU, top 5 slowest queries in Query Insights, backup schedule, PostgreSQL version, instance flags. Build a basic Cloud Monitoring dashboard.
- **Medium exercise**: Create a 6-panel Cloud Monitoring dashboard with one alert for connection count.
- **Hard exercise**: Connect to your team's Cloud SQL via Auth Proxy without assistance. Browse Query Insights. Find one surprising query.
- **Between sessions**: Compare loyalty training instance Query Insights with your team's instance.
- **Prediction prompt**: Before checking Query Insights, predict: what's the slowest query on the loyalty instance?
- **Ask the room (opening)**: How many of you have logged into the GCP Console this month? What did you look at?
- **Ask the room (closing)**: What's one Cloud SQL metric you'll start checking regularly?
- **Checkpoint quiz**: (1) What's the difference between Cloud SQL Auth Proxy and a direct connection? (2) What does Query Insights show that EXPLAIN doesn't? (3) What are instance flags?
- **Cross-area connection**: Cloud SQL metrics overlap with Grafana dashboards (Cloud & Observability). Auth Proxy is a sidecar container in the pod (Cloud & Observability — Kubernetes manifests).
- **Cheat sheet items**: Auth Proxy connection string format, Query Insights URL pattern, key Cloud Monitoring metrics (CPU, memory, connections, disk), instance flags for autovacuum tuning

### DB-A9: Design challenge — putting it together

- **Topic**: Team exercise — schema, queries, indexes, migration for a new feature
- **Theory (credit scoring)**: N/A — capstone.
- **Planted blocker**: _Referral fraud query returns false positives._ The fraud detection query returns every member because test data has ip_address = NULL for all referrals, and NULL != NULL evaluates to NULL. Fix: add COALESCE or WHERE ip_address IS NOT NULL. Teaches: NULL handling in aggregations.
- **Core exercise**: Teams of 3-4: "Add a referral program to the loyalty platform with fraud prevention." Design schema, queries, indexes, migration plan. Present in 10 minutes.
- **Medium exercise**: Add monitoring for referral fraud. Design migration rollback plan.
- **Hard exercise**: Write an ADR for the riskiest schema decision in your design.
- **Between sessions**: Final reflection — revisit ORM queries from session 1. What would you change now?
- **Prediction prompt**: Before starting the design, each team member writes: what's the hardest part of this brief?
- **Ask the room (opening)**: N/A — teams start immediately.
- **Ask the room (closing)**: What's one thing another team's design did better than yours?
- **Checkpoint quiz**: N/A — capstone session.
- **Cross-area connection**: The referral feature needs API design (Solution Design), monitoring (Cloud & Observability), and memory considerations for batch fraud detection (Memory Management).
- **Cheat sheet items**: Design challenge checklist (tables, FKs, indexes, migration safety, monitoring, rollback)

---

## DB Track B: Practitioner → Adept (L2 → L3)

Entry: Completed Track A capstone (or self-assessed at L2). Exit: Confidence at L3.

### DB-B1: MVCC deep dive — why your database is bloated

- **Topic**: Tuple headers, xmin/xmax, dead tuples, autovacuum tuning
- **Theory (credit scoring)**: Inspect score_history bloat. Demonstrate idle-in-transaction blocking vacuum.
- **Planted blocker**: _Autovacuum never runs on the high-churn table._ The loyalty points table has 2M dead tuples but last_autovacuum = NULL. Root cause: autovacuum_enabled = false set by a previous admin (visible in pg_class.reloptions). Fix: ALTER TABLE points SET (autovacuum_enabled = true, autovacuum_vacuum_scale_factor = 0.01).
- **Core exercise**: Identify top 5 tables by dead tuple ratio. Generate bloat with rapid updates. Tune autovacuum. Compare before/after.
- **Medium exercise**: Find the idle-in-transaction blocking vacuum using pg_stat_activity. Set session timeout. Measure recovery.
- **Hard exercise**: Document your team's bloat situation. Share with team lead.
- **Between sessions**: Monitor identified tables for two weeks. Bring data.
- **Prediction prompt**: Before querying pg_stat_user_tables, predict: which loyalty table has the most dead tuples?
- **Ask the room (opening)**: Has your team's Cloud SQL storage ever grown faster than expected? What was the cause?
- **Ask the room (closing)**: What's one autovacuum setting you'd change on your team's database?
- **Checkpoint quiz**: (1) What creates dead tuples? (2) Default autovacuum_vacuum_scale_factor is 0.2 — what does that mean for a 1M row table? (3) Why does idle-in-transaction prevent vacuum?
- **Cross-area connection**: Table bloat makes queries scan more pages, consuming more memory (Memory Management — larger buffer pool needed). Bloat monitoring belongs in your Grafana dashboards (Cloud & Observability).
- **Cheat sheet items**: pg_stat_user_tables bloat query, autovacuum tuning flags (scale_factor, cost_delay), idle_in_transaction_session_timeout, VACUUM VERBOSE command

### DB-B2: Advanced indexing — beyond B-tree

- **Topic**: Partial, expression, covering, GIN indexes
- **Theory (credit scoring)**: Partial index on active rules, expression index on LOWER(email), covering index for score lookups.
- **Planted blocker**: _GIN index makes writes 10x slower._ After adding GIN on reward_metadata JSONB (50+ keys per doc), INSERT throughput drops from 5000/s to 500/s. Fix: use jsonb_path_ops or a partial GIN on specific fields.
- **Core exercise**: 6 loyalty query patterns each needing a different index type. Create each, verify with EXPLAIN.
- **Medium exercise**: Audit indexes on loyalty points table. Identify optimization opportunity. Benchmark.
- **Hard exercise**: Write a one-page index optimization proposal for your team.
- **Between sessions**: Review and refine proposal based on colleague feedback.
- **Prediction prompt**: For each query pattern, predict: which index type will work best and why?
- **Ask the room (opening)**: Beyond basic B-tree, what index types have you used or heard of?
- **Ask the room (closing)**: What's the most important index change you'd make on your team's database?
- **Checkpoint quiz**: (1) When is a partial index better than a full index? (2) What operator class does jsonb_path_ops support? (3) What does INCLUDE do in a covering index?
- **Cross-area connection**: Index choice affects write latency and GC pressure (Memory Management). Index usage is visible in pg_stat_user_indexes which feeds monitoring (Cloud & Observability).
- **Cheat sheet items**: Partial index syntax (WHERE clause), expression index syntax, covering index (INCLUDE), GIN with jsonb_path_ops, pg_stat_user_indexes audit query

### DB-B3: Schema patterns for regulated domains

- **Topic**: Audit trails, temporal tables, soft deletes, financial ledger patterns
- **Theory (credit scoring)**: Audit trail for score decisions — event sourcing vs audit columns vs triggers.
- **Planted blocker**: _Temporal query returns wrong historical state._ The "point balance at date X" query returns the current balance. The temporal design uses valid_from/valid_to but valid_to for the current record is NULL, and comparisons with NULL return NULL. Fix: WHERE valid_from <= date AND (valid_to IS NULL OR valid_to > date).
- **Core exercise**: Design two audit trail alternatives for the loyalty program. Compare trade-offs.
- **Medium exercise**: Design bi-temporal tier history. Write the "tier at historical date" query.
- **Hard exercise**: Evaluate your team's regulatory schema against discussed patterns. Write gap assessment.
- **Between sessions**: Discuss gap assessment with team lead.
- **Prediction prompt**: Before designing, predict: which audit approach will be simpler to query? Which will be harder to circumvent?
- **Ask the room (opening)**: Has an auditor ever asked your team a question the database couldn't answer?
- **Ask the room (closing)**: What's one regulatory schema gap you've identified today?
- **Checkpoint quiz**: (1) Soft delete vs hard delete — when is each appropriate? (2) What does bi-temporal mean? (3) Why should a financial ledger be append-only?
- **Cross-area connection**: Audit trails affect API design — what can the API expose vs what's internal (Solution Design). Audit table growth needs capacity planning (Cloud & Observability).
- **Cheat sheet items**: Audit columns template (created_by, modified_by, modified_at), temporal table pattern (valid_from, valid_to), soft delete query pattern (WHERE deleted_at IS NULL), NULL-safe temporal query

### DB-B4: Row-level security and multi-tenant isolation

- **Topic**: RLS policies, performance implications, alternatives
- **Theory (credit scoring)**: Implement RLS on scoring tables. Verify filter pushdown in EXPLAIN.
- **Planted blocker**: _RLS bypassed — all partners see all data._ RLS is enabled but queries return all rows. Root cause: the service connects as superuser (postgres), which bypasses RLS. Fix: create non-superuser application role, or ALTER TABLE FORCE ROW LEVEL SECURITY.
- **Core exercise**: Implement RLS on loyalty training DB. Verify isolation by switching tenant context. Confirm filter pushdown in EXPLAIN.
- **Medium exercise**: Design RLS for shared reward catalogs but isolated member data.
- **Hard exercise**: Evaluate RLS feasibility for your team's multi-tenant model. Write ADR.
- **Between sessions**: Format evaluation as ADR for peer review.
- **Prediction prompt**: Before enabling RLS, predict: will it affect query performance? By how much?
- **Ask the room (opening)**: How does your team currently isolate tenant data? WHERE clause? Schema per tenant?
- **Ask the room (closing)**: Is RLS right for your team's data model? Why or why not?
- **Checkpoint quiz**: (1) What's the difference between ROW LEVEL SECURITY and application-level WHERE clauses? (2) What does current_setting('app.tenant_id') do? (3) Do superusers bypass RLS by default?
- **Cross-area connection**: RLS policies affect query planning, which affects memory usage (Memory Management). Multi-tenancy is an architectural concern (Solution Design — tenant isolation patterns).
- **Cheat sheet items**: CREATE POLICY syntax, SET app.tenant_id, FORCE ROW LEVEL SECURITY, EXPLAIN check for RLS filter pushdown, per-table vs per-schema vs per-instance comparison

### DB-B5: Lock diagnosis and concurrency

- **Topic**: pg_stat_activity, pg_locks, blocking chains, advisory locks, deadlocks
- **Theory (credit scoring)**: 3 blocking scenarios — rule update vs live scoring, concurrent recalculations, report blocking autovacuum.
- **Planted blocker**: _Migration hangs indefinitely._ ALTER TABLE ADD COLUMN hangs. pg_stat_activity shows it waiting for AccessExclusiveLock, blocked by a long-running analytics query holding AccessShareLock. Fix: terminate the analytics query or add lock_timeout = '5s' to migrations.
- **Core exercise**: 3 blocking scenarios on loyalty training instance. Use pg_stat_activity + pg_locks to find chains. Determine which to terminate.
- **Medium exercise**: Write lock monitoring query. Add Grafana panel for lock wait time.
- **Hard exercise**: Add monitoring query to your team's migration runbook.
- **Between sessions**: Test monitoring query during a practice migration.
- **Prediction prompt**: Before running the blocking chain query, predict: which PID is the blocker?
- **Ask the room (opening)**: Has anyone had a migration hang in production? What did you do?
- **Ask the room (closing)**: What's one thing you'll add to your next migration runbook?
- **Checkpoint quiz**: (1) Which lock mode blocks everything, including SELECT? (2) What's the queue effect of a pending ACCESS EXCLUSIVE lock? (3) How does PostgreSQL detect deadlocks?
- **Cross-area connection**: Lock contention shows up as connection pool exhaustion (Memory Management — threads waiting for DB connections). Lock monitoring is an observability concern (Cloud & Observability).
- **Cheat sheet items**: Blocking chain query (pg_stat_activity + pg_locks join), lock type hierarchy, pg_terminate_backend syntax, lock_timeout setting, advisory lock syntax

### DB-B6: Zero-downtime migrations at scale

- **Topic**: NOT VALID + VALIDATE, batched backfills, enum evolution, cross-service coordination
- **Theory (credit scoring)**: 4-step migration on score_history — add nullable, backfill in batches, NOT VALID, validate. Measure lock time.
- **Planted blocker**: _Backfill runs out of disk space._ Batched UPDATE generates massive dead tuples, doubling table size. Cloud SQL runs out of disk. Fix: add pg_sleep(1) between batches for autovacuum, or run VACUUM manually every 50K rows.
- **Core exercise**: Execute 4-step migration on loyalty points table. Measure lock time per step. Write Liquibase changesets.
- **Medium exercise**: Design zero-lock migration for TEXT to ENUM type change. Write full runbook.
- **Hard exercise**: Write full migration runbook for your team's riskiest upcoming schema change.
- **Between sessions**: Peer review another participant's migration runbook.
- **Prediction prompt**: Before running the backfill, predict: how long will it take? How much disk space will the dead tuples consume?
- **Ask the room (opening)**: What's the most stressful migration you've been part of?
- **Ask the room (closing)**: What's the first thing you'll change about how your team plans migrations?
- **Checkpoint quiz**: (1) Why does NOT VALID skip checking existing rows? (2) Why might a backfill run out of disk space? (3) What does VALIDATE CONSTRAINT do after NOT VALID?
- **Cross-area connection**: Migration disk space relates to Cloud SQL capacity planning (Cloud & Observability). Batched backfills hold connections and affect pool sizing (Memory Management).
- **Cheat sheet items**: 4-step migration template (add nullable → backfill → NOT VALID → validate), batched UPDATE template with pg_sleep, enum evolution steps, Liquibase changeset examples

### DB-B7: Cloud SQL operations — HA, replicas, monitoring

- **Topic**: Failover behavior, read replicas, connection pooling, advanced Cloud Monitoring
- **Theory (credit scoring)**: Map scoring Cloud SQL architecture. Build 6-panel dashboard.
- **Planted blocker**: _Read replica returns stale data._ Loyalty reporting shows member as "Silver" but primary shows "Gold" (updated 30s ago). Replication lag is 45s. Fix: add lag monitoring, route tier-sensitive queries to primary, add "data as of" timestamp.
- **Core exercise**: Map loyalty training Cloud SQL architecture. Build monitoring dashboard with 6 panels.
- **Medium exercise**: Design read-replica routing: live operations → primary, reports → replica. Configure HikariCP two-datasource.
- **Hard exercise**: Map your team's Cloud SQL architecture. Build dashboard. Set up 3 alerts.
- **Between sessions**: Document your team's database architecture diagram.
- **Prediction prompt**: Before checking replication lag, predict: how many seconds behind is the replica?
- **Ask the room (opening)**: Do you know how much your team's Cloud SQL setup costs per month?
- **Ask the room (closing)**: What's the biggest gap in your team's database monitoring?
- **Checkpoint quiz**: (1) What triggers a Cloud SQL failover? (2) What's the difference between resource requests and limits? (3) How does replication lag affect read consistency?
- **Cross-area connection**: Cloud SQL HA relates to HikariCP reconnection behavior (Memory Management). Replica routing is an architectural decision (Solution Design).
- **Cheat sheet items**: Cloud SQL HA architecture diagram, replication lag query, HikariCP two-datasource config template, key Cloud Monitoring metrics and thresholds

### DB-B8: Performance investigation end-to-end

- **Topic**: Simulated degradation — full investigation combining B1-B7
- **Theory (credit scoring)**: Staged degradation. Full investigation from symptom to fix.
- **Planted blocker**: _Performance fix makes it worse._ Engineers add an index on a low-selectivity column (3 distinct values: Bronze/Silver/Gold). Query goes from 2s (Seq Scan) to 4s (thousands of random I/O lookups). Fix: drop the bad index, use composite index with high-selectivity column.
- **Core exercise**: Investigate 2 degradation scenarios on loyalty. Document symptom → investigation → root cause → fix.
- **Medium exercise**: Find the secondary issue masked by the primary one.
- **Hard exercise**: Investigate one real performance concern from your team.
- **Between sessions**: Write investigation as incident report format.
- **Prediction prompt**: Before investigating, write your top 3 hypotheses for the cause.
- **Ask the room (opening)**: When a query is slow, what's the first thing you check?
- **Ask the room (closing)**: What's the most surprising root cause you've encountered?
- **Checkpoint quiz**: N/A — investigation session.
- **Cross-area connection**: Performance investigation uses tools from all areas — GC logs (Memory Management), trace spans (Cloud & Observability), connection pool behavior (Memory Management).
- **Cheat sheet items**: Performance investigation methodology (symptom → monitoring → EXPLAIN → root cause → fix → verify), common root causes checklist (bloat, stale stats, missing index, lock contention, connection exhaustion)

### DB-B9: Design challenge — complex domain

- **Topic**: Team exercise — regulated, multi-tenant, performant loyalty marketplace
- **Theory (credit scoring)**: N/A — capstone.
- **Planted blocker**: _Cross-partner reward query violates RLS._ The marketplace requires Partner A members to see Partner B rewards, but RLS restricts to current tenant. Query returns 0 rows silently. Fix: design "shared catalog" RLS policy using a join table.
- **Core exercise**: Design loyalty marketplace: cross-partner rewards, revenue sharing, audit trail.
- **Medium exercise**: Peer critique: RLS correctness, migration safety, bloat strategy.
- **Hard exercise**: Polish strongest ADR as Track B exit artifact.
- **Between sessions**: Present best ADR to team. Reflect on Track A → Track B growth.
- **Prediction prompt**: Before designing, each team member writes: what's the hardest constraint in this brief?
- **Ask the room (opening)**: N/A — teams start immediately.
- **Ask the room (closing)**: What's one thing another team's design handled better than yours?
- **Checkpoint quiz**: N/A — capstone.
- **Cross-area connection**: The marketplace needs API contracts between partners (Solution Design), distributed tracing across partner calls (Cloud & Observability), and memory management for cross-partner data caching (Memory Management).
- **Cheat sheet items**: Track B design challenge checklist (RLS, audit trail, migration safety, bloat strategy, monitoring, cross-partner access)

---

## DB Track C: Adept → Veteran (L3 → L4)

Entry: Completed Track B capstone (or self-assessed at L3). Exit: Confidence at L4.

### DB-C1: Partitioning — strategy and implementation

- **Topic**: Range/list/hash, partition pruning, maintenance scripts, archival
- **Theory (credit scoring)**: Partition score_history by month. Show pruning working and breaking.
- **Planted blocker**: _Partition pruning doesn't work._ EXPLAIN shows all 24 partitions scanned. Partition key is (created_at::date) using a cast but query filters on timestamptz. Types don't match. Fix: partition by raw timestamptz.
- **Core exercise**: Partition loyalty points_ledger by month. Verify pruning. Write maintenance script.
- **Medium exercise**: Handle conflicting access patterns: date-range (prunes) AND member-specific (scans all). Design solution.
- **Hard exercise**: Write a partitioning ADR for a table in your team's domain.
- **Between sessions**: Present partitioning ADR to team lead.
- **Prediction prompt**: Before running EXPLAIN on the partitioned table, predict: how many partitions will be scanned?
- **Ask the room (opening)**: Does your team have any table over 100M rows? How do you manage it?
- **Ask the room (closing)**: Would partitioning help or hurt your team's largest table?
- **Checkpoint quiz**: (1) What breaks partition pruning? (2) What happens if no partition matches an INSERT? (3) Range vs list vs hash — when to use each?
- **Cross-area connection**: Partition management needs automation (Cloud & Observability — scheduled jobs). Large partition scans affect memory (Memory Management).
- **Cheat sheet items**: CREATE TABLE PARTITION BY RANGE syntax, partition maintenance script template, pruning verification query, DETACH PARTITION for archival

### DB-C2: Capacity planning and growth modeling

- **Topic**: Cloud Monitoring trends, projection, connection pool sizing, scaling decisions
- **Theory (credit scoring)**: Project when storage, connections, and CPU hit limits.
- **Planted blocker**: _Capacity projection wildly wrong._ Model projects 50GB in 12 months but actual is 200GB in 3 months. Missed: each earn creates 3 audit rows + 1 tier snapshot + 1 outbox entry = 5x projected row count. Fix: map ALL tables that grow with traffic.
- **Core exercise**: Project loyalty instance capacity. Present timeline with decision points.
- **Medium exercise**: Account for 3x seasonality. Include cost projections.
- **Hard exercise**: Build capacity projection for your team's actual Cloud SQL instance.
- **Between sessions**: Present capacity plan. Document decision made.
- **Prediction prompt**: Before building the model, list all tables that grow with traffic. How many did you miss?
- **Ask the room (opening)**: When was the last time your team was surprised by database growth?
- **Ask the room (closing)**: What's the one metric you'll start tracking for capacity planning?
- **Checkpoint quiz**: (1) What's the difference between CPU-bound and I/O-bound workloads? (2) HikariCP maxPoolSize vs Cloud SQL max_connections — which is the real limit? (3) What's a 12-month storage projection useful for?
- **Cross-area connection**: Capacity planning feeds into FinOps (Cloud & Observability). Connection pool sizing relates to thread model (Memory Management).
- **Cheat sheet items**: Growth projection template (table × row size × growth rate × retention), connection budget formula, Cloud Monitoring query for storage trend, scaling decision matrix

### DB-C3: Cloud SQL architecture — HA, replicas, cost

- **Topic**: Failover deep dive, cross-region DR, pricing, AlloyDB evaluation
- **Theory (credit scoring)**: Map full architecture, calculate cost, identify over/under-provisioned areas.
- **Planted blocker**: _Failover takes 5 minutes instead of 30 seconds._ HikariCP holds stale connections with exponential backoff. Default connectionTimeout=30s and maxLifetime=30min. Fix: set maxLifetime=600s, connectionTimeout=5s, add validation query.
- **Core exercise**: Map loyalty Cloud SQL architecture. Calculate monthly cost. Propose right-sizing.
- **Medium exercise**: Design DR strategy: RPO/RTO, cross-region replica, promotion procedure, cost delta.
- **Hard exercise**: Map your team's Cloud SQL architecture with monthly cost. Write cost-optimization proposal.
- **Between sessions**: Validate cost numbers with platform team.
- **Prediction prompt**: Before calculating, estimate: how much does the loyalty Cloud SQL instance cost per month?
- **Ask the room (opening)**: Does your team know the monthly cost of your Cloud SQL setup?
- **Ask the room (closing)**: What's the highest-ROI cost optimization you've identified?
- **Checkpoint quiz**: (1) What happens during a Cloud SQL failover? (2) HA doubles cost — is it always worth it? (3) What's the difference between RPO and RTO?
- **Cross-area connection**: HikariCP failover behavior is a Memory Management concern. HA architecture is a Solution Design decision.
- **Cheat sheet items**: Cloud SQL pricing formula, HA architecture diagram, HikariCP failover settings, cost comparison template (current vs proposed)

### DB-C4: Multi-instance topology and domain boundaries

- **Topic**: When to split, blast radius, compliance isolation, replica routing
- **Theory (credit scoring)**: Design instance topology for 4 domains with mixed compliance.
- **Planted blocker**: _Cross-instance JOIN is impossible._ Proposed topology separates loyalty and reporting into different instances. Reporting dashboard needs to JOIN across them. Fix: use postgres_fdw (poor perf), Kafka CDC replication, or read replica instead of separate instance.
- **Core exercise**: Design loyalty instance topology: engine, partner API, reporting, archive. Present trade-offs.
- **Medium exercise**: PCI-DSS isolation for payment-linked reward data. Design instance boundary.
- **Hard exercise**: Draw your current database architecture. Identify one improvement. Write ADR.
- **Between sessions**: Share ADR with affected team leads.
- **Prediction prompt**: Before designing, list all the queries that cross domain boundaries. How many are there?
- **Ask the room (opening)**: How many Cloud SQL instances does your team interact with?
- **Ask the room (closing)**: What's the biggest trade-off in multi-instance vs single-instance?
- **Checkpoint quiz**: (1) Why can't you JOIN across Cloud SQL instances? (2) When does blast radius isolation justify the operational cost? (3) What's postgres_fdw?
- **Cross-area connection**: Instance topology is a strategic architecture decision (Solution Design — bounded contexts). Cross-instance data movement uses Kafka (Cloud & Observability).
- **Cheat sheet items**: Instance topology decision matrix, postgres_fdw overview, Kafka CDC for cross-instance sync, compliance boundary checklist

### DB-C5: Large-scale migration ownership

- **Topic**: Partitioning existing tables, estimating duration, communication plans, DRI role
- **Theory (credit scoring)**: Plan partitioning 100M-row score_history while online.
- **Planted blocker**: _Migration duration estimate off by 10x._ Estimated 2 hours, actual 20 hours. Missed: 5 indexes updated per INSERT, autovacuum competing for I/O, production workload consuming 60% CPU. Fix: test on clone with realistic indexes, workload, and autovacuum.
- **Core exercise**: Write full migration plan for partitioning loyalty points_ledger online.
- **Medium exercise**: Handle Kafka consumers writing during migration. Design dual-write and cutover.
- **Hard exercise**: Write complete migration runbook for your team's biggest upcoming change.
- **Between sessions**: Peer-review another participant's migration runbook.
- **Prediction prompt**: Before estimating duration, list all factors that affect migration speed.
- **Ask the room (opening)**: What's the largest migration you've owned? What went wrong?
- **Ask the room (closing)**: What's the one thing you'll never skip in a migration runbook again?
- **Checkpoint quiz**: (1) Why should you never estimate from empty-table benchmarks? (2) What's a migration DRI? (3) What's the dual-write pattern for?
- **Cross-area connection**: Migration ownership requires stakeholder communication (Solution Design — ADRs). Migration monitoring needs dashboards (Cloud & Observability).
- **Cheat sheet items**: Migration runbook template (phases, duration, monitoring, rollback, communication), duration estimation methodology, dual-write pattern, clone testing procedure

### DB-C6: Performance architecture

- **Topic**: Vertical vs horizontal, caching, materialized views, CQRS
- **Theory (credit scoring)**: CQRS, Redis cache for active rules, materialized views for dashboards.
- **Planted blocker**: _Materialized view always stale._ Dashboard uses MATERIALIZED VIEW refreshed at midnight but business expects real-time. REFRESH takes 90s and locks the view. Fix: use REFRESH CONCURRENTLY (needs unique index), reduce interval to 5 min, or switch to Kafka event-driven read model.
- **Core exercise**: Design CQRS for loyalty: separate read/write paths. Present trade-offs.
- **Medium exercise**: Evaluate materialized view vs Redis vs denormalized read model for member dashboard.
- **Hard exercise**: Design architectural solution for a performance concern in your team.
- **Between sessions**: Discuss proposal with architect or EM.
- **Prediction prompt**: Before designing, predict: which component will be the bottleneck at 10x traffic?
- **Ask the room (opening)**: Has your team ever needed to separate read and write paths? What triggered it?
- **Ask the room (closing)**: What's the simplest performance architecture change that would help your team most?
- **Checkpoint quiz**: (1) What's CQRS? (2) When should you move workloads off Cloud SQL entirely? (3) What's the operational cost of a materialized view?
- **Cross-area connection**: CQRS affects service design (Solution Design). Caching affects JVM memory (Memory Management). Read model consistency needs monitoring (Cloud & Observability).
- **Cheat sheet items**: CQRS pattern diagram, REFRESH MATERIALIZED VIEW CONCURRENTLY syntax, caching strategy decision matrix, BigQuery/Memorystore offload criteria

### DB-C7: Cross-team database review

- **Topic**: How to review effectively, checklist, giving actionable feedback
- **Theory (credit scoring)**: N/A — practice session.
- **Planted blocker**: _Reviewer misses FLOAT for money._ Schema stores monetary amounts as FLOAT instead of NUMERIC. SUM returns 99999.99999999997 instead of 100000.00. Fix: add "data type appropriateness" to checklist — monetary values must use NUMERIC.
- **Core exercise**: Review another participant's artifact. Write 3 actionable feedback items. Present.
- **Medium exercise**: Review a real design from another team. Deliver written feedback.
- **Hard exercise**: Synthesize "common patterns and anti-patterns" summary from all reviews.
- **Between sessions**: Follow up with reviewed team.
- **Prediction prompt**: Before reviewing, write: what are the top 3 things you'll check?
- **Ask the room (opening)**: When was the last time someone reviewed your database design? What did they catch?
- **Ask the room (closing)**: What's the most important item on the review checklist you didn't have before today?
- **Checkpoint quiz**: N/A — practice session.
- **Cross-area connection**: Review skills apply across all areas — code reviews (Solution Design), infrastructure reviews (Cloud & Observability), JVM config reviews (Memory Management).
- **Cheat sheet items**: Database review checklist (data types, FKs, indexes, migration safety, RLS, monitoring, bloat strategy, naming conventions)

### DB-C8: Monitoring, alerting, and runbook strategy

- **Topic**: Beyond basics — bloat trends, autovacuum lag, percentiles, runbook-driven ops
- **Theory (credit scoring)**: Design monitoring strategy — which metrics, thresholds, runbooks.
- **Planted blocker**: _Alert fires but runbook leads to wrong root cause._ Alert: p99 > 500ms. Runbook says: check indexes. Indexes are fine. Actual cause: pg_dump backup consuming all I/O. Fix: add "check for backup/maintenance operations" to runbook decision tree.
- **Core exercise**: Design monitoring and alerting for loyalty DB. Implement alerts. Write runbooks.
- **Medium exercise**: Redesign noisy alerts. Suppress known patterns. Alert on unknowns.
- **Hard exercise**: Audit your team's monitoring. Write improvement proposal.
- **Between sessions**: Implement at least one monitoring improvement.
- **Prediction prompt**: Before designing alerts, list: what are the 5 failure modes you must detect?
- **Ask the room (opening)**: How many database alerts does your team have? How many fire without action?
- **Ask the room (closing)**: What's the one alert you'll add to your team's database monitoring?
- **Checkpoint quiz**: (1) Why are averages misleading for latency monitoring? (2) What should every alert have? (3) What's the difference between a symptom alert and a cause alert?
- **Cross-area connection**: Database monitoring integrates with service monitoring (Cloud & Observability). Alert runbooks connect to JVM diagnosis (Memory Management).
- **Cheat sheet items**: Key database metrics and thresholds, runbook template (description, severity, diagnostic steps, decision tree, resolution, escalation), PromQL for p99 latency, bloat rate monitoring query

### DB-C9: Architecture decision forum

- **Topic**: Present strongest ADR, peer decision review board
- **Theory (credit scoring)**: N/A — presentations.
- **Planted blocker**: _ADR trade-off analysis is incomplete._ A partitioning ADR misses that Hibernate doesn't support partition-aware queries — every query scans all partitions without the partition key. Fix: add "required application changes" section to ADR.
- **Core exercise**: Present strongest ADR (10 min). Group critiques as review board.
- **Medium exercise**: Select highest-impact ADRs. Recommend for org decision log.
- **Hard exercise**: Synthesize "Track C Database Playbook." Organizational artifact.
- **Between sessions**: Write letter to past self. Exit artifact.
- **Prediction prompt**: Before presenting, predict: what question will the review board ask?
- **Ask the room (opening)**: N/A — presentations start immediately.
- **Ask the room (closing)**: What's one thing you'll take from another presenter's ADR into your own practice?
- **Checkpoint quiz**: N/A — presentation session.
- **Cross-area connection**: Architecture decisions span all areas — database, memory, design, and infrastructure decisions must be evaluated together.
- **Cheat sheet items**: ADR quality checklist (context complete, alternatives fairly evaluated, consequences explicit, cost section, rollback plan, organizational prerequisites)

---

# MEMORY MANAGEMENT

## MM Track A: Foundations → Practitioner (L1 → L2)

Entry: Self-assessment at L1. Exit: Confidence at L2.

### MM-A1: Your Spring Boot app uses memory — here's how to see it

- **Topic**: Grafana dashboards, heap panels, GC panels, recognizing healthy vs unhealthy
- **Theory (credit scoring)**: Open scoring service Grafana. Walk through heap, GC, thread panels. Healthy vs unhealthy.
- **Planted blocker**: _Grafana shows 0 for all JVM metrics._ Actuator prometheus endpoint returns 404. management.endpoints.web.exposure.include doesn't include prometheus. Fix: add prometheus to exposure list and restart.
- **Core exercise**: Open Grafana for loyalty service. Find heap, GC, thread panels. Screenshot 3 panels. For each write: healthy or concerning? Why?
- **Medium exercise**: Hit /simulate-load 500 times. Watch Grafana. Document when heap spikes, GC increases, and when you'd raise an alarm.
- **Hard exercise**: Screenshot your team's memory dashboards during peak. Write brief assessment. Share with EM.
- **Between sessions**: Check loyalty dashboard at 3 different times over 2 weeks. Bring observations.
- **Prediction prompt**: Before looking at Grafana, predict: what percentage of max heap is the loyalty service using right now?
- **Ask the room (opening)**: Who looks at Grafana dashboards at least once a week? What panels do you check?
- **Ask the room (closing)**: What's one memory metric you'll start watching regularly?
- **Checkpoint quiz**: (1) What's the difference between heap used and heap max? (2) What does a steadily growing heap line suggest? (3) What does a GC pause of 500ms mean for your API?
- **Cross-area connection**: The Grafana dashboards you're reading were built with Micrometer metrics (Cloud & Observability). The memory patterns you see are driven by your database queries and connection pools (Database).
- **Cheat sheet items**: Key Grafana panels for JVM (heap used/max, GC pause duration, GC count, thread count), healthy ranges, how to set time window, Actuator prometheus endpoint setup

### MM-A2: What eats memory in a Spring Boot app

- **Topic**: Connection pools, caches, thread pools, Kafka buffers, object allocation
- **Theory (credit scoring)**: Walk through scoring service memory consumers — HikariCP, Kafka buffers, Tomcat threads, @Cacheable score results.
- **Planted blocker**: _@Cacheable causes OutOfMemoryError after 20 minutes._ Default ConcurrentHashMap cache with no eviction/size limit. 100K unique members → 800MB heap. Fix: add Caffeine cache with maximumSize and expireAfterWrite.
- **Core exercise**: List loyalty service memory consumers from config. Calculate: connections × buffer, threads × stack, Kafka concurrency × fetch size. Does the sum fit in container limit with configured -Xmx?
- **Medium exercise**: Reproduce unbounded cache growth. Implement bounded cache with eviction. Verify heap stabilizes.
- **Hard exercise**: Review a PR in your team for potential memory concerns (unbounded collection, cache without eviction, large retained object).
- **Between sessions**: Read loyalty service /actuator/metrics. Find jvm.memory.used, jvm.memory.max, hikaricp.connections.active. Document values and meaning.
- **Prediction prompt**: Before calculating, estimate: how much memory does HikariCP's pool consume?
- **Ask the room (opening)**: When you configure a Spring Boot service, do you think about memory? What specifically?
- **Ask the room (closing)**: What's the biggest memory risk you've seen in a code review?
- **Checkpoint quiz**: (1) Is a @Cacheable ConcurrentHashMap bounded by default? (2) How many MB does each Kafka consumer thread's buffer consume? (3) What does server.tomcat.threads.max control in memory terms?
- **Cross-area connection**: The caches you configure here affect query patterns (Database — cached vs uncached queries). The thread pools relate to API design (Solution Design — sync vs async).
- **Cheat sheet items**: Memory consumer checklist (HikariCP, Kafka, Tomcat, @Cacheable, direct buffers), Caffeine cache config template, Actuator memory endpoints

### MM-A3: Container memory — JVM + Kubernetes = tricky

- **Topic**: OOMKill vs OutOfMemoryError, memory budget formula, UseContainerSupport, resource limits
- **Theory (credit scoring)**: 3 scoring pods — OOMKilled (Xmx too high), GC thrashing (Xmx too low), healthy. Budget formula: -Xmx ≈ 60-70% of container limit.
- **Planted blocker**: _Pod OOMKilled despite healthy heap._ Container 1Gi, -Xmx=900m. Heap at 60%. But JVM also needs ~150MB Metaspace + ~50MB thread stacks + ~100MB direct buffers = 1.2GB > 1Gi. Fix: reduce -Xmx to 600m.
- **Core exercise**: Identify which of 3 loyalty pods is OOMKilled, GC-thrashing, and healthy using kubectl describe and Grafana. Fix configs.
- **Medium exercise**: Calculate full memory budget: heap + Metaspace + (thread count × 1MB) + HikariCP buffers + Kafka buffers. Check fit.
- **Hard exercise**: Audit your team's service JVM + container configuration. Write recommendation with specific numbers.
- **Between sessions**: New Kafka consumer group added (3 threads). Recalculate memory budget. Does container limit still have headroom?
- **Prediction prompt**: Before checking kubectl describe, predict: which pod is OOMKilled and why?
- **Ask the room (opening)**: Has anyone been paged for an OOMKilled pod? What was the cause?
- **Ask the room (closing)**: What's the first thing you'll check the next time a pod is OOMKilled?
- **Checkpoint quiz**: (1) What's Exit Code 137 in Kubernetes? (2) What's the safe -Xmx to container limit ratio? (3) What does UseContainerSupport do?
- **Cross-area connection**: Container limits are set in Kubernetes manifests (Cloud & Observability). OOMKill prevention is part of deployment design (Solution Design — reliability requirements).
- **Cheat sheet items**: Memory budget formula (heap + Metaspace + threads × stack + direct buffers + native), kubectl describe pod for OOMKill detection, -Xmx calculation from container limit, UseContainerSupport flag

### MM-A4: Garbage collection — what's happening under the hood

- **Topic**: Generational GC, young/old gen, minor/major GC, reading GC logs
- **Theory (credit scoring)**: GC logging on scoring service. 5 GC events analyzed. Generational hypothesis with scoring objects.
- **Planted blocker**: _GC log file not created._ Flag -Xlog:gc*:file=/tmp/gc.log but /tmp is read-only in container. JVM silently fails. Fix: write to writable directory like /var/log/.
- **Core exercise**: Run loyalty service with GC logging. Generate load for 2 minutes. For 5 GC events: minor/major, pause time, memory freed, heap after.
- **Medium exercise**: Compare GC logs between high-allocation (batch accrual) and cache-heavy (tier lookups). Which causes more/longer pauses? Why?
- **Hard exercise**: Enable GC logging on your team's service in test. 10 minutes under load. Write health assessment.
- **Between sessions**: Compare your team's GC profile with the loyalty service.
- **Prediction prompt**: Before analyzing the log, predict: are minor GCs more frequent or major GCs?
- **Ask the room (opening)**: Has anyone read a GC log before? What triggered it?
- **Ask the room (closing)**: What's the one GC metric you now know how to find?
- **Checkpoint quiz**: (1) What's the generational hypothesis? (2) Minor GC collects which generation? (3) What triggers a major/full GC?
- **Cross-area connection**: GC pauses affect API latency (Cloud & Observability — shows up in p99 metrics). GC behavior is influenced by query result set sizes (Database — large result sets = more object allocation).
- **Cheat sheet items**: -Xlog:gc* flag syntax, GC log line reading template, minor vs major GC comparison, healthy GC frequency ranges

### MM-A5: Heap dumps and finding memory problems

- **Topic**: jcmd, Eclipse MAT, dominator tree, retained size, retention chains
- **Theory (credit scoring)**: Scoring service has memory leak (cached score results). Heap dump → Eclipse MAT → Leak Suspects → root cause.
- **Planted blocker**: _Heap dump file is 0 bytes._ Container ephemeral storage limit (256Mi) is smaller than heap (512MB). Dump fails silently. Fix: increase ephemeral storage or dump to mounted volume.
- **Core exercise**: Take heap dump of loyalty service with leak. Open in Eclipse MAT. Find leaking object: class, instance count, holding reference.
- **Medium exercise**: Compare two heap dumps 5 minutes apart. Trace growing object graph. Root cause isn't obvious — intermediate event listener holds references.
- **Hard exercise**: Take heap dump from your team's service in test. Top 5 by retained size. Report: healthy/concerning/problematic.
- **Between sessions**: Verify leak is fixed with post-fix heap dump. Document before/after.
- **Prediction prompt**: Before opening MAT, predict: what class is consuming the most heap?
- **Ask the room (opening)**: Has anyone taken a heap dump before? What tool did you use to analyze it?
- **Ask the room (closing)**: What's the first thing you'd do if you suspected a memory leak?
- **Checkpoint quiz**: (1) What's the difference between shallow size and retained size? (2) What's a dominator tree? (3) Is jcmd GC.heap_dump safe to run in production?
- **Cross-area connection**: Memory leaks often come from misused Spring patterns (Solution Design — @Cacheable, @EventListener). Leak monitoring needs Grafana alerts (Cloud & Observability).
- **Cheat sheet items**: jcmd heap dump command, Eclipse MAT navigation (Leak Suspects → Dominator Tree → Path to GC Roots), common leak patterns (unbounded cache, event listener, ThreadLocal)

### MM-A6: Profiling with Java Flight Recorder

- **Topic**: JFR basics, JDK Mission Control, hot methods, allocation, CPU profiling
- **Theory (credit scoring)**: JFR on scoring service. Find hot method, top allocator, GC pause average, peak thread count.
- **Planted blocker**: _JFR recording shows 0 events for allocation profiling._ Started with default "continuous" profile which disables allocation sampling. Fix: use profile configuration: jcmd <pid> JFR.start settings=profile.
- **Core exercise**: Start JFR on loyalty service. Generate mixed load. Find: hottest method, top allocating class, average GC pause, peak threads.
- **Medium exercise**: Find contention issue only visible under load — synchronized block in tier calculation. Explain why it only appears under load.
- **Hard exercise**: Capture JFR from your team's service. Write performance snapshot: top 3 CPU, allocation rate, GC, contention.
- **Between sessions**: Based on JFR data, which optimization would cut response time 20%?
- **Prediction prompt**: Before analyzing JFR, predict: what's the hottest method in the loyalty service?
- **Ask the room (opening)**: What profiling tools have you used? What did you find?
- **Ask the room (closing)**: When would you reach for JFR vs adding log statements?
- **Checkpoint quiz**: (1) Is JFR safe for production? (2) What's the difference between continuous and profile recording settings? (3) What does the Hot Methods view show?
- **Cross-area connection**: JFR shows database wait time (Database — slow queries visible as blocked threads). JFR results inform API performance optimization (Solution Design).
- **Cheat sheet items**: jcmd JFR.start command (continuous vs profile), JMC navigation (Hot Methods, Allocation, GC, Threads), JFR recording flag for always-on in production

### MM-A7: Thread dumps and concurrency basics

- **Topic**: Thread states, deadlocks, pool exhaustion, BLOCKED vs WAITING
- **Theory (credit scoring)**: Scoring service has deadlock. Thread dump → find it → draw lock cycle.
- **Planted blocker**: _Thread dump shows no deadlock but service is frozen._ All 200 Tomcat threads TIMED_WAITING on HikariCP.getConnection(). 10 connections held by slow tier calculation (missing index). Fix: add index AND set connectionTimeout=5s.
- **Core exercise**: Find deadlock in loyalty service. Draw lock dependency cycle.
- **Medium exercise**: Diagnose thread pool exhaustion cascade. Propose fixes: increase pool, add timeout, circuit breaker.
- **Hard exercise**: Thread dump from your team's service during peak. Categorize RUNNABLE/WAITING/BLOCKED. Assess pool sizing.
- **Between sessions**: Compare your team's thread profile with the loyalty service.
- **Prediction prompt**: Before taking the thread dump, predict: what percentage of threads are RUNNABLE vs WAITING?
- **Ask the room (opening)**: Has a service on your team ever stopped responding without an error message? What was the cause?
- **Ask the room (closing)**: What thread state would worry you most if you saw 90% of threads in it?
- **Checkpoint quiz**: (1) What's the difference between BLOCKED and TIMED_WAITING? (2) How does the JVM report deadlocks in thread dumps? (3) What does HikariCP's connectionTimeout control?
- **Cross-area connection**: Thread contention relates to database connection usage (Database — long queries hold connections). Thread pool sizing is a design decision (Solution Design).
- **Cheat sheet items**: jcmd Thread.print command, thread state meanings (RUNNABLE/WAITING/BLOCKED/TIMED_WAITING), deadlock detection in thread dumps, HikariCP connection timeout setting

### MM-A8: GC algorithms — G1 vs ZGC

- **Topic**: Trade-offs, when to switch, configuring, benchmarking
- **Theory (credit scoring)**: Benchmark G1 vs ZGC on scoring service. Show which meets p99 SLA.
- **Planted blocker**: _ZGC uses 2x more memory than G1._ After switching, pod OOMKilled. ZGC's colored pointers require ~2x RSS. Container was sized for G1. Fix: increase container limit, or tune ZGC SoftMaxHeapSize, or stay with tuned G1.
- **Core exercise**: Run loyalty service with G1 and ZGC. Compare pauses, throughput, memory. Which is better for loyalty API?
- **Medium exercise**: Test against p99 SLA of 30ms. Try G1 default, G1 tuned (MaxGCPauseMillis=10), and ZGC. Which meets SLA?
- **Hard exercise**: Evaluate your team's GC algorithm choice for latency-sensitive services. Write recommendation.
- **Between sessions**: Write GC recommendation for loyalty service with supporting data.
- **Prediction prompt**: Before benchmarking, predict: which GC will have lower p99 latency?
- **Ask the room (opening)**: Does anyone know which GC algorithm your team's services use?
- **Ask the room (closing)**: Would you change your team's GC choice based on today's data?
- **Checkpoint quiz**: (1) What's G1's design goal? (2) What's ZGC's key advantage? (3) Why does ZGC use more memory than G1?
- **Cross-area connection**: GC choice affects tail latency visible in SLO dashboards (Cloud & Observability). GC pauses during database operations compound query latency (Database).
- **Cheat sheet items**: G1 vs ZGC comparison table (pause time, throughput, memory overhead, configuration), -XX:+UseG1GC / -XX:+UseZGC flags, MaxGCPauseMillis tuning, benchmarking methodology

### MM-A9: Diagnose a sick service

- **Topic**: Team exercise — multi-factor diagnosis using all tools from A1-A8
- **Theory (credit scoring)**: N/A — capstone.
- **Planted blocker**: _The "obvious" fix makes a second problem visible._ Teams fix tier cache leak (obvious from heap dump). Service improves from 800ms to 200ms but SLA is 30ms. Second issue: synchronized block in PointsCalculator causes contention only visible when GC pauses are short. Fix: replace synchronized with ReentrantReadWriteLock or make calculation stateless.
- **Core exercise**: Diagnose staged incident with multiple factors: cache leak + undersized thread pool + GC pressure. Write timeline. Present.
- **Medium exercise**: Find secondary issue masked by primary one.
- **Hard exercise**: Apply diagnostic approach to your team's most problematic service. Write health assessment.
- **Between sessions**: Write "ideal JVM config" for loyalty service with justification for each choice.
- **Prediction prompt**: Before investigating, each team member writes their top 3 hypotheses.
- **Ask the room (opening)**: N/A — teams start immediately.
- **Ask the room (closing)**: What tool did you reach for first? Was it the right one?
- **Checkpoint quiz**: N/A — capstone.
- **Cross-area connection**: The sick service combines database issues (slow queries), memory issues (cache leak), and observability gaps (missing metrics). This is how real incidents work.
- **Cheat sheet items**: Diagnostic methodology poster (Grafana → GC logs → JFR → heap dump → thread dump), tool selection decision tree

---

## MM Track B: Practitioner → Adept (L2 → L3)

Entry: Completed Track A capstone (or self-assessed at L2). Exit: Confidence at L3.

### MM-B1: Spring Boot memory consumers in depth

- **Topic**: HikariCP internals, Kafka buffer memory, Tomcat thread model, Spring caches
- **Theory (credit scoring)**: Deep dive into scoring service memory map.
- **Planted blocker**: _Memory map doesn't add up — 300MB unaccounted._ Heap 512MB + Metaspace 80MB + threads 50MB = 642MB. Container shows 950MB RSS. Missing: Kafka fetch.max.bytes = 50MB × 3 consumers × 2 (double buffering) = 300MB direct byte buffers. Fix: include Kafka consumer buffers in budget.
- **Core exercise**: Trace each loyalty memory consumer. Build memory map diagram.
- **Medium exercise**: 3 identical pods use 400MB, 600MB, 900MB. Find cause: different Kafka partition assignments.
- **Hard exercise**: Build memory map for your team's most important service.
- **Between sessions**: Estimate memory impact of 2 new @Cacheable methods.
- **Prediction prompt**: Before building the map, list all memory consumers. How many will you miss?
- **Ask the room (opening)**: Can you name 5 things that consume memory in a Spring Boot service besides your application objects?
- **Ask the room (closing)**: What was the biggest surprise in the memory map?
- **Checkpoint quiz**: (1) How much memory does each HikariCP connection consume approximately? (2) Where do Kafka consumer buffers live — heap or off-heap? (3) What does jcmd VM.native_memory show?
- **Cross-area connection**: Kafka buffer memory relates to consumer configuration (Cloud & Observability — partition assignment). Connection pool memory relates to database connection count (Database).
- **Cheat sheet items**: Memory map template (heap + Metaspace + threads + HikariCP + Kafka + direct buffers), jcmd VM.native_memory command, Kafka memory formula (concurrency × fetch.max.bytes × 2)

### MM-B2: Actuator metrics for memory diagnosis

- **Topic**: jvm.memory.*, hikaricp.*, custom metrics, correlating with behavior
- **Theory (credit scoring)**: Grafana dashboard from Actuator metrics. Correlate memory usage with request volume.
- **Planted blocker**: _Custom Counter increments but Grafana shows 0._ Micrometer exports counter as points_processed_count_total (Prometheus convention adds _total). PromQL query uses points_processed_count (without _total). Fix: update query.
- **Core exercise**: Build 6-panel Grafana dashboard from loyalty Actuator metrics.
- **Medium exercise**: Add custom metric tracking tier cache size. Create alert for cache > 100MB.
- **Hard exercise**: Review your team's Actuator metrics. Add one missing metric.
- **Between sessions**: 30-minute load test. Capture metrics. Write memory behavior report.
- **Prediction prompt**: Before load testing, predict: which metric will change most dramatically under load?
- **Ask the room (opening)**: Which Actuator endpoints does your team's service expose?
- **Ask the room (closing)**: What's one Micrometer metric you'll add to your service this week?
- **Checkpoint quiz**: (1) What suffix does Prometheus add to Counter metrics? (2) What's the difference between jvm.memory.used and jvm.memory.committed? (3) How do you create a custom Gauge in Micrometer?
- **Cross-area connection**: Micrometer metrics are the same system used for business metrics (Cloud & Observability). Memory metrics correlate with query patterns (Database).
- **Cheat sheet items**: Key Actuator memory endpoints, Micrometer Counter/Timer/Gauge creation templates, PromQL for memory metrics, _total suffix convention

### MM-B3: OOMKill investigation in Kubernetes

- **Topic**: Container limit vs heap, non-heap growth under load, diagnosing real cause
- **Theory (credit scoring)**: Scoring service OOMKilled during batch. Thread count spikes past container limit.
- **Planted blocker**: _OOMKill only during batch — same code path._ Batch processes 100K records in single @Transactional. Hibernate first-level cache holds all entities (400MB). Fix: flush/clear every 1000 records.
- **Core exercise**: Investigate loyalty OOMKill during batch point expiry. Find thread/memory issue. Fix.
- **Medium exercise**: Subtle OOMKill: direct byte buffers from large Kafka messages. Use native memory tracking.
- **Hard exercise**: Review your team's OOMKill history. Write prevention strategy.
- **Between sessions**: Create OOMKill prevention checklist and runbook.
- **Prediction prompt**: Before investigating, predict: is the OOMKill caused by heap or non-heap memory?
- **Ask the room (opening)**: What's the most common cause of OOMKill in your experience?
- **Ask the room (closing)**: What's on your OOMKill prevention checklist that wasn't there this morning?
- **Checkpoint quiz**: (1) What Hibernate pattern causes first-level cache to grow unboundedly? (2) How do you detect direct byte buffer growth? (3) What's the difference between Exit Code 137 and java.lang.OutOfMemoryError?
- **Cross-area connection**: Batch processing patterns relate to database transaction design (Database — long transactions). Container limits are set in K8s manifests (Cloud & Observability).
- **Cheat sheet items**: OOMKill investigation flowchart (kubectl describe → Grafana → heap or non-heap?), Hibernate batch processing pattern (flush/clear), direct byte buffer monitoring, native memory tracking command

### MM-B4: Profiling memory allocation with JFR

- **Topic**: Allocation hotspots, TLAB allocation, object lifetime analysis
- **Theory (credit scoring)**: JFR allocation profiling. Top allocator correlation with GC pressure.
- **Planted blocker**: _Unexpected top allocator: byte[] from logging._ DEBUG logging in production allocates 300MB/s of garbage via string formatting. Fix: set logging to INFO in production.
- **Core exercise**: JFR on loyalty service. Top allocators, allocation rate, promotion behavior.
- **Medium exercise**: TierEvaluationContext objects promoted to old gen unexpectedly (calculation spans multiple GC cycles).
- **Hard exercise**: Analyze your team's allocation profile. Top 3 allocating classes.
- **Between sessions**: Compare loyalty allocation between low and high load.
- **Prediction prompt**: Before analyzing, predict: what's the #1 allocating class?
- **Ask the room (opening)**: Have you ever profiled memory allocation? What tool did you use?
- **Ask the room (closing)**: What allocation pattern from today would you look for in your own codebase?
- **Checkpoint quiz**: (1) What's a TLAB? (2) What causes objects to be promoted to old gen? (3) Why is high allocation rate bad even if objects are short-lived?
- **Cross-area connection**: Allocation rate from logging relates to log configuration (Cloud & Observability). Object creation patterns relate to domain model design (Solution Design).
- **Cheat sheet items**: JFR allocation profiling setup (settings=profile), JMC Memory tab navigation, common high-allocation culprits (logging, serialization, string concatenation, autoboxing)

### MM-B5: Thread model and concurrency in Spring Boot

- **Topic**: Tomcat threads, @Async, Kafka listener threads, virtual thread readiness
- **Theory (credit scoring)**: Map scoring service thread model — Tomcat, @Async, Kafka.
- **Planted blocker**: _@Async doesn't run async — blocks the caller._ Missing @EnableAsync on @Configuration class. Spring ignores @Async annotation. Fix: add @EnableAsync.
- **Core exercise**: Map loyalty thread model. Thread dump under load. Categorize by type.
- **Medium exercise**: @Async pool exhausted under load (10 threads, 500ms each, 50 concurrent). Implement fix.
- **Hard exercise**: Map your team's thread model. Assess pool sizing.
- **Between sessions**: Research Java 21 virtual threads for loyalty service.
- **Prediction prompt**: Before taking thread dump, predict: how many Tomcat threads are active vs waiting?
- **Ask the room (opening)**: Do you know how many thread pools your service has? Can you name them?
- **Ask the room (closing)**: What's one thread pool configuration you'd change on your service?
- **Checkpoint quiz**: (1) What's the difference between @Async and CompletableFuture.supplyAsync()? (2) Why does @Async require @EnableAsync? (3) How many threads does a Kafka consumer with concurrency=3 create?
- **Cross-area connection**: Thread model affects API responsiveness (Solution Design — sync vs async). Thread count affects connection pool demand (Database — more threads = more connections needed).
- **Cheat sheet items**: Spring Boot thread pool map (Tomcat, @Async, Kafka, scheduled), @EnableAsync requirement, thread dump categorization methodology, virtual threads compatibility checklist

### MM-B6: Memory leak patterns in Spring applications

- **Topic**: Unbounded caches, event listener retention, ThreadLocal, connection pool leaks
- **Theory (credit scoring)**: 3 leak patterns on scoring service — @Cacheable, @EventListener, ThreadLocal.
- **Planted blocker**: _Leak only manifests after 48 hours._ @EventListener stores events in ArrayList for batch reporting. Reporting job silently fails (NPE in catch block). 10K events/hour × 2KB = 480MB/day. Fix: max-size check, fix reporting exception, add size monitoring.
- **Core exercise**: Find leak via heap dump comparison. Identify retention chain.
- **Medium exercise**: ThreadLocal leak in Tomcat filter. Implement fix with ThreadLocal.remove() in finally block.
- **Hard exercise**: Review your team's codebase for the 3 common leak patterns.
- **Between sessions**: Write code review checklist item for each leak pattern.
- **Prediction prompt**: Before investigating, predict: is the leak in application code, framework code, or library code?
- **Ask the room (opening)**: Has your team ever found a memory leak? How long did it take to diagnose?
- **Ask the room (closing)**: What code pattern will you now flag in every code review?
- **Checkpoint quiz**: (1) Why is ConcurrentHashMap with @Cacheable a leak risk? (2) Where should ThreadLocal.remove() be called in a web request? (3) How do you identify a leak from two heap dumps?
- **Cross-area connection**: Leak patterns relate to Spring patterns (Solution Design — proper @Cacheable configuration). Leak monitoring needs alerting (Cloud & Observability — heap growth rate alerts).
- **Cheat sheet items**: 3 leak pattern recognition guide, heap dump comparison methodology in MAT, ThreadLocal cleanup pattern, @Cacheable with Caffeine bounded config

### MM-B7: Connection pool sizing and behavior

- **Topic**: HikariCP internals, pool exhaustion, Cloud SQL limits, sizing formula
- **Theory (credit scoring)**: Pool sized at 10 but 30 Tomcat + 5 Kafka need connections. Walk through sizing formula.
- **Planted blocker**: _Pool exhaustion despite correct sizing._ Pool=30 but one endpoint holds connections for 10s (batch export). 5 concurrent exports = 5 long-held connections. Fix: separate DataSource for long queries, or connection timeout on export.
- **Core exercise**: Diagnose connection exhaustion in loyalty service. Fix pool sizing.
- **Medium exercise**: Multiple services sharing one Cloud SQL instance. Design connection allocation strategy.
- **Hard exercise**: Audit your team's HikariCP vs Cloud SQL connection limits.
- **Between sessions**: Write connection pool sizing guide for your team.
- **Prediction prompt**: Before diagnosing, predict: is the problem too few connections or too slow queries?
- **Ask the room (opening)**: Has your service ever logged "connection not available"? What was the cause?
- **Ask the room (closing)**: What's your team's connection pool to Cloud SQL limit ratio?
- **Checkpoint quiz**: (1) What's the HikariCP default connectionTimeout? (2) Can multiple Spring Boot services share a Cloud SQL instance? What's the limit? (3) What's the formula for minimum pool size?
- **Cross-area connection**: Connection pool sizing relates to Cloud SQL max_connections (Database). Pool exhaustion shows up as latency spikes (Cloud & Observability).
- **Cheat sheet items**: HikariCP sizing formula (pool = Tomcat threads + Kafka consumers + headroom), connection budget across services, "connection not available" diagnosis steps, separate DataSource pattern

### MM-B8: Metaspace and class loading

- **Topic**: What lives in Metaspace, class loader leaks, dynamic proxies, Spring AOP
- **Theory (credit scoring)**: Dynamic rule compilation causing Metaspace growth.
- **Planted blocker**: _Metaspace OOM after 200 rule updates._ SpEL expressions compiled at runtime. Classloader never unloaded. Fix: increase MaxMetaspaceSize, implement bounded expression cache, add monitoring.
- **Core exercise**: Investigate loyalty Metaspace growth. Set MaxMetaspaceSize. Add monitoring alert.
- **Medium exercise**: Spring DevTools misconfiguration causing proxy regeneration. Fix.
- **Hard exercise**: Check your team's Metaspace usage. Write assessment.
- **Between sessions**: Add Metaspace monitoring to your team's Grafana dashboard.
- **Prediction prompt**: Before investigating, predict: is Metaspace growth linear or exponential?
- **Ask the room (opening)**: Does anyone know what MaxMetaspaceSize is set to on your services? Is it set at all?
- **Ask the room (closing)**: What causes Metaspace to grow in a Spring Boot app?
- **Checkpoint quiz**: (1) What lives in Metaspace? (2) What's the default MaxMetaspaceSize? (3) How does Spring AOP contribute to Metaspace usage?
- **Cross-area connection**: Metaspace relates to Spring proxy behavior (Solution Design — @Transactional, @Async create proxies). Metaspace monitoring belongs in dashboards (Cloud & Observability).
- **Cheat sheet items**: MaxMetaspaceSize flag, jvm.memory.used{area="nonheap"} metric, common Metaspace growth causes (SpEL, CGLIB proxies, Groovy scripts), bounded expression cache pattern

### MM-B9: Full memory health assessment

- **Topic**: Team exercise — comprehensive memory profile
- **Theory (credit scoring)**: N/A — capstone.
- **Planted blocker**: _Assessment misses biggest risk._ Comprehensive report covers heap, GC, caches but misses: no HeapDumpOnOutOfMemoryError flag. Next OOM = no dump to analyze. Fix: add -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/tmp. Ensure enough ephemeral storage.
- **Core exercise**: Produce comprehensive memory health assessment: memory map, GC profile, thread model, risk areas. Present.
- **Medium exercise**: Prioritized recommendations with effort estimates.
- **Hard exercise**: Apply same assessment to your team's critical service. Track B exit artifact.
- **Between sessions**: Write ideal configuration for loyalty service with justification.
- **Prediction prompt**: Before starting, list everything you'll include in the assessment. What might you forget?
- **Ask the room (opening)**: N/A — teams start immediately.
- **Ask the room (closing)**: What's the one JVM flag you'll check first on every service from now on?
- **Checkpoint quiz**: N/A — capstone.
- **Cross-area connection**: The health assessment touches all areas — database connections, API patterns, infrastructure configuration, and monitoring.
- **Cheat sheet items**: Health assessment template (memory map, GC profile, thread model, risk areas, recommendations), essential JVM flags checklist

---

## MM Track C: Adept → Veteran (L3 → L4)

Entry: Completed Track B capstone (or self-assessed at L3). Exit: Confidence at L4.

### MM-C1: GC tuning for production SLAs

- **Topic**: G1 pause targets, ZGC for latency, tuning workflow
- **Theory (credit scoring)**: Tuning workflow for p99 SLA — measure, identify GC contribution, tune, re-measure.
- **Planted blocker**: _MaxGCPauseMillis=5 causes throughput collapse._ Pauses drop to 3-5ms but GC runs 10x more frequently (40% CPU). p99 actually worse (35ms) because CPU contention. Fix: MaxGCPauseMillis=15 is the sweet spot.
- **Core exercise**: Tune loyalty service GC for 30ms p99 SLA. Document each step.
- **Medium exercise**: Batch throughput vs live latency on same JVM. Design GC strategy for both.
- **Hard exercise**: Measure GC contribution to tail latency for your team's service.
- **Between sessions**: Implement one GC tuning recommendation. Measure before/after.
- **Prediction prompt**: Before tuning, predict: what MaxGCPauseMillis value will achieve the best p99?
- **Ask the room (opening)**: Has anyone tuned GC settings? What triggered it?
- **Ask the room (closing)**: What's the relationship between MaxGCPauseMillis and actual pause time?
- **Checkpoint quiz**: (1) Is MaxGCPauseMillis a guarantee or a hint? (2) Why can aggressive pause targets reduce throughput? (3) When is ZGC clearly better than tuned G1?
- **Cross-area connection**: GC pauses affect API SLOs (Cloud & Observability). GC tuning interacts with database query latency (Database).
- **Cheat sheet items**: GC tuning workflow (measure → identify → tune → re-measure), MaxGCPauseMillis sweet spot methodology, G1 vs ZGC decision matrix for SLA requirements

### MM-C2: Cold start optimization

- **Topic**: JIT warmup, Spring context init, pool warmup, Kafka rebalance, readiness strategy
- **Theory (credit scoring)**: Break down scoring service cold start — Spring context (15s), HikariCP warmup (5s), Kafka rebalance (10s), JIT (15s).
- **Planted blocker**: _Readiness probe passes but first request fails._ /actuator/health returns UP at T+8s but HikariCP hasn't initialized (lazy). First request gets "no connection." Fix: custom readiness indicator or @PostConstruct warmup query.
- **Core exercise**: Measure loyalty cold start timeline. Implement one optimization. Re-measure.
- **Medium exercise**: Complete readiness strategy with warmup endpoint for JIT compilation.
- **Hard exercise**: Map your team's cold start timeline. Propose optimization.
- **Between sessions**: Design deployment strategy that accounts for warmup time.
- **Prediction prompt**: Before measuring, predict: how many seconds until the first request completes in <30ms?
- **Ask the room (opening)**: Have you noticed slow first requests after deployment? What did you attribute it to?
- **Ask the room (closing)**: What's the biggest contributor to your service's cold start?
- **Checkpoint quiz**: (1) What's JIT compilation and why does it affect first requests? (2) Does HikariCP create connections eagerly or lazily by default? (3) What's a readiness gate?
- **Cross-area connection**: Cold start affects deployment strategy (Cloud & Observability — rolling updates, readiness probes). Spring context initialization relates to application design (Solution Design).
- **Cheat sheet items**: Cold start timeline template, HikariCP warmup @PostConstruct pattern, readiness probe with DB check, JIT warmup endpoint pattern

### MM-C3: Production JVM configuration blueprint

- **Topic**: Complete flag set, container awareness, diagnostics, heap dump on OOM
- **Theory (credit scoring)**: Walk through "golden" JVM configuration for scoring service.
- **Planted blocker**: _JVM ignores container memory limit._ Older JDK 11 build where UseContainerSupport is broken. JVM reads host memory. Fix: upgrade to JDK 21 and set explicit -Xmx.
- **Core exercise**: Write complete JVM config for loyalty deployment manifest. Justify each flag.
- **Medium exercise**: JVM config template with per-service overrides for 4 loyalty microservices.
- **Hard exercise**: Review your team's JVM config. Write PR with fixes.
- **Between sessions**: Propose JVM configuration as team standard.
- **Prediction prompt**: Before writing the config, list all the flags you think are necessary. How many will you miss?
- **Ask the room (opening)**: How many JVM flags does your team's deployment manifest have? Can you explain each one?
- **Ask the room (closing)**: What's the one flag you'll add to every service from now on?
- **Checkpoint quiz**: (1) Why set -Xms equal to -Xmx? (2) What does HeapDumpOnOutOfMemoryError do? (3) What's MaxRAMPercentage and when should you use it?
- **Cross-area connection**: JVM config lives in Kubernetes manifests (Cloud & Observability). Config choices affect database connection behavior (Database — pool warmup flags).
- **Cheat sheet items**: Golden JVM configuration template with comments, per-workload override guidelines, flag validation checklist

### MM-C4: Thread pool architecture for mixed workloads

- **Topic**: Optimal pool shapes, bulkhead pattern, I/O-bound vs CPU-bound, virtual threads
- **Theory (credit scoring)**: 3 thread pools sized differently for different workload types.
- **Planted blocker**: _Bulkhead isolation doesn't prevent cascade._ @Async("tierExecutor") but @Transactional DB call runs on calling (Tomcat) thread. Fix: move @Transactional boundary inside the async method.
- **Core exercise**: Design thread pool config for loyalty service. Justify sizes. Load test.
- **Medium exercise**: Implement bulkhead pattern. Verify tier calculations can't exhaust Tomcat pool.
- **Hard exercise**: Map your team's thread pool architecture. Fix one mis-sized pool.
- **Between sessions**: Assess Java 21 virtual threads for loyalty service.
- **Prediction prompt**: Before load testing, predict: which pool will exhaust first?
- **Ask the room (opening)**: How do you decide the size of a thread pool?
- **Ask the room (closing)**: When would you use virtual threads vs platform threads?
- **Checkpoint quiz**: (1) What's the bulkhead pattern? (2) How should you size a pool for I/O-bound work vs CPU-bound? (3) What does @Transactional(propagation=REQUIRES_NEW) do to threading?
- **Cross-area connection**: Thread pool sizing relates to connection pool sizing (Database — more threads need more connections). Bulkhead is an architectural pattern (Solution Design).
- **Cheat sheet items**: Thread pool sizing formulas (I/O-bound: threads = connections × 2, CPU-bound: threads = cores), bulkhead implementation with Spring @Async, virtual threads compatibility checklist

### MM-C5: JVM upgrade risk assessment

- **Topic**: Java 17→21, changed defaults, dependency compatibility, virtual threads
- **Theory (credit scoring)**: Java 17→21 assessment for scoring service.
- **Planted blocker**: _Java 21 breaks Kafka consumer with SecurityManager error._ Third-party serializer calls System.setSecurityManager(). Fix: add --allow-deprecated-security-manager or upgrade library.
- **Core exercise**: Java 21 upgrade assessment for loyalty service. Write risk document.
- **Medium exercise**: Execute upgrade in training. Run tests. Measure performance delta.
- **Hard exercise**: Assess Java 21 readiness for your team's critical service.
- **Between sessions**: Present assessment to team. Refine plan.
- **Prediction prompt**: Before assessing, list all dependencies that might break. How many will you miss?
- **Ask the room (opening)**: What Java version do your services run? When was the last upgrade?
- **Ask the room (closing)**: What's the biggest risk in upgrading Java versions?
- **Checkpoint quiz**: (1) What happened to SecurityManager in Java 17+? (2) What GC defaults changed between Java 17 and 21? (3) Which dependencies are most likely to break on upgrade?
- **Cross-area connection**: JVM upgrades affect deployment pipeline (Cloud & Observability). API behavior may change (Solution Design — serialization changes).
- **Cheat sheet items**: Java 21 upgrade checklist (removed APIs, changed defaults, dependency compatibility), jdeps command for dependency analysis, test strategy template

### MM-C6: Large payload memory management

- **Topic**: Streaming vs buffering, direct byte buffers, file uploads, integration payloads
- **Theory (credit scoring)**: Batch scoring with large datasets — streaming vs buffering.
- **Planted blocker**: _Streaming endpoint is slower than buffered._ Streaming reads line-by-line but each line triggers individual INSERT (N+1 DB problem). Fix: combine streaming input with batched output — chunks of 1000 lines.
- **Core exercise**: Refactor loyalty bulk import from buffered to streaming. Measure heap difference.
- **Medium exercise**: Handle large partner JSON responses. Streaming JSON parse with Jackson.
- **Hard exercise**: Identify large-payload pattern in your team. Measure memory impact.
- **Between sessions**: Write large payload handling guide for your team.
- **Prediction prompt**: Before refactoring, predict: how much heap will streaming save?
- **Ask the room (opening)**: Has your service ever handled files or payloads larger than 10MB? How?
- **Ask the room (closing)**: When should you stream and when should you buffer?
- **Checkpoint quiz**: (1) Where do direct byte buffers live — heap or off-heap? (2) What's the N+1 problem in the context of streaming? (3) What does Jackson's streaming API do differently from ObjectMapper.readValue()?
- **Cross-area connection**: Large payloads affect database batch insert performance (Database). File handling relates to API design (Solution Design — multipart uploads).
- **Cheat sheet items**: Streaming vs buffering decision matrix, Jackson streaming API template, batched output pattern (collect N items → batch insert), direct byte buffer monitoring

### MM-C7: Cross-service memory cascade diagnosis

- **Topic**: GC cascades, connection pool cascade, Kafka consumer lag from GC
- **Theory (credit scoring)**: GC pauses causing timeout cascades in downstream services.
- **Planted blocker**: _Circuit breaker doesn't help — failure mode is GC pause, not error._ GC freezes HTTP client mid-request (3s instead of 50ms). Circuit breaker counts "slow" not "failed" — default threshold is error rate only. Fix: configure slowCallRateThreshold and slowCallDurationThreshold.
- **Core exercise**: Trace GC pause → Kafka consumer lag → downstream alert cascade. Propose fixes.
- **Medium exercise**: Design circuit breakers and timeouts. Test by inducing GC pauses.
- **Hard exercise**: Review your team's cross-service dependencies for cascade risk. Write ADR.
- **Between sessions**: Implement one cross-service protection mechanism.
- **Prediction prompt**: Before tracing the cascade, predict: how many services are affected by a 5-second GC pause?
- **Ask the room (opening)**: Has a problem in one service ever caused alerts in a different service? What happened?
- **Ask the room (closing)**: What's the weakest link in your team's cross-service resilience?
- **Checkpoint quiz**: (1) Why does a GC pause cause Kafka consumer lag? (2) What's the difference between error rate and slow call rate in a circuit breaker? (3) How does a retry amplify a cascade?
- **Cross-area connection**: Circuit breakers are a design pattern (Solution Design). Cascade detection needs distributed tracing (Cloud & Observability).
- **Cheat sheet items**: Cascade diagnosis methodology, Resilience4j circuit breaker config (slow call threshold), Kafka consumer heartbeat timeout, retry budget pattern

### MM-C8: Fleet-wide JVM standards and observability

- **Topic**: Standard baseline, automated JFR capture, GC anomaly alerting, fleet dashboards
- **Theory (credit scoring)**: JVM standard for all scoring microservices. Fleet dashboard.
- **Planted blocker**: _Fleet dashboard shows healthy averages but one service is dying._ AVG() across 4 services hides one with 180ms GC pauses. Fix: per-service panels or MAX() as top-level indicator, with alert on per-service p99 GC pause.
- **Core exercise**: Define JVM baseline for loyalty microservices. Document with rationale.
- **Medium exercise**: Build fleet-wide Grafana dashboard. Add GC anomaly detection alert.
- **Hard exercise**: Propose JVM standard for your team. Track C portfolio piece.
- **Between sessions**: Implement standard on one service. Measure before/after.
- **Prediction prompt**: Before building the dashboard, predict: which of the 4 services has the worst GC profile?
- **Ask the room (opening)**: Are your team's services configured consistently? Or does each one have different JVM flags?
- **Ask the room (closing)**: What's the hardest part of getting teams to adopt a standard?
- **Checkpoint quiz**: (1) Why are fleet-wide averages misleading? (2) What's a JVM configuration baseline? (3) How would you detect GC anomalies automatically?
- **Cross-area connection**: Fleet standards relate to infrastructure as code (Cloud & Observability — Terraform/Helm templates). Consistency enables better cross-team debugging (Solution Design — shared tooling).
- **Cheat sheet items**: JVM baseline template, fleet dashboard design (per-service panels, MAX aggregation), automated JFR capture on anomaly, GC anomaly detection PromQL

### MM-C9: Memory architecture decision forum

- **Topic**: Present strongest assessment, peer review board
- **Theory (credit scoring)**: N/A — presentations.
- **Planted blocker**: _Recommendation ignores cost._ ZGC recommended for all services. Peer review: 2x memory × 4 services × 3 replicas = significant cost increase. Fix: ZGC for 1 latency-critical service, tuned G1 for the other 3. Add "cost impact" section to ADRs.
- **Core exercise**: Present strongest artifact. Group critiques.
- **Medium exercise**: Identify 2-3 recommendations for fleet-wide adoption.
- **Hard exercise**: Synthesize "Memory Management Playbook." Organizational artifact.
- **Between sessions**: Write letter to past self. Exit artifact.
- **Prediction prompt**: Before presenting, predict: what question will the review board ask?
- **Ask the room (opening)**: N/A — presentations start immediately.
- **Ask the room (closing)**: What's one thing from another presenter's work that you'll adopt?
- **Checkpoint quiz**: N/A — presentation session.
- **Cross-area connection**: Memory decisions interact with infrastructure cost (Cloud & Observability — FinOps), database performance (Database), and service architecture (Solution Design).
- **Cheat sheet items**: Memory ADR template (analysis, recommendation, cost impact, rollback plan)

---

# SOLUTION DESIGN

## SD Track A: Foundations → Practitioner (L1 → L2)

Entry: Self-assessment at L1. Exit: Confidence at L2.

### SD-A1: Reading Spring Boot service structure

- **Topic**: Controller → service → repository layers, why they're separated
- **Theory (credit scoring)**: Walk through ScoreController → ScoreService → ScoreRepository.
- **Planted blocker**: _Request returns 404 but controller exists._ Class annotated @Controller instead of @RestController. Spring expects view name. Fix: change to @RestController.
- **Core exercise**: Map GET /api/v1/members/{id}/points request flow. Draw sequence diagram.
- **Medium exercise**: Find controller that bypasses service layer. Explain the problem. Refactor.
- **Hard exercise**: Draw request flow for your team's most important endpoint.
- **Between sessions**: Extend diagram to include tier calculation service dependency.
- **Prediction prompt**: Before tracing the request, predict: how many classes does the request pass through?
- **Ask the room (opening)**: When you read a new codebase, where do you start?
- **Ask the room (closing)**: What's the value of the service layer if it just calls the repository?
- **Checkpoint quiz**: (1) What's the difference between @Controller and @RestController? (2) Why should the controller not call the repository directly? (3) What does @Service do?
- **Cross-area connection**: The service layers affect how database queries are organized (Database). Layer structure influences memory usage through Spring proxy creation (Memory Management).
- **Cheat sheet items**: Spring Boot layer diagram, @Controller vs @RestController, dependency injection basics, sequence diagram template

### SD-A2: REST API design fundamentals

- **Topic**: HTTP methods, status codes, resource naming, request/response contracts
- **Theory (credit scoring)**: Design scoring API — POST score-requests, GET scores/{id}, appropriate status codes.
- **Planted blocker**: _POST endpoint creates duplicates on retry._ Client retries after timeout. First request succeeded but response was lost. No idempotency key. Fix: add idempotency_key parameter with duplicate check.
- **Core exercise**: Design loyalty API: members, points, rewards, redemptions. HTTP methods, URLs, status codes. Write OpenAPI stub.
- **Medium exercise**: Design points transfer endpoint. Handle insufficient balance. Choose error status codes.
- **Hard exercise**: Evaluate 3 of your team's API endpoints for design quality.
- **Between sessions**: Add standard error response contract to loyalty API.
- **Prediction prompt**: Before designing, predict: how many endpoints will the loyalty API need?
- **Ask the room (opening)**: What makes an API "good"? What makes it frustrating to use?
- **Ask the room (closing)**: What's one API design rule you'll follow from now on?
- **Checkpoint quiz**: (1) POST vs PUT — when to use each? (2) What's a 409 Conflict? (3) Why should error responses have a consistent structure?
- **Cross-area connection**: API design determines query patterns (Database — what the API can return efficiently). API latency is an SLO concern (Cloud & Observability).
- **Cheat sheet items**: HTTP method decision tree, common status codes (200/201/400/404/409/500), resource naming conventions, error response JSON template

### SD-A3: Designing a feature end-to-end

- **Topic**: API contract → domain logic → persistence, vertical slice ownership
- **Theory (credit scoring)**: Design "add score explanation" feature — full vertical slice.
- **Planted blocker**: _Redemption succeeds but points not deducted._ RedemptionService and PointsService use separate transactions (REQUIRES_NEW). If points deduction throws exception, redemption is already committed. Fix: single transaction boundary.
- **Core exercise**: Design "redeem reward" feature: API → domain → persistence. Write specs.
- **Medium exercise**: Handle concurrent redemptions for limited-inventory rewards.
- **Hard exercise**: Retrospect on a recent team feature. Was the vertical slice clean?
- **Between sessions**: Design "gift points" feature end-to-end.
- **Prediction prompt**: Before designing, predict: what's the hardest edge case in the redemption flow?
- **Ask the room (opening)**: When you start a feature, where do you begin — API, domain logic, or database?
- **Ask the room (closing)**: What's one design step you usually skip that you'll include next time?
- **Checkpoint quiz**: (1) What's a vertical slice? (2) Why is REQUIRES_NEW dangerous for related operations? (3) What's optimistic locking?
- **Cross-area connection**: Transaction boundaries relate to database isolation (Database). Feature design affects memory through caching decisions (Memory Management).
- **Cheat sheet items**: Vertical slice checklist (API contract, domain logic, persistence, transaction boundary, error handling, tests), @Transactional propagation options

### SD-A4: Design patterns in practice

- **Topic**: Strategy, Builder, Factory in real service code
- **Theory (credit scoring)**: Strategy for scoring algorithms, Builder for ScoreResult, Factory for ScoringStrategy.
- **Planted blocker**: _Strategy pattern loads wrong implementation._ List<TierStrategy> order is undefined. Both strategies' supports() returns true due to bug (checks wrong config field). Fix: fix predicate + add @Order.
- **Core exercise**: Implement 3 patterns in loyalty: Strategy (tier calc), Builder (RewardOffer), Factory (PointsCalculator).
- **Medium exercise**: Refactor if/else chain to Strategy. Add new strategy without modifying existing code.
- **Hard exercise**: Find a missing pattern in your team's codebase. Write refactoring proposal.
- **Between sessions**: Add ActivityBased tier strategy without modifying existing strategies.
- **Prediction prompt**: Before implementing, predict: which pattern will simplify the code the most?
- **Ask the room (opening)**: What design patterns do you use most frequently? Which feel overused?
- **Ask the room (closing)**: When is a pattern not worth the abstraction cost?
- **Checkpoint quiz**: (1) What problem does the Strategy pattern solve? (2) When is Builder better than a constructor? (3) How does Spring discover all @Component implementations of an interface?
- **Cross-area connection**: Design patterns affect how code allocates objects (Memory Management — Builder creates intermediate objects). Pattern choice influences testability.
- **Cheat sheet items**: Strategy pattern template (interface + implementations + resolver), Builder pattern template, Factory with Spring @Autowired List<Interface>, @Order annotation

### SD-A5: Service integration — sync vs async

- **Topic**: HTTP vs Kafka, trade-offs, failure handling, when to use which
- **Theory (credit scoring)**: Sync call to bureau (need result) vs async Kafka to credit lifecycle (fire and forget).
- **Planted blocker**: _Kafka consumer silently drops events._ Topic name mismatch: producer publishes to "payment.completed" but consumer subscribes to "payment-completed" (dot vs hyphen). No errors. Fix: verify topic name matches.
- **Core exercise**: Implement sync (payment verification) and async (points earned event) integrations. Handle: payment service down, Kafka down.
- **Medium exercise**: Convert slow sync call to async with Kafka. Implement state machine.
- **Hard exercise**: Review your team's integrations. Assess sync vs async choices.
- **Between sessions**: Design error handling for async earn-points flow with timeout compensation.
- **Prediction prompt**: Before implementing, predict: which integration will be harder to get right?
- **Ask the room (opening)**: How does your team decide between REST calls and Kafka events?
- **Ask the room (closing)**: What's the biggest risk with async communication that sync avoids?
- **Checkpoint quiz**: (1) What's at-least-once delivery? (2) Why is a Kafka topic name mismatch silent? (3) When is sync communication the better choice?
- **Cross-area connection**: Kafka integration affects memory through consumer buffers (Memory Management). Message ordering requires partition key design (Database — domain key selection).
- **Cheat sheet items**: Sync vs async decision matrix, Kafka producer/consumer Spring Boot config template, error handling patterns (retry, DLQ, compensation), state machine for async flows

### SD-A6: Writing useful ADRs

- **Topic**: Architecture Decision Records — context, alternatives, decision, consequences
- **Theory (credit scoring)**: ADR for score model versioning.
- **Planted blocker**: _ADR is biased — missing a viable alternative._ "Hard delete" dismissed as "obviously wrong" but is actually simplest for compliance. Fix: rewrite each alternative with genuine pros/cons.
- **Core exercise**: Write ADR for loyalty point expiry strategy.
- **Medium exercise**: Trace consequences across other system components. Identify reversible vs one-way doors.
- **Hard exercise**: Write retroactive ADR for a recent team decision.
- **Between sessions**: Read and provide feedback on two other participants' ADRs.
- **Prediction prompt**: Before writing, predict: which alternative will you choose? Why?
- **Ask the room (opening)**: Does your team write ADRs? Where do they live?
- **Ask the room (closing)**: What makes a rejected alternative still valuable in an ADR?
- **Checkpoint quiz**: (1) What are the 4 sections of an ADR? (2) What's a one-way door decision? (3) Should an ADR argue for the chosen option or present all fairly?
- **Cross-area connection**: ADRs document database schema decisions (Database), infrastructure choices (Cloud & Observability), and JVM configuration decisions (Memory Management).
- **Cheat sheet items**: ADR template (title, status, context, decision, consequences), common triggers for ADRs, "fairness check" for alternatives

### SD-A7: SOLID principles applied

- **Topic**: SRP, DIP, OCP in real service code
- **Theory (credit scoring)**: SRP, DIP violations in ScoreService. Walk through refactoring.
- **Planted blocker**: _Refactored code passes tests but fails at runtime._ New NotificationService class is in a package not covered by @ComponentScan. Fix: move class to scanned package or extend @ComponentScan.
- **Core exercise**: Find 3 SOLID violations in loyalty PointsService. Refactor. Verify tests pass.
- **Medium exercise**: Refactor tier calculation to follow OCP with Spring auto-discovery.
- **Hard exercise**: Review a class in your team for SRP violation. Write refactoring plan.
- **Between sessions**: Reassess loyalty PointsService after refactoring.
- **Prediction prompt**: Before looking, predict: how many SOLID violations does PointsService have?
- **Ask the room (opening)**: Which SOLID principle do you find most useful in practice?
- **Ask the room (closing)**: When does following SOLID hurt more than it helps?
- **Checkpoint quiz**: (1) What's single responsibility at the service level? (2) What does dependency inversion look like in Spring? (3) How does @ComponentScan find beans?
- **Cross-area connection**: Service decomposition affects database transaction boundaries (Database). Class count affects Metaspace usage (Memory Management).
- **Cheat sheet items**: SOLID one-liner explanations, Spring @ComponentScan behavior, refactoring steps (extract interface → create implementation → inject), common SRP violation indicators

### SD-A8: DDD basics for BaaS domains

- **Topic**: Entities, Value Objects, Aggregates, Repositories
- **Theory (credit scoring)**: Score (Entity), ScoreRange (VO), CreditApplication (Aggregate).
- **Planted blocker**: _Value Object comparison fails._ Points.of(100, "SEK").equals(Points.of(100, "SEK")) returns false. Missing equals/hashCode — Java uses reference equality. Fix: implement equals/hashCode or use Java record.
- **Core exercise**: Model loyalty domain: Member (Entity), Points (VO), LoyaltyAccount (Aggregate). Implement. Test.
- **Medium exercise**: Should Reward be inside LoyaltyAccount or separate aggregate? Model both. Write trade-off analysis.
- **Hard exercise**: Model one bounded context from your team using DDD patterns.
- **Between sessions**: Add RedemptionRequest entity. Decide aggregate placement.
- **Prediction prompt**: Before modeling, predict: how many aggregates does the loyalty domain need?
- **Ask the room (opening)**: What's the difference between an Entity and a Value Object? Can you give an example from your domain?
- **Ask the room (closing)**: Where would you draw the aggregate boundary in your team's domain?
- **Checkpoint quiz**: (1) What makes a Value Object different from an Entity? (2) What's an aggregate root? (3) Why do aggregate boundaries matter for transactions?
- **Cross-area connection**: Aggregate boundaries define transaction scope (Database). Aggregate design affects memory through entity loading strategy (Memory Management).
- **Cheat sheet items**: Entity vs VO vs Aggregate comparison, Java record for VOs, aggregate boundary decision criteria, JPA annotation mapping to DDD concepts

### SD-A9: Design challenge — new loyalty capability

- **Topic**: Team exercise — full vertical slice
- **Theory (credit scoring)**: N/A — capstone.
- **Planted blocker**: _Partnership earn rate applied incorrectly._ Cross-partner earn multiplies rates (A×B) instead of using earning partner's rate. Fix: clarify domain rule + add cross-partner test case.
- **Core exercise**: Design partnership feature: cross-partner earn, configurable rates, settlement. Present.
- **Medium exercise**: Write ADR for key decision. Add feature toggle strategy.
- **Hard exercise**: Compare your design to how a similar feature works in your team.
- **Between sessions**: Write architectural vision for loyalty service.
- **Prediction prompt**: Before designing, each member writes: what's the hardest part of this brief?
- **Ask the room (opening)**: N/A — teams start immediately.
- **Ask the room (closing)**: What's one thing another team's design did better?
- **Checkpoint quiz**: N/A — capstone.
- **Cross-area connection**: Partnership feature needs database schema (Database), memory for partner config caching (Memory Management), and monitoring (Cloud & Observability).
- **Cheat sheet items**: Feature design checklist (API, domain model, persistence, integration, error handling, tests, ADR)

---

## SD Track B: Practitioner → Adept (L2 → L3)

Entry: Completed Track A capstone (or self-assessed at L2). Exit: Confidence at L3.

### SD-B1: Cross-domain workflows

- **Topic**: Features spanning credit + scoring + fincrime + notifications
- **Theory (credit scoring)**: Map full workflow across 5 services. All integration points and failure modes.
- **Planted blocker**: _Notification sent before points committed._ Kafka event published inside transaction, before commit. Notification service consumes and sends immediately. Fix: use @TransactionalEventListener(phase=AFTER_COMMIT) or Outbox pattern.
- **Core exercise**: Map loyalty cross-domain workflow. Sequence diagram. Integration types. Failure modes.
- **Medium exercise**: Payment refunded after points committed. Design compensation logic.
- **Hard exercise**: Map a cross-domain workflow in your team. Document failure points.
- **Between sessions**: Identify blast radius of each failure in the loyalty workflow.
- **Prediction prompt**: Before mapping, predict: how many failure points exist in the workflow?
- **Ask the room (opening)**: What's the most complex cross-service workflow your team owns?
- **Ask the room (closing)**: What's the biggest reliability gap in your cross-service workflows?
- **Checkpoint quiz**: (1) What's the difference between orchestration and choreography? (2) What's a compensation action? (3) Why is dual-write dangerous?
- **Cross-area connection**: Cross-service flows create distributed traces (Cloud & Observability). Each service hop adds latency and memory overhead (Memory Management).
- **Cheat sheet items**: Workflow mapping template, failure mode categories (timeout, error, partial success), compensation pattern, @TransactionalEventListener usage

### SD-B2: Sagas and the Outbox pattern

- **Topic**: Orchestrated vs choreographed sagas, compensation, reliable Kafka publishing
- **Theory (credit scoring)**: Choreographed saga for application → scoring → fincrime → decision. Outbox pattern for reliable publishing.
- **Planted blocker**: _Saga compensation creates negative inventory._ Compensation runs twice (at-least-once Kafka). Inventory goes from 0→1→2. Fix: make compensation idempotent — check state before applying.
- **Core exercise**: Implement redemption saga with compensation handlers.
- **Medium exercise**: Convert to orchestrated saga. Implement outbox pattern.
- **Hard exercise**: Identify "hope-based consistency" in your team. Propose saga.
- **Between sessions**: Test saga with artificial failures. Verify compensation.
- **Prediction prompt**: Before implementing, predict: which compensation handler will be hardest to make idempotent?
- **Ask the room (opening)**: What happens in your team when a multi-service operation partially fails?
- **Ask the room (closing)**: Orchestrated or choreographed — which fits your domain better?
- **Checkpoint quiz**: (1) What's the Outbox pattern solving? (2) Why must compensation be idempotent? (3) What's the difference between orchestrated and choreographed sagas?
- **Cross-area connection**: Outbox table is a database concern (Database — table design, cleanup). Saga state affects memory through in-flight tracking (Memory Management).
- **Cheat sheet items**: Saga state machine template, outbox table DDL, compensation handler pattern, idempotent compensation check

### SD-B3: Idempotency design

- **Topic**: Idempotency keys, deduplication, safe retries
- **Theory (credit scoring)**: Duplicate scoring prevented with idempotency key.
- **Planted blocker**: _Idempotency check passes but still creates duplicate._ Two concurrent requests both SELECT (no existing key), both INSERT. Check-then-insert is not atomic. Fix: UNIQUE constraint + ON CONFLICT DO NOTHING or SELECT FOR UPDATE.
- **Core exercise**: Implement idempotency for duplicate Kafka events. Test with 3x same event.
- **Medium exercise**: Design HTTP idempotency: client-generated key, server cache, handle in-flight duplicates.
- **Hard exercise**: Review your team's most important write endpoint for idempotency.
- **Between sessions**: Add cleanup job and monitoring for idempotency records.
- **Prediction prompt**: Before testing, predict: will the duplicate check catch all 3 identical events?
- **Ask the room (opening)**: If a client retries your API, does it create duplicate records?
- **Ask the room (closing)**: What's the simplest way to make your most important endpoint idempotent?
- **Checkpoint quiz**: (1) Why is check-then-insert not sufficient for idempotency? (2) What does ON CONFLICT DO NOTHING do? (3) How long should idempotency keys be retained?
- **Cross-area connection**: Idempotency keys are stored in the database (Database — unique constraint). Idempotency cache affects memory (Memory Management).
- **Cheat sheet items**: Idempotency key implementation (UNIQUE constraint + ON CONFLICT), HTTP idempotency header pattern, Kafka deduplication with idempotency table, cleanup job template

### SD-B4: Aggregate design and consistency boundaries

- **Topic**: What's inside the aggregate vs external references, eventual consistency
- **Theory (credit scoring)**: CreditApplication aggregate boundaries.
- **Planted blocker**: _Aggregate invariant violated — points balance negative._ Concurrent earn and burn both pass validation with Read Committed. Fix: SELECT FOR UPDATE or @Version optimistic locking with retry.
- **Core exercise**: Design loyalty aggregate boundaries. Implement with JPA. Write consistency test.
- **Medium exercise**: Cross-aggregate redemption (points + inventory). Evaluate approaches without violating boundaries.
- **Hard exercise**: Review aggregate boundary in your team's domain.
- **Between sessions**: Design point pooling feature. How does it change aggregate boundaries?
- **Prediction prompt**: Before designing, predict: how many aggregates does the loyalty domain need?
- **Ask the room (opening)**: What's inside vs outside a consistency boundary in your domain?
- **Ask the room (closing)**: What's the cost of making an aggregate too large? Too small?
- **Checkpoint quiz**: (1) What's the consistency guarantee within an aggregate? (2) What's eventual consistency between aggregates? (3) What does @Version do in JPA?
- **Cross-area connection**: Aggregate boundaries define transaction scope (Database — SELECT FOR UPDATE). Large aggregates consume more memory when loaded (Memory Management).
- **Cheat sheet items**: Aggregate boundary decision criteria, JPA @Version optimistic locking, SELECT FOR UPDATE pattern, eventual consistency with domain events

### SD-B5: Event-driven architecture with Kafka

- **Topic**: Event schemas, topic design, consumer groups, ordering, out-of-order handling
- **Theory (credit scoring)**: Kafka topic structure for scoring events.
- **Planted blocker**: _Events processed out of order — tier downgraded then upgraded._ Events partitioned by topic (default), not by member_id. Two events for same member on different partitions. Fix: set partition key to member_id.
- **Core exercise**: Design loyalty Kafka topics. Define schemas. Implement producers and consumers.
- **Medium exercise**: Handle out-of-order point events with sequence numbers or timestamp buffer.
- **Hard exercise**: Review your team's Kafka topic design for ordering guarantees.
- **Between sessions**: Add backward-compatible schema evolution to loyalty events.
- **Prediction prompt**: Before testing, predict: will events arrive in order? Why or why not?
- **Ask the room (opening)**: How does your team handle message ordering in Kafka?
- **Ask the room (closing)**: What's the most important thing to get right in Kafka topic design?
- **Checkpoint quiz**: (1) What guarantees does Kafka provide within a partition? (2) What's a consumer group? (3) How do you achieve ordering for a specific entity?
- **Cross-area connection**: Kafka partitioning affects consumer thread count (Memory Management). Event schemas are a contract (Cloud & Observability — trace context in headers).
- **Cheat sheet items**: Kafka topic naming conventions, partition key selection guide, event schema template (JSON), backward-compatible schema evolution rules

### SD-B6: Audit trail design for regulation

- **Topic**: Event sourcing vs audit columns vs separate log, SOX/PCI-DSS
- **Theory (credit scoring)**: 3 audit approaches for score decisions.
- **Planted blocker**: _Audit log shows wrong "before" value._ Concurrent point earn commits between audit reading "before" and adjustment writing "after." Fix: read and write in same transaction, or compute "before" from event log.
- **Core exercise**: Implement 2 audit approaches for loyalty points. Compare.
- **Medium exercise**: Design event-sourced points ledger. Implement projection query.
- **Hard exercise**: Review your team's audit trail for regulatory compliance.
- **Between sessions**: Write audit query: member X balance on March 1 with transaction history.
- **Prediction prompt**: Before implementing, predict: which approach will be easier to query? Which harder to circumvent?
- **Ask the room (opening)**: How does your team handle audit trails? Has an auditor ever tested it?
- **Ask the room (closing)**: What's the weakest point in your team's audit implementation?
- **Checkpoint quiz**: (1) Event sourcing vs audit columns — when to use each? (2) What makes an audit log tamper-resistant? (3) What does SOX require for financial transaction records?
- **Cross-area connection**: Audit tables grow with traffic (Database — capacity planning). Audit log writes add memory pressure (Memory Management).
- **Cheat sheet items**: Audit columns template, event sourcing pattern, audit log tamper-resistance techniques, SOX retention requirements summary

### SD-B7: Outbox pattern deep dive

- **Topic**: Why dual-write fails, outbox table design, polling vs CDC
- **Theory (credit scoring)**: Dual-write problem demo. Outbox pattern solution.
- **Planted blocker**: _Outbox poller publishes events in wrong order._ IDs assigned at INSERT, not COMMIT. Slow transaction gets low ID but commits late. Fix: order by created_at (set at commit time) or use commit-ordered sequence.
- **Core exercise**: Implement outbox pattern for loyalty service. Build @Scheduled poller.
- **Medium exercise**: Compare polling vs CDC. Implement CDC simulation.
- **Hard exercise**: Identify dual-write in your team. Write outbox migration proposal.
- **Between sessions**: Add monitoring: unpublished count, publish latency, failure rate.
- **Prediction prompt**: Before implementing, predict: what happens if the poller crashes mid-publish?
- **Ask the room (opening)**: Does your team have any dual-write patterns? Where?
- **Ask the room (closing)**: Polling or CDC — which would you choose for your team and why?
- **Checkpoint quiz**: (1) What's the dual-write problem? (2) How does the outbox table solve it? (3) What's the difference between polling and CDC for outbox processing?
- **Cross-area connection**: Outbox table is a database design concern (Database). CDC relates to infrastructure (Cloud & Observability — Debezium deployment).
- **Cheat sheet items**: Outbox table DDL, @Scheduled poller template, CDC vs polling comparison, monitoring queries for outbox health

### SD-B8: Coupling analysis

- **Topic**: Shared database, API coupling, event coupling, contract testing
- **Theory (credit scoring)**: Shared database anti-pattern. Refactor to events.
- **Planted blocker**: _Pact contract test passes locally, fails in CI._ CI runs strict mode. Payment service added required field (processing_fee). Fix: update consumer Pact to include new field.
- **Core exercise**: Analyze loyalty service coupling. Rate each integration. Propose mitigations.
- **Medium exercise**: Implement Pact contract testing for loyalty → payment.
- **Hard exercise**: Map coupling in your team. Identify tightest point. Write decoupling proposal.
- **Between sessions**: Design event-driven migration to break shared "members" table.
- **Prediction prompt**: Before analyzing, predict: which integration point has the tightest coupling?
- **Ask the room (opening)**: What does "coupling" mean in practice for your team's deploy frequency?
- **Ask the room (closing)**: What's the highest-ROI decoupling you could do for your team?
- **Checkpoint quiz**: (1) What's the shared database anti-pattern? (2) How does contract testing differ from integration testing? (3) What's the cost of event coupling vs API coupling?
- **Cross-area connection**: Shared databases are a database concern (Database — schema ownership). Contract tests run in CI (Cloud & Observability — pipeline design).
- **Cheat sheet items**: Coupling assessment matrix (tight/medium/loose), Pact consumer test template, decoupling patterns (events, ACL, separate DB), shared database migration steps

### SD-B9: Design challenge — multi-domain loyalty

- **Topic**: Team exercise — payments + credit + partner notification
- **Theory (credit scoring)**: N/A — capstone.
- **Planted blocker**: _Cash-back creates infinite event loop._ Payment → points → Gold tier → cash-back credit → triggers loyalty again (earn points on credit) → loop. Fix: add transaction_type field, ignore "cashback_credit" events.
- **Core exercise**: Design loyalty cash-back spanning 3 services. Event flow, saga, idempotency, audit.
- **Medium exercise**: Peer critique: saga correctness, audit sufficiency, duplicate handling.
- **Hard exercise**: Polish strongest ADR as Track B exit artifact.
- **Between sessions**: Write reflection on design thinking growth.
- **Prediction prompt**: Before designing, predict: where will the most complex failure mode be?
- **Ask the room (opening)**: N/A — teams start immediately.
- **Ask the room (closing)**: What design mistake would you catch now that you'd have missed before Track B?
- **Checkpoint quiz**: N/A — capstone.
- **Cross-area connection**: Cash-back spans database transactions (Database), service memory (Memory Management), and distributed tracing (Cloud & Observability).
- **Cheat sheet items**: Multi-service design checklist (event flow, saga, idempotency, audit, error handling, infinite loop prevention)

---

## SD Track C: Adept → Veteran (L3 → L4)

Entry: Completed Track B capstone (or self-assessed at L3). Exit: Confidence at L4.

### SD-C1: End-to-end BaaS architecture

- **Topic**: Full architecture: API → domain → integration → deployment
- **Planted blocker**: _Architecture hides SPOF._ 3 API replicas, 3 service replicas, but only 1 Cloud SQL with no HA. Fix: mark each component's redundancy, explicitly label accepted SPOFs.
- **Core exercise**: Produce full loyalty architecture. Component responsibilities, technologies, failure modes.
- **Medium exercise**: Design 10x scaling strategy for promotions. Identify bottleneck.
- **Hard exercise**: Produce comparable architecture diagram for your team.
- **Between sessions**: Present to colleague. Refine based on questions.

### SD-C2: Regulatory design constraints

- **Topic**: PSD2, SOX, PCI-DSS as first-class design concerns
- **Planted blocker**: _GDPR "right to delete" conflicts with SOX "retain 7 years."_ Fix: pseudonymize — replace PII with anonymized tokens, delete mapping table.
- **Core exercise**: Apply 3 regulatory constraints to loyalty architecture. Write fitness functions.
- **Medium exercise**: Remove PCI scope by extracting card data to tokenization service.
- **Hard exercise**: Review your team's regulatory architecture.
- **Between sessions**: Present regulatory design to compliance team member.

### SD-C3: Anti-corruption layers for integrations

- **Topic**: Wrapping external APIs, adapters, circuit breakers
- **Planted blocker**: _ACL adapter swallows errors — returns empty result._ catch(Exception) returns empty catalog. Partner B rewards disappear from catalog. Fix: propagate meaningful errors, catch only transient network errors.
- **Core exercise**: Design ACL for 3 partners (REST, SOAP, batch CSV). Implement one adapter.
- **Medium exercise**: Handle partners with different latencies. Unified interface.
- **Hard exercise**: Identify integration lacking ACL. Write refactoring proposal.
- **Between sessions**: Add Partner D (GraphQL) without modifying existing code.

### SD-C4: Build vs buy evaluation

- **Topic**: Criteria, TCO, vendor risk, compliance
- **Planted blocker**: _TCO ignores integration and migration cost._ Vendor $50K/year vs build $200K/year. But vendor TCO misses $80K integration + $30K/year maintenance + $40K migration + $20K compliance = $220K. Fix: include all costs.
- **Core exercise**: Build vs buy for loyalty reward fulfillment.
- **Medium exercise**: Quantify PCI compliance cost of vendor cloud.
- **Hard exercise**: Apply framework to a decision your team faces.
- **Between sessions**: Present to simulated leadership audience.

### SD-C5: Evolutionary architecture

- **Topic**: Strangler fig, parallel runs, feature toggles
- **Planted blocker**: _Parallel run shows 2% discrepancy — unclear which system is correct._ Legacy uses FLOAT (rounding error). New system uses NUMERIC (correct). Stakeholders don't trust new system. Fix: prove legacy bug with specific examples.
- **Core exercise**: Design strangler fig for legacy → event-driven loyalty migration.
- **Medium exercise**: Implement reconciliation job. Define cutover criteria.
- **Hard exercise**: Design strangler fig for a migration your team needs.
- **Between sessions**: Design per-partner feature toggle for migration.

### SD-C6: Cross-team API contract negotiation

- **Topic**: Versioning, breaking changes, consumer-driven contracts
- **Planted blocker**: _API versioning breaks one consumer, fixes another._ Consumer B sends Accept: application/json (no version), defaults to v2 (breaking). Fix: default unversioned to v1, require explicit v2 header.
- **Core exercise**: Design backward-compatible event evolution. Verify consumer contracts.
- **Medium exercise**: Handle breaking change request. Implement versioning with adapter.
- **Hard exercise**: Identify API contract tension in your team. Write negotiation document.
- **Between sessions**: Set up Pact contract tests between loyalty and one consumer.

### SD-C7: Design review practice

- **Topic**: Structured checklist, actionable feedback
- **Planted blocker**: _Design looks correct on paper but fails under load._ Review misses: Kafka topic with 1 partition → only 1 consumer processes. Fix: add "concurrency model" to checklist.
- **Core exercise**: Review another participant's design. Write 3 actionable items.
- **Medium exercise**: Review real design from another team.
- **Hard exercise**: Write design review checklist from all reviews.
- **Between sessions**: Follow up on feedback outcomes.

### SD-C8: DDD strategic patterns — context mapping

- **Topic**: Bounded contexts, conformist, ACL, open host
- **Planted blocker**: _Context map shows wrong relationship._ Loyalty labeled "Conformist" to payment but payment schema leaks into loyalty domain. Fix: should be ACL.
- **Core exercise**: Draw context map for loyalty platform. Label relationships.
- **Medium exercise**: Migrate conformist to ACL. What changes in code and team dynamics?
- **Hard exercise**: Draw context map for your domain. Identify wrong-pattern relationships.
- **Between sessions**: Analyze where new partner channel fits on context map.

### SD-C9: Architecture decision forum

- **Topic**: Present, peer review board
- **Planted blocker**: _Architecture is technically sound but organizationally infeasible._ No team owns event schema registry, Kafka cluster, or ACL adapters. Fix: add "organizational prerequisites" section.
- **Core exercise**: Present strongest design. Group critiques.
- **Medium exercise**: Select highest-impact designs for org decision log.
- **Hard exercise**: Synthesize "Solution Design Playbook."
- **Between sessions**: Write letter to past self. Exit artifact.

---

# CLOUD & OBSERVABILITY

## CO Track A: Foundations → Practitioner (L1 → L2)

Entry: Self-assessment at L1. Exit: Confidence at L2.

### CO-A1: Where your service runs

- **Topic**: GKE pods, Cloud SQL, Kafka — deployment landscape
- **Theory (credit scoring)**: Walk through Docker → GKE → Cloud SQL → Kafka deployment.
- **Planted blocker**: _Pod can't reach Cloud SQL — connection refused._ Cloud SQL Auth Proxy sidecar hasn't started yet. Main container starts first. Fix: add initContainer that waits for proxy port, or startup probe with retry.
- **Core exercise**: Map loyalty service deployment. Draw deployment diagram.
- **Medium exercise**: Diagnose CrashLoopBackOff from misconfigured Auth Proxy. Fix manifest.
- **Hard exercise**: Map one of your team's services. Draw deployment diagram for onboarding.
- **Between sessions**: Extend diagram with ConfigMap, Secret, Service.
- **Prediction prompt**: Before mapping, predict: how many containers run in the loyalty pod?
- **Ask the room (opening)**: Can you describe where your service runs without looking at any docs?
- **Ask the room (closing)**: What's one thing about your service's deployment you didn't know before today?
- **Checkpoint quiz**: (1) What's a pod in Kubernetes? (2) What does Cloud SQL Auth Proxy do? (3) What's a sidecar container?
- **Cross-area connection**: The deployment topology determines database connectivity (Database — Auth Proxy). Container resources affect JVM behavior (Memory Management).
- **Cheat sheet items**: GKE deployment diagram template, kubectl get pods/describe pod commands, Auth Proxy connection string, sidecar container concept

### CO-A2: Docker and container basics

- **Topic**: Dockerfile, building, running locally
- **Planted blocker**: _Container exits immediately after build._ ENTRYPOINT references /app/app.jar but COPY put it at /app/application.jar. Error goes to stderr. Fix: match paths. Use docker logs.
- **Core exercise**: Build loyalty Docker image. Run with docker-compose. Verify health endpoint.
- **Medium exercise**: Optimize: multi-stage build, slim JRE, layer caching. Measure size reduction.
- **Hard exercise**: Review your team's Dockerfile for optimization.
- **Between sessions**: Add HEALTHCHECK instruction. Understand K8s probe interaction.

### CO-A3: Reading Grafana dashboards

- **Topic**: CPU, memory, error rate, latency — healthy vs unhealthy
- **Planted blocker**: _Dashboard shows 100% CPU but service feels fine._ CPU metric shows usage as % of REQUEST (100m), not LIMIT (500m). Actual usage is 20% of limit. Fix: change query to use limit.
- **Core exercise**: Assess 6 loyalty dashboard panels. One-sentence evaluation per panel.
- **Medium exercise**: Investigate recurring CPU spike pattern. Correlate with batch job.
- **Hard exercise**: Find unexplained pattern in your team's dashboards. Investigate.
- **Between sessions**: Create dashboard reading guide for loyalty service.

### CO-A4: Kubernetes manifests and configuration

- **Topic**: Deployments, Services, ConfigMaps, Secrets
- **Planted blocker**: _ConfigMap change doesn't take effect._ kubectl apply updates ConfigMap but pods aren't restarted. Fix: kubectl rollout restart or use configmap hash annotation.
- **Core exercise**: Read loyalty K8s manifests. Answer 5 "what if" questions.
- **Medium exercise**: Add readiness probe, liveness probe, resource requests/limits. Deploy and verify.
- **Hard exercise**: Review your team's K8s manifests for missing configuration.
- **Between sessions**: Add new environment variable via ConfigMap.

### CO-A5: Centralized logging

- **Topic**: Finding errors, filtering, structured logging
- **Planted blocker**: _Error log shows no stack trace._ log.error("Failed") without exception object. Fix: log.error("Failed", e) — pass exception as last argument.
- **Core exercise**: Find 3 planted errors in loyalty logs. Document each.
- **Medium exercise**: Refactor to structured JSON logging. Verify filter by memberId.
- **Hard exercise**: Review your team's logging. Can you trace a request end-to-end?
- **Between sessions**: Add correlation ID to loyalty logs via MDC.

### CO-A6: Terraform basics

- **Topic**: Resources, variables, state, modules
- **Planted blocker**: _Terraform apply fails — resource already exists._ Instance created manually in Console, not in state. Fix: terraform import.
- **Core exercise**: Write Terraform for loyalty Cloud SQL, IAM, GCS bucket. Plan and apply.
- **Medium exercise**: Refactor to variables, tfvars per environment, simple module.
- **Hard exercise**: Review your team's Terraform for modularization.
- **Between sessions**: Add read replica to loyalty Terraform.

### CO-A7: Application metrics with Micrometer

- **Topic**: Counters, gauges, timers, histograms
- **Planted blocker**: _Timer always shows 0ms._ Timer.record() measures time to submit to async executor, not actual calculation. Fix: move Timer.record() inside async method or use Timer.Sample.
- **Core exercise**: Add 4 Micrometer metrics to loyalty service. Verify in Actuator and PromQL.
- **Medium exercise**: Create 6-panel Grafana dashboard from loyalty metrics. Add one alert.
- **Hard exercise**: Add one custom metric to your team's service.
- **Between sessions**: Write PromQL queries for 3 loyalty metrics.

### CO-A8: Troubleshooting pods with kubectl

- **Topic**: describe, logs, exec, port-forward
- **Planted blocker**: _kubectl exec fails — "container not found."_ Pod has 2 containers (app + sidecar). Exec defaults to first alphabetically (sidecar). Fix: specify container with -c flag.
- **Core exercise**: Diagnose 4 failing loyalty pods, each with different problem.
- **Medium exercise**: Diagnose slow pod: kubectl top, check throttling, exec to check JVM.
- **Hard exercise**: Document kubectl troubleshooting for your team's next pod failure.
- **Between sessions**: Create kubectl cheat sheet for loyalty service.

### CO-A9: Service deployment end-to-end

- **Topic**: Team exercise — deploy, verify, monitor, troubleshoot
- **Planted blocker**: _Rolling update causes 30s of 503s._ Readiness probe passes (actuator health = UP) but HikariCP pool not warm (30s warmup). Fix: custom readiness probe checking DB connectivity, or initialDelaySeconds.
- **Core exercise**: Deploy loyalty from scratch. Find and fix 2 planted issues.
- **Medium exercise**: Rolling update with zero downtime. Monitor transition.
- **Hard exercise**: Compare with your team's deployment. Write improvement proposal.
- **Between sessions**: Write deployment checklist. Track A exit artifact.

---

## CO Track B: Practitioner → Adept (L2 → L3)

Entry: Completed Track A capstone (or self-assessed at L2). Exit: Confidence at L3.

### CO-B1: Distributed tracing with OpenTelemetry

- **Topic**: Traces, spans, context propagation across HTTP and Kafka
- **Planted blocker**: _Trace breaks at Kafka._ Downstream spans orphaned (different trace ID). Kafka producer doesn't inject trace context into headers. Fix: add opentelemetry-instrumentation-kafka.
- **Core exercise**: Instrument loyalty service. View trace. Verify propagation.
- **Medium exercise**: Add trace propagation through Kafka to notification service.
- **Hard exercise**: Check your team's trace propagation across all boundaries.
- **Between sessions**: Add custom spans for tier calc, partner callout, cache lookup.

### CO-B2: SLIs, SLOs, and error budgets

- **Topic**: Defining "healthy" with numbers
- **Planted blocker**: _SLO shows 100% availability but users complaining._ Health check requests (95% of traffic) mask 5% error rate on real requests. Fix: exclude health endpoints from SLI.
- **Core exercise**: Define SLIs/SLOs for loyalty. Write PromQL. Calculate error budget.
- **Medium exercise**: Batch spikes affect SLO. Decide: exclude batch?
- **Hard exercise**: Define SLIs/SLOs for your team's service.
- **Between sessions**: Build SLO dashboard for loyalty.

### CO-B3: Alerting that works

- **Topic**: Severity, routing, runbooks, noise reduction
- **Planted blocker**: _P1 alert fires at 3am — known batch spike._ Nightly batch job always produces 8% errors during first minute (Kafka rebalance). Fix: suppress during batch window or require 5% for >5min.
- **Core exercise**: Design 6 alerts: PromQL condition, routing, runbook per alert.
- **Medium exercise**: Redesign "memory >80%" false positive.
- **Hard exercise**: Audit your team's alerting. Write improvement proposal.
- **Between sessions**: Write runbooks for 3 most important loyalty alerts.

### CO-B4: Trace context propagation deep dive

- **Topic**: HTTP headers, Kafka headers, baggage, W3C Trace Context
- **Planted blocker**: _Baggage works in test, not production._ API gateway strips non-standard headers. "baggage" not in forwarding allowlist. Fix: add to allowlist.
- **Core exercise**: Verify propagation across HTTP, Kafka, and back. Fix broken links.
- **Medium exercise**: Add partnerId baggage. Build Grafana filter.
- **Hard exercise**: Test propagation in your team. Fix broken boundaries.
- **Between sessions**: Design trace-to-business-metric correlation.

### CO-B5: Incident correlation — metrics + logs + traces

- **Topic**: Building complete picture during incidents
- **Planted blocker**: _Metrics show problem, traces show fine — conflicting signals._ Latency metric includes Tomcat queue wait time but trace starts at handler. 95% of latency is queue wait. Fix: add span at servlet filter level.
- **Core exercise**: Investigate staged incident using 3-signal approach. Write timeline.
- **Medium exercise**: Fix missing DB span instrumentation. Find slow query.
- **Hard exercise**: Document next team incident using 3-signal approach.
- **Between sessions**: Build incident investigation dashboard for loyalty.

### CO-B6: Kubernetes resource management

- **Topic**: Requests/limits, HPA, VPA, right-sizing
- **Planted blocker**: _HPA scales to max but latency unchanged._ Bottleneck is Cloud SQL connections (10 pods × 10 pool = 100 = Cloud SQL limit), not CPU. Fix: scale the bottleneck.
- **Core exercise**: Right-size loyalty pods from actual usage data.
- **Medium exercise**: Configure HPA on CPU + custom metric (Kafka consumer lag).
- **Hard exercise**: Analyze your team's pod resources vs actual usage.
- **Between sessions**: Calculate cost of right-sizing across pods.

### CO-B7: Custom OpenTelemetry instrumentation

- **Topic**: Custom spans, attributes, sampling
- **Planted blocker**: _Custom spans don't appear._ Span started but never ended (missing span.end() in finally block). Fix: try-with-resources or explicit finally.
- **Core exercise**: Add 3 custom spans to loyalty. Verify in traces.
- **Medium exercise**: Implement tail-based sampling: 100% errors, 1% success.
- **Hard exercise**: Add one custom span to your team's service.
- **Between sessions**: Generate trace-derived metric: tier calc time by partner.

### CO-B8: Observability cost management

- **Topic**: Cardinality, metric explosion, log volume, sampling
- **Planted blocker**: _Grafana loads for 60 seconds after adding partner label._ 500 partners × 50 existing label combos = 25K series (was 50). Fix: move partner_id to trace attributes, or recording rule.
- **Core exercise**: Identify cardinality contributors. Propose and implement fixes.
- **Medium exercise**: Design cost budget for loyalty observability. Implement log level management.
- **Hard exercise**: Calculate your team's observability cost. Write optimization proposal.
- **Between sessions**: Implement highest-impact optimization.

### CO-B9: Observability design challenge

- **Topic**: Team exercise — full monitoring + alerting + tracing
- **Planted blocker**: _Design has no degradation strategy — all or nothing._ Comprehensive design costs $3K/month, budget $500. Fix: tiered strategy — core (always on), extended (per-service), debug (on-demand), sampling (adjustable).
- **Core exercise**: Design complete observability strategy. Present.
- **Medium exercise**: Peer critique: cardinality, false positives, sampling, runbooks.
- **Hard exercise**: Gap analysis comparing exercise to your team's setup.
- **Between sessions**: Write observability onboarding guide. Track B exit artifact.

---

## CO Track C: Adept → Veteran (L3 → L4)

Entry: Completed Track B capstone (or self-assessed at L3). Exit: Confidence at L4.

### CO-C1: Terraform module design

- **Topic**: Module hierarchy, state management, CI pipeline
- **Planted blocker**: _Terraform state conflict._ Two engineers apply simultaneously. One destroys other's resource (local state, no locking). Fix: remote state (GCS backend) with locking.
- **Core exercise**: Design loyalty Terraform module hierarchy. Implement data module.
- **Medium exercise**: Environment promotion: shared modules, per-env tfvars, CI pipeline.
- **Hard exercise**: Review your team's Terraform structure.
- **Between sessions**: Add observability module.

### CO-C2: Metric cardinality at scale

- **Topic**: Recording rules, label governance, automated alerting
- **Planted blocker**: _Recording rule shows 110% availability._ Overlapping rate() windows during high traffic. Fix: consistent evaluation intervals or avg_over_time.
- **Core exercise**: Identify top 5 cardinality contributors. Implement recording rules.
- **Medium exercise**: Design metric governance policy. Implement cardinality alerting.
- **Hard exercise**: Implement cardinality monitoring for your team.
- **Between sessions**: Write metric design guide.

### CO-C3: Compliance controls in infrastructure

- **Topic**: VPC, IAM, audit logging, PCI-DSS zones
- **Planted blocker**: _IAM role too broad — security review fails._ Service account has roles/editor. Fix: replace with 4 specific roles.
- **Core exercise**: Design loyalty VPC, IAM, audit logging. Implement in Terraform.
- **Medium exercise**: PCI-DSS network segmentation for card-linked data.
- **Hard exercise**: Review your team's compliance controls.
- **Between sessions**: Run simulated audit on loyalty platform.

### CO-C4: High availability architecture

- **Topic**: Multi-AZ, pod disruption budgets, failover, graceful degradation
- **Planted blocker**: _PDB blocks node drain._ minAvailable=3 but only 3 replicas. Can't evict any. Fix: set minAvailable=2 or maxUnavailable=1.
- **Core exercise**: Configure HA: topology spread, PDB, readiness probe, graceful shutdown.
- **Medium exercise**: Graceful degradation: cached data when DB down, local queue when Kafka down.
- **Hard exercise**: Review your team's HA config. Test node drain.
- **Between sessions**: Simulate Cloud SQL failover. Write runbook.

### CO-C5: Chaos engineering

- **Topic**: Fault injection, steady state hypothesis, experiments
- **Planted blocker**: _Chaos experiment targets production._ Pod label app=loyalty-service exists in both staging and prod. Tool's context set to prod cluster. Fix: target by namespace, add env labels, add safety check.
- **Core exercise**: Design and execute 3 chaos experiments. Document results.
- **Medium exercise**: Tune circuit breaker after chaos reveals aggressive tripping.
- **Hard exercise**: Design chaos experiment for your team. Execute in test.
- **Between sessions**: Write quarterly chaos plan for loyalty.

### CO-C6: FinOps — infrastructure cost optimization

- **Topic**: GKE costs, Cloud SQL sizing, storage lifecycle
- **Planted blocker**: _Cost optimization saves money but increases latency 40%._ Downsize Cloud SQL → less CPU and buffer cache → more I/O → 30ms→42ms. Fix: define performance thresholds BEFORE implementing cost changes.
- **Core exercise**: Calculate loyalty monthly cost. Identify 2 optimizations.
- **Medium exercise**: Spot nodes for batch, committed use for steady state. Calculate savings.
- **Hard exercise**: Break down your team's infra cost. Write optimization proposal.
- **Between sessions**: Implement one optimization. Measure savings.

### CO-C7: Cross-team infrastructure review

- **Topic**: Structured checklist, actionable feedback
- **Planted blocker**: _Review misses operational gaps._ Checks Terraform/security/cost but not: monitoring, runbooks, backup, on-call. Component fails after 3 months. Fix: add "operational readiness" to checklist.
- **Core exercise**: Review another participant's infra artifact. Write 3 items.
- **Medium exercise**: Review real infra from another team.
- **Hard exercise**: Synthesize infrastructure review checklist.
- **Between sessions**: Follow up with reviewed team.

### CO-C8: Runbook-driven operations

- **Topic**: Every alert has a runbook, every runbook tested
- **Planted blocker**: _Runbook step requires access on-call doesn't have._ Step 3: "Check Cloud SQL in GCP Console." On-call has only kubectl access. Fix: ensure all steps executable by any on-call, add prerequisites, test with junior.
- **Core exercise**: Write runbooks for loyalty top 5 alerts. Test each.
- **Medium exercise**: Design operational maturity model. Assess current state.
- **Hard exercise**: Assess your team's operational maturity.
- **Between sessions**: Test one existing runbook with junior team member.

### CO-C9: Infrastructure architecture forum

- **Topic**: Present, peer review board
- **Planted blocker**: _Proposal has no rollback plan._ Migration from GKE Autopilot to Standard. Node pool changes can't be easily reversed. Fix: every infra change needs "rollback strategy" section.
- **Core exercise**: Present strongest artifact. Group critiques.
- **Medium exercise**: Select highest-impact proposals for fleet adoption.
- **Hard exercise**: Synthesize "Cloud & Observability Playbook."
- **Between sessions**: Write letter to past self. Exit artifact.

---
