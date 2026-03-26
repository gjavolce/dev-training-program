# Level 3 — Advanced

**Focus:** Handling complex regulated domains, diagnosing production issues, and understanding what's happening under the hood.

## Which of these scenarios can you handle confidently today?

- When I'm designing a schema for a domain with regulatory requirements (audit trails, temporal data, financial ledgers), I can choose the right patterns (soft deletes, audit columns, temporal tables) and explain why to the team.
  `audit table` `temporal tables` `soft delete` `created_at` `updated_at` `deleted_at` `pgaudit` `SOX` `PCI-DSS`
- When queries that used to be fast start degrading over weeks or months, I can investigate whether the cause is table bloat, stale statistics, or autovacuum not keeping up — and I know how to check this on Cloud SQL.
  `autovacuum` `table bloat` `pg_stat_user_tables` `n_dead_tup` `VACUUM ANALYZE` `pg_statistic` `ANALYZE` `dead tuples`
- When I need to make a non-trivial schema change to a table that's actively serving production traffic, I can plan a multi-step migration that avoids locking the table and won't require a maintenance window.
  `ADD COLUMN DEFAULT` `backfill` `NOT VALID` `VALIDATE CONSTRAINT` `trigger-based migration` `Liquibase` `shadow column`
- When the team needs to isolate data between tenants in our multi-tenant BaaS platform, I can design and implement a row-level security strategy rather than relying purely on application-level filtering.
  `ROW LEVEL SECURITY` `CREATE POLICY` `ALTER TABLE ENABLE ROW LEVEL SECURITY` `current_setting` `tenant_id` `SET LOCAL` `security barrier`
- When an incident involves a query that's blocking other queries, I can identify the blocking chain, understand why the lock is held, and determine whether it's safe to terminate the offending transaction.
  `pg_stat_activity` `pg_locks` `pg_blocking_pids()` `wait_event` `idle in transaction` `SELECT pg_terminate_backend()` `lock modes`
- When choosing an indexing strategy for a complex query pattern, I can reach beyond basic B-tree indexes and evaluate whether a partial index, expression index, or covering index would be more effective.
  `partial index` `expression index` `covering index` `INCLUDE` `GIN index` `pg_stat_user_indexes` `index-only scan`

## Training Track

Engineers at this level join **Track B: Advanced → Specialist** together with Level 4 engineers.
