# Level 2 — Practitioner

**Focus:** Designing features end-to-end from schema to migration, and understanding why queries are slow.

## Which of these scenarios can you handle confidently today?

- When I'm building a new feature, I can design the database schema myself — choosing tables, columns, relationships, and constraints — without needing a senior engineer to review the fundamentals.
  `normalization` `foreign key constraints` `NOT NULL` `UNIQUE` `CHECK constraints` `CASCADE` `schema design` `data types`
- When a query is slow, I can run EXPLAIN ANALYZE and understand the output well enough to identify the problem (missing index, bad join strategy, unnecessary sequential scan) and propose a fix.
  `EXPLAIN ANALYZE` `Seq Scan` `Index Scan` `Bitmap Heap Scan` `cost estimates` `actual rows` `planning time` `execution time`
- When I need to add a column, change a type, or add a constraint in production, I can write a migration that won't lock the table or cause downtime — and I think about this before I write the migration, not after.
  `Liquibase` `ADD COLUMN` `ALTER TABLE` `ACCESS EXCLUSIVE lock` `NOT VALID` `VALIDATE CONSTRAINT` `concurrent index creation`
- When choosing between different index strategies for a new table, I can reason about which columns to index, whether a composite index makes sense, and what the write overhead will be.
  `CREATE INDEX CONCURRENTLY` `composite index` `index selectivity` `write amplification` `pg_stat_user_indexes` `index bloat`
- When a bug involves unexpected data states (phantom reads, lost updates), I can reason about which transaction isolation level is in play and whether it's the right choice.
  `READ COMMITTED` `REPEATABLE READ` `SERIALIZABLE` `phantom read` `lost update` `dirty read` `SET TRANSACTION ISOLATION LEVEL`
- When I suspect a query performance issue, I can find the relevant query in Cloud SQL Query Insights and use the data there to confirm or reject my hypothesis.
  `Cloud SQL Query Insights` `pg_stat_statements` `query fingerprint` `mean execution time` `Cloud Monitoring`

## Training Track

Engineers at this level join **Track A: Foundations → Practitioner** together with Level 1 engineers.
