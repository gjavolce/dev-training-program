var QUIZ_DATA = {
  "track": "database",
  "trackLabel": "Database Engineering",
  "trackIcon": "db",
  "levels": [
    {
      "num": 1,
      "name": "Foundations",
      "desc": "Getting data in and out, and understanding how it's organised.",
      "scenarios": [
        "Writing queries that join tables and filter correctly",
        "Tracing how the data model maps to database tables",
        "Spotting ORM-generated SQL problems like N+1 queries",
        "Connecting to Cloud SQL via Auth Proxy",
        "Understanding basic index and transaction concepts"
      ]
    },
    {
      "num": 2,
      "name": "Practitioner",
      "desc": "Designing features end-to-end from schema to migration, and understanding why queries are slow.",
      "scenarios": [
        "Designing schemas independently with correct relationships",
        "Reading EXPLAIN ANALYZE and diagnosing slow queries",
        "Writing safe zero-downtime migrations",
        "Choosing effective indexing strategies",
        "Reasoning about transaction isolation and data anomalies"
      ]
    },
    {
      "num": 3,
      "name": "Advanced",
      "desc": "Handling complex regulated domains, diagnosing production issues, and understanding what's happening under the hood.",
      "scenarios": [
        "Designing schemas for regulated domains (audit, temporal, ledgers)",
        "Diagnosing table bloat, vacuum issues, and degradation over time",
        "Planning zero-downtime migrations on live production tables",
        "Implementing row-level security for multi-tenant isolation",
        "Diagnosing lock contention and blocking queries"
      ]
    },
    {
      "num": 4,
      "name": "Specialist",
      "desc": "Operating at scale, managing platform-level database concerns, and ensuring compliance.",
      "scenarios": [
        "Designing partitioning strategies for large tables",
        "Managing Cloud SQL HA, failover, and reconnection",
        "Diagnosing connection pooling issues across the stack",
        "Handling compliance requirements (CMEK, audit, retention)",
        "Tuning PostgreSQL configuration and system-level performance"
      ]
    },
    {
      "num": 5,
      "name": "Expert",
      "desc": "Making architecture decisions that affect multiple teams, operating at the boundary between database engineering and platform strategy.",
      "scenarios": [
        "Leading cross-team database architecture decisions",
        "Designing read-replica and query routing strategies",
        "Owning large-scale migration plans end-to-end",
        "Tuning the query planner and setting platform standards",
        "Managing Cloud SQL costs and capacity at scale"
      ]
    },
    {
      "num": 6,
      "name": "Authority",
      "desc": "Organisational strategy, disaster recovery validation, and technology direction.",
      "scenarios": [
        "Leading technology evaluations (Cloud SQL vs alternatives)",
        "Designing disaster recovery and cross-region strategy",
        "Owning the platform cost narrative at the leadership level",
        "Defining compliance and security standards across teams",
        "Building platform capabilities other teams depend on"
      ]
    }
  ],
  "questions": [
    {
      "level": 1,
      "diff": 1,
      "scenario": 0,
      "q": "You need all orders where country is 'SE' AND total > 1000. Which clause and syntax is correct?",
      "opts": [
        "SELECT * FROM orders HAVING country='SE' AND total>1000",
        "SELECT * FROM orders FILTER(WHERE country='SE' AND total>1000)",
        "SELECT * FROM orders WHERE country='SE' JOIN total>1000",
        "SELECT * FROM orders WHERE country='SE' OR total>1000",
        "SELECT * FROM orders WHERE country='SE' AND total>1000"
      ],
      "ans": 4,
      "fb": "WHERE filters rows before aggregation; HAVING applies after GROUP BY. AND requires both conditions; OR requires either. FILTER is only valid inside aggregate functions."
    },
    {
      "level": 1,
      "diff": 1,
      "scenario": 1,
      "q": "A column customer_id is marked FOREIGN KEY REFERENCES customers(id). What does this enforce?",
      "opts": [
        "The column must contain UUIDs",
        "Deleting a customer row automatically deletes related rows",
        "Duplicate customer_id values are prevented within this table",
        "PostgreSQL automatically creates an index on this column",
        "Each value must exist as a primary key in the customers table, preventing orphan records"
      ],
      "ans": 4,
      "fb": "A FOREIGN KEY guarantees referential integrity — every value must point to an existing PK in the referenced table. PostgreSQL does NOT auto-create indexes on FK columns. Cascading deletes are a separate ON DELETE CASCADE setting."
    },
    {
      "level": 1,
      "diff": 1,
      "scenario": 0,
      "q": "You want all customers who have at least one order, with their order count. Which query is correct?",
      "opts": [
        "SELECT c.name, COUNT(*) FROM customers c, orders o GROUP BY c.id",
        "SELECT c.name, COUNT(o.id) FROM customers c LEFT JOIN orders o ON c.id=o.customer_id GROUP BY c.id",
        "SELECT c.name, SUM(1) FROM customers c JOIN orders o GROUP BY c.name",
        "SELECT c.name, COUNT(o.id) FROM customers c INNER JOIN orders o ON c.id=o.customer_id GROUP BY c.id",
        "SELECT c.name, COUNT(o.id) FROM customers c RIGHT JOIN orders o ON c.id=o.customer_id GROUP BY c.id"
      ],
      "ans": 3,
      "fb": "INNER JOIN returns only customers with at least one matching order. LEFT JOIN includes customers with zero orders. A comma join without a join condition produces a Cartesian product."
    },
    {
      "level": 1,
      "diff": 2,
      "scenario": 2,
      "q": "Your ORM generates one query for the parent list, then a separate query for every row returned. What anti-pattern is this?",
      "opts": [
        "Over-fetching",
        "Full table scan",
        "N+1 query problem",
        "Cartesian product",
        "Dirty read"
      ],
      "ans": 2,
      "fb": "N+1: 1 query fetches the parent list, then N queries fetch related data per row. Fix with JOIN FETCH in JPQL or batch-size configuration so the ORM retrieves related data in one or two queries."
    },
    {
      "level": 1,
      "diff": 2,
      "scenario": 2,
      "q": "A Spring Boot app calls customerRepo.findAll() and sees 51 database queries for 50 customers. The Customer entity has a @OneToMany to orders. What is the root cause?",
      "opts": [
        "The orders relationship is LAZY — accessing it inside the loop triggers one query per customer",
        "findAll() calls itself recursively due to a Spring Data bug",
        "The database schema is missing an index on the foreign key",
        "Spring Data JPA always generates N+1 queries for OneToMany by design",
        "PostgreSQL limits result sets to 50 rows without pagination"
      ],
      "ans": 0,
      "fb": "LAZY loading defers the relationship until accessed. Iterating customers and touching .getOrders() triggers one SELECT per customer. Fix: JPQL JOIN FETCH, EntityGraph, or @BatchSize to bulk-load associations."
    },
    {
      "level": 1,
      "diff": 2,
      "scenario": 3,
      "q": "A new engineer needs to connect to your Cloud SQL PostgreSQL instance from inside their DevContainer. What is the correct approach?",
      "opts": [
        "Open firewall rules to allow their IP address in the Cloud SQL authorised networks",
        "Install psql directly on their laptop and connect with the public IP",
        "Run Cloud SQL Auth Proxy inside the DevContainer and connect to localhost",
        "Use a VPN to access the Cloud SQL private IP directly",
        "Use only Cloud SQL Studio in the GCP console — no local client is supported"
      ],
      "ans": 2,
      "fb": "Cloud SQL Auth Proxy handles IAM-based auth and encrypted tunnelling — no IP allowlisting needed. It runs inside the DevContainer alongside the app, so all tooling connects to localhost:5432.",
      "context": {
        "Environment": "DevContainer",
        "Database": "Cloud SQL PostgreSQL",
        "Auth": "IAM / Auth Proxy",
        "App connects to": "localhost:5432"
      }
    },
    {
      "level": 1,
      "diff": 3,
      "scenario": 4,
      "q": "Transaction A reads a row (balance=500). Transaction B updates it to 300 and commits. Transaction A reads the same row again and now sees 300. What is this anomaly called?",
      "opts": [
        "Non-repeatable read",
        "Lost update",
        "Dirty read",
        "Phantom read",
        "Write skew"
      ],
      "ans": 0,
      "fb": "Non-repeatable read: the same row returns different values within one transaction because another transaction committed a change between the two reads. READ COMMITTED (PostgreSQL default) allows this. REPEATABLE READ prevents it."
    },
    {
      "level": 1,
      "diff": 3,
      "scenario": 4,
      "q": "A Spring Boot service wraps three database writes in a single @Transactional method. The third write throws a RuntimeException. What happens?",
      "opts": [
        "Behaviour depends on whether the exception is checked or unchecked",
        "The first two writes are committed immediately when executed — only the third is rolled back",
        "The entire transaction is rolled back — all three writes are undone",
        "PostgreSQL retries the failed write automatically",
        "The first two are committed if saveAndFlush() was called before the exception"
      ],
      "ans": 2,
      "fb": "Spring rolls back @Transactional methods on unchecked exceptions (RuntimeException, Error) by default. All writes in the transaction are undone atomically. Checked exceptions do NOT trigger rollback unless you add rollbackFor."
    },
    {
      "level": 1,
      "diff": 3,
      "scenario": 4,
      "q": "SELECT * FROM items WHERE status='active' is slow on a 1M row table where 10,000 rows are active. A colleague suggests adding an index on status. What is the most accurate response?",
      "opts": [
        "The only fix is to move active items to a separate table",
        "An index on status will always speed this up — indexes are always faster than seq scans",
        "An index on status will definitely not help because it's a WHERE clause filter",
        "Indexes only help with primary key lookups, not string columns",
        "A standard B-tree index on status may not help due to low cardinality; a partial index WHERE status='active' would be far more effective"
      ],
      "ans": 4,
      "fb": "Low cardinality (active/inactive) makes a full B-tree index barely selective — PostgreSQL may prefer a seq scan. A partial index covers only matching rows, making it tiny and fast."
    },
    {
      "level": 2,
      "diff": 1,
      "scenario": 1,
      "q": "EXPLAIN ANALYZE shows \"Seq Scan on orders (cost=0..4500 rows=120000)\". What does this signal?",
      "opts": [
        "PostgreSQL is reading the entire table; a missing or unused index on the filtered column is the likely cause",
        "cost=4500 means the query completed in 4.5 seconds",
        "The query has a syntax error preventing index use",
        "The table has 120k duplicate rows that need deduplication",
        "The query is fast — seq scans are always optimal for large tables"
      ],
      "ans": 0,
      "fb": "Seq Scan on a large table with a selective filter usually means no usable index exists. The high estimated cost and row count confirm PostgreSQL found no better path."
    },
    {
      "level": 2,
      "diff": 1,
      "scenario": 1,
      "q": "EXPLAIN ANALYZE shows Index Scan (cost=0..8 rows=1) but actual execution takes 850ms and returns 50,000 rows. What explains the mismatch?",
      "opts": [
        "Index scans are always slow for more than 100 rows",
        "The 850ms includes network latency from Cloud SQL Auth Proxy",
        "Stale table statistics caused the planner to wildly underestimate row count, leading to a bad plan",
        "The index is corrupt and must be rebuilt",
        "The query is missing a WHERE clause"
      ],
      "ans": 2,
      "fb": "The planner chose the index scan because it estimated only 1 row — but 50k were returned. Stale statistics (autovacuum falling behind) cause this. Run ANALYZE on the table."
    },
    {
      "level": 2,
      "diff": 1,
      "scenario": 0,
      "q": "You're designing a schema for payments. Each payment belongs to exactly one account. How do you correctly model this?",
      "opts": [
        "Add a composite primary key (payment_id, account_id) to enforce the relationship",
        "Store account_id as TEXT to allow future flexibility",
        "Add account_id BIGINT REFERENCES accounts(id) NOT NULL to the payments table",
        "Use a junction table — payments and accounts are many-to-many",
        "Store account data as a JSONB column inside the payments table"
      ],
      "ans": 2,
      "fb": "A NOT NULL foreign key column correctly models a mandatory many-to-one relationship. JSONB loses type safety and relational integrity. TEXT for IDs sacrifices type safety."
    },
    {
      "level": 2,
      "diff": 2,
      "scenario": 2,
      "q": "You need to add a NOT NULL column processed_at TIMESTAMPTZ to a 40M row production table. What is the safest approach?",
      "opts": [
        "Add the column as nullable permanently and handle nulls in application code",
        "Drop and recreate the table with the new column",
        "ALTER TABLE payments ADD COLUMN processed_at TIMESTAMPTZ NOT NULL",
        "Add the column as nullable first, batch-backfill values, then add the NOT NULL constraint validated in the background",
        "Wrap the ALTER TABLE in a transaction alongside the application deploy"
      ],
      "ans": 3,
      "fb": "Adding NOT NULL on a large table requires a full table scan to validate every row, holding an exclusive lock. Safe pattern: add nullable → batch backfill in chunks → ADD CONSTRAINT ... NOT VALID, then VALIDATE CONSTRAINT.",
      "context": {
        "Table size": "40M rows",
        "Constraint": "Zero downtime"
      }
    },
    {
      "level": 2,
      "diff": 2,
      "scenario": 2,
      "q": "You're adding an index to a live production table with 8M rows and continuous writes. Which command prevents blocking writes during creation?",
      "opts": [
        "CREATE INDEX CONCURRENTLY idx_orders_user ON orders(user_id)",
        "BEGIN; CREATE INDEX idx_orders_user ON orders(user_id); COMMIT;",
        "VACUUM ANALYZE orders; then CREATE INDEX idx_orders_user ON orders(user_id)",
        "ALTER TABLE orders ADD INDEX (user_id) CONCURRENTLY",
        "CREATE INDEX idx_orders_user ON orders(user_id)"
      ],
      "ans": 0,
      "fb": "CREATE INDEX CONCURRENTLY builds without a lock that blocks writes. It takes longer and cannot run inside a transaction block.",
      "context": {
        "Table": "8M rows",
        "Write load": "Continuous",
        "Constraint": "No write blocking during build"
      }
    },
    {
      "level": 2,
      "diff": 2,
      "scenario": 3,
      "q": "You have a composite index on (account_id, status, created_at). Which query uses this index most efficiently?",
      "opts": [
        "SELECT * FROM txns WHERE created_at > '2024-01-01'",
        "SELECT * FROM txns WHERE account_id=123 AND status='pending'",
        "SELECT * FROM txns ORDER BY created_at DESC",
        "SELECT * FROM txns WHERE status='pending' AND created_at > '2024-01-01'",
        "SELECT * FROM txns WHERE status='pending'"
      ],
      "ans": 1,
      "fb": "Composite indexes work left-to-right. Queries starting with the leading column (account_id) can use the index. Skipping account_id bypasses it entirely."
    },
    {
      "level": 2,
      "diff": 3,
      "scenario": 4,
      "q": "Two transactions both read balance=500, both deduct 200, both write 300. Final balance is 300 instead of 100. Which isolation level prevents this lost update?",
      "opts": [
        "READ COMMITTED (the PostgreSQL default)",
        "SNAPSHOT ISOLATION (not available in PostgreSQL)",
        "REPEATABLE READ or SERIALIZABLE",
        "Any isolation level prevents lost updates automatically",
        "READ UNCOMMITTED"
      ],
      "ans": 2,
      "fb": "READ COMMITTED allows lost updates — the second write silently overwrites the first. REPEATABLE READ detects the write conflict and aborts the second transaction with a serialization error."
    },
    {
      "level": 2,
      "diff": 3,
      "scenario": 2,
      "q": "A colleague shares a Liquibase migration guide warning that 'adding a column with a non-null default rewrites the entire table'. The guide was written for PostgreSQL 10. Your system runs PostgreSQL 16. How does this behave differently?",
      "opts": [
        "PostgreSQL 16 requires CONCURRENTLY keyword to avoid the rewrite: ALTER TABLE ... ADD COLUMN ... DEFAULT x CONCURRENTLY",
        "The guide is correct — avoid non-null defaults entirely and always backfill separately",
        "The behaviour is identical — PostgreSQL has always rewritten the table for this operation",
        "Since PostgreSQL 11, adding a column with a non-null constant default is instant — PostgreSQL stores the default in the catalog and fills it lazily, no table rewrite or exclusive lock",
        "PostgreSQL 16 still rewrites the table but uses parallel workers to reduce lock duration"
      ],
      "ans": 3,
      "fb": "PostgreSQL 11 changed this behaviour: adding a column with a non-null constant default is now instant — the default is stored in pg_attribute and returned for existing rows without touching them. On PostgreSQL 16 this is safe. The old rewrite behaviour is important historical context when reviewing migration guides or Liquibase changelogs written for older versions.",
      "context": {
        "PostgreSQL": "16 (fixed since 11)",
        "Table": "30M rows",
        "Operation": "ADD COLUMN with non-null DEFAULT"
      }
    },
    {
      "level": 2,
      "diff": 3,
      "scenario": 4,
      "q": "pg_stat_activity shows many connections in \"idle in transaction\" state for over 10 minutes. What is the primary risk?",
      "opts": [
        "They hold locks on any rows touched during the transaction, potentially blocking other queries, and consume connection pool slots",
        "They indicate the application is handling long-running batch jobs correctly",
        "Cloud SQL automatically kills these connections after 30 minutes",
        "This is expected Spring @Transactional behaviour for read-heavy workloads",
        "These connections consume excess memory but don't affect query performance"
      ],
      "ans": 0,
      "fb": "Idle-in-transaction connections hold any locks acquired and occupy HikariCP pool slots, starving other requests. Set idle_in_transaction_session_timeout on Cloud SQL to auto-kill them."
    },
    {
      "level": 3,
      "diff": 1,
      "scenario": 3,
      "q": "A payments table has 200M rows. 90% of queries filter status='pending' but only 0.1% of rows are pending. Which index is best?",
      "opts": [
        "A GIN index on status",
        "A BRIN index on status — designed for low-cardinality columns",
        "A composite index on (id, status, amount)",
        "A partial index: CREATE INDEX ON payments(id) WHERE status='pending'",
        "A standard B-tree index on (status)"
      ],
      "ans": 3,
      "fb": "A partial index covers only the matching subset — it's tiny and fast. A full B-tree on a low-cardinality column is rarely selective enough. BRIN is for naturally ordered data (timestamps), not categorical columns.",
      "context": {
        "Table": "200M rows",
        "Pending rows": "0.1%"
      }
    },
    {
      "level": 3,
      "diff": 1,
      "scenario": 0,
      "q": "Your domain requires an immutable financial audit trail — once a payment event is recorded, it must never be modified or deleted. Which schema pattern best enforces this at the database level?",
      "opts": [
        "Encrypt rows at the application level and store the encrypted blob in a TEXT column",
        "Use UNLOGGED tables which can't be modified without special privileges",
        "Use an append-only events table with UPDATE and DELETE privileges revoked from the application role",
        "Use an UPDATE trigger that logs all changes to a shadow table",
        "Use PostgreSQL's built-in row versioning to store history automatically"
      ],
      "ans": 2,
      "fb": "Revoke UPDATE/DELETE from the application's database role — don't rely solely on application logic. Append-only event tables with no write-back permissions are the correct pattern for immutable audit trails."
    },
    {
      "level": 3,
      "diff": 1,
      "scenario": 0,
      "q": "A query filters on account_id=123 AND created_at BETWEEN '2024-01-01' AND '2024-03-31' on a 500M row transactions table. Which index design is best?",
      "opts": [
        "A composite index on (created_at, account_id)",
        "A composite index on (account_id, created_at)",
        "A GiST index on (account_id, created_at) for range queries",
        "Two separate indexes: one on account_id, one on created_at",
        "A partial index WHERE account_id IS NOT NULL"
      ],
      "ans": 1,
      "fb": "Put the equality predicate (account_id) first — it eliminates most rows immediately. The range predicate (created_at) then filters the small remainder.",
      "context": {
        "Table": "500M rows",
        "Query": "Equality + range"
      }
    },
    {
      "level": 3,
      "diff": 2,
      "scenario": 1,
      "q": "After a large batch job a DBA mentions \"table bloat\" and schedules VACUUM. What causes table bloat?",
      "opts": [
        "Disk fragmentation from frequent writes",
        "Connection pool exhaustion causes partial writes that leave orphaned rows",
        "MVCC keeps dead row versions after UPDATE/DELETE — VACUUM reclaims them and updates the visibility map",
        "Transaction log files accumulate in pg_wal",
        "PostgreSQL duplicates rows across replicas for fault tolerance"
      ],
      "ans": 2,
      "fb": "PostgreSQL's MVCC writes new row versions on every UPDATE/DELETE. Dead tuples accumulate until VACUUM reclaims them. Without regular vacuuming, tables bloat physically and transaction ID wraparound risk grows."
    },
    {
      "level": 3,
      "diff": 2,
      "scenario": 3,
      "q": "You need row-level security so each service can only read its own tenant's data, enforced at the database level regardless of what SQL the application sends. Which approach is most robust?",
      "opts": [
        "Enable Row Level Security (RLS) with a policy bound to a session variable set at the start of each transaction",
        "Enforce tenant isolation at the API Gateway layer only",
        "Use separate PostgreSQL schemas per tenant with identical table structures",
        "Create a separate Cloud SQL instance per tenant",
        "Add WHERE tenant_id=? to every query in the application"
      ],
      "ans": 0,
      "fb": "RLS policies are enforced by the database — a bug in application code that omits the WHERE clause cannot bypass them. This is the correct defence-in-depth approach for a multi-tenant BaaS platform."
    },
    {
      "level": 3,
      "diff": 2,
      "scenario": 1,
      "q": "autovacuum hasn't run on a table for 3 weeks. pg_stat_user_tables shows n_dead_tup=12,000,000. If this continues, what are the consequences?",
      "opts": [
        "No consequences — dead tuples only affect disk usage, not query performance",
        "Table bloat degrades query plans, inflates seq scan cost, and transaction ID wraparound risk grows — potentially causing PostgreSQL to refuse all write transactions",
        "PostgreSQL pauses new writes until vacuum catches up",
        "Cloud SQL will automatically compact the table during its next maintenance window",
        "Reads slow slightly but writes are unaffected"
      ],
      "ans": 1,
      "fb": "Dead tuples inflate physical table size, causing seq scans to read more pages. Most critically: XID wraparound can cause PostgreSQL to enter safety mode and refuse all writes.",
      "context": {
        "Dead tuples": "12,000,000",
        "Vacuum gap": "3 weeks"
      }
    },
    {
      "level": 3,
      "diff": 3,
      "scenario": 2,
      "q": "You need to add a UNIQUE constraint on (user_id, event_type) to a live table without downtime. What is the correct sequence?",
      "opts": [
        "Set lock_timeout=0 to prevent blocking, then run ALTER TABLE normally",
        "ALTER TABLE events ADD CONSTRAINT uq UNIQUE(user_id,event_type) — it acquires only a brief metadata lock",
        "CREATE UNIQUE INDEX CONCURRENTLY on (user_id,event_type), then ALTER TABLE ... ADD CONSTRAINT ... USING INDEX",
        "Drop the table, add the constraint, reload from backup",
        "Use Liquibase addUniqueConstraint — it handles concurrency automatically"
      ],
      "ans": 2,
      "fb": "CREATE INDEX CONCURRENTLY builds without a write-blocking lock. ALTER TABLE ... ADD CONSTRAINT ... USING INDEX then promotes the pre-built index with only a brief metadata lock."
    },
    {
      "level": 3,
      "diff": 3,
      "scenario": 2,
      "q": "You need to rename column amount to amount_cents on a live table. A rolling deploy means both old and new app code run simultaneously. What is the correct sequence?",
      "opts": [
        "Add amount_cents, dual-write from both app versions, backfill, switch reads, remove amount in a later deployment",
        "Rename the column and update all app code in a single atomic deployment",
        "Add amount_cents, copy data in one UPDATE, rename amount to amount_legacy in the same deploy",
        "ALTER TABLE payments RENAME COLUMN amount TO amount_cents — it's instant and safe",
        "Use a view to alias the column, then rename the underlying column"
      ],
      "ans": 0,
      "fb": "Renaming a column immediately breaks any code still referencing the old name. Expand-contract: add new column → deploy code that writes both → backfill → switch reads → remove old column."
    },
    {
      "level": 3,
      "diff": 3,
      "scenario": 4,
      "q": "pg_stat_activity shows one query has held an ExclusiveLock for 12 minutes, blocking 40 connections. You consider pg_terminate_backend(pid). What should you verify first?",
      "opts": [
        "Whether the blocking query is a long-running migration — terminating it rolls back all its work",
        "That the lock is ExclusiveLock and not ShareLock, since only ExclusiveLocks can be safely terminated",
        "Whether the connection pool has capacity to handle reconnection",
        "Nothing — always terminate blocking queries immediately to restore service",
        "Whether terminating it will cause PostgreSQL to restart"
      ],
      "ans": 0,
      "fb": "Terminating a running migration rolls back potentially hours of progress. First: read the query column in pg_stat_activity to understand what it's doing.",
      "context": {
        "Lock held": "12 minutes",
        "Blocked": "40 connections"
      }
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 1,
      "q": "An analytics team has been running 3-minute aggregation queries directly on the primary Cloud SQL instance. During their reporting window (9-11am), p99 latency for the payment API doubles from 15ms to 35ms. The team proposes spinning up a dedicated read replica. Before approving, what operational concern must be resolved first, and why?",
      "opts": [
        "Verify that Cloud SQL read replicas can handle the same query concurrency as the primary instance",
        "Confirm that the read replica supports the same PostgreSQL extensions as the primary — some analytics extensions are not available on replicas",
        "Define and document the acceptable replication lag SLA with the analytics team, because their queries will see data that is seconds to minutes behind the primary, and they must design their reports to tolerate this staleness without raising false alerts",
        "Ensure the analytics service uses a separate HikariCP pool to avoid exhausting the primary's connection slots during the reporting window",
        "Verify that the read replica's storage tier matches the primary — analytics queries require identical disk IOPS to avoid slower queries"
      ],
      "ans": 2,
      "fb": "The most important operational concern is replication lag tolerance. Read replicas receive WAL asynchronously, so queries on the replica see data that lags behind the primary by milliseconds to seconds (and potentially longer under heavy write load). If the analytics team assumes they are reading real-time data, they will encounter discrepancies — e.g., a payment written at 9:00:01 may not appear in a replica query at 9:00:02. This causes false-alarm support tickets and erodes trust. A formal lag SLA (e.g., '< 5 seconds is acceptable for analytics reports') must be agreed and documented before provisioning. Storage tier matching (A) is automatic on Cloud SQL. Extensions (C) are replicated from the primary. Connection pool isolation (D) is relevant but secondary to the consistency contract. EXPLAIN ANALYZE (E) works on replicas.",
      "context": {
        "Primary impact": "p99 latency doubles during analytics window",
        "Analytics window": "9-11am daily",
        "Write throughput": "~2,000 TPS on primary during peak"
      }
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 0,
      "q": "A payments table has 300M rows and is range-partitioned by created_at into monthly partitions. A new compliance requirement arrives: all queries must now also filter by tenant_id for data isolation. The team proposes adding a composite partition key (tenant_id, created_at). What is the primary risk of this approach for the existing system?",
      "opts": [
        "Adding tenant_id to the partition key will cause partition pruning to fail for time-range-only queries from analytics dashboards that do not filter by tenant_id",
        "Changing the partition key requires recreating all existing partitions and migrating 300M rows, which cannot be done in-place and requires a full data migration with a cutover window",
        "Composite partition keys double the storage requirement because PostgreSQL duplicates data across both dimensions",
        "The partition key change will invalidate all existing indexes, requiring a complete reindexing operation that takes hours on 300M rows",
        "PostgreSQL does not support composite partition keys — the table must use two levels of sub-partitioning instead"
      ],
      "ans": 1,
      "fb": "PostgreSQL does not allow altering the partition key of an existing partitioned table. Changing from (created_at) to (tenant_id, created_at) requires creating a new partitioned table with the new key, migrating all 300M rows (in batches to avoid long locks), and performing a table-swap cutover. This is a significant operational undertaking with downtime implications. Option C is partially true (queries without tenant_id in the WHERE clause will scan all partitions where tenant_id is the leading key), but the primary risk is the migration complexity, not the pruning behaviour. PostgreSQL does support composite partition keys (A is false). Storage is not duplicated (D is false). Existing indexes need to be recreated on the new partitions but this is part of the migration, not a separate issue (E overstates the problem).",
      "context": {
        "Table": "300M rows, monthly RANGE partitions on created_at",
        "New requirement": "Add tenant_id to partition key for isolation",
        "Challenge": "Partition key changes require full table migration"
      }
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 1,
      "q": "Your team is preparing for a planned Cloud SQL HA failover test during a low-traffic window. The Spring Boot application uses HikariCP with connectionTimeout=30000ms, maxLifetime=1800000ms, and keepaliveTime=0 (disabled). After the failover completes in ~45 seconds, the application takes an additional 3 minutes to fully recover. What HikariCP configuration is most likely causing the extended recovery?",
      "opts": [
        "HikariCP does not support Cloud SQL Auth Proxy reconnection — the proxy must be restarted separately after each failover",
        "maxLifetime is too long — connections that were established before the failover remain in the pool for up to 30 minutes, and HikariCP returns these dead connections to the application, causing repeated failures until they naturally expire",
        "The HikariCP pool is too small and cannot create enough new connections to replace the stale ones fast enough",
        "keepaliveTime=0 means HikariCP never probes idle connections for liveness, so stale connections from the old primary sit in the pool and are handed to the application, causing errors until maxLifetime evicts them",
        "connectionTimeout is too short — HikariCP gives up trying to establish new connections before the failover completes"
      ],
      "ans": 3,
      "fb": "With keepaliveTime=0 (disabled), HikariCP never sends TCP keepalive probes to verify that idle connections are still alive. After a Cloud SQL HA failover, the old TCP connections are dead but HikariCP does not know this. When the application requests a connection, HikariCP returns a stale connection from the pool. The application's query fails, the connection is evicted, and a new one is created — but this happens one connection at a time, causing cascading failures until all stale connections have been detected and evicted. Setting keepaliveTime=30000 (30 seconds) causes HikariCP to proactively test idle connections, detecting dead ones and replacing them before the application requests them. maxLifetime (A) eventually evicts connections but 30 minutes is far too slow for failover recovery. connectionTimeout (B) controls how long to wait for a free connection from the pool, not the failover window. Pool size (C) is not the bottleneck. Auth Proxy reconnects transparently (E is false).",
      "context": {
        "HikariCP config": "connectionTimeout=30s, maxLifetime=1800s, keepaliveTime=0",
        "Failover duration": "~45 seconds",
        "Application recovery": "~3 minutes after failover completes",
        "Root cause": "Stale connections not proactively detected"
      }
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 2,
      "q": "HikariCP max-pool-size=10, 5 pods, Cloud SQL max_connections=100. You plan to scale to 20 pods. What happens?",
      "opts": [
        "Nothing — HikariCP manages scaling automatically without exceeding limits",
        "Reduce max-pool-size to 1 to stay under the limit",
        "HikariCP queues requests above the limit without throwing errors",
        "Cloud SQL Auth Proxy absorbs excess connections automatically",
        "20 pods × 10 connections = 200, exceeding max_connections=100. Introduce PgBouncer in transaction mode"
      ],
      "ans": 4,
      "fb": "Connection count = pods × pool size. At 20 pods you need 200, hitting max_connections=100. PgBouncer in transaction mode multiplexes many app connections onto fewer server connections.",
      "context": {
        "Pool size": "10/pod",
        "Current pods": "5 → 20",
        "Max connections": "100"
      }
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 4,
      "q": "You want to test whether increasing work_mem from 4MB to 64MB improves a sort-heavy query on Cloud SQL without risking production stability. What is the safest approach?",
      "opts": [
        "Change work_mem on production during off-peak hours and monitor for 48 hours",
        "Apply to staging and extrapolate — staging is representative enough for memory tuning",
        "Create a Cloud SQL clone, apply the change there, run benchmark queries against representative data",
        "Change work_mem at session level in production: SET work_mem='64MB' for the affected query only",
        "Ask Cloud SQL support to apply the change temporarily via a maintenance window"
      ],
      "ans": 2,
      "fb": "A Cloud SQL clone is an exact copy of production data — test with realistic scale before promoting changes. Staging data is rarely representative enough for memory-tuning decisions.",
      "context": {
        "Parameter": "work_mem",
        "Current": "4 MB",
        "Target": "64 MB",
        "Test method": "Cloud SQL clone with production data"
      }
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 4,
      "q": "Cloud SQL metrics show blks_hit is consistently low (cache hit rate ~60%) on a 16GB RAM instance. What is the most likely fix?",
      "opts": [
        "Increase effective_cache_size — this controls how much data PostgreSQL actually caches",
        "Run VACUUM ANALYZE — stale statistics are causing cache misses",
        "Increase shared_buffers — the cache allocation is too small",
        "Upgrade storage — IOPS are limiting cache effectiveness",
        "The instance tier needs more memory; the working set exceeds the available buffer cache"
      ],
      "ans": 4,
      "fb": "On Cloud SQL, shared_buffers is managed by the instance tier (~25% of RAM). A 60% hit rate indicates the working set exceeds the buffer pool. Note: effective_cache_size is a planner hint, it doesn't allocate memory.",
      "context": {
        "Instance RAM": "16 GB",
        "Cache hit rate": "~60%"
      }
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 4,
      "q": "Cloud SQL CPU is at 90% but individual query times are normal and no slow queries appear in Query Insights. What is the most likely cause?",
      "opts": [
        "Autovacuum is consuming CPU during table bloat cleanup",
        "CPU and per-query execution time are unrelated metrics",
        "Replication lag is causing CPU spikes on the primary",
        "Query Insights only shows slow queries; fast queries consuming CPU are invisible to it",
        "High connection overhead — too many connections cycling through authentication and session setup"
      ],
      "ans": 4,
      "fb": "When CPU is high but per-query time is normal, the overhead is usually connection lifecycle — TLS handshakes, session initialisation, auth. PgBouncer eliminates this by maintaining persistent server connections."
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 3,
      "q": "A compliance audit reveals that your Cloud SQL instances use Google-managed encryption keys (GMEK). The auditor asks you to demonstrate that you can make all cardholder data permanently inaccessible within 24 hours in the event of a data breach. Your current GMEK setup does not support this. You propose migrating to CMEK. However, three of your five Cloud SQL instances have cross-region read replicas. What is the migration constraint that must be addressed first?",
      "opts": [
        "CMEK migration requires downtime of 4-6 hours per instance while Cloud SQL re-encrypts all data blocks with the new key",
        "CMEK migration requires creating new Cloud SQL instances with CMEK enabled at creation time — CMEK cannot be retroactively applied to existing instances, and cross-region replicas must be recreated with the same CMEK key ring in each region",
        "Cross-region replicas automatically inherit the primary's CMEK configuration, so no additional action is needed for the replicas",
        "The CMEK key must be replicated to all regions before any Cloud SQL instance can be migrated, and Cloud KMS does not support multi-region key rings",
        "CMEK is only available in the us-central1 region, so all cross-region replicas must be moved to us-central1 first"
      ],
      "ans": 1,
      "fb": "CMEK must be configured at Cloud SQL instance creation time — it cannot be enabled on an existing instance. Migration requires: (1) create new CMEK-enabled instances, (2) use logical replication or DMS to sync data, (3) cut over. For cross-region replicas, each region needs a Cloud KMS key ring with the appropriate key, and the replica must be created with CMEK in its region. This is a multi-step migration that involves recreating all instances and replicas. Cloud KMS does support multi-region key rings (E is false). CMEK is available in all Cloud SQL regions (B is false). Replicas do NOT automatically inherit the primary's CMEK — they need their own key configuration (C is false). CMEK is set at creation, not applied via re-encryption (D mischaracterises the process).",
      "context": {
        "Current encryption": "Google-managed keys (GMEK)",
        "Compliance gap": "Cannot demonstrate 24-hour data destruction capability",
        "Infrastructure": "5 Cloud SQL instances, 3 with cross-region read replicas",
        "Target": "CMEK via Cloud KMS with key revocation capability"
      }
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 2,
      "q": "During a planned Cloud SQL failover test, the application throws connection errors for 90 seconds. HikariCP has connectionTimeout=30000ms and maximumPoolSize=10. Where do you focus to reduce this window?",
      "opts": [
        "Increase maximumPoolSize — more connections means faster recovery",
        "Tune HikariCP keepaliveTime to detect broken connections faster, and add application-layer retry with exponential backoff",
        "Increase connectionTimeout — giving HikariCP more time to wait for connections",
        "Set minimumIdle=0 so HikariCP closes idle connections before the failover window",
        "Switch from Auth Proxy to direct private IP — it reconnects faster during failover"
      ],
      "ans": 1,
      "fb": "During failover, HikariCP needs keepaliveTime to detect stale connections and evict them. Application-level retry with backoff handles the transient failure window."
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 2,
      "q": "You need to migrate a 500GB active table to a new Cloud SQL instance with under 5 minutes of downtime. What is the best strategy?",
      "opts": [
        "Use Cross-Region Replica promotion — it achieves zero downtime automatically",
        "Use logical replication (or Database Migration Service) to pre-sync, then cut over with a brief write pause and connection string flip",
        "Rename the old instance — the data stays in Cloud SQL infrastructure",
        "pg_dump and restore — accept 4-6 hours of downtime",
        "Export to Cloud Storage and import — Cloud SQL handles 500GB in under 5 minutes"
      ],
      "ans": 1,
      "fb": "Logical replication keeps the target in sync while the source stays live. When lag approaches zero, pause writes briefly, confirm sync, flip the connection string.",
      "context": {
        "Table": "500 GB",
        "Max downtime": "5 minutes"
      }
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 1,
      "q": "Three teams independently request read replicas for their services. Team A (payments) wants sub-second replication lag for balance reconciliation. Team B (analytics) runs 10-minute aggregation queries and accepts minutes-old data. Team C (customer support) needs to search across all tenants and accepts seconds-old data. You are asked to design the read replica topology. Each Cloud SQL read replica costs $800/month. What architecture balances cost, isolation, and SLA requirements?",
      "opts": [
        "Create two replicas: one dedicated to Team A (low-lag, protected from noisy neighbours) and one shared between Teams B and C with resource monitoring and documented lag SLAs per team",
        "Create one read replica per team (3 replicas) — isolation is more important than cost at this stage",
        "Create a single shared replica for all three teams and rely on Cloud SQL's built-in query prioritisation to prevent interference",
        "Route all three teams to the primary with statement_timeout limits per role to control query duration",
        "Create one replica and use PgBouncer to route Team A's queries with higher priority than Teams B and C"
      ],
      "ans": 0,
      "fb": "The key insight is that Team A has a fundamentally different SLA (sub-second lag, low latency) that is incompatible with Team B's 10-minute aggregation queries. A long-running query on the replica causes recovery conflicts that pause WAL replay, increasing replication lag — directly violating Team A's SLA. Teams B and C can share a replica because their lag tolerance overlaps (minutes vs seconds) and Team C's search queries are unlikely to block WAL replay for extended periods. Two replicas ($1,600/month) is the minimum that satisfies all SLAs. Three replicas (A) provides maximum isolation but the cost is not justified given B and C's compatible SLAs. One shared replica (C) will cause Team A to miss its sub-second lag SLA when Team B runs heavy queries. Cloud SQL does not have built-in query prioritisation (C is also factually wrong). Routing to the primary (D) defeats the purpose. PgBouncer cannot prioritise queries on a replica (E is misleading).",
      "context": {
        "Team A": "Payments — sub-second lag SLA, balance reconciliation",
        "Team B": "Analytics — 10-minute queries, minutes-old data acceptable",
        "Team C": "Support — tenant search, seconds-old data acceptable",
        "Replica cost": "$800/month each"
      }
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 0,
      "q": "Service A processes PCI-DSS card data and Service B handles non-sensitive notifications. They currently share a Cloud SQL instance to reduce costs ($800/month saved). During a compliance review, you discover this shared infrastructure. The engineering manager asks you to assess the impact of separating them versus keeping the current setup. Three stakeholders need different framings: the compliance officer, the engineering manager, and the CFO. What is the correct assessment?",
      "opts": [
        "Frame it as a risk decision: explain to the compliance officer that shared infrastructure extends PCI scope to Service B (increasing audit surface and remediation cost); explain to the engineering manager that Service B's team must now follow PCI change management processes for every deployment; explain to the CFO that the $800/month saving is dwarfed by the increased audit scope cost (typically $15-50k/year in additional compliance effort)",
        "Recommend separating immediately but absorb the cost by downgrading both instances to smaller tiers, keeping the total cost neutral",
        "Tell all three stakeholders the same thing: sharing is a compliance violation and must be fixed immediately regardless of cost",
        "Recommend a formal PCI-DSS exception request — shared infrastructure is permitted if both services pass a joint security assessment",
        "Recommend keeping the shared instance but adding Row Level Security to isolate PCI data from Service B's queries, which satisfies PCI-DSS data isolation requirements"
      ],
      "ans": 0,
      "fb": "PCI-DSS scope is contagious: any system sharing infrastructure with in-scope cardholder data becomes in-scope itself. This is not just a technical separation question — it has organisational consequences. The compliance officer needs to understand the expanded audit surface. The engineering manager needs to understand that Service B's team now bears PCI change management overhead (deployment freezes, code review requirements, vulnerability scanning). The CFO needs to understand that the $800/month infrastructure saving creates $15-50k/year in additional compliance costs. Framing the impact for each audience is what makes this an L5 decision, not just a binary 'separate or not' answer. RLS (C) does not satisfy PCI infrastructure isolation requirements. Downgrading instances (D) may cause performance issues. PCI-DSS does not have a general exception process for shared infrastructure (E is misleading).",
      "context": {
        "Current setup": "Shared Cloud SQL instance",
        "Cost saving": "$800/month",
        "PCI scope impact": "Service B becomes in-scope",
        "Estimated compliance cost": "$15-50k/year additional audit effort"
      }
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 3,
      "q": "The query planner chooses a sequential scan despite a relevant index. ANALYZE was run recently. What is the next diagnostic step?",
      "opts": [
        "The index is the wrong type — rebuild it as a BRIN index",
        "The query has too many JOINs — break it into smaller queries",
        "Check planner cost constants (random_page_cost, effective_cache_size) and index selectivity via pg_stats",
        "Restart the Cloud SQL instance to clear the planner cache",
        "The index is corrupt — drop and rebuild it"
      ],
      "ans": 2,
      "fb": "Miscalibrated cost constants (random_page_cost set too high for SSD storage) or poor selectivity estimates in pg_stats cause the planner to undervalue the index. On Cloud SQL SSDs, random_page_cost can be lowered from 4 to ~1.1."
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 3,
      "q": "You are defining a platform-wide primary key standard. Three teams have different practices: Team A uses SERIAL (32-bit integer), Team B uses UUID v4, and Team C uses BIGSERIAL. The payments table (Team A) is growing at 2M rows/month and has been running for 3 years. You need to set a standard that balances performance, future-proofing, and cross-service compatibility. A senior engineer argues that UUID v4 should be the universal standard because it avoids all overflow risks. What is the most nuanced recommendation?",
      "opts": [
        "Mandate BIGSERIAL for all new tables as the default, with UUID v7 (time-ordered) as the approved alternative for tables that need globally unique IDs across services; flag Team A's SERIAL columns for migration planning before they approach the 2.1 billion row limit",
        "Let each team choose their own PK strategy — standardisation adds no value for primary keys",
        "Mandate UUID v4 for all tables — the senior engineer is correct that it eliminates overflow risk and the performance impact is negligible",
        "Mandate BIGSERIAL but explicitly prohibit UUIDs due to index bloat on B-tree indexes",
        "Mandate SERIAL for all tables — 32-bit integers are sufficient and more performant than alternatives"
      ],
      "ans": 0,
      "fb": "The nuanced recommendation addresses three concerns: (1) SERIAL's 2.1 billion row limit is a ticking time bomb for high-volume tables — Team A's payments table at 2M rows/month will hit it in ~75 years (safe) but higher-volume tables could hit it much sooner; (2) UUID v4 eliminates overflow but causes B-tree index fragmentation due to random ordering, increasing write amplification and cache misses — UUID v7 (time-ordered) preserves the benefits of sequential inserts while providing global uniqueness; (3) BIGSERIAL (64-bit) is the safe default for tables that don't need cross-service uniqueness, and UUID v7 is the right choice when IDs must be meaningful across service boundaries. Mandating UUID v4 universally (A) ignores the measurable performance impact of random key distribution on large tables. Mandating SERIAL (C) ignores the overflow risk. No standard (D) leads to inconsistent APIs and migration surprises. Prohibiting UUIDs entirely (E) is too restrictive for legitimate cross-service use cases.",
      "context": {
        "Team A": "SERIAL, 2M rows/month, 3 years running (~72M rows)",
        "Team B": "UUID v4, index size 2.5x larger than equivalent BIGSERIAL",
        "Team C": "BIGSERIAL, no issues reported",
        "SERIAL limit": "~2.1 billion rows (32-bit signed integer)"
      }
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 3,
      "q": "A query WHERE email ILIKE '%@acme.com' on 10M rows is slow despite an index on email. What explains this, and what is the correct fix?",
      "opts": [
        "Switch to LIKE — ILIKE is case-insensitive which forces a seq scan",
        "The leading wildcard prevents B-tree index use regardless of operator; install pg_trgm and create a GIN trigram index on email",
        "Partition the table by email domain to enable partition pruning on @acme.com",
        "The ILIKE operator requires a special index type — rebuild the index as a GIN index on the email column",
        "The index was created with default collation — rebuild with text_pattern_ops"
      ],
      "ans": 1,
      "fb": "A leading wildcard (%) disables B-tree index use. pg_trgm breaks text into 3-character sequences and indexes all of them, making any substring search fast."
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 0,
      "q": "A team building a new lending product proposes storing loan application data in a JSONB column on the core loans table. Their argument: loan products vary significantly (personal loans have different fields from mortgage loans) and using JSONB avoids frequent schema migrations. The loans table will be subject to SOX audit requirements. Three other teams will need to query this data for reporting, risk scoring, and compliance. You are leading the architecture review. What is the correct decision framework?",
      "opts": [
        "Separate the data into two categories: known, stable attributes required by all consumers (amount, term, rate, status, applicant_id) must be typed columns with constraints and indexes; genuinely variable product-specific attributes (which differ by loan type and change frequently) may use a JSONB column with a documented JSON schema, GIN index for common query paths, and a commitment to promote any field that becomes a cross-team query target into a typed column",
        "Approve JSONB but require the team to write a custom validation trigger that enforces a schema on every INSERT and UPDATE",
        "Approve JSONB for all loan attributes — schema flexibility is more important than query efficiency for a rapidly evolving product",
        "Reject JSONB entirely — regulated financial tables must never use JSONB columns due to compliance requirements",
        "Create a separate table per loan product type (personal_loans, mortgage_loans, etc.) with product-specific typed columns, linked to a parent loans table via foreign key"
      ],
      "ans": 0,
      "fb": "The correct framework distinguishes between stable domain attributes and genuinely variable attributes. Known attributes like amount, rate, term, and status are queried by multiple teams, need indexes for performance, and require NOT NULL / CHECK constraints for data integrity — these must be typed columns. Variable product-specific attributes (e.g., a mortgage's LTV ratio that does not exist on personal loans) are legitimate JSONB candidates, but with guardrails: a documented JSON schema (even if not enforced at the DB level), a GIN index for common access patterns, and a promotion policy for any field that becomes a cross-team dependency. Option A is too restrictive — JSONB has legitimate uses even in regulated domains. Option B sacrifices query performance and data integrity for development convenience. Option D (validation trigger) adds runtime overhead and is harder to maintain than application-layer validation with a JSON schema. Option E (table-per-type) is viable but creates schema management complexity that scales poorly as product types multiply.",
      "context": {
        "Product types": "Personal loans, mortgage loans, auto loans (3 today, 8 planned)",
        "Consumers": "4 teams need to query loan data",
        "SOX requirement": "Audit trail on all loan attribute changes",
        "Trade-off": "Schema flexibility vs query performance and constraint enforcement"
      }
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 4,
      "q": "Cloud SQL storage costs have tripled in 6 months with no significant data growth. What are the most likely causes?",
      "opts": [
        "Replication lag is causing the primary to retain extra WAL files indefinitely",
        "Cloud SQL billing has a bug — open a support ticket",
        "CMEK triples storage consumption due to encryption overhead",
        "Storage auto-increase added capacity that cannot auto-reduce; WAL retained for replicas; and backup retention all accumulate over time",
        "Table partitioning multiplies storage due to partition overhead"
      ],
      "ans": 3,
      "fb": "Cloud SQL storage only auto-increases, never auto-decreases. WAL retained for replicas accumulates. Backup retention multiplied by snapshot count accumulates."
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 0,
      "q": "Service A (payments) proposes directly querying Service B's (accounts) database tables to avoid the latency of an API call on the critical payment path. The API call adds 12ms p99 latency. The direct DB query would add 2ms. The payment SLO is 50ms p99. Three teams are involved: payments (Service A), accounts (Service B), and platform engineering. You are facilitating the decision. What is the correct architectural recommendation?",
      "opts": [
        "Reject the direct query and recommend moving both services into a single service to eliminate the network call entirely",
        "Allow the direct DB query with a formal read-only access agreement — the 10ms latency reduction is significant for the SLO",
        "Allow the direct query but only through a read-only database view that Service B maintains as a stable API surface",
        "Reject the direct query and tell Service A to accept the 12ms latency as the cost of proper service boundaries",
        "Reject the direct query and recommend that Service A cache account data locally with a TTL-based invalidation strategy, accepting that cached data may be slightly stale but keeping services decoupled; additionally investigate why the API call takes 12ms and whether it can be optimised"
      ],
      "ans": 4,
      "fb": "Direct cross-service DB access creates invisible coupling: Service B cannot safely rename columns, change data types, or reorganise tables without coordinating with Service A. This coupling compounds over time and is one of the most expensive architectural debts in microservice platforms. However, simply rejecting the request without addressing the SLO concern is not helpful. The correct recommendation has two parts: (1) cache account data locally in Service A (using a Kafka event stream from Service B or a TTL-based cache) to eliminate the API call on the hot path, and (2) investigate the 12ms API latency — this is often caused by unnecessary serialisation, missing connection pooling, or N+1 patterns that can be fixed. A read-only view (D) is a better form of coupling than raw table access but still couples Service A to Service B's database schema and deployment. Merging services (E) is a drastic response to a latency concern.",
      "context": {
        "Latency": "API call 12ms p99, direct DB query 2ms p99",
        "SLO": "Payment path 50ms p99 end-to-end",
        "Coupling risk": "Service B cannot evolve schema independently",
        "Recommendation": "Local cache + investigate API latency"
      }
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 0,
      "q": "VP Engineering asks you to evaluate Cloud SQL PostgreSQL vs AlloyDB for a new high-throughput analytics service. VP Finance wants to understand cost implications. VP Product wants to know if AlloyDB will speed up their reporting features. Each VP will attend a separate 30-minute briefing. What is the most effective way to structure the evaluation and stakeholder communication?",
      "opts": [
        "Present the same technical comparison document to all three VPs — consistency in messaging is more important than audience-specific framing",
        "Defer the evaluation until AlloyDB has been GA for at least 2 years to reduce adoption risk",
        "Present only the cost comparison — if AlloyDB is cheaper, adopt it; if not, stay on Cloud SQL",
        "Structure three distinct presentations: for VP Engineering, focus on operational maturity (AlloyDB is newer with less ecosystem tooling), migration risk, and team readiness; for VP Finance, compare 3-year TCO including AlloyDB's per-node pricing vs Cloud SQL's instance-based pricing at projected data volumes; for VP Product, demonstrate AlloyDB's columnar engine with a prototype of the actual reporting queries to show concrete latency improvements",
        "Recommend AlloyDB unconditionally because Google positions it as the next generation of Cloud SQL"
      ],
      "ans": 3,
      "fb": "An authority-level technology evaluation requires translating the same technical analysis into different frames for different stakeholders. VP Engineering cares about operational risk and team capability. VP Finance cares about total cost of ownership over the planning horizon. VP Product cares about whether the technology delivers user-visible improvements. A single document for all three (A) fails to answer each VP's specific questions. Unconditional recommendation (C) skips the analysis. Deferring (D) fails to address the current business need. Cost-only comparison (E) ignores operational risk and capability fit. The prototype for VP Product is critical — abstract claims about 'faster analytics' are not convincing without concrete evidence on their actual query patterns.",
      "context": {
        "Evaluation": "Cloud SQL PostgreSQL 16 vs AlloyDB",
        "Stakeholders": "VP Engineering (operational risk), VP Finance (TCO), VP Product (feature impact)",
        "Service": "New analytics service, 500GB initial data, growing 100GB/month"
      }
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 0,
      "q": "The CTO proposes migrating from Cloud SQL to self-managed PostgreSQL on GKE to save costs after seeing a 40% YoY Cloud SQL spend increase. The platform team has no Kubernetes operator experience for stateful workloads. The engineering director asks you to provide a decision recommendation within 2 weeks. How do you structure the assessment?",
      "opts": [
        "Recommend against migration immediately — self-managed databases on Kubernetes are never appropriate for regulated financial platforms",
        "Build a TCO model comparing Cloud SQL costs against self-managed costs including: infrastructure (GKE nodes, persistent disks), engineering investment (operator evaluation, runbook development, DR testing), ongoing operational burden (on-call for database infrastructure, patching, HA management), and risk premium (quantify the cost of a database-related outage that would not occur on Cloud SQL); present a break-even analysis showing at what scale self-managed becomes cheaper",
        "Recommend migration to reduce costs — Cloud SQL is overpriced and the team can learn Kubernetes operators quickly",
        "Recommend a 6-month proof of concept running a non-critical service on self-managed PostgreSQL before making any platform-wide decision",
        "Recommend staying on Cloud SQL without analysis — the current spend is justified by managed service benefits"
      ],
      "ans": 1,
      "fb": "The CTO is asking a cost question but the answer requires a full TCO analysis, not just infrastructure cost comparison. Self-managed PostgreSQL eliminates Cloud SQL's managed service premium but introduces: operator evaluation and deployment (CloudNativePG, Zalando operator), persistent disk management, backup automation, HA configuration and testing, patching cadence ownership, and on-call burden for database infrastructure incidents. The break-even analysis shows at what Cloud SQL spend level the engineering investment pays off. Most organisations find that self-managed is only cheaper above $500k-$1M/year in Cloud SQL spend, because the engineering hours for operational ownership are significant. Dismissing self-managed entirely (A) ignores legitimate cost concerns. Recommending migration without analysis (C) ignores the operational burden. Staying without analysis (D) fails to address the CTO's concern. A POC (E) is a reasonable step but should follow the TCO analysis, not precede it — you need to know if the economics justify even starting a POC.",
      "context": {
        "Cloud SQL spend": "~$220k/year, growing 40% YoY",
        "Team capability": "No Kubernetes stateful workload experience",
        "Platform": "PCI-DSS regulated financial services",
        "Decision timeline": "2 weeks for recommendation"
      }
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 4,
      "q": "A team proposes adding a Redis read-through cache for account balance queries running at 10,000 req/s. The current Cloud SQL instance handles this load but p99 latency is 25ms and the SLO is 15ms. The platform has no existing caching infrastructure. You are asked to provide an architecture review before the team begins implementation. What are the critical questions that must be answered before approving this proposal, and which one is the most important?",
      "opts": [
        "The most important question is whether to use Cloud Memorystore (managed Redis) vs self-hosted Redis on GKE",
        "The most important question is Redis cluster sizing — ensure the cache can hold the working set in memory",
        "The most important question is whether the team should use Redis or Memcached, since Memcached has lower latency for simple key-value lookups",
        "The most important question is Redis data persistence configuration — ensuring balance data survives Redis restarts",
        "The most important question is cache invalidation strategy: when a balance changes (debit/credit), how is the cache entry invalidated or updated? What happens during a Redis failover — can the application fall back to Cloud SQL without breaching the SLO? What is the acceptable staleness window for balance reads, given regulatory requirements around balance accuracy?"
      ],
      "ans": 4,
      "fb": "Account balance data has strong consistency requirements — a customer should not see a stale balance after a transaction. The cache invalidation strategy is the most critical architectural question because it determines whether the system can maintain correctness. Three sub-questions must be answered: (1) Write-through vs write-behind vs invalidate-on-write? Each has different consistency guarantees. (2) Redis failover behaviour: if Redis becomes unavailable, can all 10,000 req/s fall back to Cloud SQL without exceeding the 25ms p99 that prompted the caching proposal in the first place? (3) Staleness tolerance: for a regulated financial platform, is any staleness acceptable? If not, the cache must use synchronous write-through invalidation, which adds complexity. Sizing (A) is important but secondary — a correctly-sized cache with wrong invalidation is worse than no cache at all. Managed vs self-hosted (C) is an operational decision, not an architectural one. Persistence (D) is important for recovery but secondary to correctness. Redis vs Memcached (E) is a tooling choice, not the critical architectural question.",
      "context": {
        "Load": "10,000 req/s for balance lookups",
        "Current p99": "25ms (Cloud SQL direct)",
        "SLO": "15ms p99",
        "Data sensitivity": "Account balances — regulatory accuracy requirements",
        "New infrastructure": "No existing caching layer on the platform"
      }
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 1,
      "q": "A regional outage takes down your Cloud SQL primary. The failover replica is in the same region. What does this reveal?",
      "opts": [
        "Same-region replicas don't protect against regional outages — evaluate cross-region replicas or graceful degradation design",
        "Move the entire data tier to Firestore for global multi-region availability",
        "This is a Cloud SQL limitation — all managed databases have the same regional risk",
        "Cloud SQL HA protects against zone failures — this is sufficient protection for most use cases",
        "Acceptable — regional outages are rare and Cloud SQL SLA covers this"
      ],
      "ans": 0,
      "fb": "Cloud SQL HA = zone-level protection only. True regional resilience requires cross-region replicas with tested promotion runbooks, or graceful degradation design."
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 3,
      "q": "You're designing the database architecture for a new PCI-DSS scoped service processing card transaction data. Which controls are non-negotiable at the database layer?",
      "opts": [
        "SSL/TLS in transit and password-based authentication with strong passwords",
        "PCI-DSS is an application-layer concern — no special database controls are required",
        "Row Level Security and encrypted columns for card numbers only",
        "Encrypted backups and a dedicated Cloud SQL instance for the PCI scope",
        "Private IP with no public endpoint, IAM auth via Auth Proxy, CMEK via Cloud KMS, Cloud Audit Logs for all data access, and documented data deletion procedures"
      ],
      "ans": 4,
      "fb": "PCI-DSS requires defence in depth at the database layer: no public IP, IAM-based auth via Auth Proxy, CMEK for encryption at rest including backups, Cloud Audit Logs with retention, and documented data deletion procedures."
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 2,
      "q": "Cloud SQL storage auto-increased to 10TB over two years. You want to right-size it. Cloud SQL storage cannot auto-decrease. What are your options?",
      "opts": [
        "Export data to Cloud Storage, delete and recreate the instance at the target size, then import",
        "Open a GCP support ticket to request a manual storage decrease",
        "Use Cloud SQL clones — they start at minimal storage and grow only as needed",
        "Promote a read replica (which has lower storage) to primary",
        "Enable storage auto-decrease in Cloud SQL settings — it was added in 2023"
      ],
      "ans": 0,
      "fb": "Cloud SQL storage cannot decrease — this is a hard platform limitation. The only path is export → delete → recreate → import. Document this limitation in platform standards to prevent over-allocation.",
      "context": {
        "Current storage": "10 TB",
        "Growth driver": "Auto-increase (irreversible)",
        "Goal": "Right-size the instance",
        "Platform limitation": "Storage cannot decrease"
      }
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 4,
      "q": "A service team says 'our service uses LISTEN/NOTIFY and server-side prepared statements — PgBouncer in transaction mode breaks this.' How do you respond?",
      "opts": [
        "Tell them to remove LISTEN/NOTIFY — it's not appropriate in a microservices architecture",
        "Create a separate PgBouncer instance just for this service without updating platform policy",
        "Override the team — PgBouncer transaction mode is mandatory for all services on the platform",
        "They are correct. Platform policy should define session mode as a documented exception for services with these requirements, with explicit trade-offs on connection count",
        "Use PgBouncer statement mode — it supports all session features including LISTEN/NOTIFY"
      ],
      "ans": 3,
      "fb": "Transaction-mode pooling breaks LISTEN/NOTIFY and server-side prepared statements. A mature platform policy acknowledges exceptions: document session-mode for affected services with the trade-off."
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 4,
      "q": "A production migration failed halfway through, leaving the schema in an inconsistent state. A postmortem is held. Which platform-level practices would prevent this class of failure?",
      "opts": [
        "Enforce expand-contract migration policy, validate migrations on a Cloud SQL clone before production, require tested rollback scripts, and use Liquibase checksums to detect partial runs",
        "Require all migrations to be run manually by a DBA to reduce automation risk",
        "Add a migration dry-run step in CI that connects to production read-only to verify syntax",
        "Run migrations inside a database transaction — if they fail, they roll back automatically",
        "Switch from Liquibase to Flyway — it handles partial failure recovery natively"
      ],
      "ans": 0,
      "fb": "Root causes: no validation on real data scale, no expand-contract discipline, and no tested rollback path. A Cloud SQL clone with production data is the only reliable pre-production validation."
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 3,
      "q": "You have spent 6 months establishing Cloud SQL platform standards (private IP, IAM auth, CMEK, connection pooling, expand-contract migrations). Adoption is at 60% — 24 of 40 teams follow the standards. The remaining 16 teams cite velocity concerns and continue using ad-hoc practices. A PCI-DSS audit is in 8 weeks. The CISO asks you to achieve 100% compliance. The VP Engineering says you cannot block any team's deployments. How do you resolve this conflict?",
      "opts": [
        "Automate all standards as infrastructure-as-code templates that teams must use, removing the ability to provision non-compliant instances",
        "Accept 60% adoption as sufficient and present the current compliance posture to the auditors with a remediation roadmap",
        "Implement a tiered compliance approach: classify standards as mandatory (private IP, IAM auth, CMEK — these are PCI-DSS requirements and non-negotiable for any service handling regulated data) versus recommended (connection pooling, migration practices — these improve reliability but are not audit-blocking); for the mandatory standards, provide automated compliance checks in CI/CD that flag non-compliance without blocking deploys for non-regulated services, while blocking deploys for PCI-scoped services; schedule 1:1 sessions with each non-compliant team to understand their specific blockers and provide migration support",
        "",
        "Escalate to the CTO to mandate compliance and block non-compliant deployments — the CISO's requirement overrides the VP's velocity concern",
        "Send a platform-wide email mandating compliance by a specific date, with consequences for non-compliance"
      ],
      "ans": 2,
      "fb": "The conflict between the CISO (100% compliance) and VP Engineering (no deployment blocking) requires a nuanced resolution that separates security-critical standards from operational best practices. Not all standards carry equal audit weight: private IP, IAM auth, and CMEK are directly tied to PCI-DSS controls and must be non-negotiable for services in PCI scope. Connection pooling and migration practices improve reliability but are not PCI audit findings. The tiered approach satisfies both stakeholders: PCI-scoped services get hard gates, non-regulated services get warnings with a remediation timeline. The 1:1 sessions with non-compliant teams are critical — velocity concerns often have specific, solvable root causes (e.g., unclear documentation, missing Terraform modules, unfamiliarity with Auth Proxy setup). Escalating to the CTO (A) creates organisational friction without solving the underlying adoption problem. Email mandates (C) are ignored. Accepting 60% (D) may not satisfy auditors for PCI-scoped services. Full automation (E) is the long-term goal but cannot be achieved in 8 weeks.",
      "context": {
        "Standards adoption": "60% (24/40 teams)",
        "Audit timeline": "8 weeks",
        "CISO requirement": "100% compliance for PCI-scoped services",
        "VP Engineering constraint": "Cannot block deployments",
        "Non-compliant teams": "16, citing velocity concerns"
      }
    },
    {
      "level": 1,
      "diff": 1,
      "scenario": 0,
      "q": "You need to list all orders placed by customers in a specific region. The `orders` table has a `customer_id` column and the `customers` table has a `region` column. Which query correctly retrieves order IDs for customers in the 'EMEA' region?",
      "opts": [
        "SELECT o.id FROM orders o, customers c WHERE c.region = 'EMEA'",
        "SELECT o.id FROM orders o CROSS JOIN customers c ON o.customer_id = c.id WHERE c.region = 'EMEA'",
        "SELECT o.id FROM orders o LEFT JOIN customers c ON o.customer_id = c.id WHERE c.region = 'EMEA'",
        "SELECT o.id FROM orders o JOIN customers c ON o.customer_id = c.id WHERE c.region = 'EMEA'",
        "SELECT o.id FROM orders o JOIN customers c WHERE c.region = 'EMEA'"
      ],
      "ans": 3,
      "fb": "Option A is correct: it uses an explicit INNER JOIN with the correct ON condition linking orders to customers, then filters by region. Option B is a Cartesian product (implicit join) missing the join predicate — it would return every order paired with every EMEA customer. Option C is invalid SQL — JOIN without ON is a syntax error in PostgreSQL. Option D (LEFT JOIN) would include orders whose customer_id has no match in customers, where c.region would be NULL and the WHERE clause would then exclude them anyway — but semantically it's misleading and can hide data integrity problems. Option E is invalid: CROSS JOIN does not accept an ON clause.",
      "context": {
        "Table: orders": "id, customer_id, amount, created_at",
        "Table: customers": "id, name, region",
        "Goal": "Return order IDs for EMEA customers only"
      }
    },
    {
      "level": 1,
      "diff": 1,
      "scenario": 0,
      "q": "A colleague's query returns duplicate rows when joining `invoices` to `line_items`. The `line_items` table has a foreign key `invoice_id`. What is the most likely cause of the duplicates?",
      "opts": [
        "The foreign key constraint is not enforced so orphan rows appear",
        "PostgreSQL does not support one-to-many JOINs without GROUP BY",
        "The JOIN is on a non-unique column — each invoice row is repeated once per matching line item",
        "The WHERE clause is missing, so all rows are returned",
        "The SELECT clause should use DISTINCT on the primary key"
      ],
      "ans": 2,
      "fb": "When you JOIN a parent table to a child table in a one-to-many relationship, each parent row appears once for every matching child row — that is the correct and expected behaviour of a JOIN. The result is not a bug; it reflects the data. Adding DISTINCT (option C) would hide the problem rather than fix it and would break aggregations. Option B is wrong because a missing WHERE clause returns all rows but does not create duplicates from a join. Option D is false — PostgreSQL fully supports one-to-many joins. Option E is a red herring; orphan rows would produce fewer rows, not more."
    },
    {
      "level": 1,
      "diff": 1,
      "scenario": 1,
      "q": "A Spring Boot entity class `Payment` is annotated with `@Table(name = \"payment_records\")` and has a field `tenantId` annotated with `@Column(name = \"tenant_id\")`. When you query the database directly, which column name should you use in your SQL WHERE clause?",
      "opts": [
        "TENANT_ID",
        "tenant_id",
        "tenantId",
        "TenantId",
        "payment_records_tenant_id"
      ],
      "ans": 1,
      "fb": "The `@Column(name = \"tenant_id\")` annotation explicitly maps the Java field `tenantId` to the database column `tenant_id`. PostgreSQL column names are case-insensitive unless quoted, but the physical name stored in the catalog is lowercase `tenant_id`. When writing SQL directly, use `tenant_id`. The Java camelCase name `tenantId` is only meaningful in Java code and JPQL — it does not exist as a column name. `TENANT_ID` would work in unquoted SQL since PostgreSQL folds identifiers to lowercase, but `tenant_id` is the conventional and explicit form."
    },
    {
      "level": 1,
      "diff": 1,
      "scenario": 1,
      "q": "Your JPA entity has a `@ManyToOne` relationship to a `Tenant` entity. How does Hibernate typically store this relationship in the database?",
      "opts": [
        "As a foreign key column in the owning entity's table pointing to the Tenant primary key",
        "As a separate join table with two foreign key columns",
        "As a column in the Tenant table pointing back to the owning entity",
        "As a stored procedure that resolves the relationship at query time",
        "As a JSON column embedding the Tenant object"
      ],
      "ans": 0,
      "fb": "A `@ManyToOne` maps to a foreign key column in the owning table. By default, Hibernate names this column `tenant_id` (derived from the field name) and stores the referenced entity's primary key. A separate join table (option B) is the default for `@ManyToMany`. A JSON column (option C) is not standard JPA behaviour. Option D reverses the direction — the FK lives in the owning side, not the referenced side. Option E describes a pattern that does not exist in standard relational mapping."
    },
    {
      "level": 1,
      "diff": 1,
      "scenario": 2,
      "q": "A Spring Boot service loads a list of 50 `Account` objects and then accesses `account.getOwner()` on each one in a loop. The `owner` field is a `@ManyToOne` with `fetch = FetchType.LAZY`. How many SQL queries does Hibernate typically execute?",
      "opts": [
        "50 — one query per account including its owner",
        "51 — one to load all accounts, then one per account to load each owner",
        "1 — Hibernate batches all owner lookups into a single query",
        "2 — one for accounts and one for all owners using an IN clause",
        "0 — lazy loading defers all queries until the transaction commits"
      ],
      "ans": 1,
      "fb": "This is the classic N+1 problem. With LAZY fetching, Hibernate issues one query to load the 50 Account rows, then issues one additional SELECT for each individual owner access inside the loop — totalling 51 queries. Option B (single batched query) only happens if you explicitly configure `@BatchSize` or use a JOIN FETCH in the JPQL. Option C is wrong — lazy loading does not include the owner in the initial query. Option D describes the behaviour of batch fetching, which is not enabled by default. Option E is wrong — lazy proxies execute SQL at the point of access, not at commit."
    },
    {
      "level": 1,
      "diff": 1,
      "scenario": 3,
      "q": "A junior developer is trying to connect a Spring Boot app running in GKE to a Cloud SQL PostgreSQL instance. They set the JDBC URL to the Cloud SQL instance's public IP directly. What is the primary security concern with this approach?",
      "opts": [
        "The connection will work but will have higher latency than using a private IP",
        "The connection bypasses Cloud SQL Auth Proxy, so traffic is not encrypted by default and credentials may be exposed",
        "Public IPs are not routable from within GKE pods",
        "Cloud SQL does not support JDBC connections over public IP",
        "Spring Boot does not support direct IP addresses in JDBC URLs"
      ],
      "ans": 1,
      "fb": "Connecting directly to a Cloud SQL public IP without the Auth Proxy means the application must manage its own TLS configuration and Cloud SQL authorised networks. The Auth Proxy handles mutual TLS authentication automatically, making it significantly harder to misconfigure security. Option B is false — public IPs are routable from GKE pods if the instance allows it. Option C is false — Cloud SQL does accept JDBC over public IP. Option D is partially true (latency may differ) but is not the primary security concern. Option E is false — JDBC URLs accept IP addresses."
    },
    {
      "level": 1,
      "diff": 1,
      "scenario": 3,
      "q": "The Cloud SQL Auth Proxy is configured as a sidecar container in a GKE pod. What port does the Spring Boot application typically connect to when using the proxy?",
      "opts": [
        "443 on the Cloud SQL instance's private IP",
        "8080 on the Cloud SQL Auth Proxy container's service IP",
        "5432 on the Cloud SQL instance's public IP",
        "3306 on localhost",
        "5432 on localhost (127.0.0.1)"
      ],
      "ans": 4,
      "fb": "The Cloud SQL Auth Proxy sidecar listens on `127.0.0.1:5432` within the pod. The Spring Boot application connects to `localhost:5432` just as if PostgreSQL were running locally. The proxy intercepts the connection, establishes an encrypted tunnel to Cloud SQL, and forwards traffic. Option B (public IP direct) bypasses the proxy. Option C (443) is not the standard proxy port. Option D (3306) is the MySQL default port. Option E describes a Kubernetes service, not the sidecar pattern."
    },
    {
      "level": 1,
      "diff": 1,
      "scenario": 4,
      "q": "A colleague says, 'We added an index on the `email` column but queries are still slow.' After checking, you notice the query is `SELECT * FROM users WHERE LOWER(email) = LOWER($1)`. Why does the index on `email` not help?",
      "opts": [
        "The index is on the raw column value but the query applies a function, so PostgreSQL cannot use a standard B-tree index on `email`",
        "LOWER() is not a valid PostgreSQL function",
        "The index is too new and has not been built yet",
        "Indexes on text columns are never used by PostgreSQL",
        "SELECT * forces a sequential scan regardless of indexes"
      ],
      "ans": 0,
      "fb": "A standard B-tree index on `email` stores the original values. When a function like `LOWER()` is applied in the WHERE clause, PostgreSQL cannot match the index entries to the transformed values and falls back to a sequential scan. The fix is to create a functional index: `CREATE INDEX ON users (LOWER(email))`. Option B is false — PostgreSQL uses indexes on text columns routinely. Option C is false — indexes are available immediately after creation. Option D is false — PostgreSQL can use indexes even with SELECT *. Option E is false — `LOWER()` is a standard PostgreSQL function."
    },
    {
      "level": 1,
      "diff": 1,
      "scenario": 4,
      "q": "What does it mean when a transaction is said to be 'atomic'?",
      "opts": [
        "The transaction is stored in memory and never written to disk",
        "Either all statements in the transaction succeed and are committed, or none of them are — partial completion is not possible",
        "The transaction cannot be rolled back once started",
        "Only one transaction can run at a time in the database",
        "The transaction executes faster because it uses a single CPU core"
      ],
      "ans": 1,
      "fb": "Atomicity is the 'A' in ACID. It guarantees that a transaction is treated as a single unit of work: either all its changes are applied (commit) or none of them are (rollback). This protects against partial updates that would leave the database in an inconsistent state — for example, debiting one account without crediting another. The other options describe performance, concurrency, or durability concepts that are unrelated to atomicity."
    },
    {
      "level": 1,
      "diff": 2,
      "scenario": 0,
      "q": "You need to find all tenants who have at least one active subscription but have never made a payment. The relevant tables are `tenants`, `subscriptions` (with a `status` column), and `payments`. Which query structure is correct?",
      "opts": [
        "SELECT t.id FROM tenants t JOIN subscriptions s ON t.id = s.tenant_id WHERE s.status != 'inactive' AND payments.tenant_id IS NULL",
        "SELECT t.id FROM tenants t WHERE NOT EXISTS (SELECT 1 FROM subscriptions WHERE tenant_id = t.id AND status = 'active')",
        "SELECT t.id FROM tenants t JOIN subscriptions s ON t.id = s.tenant_id WHERE s.status = 'active' AND t.id NOT IN (SELECT tenant_id FROM payments)",
        "SELECT t.id FROM tenants t LEFT JOIN payments p ON t.id = p.tenant_id WHERE p.tenant_id IS NULL",
        "SELECT t.id FROM tenants t JOIN subscriptions s ON t.id = s.tenant_id WHERE s.status = 'active' AND t.id NOT IN (SELECT id FROM payments)"
      ],
      "ans": 2,
      "fb": "Option A correctly joins tenants to active subscriptions and then excludes tenants who have any row in the payments table using NOT IN with the correct column `tenant_id`. Option B has a bug: `SELECT id FROM payments` selects the payment's own primary key, not the tenant_id — so the NOT IN comparison is meaningless. Option C finds tenants with no payments but ignores the active subscription requirement. Option D inverts the logic — it finds tenants WITHOUT active subscriptions. Option E references `payments.tenant_id` without a proper join, which is invalid SQL.",
      "context": {
        "Table: tenants": "id, name",
        "Table: subscriptions": "id, tenant_id, status",
        "Table: payments": "id, tenant_id, amount, paid_at"
      }
    },
    {
      "level": 1,
      "diff": 2,
      "scenario": 0,
      "q": "A query joins three tables — `orders`, `order_items`, and `products` — and uses a WHERE clause to filter by `products.category = 'electronics'`. The query returns 0 rows even though you can see matching products and orders exist separately. What is the most likely cause?",
      "opts": [
        "One of the JOINs uses the wrong column, causing no rows to match the join condition",
        "PostgreSQL does not support three-table JOINs",
        "The WHERE clause must come before the JOIN clauses",
        "INNER JOIN requires all three tables to have the same number of rows",
        "The category column contains trailing whitespace in the data"
      ],
      "ans": 0,
      "fb": "When a multi-table JOIN returns 0 rows despite data existing in each table individually, the most likely cause is an incorrect join condition — for example, joining `order_items.product_id` to `products.order_id` instead of `products.id`. This produces an empty set. Option B is false — PostgreSQL supports arbitrarily many joins. Option C is false — WHERE clause placement after JOINs is correct SQL syntax. Option D (trailing whitespace) would cause partial mismatches, not zero rows universally. Option E is false — INNER JOIN works regardless of row count differences between tables."
    },
    {
      "level": 1,
      "diff": 2,
      "scenario": 1,
      "q": "A Liquibase migration creates a table called `UserProfile` using that exact casing. A developer then runs `SELECT * FROM userprofile` in psql and gets an error. Why?",
      "opts": [
        "PostgreSQL folds unquoted identifiers to lowercase, but the table was created with a quoted mixed-case name and is stored as `UserProfile` — you must use double quotes to reference it",
        "The table name exceeds PostgreSQL's 32-character identifier limit",
        "PostgreSQL converts all table names to uppercase at creation time",
        "psql does not support lowercase queries",
        "Liquibase automatically adds a schema prefix that must be included"
      ],
      "ans": 0,
      "fb": "PostgreSQL folds unquoted identifiers to lowercase. If the migration used a quoted identifier like `CREATE TABLE \"UserProfile\"`, the table name is stored exactly as `UserProfile` (mixed case) in the catalog. Querying without quotes — `SELECT * FROM userprofile` — looks for a table named `userprofile` (all lowercase) which does not exist. The fix is `SELECT * FROM \"UserProfile\"`. Best practice in Liquibase is to use snake_case (`user_profile`) and never quote identifiers. Option B is false — PostgreSQL folds to lowercase, not uppercase. Options C, D, E are all false."
    },
    {
      "level": 1,
      "diff": 2,
      "scenario": 1,
      "q": "Your team stores customer addresses in a `customers` table with columns `street`, `city`, `postcode`, and `country`. A new requirement asks you to support multiple addresses per customer (billing, shipping, etc.). Which data model change best reflects this relationship?",
      "opts": [
        "Add an `address_type` enum column to `customers` and duplicate the row for each address type",
        "Add `billing_street`, `billing_city`, `shipping_street`, `shipping_city` columns to `customers`",
        "Create two separate tables: `billing_addresses` and `shipping_addresses`, each with a `customer_id`",
        "Store all addresses as a JSON array in a single `addresses` column on `customers`",
        "Create a separate `addresses` table with a foreign key `customer_id` and an `address_type` column"
      ],
      "ans": 4,
      "fb": "A separate `addresses` table with `customer_id` FK and `address_type` column is the standard normalised approach. It avoids column proliferation (option A), keeps data queryable without JSON parsing (option C), avoids redundant tables with near-identical schemas (option D), and avoids row duplication on the parent entity (option E). This pattern also makes it easy to add more address types in future without schema changes.",
      "context": {
        "Current table": "customers(id, name, street, city, postcode, country)",
        "New requirement": "Support billing and shipping addresses per customer",
        "Constraint": "Addresses must be independently queryable"
      }
    },
    {
      "level": 1,
      "diff": 2,
      "scenario": 2,
      "q": "You're reviewing a Spring Boot service and notice that a REST endpoint loads a `Contract` entity which has a `@OneToMany(fetch = FetchType.LAZY)` collection of `Clause` objects. The endpoint serialises the full contract including clauses to JSON. What problem will likely occur in production?",
      "opts": [
        "Hibernate will load all clauses eagerly regardless of the FetchType setting",
        "Cloud SQL Auth Proxy will timeout because too many queries are sent",
        "The JSON serialiser will skip the clauses field because it is a collection type",
        "LazyInitializationException when the JSON serialiser accesses the clauses collection outside the transaction boundary",
        "The endpoint will return an empty clauses list because lazy loading never executes"
      ],
      "ans": 3,
      "fb": "When the transaction ends (typically at the service or repository method boundary in Spring), the Hibernate session closes. If the Jackson serialiser then tries to access the lazy-loaded `clauses` collection outside the session, Hibernate throws `LazyInitializationException`. This is a very common Spring Boot pitfall. Option B is wrong — lazy loading does execute when accessed within a session. Option C is wrong — FetchType.LAZY is respected by Hibernate. Option D is wrong — Jackson serialises collections. Option E is wrong — this is an application-level Hibernate error, not a connection timeout."
    },
    {
      "level": 1,
      "diff": 2,
      "scenario": 2,
      "q": "A service method fetches a list of 100 `Invoice` entities and then calls `invoice.getLineItems().size()` on each one in a loop. The `lineItems` field uses default LAZY fetching. What SQL pattern will you observe in the application logs?",
      "opts": [
        "A single SELECT with a JOIN that retrieves all invoices and their line items together",
        "A single SELECT using an IN clause to retrieve all line items at once",
        "No SQL at all — Hibernate caches all data from the previous request",
        "100 parallel asynchronous SELECTs issued concurrently by Hibernate",
        "One SELECT for invoices followed by 100 individual SELECT statements for line items — one per invoice"
      ],
      "ans": 4,
      "fb": "This is the N+1 query problem in practice. One query loads the 100 Invoice rows. Then, for each invoice, accessing `getLineItems()` triggers a separate SELECT for that invoice's line items — 100 more queries. Total: 101 queries. Option B (JOIN fetch) only happens if you use `JOIN FETCH` in JPQL or a query annotation. Option C is false — Hibernate is single-threaded per request. Option D (IN clause) requires `@BatchSize` configuration. Option E is false — Hibernate's first-level cache is per-session and would not persist across requests.",
      "context": {
        "Entity": "Invoice with @OneToMany(fetch = LAZY) List<LineItem> lineItems",
        "Loop": "invoices.forEach(i -> total += i.getLineItems().size())",
        "Log pattern": "select * from invoices; select * from line_items where invoice_id=1; select * from line_items where invoice_id=2; ..."
      }
    },
    {
      "level": 1,
      "diff": 2,
      "scenario": 3,
      "q": "A developer is deploying a new Spring Boot microservice to GKE. The pod starts successfully but the application logs show `Connection refused` when attempting to connect to Cloud SQL. The Auth Proxy sidecar is defined in the pod spec. What is the most likely cause?",
      "opts": [
        "HikariCP does not support Cloud SQL Auth Proxy connections",
        "The Cloud SQL instance is in a different GCP project and cannot be reached",
        "The Auth Proxy does not support PostgreSQL 16",
        "The Auth Proxy container takes a few seconds to become ready, and the Spring Boot app started before the proxy was accepting connections",
        "The JDBC URL is using the wrong database name"
      ],
      "ans": 3,
      "fb": "In Kubernetes, all containers in a pod start concurrently. The Spring Boot app may attempt its first JDBC connection before the Auth Proxy sidecar has finished initialising and is ready to accept connections. The fix is to add a readiness check or startup delay, or to configure HikariCP with retry logic (`initializationFailTimeout`). Option B is false — Auth Proxy supports all PostgreSQL versions. Option C would cause an authentication error, not connection refused. Option D would cause a network error at a different stage. Option E is false — HikariCP connects via standard JDBC."
    },
    {
      "level": 1,
      "diff": 2,
      "scenario": 4,
      "q": "A table `events` has no indexes except on the primary key `id`. A query `SELECT * FROM events WHERE tenant_id = $1 AND event_type = 'LOGIN' ORDER BY created_at DESC LIMIT 20` is slow. Which index would most directly improve this query?",
      "opts": [
        "CREATE INDEX ON events (tenant_id, event_type, created_at DESC)",
        "CREATE INDEX ON events (tenant_id) INCLUDE (event_type)",
        "CREATE INDEX ON events (created_at DESC)",
        "CREATE INDEX ON events (id, tenant_id)",
        "CREATE INDEX ON events (event_type)"
      ],
      "ans": 0,
      "fb": "The query filters on both `tenant_id` and `event_type` (equality predicates) and then sorts by `created_at DESC`. A composite index on `(tenant_id, event_type, created_at DESC)` allows PostgreSQL to satisfy the equality filters and serve the ORDER BY from the index in order, enabling an efficient index scan without a separate sort step. Option B only covers the sort — it would require scanning all rows first. Option C only covers `event_type`. Option D includes `id` which adds no benefit since the primary key is already indexed. Option E (INCLUDE) only covers the filter but not the sort direction."
    },
    {
      "level": 1,
      "diff": 2,
      "scenario": 4,
      "q": "A developer wraps two INSERT statements in a transaction, but the second INSERT violates a NOT NULL constraint. What happens to the first INSERT?",
      "opts": [
        "The first INSERT remains pending until the developer manually rolls back",
        "The first INSERT is committed immediately because it succeeded",
        "PostgreSQL commits the first INSERT and skips the second",
        "PostgreSQL retries the second INSERT with a NULL value substituted",
        "The entire transaction is rolled back — the first INSERT is also undone"
      ],
      "ans": 4,
      "fb": "PostgreSQL follows ACID atomicity: when any statement in a transaction causes an error (such as a constraint violation), the transaction enters an aborted state. All subsequent statements in that transaction block fail with 'ERROR: current transaction is aborted'. When the transaction is rolled back (explicitly or at session end), all changes including the first INSERT are undone. The first INSERT is not committed independently. Option B is the most common misconception. Options C, D, and E do not reflect PostgreSQL's transaction error handling."
    },
    {
      "level": 1,
      "diff": 3,
      "scenario": 0,
      "q": "You need to produce a report of all customers along with their most recent order date, including customers who have never placed an order (showing NULL for the order date). Which query is correct?",
      "opts": [
        "SELECT c.id, MAX(o.created_at) FROM orders o RIGHT JOIN customers c ON o.customer_id = c.id",
        "SELECT c.id, MAX(o.created_at) FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.id",
        "SELECT c.id, o.created_at FROM customers c LEFT JOIN orders o ON c.id = o.customer_id ORDER BY o.created_at DESC",
        "SELECT c.id, MAX(o.created_at) FROM customers c LEFT JOIN orders o ON c.id = o.customer_id GROUP BY c.id",
        "SELECT c.id, COALESCE(MAX(o.created_at), 'never') FROM customers c LEFT JOIN orders o ON c.id = o.customer_id"
      ],
      "ans": 3,
      "fb": "Option A is correct: LEFT JOIN ensures customers with no orders appear (with NULL joined columns), and MAX(created_at) aggregates per customer with GROUP BY. Customers with no orders get MAX(NULL) = NULL. Option B uses INNER JOIN which excludes customers with no orders. Option C returns one row per order, not one row per customer, and without aggregation a customer with many orders appears many times. Option D (RIGHT JOIN without GROUP BY) is missing the GROUP BY and would fail. Option E uses COALESCE correctly to replace NULL, but comparing a timestamp to the string 'never' causes a type error in PostgreSQL — COALESCE requires matching types."
    },
    {
      "level": 1,
      "diff": 3,
      "scenario": 0,
      "q": "A query uses `WHERE status IN ('active', 'pending') AND deleted_at IS NULL`. The table has a composite index on `(status, deleted_at)`. You run EXPLAIN and see a Seq Scan instead of an Index Scan. The table has 10 million rows and 60% have status 'active' or 'pending'. Why did PostgreSQL choose a sequential scan?",
      "opts": [
        "IN clauses are never index-eligible in PostgreSQL",
        "The query matches 60% of the table; the planner estimated a sequential scan is cheaper than random I/O to retrieve that many rows via the index",
        "PostgreSQL does not support IS NULL predicates in index scans",
        "The composite index ordering is wrong — deleted_at must come before status",
        "The index is corrupted and needs to be rebuilt with REINDEX"
      ],
      "ans": 1,
      "fb": "PostgreSQL's query planner compares the estimated cost of using an index versus a sequential scan. For very selective queries (few rows returned), an index scan wins because it avoids reading most of the table. But when a query matches a large fraction of rows (60% in this case), random I/O to fetch those rows via the index is slower than a single sequential pass through the table. The planner made the correct decision. Option B is false — PostgreSQL can use indexes with IS NULL. Option C is false — the leading column should be the most selective equality predicate. Option D is false — IN clauses are index-eligible. Option E is a last resort diagnosis with no evidence here."
    },
    {
      "level": 1,
      "diff": 3,
      "scenario": 1,
      "q": "A Hibernate entity `Order` has a field `BigDecimal totalAmount` mapped to a column `total_amount`. A developer reports that saving an Order with `totalAmount = 99.999` and reading it back gives `100.00`. What is the most likely cause?",
      "opts": [
        "The Cloud SQL Auth Proxy truncates numeric precision in transit",
        "The column is defined as NUMERIC(10,2) which rounds to 2 decimal places on storage",
        "Hibernate rounds all BigDecimal values to 2 places before sending them to the database",
        "BigDecimal cannot represent 99.999 exactly in Java",
        "PostgreSQL converts all decimal values to float8 internally"
      ],
      "ans": 1,
      "fb": "PostgreSQL's NUMERIC(p,s) type stores exactly `s` decimal digits. A column defined as `NUMERIC(10,2)` stores at most 2 fractional digits — so 99.999 is rounded to 100.00 at the database level. This is a schema definition problem, not a Java, Hibernate, or network issue. Option B is wrong — BigDecimal can represent 99.999 exactly. Option C is wrong — Hibernate passes the exact BigDecimal value to the JDBC driver. Option D is wrong — PostgreSQL NUMERIC is arbitrary precision and is not stored as float8. Option E is wrong — the proxy is a transparent TCP tunnel."
    },
    {
      "level": 1,
      "diff": 3,
      "scenario": 1,
      "q": "A developer creates a Hibernate entity with `@GeneratedValue(strategy = GenerationType.AUTO)`. In production on PostgreSQL 16, the app creates a table called `hibernate_sequence` and increments it for every INSERT. Performance degrades significantly under load. What is the root cause and the correct fix?",
      "opts": [
        "The fix is to switch to GenerationType.IDENTITY which uses PostgreSQL SERIAL",
        "GenerationType.AUTO on PostgreSQL uses a single shared sequence table by default in older Hibernate versions, creating a bottleneck; the fix is to switch to GenerationType.SEQUENCE with a dedicated sequence and allocationSize > 1",
        "GenerationType.AUTO creates a UUID for each row, which is slower than integer IDs",
        "PostgreSQL 16 deprecated sequence tables and requires UUIDs for primary keys",
        "The hibernate_sequence table needs an index on its value column"
      ],
      "ans": 1,
      "fb": "In older Hibernate versions, `GenerationType.AUTO` on PostgreSQL defaults to a table-based sequence (`hibernate_sequence`) rather than a native PostgreSQL sequence. This table requires an UPDATE and SELECT for every INSERT, and under concurrent load becomes a severe bottleneck due to row-level locking. The correct fix is `GenerationType.SEQUENCE` with `@SequenceGenerator(allocationSize = 50)`, which pre-allocates IDs in batches and uses a native PostgreSQL sequence — a far more scalable approach. Option B is wrong — AUTO with Hibernate does not use UUIDs. Option C adding an index does not help the locking problem. Option D is false — PostgreSQL 16 has not deprecated sequences. Option E (IDENTITY) works but fetches the ID after each INSERT and cannot pre-allocate, so it is less efficient than batched SEQUENCE."
    },
    {
      "level": 1,
      "diff": 3,
      "scenario": 2,
      "q": "A Spring Boot service fetches `Payment` entities with a `@OneToMany` to `AuditEvent` using `JOIN FETCH` in JPQL. The method has `@Transactional(readOnly = true)`. In production, you observe that the same payment appears multiple times in the result list when it has multiple audit events. What is happening?",
      "opts": [
        "readOnly transactions prevent Hibernate from deduplicating entities",
        "HikariCP is routing the query to multiple read replicas and merging duplicate results",
        "JPQL does not support JOIN FETCH with @Transactional",
        "JOIN FETCH in JPQL produces a Cartesian product on the collection side — one Payment row per AuditEvent — and the DISTINCT keyword or a Set return type is needed to deduplicate",
        "The database is returning duplicate rows due to a bug in PostgreSQL 16"
      ],
      "ans": 3,
      "fb": "When JPQL uses JOIN FETCH on a collection, the SQL JOIN produces one result row per child entity. Hibernate maps these back to the parent entity, but the List result contains one Payment reference per AuditEvent — so a Payment with 3 audit events appears 3 times. Solutions include using `SELECT DISTINCT p` in JPQL, returning a `Set<Payment>`, or using `@QueryHints` with Hibernate's pass-distinct-through hint. Option B is false — readOnly only affects flushing and connection hints. Option C is false — JOIN FETCH is fully supported in @Transactional methods. Option D is false — this is a JPQL result mapping behaviour, not a PostgreSQL bug. Option E is false."
    },
    {
      "level": 1,
      "diff": 3,
      "scenario": 3,
      "q": "Your Cloud SQL Auth Proxy sidecar is running, and the Spring Boot app connects successfully during startup. After about 30 minutes in production, all new database requests fail with `SSL connection has been closed unexpectedly`. Existing HikariCP connections in the pool start failing too. What is the most likely cause?",
      "opts": [
        "HikariCP's maxLifetime is set to 30 minutes and is evicting connections at the wrong time",
        "The Cloud SQL instance ran out of storage and closed all connections",
        "The GKE node lost connectivity to Google's Certificate Authority",
        "The Auth Proxy rotates its mTLS certificates periodically and closes old connections; HikariCP must detect stale connections and reconnect",
        "Cloud SQL has a hard 30-minute session timeout for all connections"
      ],
      "ans": 3,
      "fb": "The Cloud SQL Auth Proxy periodically rotates its mTLS client certificates (approximately every hour by default, but the timing can vary). When rotation occurs, the proxy closes and re-establishes the underlying connection to Cloud SQL, which can cause existing application connections to receive an unexpected SSL closure. HikariCP needs to be configured with `connectionTestQuery` or `keepaliveTime` to detect and evict dead connections before they are returned to the application. Option B is false — Cloud SQL does not have a fixed 30-minute session timeout. Option C and D are plausible but not the primary cause. Option E would show storage-related errors, not SSL errors."
    },
    {
      "level": 1,
      "diff": 3,
      "scenario": 3,
      "q": "A GKE pod running a Spring Boot app with a Cloud SQL Auth Proxy sidecar is being terminated due to a rolling deployment. Inflight database transactions are being interrupted mid-way. What Kubernetes configuration would allow in-flight transactions to complete before the pod is fully stopped?",
      "opts": [
        "Use a PodDisruptionBudget to prevent rolling deployments from occurring",
        "Configure Cloud SQL Auth Proxy with `--max-connections=0` to drain connections",
        "Set `terminationGracePeriodSeconds` on the pod to a value longer than the maximum expected transaction duration, and handle SIGTERM in the application to stop accepting new requests",
        "Add a `preStop` hook that sleeps indefinitely to block pod termination",
        "Set the HikariCP `connectionTimeout` to 0 to allow unlimited wait time"
      ],
      "ans": 2,
      "fb": "When Kubernetes terminates a pod, it sends SIGTERM and then waits for `terminationGracePeriodSeconds` before sending SIGKILL. If the Spring Boot app handles SIGTERM by stopping new request acceptance and the grace period is long enough for in-flight transactions to complete, they will finish cleanly. This is the correct approach for graceful shutdown. Option B (connectionTimeout=0) controls how long to wait for a connection from the pool — it does not affect termination. Option C (indefinite sleep) is dangerous and would block deployments forever. Option D (PDB) controls disruption budgets but does not fix the transaction interruption problem. Option E is not a valid Auth Proxy flag."
    },
    {
      "level": 1,
      "diff": 3,
      "scenario": 3,
      "q": "A developer reports that their Spring Boot application can connect to Cloud SQL directly using a JDBC URL with the IP address, but the connection fails when the Cloud SQL Auth Proxy is running on localhost. The error is `Connection refused` on port 5432. What is the most likely cause?",
      "opts": [
        "The Cloud SQL Auth Proxy requires mTLS certificates to be placed in the application classpath",
        "The `spring.datasource.url` must use `jdbc:postgresql` rather than `jdbc:postgresql+ssl`",
        "The JDBC URL still points to the Cloud SQL public IP instead of `127.0.0.1:5432`",
        "The Cloud SQL Auth Proxy is not compatible with PostgreSQL 16 and must be downgraded",
        "The service account attached to the GKE pod does not have the `cloudsql.instances.connect` IAM permission"
      ],
      "ans": 2,
      "fb": "The Auth Proxy listens on localhost (127.0.0.1) on a configured port (default 5432). If the JDBC URL still points to the Cloud SQL public IP, the application bypasses the proxy entirely — and may fail due to IP allowlist restrictions or SSL requirements. The IAM permission issue (option C) would produce an authentication error from the proxy, not `Connection refused`. Options A and D are incorrect: the proxy handles TLS transparently, and it supports all PostgreSQL versions.",
      "context": {
        "Auth Proxy port": "127.0.0.1:5432 (default)",
        "Error observed": "Connection refused on localhost:5432",
        "JDBC URL in use": "jdbc:postgresql://<public-ip>:5432/mydb"
      }
    },
    {
      "level": 1,
      "diff": 3,
      "scenario": 4,
      "q": "Two concurrent transactions both execute `UPDATE accounts SET balance = balance - 100 WHERE id = 5` at the same time under READ COMMITTED isolation. What does PostgreSQL guarantee about the outcome?",
      "opts": [
        "The second UPDATE waits for the first to commit, then re-evaluates the row and applies its change to the committed value — so the balance is reduced by 200 in total",
        "PostgreSQL raises a serialization error and aborts one of the transactions",
        "Both transactions apply their changes simultaneously, potentially resulting in only one deduction of 100",
        "READ COMMITTED prevents any concurrent modifications to the same row",
        "The second transaction reads the pre-update balance and both deductions are lost"
      ],
      "ans": 0,
      "fb": "Under READ COMMITTED, PostgreSQL uses row-level locking for UPDATE statements. The first UPDATE acquires a row lock. The second UPDATE blocks until the first commits. After the first commits, the second UPDATE re-evaluates the WHERE clause against the newly committed row (this is the key READ COMMITTED behaviour for updates) and then applies its change. Result: balance is reduced by 200 total. Option B describes a lost update, which does not happen because of row locking. Option C (serialization error) only occurs under SERIALIZABLE isolation with a conflict. Option D is wrong — READ COMMITTED re-reads the committed row for updates. Option E is false — READ COMMITTED still allows concurrent access."
    },
    {
      "level": 2,
      "diff": 1,
      "scenario": 0,
      "q": "You are designing a schema to store multi-tenant payment records. Each payment belongs to exactly one tenant and one customer. Which schema correctly enforces these relationships?",
      "opts": [
        "Store tenant_id as a VARCHAR tag without a foreign key constraint to avoid join overhead",
        "Use a single `owner_id` column with a `type` column to distinguish between tenants and customers",
        "payments table with a single `owner_json` JSONB column containing both tenant and customer IDs",
        "A separate join table `tenant_customer_payments` linking all three entities",
        "payments table with tenant_id and customer_id foreign keys referencing tenants(id) and customers(id) respectively, with NOT NULL constraints on both"
      ],
      "ans": 4,
      "fb": "Option A is correct: normalised foreign keys with NOT NULL constraints enforce referential integrity at the database level — every payment must belong to a valid tenant and customer. Option B (JSONB) loses referential integrity, makes foreign key enforcement impossible, and complicates queries. Option C (join table) is the pattern for many-to-many relationships, not one-to-many. Option D (VARCHAR tag) sacrifices referential integrity for minimal performance gain. Option E (polymorphic ID) is an anti-pattern called polymorphic associations — it makes foreign keys impossible and complicates queries."
    },
    {
      "level": 2,
      "diff": 1,
      "scenario": 0,
      "q": "Which data type should you use in PostgreSQL 16 to store a monetary amount that requires exact decimal arithmetic with no rounding errors, such as a payment total?",
      "opts": [
        "MONEY",
        "FLOAT8 (double precision)",
        "NUMERIC(12, 4)",
        "REAL (float4)",
        "BIGINT storing the amount in cents"
      ],
      "ans": 2,
      "fb": "NUMERIC (also called DECIMAL) is the correct choice for exact monetary values. It stores numbers with arbitrary precision and no rounding errors. FLOAT8 and REAL use IEEE 754 floating-point representation, which cannot represent all decimal fractions exactly and will introduce rounding errors — unsuitable for financial data. The PostgreSQL MONEY type is locale-dependent (formatting varies by `lc_monetary` setting) and is generally discouraged for portable applications. BIGINT storing cents (option E) is a valid pattern, but NUMERIC(12,4) is a more direct answer when sub-cent precision is required."
    },
    {
      "level": 2,
      "diff": 1,
      "scenario": 0,
      "q": "You are designing a schema for a SaaS invoicing feature. Each invoice belongs to one tenant and has multiple line items. Each line item references a product from a shared product catalogue. Which schema design correctly models these relationships?",
      "opts": [
        "line_items(id, tenant_id, invoice_id, product_id, quantity) with no FK to invoices",
        "invoices(id, tenant_id, product_ids TEXT) storing comma-separated product IDs",
        "invoices(id, tenant_id, total) → line_items(id, invoice_id, quantity, price) → products(id, name, price)",
        "invoices(id, tenant_id, line_items JSONB) with product details embedded in each JSONB entry",
        "invoices(id, tenant_id, product_id, quantity) with one row per product per invoice"
      ],
      "ans": 2,
      "fb": "Option A uses proper normalisation: invoices owns the header, line_items is a child table with FK to invoice_id, and products is a shared catalogue referenced by FK from line_items. This keeps data consistent, queryable, and correctly reflects the one-to-many and many-to-one relationships. JSONB embedding (B) makes individual line items hard to query and update. Comma-separated IDs (C) violate first normal form. Missing FK (D) breaks referential integrity. Flattening to one row per product per invoice (E) duplicates invoice header data.",
      "context": {
        "Relationship": "Tenant → Invoices (1:many), Invoice → LineItems (1:many), LineItem → Product (many:1)",
        "Shared catalogue": "Products are not tenant-specific",
        "Compliance note": "Each line item price must be captured at time of invoice creation"
      }
    },
    {
      "level": 2,
      "diff": 1,
      "scenario": 1,
      "q": "You run `EXPLAIN ANALYZE SELECT * FROM orders WHERE tenant_id = 1 AND status = 'pending'` and see `Seq Scan on orders (cost=0.00..45231.00 rows=3 width=128) (actual rows=3 loops=1)`. What does this output tell you?",
      "opts": [
        "The query is already optimal because it returned only 3 rows",
        "The query took 45,231 milliseconds to execute",
        "The planner estimated 3 rows and found exactly 3 — statistics are up to date",
        "PostgreSQL scanned the entire table sequentially to find 3 rows — an index on tenant_id and/or status could make this query much faster",
        "The table has exactly 45,231 rows"
      ],
      "ans": 3,
      "fb": "The `Seq Scan` node means PostgreSQL read every page of the table to find the 3 matching rows. The `cost=0.00..45231.00` is the planner's estimated cost in arbitrary cost units (not milliseconds or row counts). `rows=3` is the estimated row count (which matches actual=3, so statistics are accurate, but that is not the primary insight). The key takeaway is that a sequential scan to return 3 rows from a large table is inefficient — an index on `(tenant_id, status)` would allow an index scan returning only the 3 matching rows. Option B is wrong — the method matters, not just the result count. Option C is wrong — cost is not row count. Option D is wrong — cost is not time."
    },
    {
      "level": 2,
      "diff": 1,
      "scenario": 1,
      "q": "EXPLAIN ANALYZE shows a `Sort` node with `Sort Method: external merge Disk: 128MB`. What does this mean and why is it a problem?",
      "opts": [
        "External merge sort is PostgreSQL's fastest sort algorithm",
        "The sort is complete and the 128MB file will be deleted automatically",
        "PostgreSQL is using a temporary file as a cache to improve sort performance",
        "The sort operation exceeded available work_mem and spilled to disk — increasing work_mem or adding an index to avoid the sort would improve performance",
        "The table has 128MB of data that must always be read from disk for this query"
      ],
      "ans": 3,
      "fb": "When a sort operation requires more memory than `work_mem` allows, PostgreSQL spills the sorted data to a temporary file on disk and uses an external merge sort. This is significantly slower than an in-memory sort. The `Disk: 128MB` means 128MB was written to and read back from disk. Solutions: increase `work_mem` for the session (or globally if safe), add an index that returns data in the required sort order (eliminating the sort node entirely), or optimise the query to reduce the result set before sorting."
    },
    {
      "level": 2,
      "diff": 1,
      "scenario": 2,
      "q": "A Liquibase migration needs to rename a column from `user_ref` to `user_id` in a table that is actively serving production traffic. Which approach is safest for zero downtime?",
      "opts": [
        "Create a view that maps user_ref to user_id so the old name still works",
        "Add the new column user_id, copy data from user_ref, update the application to use user_id, then drop user_ref in a later migration after the deployment is stable",
        "Drop user_ref and add user_id in a single migration inside a transaction",
        "Rename the column during a maintenance window to avoid any risk",
        "Use ALTER TABLE ... RENAME COLUMN directly — PostgreSQL renames columns instantly without a table lock"
      ],
      "ans": 1,
      "fb": "Option A follows the expand-contract pattern for zero-downtime migrations. Adding a new column is non-blocking. You then run both columns in parallel, deploy the application code that uses the new column, and only drop the old column after confirming the deployment is stable. Option B is technically correct that RENAME COLUMN takes a brief lock, but it requires all application code to be updated atomically — impossible in a rolling deployment where some pods may still reference the old name. Options C and D do not solve the rolling deployment problem. Option E (maintenance window) has downtime."
    },
    {
      "level": 2,
      "diff": 1,
      "scenario": 3,
      "q": "A table `audit_logs` has millions of rows and is queried almost exclusively by `SELECT ... WHERE tenant_id = $1 AND logged_at > $2`. There is already a single-column index on `tenant_id`. Would adding a separate index on `logged_at` improve this query?",
      "opts": [
        "Not significantly — a composite index on (tenant_id, logged_at) would be better because it lets PostgreSQL filter by both columns using a single index scan",
        "No — the existing tenant_id index is sufficient for all queries",
        "Yes — two separate indexes can be combined by the planner using Bitmap AND",
        "Yes — an index on logged_at will allow the planner to avoid reading old rows",
        "No — TIMESTAMP columns cannot be indexed in PostgreSQL"
      ],
      "ans": 0,
      "fb": "A composite index on `(tenant_id, logged_at)` is ideal for this query pattern. It first narrows to the specific tenant (equality on the leading column), then applies the range filter on `logged_at` using the index's sorted order — all in a single index scan. Option B (Bitmap AND) is technically possible and can help in some cases, but it is less efficient than a single composite index scan for this pattern. Option C is misleading — a separate `logged_at` index cannot efficiently combine with tenant filtering. Option D is wrong — the single-column tenant_id index still requires scanning all rows for that tenant. Option E is false — all B-tree-compatible types including TIMESTAMP can be indexed."
    },
    {
      "level": 2,
      "diff": 1,
      "scenario": 3,
      "q": "A query on a `payments` table returns rows correctly but runs for 8 seconds. The table has 5 million rows. You add an index on the `status` column (which has only 4 distinct values). After re-running, the query is no more than 100ms faster. Why?",
      "opts": [
        "Low-cardinality columns like `status` (4 values) produce poor index selectivity, so PostgreSQL prefers a sequential scan",
        "PostgreSQL requires a VACUUM ANALYZE to be run before a new index is used",
        "The index needs to be a UNIQUE index to be used by the query planner",
        "The index is not compatible with the `WHERE status = ?` predicate syntax used by Hibernate",
        "The index was created with CONCURRENTLY and is not yet fully built"
      ],
      "ans": 0,
      "fb": "An index on a column with only 4 distinct values has very low selectivity. If each value appears in 25% of rows, the planner often prefers a sequential scan because accessing 1.25M index entries and corresponding heap pages costs more than reading the table sequentially. A VACUUM ANALYZE (option D) updates statistics and is recommended after large changes, but it won't fix low cardinality. The solution is either a partial index (`WHERE status = 'PENDING'`) if the query targets rare values, or a composite index with a more selective leading column.",
      "context": {
        "Table rows": "5,000,000",
        "Distinct status values": "PENDING, PROCESSING, COMPLETED, FAILED",
        "Distribution": "~90% COMPLETED, ~8% FAILED, ~2% PENDING/PROCESSING"
      }
    },
    {
      "level": 2,
      "diff": 1,
      "scenario": 4,
      "q": "A developer reads that PostgreSQL uses READ COMMITTED isolation by default. What does this mean for a long-running report query that takes 5 seconds to execute?",
      "opts": [
        "No other transactions can modify the rows being read until the query finishes",
        "The query is automatically retried if another transaction modifies data during execution",
        "READ COMMITTED prevents phantom reads during report queries",
        "The query sees a consistent snapshot of the database as it was at the moment the query started",
        "Each row returned by the query reflects the committed state at the time that row was read — rows committed by other transactions during the query's execution may or may not be visible depending on when they were committed relative to each row being read"
      ],
      "ans": 4,
      "fb": "Under READ COMMITTED, PostgreSQL takes a new snapshot at the start of each individual statement (not the transaction). This means a long-running query can see different committed states for different rows — rows committed by other transactions during the 5-second execution may or may not be included depending on timing. This is sometimes called a 'non-repeatable read' at the query level. Option B describes SNAPSHOT isolation (Repeatable Read in PostgreSQL). Option C is wrong — READ COMMITTED does not block other writers. Option D is wrong — there is no automatic retry. Option E is wrong — READ COMMITTED does not prevent phantom reads."
    },
    {
      "level": 2,
      "diff": 2,
      "scenario": 0,
      "q": "You are designing a schema for a feature that tracks which users have accepted which versions of a terms-of-service document. A user can accept the same document version only once, but can accept multiple different versions. Which schema design is correct?",
      "opts": [
        "Add an `accepted_versions` JSONB array column to the users table",
        "A `users_documents` join table with separate unique indexes on user_id and document_version_id independently",
        "A `document_acceptances` table with a single auto-increment primary key and no unique constraint on (user_id, document_version_id)",
        "Store acceptance as a boolean flag on the document_versions table with a user_id column",
        "A `user_document_acceptances` table with (user_id, document_version_id) as a composite primary key, plus created_at and accepted_by columns"
      ],
      "ans": 4,
      "fb": "Option A is correct: a junction table with a composite primary key on `(user_id, document_version_id)` naturally enforces the uniqueness constraint — a user cannot accept the same version twice. The additional columns `created_at` and `accepted_by` store the acceptance metadata. Option B (JSONB array) loses referential integrity and makes querying which users accepted which versions much harder. Option C is a common mistake — without a unique constraint, duplicate acceptances are possible. Option D is wrong — separate unique indexes on each column independently do not prevent duplicate (user_id, document_version_id) pairs. Option E forces a one-to-one relationship between document versions and users, which doesn't scale."
    },
    {
      "level": 2,
      "diff": 2,
      "scenario": 0,
      "q": "Your team is designing a schema for a multi-tenant platform where each tenant has their own set of `products`. A product's `sku` (stock-keeping unit) must be unique within a tenant but two different tenants can have products with the same SKU. How do you enforce this constraint at the database level?",
      "opts": [
        "Enforce uniqueness only in the application layer with a query before INSERT",
        "Create a unique constraint on (tenant_id, sku) on the products table",
        "Use a trigger that checks for duplicate SKUs before each INSERT",
        "Add a CHECK constraint that queries another row to verify uniqueness",
        "Create a unique constraint on the sku column alone"
      ],
      "ans": 1,
      "fb": "A composite unique constraint on `(tenant_id, sku)` correctly models the business rule: the combination must be unique, but each column alone need not be. PostgreSQL enforces this at the database level, preventing duplicates even under concurrent inserts. Option B (unique on sku alone) would prevent different tenants from sharing a SKU, violating the business requirement. Option C (CHECK constraint with a subquery) is not supported in PostgreSQL — CHECK constraints cannot contain subqueries. Option D (application-layer check) is vulnerable to race conditions under concurrent requests. Option E (trigger) can work but is fragile and harder to maintain than a declarative constraint."
    },
    {
      "level": 2,
      "diff": 2,
      "scenario": 0,
      "q": "You are designing a schema for a multi-tenant permissions system. Each tenant has roles, each role has permissions, and users can have multiple roles within a tenant. A query that lists all permissions for a given user in a given tenant is performance-critical. Which schema design supports this most effectively?",
      "opts": [
        "user_permissions(user_id, tenant_id, permission_ids TEXT) storing a comma-separated list",
        "users(id, tenant_id, roles JSONB) storing role and permission data as nested JSON",
        "roles(id, tenant_id, user_ids JSONB, permission_ids JSONB) storing arrays on the role row",
        "permissions(id, user_id, tenant_id, permission_name) with one row per user-permission pair",
        "users(id), roles(id, tenant_id), permissions(id, role_id), user_roles(user_id, role_id, tenant_id) with indexes on (user_id, tenant_id) and (role_id)"
      ],
      "ans": 4,
      "fb": "The normalised schema with a `user_roles` junction table and appropriate indexes supports efficient lookups: joining users → user_roles → permissions with index scans on `(user_id, tenant_id)`. JSONB nesting (B) makes set-based queries slow and updates complex. Flattening to one row per permission (C) creates enormous tables and makes role-level changes difficult. Comma-separated IDs (D) cannot be indexed or joined. Storing arrays on roles (E) requires array unnesting and prevents efficient permission enumeration.",
      "context": {
        "Query pattern": "SELECT permissions WHERE user_id = ? AND tenant_id = ?",
        "Scale": "~500 users per tenant, ~50 roles, ~200 permissions",
        "Update pattern": "Role assignments change frequently"
      }
    },
    {
      "level": 2,
      "diff": 2,
      "scenario": 1,
      "q": "EXPLAIN ANALYZE shows the following for a query: `Index Scan using idx_orders_tenant on orders (cost=0.56..8.58 rows=1 width=200) (actual time=0.521..125.432 rows=1 loops=1)`. The estimated cost is low but actual time is 125ms. What is the most likely cause?",
      "opts": [
        "125ms is acceptable for a production query and no action is needed",
        "The statistics are wrong and the row count estimate is too low",
        "The index is corrupt and needs to be rebuilt",
        "The index scan found only 1 row but that row required fetching a large number of table heap pages (due to table bloat or low fillfactor), causing excessive I/O despite few logical rows returned",
        "The cost model underestimates I/O latency in Cloud SQL"
      ],
      "ans": 3,
      "fb": "When an index scan takes far longer than its cost estimate suggests, the most common cause is that the table heap pages containing the actual row data are not in the buffer cache (cold cache) or are heavily fragmented. The index correctly identifies 1 row, but fetching the heap tuple requires reading one or more disk pages. In a bloated table, the row may require reading pages that are only partially filled. This is sometimes called 'index scan overhead' or a 'heap fetch' cost. Option B (corrupt index) would cause errors or wrong results, not slowness. Option C (stale stats) is ruled out because actual=1 matches estimated=1. Option D ignores a 125x cost overrun. Option E is partly true but not the root cause to diagnose."
    },
    {
      "level": 2,
      "diff": 2,
      "scenario": 2,
      "q": "A Liquibase changeset adds a new NOT NULL column `notification_channel` (VARCHAR) to the `subscriptions` table which has 5 million rows in production. The changeset does not include a DEFAULT. What will happen when this migration runs?",
      "opts": [
        "The migration adds the column as nullable and then sets it NOT NULL in a second step automatically",
        "The migration succeeds but all existing rows have NULL in the column, violating the constraint silently",
        "The migration fails with 'column cannot be defined as NOT NULL with no default value' because PostgreSQL requires a DEFAULT to backfill existing rows when adding a NOT NULL column without one",
        "PostgreSQL 16 allows adding NOT NULL columns without a DEFAULT and uses 'unknown' as the implicit default",
        "All existing rows will have the column set to an empty string"
      ],
      "ans": 2,
      "fb": "When you add a NOT NULL column without a DEFAULT, PostgreSQL must assign a value to all existing rows. Since no default is provided, it cannot satisfy the NOT NULL constraint for those rows and fails immediately. In PostgreSQL 11+, adding a NOT NULL column WITH a constant DEFAULT is instantaneous (metadata only, no table rewrite), making it safe to add with a default and then update rows in batches later. Option B is not something PostgreSQL does automatically. Option C and E describe non-existent implicit defaults. Option D is wrong — PostgreSQL does not silently violate NOT NULL constraints."
    },
    {
      "level": 2,
      "diff": 2,
      "scenario": 3,
      "q": "A table `transactions` stores financial records for multiple tenants. The most common query pattern is `WHERE tenant_id = $1 AND transaction_date BETWEEN $2 AND $3 AND status = $4`. You have a composite index on `(tenant_id, transaction_date)`. A colleague suggests adding `status` to the index. How should you evaluate this suggestion?",
      "opts": [
        "Composite indexes cannot contain more than 2 columns in PostgreSQL",
        "Check the selectivity of `status` — if it has only a few distinct values (e.g., 'pending', 'complete', 'failed') the index on status adds little benefit for filtering; but as an INCLUDE column it avoids heap fetches for status-only projections",
        "Status columns should never be indexed because they have low cardinality",
        "Add status as the first column in the index since it appears last in the WHERE clause",
        "Always add all WHERE clause columns to the index for maximum performance"
      ],
      "ans": 1,
      "fb": "Low-cardinality columns like `status` (with 3-5 distinct values) typically do not make good leading index columns because each value matches a large fraction of rows. However, adding `status` as an INCLUDE column (a covering index feature) means the value can be returned from the index without fetching the heap page — useful if SELECT includes `status`. Adding it as a third key column `(tenant_id, transaction_date, status)` can help when `status` significantly filters the result after the first two columns. The right answer requires measuring, not assuming. Option B (always add all columns) leads to bloated indexes. Option C is an oversimplification. Option D is wrong — selectivity order for composite indexes. Option E is false — PostgreSQL supports up to 32 columns in a composite index."
    },
    {
      "level": 2,
      "diff": 2,
      "scenario": 3,
      "q": "A reporting query joins `orders` and `order_items` filtering on `orders.tenant_id`, `orders.created_at`, and `order_items.product_id`. EXPLAIN ANALYZE shows a hash join with a sequential scan on `orders`. Which index strategy is most likely to improve this query?",
      "opts": [
        "Add a partial index on `order_items` where `product_id IS NOT NULL`",
        "Create a B-tree index on `orders.tenant_id` alone",
        "Create a composite B-tree index on `orders(tenant_id, created_at)` and ensure `order_items.order_id` is indexed",
        "Create an index on `order_items.product_id` and rely on the planner to resolve the join",
        "Create a GIN index on `orders.created_at` for range queries"
      ],
      "ans": 2,
      "fb": "A composite index on `(tenant_id, created_at)` allows the planner to use an index scan that satisfies both the equality predicate on `tenant_id` and the range predicate on `created_at`, dramatically reducing rows examined. Separately, ensuring `order_items.order_id` is indexed allows an efficient nested loop or merge join from the orders result set. A single-column index on `tenant_id` (A) misses the date range benefit. GIN (C) is for full-text or JSONB, not date ranges. Indexing only `product_id` (D) doesn't address the scan on `orders`. The partial index (E) is irrelevant to the bottleneck.",
      "context": {
        "Query filter": "tenant_id = ? AND created_at BETWEEN ? AND ? JOIN order_items ON orders.id = order_items.order_id WHERE product_id = ?",
        "EXPLAIN output": "Seq Scan on orders (cost=0..95000 rows=210000)",
        "Rows after filter": "~3,000 orders matching tenant + date range"
      }
    },
    {
      "level": 2,
      "diff": 2,
      "scenario": 4,
      "q": "A background job reads a batch of payment records with `SELECT ... FOR UPDATE`, processes each one, and updates it. Payments are processed one at a time in a loop within a single long transaction. A developer notices the job occasionally deadlocks with the main application. What is the most likely cause and fix?",
      "opts": [
        "FOR UPDATE locks the entire table, blocking all application queries",
        "The fix is to increase the lock_timeout to give transactions more time to wait",
        "The background job should use READ COMMITTED instead of locking rows",
        "Deadlocks in PostgreSQL always indicate a bug in the connection pool configuration",
        "The background job and application acquire row locks in different orders; the fix is to ensure both always lock rows in the same consistent order (e.g., by primary key ascending)"
      ],
      "ans": 4,
      "fb": "Deadlocks occur when transaction A holds a lock that B wants, and B holds a lock that A wants. If the background job processes payments in one order and the application locks payments in a different order (e.g., the app processes them by tenant, the background job processes them by date), they can deadlock. The standard fix is to always acquire locks in a consistent global order. Option B is wrong — `FOR UPDATE` locks individual rows, not the entire table. Option C is wrong — changing isolation level does not fix lock order issues. Option D is wrong — deadlocks are a logic problem, not a pool configuration problem. Option E (lock_timeout) would make the deadlock fail faster, not prevent it."
    },
    {
      "level": 2,
      "diff": 3,
      "scenario": 0,
      "q": "You are designing a schema for a SOX-compliant financial platform. The requirement states that the original value of every field in the `journal_entries` table must be preserved if updated, and an audit trail must show who changed what and when. Which schema design best meets this requirement?",
      "opts": [
        "Enable PostgreSQL's built-in audit log feature which captures all DML automatically",
        "Use a soft-delete pattern with a `deleted_at` column to preserve original records",
        "Create a `journal_entries_history` table that stores only changed columns as JSONB diffs",
        "Add `updated_at` and `updated_by` columns to `journal_entries` and overwrite the row on change",
        "An append-only `journal_entries` table where records are never updated or deleted; changes are represented as new rows with a `superseded_by` foreign key, plus a separate `journal_audit_log` table populated by a trigger"
      ],
      "ans": 4,
      "fb": "SOX compliance requires an immutable audit trail — original values must be preserved and changes must be attributable to a specific actor at a specific time. An append-only table where rows are never updated or deleted, combined with a dedicated audit log table populated by a trigger on any attempted change, provides a tamper-evident record. Option B (overwriting rows) destroys the original value, violating the requirement. Option C (JSONB diffs) preserves changes but makes reconstructing the full historical state complex. Option D (soft-delete) only addresses deletions, not updates. Option E is false — PostgreSQL does not have a built-in DML audit feature; pgaudit logs SQL statements but does not preserve original row values in a queryable form."
    },
    {
      "level": 2,
      "diff": 3,
      "scenario": 0,
      "q": "You are designing a schema for time-series billing data where each tenant generates approximately 500K records per month and queries typically filter by `tenant_id` and a date range spanning 1-3 months. The data older than 12 months is rarely queried and can be archived. Which schema feature would most effectively address both query performance and data lifecycle management?",
      "opts": [
        "Table partitioning by `created_month` (range partitioning on created_at) with local indexes on tenant_id per partition, allowing old partitions to be detached and archived without blocking production queries",
        "Storing rows older than 12 months in a JSONB archive column on a summary table",
        "Sharding the table by tenant_id into separate physical tables per tenant",
        "Using a TimescaleDB hypertable instead of PostgreSQL native partitioning",
        "A single table with a composite index on (tenant_id, created_at) — sufficient for all queries regardless of table size"
      ],
      "ans": 0,
      "fb": "Range partitioning on `created_at` (e.g., monthly partitions) combined with local indexes on `tenant_id` per partition allows partition pruning — queries for a 1-3 month window only scan the relevant partitions. Archiving old data is a metadata operation (DETACH PARTITION) that is instantaneous and non-blocking. Option B (single table with composite index) works at moderate scale but becomes inefficient as the table grows to hundreds of millions of rows — index scans become slower and maintenance (VACUUM, bloat) becomes harder. Option C (per-tenant sharding) is complex to manage and unbalanced if tenant sizes vary. Option D (TimescaleDB) is a valid extension but introduces an external dependency not in the stated stack. Option E (JSONB archive) is an anti-pattern that destroys queryability."
    },
    {
      "level": 2,
      "diff": 3,
      "scenario": 0,
      "q": "Your team needs to store financial transaction records for multiple tenants. Each transaction must reference an account, include an amount and currency, and be queryable by tenant, account, date range, and status. At 10 million rows per year and 50 tenants, what schema design decision has the greatest impact on long-term query performance?",
      "opts": [
        "Partition the table by tenant_id using PostgreSQL list partitioning",
        "Store transactions in a JSONB column to allow flexible querying across tenants",
        "Use a separate schema per tenant so that each tenant's data is physically isolated",
        "Store all tenants in one table and rely on a composite index on (tenant_id, account_id, created_at)",
        "Use a materialized view per tenant that is refreshed nightly to support reporting queries"
      ],
      "ans": 3,
      "fb": "At 10M rows/year × 50 tenants = 500M rows over 10 years, a composite index on (tenant_id, account_id, created_at) gives the planner efficient index scans for the primary query patterns. List partitioning by tenant_id (B) can help with partition pruning but adds operational complexity and only benefits if tenants are queried independently — the index approach is simpler and effective. Separate schemas (C) create a schema management nightmare and don't help query performance. JSONB (D) loses index efficiency. Nightly materialised views (E) mean stale data and high storage overhead.",
      "context": {
        "Table size projection": "500M rows over 10 years",
        "Primary query": "SELECT * FROM transactions WHERE tenant_id=? AND account_id=? AND created_at BETWEEN ? AND ?",
        "Index candidate": "(tenant_id, account_id, created_at)"
      }
    },
    {
      "level": 2,
      "diff": 3,
      "scenario": 1,
      "q": "EXPLAIN ANALYZE shows a Hash Join between `orders` (10M rows) and `customers` (50K rows) with `Hash Batches: 32`. The query is running slowly. What does `Hash Batches: 32` mean and what should you investigate?",
      "opts": [
        "Hash Batches: 32 means the query used 32MB of hash table memory",
        "The hash table for the smaller relation did not fit in work_mem and was split into 32 batches that spilled to disk — increasing work_mem would reduce or eliminate disk spills",
        "The hash join required 32 network round trips to Cloud SQL",
        "32 batches is optimal for a hash join between tables of this size",
        "PostgreSQL ran the join 32 times in parallel across 32 workers"
      ],
      "ans": 1,
      "fb": "In a hash join, PostgreSQL builds a hash table from the smaller relation (customers) and probes it for each row of the larger relation. `Hash Batches > 1` means the hash table did not fit entirely in `work_mem` and was divided into batches — each batch requires writing to disk and reading back, causing significant I/O overhead. `Hash Batches: 32` means 32 disk passes. Increasing `work_mem` (either globally or per-session with `SET work_mem`) reduces batches and can make the entire hash table fit in memory (`Hash Batches: 1`). Option B (parallel workers) would show in the plan as Parallel Hash Join with `Workers Launched`. Option C and D are wrong. Option E is wrong — minimising batches is always better."
    },
    {
      "level": 2,
      "diff": 3,
      "scenario": 2,
      "q": "A zero-downtime migration needs to add a foreign key constraint `REFERENCES customers(id)` to the `orders` table which has 20 million rows. The naive approach locks the table during validation. What is the PostgreSQL 16 technique to add this constraint without blocking reads or writes?",
      "opts": [
        "Add the foreign key as a deferred constraint with `INITIALLY DEFERRED`",
        "Use `ALTER TABLE orders ADD CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES customers(id) NOT VALID`, then in a separate transaction run `ALTER TABLE orders VALIDATE CONSTRAINT fk_customer`",
        "Create a partial index that simulates the foreign key check without a constraint",
        "Foreign key constraints in PostgreSQL 16 are always added without locks",
        "Use a Liquibase `validCheckSum` to skip constraint validation"
      ],
      "ans": 1,
      "fb": "The `NOT VALID` option adds the constraint definition to the catalog without scanning existing rows — this takes only a brief metadata lock. New inserts and updates are immediately checked against the constraint. The separate `VALIDATE CONSTRAINT` command then scans existing rows to verify they satisfy the constraint; this scan only takes a `SHARE UPDATE EXCLUSIVE` lock which does not block reads or DML. This two-step approach is the standard PostgreSQL pattern for adding constraints to large tables with zero downtime. Option B is false — by default, FK addition takes an `ACCESS EXCLUSIVE` lock and scans the table. Option C (validCheckSum) is a Liquibase feature for changeset checksums, unrelated to constraint validation. Option D (INITIALLY DEFERRED) changes when the FK is checked, not how it is added. Option E (partial index) does not enforce referential integrity."
    },
    {
      "level": 2,
      "diff": 3,
      "scenario": 2,
      "q": "Your team needs to backfill a new `external_ref` VARCHAR(64) column across 15 million rows in the `payments` table. The backfill runs as a single UPDATE in a Liquibase migration. What problem does this cause and what is the correct approach?",
      "opts": [
        "A single UPDATE on 15M rows holds an exclusive lock on the table for the entire duration (potentially minutes), blocking all reads and writes; the correct approach is to backfill in batches using a script or a repeated partial UPDATE with a LIMIT and commit between batches",
        "A single large UPDATE is more efficient because it uses fewer transactions",
        "The UPDATE will fail because VARCHAR cannot be backfilled in PostgreSQL",
        "Liquibase cannot execute UPDATE statements in changesets",
        "The migration will pause automatically if it detects too many rows and ask for confirmation"
      ],
      "ans": 0,
      "fb": "A single UPDATE that modifies 15 million rows acquires a row-level write lock on every row it touches and holds the associated transaction open for the entire duration. This can take minutes and causes massive table bloat (all old row versions remain until VACUUM). More critically, it holds an `ACCESS SHARE` level conflict with some DDL and can cause lock queues that block other queries. The correct approach is batched updates: `UPDATE payments SET external_ref = ... WHERE id BETWEEN $batch_start AND $batch_end` committed in small chunks, which keeps individual transaction durations short and allows VACUUM to reclaim dead tuples incrementally. Option B is false — Liquibase supports SQL. Option C is false. Option D is wrong — efficiency must be balanced against operational impact. Option E is false."
    },
    {
      "level": 2,
      "diff": 3,
      "scenario": 3,
      "q": "A GIN index on a `tags` TEXT[] column is used by queries like `WHERE 'billing' = ANY(tags)`. After adding 500K new rows with many new tags, queries using this index become slower. EXPLAIN shows the index is still being used. What PostgreSQL maintenance operation most directly addresses GIN index performance degradation from many insertions?",
      "opts": [
        "Switch to a GiST index which handles large volumes better than GIN",
        "Run `VACUUM` on the table — GIN indexes use a pending list for fast inserts, and VACUUM flushes the pending list into the main index structure, reducing scan overhead",
        "Run ANALYZE to update statistics so the planner makes better decisions",
        "Increase gin_fuzzy_search_limit to improve GIN scan performance",
        "Rebuild the index with REINDEX CONCURRENTLY to compact it"
      ],
      "ans": 1,
      "fb": "GIN indexes use a 'pending list' to accumulate new entries quickly — insertions append to the list rather than immediately merging into the main B-tree structure. Over time, a large pending list requires a linear scan at query time before the main index is searched, degrading performance. `VACUUM` flushes the pending list into the main index. This is controlled by `gin_pending_list_limit`. `VACUUM` (or auto-vacuum) resolves this transparently in steady state. Option B (REINDEX) rebuilds the entire index, which takes longer and is more disruptive than VACUUM. Option C (ANALYZE) updates statistics but does not fix the pending list. Option D (gin_fuzzy_search_limit) is for similarity searches, unrelated to this scenario. Option E (GiST) is a different tradeoff and not the right diagnostic step here."
    },
    {
      "level": 2,
      "diff": 3,
      "scenario": 3,
      "q": "A senior engineer suggests replacing three separate B-tree indexes on `(tenant_id)`, `(created_at)`, and `(status)` with a single composite index on `(tenant_id, status, created_at)`. The most common queries filter by `tenant_id` and `created_at` range, but rarely filter by `status`. What is the most important trade-off to consider?",
      "opts": [
        "Composite indexes always perform worse than individual indexes because they have larger index entries",
        "The composite index will cause write amplification on every INSERT and UPDATE to the table",
        "The index will be unusable once the table exceeds 100 million rows",
        "PostgreSQL cannot use a composite index for range predicates; only equality predicates are supported",
        "The composite index cannot be used for queries that filter by `tenant_id` and `created_at` without also specifying `status`"
      ],
      "ans": 4,
      "fb": "In a B-tree composite index, a range predicate on an intermediate column prevents the index from being used for columns after it. With `(tenant_id, status, created_at)`, a query filtering `tenant_id = ? AND created_at BETWEEN ?` cannot efficiently use the `created_at` part because `status` is in between and not constrained. The better order for the common query pattern would be `(tenant_id, created_at, status)`. Option B is wrong: composite indexes are often more efficient. Option C (write amplification) is a real concern but not the most important trade-off here. Option D is incorrect: range predicates work on the last key column of a B-tree index.",
      "context": {
        "Current indexes": "3 separate B-tree indexes",
        "Common query pattern": "WHERE tenant_id = ? AND created_at BETWEEN ? AND ?",
        "Rare query pattern": "WHERE tenant_id = ? AND status = ?"
      }
    },
    {
      "level": 2,
      "diff": 3,
      "scenario": 4,
      "q": "Two concurrent transactions execute the following sequence: T1 reads balance (100), T2 reads balance (100), T1 writes balance = 100 - 30 = 70 and commits, T2 writes balance = 100 - 40 = 60 and commits. The final balance is 60 instead of 30. What anomaly is this and how does PostgreSQL's default isolation level handle it?",
      "opts": [
        "This is a phantom read — prevented by SERIALIZABLE isolation",
        "This is a write skew — only preventable with SERIALIZABLE isolation",
        "READ COMMITTED cannot prevent lost updates; you must use SELECT FOR UPDATE manually",
        "This is a lost update anomaly — under READ COMMITTED, PostgreSQL's row-level locking for UPDATE statements prevents this: T2's UPDATE would block until T1 commits, then re-evaluate the row and compute 70 - 40 = 30",
        "This is a dirty read — prevented by READ COMMITTED which only reads committed data"
      ],
      "ans": 3,
      "fb": "This scenario describes a lost update: both transactions read the same value (100), each computes a new value independently, and the second write overwrites the first, losing T1's update. In PostgreSQL, `UPDATE` statements acquire row-level locks. Under READ COMMITTED, T2's UPDATE blocks when it tries to lock the row that T1 has locked. When T1 commits, T2 re-evaluates the WHERE clause against the new value (70) and then applies its change: 70 - 40 = 30. This is correct behaviour and lost updates are automatically prevented by row-level locking in PostgreSQL for UPDATE statements. Option B (dirty read) is a different anomaly. Option C (phantom read) involves new rows appearing. Option D (write skew) involves decisions based on read data that is then modified by another transaction. Option E is wrong — row locking in UPDATE already handles this."
    },
    {
      "level": 3,
      "diff": 1,
      "scenario": 0,
      "q": "Your team is building a ledger table for a PCI-DSS-compliant payment platform. A junior engineer proposes storing the running balance as a column that gets updated on each transaction. What is the primary design risk with this approach?",
      "opts": [
        "Running balance columns require a UNIQUE constraint that slows inserts.",
        "Cloud SQL does not allow UPDATE on columns named 'balance'.",
        "Mutable balances break auditability because historical states cannot be reconstructed after an update.",
        "PostgreSQL does not support decimal arithmetic accurately enough for financial values.",
        "The column will cause table bloat because UPDATE leaves dead tuples."
      ],
      "ans": 2,
      "fb": "A ledger in a regulated domain must be append-only. Storing a mutable running balance means you lose the ability to reconstruct the balance at any past point in time if data is ever corrected or if bugs are found. The correct pattern is to store immutable debit/credit rows and compute the balance as SUM. Dead tuples from UPDATEs are a real cost but are not the primary design risk — auditability is. PostgreSQL's NUMERIC type handles financial arithmetic correctly."
    },
    {
      "level": 3,
      "diff": 1,
      "scenario": 0,
      "q": "You are designing an audit log table for a SOX-compliant platform. Which column set best satisfies temporal audit requirements?",
      "opts": [
        "id, entity_id, entity_type, old_data JSONB, new_data JSONB, changed_by UUID, changed_at TIMESTAMPTZ, operation CHAR(1)",
        "id, entity_id, changed_at DATE, summary TEXT",
        "id, table_name, old_value, new_value, changed_at",
        "id, table_name, row_count INT, changed_at TIMESTAMPTZ",
        "id, sql_statement TEXT, changed_at TIMESTAMP"
      ],
      "ans": 0,
      "fb": "SOX audit tables need: what changed (old/new data as JSONB for flexibility), who changed it (changed_by), when (TIMESTAMPTZ preserves timezone), what operation (I/U/D). Option A lacks the actor identity. Option C stores raw SQL which is fragile and doesn't capture the before-state. Option D loses the actual data delta. Option E is an aggregate, not a row-level audit. TIMESTAMPTZ is preferred over TIMESTAMP because it stores UTC and avoids timezone ambiguity."
    },
    {
      "level": 3,
      "diff": 1,
      "scenario": 0,
      "q": "A team asks whether to use a trigger-based audit log or application-layer audit logging for a regulated financial service. What is the main advantage of trigger-based audit logging?",
      "opts": [
        "Triggers run faster than application code so audit writes have lower latency.",
        "Triggers automatically compress old audit rows to save storage.",
        "Triggers are easier to test and maintain than application-layer code.",
        "Triggers capture changes made directly to the database outside the application, closing audit gaps.",
        "Triggers can write to external systems like Kafka without application involvement."
      ],
      "ans": 3,
      "fb": "The critical advantage of trigger-based auditing is completeness: any write to the table — whether from the application, a migration script, a DBA console, or an emergency hotfix — gets audited. Application-layer logging only audits traffic that flows through the app. For PCI-DSS and SOX, this gap is a compliance risk. Triggers do not have inherently lower latency (they add overhead), cannot write to Kafka without extensions, and are generally harder to test than application code."
    },
    {
      "level": 3,
      "diff": 1,
      "scenario": 1,
      "q": "A DBA reports that a table's pg_relation_size is significantly larger than expected given the number of live rows. Which PostgreSQL view should you query first to understand the bloat situation?",
      "opts": [
        "pg_stat_replication — check replay_lag",
        "pg_stat_bgwriter — check buffers_clean vs buffers_alloc",
        "pg_stat_user_indexes — check idx_scan",
        "pg_stat_database — check tup_deleted",
        "pg_stat_user_tables — check n_live_tup vs n_dead_tup"
      ],
      "ans": 4,
      "fb": "pg_stat_user_tables exposes n_live_tup and n_dead_tup which directly show the ratio of live to dead rows, the primary indicator of table bloat. A large gap between live and dead tuples confirms autovacuum is not keeping up. pg_stat_bgwriter shows background writer activity, not per-table bloat. pg_stat_replication is for replica lag. pg_stat_database is aggregate-level. pg_stat_user_indexes helps find index bloat separately."
    },
    {
      "level": 3,
      "diff": 1,
      "scenario": 1,
      "q": "Your team observes that autovacuum has not run on a high-write table for several hours despite activity. Which configuration parameter is most likely throttling autovacuum too aggressively?",
      "opts": [
        "shared_buffers set too low, preventing autovacuum from reading pages",
        "max_connections set too high, starving autovacuum of connections",
        "checkpoint_completion_target set too high, blocking autovacuum writes",
        "autovacuum_vacuum_scale_factor set too high, requiring too many dead tuples before triggering",
        "wal_level set to minimal, disabling autovacuum"
      ],
      "ans": 3,
      "fb": "autovacuum_vacuum_scale_factor (default 0.2 = 20%) means autovacuum only triggers when dead tuples exceed 20% of live rows. On a large table with millions of rows, this threshold can be very high in absolute terms, causing long delays. The fix is to lower scale_factor or set autovacuum_vacuum_threshold per-table. shared_buffers affects caching, not vacuum triggering. max_connections does not affect autovacuum workers (controlled by autovacuum_max_workers). wal_level=minimal is not valid for replicated Cloud SQL instances."
    },
    {
      "level": 3,
      "diff": 1,
      "scenario": 2,
      "q": "You need to add a NOT NULL column with a default value to a table with 50 million rows in a live production system. What is the safest approach in PostgreSQL 16?",
      "opts": [
        "Use pg_repack to add the column without locking.",
        "Create a new table with the column, copy all data, then rename.",
        "Add the column as nullable first, backfill in batches, then add the NOT NULL constraint.",
        "Take the table offline, add the column, then restore service.",
        "ALTER TABLE t ADD COLUMN new_col INT NOT NULL DEFAULT 0 — PostgreSQL 16 handles this without rewriting the table."
      ],
      "ans": 4,
      "fb": "Since PostgreSQL 11, adding a NOT NULL column with a constant default no longer rewrites the table. PostgreSQL stores the default in the catalog and serves it for existing rows without touching the heap. In PostgreSQL 16, this optimization is well established. The column add is nearly instant even on 50M-row tables. Option B (nullable then backfill) was the pre-PG11 pattern and is no longer necessary for constant defaults. Options C and D cause unnecessary downtime. pg_repack is for reclaiming bloat, not adding columns."
    },
    {
      "level": 3,
      "diff": 1,
      "scenario": 2,
      "q": "A Liquibase migration needs to rename a column on a table that is actively read by the application. What is the risk of running ALTER TABLE t RENAME COLUMN old TO new directly?",
      "opts": [
        "RENAME COLUMN automatically drops any CHECK constraints on the column.",
        "RENAME COLUMN triggers autovacuum immediately, causing I/O spikes.",
        "RENAME COLUMN acquires an ACCESS EXCLUSIVE lock, blocking all reads and writes for the duration.",
        "RENAME COLUMN will corrupt indexes on the column.",
        "RENAME COLUMN is not supported in PostgreSQL 16."
      ],
      "ans": 2,
      "fb": "ALTER TABLE ... RENAME COLUMN acquires ACCESS EXCLUSIVE lock, which blocks all concurrent reads and writes. On a busy production table this causes visible downtime even if the operation itself is fast. The zero-downtime approach is to keep the old column, add the new column with a trigger to dual-write, update the application to read the new name, then drop the old column after deployment. PostgreSQL 16 fully supports RENAME COLUMN. Indexes are updated automatically. CHECK constraints are preserved."
    },
    {
      "level": 3,
      "diff": 1,
      "scenario": 3,
      "q": "You are enabling Row Level Security on a multi-tenant table. After running ALTER TABLE orders ENABLE ROW LEVEL SECURITY, your application queries return zero rows. What is the most likely cause?",
      "opts": [
        "Cloud SQL does not support RLS on tables with more than 1 million rows.",
        "RLS is only effective when ssl_mode is set to require.",
        "RLS requires a primary key to be defined before it can be enabled.",
        "The application connection does not have the SELECT privilege on the table.",
        "The table owner bypasses RLS by default and the app runs as the table owner."
      ],
      "ans": 4,
      "fb": "When RLS is enabled and NO policies exist, non-owner roles see zero rows (default-deny). However, the table owner and superusers bypass RLS by default. If the application runs as the table owner, it will see all rows. But if the app runs as a different role and no permissive policy exists, it sees nothing. The fix is to create a permissive policy: CREATE POLICY tenant_isolation ON orders USING (tenant_id = current_setting('app.tenant_id')::UUID). RLS has no row-count limit, no SSL dependency, and no PK requirement."
    },
    {
      "level": 3,
      "diff": 1,
      "scenario": 4,
      "q": "An on-call engineer reports that a deployment is stalled because a Liquibase migration appears to be hanging. Which query would most directly show if the migration is blocked waiting for a lock?",
      "opts": [
        "SELECT * FROM pg_stat_replication",
        "SELECT * FROM pg_locks WHERE granted = true",
        "SELECT relname, n_dead_tup FROM pg_stat_user_tables ORDER BY n_dead_tup DESC",
        "SELECT pid, wait_event_type, wait_event, query FROM pg_stat_activity WHERE wait_event_type = 'Lock'",
        "SELECT * FROM pg_stat_bgwriter"
      ],
      "ans": 3,
      "fb": "pg_stat_activity with wait_event_type = 'Lock' shows processes currently blocked waiting for a lock, including the query text so you can confirm it is the migration. This is the fastest first step. pg_locks WHERE granted = true shows currently held locks, not waiters. pg_stat_bgwriter and pg_stat_replication are unrelated to lock waits. pg_stat_user_tables shows bloat, not locking."
    },
    {
      "level": 3,
      "diff": 2,
      "scenario": 0,
      "q": "You are designing a temporal pricing table for a regulated platform where historical prices must be reconstructed for any past date. A colleague suggests using updated_at and deleted_at columns. Why is this insufficient for true bi-temporal auditability?",
      "opts": [
        "These columns cannot be indexed, making historical queries too slow.",
        "PostgreSQL 16 removed support for nullable timestamp columns.",
        "updated_at and deleted_at only cover the transaction time dimension; you also need the valid time dimension to record when a price was actually effective in the business, independent of when it was recorded.",
        "The approach works fine for SOX compliance without additional columns.",
        "updated_at and deleted_at require triggers which are not supported on Cloud SQL."
      ],
      "ans": 2,
      "fb": "Bi-temporal tables track two independent time axes: transaction time (when was this row recorded/changed in the DB) and valid time (when was this fact true in the business world). A price might be backdated — recorded on Monday but effective from last Friday. updated_at only captures when the DB row was last touched, not the business validity period. For regulated domains requiring retrospective reconstruction, you need valid_from and valid_to (or valid_at TSTZRANGE) plus system_period for transaction time. Cloud SQL fully supports triggers and nullable timestamps."
    },
    {
      "level": 3,
      "diff": 2,
      "scenario": 0,
      "q": "Your platform stores financial transactions that are immutable by policy. A product requirement arrives: users must be able to 'cancel' a transaction. How should this be modelled in a ledger-compliant schema?",
      "opts": [
        "Add a status column to the transactions table and UPDATE it to 'cancelled'.",
        "Soft-delete the row using a deleted_at column and adjust the balance calculation to exclude it.",
        "DELETE the original row and INSERT a cancellation record in a separate audit table.",
        "Archive the original row to a cold storage table and replace it with a placeholder.",
        "INSERT a new reversal transaction with the opposite amount, linked to the original via a reference column."
      ],
      "ans": 4,
      "fb": "In a ledger-compliant model, rows are immutable — you never UPDATE or DELETE them. A cancellation is modelled as a compensating/reversal entry: a new row with the negated amount and a reference back to the original transaction ID. This preserves the full audit trail, allows regulators to see both the original transaction and the reversal, and keeps the ledger mathematically correct. Soft-deletes (deleted_at) still mutate the row's visibility. Archiving to another table breaks the continuous audit trail."
    },
    {
      "level": 3,
      "diff": 2,
      "scenario": 1,
      "q": "After a high-traffic weekend, you notice query performance has degraded on a table that had VACUUM run successfully. pg_stat_user_tables shows low n_dead_tup. What else could explain index bloat causing slow index scans?",
      "opts": [
        "VACUUM reclaims heap space but does not reclaim space inside B-tree index pages; index bloat accumulates separately and requires REINDEX or VACUUM (ANALYZE) with index cleanup.",
        "VACUUM always removes index bloat automatically so the issue must be a missing index.",
        "pg_stat_user_tables accurately reports both heap and index bloat.",
        "Index bloat only occurs on tables with more than 10 million rows.",
        "B-tree indexes in PostgreSQL 16 are self-compacting and never bloat."
      ],
      "ans": 0,
      "fb": "VACUUM reclaims dead tuple space in the heap and marks index entries as dead, but it does not physically compact B-tree index pages. Over time, especially after bulk deletes or updates, B-tree pages fill with deleted entries that occupy space but are not reused efficiently. This is index bloat. To reclaim it, use REINDEX CONCURRENTLY (PG12+, available on Cloud SQL) or pg_repack. pg_stat_user_tables only reports heap dead tuples, not index bloat. B-trees are not self-compacting."
    },
    {
      "level": 3,
      "diff": 2,
      "scenario": 1,
      "q": "A table has autovacuum_vacuum_cost_delay set to 20ms (the default). After a high-delete batch job, autovacuum is running but taking many hours to clean up 200M dead tuples, causing ongoing query degradation. What is the most targeted fix?",
      "opts": [
        "Disable autovacuum and schedule manual VACUUM jobs via cron.",
        "Increase shared_buffers to speed up autovacuum page reads.",
        "Run VACUUM FREEZE to force immediate cleanup of all dead tuples.",
        "Lower autovacuum_vacuum_cost_delay for this specific table using ALTER TABLE to allow autovacuum to run faster with less I/O throttling.",
        "Increase max_connections to give autovacuum more database connections."
      ],
      "ans": 3,
      "fb": "autovacuum_vacuum_cost_delay throttles autovacuum to avoid starving the workload. After a large batch delete, you want to temporarily reduce this delay (e.g. to 2ms) so autovacuum can catch up quickly. ALTER TABLE t SET (autovacuum_vacuum_cost_delay = 2) applies only to this table without affecting the global setting. VACUUM FREEZE is for transaction ID wraparound prevention, not bloat cleanup (and it takes an exclusive lock strategy not suitable here). Disabling autovacuum is dangerous as it risks XID wraparound."
    },
    {
      "level": 3,
      "diff": 2,
      "scenario": 2,
      "q": "A Liquibase migration needs to add a foreign key constraint between two large tables in production. The straightforward ALTER TABLE ... ADD CONSTRAINT approach would lock both tables. What is the zero-downtime approach?",
      "opts": [
        "Add the constraint during a maintenance window since there is no online alternative.",
        "Partition both tables first, then add the FK per partition to reduce lock scope.",
        "Use ALTER TABLE ... ADD CONSTRAINT ... NOT VALID to skip the validation scan, then separately run VALIDATE CONSTRAINT which only holds a ShareUpdateExclusiveLock.",
        "Foreign key constraints cannot be added without locking in PostgreSQL 16.",
        "Use a trigger to enforce referential integrity instead of a native FK."
      ],
      "ans": 2,
      "fb": "PostgreSQL supports a two-phase FK addition. First, ALTER TABLE child ADD CONSTRAINT fk_name FOREIGN KEY (col) REFERENCES parent(id) NOT VALID — this creates the constraint but does not validate existing rows, taking only a brief lock. New writes are immediately checked. Then ALTER TABLE child VALIDATE CONSTRAINT fk_name scans existing rows but only holds a ShareUpdateExclusiveLock, which allows concurrent reads and writes. This is the standard zero-downtime pattern. Triggers are fragile substitutes and miss edge cases. Partitioning does not help with FK locking."
    },
    {
      "level": 3,
      "diff": 2,
      "scenario": 3,
      "q": "Your multi-tenant application sets the tenant context using SET LOCAL app.tenant_id = $1 within each transaction. A code review finds a code path that executes a query outside a transaction block. What is the security risk?",
      "opts": [
        "SET LOCAL causes connection pool contamination because HikariCP reuses connections.",
        "SET LOCAL only persists for the duration of the current transaction; outside a transaction it has no effect, so the RLS policy receives an empty or stale tenant_id and may grant access to the wrong tenant's data.",
        "The risk is performance only; security is not affected.",
        "Queries outside transactions bypass RLS entirely regardless of tenant settings.",
        "SET LOCAL is not supported in PostgreSQL 16; SET SESSION should be used instead."
      ],
      "ans": 1,
      "fb": "SET LOCAL sets a parameter for the duration of the current transaction only. If called outside a transaction (i.e. in autocommit mode), the setting takes effect but is immediately discarded after the single statement. Any subsequent query in the same connection will read an empty or stale value from current_setting('app.tenant_id'). If the RLS USING clause calls current_setting with raise_exception=false, it may return NULL, causing the policy to match no rows or, worse, use a previous session's value. Use SET SESSION in combination with connection validation, or always wrap in explicit transactions."
    },
    {
      "level": 3,
      "diff": 2,
      "scenario": 3,
      "q": "You are reviewing an RLS policy intended to isolate tenant data. The policy is: CREATE POLICY tenant_iso ON orders USING (tenant_id = current_setting('app.tenant_id', TRUE)::UUID). A penetration tester reports they can read another tenant's orders by sending a crafted request. What is the most likely vulnerability?",
      "opts": [
        "The TRUE flag in current_setting suppresses errors when the setting is missing, returning NULL, and NULL = UUID comparison returns NULL (not false), so the USING clause evaluates to NULL which PostgreSQL treats as false — but if the app fails to set the parameter, rows may be visible under some policy combinations.",
        "The policy name 'tenant_iso' conflicts with a reserved keyword.",
        "The USING clause should be replaced with a WITH CHECK clause for SELECT queries.",
        "RLS policies are disabled for connections coming through Cloud SQL Auth Proxy.",
        "current_setting does not support UUID casting in PostgreSQL 16."
      ],
      "ans": 0,
      "fb": "When current_setting('app.tenant_id', TRUE) is called and the setting is not defined, it returns NULL. NULL::UUID = any_value evaluates to NULL, not FALSE. In a USING clause, NULL is treated as FALSE (row not visible), which sounds safe. However, if there is also a permissive policy with a broader condition, rows could be exposed. The real risk is application code that sometimes fails to call SET and relies on the policy for isolation — when the parameter is absent, no policy matches correctly. The fix is to use current_setting('app.tenant_id', FALSE) (raises error if unset) to make misconfiguration loudly visible."
    },
    {
      "level": 3,
      "diff": 2,
      "scenario": 4,
      "q": "Production alerts show intermittent timeout errors on a specific endpoint. You query pg_stat_activity and see a long-running UPDATE on table payments is blocking 12 other sessions. The blocking query is from a background batch job. What is the most appropriate immediate mitigation while preserving data integrity?",
      "opts": [
        "Use SELECT pg_cancel_backend(pid) to send a cancellation signal to the blocking UPDATE, allowing it to roll back cleanly and unblock the waiting sessions.",
        "Restart the Cloud SQL instance to clear all locks.",
        "Drop and recreate the index on the payments table to clear the lock.",
        "Kill the PostgreSQL process using SIGKILL to immediately free the lock.",
        "Increase lock_timeout on the waiting sessions to give the UPDATE more time."
      ],
      "ans": 0,
      "fb": "pg_cancel_backend sends a SIGINT to the backend, which causes the query to be cancelled and the transaction rolled back cleanly — locks are released and waiting sessions can proceed. This is safe because PostgreSQL handles the rollback gracefully. pg_terminate_backend (SIGTERM) is more forceful and should be a second step if cancellation doesn't work. SIGKILL bypasses cleanup and risks corruption. Restarting Cloud SQL is a drastic last resort. Increasing lock_timeout makes waiters time out sooner, not later. Dropping indexes does not release row-level locks."
    },
    {
      "level": 3,
      "diff": 2,
      "scenario": 4,
      "q": "During a peak processing window, a monitoring alert fires showing that a batch job processing payment settlements is taking 10× longer than normal. You pull the active queries and see dozens of sessions waiting on `relation lock` for the `settlements` table. The batch job runs `UPDATE settlements SET status='SETTLED' WHERE id IN (SELECT id FROM settlements WHERE status='PENDING' LIMIT 1000)`. What is most likely causing the contention?",
      "opts": [
        "HikariCP is exhausting the connection pool, causing sessions to queue and appear as lock waits",
        "Multiple batch job instances are running concurrently and competing for locks on the same PENDING rows because the subquery does not use `FOR UPDATE SKIP LOCKED`",
        "The UPDATE statement is acquiring an ACCESS EXCLUSIVE lock on the table, blocking all concurrent reads",
        "The `LIMIT 1000` clause is incompatible with concurrent transactions and causes a serialisation error",
        "The subquery is taking too long because `status` is not indexed, causing a full table scan that blocks reads"
      ],
      "ans": 1,
      "fb": "When multiple instances of the batch job run the same subquery to find PENDING rows, they all see the same set of rows and try to update the same rows. This causes row-level lock contention as each UPDATE waits for the others to release locks. The fix is `SELECT id FROM settlements WHERE status='PENDING' LIMIT 1000 FOR UPDATE SKIP LOCKED`, which allows each job instance to claim a non-overlapping set of rows atomically. An UPDATE acquires row-level locks, not ACCESS EXCLUSIVE (option C). The symptoms are lock waits, not connection pool exhaustion (option D)."
    },
    {
      "level": 3,
      "diff": 3,
      "scenario": 0,
      "q": "You are designing a PCI-DSS compliant schema for storing card-present transaction events. Legal requires that raw PAN data must never appear in the audit log, but the audit log must record enough information to reconstruct what was authorized. How should you structure the audit schema?",
      "opts": [
        "Store the PAN hash (SHA-256) in the audit log to allow lookups without exposing raw data.",
        "Store a tokenized or masked representation (e.g. last 4 digits + BIN) in the audit log, and record the token vault reference, transaction amount, merchant ID, authorization code, and timestamp — never the raw PAN.",
        "Store the PAN in a separate encrypted column in the audit table with column-level encryption managed by the application.",
        "Exclude payment data from the audit log entirely to avoid compliance risk.",
        "Store the full PAN in the audit log encrypted with AES-256 and a separate key management service."
      ],
      "ans": 1,
      "fb": "PCI-DSS Requirement 3 prohibits storing sensitive authentication data after authorization and restricts PAN storage. The audit log should contain enough to reconstruct the authorization decision without storing or hashing the PAN itself. A token reference (pointing to the token vault), last 4 digits, BIN, amount, merchant, and auth code satisfies both auditability and compliance. Encrypting the PAN in the audit log still means PAN is stored in scope, expanding the CDE. SHA-256 of PAN is considered protected storage under PCI but is still PAN in scope. Excluding payment data from audit logs fails SOX/PCI audit requirements."
    },
    {
      "level": 3,
      "diff": 3,
      "scenario": 0,
      "q": "A SOX audit finding requires your team to prove that no row in the financial_events table has ever been deleted or retroactively modified. Your current schema has no controls preventing DELETE. What combination of controls satisfies this requirement with the least operational overhead?",
      "opts": [
        "Add a deleted_at column and train developers not to use DELETE.",
        "Enable Row Level Security with a policy that returns false for all DELETE operations.",
        "Schedule a nightly job that verifies row counts have not decreased and alerts on discrepancy.",
        "Create a trigger that raises an exception on DELETE and log all attempts.",
        "Revoke DELETE and TRUNCATE privileges from the application role; enable logical replication to ship all WAL changes to an immutable audit stream; document the controls for auditors."
      ],
      "ans": 4,
      "fb": "The strongest control is privilege revocation — if the application role has no DELETE/TRUNCATE privilege, it is technically impossible for application code to delete rows regardless of bugs or compromises. Logical replication (or Cloud SQL's transaction log export) provides an independent immutable record of all changes for auditors. Triggers can be disabled by a sufficiently privileged role. RLS cannot prevent deletes by the table owner. A deleted_at column relies on developer discipline. Nightly row count checks detect deletions after the fact but don't prevent them."
    },
    {
      "level": 3,
      "diff": 3,
      "scenario": 1,
      "q": "A Cloud SQL instance shows increasing query latency over several weeks despite stable load. EXPLAIN ANALYZE shows a sequential scan on a table with a valid index. pg_stat_user_tables shows n_live_tup is accurate. What PostgreSQL mechanism is most likely causing the planner to ignore the index?",
      "opts": [
        "The query contains a LIKE clause which always prevents index usage.",
        "Cloud SQL disables index scans on tables with more than 100M rows.",
        "PostgreSQL 16 changed the default cost model to prefer sequential scans.",
        "The table statistics are stale — pg_statistic has not been updated since a large data load, causing the planner to underestimate selectivity and prefer a seq scan.",
        "The index has become corrupt and PostgreSQL silently falls back to sequential scans."
      ],
      "ans": 3,
      "fb": "The query planner relies on pg_statistic (populated by ANALYZE) to estimate row counts and selectivity. If a large INSERT or DELETE occurs and ANALYZE has not run, the planner uses outdated statistics. If it believes the filter will return many rows, it chooses a seq scan (lower startup cost). Running ANALYZE manually or tuning autovacuum to analyze more frequently fixes this. Index corruption is rare and would show errors, not silent fallback. Cloud SQL has no row-count limit for index use. LIKE with a leading wildcard prevents index use but that's a specific query pattern, not a general degradation."
    },
    {
      "level": 3,
      "diff": 3,
      "scenario": 2,
      "q": "You need to migrate a 500GB live production table from a BIGINT primary key to a UUID primary key as part of a multi-tenant refactor. The table receives ~2,000 writes per second. Outline the safest zero-downtime sequence. Which approach correctly handles all dependencies?",
      "opts": [
        "Add uuid_col UUID DEFAULT gen_random_uuid() NOT NULL, backfill in batches, update all FKs from child tables NOT VALID, swap application to write uuid_col as PK, VALIDATE constraints, drop old PK and bigint column.",
        "Drop the BIGINT PK, add UUID PK in one ALTER TABLE statement during a low-traffic window.",
        "Use pg_repack to atomically swap the primary key type with zero downtime.",
        "Add the UUID column, use a trigger to keep it in sync with BIGINT, then run a cutover migration.",
        "Export the table to CSV, recreate with UUID PK, import, and redirect traffic."
      ],
      "ans": 0,
      "fb": "The zero-downtime PK migration requires multiple phases: (1) add uuid_col with DEFAULT gen_random_uuid() — PG11+ handles this without table rewrite; (2) backfill existing rows in batches of 10k-50k to avoid lock escalation; (3) create a UNIQUE INDEX CONCURRENTLY on uuid_col; (4) update all foreign keys in child tables using NOT VALID to avoid full scans; (5) deploy application changes to write uuid as the join key; (6) VALIDATE CONSTRAINT in background; (7) drop old PK; (8) promote UUID to PK. Dropping and adding PK in one step causes full lock for minutes. pg_repack handles bloat not PK type changes. CSV export causes extended downtime."
    },
    {
      "level": 3,
      "diff": 3,
      "scenario": 2,
      "q": "During a zero-downtime migration, you run ALTER TABLE large_table DROP COLUMN legacy_col. The column contains a TEXT field with average 2KB per row and the table has 80M rows. What happens to storage immediately after the DROP?",
      "opts": [
        "DROP COLUMN immediately rewrites the table and reclaims all disk space.",
        "Cloud SQL immediately reclaims disk space by compacting the tablespace.",
        "The column data is moved to a pg_recycle_bin and freed after 7 days.",
        "PostgreSQL marks the column as dropped in the catalog but does NOT reclaim disk space immediately. The data remains in the heap until a subsequent VACUUM or table rewrite.",
        "DROP COLUMN on a TEXT column triggers an autovacuum to free TOAST storage."
      ],
      "ans": 3,
      "fb": "In PostgreSQL, DROP COLUMN is a metadata-only operation. The column is marked as pg_attribute.attisdropped = true but the data remains in the heap pages until the table is rewritten. This means disk usage does not decrease immediately. To reclaim space, you need to run VACUUM FULL (takes ACCESS EXCLUSIVE lock, not suitable for live systems) or use pg_repack to rebuild the table online. This is important to communicate to stakeholders who expect immediate storage savings. For TOAST data, the VACUUM process will eventually clean orphaned TOAST tuples."
    },
    {
      "level": 3,
      "diff": 3,
      "scenario": 3,
      "q": "Your RLS implementation uses current_setting('app.tenant_id') set via HikariCP's connectionInitSql. A load test reveals that under high concurrency, some requests occasionally read data from the wrong tenant. What is the most likely root cause?",
      "opts": [
        "HikariCP does not support connectionInitSql on Cloud SQL connections.",
        "connectionInitSql runs once when the connection is created, not on each borrow. If the application reuses connections without resetting the session parameter, the previous tenant's value persists for the next request.",
        "current_setting is not thread-safe in PostgreSQL 16.",
        "RLS policies are not evaluated under concurrent load due to a PostgreSQL lock optimization.",
        "Cloud SQL Auth Proxy strips custom session parameters before forwarding to PostgreSQL."
      ],
      "ans": 1,
      "fb": "connectionInitSql runs exactly once when the physical connection is first established in the pool. It does not re-execute on each logical borrow. If the application sets app.tenant_id during a request using SET SESSION, that value persists on the connection when it is returned to the pool. The next borrower inherits the previous tenant's ID if the application does not reset it first. The correct patterns are: (1) use SET LOCAL inside an explicit transaction (resets on commit), (2) use a HikariCP connection listener to set/reset the parameter on borrow/return, or (3) validate the parameter at the start of each request. This is a real multi-tenancy security bug."
    },
    {
      "level": 3,
      "diff": 3,
      "scenario": 4,
      "q": "Production shows a deadlock between two services. Service A updates table orders then accounts. Service B updates accounts then orders. Both services use Spring's @Transactional. The deadlocks appear every few minutes under load. What is the correct long-term fix?",
      "opts": [
        "Wrap both operations in SAVEPOINT blocks so deadlocks can be retried without full rollback.",
        "Increase deadlock_timeout to give transactions more time to wait before PostgreSQL resolves the deadlock.",
        "Reduce the transaction isolation level to READ COMMITTED to prevent deadlocks.",
        "Add FOR UPDATE SKIP LOCKED to all UPDATE statements to avoid blocking.",
        "Enforce a consistent lock ordering across all services: always acquire locks in the same table order (e.g. alphabetical or by object ID), eliminating the circular wait condition."
      ],
      "ans": 4,
      "fb": "Deadlocks occur when two transactions acquire locks in opposite orders. The definitive fix is to enforce a consistent acquisition order across all code paths — both services must always lock the same resource first (e.g., always update accounts before orders, or always lock by ascending entity ID). This eliminates the circular dependency. Increasing deadlock_timeout just delays detection and increases the impact window. SAVEPOINTs allow retry but don't prevent the deadlock. SKIP LOCKED is for queue patterns, not general locking. READ COMMITTED does not prevent deadlocks — it affects visibility of committed rows, not lock ordering."
    },
    {
      "level": 3,
      "diff": 3,
      "scenario": 4,
      "q": "A service uses SELECT FOR UPDATE to lock a row before updating it. Under high concurrency, this causes severe lock queuing. A team proposes using optimistic locking with a version column instead. What must the application correctly handle for optimistic locking to maintain data integrity?",
      "opts": [
        "SELECT FOR UPDATE and optimistic locking can be used together without conflict.",
        "The UPDATE must include WHERE version = :expectedVersion and check that exactly 1 row was affected; if 0 rows updated, the application must retry with fresh data — otherwise concurrent updates are silently lost.",
        "The version column must be of type BIGINT GENERATED ALWAYS AS IDENTITY.",
        "Optimistic locking only works with SERIALIZABLE isolation level in PostgreSQL 16.",
        "Optimistic locking requires a trigger to increment the version column automatically; application code cannot manage versioning."
      ],
      "ans": 1,
      "fb": "Optimistic locking requires the UPDATE to include a WHERE clause checking the version number: UPDATE t SET col = $1, version = version + 1 WHERE id = $2 AND version = $3. The application must then verify rowsAffected == 1. If 0 rows were updated, another transaction has already modified the row (version mismatch) and the current transaction must fetch fresh data and retry. Failing to check affected rows results in silent lost updates — the classic optimistic locking bug. Triggers can increment version but aren't required. SERIALIZABLE isolation is not required; READ COMMITTED works with optimistic locking. The version column type is flexible."
    },
    {
      "level": 3,
      "diff": 3,
      "scenario": 4,
      "q": "A production incident shows that a long-running analytics query on the `transactions` table is blocking a critical payment INSERT. The analytics query has been running for 45 minutes. `pg_stat_activity` shows the INSERT is waiting on `relation: transactions` with `lock_type: tuple`. What is the safest immediate mitigation that avoids data loss?",
      "opts": [
        "Run `VACUUM FULL transactions` to clear the lock contention caused by dead tuples",
        "Restart the PostgreSQL instance to clear all locks immediately",
        "Set `statement_timeout = '1s'` globally so the analytics query is auto-killed",
        "Increase `lock_timeout` on the INSERT connection so it waits longer before failing",
        "Terminate the analytics query session using `pg_terminate_backend` so the INSERT can proceed"
      ],
      "ans": 4,
      "fb": "Using `pg_terminate_backend` on the analytics session terminates that specific connection and releases its locks, unblocking the INSERT without data loss. The analytics query was a read (SELECT) so terminating it loses only that query's work — it can be re-run. Restarting the instance (A) unblocks the INSERT but causes downtime for all clients. Increasing `lock_timeout` (C) only makes the INSERT wait longer before it fails — it doesn't resolve the contention. `VACUUM FULL` (D) acquires ACCESS EXCLUSIVE lock itself and would worsen the situation. Setting a global `statement_timeout` (E) affects all queries and is a configuration change, not an immediate mitigation."
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 0,
      "q": "Your team has a 200M-row transactions table range-partitioned by created_at into monthly partitions. A new regulatory requirement mandates that data older than 3 years must be archived to cold storage, but must remain queryable for audit purposes within 48 hours. The operations team wants to simply DROP old partitions. What is wrong with this approach and what should they do instead?",
      "opts": [
        "Dropping partitions permanently destroys the data, violating the regulatory requirement to retain and be able to query it within 48 hours; they should DETACH the partition, export it to Cloud Storage as Parquet, and maintain a catalog that allows re-attachment or BigQuery external table access for audit queries",
        "They should use pg_repack to compress old partitions in-place, reducing storage costs while keeping data queryable",
        "They should convert old partitions to unlogged tables instead of dropping them, which moves data to cheaper storage within Cloud SQL",
        "DROP PARTITION is not supported in PostgreSQL 16 — they must DELETE rows from old partitions instead",
        "Dropping partitions is safe because Cloud SQL point-in-time recovery retains all dropped data for 35 days, satisfying the 48-hour query requirement"
      ],
      "ans": 0,
      "fb": "The regulatory requirement has two parts: (1) data must be removed from the active database (archival), and (2) data must remain queryable within 48 hours for audits. Simply dropping partitions satisfies (1) but violates (2) — the data is permanently lost. The correct approach is to DETACH PARTITION (metadata-only, instant), export the detached table to Cloud Storage as Parquet or Avro, then DROP the detached table. For audit queries, either re-attach the partition (if still in PostgreSQL) or query via BigQuery external tables over Cloud Storage. PITR (C) only retains data for 35 days and is for disaster recovery, not regulatory archival. Unlogged tables (D) are not a storage tier — they lose data on crash. pg_repack (E) reclaims bloat but does not reduce storage costs for dense data.",
      "context": {
        "Table": "200M rows, monthly RANGE partitions",
        "Regulation": "3-year active retention, then archive with 48-hour query SLA",
        "Current proposal": "DROP old partitions monthly"
      }
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 0,
      "q": "A team has range-partitioned a 500M-row audit_events table by created_at into monthly partitions. Their Grafana dashboard queries use WHERE created_at::DATE = CURRENT_DATE to show today's events. EXPLAIN shows all 24 partitions are being scanned despite the filter targeting a single day. The team's query works correctly on an unpartitioned test table. What is causing the full partition scan and what is the fix?",
      "opts": [
        "PostgreSQL 16 does not support partition pruning for TIMESTAMPTZ columns — the table should be partitioned by a DATE column instead",
        "Casting created_at to DATE wraps the partition key in a function, which prevents the planner from performing partition pruning; the fix is to rewrite the filter as WHERE created_at >= CURRENT_DATE AND created_at < CURRENT_DATE + INTERVAL '1 day'",
        "The monthly partitions are too large — they should switch to daily partitions so each day maps to exactly one partition",
        "Partition pruning is disabled by default in PostgreSQL 16 and must be enabled with SET enable_partition_pruning = on",
        "The planner needs ANALYZE to be run on the partitioned table before it can perform partition pruning"
      ],
      "ans": 1,
      "fb": "Partition pruning requires the WHERE clause to reference the partition key column directly, without wrapping it in a function or type cast. The expression created_at::DATE applies an implicit function call to the column, making it opaque to the planner's partition elimination logic — the planner cannot reverse the cast to determine which partition contains the matching rows. The correct approach uses a range predicate on the raw column: WHERE created_at >= CURRENT_DATE AND created_at < CURRENT_DATE + INTERVAL '1 day'. This allows the planner to match the predicate against partition boundaries and prune to a single partition. Daily partitions (A) would work but are unnecessary operational overhead. PostgreSQL 16 fully supports TIMESTAMPTZ partition pruning (C is false). ANALYZE does not affect partition pruning logic (D is false). Partition pruning is enabled by default (E is false).",
      "context": {
        "Table": "500M rows, monthly RANGE partitions on created_at (TIMESTAMPTZ)",
        "Query": "WHERE created_at::DATE = CURRENT_DATE",
        "EXPLAIN output": "All 24 partitions scanned",
        "Fix": "Use range predicate on raw column"
      }
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 0,
      "q": "A `payments` table is growing at 50 million rows per month. Most queries filter by `created_at` for recent months. You decide to implement range partitioning by `created_at`. Which statement about PostgreSQL range partitioning is correct?",
      "opts": [
        "Range partitioning by `created_at` requires a UNIQUE constraint on `created_at` across all partitions",
        "Partitioned tables cannot have foreign keys referencing them from other tables",
        "Each partition must be on a separate tablespace; otherwise, partitioning provides no performance benefit",
        "Queries filtering on `created_at` will use partition pruning to scan only relevant partitions, provided the filter is a constant or stable expression",
        "PostgreSQL automatically creates new monthly partitions as data is inserted beyond the last partition boundary"
      ],
      "ans": 3,
      "fb": "PostgreSQL's partition pruning eliminates partitions whose range cannot contain rows matching the WHERE clause. For range partitioning on `created_at`, a filter like `WHERE created_at >= '2025-01-01' AND created_at < '2025-02-01'` will cause the planner to scan only the January partition. Partitions are NOT created automatically (A) — a DBA must create them in advance (commonly via a cron job or Liquibase migration). UNIQUE constraints (C) are not required for range partitioning. FK references to partitioned tables (D) are supported since PostgreSQL 11. Tablespace separation (E) is optional."
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 1,
      "q": "A Cloud SQL High Availability instance performs a failover during a deployment. Your Spring Boot application's HikariCP connection pool begins throwing connection errors for 30 seconds before recovering. What is the most likely cause?",
      "opts": [
        "Cloud SQL HA changes the instance IP address during failover, requiring DNS reconfiguration.",
        "The Cloud SQL Auth Proxy must be restarted after each failover.",
        "HikariCP is holding stale connections from the primary that were invalidated by the failover; it needs to detect failures and evict them before establishing new connections to the new primary.",
        "HikariCP does not support PostgreSQL HA configurations.",
        "Spring Boot must be restarted after any Cloud SQL failover event."
      ],
      "ans": 2,
      "fb": "During a Cloud SQL HA failover, the primary instance becomes unavailable for 30-60 seconds while the standby is promoted. Existing TCP connections to the old primary become dead. HikariCP's idle connections are stale and will fail when used. HikariCP detects this through connection validation (testOnBorrow or keepaliveTime) and eventually evicts stale connections, but recovery takes time proportional to the pool's validation interval. Cloud SQL Auth Proxy handles DNS/IP transparently — the endpoint doesn't change. Spring Boot restart is not required. Auth Proxy reconnects automatically."
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 2,
      "q": "Your application shows intermittent HikariCP connection timeout errors under moderate load. The Cloud SQL instance shows low CPU and query times under 5ms. What should you check first?",
      "opts": [
        "Check whether PostgreSQL log_min_duration_statement is enabled.",
        "Check whether the Cloud SQL Auth Proxy has a connection limit configured.",
        "Check HikariCP maximumPoolSize — the pool may be undersized for the concurrency level, causing requests to queue waiting for a free connection.",
        "Check Cloud SQL storage — low storage can cause connection timeouts.",
        "Check whether the application's GKE pod has sufficient CPU to process responses."
      ],
      "ans": 2,
      "fb": "HikariCP connection timeouts under low DB load almost always indicate pool exhaustion: more concurrent request threads want a connection than the pool can provide. The requests queue, and if connectionTimeout (default 30s) elapses, the exception is thrown. The fix is to profile concurrency (how many threads need DB connections simultaneously) and size maximumPoolSize accordingly, while being careful not to exceed Cloud SQL's max_connections. Cloud SQL storage affects write performance, not connection establishment. Auth Proxy has no default connection limit. log_min_duration_statement is a monitoring concern, not a cause of timeouts."
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 3,
      "q": "A compliance officer is preparing for a PCI-DSS audit and asks you to document the encryption controls for a Cloud SQL instance that stores cardholder data. The instance currently uses Google-managed encryption keys (GMEK). The officer asks: 'If a Google employee with infrastructure access wanted to read our cardholder data, what prevents them?' How do you accurately respond?",
      "opts": [
        "GMEK encrypts data at rest so disk-level access returns ciphertext, but the keys are managed by Google infrastructure; for PCI-DSS cardholder data, CMEK via Cloud KMS is recommended because it gives your organisation control over key access policies and the ability to revoke keys independently of Google",
        "Cloud SQL does not encrypt data at rest by default — you must enable encryption manually for PCI-DSS compliance",
        "Google employees cannot access Cloud SQL data because Cloud SQL runs on dedicated hardware isolated from Google's internal infrastructure",
        "Google-managed keys fully prevent any Google employee access — Google's encryption is unbreakable even internally",
        "Encryption at rest is irrelevant to this threat model — the real control is VPC Service Controls preventing network-level access to the instance"
      ],
      "ans": 0,
      "fb": "GMEK encrypts all Cloud SQL data at rest using AES-256 with Google-managed keys. This prevents raw disk access from yielding readable data. However, the encryption keys are managed within Google's key management infrastructure, which means the data protection relies on Google's internal access controls. For PCI-DSS cardholder data environments, CMEK provides an additional control layer: your organisation manages the keys in Cloud KMS, defines IAM policies controlling key access, and can disable or destroy keys to make data permanently inaccessible — independent of Google's internal controls. This is the defence-in-depth approach auditors expect. Option A overstates GMEK's protection model. Option C is false — GMEK is enabled by default. VPC Service Controls (D) are a network perimeter control, not an encryption control. Cloud SQL does not run on dedicated hardware (E is false).",
      "context": {
        "Threat model": "Insider access by cloud provider employee",
        "Current encryption": "Google-managed keys (GMEK)",
        "PCI-DSS requirement": "Encryption at rest with demonstrable key control",
        "Recommendation": "Migrate to CMEK via Cloud KMS"
      }
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 3,
      "q": "Your team has migrated a Cloud SQL instance to CMEK using a Cloud KMS key. Six months later, the compliance team runs a drill: 'Demonstrate that you can make all data on this instance permanently inaccessible within 4 hours.' You attempt to disable the Cloud KMS key but discover that Cloud SQL continues to serve queries for another 30 minutes. What explains this behaviour and what must the runbook include?",
      "opts": [
        "Cloud KMS key disabling only prevents new data from being encrypted — existing encrypted data remains readable indefinitely",
        "Cloud SQL ignores CMEK key state changes and always uses a backup Google-managed key for continuity",
        "Disabling a Cloud KMS key has no effect on Cloud SQL — you must delete the key entirely to make data inaccessible",
        "The 30-minute delay is caused by Cloud SQL's connection draining period, not the key state — once connections close, the instance stops immediately",
        "Cloud KMS key disabling is eventually consistent — Cloud SQL caches the decrypted data encryption keys (DEKs) and continues operating until the cache expires; the runbook must account for this delay and include a verification step confirming the instance has stopped serving queries"
      ],
      "ans": 4,
      "fb": "When a CMEK key is disabled in Cloud KMS, Cloud SQL does not immediately lose access to data. Cloud SQL caches the data encryption keys (DEKs) that were unwrapped using the CMEK. Until this cache expires (typically 30-60 minutes), the instance continues to operate normally. After cache expiry, Cloud SQL attempts to re-unwrap the DEKs using the now-disabled CMEK, fails, and the instance becomes inaccessible. The compliance drill runbook must include: (1) disable the key, (2) wait for cache expiry, (3) verify that the instance returns errors on all queries, (4) document the total elapsed time. Deleting the key (B) is permanent and irreversible — disabling is the correct first step as it can be reversed. Cloud SQL does not fall back to GMEK (C is false). The delay is about DEK caching, not connection draining (D is false). Disabling does make existing data inaccessible after cache expiry (E is false).",
      "context": {
        "CMEK key": "Cloud KMS key used for Cloud SQL encryption",
        "Drill": "Demonstrate data inaccessibility within 4 hours",
        "Observed behaviour": "Instance continues serving queries for ~30 minutes after key disabled",
        "Root cause": "DEK cache within Cloud SQL"
      }
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 4,
      "q": "After enabling pg_stat_statements on a Cloud SQL instance, you query the top 10 queries by total_exec_time. The number-one query has total_exec_time=1,200,000ms, calls=12,000,000, and mean_exec_time=0.1ms. A junior engineer concludes this query is fine because mean_exec_time is only 0.1ms. Why is this conclusion potentially wrong, and what additional investigation is needed?",
      "opts": [
        "The query's total CPU consumption is 1,200 seconds despite each individual call being fast; at 12 million calls, this is likely an N+1 pattern or a tight loop that should be investigated by examining the query text and correlating with application code to determine if calls can be batched",
        "The high call count indicates the query is being called by autovacuum, which cannot be optimised",
        "total_exec_time includes network latency from the Cloud SQL Auth Proxy, so the actual database time is much lower and the query is not a concern",
        "The junior engineer is correct — a query with 0.1ms mean execution time cannot be a performance problem regardless of call count",
        "pg_stat_statements is inaccurate for queries under 1ms — the real execution time is likely higher and should be measured with EXPLAIN ANALYZE"
      ],
      "ans": 0,
      "fb": "A query with 0.1ms mean_exec_time seems harmless, but at 12 million calls it consumes 1,200 seconds of total database CPU time — making it the most resource-intensive query on the instance. This pattern is the classic N+1 problem: a single application request triggers hundreds or thousands of identical simple queries (e.g., fetching one row per loop iteration instead of batching into a single IN clause). The investigation should: (1) examine the query text in pg_stat_statements, (2) correlate with application code to find the calling loop, (3) determine whether the calls can be batched. The junior engineer's error is focusing on mean_exec_time in isolation without considering volume. total_exec_time does not include network latency (C is false — it measures server-side time only). Autovacuum queries are not tracked in pg_stat_statements by default (D is false). pg_stat_statements is accurate for sub-millisecond queries (E is false).",
      "context": {
        "Query stats": "total_exec_time=1,200s, calls=12M, mean=0.1ms",
        "Pattern": "Likely N+1 — high volume of trivially fast queries",
        "Investigation": "Examine query text, correlate with application code"
      }
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 0,
      "q": "A multi-tenant SaaS table has 2 billion rows partitioned by tenant_id using HASH(tenant_id) with 64 partitions. A new requirement asks for efficient time-range queries across a single tenant's data. What is the limitation of the current design and the recommended solution?",
      "opts": [
        "HASH partitioning is incompatible with time-range queries; the table must be migrated to RANGE partitioning.",
        "HASH partitioning with 64 partitions exceeds PostgreSQL 16's partition limit of 32.",
        "The solution is to add a partial index on (tenant_id, created_at) on each partition.",
        "HASH partitioning distributes rows evenly but does not support pruning on non-partition-key predicates. Time-range queries on a single tenant still scan all 64 partitions. The solution is sub-partitioning: HASH by tenant_id at level 1, RANGE by timestamp at level 2.",
        "HASH partitioning prevents adding indexes, so time-range queries are always sequential scans."
      ],
      "ans": 3,
      "fb": "HASH partitioning prunes based on the exact partition key value. A query WHERE tenant_id = $1 AND created_at BETWEEN $2 AND $3 will prune to the single partition for that tenant (using hash pruning) but cannot prune within that partition by time. Sub-partitioning (partition by HASH on tenant_id, sub-partition by RANGE on created_at) allows both dimensions of pruning. PostgreSQL 16 supports multi-level partitioning. PostgreSQL 16 supports far more than 32 partitions. Indexes can be created on partitioned tables. Migrating to RANGE would lose tenant isolation benefits."
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 0,
      "q": "You are partitioning an existing 800GB unpartitioned table using RANGE by month. You need to migrate the data with minimal downtime. What is the correct sequence?",
      "opts": [
        "Run ALTER TABLE old_table PARTITION BY RANGE (created_at) to convert it in-place.",
        "Rename the old table, create the partitioned table with the same name, and use a trigger to redirect writes.",
        "Create the partitioned table with partitions, use INSERT INTO ... SELECT to copy data in time-ordered batches, create a view or swap the table name after backfill, then redirect writes using a brief maintenance window.",
        "Dump and restore the table using pg_dump with the --partition flag.",
        "Use pg_repack to convert the table to a partitioned layout automatically."
      ],
      "ans": 2,
      "fb": "PostgreSQL does not support converting an existing unpartitioned table to a partitioned table in-place. The migration requires creating a new partitioned table, copying data in batches (to avoid long-running transactions and lock pressure), and swapping at cutover. The rename swap (old → old_backup, new → old) requires a brief exclusive lock window for the rename but minimises total downtime. pg_repack handles bloat and clustering, not partitioning conversion. There is no pg_dump --partition flag. Triggers-based approach is complex and error-prone for this scale."
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 0,
      "q": "You are migrating a 2 billion-row `events` table to range partitioning by `tenant_id` hash + `created_at` range (composite partitioning). The table is in production and cannot have extended downtime. What is the safest migration approach?",
      "opts": [
        "Run ALTER TABLE events PARTITION BY RANGE (created_at) in a single transaction during a maintenance window",
        "Export all data to Cloud Storage, truncate the table, re-create as partitioned, and re-import",
        "Create a new partitioned table, backfill data in batches using a background worker, swap via view or application-level routing, then drop the old table",
        "Add a check constraint per partition range to the existing table and let the planner use constraint exclusion instead of true partitioning",
        "Use pg_partman to convert the existing table to a partitioned table in-place without downtime"
      ],
      "ans": 2,
      "fb": "PostgreSQL cannot convert an existing table to a partitioned table in-place — `ALTER TABLE ... PARTITION BY` is not a supported operation. The standard zero-downtime approach is: create a new partitioned table, backfill data in batches (avoiding long lock windows), use a trigger or dual-write to keep it in sync, then cut over by renaming tables or updating the application routing. pg_partman (C) manages partition creation and maintenance but cannot convert existing tables. Constraint exclusion (D) is a legacy approach that is less capable than true partitioning and has been superseded. Truncate-and-reimport (E) causes extended downtime.",
      "context": {
        "Table size": "2 billion rows",
        "Current state": "Single unpartitioned table",
        "Downtime budget": "< 30 seconds at cutover"
      }
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 1,
      "q": "A Cloud SQL HA instance fails over during peak traffic. After the failover, the application reconnects successfully but you observe a 10-minute period of elevated query latency. What is the most likely cause?",
      "opts": [
        "The new primary (former standby) starts with a cold buffer cache — pages that were warm in memory on the old primary must be read from disk, causing elevated I/O until the cache warms up.",
        "PostgreSQL runs a full VACUUM ANALYZE after every failover to rebuild statistics.",
        "The Cloud SQL Auth Proxy needs to re-authenticate after failover, adding latency to each query.",
        "Cloud SQL applies schema migrations automatically during failover, causing lock contention.",
        "HikariCP re-validates all idle connections after failover, causing connection overhead."
      ],
      "ans": 0,
      "fb": "The standby instance that is promoted to primary during failover has not been serving queries and its shared_buffers buffer cache is cold. All pages that the old primary had warm in memory must now be fetched from disk, causing elevated read I/O and query latency until the cache warms to the steady-state working set. This typically takes 5-15 minutes depending on working set size and disk I/O capacity. Cloud SQL does not run migrations or VACUUM during failover. Auth Proxy reconnects transparently without per-query overhead. HikariCP connection validation is fast and does not cause sustained latency."
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 1,
      "q": "You want to test Cloud SQL HA failover behaviour in a staging environment before a production incident forces it. What is the safest method to initiate a manual failover?",
      "opts": [
        "Temporarily set max_connections = 0 to force all connections to fail and trigger automatic failover.",
        "Delete and recreate the Cloud SQL instance to test full recovery.",
        "Kill the Cloud SQL primary process using the GCP Console VM terminal.",
        "Suspend the primary instance's GKE node to simulate a zone failure.",
        "Use the Cloud SQL Admin API or gcloud sql instances failover command to trigger a controlled failover to the standby replica."
      ],
      "ans": 4,
      "fb": "Cloud SQL provides a first-class API for manual failover: gcloud sql instances failover INSTANCE_NAME or the Admin API. This initiates a controlled failover to the HA standby, allowing you to test application behaviour during the ~30-60 second switchover window. Killing the process or terminating the VM is uncontrolled and may corrupt state. Setting max_connections = 0 triggers connection refusal, not a true failover. Deleting and recreating is data-destructive. Cloud SQL runs on Google-managed infrastructure, not GKE nodes."
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 2,
      "q": "HikariCP is configured with maximumPoolSize=20 per pod, and you have 15 pods. Cloud SQL is configured with max_connections=100. What happens when all pods are running under full load?",
      "opts": [
        "Total potential connections = 20 × 15 = 300, exceeding Cloud SQL's max_connections=100. Pods that cannot obtain a connection receive 'FATAL: remaining connection slots are reserved' errors.",
        "The Cloud SQL Auth Proxy enforces the max_connections limit and rejects excess connections before they reach PostgreSQL.",
        "PostgreSQL silently drops connections above max_connections without error.",
        "Cloud SQL queues connection requests above max_connections and serves them in order.",
        "HikariCP automatically negotiates with Cloud SQL to stay within the max_connections limit."
      ],
      "ans": 0,
      "fb": "PostgreSQL enforces max_connections as a hard limit. When all slots are occupied, new connection attempts receive a FATAL error. 20 connections × 15 pods = 300 potential connections, which is 3× the 100-connection limit. As pods scale up or all become active simultaneously, connection errors will occur. The fix is to either increase max_connections (within Cloud SQL tier limits) or reduce pool size per pod. A better architectural approach is to use a connection pooler like PgBouncer in session or transaction mode between the pods and Cloud SQL. HikariCP does not auto-negotiate. Auth Proxy does not enforce max_connections."
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 3,
      "q": "A PCI-DSS audit requires you to provide evidence that access to the cardholder data environment database is logged, including failed login attempts. How do you enable this on Cloud SQL for PostgreSQL?",
      "opts": [
        "Enable the pgaudit extension and configure pgaudit.log = 'all' or 'connection,ddl,write' via Cloud SQL database flags; Cloud SQL automatically exports logs to Cloud Logging.",
        "Enable Cloud SQL binary logging, which captures all connection events.",
        "Enable Cloud SQL Data Access audit logs in the GCP IAM audit log settings.",
        "Install a custom Cloud Function trigger on Cloud SQL connection events.",
        "Configure log_connections = on in pg_hba.conf."
      ],
      "ans": 0,
      "fb": "pgaudit is the standard PostgreSQL audit extension, supported on Cloud SQL. It provides fine-grained logging of sessions, objects, and DML. Setting pgaudit.log = 'connection' captures successful and failed connections. Cloud SQL exports PostgreSQL logs to Cloud Logging automatically, providing the tamper-evident log trail required by PCI-DSS. Binary logging (used for MySQL replication) is not a PostgreSQL feature. pg_hba.conf is not user-accessible on Cloud SQL — use Cloud SQL flags instead. Cloud Functions cannot intercept DB connections. Cloud IAM audit logs capture Cloud SQL API calls, not database-level connections."
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 3,
      "q": "Your SOX compliance team requires a complete, tamper-evident audit log of all changes to financial records in the `ledger_entries` table. A developer suggests using PostgreSQL triggers to write to an `audit_log` table in the same database. What is the most significant risk with this approach?",
      "opts": [
        "Triggers do not capture the database user or application user performing the change, making the log incomplete",
        "A trigger-based audit log in the same database can be modified or deleted by any user with WRITE access to the audit table, undermining tamper-evidence",
        "The trigger will fire on each row change, causing the audit table to grow faster than Cloud SQL storage can handle",
        "Triggers in PostgreSQL cannot capture the old row values for UPDATE statements, so pre-change state is lost",
        "PostgreSQL triggers are too slow for high-volume tables and will cause write latency exceeding SLOs"
      ],
      "ans": 1,
      "fb": "For SOX compliance, tamper-evidence is critical. An audit log in the same PostgreSQL instance can be modified or deleted by a sufficiently privileged database user, or by a compromised application. A SOX-compliant audit trail should be written to an immutable or append-only store that is access-controlled separately — for example, Cloud Logging, BigQuery with DML restrictions, or an audit service with its own IAM controls. Option C is incorrect: PostgreSQL triggers expose `OLD` record values for UPDATE. Option E is addressable by setting `app.current_user` as a session variable and capturing it in the trigger."
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 4,
      "q": "A Cloud SQL instance serving a Spring Boot application shows high CPU utilization despite query times appearing normal in application logs. pg_stat_statements shows many queries with high calls but low mean_exec_time. What is the most likely root cause?",
      "opts": [
        "The Spring Boot application's JPA is generating excessively complex SQL that PostgreSQL must parse.",
        "Cloud SQL CPU includes background maintenance tasks that inflate CPU metrics unrelated to query load.",
        "Query volume (calls) is very high — many short queries executing in rapid succession can saturate CPU even when individual query time is low; the overhead is in connection handling, query parsing, and plan caching.",
        "High CPU is always caused by missing indexes; the queries need EXPLAIN ANALYZE investigation.",
        "Cloud SQL is performing automatic backups, which consume CPU."
      ],
      "ans": 2,
      "fb": "High query volume with low individual latency is the classic symptom of a 'chatty' application — typically caused by N+1 query patterns, eager loading misconfigurations in Hibernate, or missing query result caching. PostgreSQL must parse, plan, and execute each query even if it completes in under 1ms. At 10,000 queries/second, this generates substantial CPU overhead per second. The fix is to identify N+1 patterns (enable hibernate.show_sql or use OpenTelemetry spans), batch queries, use projections, or introduce caching. High calls + low mean_exec_time is diagnostic, not a symptom of missing indexes or backup overhead."
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 0,
      "q": "A partition maintenance job needs to automatically create next month's partition and detach last year's partition for archival. The job runs in a cron-triggered Cloud Run job. What failure mode must the job handle, and how?",
      "opts": [
        "Partition creation and detachment both require ACCESS EXCLUSIVE locks. If a long-running query holds a lock on the parent table, the maintenance job will block and eventually fail. The job must use lock_timeout and retry with exponential backoff.",
        "CREATE TABLE for a new partition does not require any locks and is always instant.",
        "Detaching a partition automatically migrates all rows to the parent table first.",
        "Cloud Run jobs cannot connect to Cloud SQL directly; they must use Pub/Sub to trigger partition maintenance.",
        "Partition detachment is irreversible and must be approved by a DBA before the job runs."
      ],
      "ans": 0,
      "fb": "ATTACH PARTITION and DETACH PARTITION require ACCESS EXCLUSIVE locks on the parent partitioned table. PostgreSQL 16 introduced DETACH PARTITION ... CONCURRENTLY which avoids the exclusive lock for detachment. However, CREATE TABLE (for the new partition) and ATTACH PARTITION still need brief locks. On a busy system, these locks can queue behind long-running queries, causing the maintenance job to wait indefinitely. The job must SET lock_timeout = '5s' before each DDL operation and implement retry logic. PostgreSQL 16's DETACH CONCURRENTLY is the right tool for production detachment. Cloud Run can connect via Cloud SQL Auth Proxy."
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 0,
      "q": "Your partitioned `transactions` table uses monthly range partitions on `created_at`. A query joining `transactions` with `accounts` on `account_id` covering the last 12 months is performing a sequential scan on all 12 partitions despite a `created_at` range filter. `EXPLAIN` shows `Partition Pruning: disabled`. What is most likely causing this?",
      "opts": [
        "Range partitions require a BRIN index on `created_at` for partition pruning to activate",
        "The planner disables partition pruning when the query involves a join with a non-partitioned table",
        "Partition pruning is only available in PostgreSQL 13 and above; older minor versions disable it silently",
        "The `created_at` filter is being passed as a bind parameter from Hibernate, and the planner cannot prune partitions at plan time with parameters of unknown type",
        "The `enable_partition_pruning` GUC is set to `off` either at session, database, or server level"
      ],
      "ans": 4,
      "fb": "The `EXPLAIN` output shows `Partition Pruning: disabled`, which is the direct indicator that `enable_partition_pruning` is off. This GUC controls whether the planner attempts partition pruning at all. It can be set at session level (`SET enable_partition_pruning = on`), database level, or in `postgresql.conf`. Option B is a subtlety: with bind parameters, pruning may happen at execution time rather than plan time, but it is still performed — the EXPLAIN output would show `Partition Pruning: runtime` not `disabled`. Option A is incorrect: joins with non-partitioned tables do not disable pruning. BRIN indexes (D) are not required for partition pruning."
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 1,
      "q": "After a Cloud SQL HA failover, your application recovers but 3 hours later Grafana shows a gradual increase in connection pool wait times trending toward exhaustion. No new deployments occurred. What is the most likely explanation?",
      "opts": [
        "The Cloud SQL Auth Proxy accumulates connection state after failover and must be restarted every 3 hours.",
        "HikariCP's connection leak detection is not enabled, causing pool exhaustion from unclosed connections.",
        "GKE pod autoscaling added pods after the failover, increasing pool demand beyond Cloud SQL capacity.",
        "After failover, some application connections may have entered an 'idle in transaction' state — the connection appears active to HikariCP but is stuck in an open transaction, slowly exhausting the pool over time.",
        "Cloud SQL reduces max_connections after failover as a protective measure."
      ],
      "ans": 3,
      "fb": "Idle-in-transaction connections are a common post-failover trap. When the old primary became unavailable, some in-flight requests may have caught an exception mid-transaction and failed to call rollback(), leaving the connection in an open transaction state when returned to the pool. HikariCP sees the connection as available, but PostgreSQL sees it as holding an open transaction. These connections hold locks and do not accept new work. Over time, more connections accumulate in this state, progressively exhausting the pool. Fix: enable HikariCP's leakDetectionThreshold, configure statement_timeout and idle_in_transaction_session_timeout in PostgreSQL, and ensure all exception paths call rollback()."
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 2,
      "q": "You are diagnosing why HikariCP pool wait times spike every hour for exactly 2 minutes. During these spikes, active connections are at maximum but no application traffic increase is visible. What should you investigate first?",
      "opts": [
        "GKE horizontal pod autoscaler scaling down pods every hour, reducing available pool capacity.",
        "Cloud SQL automated backups running on an hourly schedule and blocking connections.",
        "PostgreSQL autovacuum running every hour and consuming all connections during its run.",
        "A recurring background job or scheduled task that opens long-running transactions and holds connections for the duration — the regular interval and fixed duration pattern strongly suggests a scheduled process.",
        "HikariCP's connection eviction runs every hour and temporarily removes all connections."
      ],
      "ans": 3,
      "fb": "A regular 2-minute spike at hourly intervals with no traffic change is a strong pattern signature of a scheduled job. Common culprits: Spring's @Scheduled tasks, Quartz jobs, Kafka consumer batch commits, or external batch triggers (e.g., a Cloud Scheduler job). These jobs may open transactions that hold connections for their full duration, leaving other requests queued. Investigation: correlate the spike time with application logs, Spring task executor metrics, and Kafka consumer commit logs. Autovacuum does not consume all connections. Cloud SQL backups are I/O-bound, not connection-bound. HikariCP eviction recycles idle connections, not active ones."
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 2,
      "q": "Your Cloud SQL instance serves 8 Spring Boot services, each with a HikariCP pool of 10 connections (80 total). You observe that during incident response, a single service's connection pool becomes saturated while others are idle, yet the overall connection count is well below max_connections. What architectural pattern would prevent one service from monopolizing connections during an incident?",
      "opts": [
        "Configure Cloud SQL to distribute connections equally across all connecting users.",
        "Deploy a separate Cloud SQL instance per service to ensure complete isolation.",
        "Reduce each service's maximumPoolSize to 5 to ensure no single service can take more than 5 connections.",
        "Implement a connection pooler (e.g. PgBouncer) with per-service connection limits, using pool_mode=transaction and per-database/user pool constraints to enforce fair sharing regardless of individual service behaviour.",
        "Enable HikariCP's connection fair-queue mode, which distributes connections evenly across all services."
      ],
      "ans": 3,
      "fb": "The problem is that per-service pools are independent — a saturated service holds its 10 connections regardless of whether other services are idle. A connection pooler like PgBouncer deployed as a shared proxy can enforce per-user or per-database connection limits (pool_size per user) and dynamically allocate unused connections to services that need them. In transaction mode, connections are returned to the pool after each transaction, dramatically increasing effective concurrency. HikariCP has no fair-queue mode — it manages a single service's pool. Cloud SQL has no per-user connection distribution. Separate instances per service is an expensive isolation strategy that doesn't solve shared capacity management."
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 3,
      "q": "A SOX audit requires a 7-year retention policy for financial transaction records stored in Cloud SQL. The records are immutable by policy and the database is currently 4TB growing at 600GB/year. What is the most operationally sustainable architecture?",
      "opts": [
        "Keep all 7 years of data in Cloud SQL and increase the instance tier to accommodate growth.",
        "Partition the transactions table by year. After the active period, detach old partitions and export them to Cloud Storage (Parquet/Avro) using Cloud SQL's export feature. Maintain a metadata catalog for queries spanning hot and cold tiers.",
        "Truncate data older than 2 years from Cloud SQL and rely on daily Cloud SQL exports for compliance.",
        "Use Cloud SQL read replicas as the archive tier, replicating old data to cheaper replica instances.",
        "Enable Cloud SQL point-in-time recovery for 7 years, which automatically satisfies retention requirements."
      ],
      "ans": 1,
      "fb": "Keeping 7 years of financial data in an active Cloud SQL instance is expensive and operationally unsustainable. The right approach is tiered storage: RANGE-partition by year so old partitions can be detached without affecting current data, then export detached partitions to Cloud Storage as Parquet for long-term immutable retention. For rare audit queries, BigQuery can query Cloud Storage directly via external tables. Cloud SQL PITR retention is limited to 7 days, not 7 years. Truncating data violates the SOX 7-year retention requirement. Read replicas replicate the live dataset, not a historical archive."
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 3,
      "q": "You need to implement a data retention policy that deletes customer PII from Cloud SQL after 7 years to comply with GDPR while retaining financial transaction records indefinitely for SOX. Both PII fields and financial data exist in the same `transactions` table. What is the most compliant and operationally safe approach?",
      "opts": [
        "Set `autovacuum` to aggressively reclaim storage after PII data expires, which physically removes the data",
        "Separate PII fields into a `customer_pii` table linked by `customer_id`; after 7 years, delete rows from `customer_pii` while retaining `transactions` rows with a NULL or pseudonymised customer reference",
        "Use Cloud SQL point-in-time recovery to restore the database to a state before PII was ingested",
        "Run a nightly DELETE job on the `transactions` table that removes rows older than 7 years",
        "Encrypt PII columns with a per-customer key; revoke the key after 7 years to make the data unreadable"
      ],
      "ans": 1,
      "fb": "Separating PII from financial records allows each to be retained according to its own policy. Deleting the `customer_pii` row satisfies GDPR erasure requirements while the `transactions` row (containing amounts, dates, references) remains for SOX. Deleting entire transaction rows (A) would violate SOX retention requirements. Autovacuum (C) reclaims space from dead tuples but cannot be configured as a retention policy. PITR (D) is for recovery, not forward deletion. Key revocation (E) is an advanced approach that may satisfy GDPR's right to erasure in some interpretations, but physical deletion is cleaner and more universally accepted.",
      "context": {
        "GDPR": "Right to erasure of PII after 7 years on customer request or policy expiry",
        "SOX": "Financial transaction records must be retained indefinitely",
        "Conflict": "PII and financial data currently in the same table row"
      }
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 4,
      "q": "You are tuning a Cloud SQL PostgreSQL instance that serves mixed OLTP and analytical queries. The OLTP queries are suffering high latency when analytical queries run. You have already separated reads to a read replica. Which PostgreSQL parameter change would most directly limit the resources a single analytical query can consume on the OLTP instance?",
      "opts": [
        "Enable pg_prewarm to keep OLTP table pages in cache so analytical queries cannot evict them.",
        "Set max_parallel_workers_per_gather = 0 to disable parallel query and reduce CPU contention.",
        "Increase shared_buffers to give analytical queries more cache, reducing I/O competition.",
        "Set random_page_cost = 1.0 to encourage index scans over sequential scans for analytical queries.",
        "SET work_mem to a lower value for the analytical workload role, limiting the per-sort and per-hash-join memory allocation and forcing disk spills earlier, reducing memory pressure on OLTP queries."
      ],
      "ans": 4,
      "fb": "work_mem controls the memory allocated per sort or hash operation per query. Analytical queries typically involve large sorts and hash joins. By setting a lower work_mem for the analytical role (ALTER ROLE analytics_role SET work_mem = '16MB'), you limit how much RAM these queries consume per operation, reducing their impact on OLTP. They will spill to disk more often (slower for analytics but protective of OLTP). Disabling parallel workers (option C) is also effective for CPU reduction but hurts analytical query completeness. Increasing shared_buffers helps both but doesn't protect OLTP from analytical resource consumption. pg_prewarm cannot pin pages against eviction."
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 4,
      "q": "A PostgreSQL 16 instance on Cloud SQL shows checkpoint_completion_target=0.5 (default). Your Grafana dashboard shows write latency spikes every ~5 minutes coinciding with checkpoint activity. What is the most targeted parameter change to reduce these spikes?",
      "opts": [
        "Set synchronous_commit = off to avoid fsync on every commit, reducing checkpoint pressure.",
        "Increase max_wal_size to allow larger WAL segments before a checkpoint is forced.",
        "Decrease checkpoint_timeout from 5m to 1m to make checkpoints more frequent and shorter.",
        "Increase checkpoint_completion_target to 0.9, spreading dirty page writes over 90% of the checkpoint interval rather than 50%, smoothing I/O and reducing write latency spikes.",
        "Increase shared_buffers to reduce the number of dirty pages that need to be checkpointed."
      ],
      "ans": 3,
      "fb": "checkpoint_completion_target controls how much of the checkpoint interval PostgreSQL uses to spread dirty page writes. At 0.5, it writes all dirty pages in 50% of the interval, then is idle for 50%, causing I/O bursts. Setting it to 0.9 spreads writes over 90% of the interval, dramatically smoothing the I/O pattern. This is the standard fix for checkpoint-related write latency spikes. Decreasing checkpoint_timeout makes checkpoints more frequent (more overhead). Increasing max_wal_size only delays forced checkpoints but doesn't smooth I/O within them. synchronous_commit=off risks data loss on crash. shared_buffers increases cache but doesn't address write-back IO distribution."
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 0,
      "q": "Your platform serves 40 microservice teams, each owning their own Cloud SQL instance. Engineering leadership wants a unified approach to schema versioning across the platform. You are asked to lead the decision. Which approach best balances team autonomy with platform consistency?",
      "opts": [
        "Mandate Liquibase with a shared corporate changelog file that all teams contribute to",
        "Let each team choose any migration tool they prefer and document their approach in a README",
        "Mandate Liquibase (or Flyway) as the approved tool, require changelogs to live in the service repo, and publish a platform standard for naming, ordering, and rollback conventions",
        "Use Infrastructure-as-Code (Terraform) to manage all schema changes centrally",
        "Require all DDL changes to be approved by a central DBA team before being applied"
      ],
      "ans": 2,
      "fb": "Mandating the toolset (Liquibase or Flyway) while keeping changelogs in the service repo preserves team autonomy and CI/CD ownership, while the platform standard ensures consistency in naming, ordering, and rollback. A single shared changelog file (A) creates a merge bottleneck. Free choice of tools (C) fragments operational knowledge and incident response. Terraform (D) is for infrastructure provisioning, not row-level schema migrations. Central DBA approval (E) creates a bottleneck that kills team velocity at platform scale.",
      "context": {
        "Teams": "40 microservices, each with a Cloud SQL instance",
        "Goal": "Consistent schema versioning without a central bottleneck",
        "Current state": "Mixed — some use Flyway, some Liquibase, some ad-hoc SQL scripts"
      }
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 0,
      "q": "Two engineering teams disagree about whether to use a shared PostgreSQL schema with row-level security or separate schemas per tenant for data isolation. You are facilitating the decision. Which factor most directly drives the architectural choice between these two patterns?",
      "opts": [
        "The number of tenants: row-level security works for up to 10 tenants, separate schemas for more",
        "The compliance requirements: PCI-DSS and SOX mandate physically separate schemas per tenant",
        "The operational complexity tolerance and whether tenant data must be provably isolated at the database layer versus the application layer",
        "The choice of ORM: Hibernate requires separate schemas, while JDBC supports row-level security",
        "The version of PostgreSQL: separate schemas require PostgreSQL 14 or later"
      ],
      "ans": 2,
      "fb": "The core trade-off is operational complexity vs. isolation guarantee. Separate schemas make per-tenant backup, restore, and audit straightforward but multiply migration complexity. Row-level security provides logical isolation within a shared schema with lower operational overhead but requires careful policy design and application-level tenant context injection. Tenant count (A) is not the deciding factor — RLS works at any scale. PCI-DSS and SOX (B) do not mandate physical schema separation — they require demonstrable isolation, which RLS can satisfy with proper policy auditing. PostgreSQL version (D) is irrelevant to this choice. Hibernate (E) supports both patterns.",
      "context": {
        "Compliance": "PCI-DSS, SOX",
        "Tenant count": "~80 tenants, growing",
        "Teams involved": "Platform, Security, 3 product teams"
      }
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 1,
      "q": "A platform team has introduced read replicas for three services. After a week in production, the reconciliation service reports discrepancies: it reads a payment status as 'PENDING' from the replica immediately after the payment service writes 'COMPLETED' to the primary. The reconciliation team wants to add a 5-second sleep after each write before reading from the replica. What is your guidance as the database architect?",
      "opts": [
        "Recommend switching to synchronous replication to eliminate all lag between primary and replica",
        "Recommend that the payment service write to both the primary and the replica simultaneously to ensure consistency",
        "Approve the 5-second sleep — replication lag is typically under 5 seconds so this will resolve most discrepancies",
        "Reject the sleep approach because replication lag is variable and can exceed 5 seconds under load; instead, redesign the reconciliation service to read from the primary for any query that follows a write within the same business operation (read-your-writes pattern), and use the replica only for batch reconciliation queries where seconds-old data is acceptable",
        "Recommend increasing the replica's instance tier to reduce replication lag below 1 second"
      ],
      "ans": 3,
      "fb": "The 5-second sleep is a fragile workaround: replication lag is not constant — it depends on write volume, WAL replay speed, and recovery conflicts from concurrent queries on the replica. Under peak load, lag can spike to 10-30 seconds, making any fixed sleep unreliable. The correct architectural pattern is 'read-your-writes consistency': when a service writes data and then immediately needs to read it back, the read must go to the primary. This should be implemented at the application routing layer (e.g., a flag in the request context that routes reads to the primary when following a write within the same business operation). The replica should only be used for queries where staleness is explicitly acceptable (batch reconciliation, reporting). Synchronous replication (C) eliminates lag but adds latency to every write on the primary. Writing to both (D) is not supported in PostgreSQL streaming replication. A larger replica (E) may reduce average lag but does not eliminate spikes.",
      "context": {
        "Symptom": "Reconciliation reads stale data from replica",
        "Pattern": "Write to primary, immediate read from replica",
        "Replication lag": "Variable, typically 50-500ms but can spike under load",
        "Fix": "Read-your-writes routing for consistency-sensitive paths"
      }
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 2,
      "q": "You are planning a large-scale migration that adds a NOT NULL column with a DEFAULT to a table that has 200 million rows in production. What is the safest approach to avoid a multi-hour table lock?",
      "opts": [
        "Run ALTER TABLE ... ADD COLUMN col TEXT NOT NULL DEFAULT 'value' during a maintenance window",
        "Add the column as nullable with no default, backfill values in batches, then add the NOT NULL constraint using NOT VALID and later VALIDATE CONSTRAINT",
        "Increase max_locks_per_transaction and run the ALTER TABLE during off-peak hours",
        "Use pg_repack to rebuild the table with the new column schema without locking",
        "Add the column with a DEFAULT expression that reads from a separate lookup table"
      ],
      "ans": 1,
      "fb": "In PostgreSQL 11+, adding a column with a non-volatile DEFAULT no longer rewrites the table. However, for very large tables with complex defaults or NOT NULL constraints involving validation, the safest zero-downtime pattern is: add the column as nullable, batch-backfill in small transactions, then add the NOT NULL constraint with NOT VALID (which skips scanning existing rows), and finally run VALIDATE CONSTRAINT in a separate transaction (which takes a weaker ShareUpdateExclusiveLock). A maintenance window with a full lock (A) is unsafe at 200M rows. pg_repack (C) rebuilds the table but still requires triggers and does not avoid all lock concerns during swap. A lookup-table DEFAULT (D) is a volatile function and would trigger a table rewrite. Increasing max_locks_per_transaction (E) is irrelevant to lock duration.",
      "context": {
        "Table size": "200 million rows, ~180 GB",
        "PostgreSQL version": "16",
        "Constraint": "Zero-downtime migration required"
      }
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 2,
      "q": "A senior engineer proposes running a Liquibase migration that renames a heavily-used column during peak traffic. What is the safest way to rename a column on a live production table without downtime?",
      "opts": [
        "Use pg_repack to rename the column atomically without locking",
        "Use ALTER TABLE ... RENAME COLUMN inside a short transaction during off-peak hours",
        "Use Liquibase's renameColumn changeset, which handles the dual-write automatically",
        "Add the new column, dual-write from the application to both columns, backfill old data, switch reads to the new column, then drop the old column across multiple deployments",
        "Create a view with the new column name aliased over the old one and update all queries to use the view"
      ],
      "ans": 3,
      "fb": "Renaming a column is a breaking change for any code that references the old name. The safe zero-downtime pattern is: (1) add the new column, (2) deploy a version of the app that writes to both columns, (3) backfill historical data, (4) deploy a version that reads from the new column and stops writing to the old one, (5) drop the old column. This is an expand-contract (parallel-change) pattern. A direct RENAME (A) is a single DDL statement but breaks all running application code that uses the old name. pg_repack (C) rebuilds tables, it does not rename columns atomically. A view alias (D) is a workaround but adds a layer of indirection and doesn't help when ORM models reference the column directly. Liquibase renameColumn (E) is a DDL wrapper — it does not orchestrate dual-write logic.",
      "context": {
        "Column": "user_ref renamed to tenant_user_id",
        "Table": "350M rows, accessed by 8 services",
        "Constraint": "Zero downtime required"
      }
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 3,
      "q": "A team reports that their query SELECT * FROM orders WHERE is_deleted = FALSE AND tenant_id = $1 is performing a sequential scan despite having indexes on both is_deleted and tenant_id. The table has 50M rows, of which 97% have is_deleted = FALSE. You check pg_stats and find the planner's statistics are accurate. Two other teams have similar patterns on their tables. What platform-level guidance should you issue?",
      "opts": [
        "Issue guidance to increase the statistics target on boolean columns to improve planner accuracy",
        "Issue guidance to create composite indexes on (tenant_id, is_deleted) for all tables with this query pattern — the composite index solves both teams' problems",
        "Issue guidance to set enable_seqscan = off to force the planner to use indexes in all cases",
        "Issue guidance to split the table into two tables: active_orders and deleted_orders, eliminating the boolean column entirely",
        "Issue guidance that columns with extreme skew (like boolean flags where one value dominates) should use partial indexes: CREATE INDEX ON orders(tenant_id) WHERE is_deleted = FALSE, which creates a smaller, more efficient index that only covers the common query path; document this as a platform indexing pattern for boolean filter columns"
      ],
      "ans": 4,
      "fb": "When 97% of rows have is_deleted = FALSE, a standard B-tree index on is_deleted has very poor selectivity for the dominant value — the planner correctly determines that scanning nearly all rows via an index is more expensive than a sequential scan. A partial index WHERE is_deleted = FALSE excludes the 3% of deleted rows from the index entirely, making it smaller and faster. Combined with tenant_id as the indexed column, the partial index efficiently supports the common query pattern. This is a recurring pattern across teams and deserves platform-level documentation. A composite index (A) on (tenant_id, is_deleted) works but is larger than necessary — the partial index achieves the same result with less storage and maintenance overhead. Increasing statistics target (C) does not help when the planner already has accurate statistics — the issue is selectivity, not estimation. Disabling seqscan (D) is a dangerous global setting that harms other queries. Table splitting (E) is operationally complex and rarely justified for a boolean flag.",
      "context": {
        "Table": "50M rows, 97% is_deleted=FALSE",
        "Query": "WHERE is_deleted = FALSE AND tenant_id = $1",
        "Current indexes": "Separate B-tree on is_deleted, separate B-tree on tenant_id",
        "Recommendation": "Partial index pattern for boolean columns with extreme skew"
      }
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 3,
      "q": "After a major data migration, three teams report that their previously fast queries now use suboptimal plans. You investigate and find that pg_stats for the migrated tables shows histograms based on pre-migration data distributions. Running ANALYZE fixes each team's queries. You want to prevent this class of issue across the platform. What platform-level standard should you establish?",
      "opts": [
        "Disable autovacuum and replace it with a scheduled VACUUM ANALYZE job that runs every 4 hours on all tables",
        "Add ANALYZE as a mandatory post-migration step in the platform's Liquibase migration template, and configure autovacuum_analyze_scale_factor to a lower value (e.g., 0.02 instead of the default 0.1) on high-write tables so autovacuum triggers ANALYZE more frequently after large data changes",
        "Set plan_cache_mode = force_custom_plan to prevent PostgreSQL from using stale cached plans",
        "Mandate that all teams run ANALYZE manually after every deployment that modifies more than 1,000 rows",
        "Increase the default_statistics_target from 100 to 1000 on all tables to prevent planner errors"
      ],
      "ans": 1,
      "fb": "The root cause is that large data changes (migrations, bulk loads, data shuffles) can make pg_statistic entries inaccurate, causing the planner to choose wrong plans. Two complementary fixes address this at the platform level: (1) Add ANALYZE as a standard step in Liquibase migration templates, so any changeset that modifies large amounts of data is followed by ANALYZE on affected tables. (2) Lower autovacuum_analyze_scale_factor for high-write tables (default 0.1 means ANALYZE triggers after 10% of rows change — on a 100M row table, that is 10M row changes). A lower setting like 0.02 triggers ANALYZE more frequently. Manual ANALYZE mandates (A) are fragile and depend on developer discipline. Setting statistics_target to 1000 globally (C) wastes memory and slows ANALYZE without addressing the timing issue. Disabling autovacuum (D) is dangerous and risks XID wraparound. plan_cache_mode (E) addresses prepared statement caching, not statistics staleness.",
      "context": {
        "Root cause": "Large data migrations invalidate pg_stats histograms",
        "Affected teams": "3 teams, each with different tables and query patterns",
        "Fix": "Platform-level ANALYZE in migration templates + autovacuum tuning"
      }
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 4,
      "q": "Your team is reviewing Cloud SQL instance sizing for a service that has grown from 10 to 80 active tenants. CPU utilisation is consistently 30%, but you receive alerts about connection exhaustion. What is the most cost-effective first action?",
      "opts": [
        "Switch from Cloud SQL Auth Proxy to direct SSL connections to reduce overhead",
        "Review HikariCP pool sizing across all pods and reduce pool size per pod to stay within the instance max_connections budget",
        "Immediately upgrade to a larger Cloud SQL tier to increase the max_connections limit",
        "Add a read replica to split the connection load between primary and replica",
        "Enable Cloud SQL connection multiplexing by upgrading to Enterprise Plus tier"
      ],
      "ans": 1,
      "fb": "Connection exhaustion with low CPU utilisation is a classic sign of over-provisioned connection pools. Each GKE pod opens its own HikariCP pool, and as pods scale out, total connections multiply. Reviewing and reducing the per-pod pool size (e.g., from 10 to 3-5) is free and often resolves the issue immediately. Upgrading the instance tier (A) increases cost and max_connections but does not fix the root cause of over-provisioned pools. Enterprise Plus (C) adds cost and is aimed at performance, not connection management. Switching from Auth Proxy (D) increases security risk and is irrelevant to connection count. Adding a read replica (E) only helps if read queries are the source of connections, which is not indicated.",
      "context": {
        "CPU utilisation": "30% average",
        "Alert": "max_connections approached (95% of limit)",
        "Deployment": "20 GKE pods, each with HikariCP pool size 10"
      }
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 4,
      "q": "Cloud SQL storage automatically grows but does not shrink. A team reports their instance storage grew rapidly after a bulk delete of 50 million rows. What explains this and what is the correct action?",
      "opts": [
        "PostgreSQL marks deleted rows as dead tuples; the space is not returned to the OS until VACUUM reclaims it and autovacuum may not have run yet",
        "Cloud SQL has a bug where storage does not reclaim space — you must restore from backup to a smaller instance",
        "The growth is caused by increased WAL generation during the bulk delete; reducing WAL level will reclaim the space",
        "The rows are permanently deleted and storage grows because Cloud SQL charges for deleted row metadata",
        "The storage grew because Cloud SQL created a shadow copy of the deleted rows for point-in-time recovery"
      ],
      "ans": 0,
      "fb": "PostgreSQL uses MVCC (multi-version concurrency control). Deleted rows become dead tuples that occupy disk space until VACUUM reclaims the pages. On Cloud SQL, autovacuum runs by default but may lag behind a sudden bulk delete. Running VACUUM (VERBOSE) on the table after a large delete will reclaim the pages, making them available for reuse within the table. However, PostgreSQL does not return file space to the OS (and therefore to Cloud SQL storage) unless VACUUM FULL is run, which rewrites the table. Metadata charges (A) are not how PostgreSQL storage works. There is no Cloud SQL bug (C). WAL level does not directly cause table bloat (D). Cloud SQL PITR uses transaction logs, not shadow copies (E).",
      "context": {
        "Rows deleted": "50 million in a single transaction",
        "Post-delete storage": "Increased by 40 GB and has not decreased",
        "Autovacuum": "Enabled, but scale factor default (0.2)"
      }
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 0,
      "q": "You are leading an architecture review for a new feature that requires querying tenant data across 80 schemas. The proposed design joins a cross-tenant aggregation view to per-tenant tables using dynamic SQL at runtime. What is your primary concern with this approach and what would you recommend instead?",
      "opts": [
        "The approach is architecturally sound but needs connection pooling in front of each schema",
        "Dynamic SQL is not supported in PostgreSQL views; recommend rewriting as a stored procedure",
        "Dynamic SQL prevents Liquibase from managing the schema changes; recommend switching to Flyway",
        "Cross-schema joins are blocked by Cloud SQL IAM policies; recommend consolidating into a single schema",
        "The approach will generate 80 separate query plans that the planner cannot optimise as a single unit, causing unpredictable performance at scale; recommend a dedicated aggregation table with incremental updates via triggers or Kafka events"
      ],
      "ans": 4,
      "fb": "Querying 80 schemas with dynamic SQL means the planner sees each schema query independently, cannot build a single optimised plan across all tenants, and the code complexity grows linearly with tenant count. A dedicated aggregation table (materialised view, or a table maintained by triggers or Kafka events) keeps the cross-tenant query to a single efficient SELECT and separates write-path from read-path concerns. Dynamic SQL is valid PostgreSQL syntax (A is wrong). Cloud SQL IAM does not block cross-schema joins within the same database (C is wrong). Connection pooling per schema (D) does not address the query plan fragmentation problem. Liquibase supports dynamic SQL (E is a non-issue).",
      "context": {
        "Tenants": "80 schemas in one Cloud SQL instance",
        "Feature": "Platform-wide reporting dashboard",
        "Query complexity": "Aggregating 5 tables per tenant"
      }
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 0,
      "q": "You are facilitating a cross-team architecture decision about whether to use database-level foreign keys or application-level referential integrity across a set of microservices. A team argues foreign keys hurt write throughput. How should you frame the decision?",
      "opts": [
        "Foreign keys are appropriate within a single service's bounded context; across service boundaries, application-level integrity with compensating logic is the correct pattern, and the throughput concern should be validated with benchmarks before being used to justify removing constraints",
        "Foreign keys should only be used for PCI-DSS compliance and removed for non-regulated tables",
        "Foreign keys should be replaced by Kafka events that verify referential integrity asynchronously",
        "Never use foreign keys in microservices — distributed systems require eventual consistency everywhere",
        "Always use foreign keys — application-level integrity is never sufficient for production systems"
      ],
      "ans": 0,
      "fb": "The correct framing is: foreign keys enforce integrity within a bounded context (single service, single database) and are almost always worth the marginal write overhead, which is typically single-digit milliseconds. Across service boundaries, a foreign key is impossible (each service owns its data), so application-level or event-driven compensating logic is the appropriate pattern. The throughput concern (A's implicit opposite) should be measured, not assumed. Blanket removal (B) leads to data integrity bugs that are very expensive to find and fix. Kafka events (D) introduce asynchronous lag and do not provide the same synchronous integrity guarantee. Limiting to PCI-DSS tables (E) is an arbitrary rule with no technical basis."
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 1,
      "q": "You have set up a Cloud SQL read replica for a reporting service. Under load testing, you observe that queries on the replica have significantly higher p99 latency than on the primary, even though the replica has lower CPU utilisation. What is the most likely cause?",
      "opts": [
        "The replica is running an older minor version of PostgreSQL and lacks performance improvements",
        "The replica's pg_stat_statements extension is disabled, preventing query optimisation",
        "WAL replay on the replica holds ShareLock on affected pages, causing read queries to wait when a high-volume write workload is streaming to the replica",
        "Cloud SQL replicas use a smaller storage tier by default, causing more I/O wait",
        "The replica's autovacuum is disabled, causing dead tuple accumulation that slows scans"
      ],
      "ans": 2,
      "fb": "In PostgreSQL streaming replication, WAL replay on the replica must acquire brief locks on pages it modifies. Under high write throughput from the primary, the WAL replay process can cause read queries on the replica to wait for these locks, increasing latency without necessarily raising CPU. This is called 'recovery conflict' and can be tuned with hot_standby_feedback and max_standby_streaming_delay. Minor version differences (A) are not the cause described. pg_stat_statements (B) is a monitoring extension, not an optimiser. Autovacuum on replicas (D) does not run directly — dead tuples are cleaned by the replica applying VACUUM WAL records from the primary. Cloud SQL replica storage tier (E) matches the primary by default.",
      "context": {
        "Primary write rate": "8,000 TPS",
        "Replica CPU": "18%",
        "Observed": "p99 query latency 3× higher on replica vs primary"
      }
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 1,
      "q": "You are designing a query routing strategy for a platform with a primary Cloud SQL instance and two read replicas. Some queries must read from the primary (e.g., immediately after a write), while others can tolerate slight staleness. How should the application layer implement this routing?",
      "opts": [
        "Configure all queries to use the primary and add a replica only for backup purposes",
        "Configure two DataSource beans in Spring Boot: one pointing to the primary (used by transactional write paths and reads requiring consistency), one pointing to a replica (used by explicitly annotated read-only services)",
        "Use a single DataSource and set the transaction isolation level to SERIALIZABLE to ensure replicas return current data",
        "Use the Cloud SQL Auth Proxy with a single connection string that automatically routes reads to replicas",
        "Use a round-robin load balancer across all three instances for all queries"
      ],
      "ans": 1,
      "fb": "The standard pattern in Spring Boot is to define two DataSource beans (primary and replica), configure a routing DataSource that inspects whether the current transaction is read-only (@Transactional(readOnly=true)), and route accordingly. This gives explicit, code-level control over routing without relying on opaque infrastructure behaviour. Round-robin (A) may route reads to a replica immediately after a write, causing stale reads on the same request. SERIALIZABLE isolation (C) does not force a replica to return primary-level data — it only tightens the isolation model on whatever instance you're connected to. The Auth Proxy does not perform query routing (D) — it is a connection proxy, not a query router. Using only the primary (E) defeats the purpose of replicas.",
      "context": {
        "Framework": "Spring Boot 3, HikariCP",
        "Replicas": "2 read replicas on Cloud SQL",
        "Requirement": "Post-write reads must be consistent; reporting reads can be slightly stale"
      }
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 1,
      "q": "Three engineering teams are proposing different read replica strategies for their services. Team A wants a dedicated read replica per service. Team B wants all reporting queries to route to a shared read replica. Team C wants to use Cloud SQL's built-in read replica for cross-region failover only. As the platform architect, what is the most important technical concern to raise about Team B's proposal?",
      "opts": [
        "Replication lag on the shared replica will cause all teams to receive stale data, violating consistency requirements",
        "Cloud SQL read replicas do not support connection pooling via PgBouncer, making a shared replica unscalable",
        "A shared read replica becomes a single point of contention: one team's expensive reporting query can saturate CPU or I/O and degrade latency for all other services using the same replica",
        "Cloud SQL read replicas do not support PostgreSQL 16 extensions, limiting Team B's reporting queries",
        "Read replicas in Cloud SQL cannot serve queries from multiple services simultaneously due to connection limits"
      ],
      "ans": 2,
      "fb": "A shared read replica creates a noisy-neighbour problem: one team's heavy reporting workload can exhaust CPU or disk throughput, causing query latency spikes for all other services. Dedicated replicas (Team A) provide isolation at the cost of more instances. The right architecture depends on workload characteristics, isolation requirements, and cost. The concern is not a hard technical limit (option C is incorrect — connection limits are a configuration concern, not a binary constraint). Replication lag (D) is real but affects all replica strategies equally. PgBouncer is deployable in front of read replicas (E is incorrect)."
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 2,
      "q": "You are overseeing a migration that needs to add a foreign key constraint to a 400-million-row table referencing a parent table. The constraint must be enforced at the database layer. How do you add this constraint without a prolonged lock on the table?",
      "opts": [
        "Use ALTER TABLE ... ADD CONSTRAINT ... FOREIGN KEY ..., which in PostgreSQL 16 is non-blocking by default",
        "Add the foreign key constraint with NOT VALID, which skips scanning existing rows, then run ALTER TABLE ... VALIDATE CONSTRAINT in a separate transaction to validate existing rows with a weaker lock",
        "Use a trigger to enforce the relationship instead of a declarative foreign key",
        "Set session_replication_role = replica to bypass constraint enforcement during migration",
        "Partition the table first, then add the foreign key per partition to reduce lock scope"
      ],
      "ans": 1,
      "fb": "PostgreSQL allows adding a foreign key with NOT VALID, which takes only a short ACCESS SHARE lock to register the constraint without scanning all rows. Existing rows are not validated immediately. A subsequent ALTER TABLE ... VALIDATE CONSTRAINT scans the table with a weaker ShareUpdateExclusiveLock (which does not block reads or most writes), validating existing rows without a full AccessExclusiveLock. This is the standard zero-downtime pattern. Adding a foreign key without NOT VALID (A) takes an AccessExclusiveLock for the full scan duration — not non-blocking. A trigger (C) adds runtime overhead and is harder to enforce consistently. Partitioning (D) does not help with foreign key locks and adds complexity. Setting session_replication_role (E) disables the constraint entirely, leaving data unvalidated.",
      "context": {
        "Table size": "400 million rows",
        "Constraint": "FK to tenants table",
        "Requirement": "Zero-downtime, constraint enforced at DB layer"
      }
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 2,
      "q": "Your team is planning a migration to split a 500GB monolithic Cloud SQL database into two separate Cloud SQL instances for different service domains. The migration must have less than 5 minutes of downtime. Which approach provides the highest confidence of success with the lowest risk?",
      "opts": [
        "Create the target instances with the new schemas, use Datastream or a logical replication approach to sync data continuously, then cut over with a brief write-stop",
        "Run `CREATE DATABASE new_db` on the same instance and use `INSERT INTO new_db.table SELECT * FROM old_db.table` to copy data live",
        "Use `pg_dump` and `pg_restore` during a maintenance window; 500GB should complete within the 5-minute window",
        "Use Cloud SQL's clone feature to create an exact copy of the database, then delete the tables belonging to each domain",
        "Stop the application, use Cloud SQL export to GCS, import into the new instances, then restart"
      ],
      "ans": 0,
      "fb": "For a 500GB database with a 5-minute downtime budget, the only viable approach is continuous replication: set up logical replication or Datastream to sync data to the target instances while the source continues to serve traffic, then perform a brief write-stop-and-cutover. `pg_dump` of 500GB (A) takes hours, far exceeding the 5-minute window. Clone (C) clones the entire database — you'd still need to delete large amounts of data on each copy, which takes time and doesn't help separation. Cross-database INSERT (D) is not valid PostgreSQL syntax and would also be slow. Export/import (E) has the same time problem as pg_dump."
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 3,
      "q": "After upgrading from PostgreSQL 14 to 16, a team reports that a previously fast query now runs 4× slower. EXPLAIN ANALYZE shows the planner switched from an index scan to a hash join. pg_stat_user_tables shows the table was not re-analyzed after upgrade. What is the correct first action?",
      "opts": [
        "Downgrade to PostgreSQL 14 until the planner regression is patched",
        "Add a query hint to force the index scan using pg_hint_plan",
        "Set enable_hashjoin = off globally to restore the previous plan",
        "Run ANALYZE on the affected tables to update statistics with the new PostgreSQL 16 planner's expectations, then re-evaluate",
        "Increase work_mem to give the hash join more memory and improve its performance"
      ],
      "ans": 3,
      "fb": "When upgrading PostgreSQL major versions, statistics should always be refreshed with ANALYZE (or VACUUM ANALYZE) because the planner's cost model and internal statistics format may change between versions. Stale statistics from PostgreSQL 14 may cause poor plan choices in PostgreSQL 16. Running ANALYZE is the correct, low-risk first step. Downgrading (A) avoids the problem without solving it. pg_hint_plan (B) is a workaround that masks the root cause. Setting enable_hashjoin = off (D) is a global setting that disables an entire join strategy and should never be used in production as a fix. Increasing work_mem (E) would make the hash join faster but does not address whether the planner is choosing the wrong plan.",
      "context": {
        "Upgrade": "PostgreSQL 14 → 16",
        "Symptom": "Query regressed 4× in latency",
        "EXPLAIN observation": "Planner switched from index scan to hash join"
      }
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 4,
      "q": "A Cloud SQL instance tier upgrade is being proposed to handle peak load. Before approving the spend, you want to verify whether the bottleneck is actually CPU or something else. Which Cloud Monitoring metric combination best identifies whether an upgrade would help?",
      "opts": [
        "Check only pg_stat_activity in the database; Cloud Monitoring metrics are not granular enough for this analysis",
        "Check database/memory/utilization only; high memory usage is always the cause of slow queries",
        "Check cloudsql.googleapis.com/database/disk/read_ops_count only; high disk reads mean the instance needs more CPU",
        "Check database/cpu/utilization alongside database/postgresql/transaction_count and database/postgresql/deadlock_count to determine whether CPU is the actual bottleneck",
        "Check database/network/received_bytes_count; high network bytes indicate the instance tier is too small"
      ],
      "ans": 3,
      "fb": "To justify a tier upgrade for CPU, you need to confirm that CPU utilisation is actually saturated during the performance problems AND that the transaction rate justifies the load. Pairing cpu/utilization with transaction_count gives you throughput context. Also checking deadlock_count rules out lock contention as the real cause. Disk reads alone (A) indicate I/O pressure, not CPU. Memory utilisation (C) is relevant for buffer cache sizing but is not a direct justification for a CPU tier upgrade. Network bytes (D) are largely irrelevant for sizing decisions. pg_stat_activity (E) is useful for live diagnosis but Cloud Monitoring provides the historical trend data needed to justify a spending decision.",
      "context": {
        "Metric namespace": "cloudsql.googleapis.com",
        "Current tier": "db-custom-8-32768",
        "Proposed": "db-custom-16-65536 (2× cost)"
      }
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 4,
      "q": "You review a Cloud SQL cost report and notice that one service is responsible for 45% of Cloud SQL storage costs despite having only 8% of the tenant base. Investigation shows the table has a large number of JSONB columns with deeply nested structures. What is the most impactful cost and performance recommendation?",
      "opts": [
        "Migrate the JSONB data to a document database such as Firestore to eliminate Cloud SQL storage costs entirely",
        "Compress the JSONB columns using PostgreSQL's built-in JSONB compression, which reduces storage by 80%",
        "Normalise frequently-queried JSONB fields into typed columns, archive or compress infrequently-accessed nested data, and review whether TOAST compression thresholds are tuned appropriately",
        "Enable Cloud SQL automatic storage increase and set a budget alert to monitor growth",
        "Increase the Cloud SQL instance storage to accommodate growth and move on"
      ],
      "ans": 2,
      "fb": "Large JSONB values are stored using PostgreSQL's TOAST mechanism (inline for small values, compressed and stored out-of-line for large ones). The default TOAST compression is pglz; PostgreSQL 16 also supports lz4. Normalising frequently-queried fields into typed columns enables efficient indexing and reduces JSONB bloat. Archiving rarely-accessed nested data (e.g., to Cloud Storage) and tuning TOAST compression thresholds (ALTER TABLE ... ALTER COLUMN ... SET STORAGE) are the right tools. PostgreSQL does not have a separate 'JSONB compression' feature (A is misleading). Migrating to Firestore (B) is a major architecture change that may not be justified. Increasing storage (D) treats the symptom. Budget alerts (E) are monitoring, not cost reduction.",
      "context": {
        "Storage used": "2.1 TB for this service",
        "JSONB columns": "avg document size 48 KB",
        "Cloud SQL storage cost": "$0.17/GB/month (Cloud SQL SSD)"
      }
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 0,
      "q": "Three teams are debating schema ownership. Team A owns a tenants table. Team B needs to add a column to support a new product feature. Team C needs to add a different column for analytics. You are asked to resolve this and establish a platform-wide governance model. What is the most scalable approach?",
      "opts": [
        "Assign a central DBA team as the single owner of all shared tables and route all changes through them",
        "Duplicate the tenants table into team-specific copies that each team maintains independently",
        "Let Team A (the owning team) own the schema and require Teams B and C to submit PRs to Team A's repository for any changes to the tenants table, with a defined SLA for review",
        "Use JSONB columns to allow Teams B and C to add arbitrary fields without a schema change",
        "Create a separate tenants_extensions table per team to hold their additional columns, linked by foreign key, so each team controls their own schema without modifying the shared table"
      ],
      "ans": 4,
      "fb": "The scalable governance pattern for shared tables in a multi-team platform is the 'extension table' pattern: the owning team controls the core schema; dependent teams own extension tables (tenant_id FK + their columns). This preserves clear ownership, avoids PR merge conflicts on the shared table, and scales to many teams without creating a central DBA bottleneck. A central DBA (A) creates a bottleneck. PR-to-owner (B) is better than a central DBA but still requires Team A to review and merge every schema change for Teams B and C, which slows delivery as teams scale. JSONB (D) loses type safety, indexability, and is hard to validate with NOT NULL or CHECK constraints. Duplicating the table (E) causes data consistency nightmares.",
      "context": {
        "Shared table": "tenants (core entity, 80+ columns)",
        "Teams": "12 teams need to extend the tenants schema",
        "Constraint": "No central DBA team"
      }
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 1,
      "q": "A read replica is lagging up to 30 seconds behind the primary during peak hours. The replica is used for reporting queries. You have already ruled out network bottlenecks. What is the most likely cause and the most targeted remediation?",
      "opts": [
        "The replica's disk IOPS are saturated by WAL replay, and long-running reporting queries are creating recovery conflicts that pause WAL replay; tune max_standby_streaming_delay and consider using a separate analytics instance",
        "Enable synchronous replication to eliminate replication lag",
        "The replica's PostgreSQL version is lagging behind the primary; upgrade the replica",
        "The primary has too many concurrent transactions and should be scaled down",
        "Restart the Cloud SQL replica instance to reset the WAL receiver process"
      ],
      "ans": 0,
      "fb": "When long-running queries on a replica conflict with WAL replay (because WAL replay needs to invalidate a page that the query is reading), PostgreSQL pauses WAL replay for max_standby_streaming_delay (default 30 seconds) before cancelling the conflicting query. This causes observable replication lag during peak reporting. The fix involves: setting max_standby_streaming_delay = -1 (infinite) and hot_standby_feedback = on (so the primary delays VACUUM of rows visible to the replica's active queries), OR using a second replica dedicated to analytics. Synchronous replication (D) would increase primary latency — it does not reduce replica lag, it eliminates it by making the primary wait for the replica to confirm receipt, which is the opposite of what's needed. Restarting the replica (E) would reset the receiver but not address the root cause.",
      "context": {
        "Replica lag": "Up to 30s during peak reporting window",
        "WAL throughput": "Primary generates ~500 MB/s WAL during peak",
        "Query type on replica": "Long-running aggregation queries (30-120 seconds)"
      }
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 1,
      "q": "You are designing the query routing strategy for a platform that has a primary Cloud SQL instance and two read replicas. The replicas have a typical lag of 50-200ms. A service performs: (1) a write to update order status, (2) an immediate read to return the updated order to the API caller. What is the safest routing approach for this pattern?",
      "opts": [
        "Add a 500ms sleep between the write and the read to ensure the replica has caught up before routing",
        "Route the read to the replica and use `pg_sleep(0.2)` on the replica connection to wait for replication",
        "Route the write to the primary and the immediate read to a replica, relying on replica lag being under 200ms",
        "Use a distributed transaction across primary and replica to ensure the write and read see the same snapshot",
        "Route both the write and the immediate read to the primary, then route subsequent reads within the same request to replicas"
      ],
      "ans": 4,
      "fb": "The read-your-writes consistency pattern requires that a read immediately following a write from the same session sees the write. On a replica with 50-200ms lag, this is not guaranteed. The correct approach is to route the write and the subsequent consistency-required read to the primary, and only send reads where stale data is acceptable (e.g., analytics) to replicas. Sleeping (D and E) is fragile: lag can exceed any fixed delay under load. A distributed transaction (C) is not applicable here — replicas are read-only streaming replicas, not participants in distributed transactions.",
      "context": {
        "Pattern": "Write then immediate read (read-your-writes)",
        "Replica lag": "50-200ms typical, can spike to seconds under load",
        "API contract": "Response must include the updated order state"
      }
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 2,
      "q": "You are owning an end-to-end migration plan for splitting a monolithic 600 GB PostgreSQL database into two separate Cloud SQL instances (one for payments, one for identity). The application must remain live throughout. What is the critical risk that must be addressed first in the migration plan?",
      "opts": [
        "Liquibase cannot manage migrations across two separate databases",
        "PostgreSQL 16 does not support logical replication for tables with TOAST columns",
        "The Cloud SQL Auth Proxy cannot handle connections to two instances simultaneously",
        "GKE pods cannot connect to more than one Cloud SQL instance due to IAM restrictions",
        "Cross-database foreign keys will need to be dropped, and the application must be updated to handle consistency across two databases without relying on a single ACID transaction"
      ],
      "ans": 4,
      "fb": "When splitting a database, any operations that previously relied on a single database transaction spanning payment and identity tables will no longer be atomic. Foreign keys across the new boundary must be dropped. The application must be redesigned to use eventual consistency, sagas (compensating transactions), or outbox patterns for operations that span the two databases. This is the most fundamental correctness risk. The Auth Proxy handles multiple instance connections via multiple socket paths (A is false). Liquibase can manage multiple databases with separate changelog files (C is false). PostgreSQL 16 supports logical replication for TOAST columns (D is false). GKE IAM allows multiple Cloud SQL connections per pod (E is false — IAM is per-instance, not per-pod-count).",
      "context": {
        "Current database": "600 GB monolith, 2 logical domains: payments, identity",
        "Cross-domain FKs": "14 foreign keys span the two domains",
        "Requirement": "Zero-downtime split"
      }
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 2,
      "q": "You are running a live migration using logical replication to copy data from an old Cloud SQL instance to a new one with a different schema layout. The initial snapshot is complete. You now need to cut over with minimal downtime. What is the correct cutover sequence?",
      "opts": [
        "Stop all application traffic, wait for replication lag to reach zero, promote the new instance, update DNS, and restart the application",
        "Use Cloud SQL's built-in migration wizard, which handles cutover atomically",
        "Promote the new instance, then stop application traffic and redirect, accepting a brief period where some writes go to the old instance and are lost",
        "Enable synchronous replication between old and new instances before cutover to guarantee zero data loss",
        "Pause application writes at the application layer (feature flag or circuit breaker), wait for replication lag to reach zero (confirm via pg_replication_slots or pg_stat_replication), then switch the application's DataSource connection string to the new instance and unpause writes"
      ],
      "ans": 4,
      "fb": "The correct zero-data-loss cutover for logical replication migration is: (1) pause writes at the application layer (not the database layer, to avoid lock accumulation), (2) wait for the replica to catch up to the primary — confirmed by pg_stat_replication.write_lag reaching zero or pg_replication_slots.confirmed_flush_lsn matching the primary, (3) verify data consistency, (4) update the DataSource configuration, (5) unpause writes. Stopping traffic before promotion (A) is safer than B but still involves a hard stop rather than a controlled pause-and-switch, and 'waiting' without a verified lag check risks data loss. Promoting before stopping traffic (B) will cause writes to be lost. Synchronous replication (D) is not available for cross-instance logical replication in this topology. Cloud SQL does not have a built-in migration wizard for logical replication cutover (E).",
      "context": {
        "Migration type": "Logical replication, cross-instance",
        "Current lag": "< 500ms under normal load",
        "Cutover window": "Target < 60 seconds of write unavailability"
      }
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 3,
      "q": "You are setting a platform standard for parallel query. A developer wants to enable parallel_workers = 8 globally to speed up large analytical queries on Cloud SQL. What is your guidance and why?",
      "opts": [
        "Approve it — parallel query always reduces wall-clock time and is safe to enable globally",
        "Approve only a moderate increase (e.g., 2-4 workers per gather) with guidance to use SET LOCAL for specific analytical sessions and to monitor total parallel worker count against max_parallel_workers and available CPU budget",
        "Approve it only for tables larger than 1 GB using a per-table parallel_workers storage parameter",
        "Reject it and set max_parallel_workers_per_gather = 0 to disable parallel query entirely",
        "Parallel query is not available on Cloud SQL — reject the request"
      ],
      "ans": 1,
      "fb": "Parallel query in PostgreSQL can dramatically reduce analytical query latency but also multiplies CPU usage (each parallel worker uses a separate CPU). Globally setting 8 workers could cause a single analytical query to consume all available vCPUs, starving OLTP queries. The correct approach is to set a moderate global default (2-4 workers), allow teams to use SET LOCAL max_parallel_workers_per_gather for specific workloads in sessions where the CPU cost is acceptable, and monitor total worker consumption. Blanket approval (A) ignores the CPU multiplier effect. Disabling parallel query entirely (B) removes a legitimate optimisation. Per-table parallel_workers (D) is a real PostgreSQL feature but not the only tool needed. Parallel query is available on Cloud SQL PostgreSQL 16 (E is false).",
      "context": {
        "Instance vCPUs": "8",
        "Workload mix": "OLTP (90%) + analytical queries (10%)",
        "Proposed setting": "max_parallel_workers_per_gather = 8"
      }
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 3,
      "q": "You are reviewing a platform standard proposal that recommends setting random_page_cost = 1.1 (near seq_page_cost = 1.0) on all Cloud SQL PostgreSQL instances. What is the implication of this setting and when is it appropriate?",
      "opts": [
        "This setting disables random I/O and forces the planner to always use sequential scans, which is appropriate for all cloud instances",
        "This setting should never be changed from the default (4.0) because it was calibrated for PostgreSQL 16 specifically",
        "This setting increases memory allocated for random page caching and reduces buffer pool evictions",
        "This setting tells the planner that random page reads are nearly as cheap as sequential reads, which is appropriate for SSD-backed storage where random I/O penalty is low, and encourages the planner to choose index scans over sequential scans",
        "This setting controls the number of parallel workers used for random I/O operations"
      ],
      "ans": 3,
      "fb": "random_page_cost is the planner's estimate of the relative cost of a non-sequential disk page fetch compared to seq_page_cost. The default of 4.0 was calibrated for spinning hard disks where random I/O is ~4× more expensive than sequential. Cloud SQL uses SSD storage where random I/O is far cheaper than on HDD. Setting random_page_cost = 1.1 (or 1.5) is a well-established best practice for SSD instances and tells the planner that index scans (which involve random I/O) are nearly as cheap as sequential scans, resulting in better plan choices on modern storage. It does not disable random I/O (A). It is a cost model parameter, not a memory allocation setting (C). The default of 4.0 was not calibrated for any specific PostgreSQL version — it is a legacy HDD assumption (D is false). It has nothing to do with parallel workers (E).",
      "context": {
        "Storage type": "Cloud SQL SSD-backed persistent disk",
        "Current setting": "random_page_cost = 4.0 (default)",
        "Proposal": "Set random_page_cost = 1.1 platform-wide"
      }
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 4,
      "q": "You are reviewing a proposal to reduce Cloud SQL costs by moving all non-production databases (dev, staging) to a single shared Cloud SQL instance with separate schemas. What is the primary risk this introduces and what mitigation would you require?",
      "opts": [
        "Separate schemas on one instance provide no isolation — all data is visible across schemas by default",
        "Cloud SQL does not support multiple schemas on a single instance",
        "Migration scripts (Liquibase) cannot differentiate between schemas on the same instance",
        "A single instance means one noisy or poorly-tuned service can exhaust shared resources (connections, CPU, storage IOPS) and degrade all other environments simultaneously; mitigate by setting per-schema connection limits via pgbouncer or HikariCP pool caps, monitoring resource utilisation per service, and establishing a runbook for isolation incidents",
        "Cloud SQL billing is per schema, so there is no cost saving from consolidation"
      ],
      "ans": 3,
      "fb": "Consolidating multiple environments onto a single Cloud SQL instance creates a noisy-neighbour risk: one service consuming excessive connections, CPU, or IOPS affects all other services sharing the instance. This is acceptable for non-production but must be mitigated with per-service HikariCP pool caps (to stay within connection limits), per-schema resource monitoring, and a defined process for isolating offending services. Schema-level data isolation (A) — schemas in PostgreSQL do provide namespace separation; while row-level isolation requires RLS, schema-level separation is still meaningful for organisation and IAM. Cloud SQL does support multiple schemas (C is false). Liquibase uses schema names in connection strings and changeset contexts (D is manageable). Cloud SQL bills per instance, not per schema (E is false — consolidation does save money).",
      "context": {
        "Environments": "Dev, staging, QA — 12 services",
        "Current cost": "12 × db-f1-micro instances",
        "Proposal": "Consolidate to 1 × db-custom-4-16384"
      }
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 4,
      "q": "Cloud SQL costs for your platform increased 40% over six months. Analysis shows the primary driver is storage: the database has grown from 500GB to 1.8TB. Most of the growth is in two tables: `audit_events` (1TB) and `kafka_outbox` (400GB). What is the most effective cost reduction strategy that does not compromise operational correctness?",
      "opts": [
        "Compress all text columns in `audit_events` and `kafka_outbox` using PostgreSQL's built-in TOAST compression",
        "Increase the Cloud SQL instance tier to one with more CPU to speed up autovacuum and reclaim dead tuple space",
        "Archive `audit_events` rows older than 90 days to BigQuery and implement a partitioned `kafka_outbox` with partition drop for processed messages",
        "Move the Cloud SQL instance to a different region where storage costs are lower",
        "Enable Cloud SQL automatic storage increase and rely on GCP to optimise costs as storage scales"
      ],
      "ans": 2,
      "fb": "The `audit_events` table is a retention problem: old audit data rarely needs to be queried from the primary database and is well-suited for archival to BigQuery (cheap columnar storage, supports compliance queries). The `kafka_outbox` is a pattern where rows are inserted, processed, and should then be deleted — implementing this with partitioning allows entire partitions to be dropped (DDL, near-instant) rather than DELETEd (row-by-row, slow and bloating). TOAST compression (C) applies to large variable-length values already over 2KB; it won't help structured rows. More CPU (D) helps autovacuum speed but doesn't reduce storage. Region changes (E) have minimal impact and add latency.",
      "context": {
        "Storage cost driver": "audit_events (1TB), kafka_outbox (400GB)",
        "audit_events query pattern": "Queries are rare beyond 90 days; compliance queries acceptable on BigQuery",
        "kafka_outbox pattern": "Insert on write, delete after processing — high write/delete churn"
      }
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 0,
      "q": "Engineering leadership asks you to evaluate whether the platform should migrate from Cloud SQL PostgreSQL to a self-managed PostgreSQL cluster on GKE (using the Cloud Native PostgreSQL operator). What is the most important operational consideration that typically tips the decision toward staying on Cloud SQL?",
      "opts": [
        "Cloud SQL is always cheaper than self-managed PostgreSQL at any scale",
        "Self-managed PostgreSQL on GKE violates PCI-DSS compliance requirements",
        "Self-managed clusters on GKE cannot use persistent disks, making data durability a concern",
        "Cloud SQL abstracts HA, automated failover, storage management, and backups, reducing the operational burden; self-managed clusters require the platform team to own these responsibilities end-to-end, which represents a significant ongoing engineering investment",
        "Cloud SQL supports PostgreSQL 16 while self-managed clusters only support PostgreSQL 14"
      ],
      "ans": 3,
      "fb": "The primary reason most teams stay on Cloud SQL is the managed operational surface: automated HA, failover, minor version patching, backup scheduling, and storage autoscaling are handled by Google. A self-managed cluster requires the platform team to own all of these, including on-call for database infrastructure incidents — a significant cost that is often underestimated. Cloud Native PostgreSQL on GKE does support PostgreSQL 16 (A is false). GKE persistent disks are fully durable (B is false). Self-managed PostgreSQL is often cheaper at very large scale but not universally (C is false). PCI-DSS does not prohibit self-managed databases (D is false) — it requires demonstrable controls regardless of where the database runs.",
      "context": {
        "Current stack": "Cloud SQL PostgreSQL 16",
        "Alternative": "CloudNativePG operator on GKE",
        "Driver": "Cost reduction and parameter flexibility"
      }
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 0,
      "q": "You are evaluating whether the platform should adopt PostgreSQL 16's logical replication from a Cloud SQL primary to a self-managed analytics PostgreSQL instance for OLAP workloads. What is the primary operational risk to communicate to leadership?",
      "opts": [
        "The replication slot on the primary retains WAL until the subscriber confirms receipt; if the analytics subscriber falls behind or disconnects, WAL accumulates on the primary and can fill Cloud SQL storage",
        "Logical replication cannot replicate tables without primary keys, and most PostgreSQL tables lack primary keys",
        "Logical replication in PostgreSQL 16 is not stable enough for production use",
        "Logical replication requires the primary to be restarted when the subscription is created",
        "Logical replication uses significantly more CPU on the primary than streaming replication"
      ],
      "ans": 0,
      "fb": "A replication slot prevents the primary from discarding WAL segments needed by the subscriber. If the analytics subscriber is slow, paused, or disconnected for an extended period, WAL accumulates on the primary. On Cloud SQL, this can cause storage to fill up, leading to the instance going into read-only mode — a severe production impact. This risk must be mitigated by monitoring pg_replication_slots.wal_status and pg_stat_replication.sent_lsn lag, and setting a policy for dropping slots that fall too far behind. Logical replication in PostgreSQL 16 is production-stable (A is false). Creating a subscription does not require a primary restart in PostgreSQL 16 (C is false). Tables without PKs can be replicated using REPLICA IDENTITY FULL (D is overstated). Logical replication's CPU overhead is manageable (E is not the primary risk).",
      "context": {
        "Source": "Cloud SQL PostgreSQL 16 primary",
        "Destination": "Self-managed PostgreSQL on GKE for OLAP",
        "Mechanism": "Logical replication via replication slot"
      }
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 1,
      "q": "You are designing a disaster recovery strategy for a multi-tenant platform. The platform has a primary Cloud SQL instance in us-central1. Leadership wants a Recovery Point Objective (RPO) of 1 minute and a Recovery Time Objective (RTO) of 5 minutes. Which Cloud SQL feature combination is most appropriate?",
      "opts": [
        "Create a Cloud SQL cross-region replica in us-east1 with PITR enabled on both; promote the replica during a disaster and update connection strings",
        "Export the database to Cloud Storage every 5 minutes using a Cloud Scheduler job and restore from the export",
        "Enable point-in-time recovery (PITR) on the primary instance and restore to a new instance in another region",
        "Use Cloud SQL HA (same-region standby) only — it provides automatic failover within the region",
        "Enable daily automated backups with a 7-day retention window; restore from the most recent backup during a disaster"
      ],
      "ans": 0,
      "fb": "To achieve RPO of 1 minute and RTO of 5 minutes across a regional failure, you need: (1) a cross-region replica that is continuously receiving WAL, giving near-zero RPO (typically seconds to low minutes of replication lag), and (2) the ability to promote the replica quickly (achievable in under 5 minutes with pre-tested runbooks). PITR on both instances allows granular recovery if needed. Daily backups (A) have RPO of up to 24 hours. PITR restore to a new instance (B) meets RPO but RTO can be 10-30 minutes to restore a large instance. Same-region HA (D) does not survive a regional failure. Cloud Storage exports (E) have unpredictable restore times and are not suitable for a 5-minute RTO.",
      "context": {
        "Primary region": "us-central1",
        "RPO target": "1 minute",
        "RTO target": "5 minutes",
        "Failure scenario": "Full regional outage"
      }
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 1,
      "q": "Your organisation currently runs all services on a single Cloud SQL regional instance. Leadership asks you to evaluate the DR posture. The current RTO is estimated at 60-90 minutes (time to restore from a backup). What is the most direct GCP-native improvement that reduces RTO to under 5 minutes?",
      "opts": [
        "Enable automated backups with a 1-hour backup interval to reduce the backup restore window",
        "Create a read replica in the same region and manually promote it during an incident",
        "Deploy a second Cloud SQL instance in a different region and use application-level dual writes for synchronisation",
        "Use Cloud SQL's export-to-GCS feature to maintain hourly exports, which can be imported faster than full backup restores",
        "Enable Cloud SQL High Availability, which maintains a hot standby in a different zone and performs automatic failover in 60-120 seconds"
      ],
      "ans": 4,
      "fb": "Cloud SQL HA uses a hot standby in a different zone within the same region. On primary failure, Cloud SQL automatically fails over to the standby in 60-120 seconds, satisfying a sub-5-minute RTO. Backup frequency (A) reduces RPO, not RTO — restoring a backup still takes 60-90 minutes. Manual replica promotion (C) reduces RTO compared to backup restore but requires human intervention and isn't automatic. Hourly GCS exports (D) still require import time. Dual-write across regions (E) provides cross-region DR but is complex and does not address single-zone failures faster than HA."
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 2,
      "q": "You are presenting a database cost optimisation narrative to the CTO. Cloud SQL spending grew 60% year-over-year while tenant count grew 40%. Leadership wants to understand the gap. Which metric most clearly explains the discrepancy?",
      "opts": [
        "Cloud SQL pricing increased by 20% during the year, which accounts for the gap",
        "Backup storage costs doubled because backup retention was extended from 7 to 14 days",
        "The 40% tenant growth figure is wrong; actual growth was 60%",
        "Cloud SQL cross-region egress costs account for the 20% gap",
        "The average instance tier has grown (more vCPUs and RAM per tenant) because teams over-provisioned resources without a review process, consuming more than the tenant growth alone would justify"
      ],
      "ans": 4,
      "fb": "When cost grows faster than the unit metric (tenants), the explanation is almost always either price increases or per-unit resource growth. The most common cause at platform scale is teams provisioning larger instance tiers than their workload requires, without a periodic right-sizing review process. This creates a compounding cost curve. Presenting data on average vCPU/RAM per tenant over time makes the over-provisioning visible and actionable. Price increases (A) are possible but should be verified against GCP pricing history. Disputing the tenant count (C) without evidence is not helpful. Backup retention doubling (D) would increase storage costs but would not account for a 20% gap in total Cloud SQL spend. Cross-region egress (E) is a separate line item and not a primary Cloud SQL cost driver.",
      "context": {
        "YoY tenant growth": "40%",
        "YoY Cloud SQL spend growth": "60%",
        "Audience": "CTO, VP Engineering"
      }
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 2,
      "q": "You are presenting the Cloud SQL cost narrative to the CTO. Costs grew from $18k/month to $47k/month over 12 months. The CTO asks what is driving the increase. Your analysis shows: storage grew 4× (primary driver), compute tier was upgraded twice, and network egress from read replicas tripled. What is the most effective way to present this to a non-technical executive?",
      "opts": [
        "Present a detailed PostgreSQL storage internals breakdown showing table bloat, dead tuples, and TOAST overhead",
        "Present the cost per transaction to show the platform is becoming more efficient as it scales",
        "Show a cost breakdown by category (storage, compute, network), identify the top driver (storage), and link each driver to a specific engineering decision or growth event, with concrete cost-reduction actions and projected savings",
        "Show the total monthly cost trend chart and explain that cloud costs always increase with usage",
        "Recommend migrating to AlloyDB as a cost-saving measure without providing a cost comparison"
      ],
      "ans": 2,
      "fb": "Executives need context and actionable information, not raw technical detail. The right presentation structure is: (1) what is the cost and how did it change, (2) what is driving it (ranked by impact), (3) what can be done about it and what will it save. Option A (PostgreSQL internals) is not actionable for a CTO. Option C fails to explain causes or offer solutions. Option D (cost per transaction) may be useful as a supplementary metric but doesn't answer 'why did costs increase'. Option E (AlloyDB migration) is a major recommendation that requires a full evaluation — presenting it without comparison data is irresponsible.",
      "context": {
        "Cost increase": "$18k → $47k/month (+161%)",
        "Primary driver": "Storage growth (4×)",
        "Secondary drivers": "Compute upgrades, network egress from replicas",
        "Audience": "CTO — strategic, cost-conscious, not PostgreSQL expert"
      }
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 3,
      "q": "A new data classification policy defines four sensitivity levels: L1 (public), L2 (internal), L3 (confidential), and L4 (regulated PII/financial). You are asked to define which Cloud SQL encryption standard applies at each level. The security team wants CMEK everywhere. The platform team argues CMEK adds operational complexity (key rotation management, risk of accidental key deletion rendering data permanently inaccessible). The CFO notes that Cloud KMS key operations cost $0.03 per 10,000 operations. How do you define the policy?",
      "opts": [
        "Require CMEK for all levels — the security team's recommendation should be followed without exception",
        "Require application-layer encryption for L3-L4 instead of CMEK, keeping Cloud SQL encryption at GMEK for operational simplicity",
        "Define a tiered policy: L1-L2 use Google-managed encryption (GMEK), which is on by default and sufficient for non-regulated data; L3 uses CMEK with automated key rotation; L4 uses CMEK with manual key rotation, key access logging, and a documented key revocation runbook that has been tested in a DR drill; document the operational trade-offs at each tier including the risk of accidental key deletion and the Cloud KMS cost impact",
        "GMEK is sufficient for all levels — Cloud SQL's default encryption satisfies all compliance requirements",
        "Require CMEK only for L4 and defer L3 to a future policy revision"
      ],
      "ans": 2,
      "fb": "A tiered encryption policy balances security requirements against operational risk and cost. GMEK (default Cloud SQL encryption) provides AES-256 at rest and is sufficient for non-regulated data (L1-L2) — adding CMEK here would create operational overhead without a corresponding security benefit. L3 (confidential) benefits from CMEK because key control adds a meaningful security layer, but automated rotation reduces operational burden. L4 (regulated) requires CMEK with stricter controls: manual rotation (for audit trail), key access logging (to detect unauthorised access attempts), and a tested revocation runbook (to demonstrate the ability to make data inaccessible for compliance drills). The security team's blanket recommendation (A) ignores the operational risk of CMEK at lower levels — accidental key deletion on an L1 database would cause unnecessary data loss. GMEK for all (C) fails to satisfy PCI-DSS key control requirements for L4 data. Deferring L3 (D) leaves a gap. Application-layer encryption (E) is complementary but not a substitute for at-rest encryption controls.",
      "context": {
        "Data levels": "L1 (public) → L4 (regulated PII/financial)",
        "Security team": "Wants CMEK everywhere",
        "Platform team": "Concerned about operational complexity",
        "Key risk": "Accidental key deletion = permanent data loss"
      }
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 3,
      "q": "The Head of Compliance reports that during the last SOX audit, auditors requested evidence of who accessed the financial_events table and when. Your team produced Cloud SQL connection logs showing service account connections but could not demonstrate which end-user triggered each query. The auditors flagged this as a finding. You are tasked with designing a platform-wide audit logging standard that prevents this finding from recurring. Three teams push back, arguing that audit logging adds query latency. How do you design and gain adoption for the standard?",
      "opts": [
        "Design a layered standard: (1) require all services accessing SOX-regulated tables to inject end-user identity via SET LOCAL app.user_id at the start of each transaction; (2) enable pgaudit with OBJECT-level auditing on regulated tables only (not all tables) to minimise performance impact; (3) require log_connections and log_disconnections for session accountability; (4) ship structured logs to Cloud Logging with 7-year retention via a log sink to Cloud Storage; address the latency concern by benchmarking pgaudit overhead on a representative workload and publishing the results — typically < 2% latency increase for OBJECT-level auditing",
        "Enable Cloud SQL's built-in audit logging in the GCP Console — this captures all necessary information without application changes",
        "Accept the audit finding and negotiate with auditors to use service account-level logging as sufficient evidence",
        "Require all teams to implement application-layer audit logging that writes to a separate audit database, bypassing PostgreSQL logging entirely",
        "Mandate pgaudit with log_statement='all' on every Cloud SQL instance — comprehensive logging eliminates any audit gaps"
      ],
      "ans": 0,
      "fb": "The audit finding reveals two gaps: (1) no end-user identity in database logs (only service account is visible), and (2) no fine-grained query-level logging on regulated tables. The layered standard addresses both: SET LOCAL app.user_id injects the end-user identity into the PostgreSQL session where pgaudit can capture it alongside the query text. OBJECT-level auditing (rather than log_statement='all') targets only regulated tables, dramatically reducing log volume and performance impact. The latency concern is legitimate but addressable with data — benchmarking pgaudit overhead on a representative workload and publishing the results (typically < 2% for OBJECT-level) converts a subjective concern into an objective trade-off. Cloud SQL's built-in audit logging (C) captures API-level operations (instance management) but not query-level or user-level access. Application-layer logging (D) is complementary but does not satisfy the 'database-level evidence' requirement that auditors expect. Accepting the finding (E) does not resolve the compliance gap.",
      "context": {
        "Audit finding": "Cannot demonstrate end-user identity for database queries",
        "Current logging": "Cloud SQL connection logs with service account only",
        "SOX requirement": "Who accessed what data, when, for regulated tables",
        "Team concern": "Audit logging adds query latency"
      }
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 4,
      "q": "You are building a platform-wide database observability capability. Currently, each of the 40 teams has their own approach: some use pg_stat_statements, some rely on Cloud SQL Query Insights, some have custom Grafana dashboards, and some have no database monitoring at all. An incident last month went undetected for 4 hours because the affected team had no slow-query alerting. The VP Engineering asks you to build 'one observability standard that all teams adopt within 6 months.' How do you design for adoption, not just technical correctness?",
      "opts": [
        "Build a centralised database monitoring team that watches all 40 databases and alerts teams when issues are detected",
        "Enable Cloud SQL Query Insights for all instances — it provides a managed observability experience with no team effort required",
        "Design a two-tier approach: Tier 1 (mandatory, zero-effort adoption) includes pg_stat_statements enabled on all instances by default via Terraform, a shared Grafana dashboard template that auto-discovers each team's database and shows top-N queries by total_exec_time with alerting on mean_exec_time regression, and a runbook template for the top 5 database incident types; Tier 2 (recommended, team-driven adoption) includes custom Micrometer metrics, query-level OpenTelemetry spans, and team-specific SLO dashboards — teams adopt Tier 2 as their maturity grows",
        "Publish a wiki page documenting best practices and let teams adopt at their own pace",
        "Build the most comprehensive observability stack possible (pg_stat_statements + pgaudit + custom metrics + OpenTelemetry spans) and mandate adoption via a deployment gate"
      ],
      "ans": 2,
      "fb": "The key design principle for platform adoption is 'make the right thing the easy thing.' Tier 1 must be zero-effort for teams: pg_stat_statements enabled via Terraform (teams don't even need to know it's there), a shared Grafana dashboard that auto-discovers databases (teams get value on day one without configuration), and alerting that catches the class of incident that went undetected last month. This solves the VP's immediate concern. Tier 2 is for teams that want deeper observability — it provides a growth path without making the initial bar too high. A comprehensive mandate (A) creates adoption friction and is unlikely to achieve 100% adoption in 6 months. Cloud SQL Query Insights (C) is useful but is not easily integrated into existing Grafana-based workflows and has limited alerting capability. A centralised monitoring team (D) does not scale to 40 databases and creates a bottleneck. Wiki documentation (E) is passive and does not solve the adoption problem — the team with no monitoring last month would not have read a wiki page.",
      "context": {
        "Current state": "40 teams, fragmented monitoring, recent 4-hour undetected incident",
        "Goal": "Universal adoption within 6 months",
        "Observability stack": "Grafana, Cloud Monitoring, OpenTelemetry",
        "Design principle": "Make the right thing the easy thing"
      }
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 0,
      "q": "You are leading a technology evaluation comparing Cloud SQL PostgreSQL 16 against Spanner for a new high-throughput transactional workload (10,000 TPS, globally distributed tenants). What is the most architecturally significant difference that should drive the decision?",
      "opts": [
        "Spanner provides external consistency (linearisable, globally distributed transactions) at scale but requires application code to use Spanner's mutation API and imposes schema design constraints (no sequences, interleaved tables); Cloud SQL provides full PostgreSQL semantics but is limited to a single region's write throughput",
        "Spanner supports SQL while Cloud SQL does not, making Spanner suitable for complex queries",
        "Cloud SQL is always cheaper than Spanner at 10,000 TPS",
        "Cloud SQL PostgreSQL 16 can be scaled horizontally to match Spanner's throughput via read replicas",
        "Spanner cannot be used with Spring Boot and JPA, making it unsuitable for the current tech stack"
      ],
      "ans": 0,
      "fb": "The fundamental architectural difference is consistency model and scalability boundaries. Spanner offers external consistency (stronger than serialisable) across globally distributed nodes with horizontal write scaling, but requires developers to work within Spanner-specific schema constraints (no auto-increment sequences — use UUID or bit-reversed integers, interleaved tables for parent-child relationships) and use Spanner's APIs or JDBC driver. Cloud SQL provides full PostgreSQL semantics and familiarity but is bounded by a single-node write throughput. For globally distributed tenants needing consistent transactions, Spanner's model is architecturally superior. Spanner does support SQL (A is false). Cost depends on workload characteristics (C is not universally true). Spanner has Spring and JPA integration via the Cloud Spanner JDBC driver (D is false). Read replicas scale reads, not writes (E is misleading).",
      "context": {
        "Target TPS": "10,000 write TPS",
        "Tenant distribution": "Users in US, EU, APAC simultaneously",
        "Current tech stack": "Spring Boot 3, JPA/Hibernate"
      }
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 0,
      "q": "A team wants to evaluate PostgreSQL 16's new logical replication features for replacing a Debezium CDC pipeline. You are asked to provide an authority-level assessment. What is the most important limitation to evaluate for this use case?",
      "opts": [
        "PostgreSQL 16 logical replication supports bidirectional replication, making Debezium redundant in all cases",
        "Logical replication in PostgreSQL 16 cannot replicate tables with JSONB columns",
        "Logical replication requires the subscriber to be the same PostgreSQL version as the publisher",
        "PostgreSQL 16 logical replication does not support replicating schema changes (DDL), which means any ALTER TABLE on the source must be manually applied to the subscriber and the replication setup updated",
        "PostgreSQL 16 logical replication is only available on Cloud SQL Enterprise Plus tier"
      ],
      "ans": 3,
      "fb": "The most significant operational limitation of PostgreSQL logical replication as a CDC replacement is DDL replication: schema changes (ALTER TABLE, CREATE INDEX, etc.) are NOT replicated automatically. The subscriber must have schema changes applied separately, and the replication publication/subscription must be updated if new tables are added. Debezium handles schema evolution more gracefully by capturing DDL events from the WAL and applying them to downstream systems. This makes native logical replication less suitable for pipelines where the upstream schema evolves frequently. Logical replication is available on Cloud SQL PostgreSQL 16 standard tiers (B is false). JSONB is fully supported (C is false). The subscriber can be a lower minor version but must be the same or lower major version (D is overstated). Bidirectional replication (E) is a new feature in PostgreSQL 16 but introduces conflict resolution complexity — it does not make Debezium redundant in all cases.",
      "context": {
        "Current CDC": "Debezium → Kafka → downstream consumers",
        "Proposed": "PostgreSQL 16 logical replication direct to subscribers",
        "Schema change frequency": "~3 DDL changes per week per service"
      }
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 1,
      "q": "You are designing a DR drill for the platform's primary Cloud SQL instance. The drill must validate both RPO and RTO under realistic conditions. What should the drill procedure include that is often omitted in untested DR plans?",
      "opts": [
        "Validating that the Cloud SQL backup button works in the GCP Console",
        "Validating that all application services can reconnect after the replica is promoted to primary, including re-establishing Cloud SQL Auth Proxy connections, re-running Liquibase migrations on the new primary, and confirming that all health checks and SLO dashboards reflect the promoted instance",
        "Confirming that the Cloud SQL instance is in the correct VPC",
        "Confirming that the replica instance tier matches the primary tier",
        "Testing that the DBA team can SSH into the Cloud SQL instance to run manual recovery steps"
      ],
      "ans": 1,
      "fb": "The most commonly omitted part of DR plans is validating the full application recovery stack, not just the database failover. When a replica is promoted: the new primary has a different connection name, requiring Auth Proxy sidecar configuration updates; Liquibase may need to run any pending migrations that were applied to the old primary after the last replica sync point; application health checks must pass before traffic is re-routed; and SLO dashboards must be validated to confirm they are reading from the new instance. Clicking the backup button (A) tests backup creation, not DR. Tier matching (B) is a pre-drill check, not a drill step. VPC validation (C) is a pre-drill check. Cloud SQL instances are not directly SSH-accessible (E).",
      "context": {
        "Primary": "us-central1, Cloud SQL PostgreSQL 16",
        "Replica": "us-east1, promoted during drill",
        "Application": "20 microservices with Auth Proxy sidecars"
      }
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 1,
      "q": "During a quarterly DR review, you identify that the platform has no tested procedure for promoting a Cloud SQL replica when the Cloud SQL Auth Proxy is the only connectivity method. What specific failure mode does this expose and how should the runbook address it?",
      "opts": [
        "Auth Proxy connections are automatically re-routed to the new primary after promotion — no runbook change needed",
        "The Auth Proxy maintains a persistent connection that survives failover — only the application needs to retry",
        "The Auth Proxy connects using the Cloud SQL instance connection name, which is unique per instance; after promotion, the new primary has a different connection name and all Auth Proxy sidecars must be updated with the new connection name and restarted, which can extend RTO significantly if not pre-planned",
        "Auth Proxy failover is handled by Cloud SQL HA, not by the replica promotion process",
        "Cloud SQL promotion automatically creates a DNS alias that the Auth Proxy resolves transparently"
      ],
      "ans": 2,
      "fb": "The Cloud SQL Auth Proxy connects using the instance connection name (project:region:instance). When a replica is promoted to a new standalone primary, it receives a new instance connection name. All Auth Proxy sidecar containers or cloud-sql-proxy deployments must be updated with the new connection name and restarted. In a GKE deployment, this means updating the pod/deployment manifest and rolling all pods — which can take several minutes and materially extends RTO if not pre-scripted. The runbook should include the exact kubectl patch command, the new connection name, and a validation step. Auth Proxy does not auto-reroute (A is false). The persistent connection is dropped when the old instance goes offline (C is false). There is no automatic DNS alias (D is false). HA handles same-region failover to a standby, not cross-region replica promotion (E is wrong context).",
      "context": {
        "Connectivity": "Cloud SQL Auth Proxy sidecar on every GKE pod",
        "Promotion scenario": "Cross-region replica promoted to new primary",
        "Current RTO estimate": "Unknown — never tested"
      }
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 1,
      "q": "You are designing the cross-region DR strategy for a PCI-DSS platform that processes payments. The target RPO is 1 minute and RTO is 10 minutes. The platform spans two GCP regions. Which architecture best satisfies these requirements?",
      "opts": [
        "A Cloud SQL primary in region A with HA, a cross-region read replica in region B, continuous replication, and a tested promotion procedure with DNS/connection string failover",
        "A Cloud SQL primary in region A with point-in-time recovery enabled; RPO is the backup frequency",
        "A Cloud SQL primary in region A and a secondary Cloud SQL instance in region B that receives hourly data exports via Datastream",
        "Two Cloud SQL instances in different regions running in active-active configuration with application-level conflict resolution",
        "Nightly Cloud SQL backups exported to a multi-region Cloud Storage bucket, with a documented runbook to restore in the secondary region"
      ],
      "ans": 0,
      "fb": "A cross-region read replica with continuous streaming replication and a tested promotion procedure is the standard GCP architecture for cross-region DR. Replication lag is typically seconds, satisfying 1-minute RPO. Promotion takes minutes, satisfying 10-minute RTO if the procedure is pre-tested and DNS/connection failover is automated. Nightly backups (A) give an RPO of up to 24 hours. Hourly Datastream exports (C) give 1-hour RPO. Active-active PostgreSQL (D) is not natively supported by Cloud SQL. PITR (E) reduces RPO only to the backup interval, not 1 minute."
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 2,
      "q": "Cloud SQL costs have grown to $180k/year and the CFO wants a 20% reduction. You have identified that 35% of instances are consistently under 20% CPU utilisation. What is the correct way to present and execute the optimisation to leadership and teams?",
      "opts": [
        "Set up committed use discounts (CUDs) for all instances without resizing",
        "Present a tiered plan: (1) right-size instances with < 20% CPU to the next-lower tier after validating peak headroom and connection limits, (2) consolidate dev/non-prod environments, (3) establish a quarterly review process so this does not recur — with projected savings at each stage and risk assessment",
        "Enable Cloud SQL automatic storage reduction to recover over-provisioned storage costs",
        "Immediately downgrade all under-utilised instances to the smallest available tier to achieve the cost target",
        "Migrate all databases to Spanner to eliminate Cloud SQL costs entirely"
      ],
      "ans": 1,
      "fb": "A credible cost optimisation narrative for leadership requires a phased plan with projected savings, risk assessment, and a process change to prevent recurrence. Right-sizing is the highest-ROI action, but it requires validating that peak CPU (not average) has headroom and that connection limits on smaller tiers are sufficient. Consolidating dev/non-prod is lower risk. CUDs are complementary but not the primary lever. Immediately downgrading all instances (A) risks performance incidents on instances that have burst peaks above 20%. Migrating to Spanner (C) is a multi-year project and a different product — not a cost-reduction tactic. Cloud SQL does not support automatic storage reduction (D) — storage only grows automatically. CUDs alone (E) give a discount on the current waste rather than eliminating it.",
      "context": {
        "Annual Cloud SQL spend": "$180,000",
        "Instances under 20% CPU": "35% of fleet",
        "Cost reduction target": "20% ($36,000)"
      }
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 2,
      "q": "The platform's Cloud SQL bill for the next quarter is projected to be $180,000. Leadership has asked for a 30% cost reduction. You identify that 60% of the bill is storage ($108k), split between live tables ($45k) and archived/audit data ($63k). What is the most credible cost reduction plan to present?",
      "opts": [
        "Negotiate a committed use discount with GCP for Cloud SQL to achieve 30% cost reduction on all charges",
        "Archive data older than 90 days from audit and historical tables to BigQuery or Cloud Storage (significantly cheaper), implement table partitioning with partition drop for outbox/event tables, and target $55k-$65k in storage savings — a 30-36% total bill reduction",
        "Delete the read replicas and use the primary for all read traffic to eliminate replica storage and compute costs",
        "Commit to switching all services from Cloud SQL to Bigtable, which is cheaper for large datasets",
        "Reduce the Cloud SQL instance tier from db-custom-16-65536 to db-custom-8-32768 to halve compute costs"
      ],
      "ans": 1,
      "fb": "The largest cost lever is the $63k in archived/audit storage. Moving this to BigQuery (which costs ~$5/TB/month vs ~$200/TB/month for Cloud SQL SSD storage) can yield a 10-20× reduction on that portion. Combining this with partition-drop strategies for event/outbox tables addresses the storage root cause rather than just tuning around it. This gives a credible path to $55k-$65k savings — meeting the 30% target. Bigtable (A) is not a drop-in replacement and the migration cost would far exceed savings. Halving compute (C) would reduce $72k compute by 50% = $36k saving, but compute is only 40% of the bill so this misses the largest lever. CUDs (D) apply only to compute, not storage. Deleting replicas (E) risks RTO/RPO and the DR posture.",
      "context": {
        "Quarterly bill projection": "$180,000",
        "Storage breakdown": "$45k live tables + $63k archive/audit data",
        "BigQuery storage cost": "~$5/TB/month vs $200/TB/month for Cloud SQL SSD",
        "Target saving": "$54,000 (30%)"
      }
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 3,
      "q": "You are defining the platform's policy for row-level security (RLS) on multi-tenant tables. A team has implemented RLS but a security audit finds that the application's database user has BYPASSRLS privilege. What is the finding and what is the remediation?",
      "opts": [
        "The finding is a false positive — BYPASSRLS is required by pgaudit to log row-level access",
        "BYPASSRLS on the application user completely bypasses all RLS policies, allowing the application to read any tenant's data regardless of the tenant context set in the session; the remediation is to revoke BYPASSRLS from the application role and validate that the application correctly sets app.current_tenant_id in each session",
        "BYPASSRLS only applies to superuser connections and has no effect on application users",
        "BYPASSRLS only bypasses RLS for SELECT statements, not for INSERT, UPDATE, or DELETE",
        "BYPASSRLS is required for application users to read their own tenant's data through RLS policies"
      ],
      "ans": 1,
      "fb": "BYPASSRLS is a PostgreSQL role attribute that completely skips all RLS policy evaluation for that role — it is equivalent to disabling RLS for that user. An application user with BYPASSRLS can query any row in any tenant's data, bypassing the entire isolation model. This is a critical security finding in a multi-tenant platform. The remediation is to revoke BYPASSRLS, ensure the application role only has the minimum required permissions, and confirm that each session correctly sets the tenant context (e.g., SET app.current_tenant_id = '...') which the RLS policy uses via current_setting(). BYPASSRLS is not required for normal application access (A is false). It applies to any role it is granted to, not just superusers (C is false). It is not related to pgaudit (D is false). It bypasses ALL operations, not just SELECT (E is false).",
      "context": {
        "Finding": "Application DB user has BYPASSRLS attribute",
        "RLS policy": "Uses current_setting('app.current_tenant_id')",
        "Compliance": "PCI-DSS — tenant data isolation required"
      }
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 4,
      "q": "You are building a shared Liquibase baseline configuration that all platform teams will use. A key requirement is that migrations must be idempotent and safe to re-run. Which Liquibase feature should be mandated, and what does it protect against?",
      "opts": [
        "Mandate that changesets use stripComments = false to preserve SQL comments for audit purposes",
        "Mandate that all changesets target a specific PostgreSQL version using the dbms precondition",
        "Mandate that all changesets use the runAlways flag to guarantee they are applied in every environment",
        "Mandate runOnChange = true on all changesets so Liquibase re-runs every changeset on every deployment",
        "Mandate that all non-idempotent changesets (DDL) use preconditions (e.g., tableExists, columnExists) or are written as idempotent SQL (CREATE TABLE IF NOT EXISTS, ADD COLUMN IF NOT EXISTS), and that all changesets have a rollback block; this protects against partial deployments and simplifies reruns after failures"
      ],
      "ans": 4,
      "fb": "Idempotent migrations protect against the scenario where a migration partially applies (e.g., the service pod restarts mid-migration) and must be re-run. PostgreSQL 16 supports IF NOT EXISTS for most DDL operations (CREATE TABLE, ADD COLUMN, CREATE INDEX CONCURRENTLY). Preconditions in Liquibase (e.g., <preconditions onFail='MARK_RAN'>) provide an alternative safety net. Rollback blocks allow clean recovery from failed deployments. runOnChange (A) re-runs a changeset whenever its content changes — appropriate for stored procedures but dangerous for DDL. runAlways (B) runs the changeset on every deployment regardless — appropriate only for very specific use cases. stripComments (D) is a formatting preference with no safety benefit. Targeting a specific PostgreSQL version (E) is unnecessarily restrictive for a platform that controls its own PostgreSQL version.",
      "context": {
        "Platform": "40 services, each with Liquibase-managed schema",
        "Problem": "Partial deployment failures require manual DB cleanup",
        "PostgreSQL": "16 (IF NOT EXISTS supported for DDL)"
      }
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 0,
      "q": "You are leading an authority-level evaluation of whether to adopt CockroachDB as an alternative to Cloud SQL PostgreSQL 16 for a new multi-region, high-write-throughput product. A key argument from the proposing team is that CockroachDB eliminates the need for multi-region application logic. How do you assess this claim?",
      "opts": [
        "CockroachDB uses a different consistency model (eventual consistency) which is incompatible with PCI-DSS requirements",
        "CockroachDB is not suitable for financial workloads due to lack of ACID transactions",
        "The claim is partially correct: CockroachDB's distributed transactions and multi-region tables eliminate the need for manual shard routing and cross-region conflict resolution, but the application must still be designed for CockroachDB's serialisable-by-default model, latency characteristics of cross-region consensus, and PostgreSQL wire protocol compatibility gaps that may require code changes",
        "The claim is correct — CockroachDB handles all multi-region complexity transparently and requires no application-level changes",
        "CockroachDB is PostgreSQL-compatible in all cases — migration requires no code changes"
      ],
      "ans": 2,
      "fb": "CockroachDB does significantly simplify multi-region architecture by handling distributed consensus, automatic data placement (using REGIONAL BY ROW or GLOBAL tables), and providing serialisable transactions globally. However, the 'no application changes needed' claim is an oversimplification: (1) CockroachDB uses serialisable isolation by default, which may conflict with application assumptions about PostgreSQL's READ COMMITTED default; (2) cross-region transactions incur 50-200ms of consensus latency that must be accounted for in SLO design; (3) PostgreSQL dialect compatibility gaps (e.g., certain pg_catalog views, some stored procedure features, sequence behaviour) may require application code changes. The evaluation must include a realistic migration compatibility audit. CockroachDB is fully ACID (D is false). It uses serialisable (distributed) consistency, which is compatible with PCI-DSS (E is false).",
      "context": {
        "Use case": "Multi-region financial ledger, 15,000 write TPS",
        "Regions": "US, EU, APAC simultaneous writes",
        "Claim": "CockroachDB eliminates multi-region application logic"
      }
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 1,
      "q": "You are designing a cross-region DR architecture where the platform must survive a complete regional failure with zero data loss (RPO = 0). You know that Cloud SQL cross-region replicas use asynchronous replication. How do you achieve RPO = 0 within the Cloud SQL family?",
      "opts": [
        "RPO = 0 is impossible with Cloud SQL; recommend migrating to Spanner which provides external consistency across regions",
        "Use Cloud SQL HA within the region and supplement with an application-level dual-write pattern that writes to both regions synchronously before confirming the transaction to the client, accepting the latency trade-off of synchronous cross-region writes",
        "Deploy a Patroni cluster on GKE in two regions with synchronous replication between them",
        "Set synchronous_commit = on on the primary — this forces the replica to acknowledge WAL before the primary confirms the transaction",
        "Enable Cloud SQL PITR with a 1-second granularity — this effectively reduces RPO to 1 second, which is acceptable as RPO = 0"
      ],
      "ans": 1,
      "fb": "Cloud SQL cross-region replicas are asynchronous — there is no supported way to make them synchronous at the Cloud SQL layer. To achieve RPO = 0 for a critical workload, the architectural pattern is application-level dual-write: the application writes to both regional databases synchronously within the same operation before returning success to the client. This introduces cross-region write latency (50-100ms) that must be factored into the SLO design. Alternatives include designing the domain to use event sourcing with a Kafka cluster that has multi-region synchronous replication (Confluent or MSK with synchronous replication). synchronous_commit on the primary does not make Cloud SQL's cross-region replica synchronous (A is false — this setting controls local WAL durability). Spanner (B) is a valid architectural alternative but not an answer about RPO within Cloud SQL. PITR at 1-second granularity (D) is RPO = 1 second, not RPO = 0. Patroni on GKE (E) is self-managed and a separate evaluation.",
      "context": {
        "RPO requirement": "0 (zero data loss)",
        "Cloud SQL replication": "Asynchronous to cross-region replica",
        "Cross-region latency": "~65ms between us-central1 and europe-west1"
      }
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 1,
      "q": "Following a cross-region failover drill, the team discovers that promoting the read replica took 18 minutes — exceeding the 10-minute RTO target. Investigation shows that the promotion delay was caused by the replica needing to apply 14 minutes of accumulated WAL before becoming writable. What is the most effective long-term fix?",
      "opts": [
        "Disable WAL archiving on the primary to reduce the volume of WAL the replica must process",
        "Reduce replication lag by ensuring the replica instance is sized to keep up with the primary's write throughput, and schedule regular DR drills to detect lag drift before a real incident",
        "Switch to a synchronous replication model where the primary waits for the replica to confirm WAL before committing",
        "Increase the Cloud SQL instance tier of the read replica so it can apply WAL faster",
        "Increase `max_wal_size` on the primary to buffer more WAL locally and reduce network transfer during failover"
      ],
      "ans": 1,
      "fb": "WAL accumulation on the replica indicates the replica cannot keep up with the primary's write throughput — it is perpetually lagging behind. Upsizing the replica CPU and I/O (part of B) allows it to apply WAL faster and stay closer to the primary, reducing accumulated lag. Regular DR drills (also B) are critical to detecting this drift before a real incident. Option A (increasing tier) is part of the fix but without understanding why the lag exists and without ongoing monitoring, the problem recurs. Synchronous replication (C) solves lag but adds write latency on the primary and is not Cloud SQL's default model. Disabling WAL archiving (D) would break PITR. Increasing `max_wal_size` (E) buffers more WAL in memory/disk on the primary; it does not affect the replica's application rate.",
      "context": {
        "Observed issue": "Replica had 14 minutes of WAL to apply before promotion completed",
        "Root cause": "Replica perpetually lagging behind primary write throughput",
        "Detection gap": "No alerting on replication lag; discovered only during drill"
      }
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 2,
      "q": "The CTO asks you to build a multi-year Cloud SQL cost model to inform a potential architecture shift. You have 3 years of cost data. A key variable is whether to continue scaling vertically (larger instances) or introduce horizontal read scaling (read replicas). How do you model and present the decision?",
      "opts": [
        "Present only the read replica option since it is cheaper than vertical scaling in all cases",
        "Model three scenarios: (1) continue vertical scaling at current growth rate, (2) introduce read replicas at a defined tenant count threshold, (3) migrate to a different data tier (e.g., Spanner) at a higher threshold; for each scenario, project cost, operational complexity, and engineering investment, and present with confidence intervals based on historical growth variance",
        "Recommend immediately migrating to Spanner to avoid future Cloud SQL cost growth",
        "Present only the current year's cost trajectory and extrapolate linearly for 3 years without considering architecture changes",
        "Build the model assuming 0% growth as a conservative baseline to avoid overstating costs"
      ],
      "ans": 1,
      "fb": "An authority-level cost model for a strategic decision must present multiple scenarios with different architecture assumptions, not a single linear extrapolation. The three-scenario model (vertical scaling, read replica scaling, platform migration) gives leadership the information needed to make a trade-off decision: at what tenant count does the cost of vertical scaling exceed the engineering investment of horizontal scaling? What is the migration cost to Spanner versus the savings? Confidence intervals based on historical growth variance acknowledge uncertainty honestly. A linear extrapolation (A) is too simplistic for a strategic decision. Recommending Spanner immediately (C) pre-empts the analysis. Read replicas are not cheaper in all cases (D) — they add instance cost and replication lag management. A 0% growth baseline (E) is dishonest and not useful for planning.",
      "context": {
        "Cost data": "3 years of Cloud SQL billing, tenant growth, and query volume",
        "Audience": "CTO, CFO",
        "Decision": "Architecture investment for next 3 years"
      }
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 2,
      "q": "You are presenting to the board on the platform's database total cost of ownership (TCO). Beyond Cloud SQL instance costs, what components must be included in a complete TCO model to avoid underreporting?",
      "opts": [
        "Include only the costs that appear on the Cloud SQL billing line in the GCP invoice",
        "Include Cloud SQL costs and a flat 20% overhead estimate for operational costs",
        "TCO models for cloud databases should exclude engineering labour costs as these are fixed costs",
        "Cloud SQL instance costs, storage, backup storage, network egress (especially cross-region replication and Cloud SQL Auth Proxy traffic), Cloud KMS key operation costs, and the fully-loaded engineering cost of database operations (on-call, migration effort, performance tuning, DR drills) must all be included for a complete TCO",
        "Only Cloud SQL instance hourly costs and storage costs need to be included"
      ],
      "ans": 3,
      "fb": "A complete database TCO model for board-level presentation must include: (1) Cloud SQL compute (instance hours), (2) storage (provisioned + auto-growth), (3) backup storage (PITR logs + automated backups), (4) network egress (cross-region replica replication traffic, Auth Proxy traffic within the VPC, and any cross-region data access), (5) Cloud KMS key operation costs if CMEK is enabled, and (6) fully-loaded engineering labour for migrations, on-call, performance tuning, and DR activities. Engineering labour is often the largest cost component at platform scale and is frequently excluded from cloud cost dashboards, leading to systematic underreporting. Only billing-line costs (A, C) ignores labour. A flat 20% overhead (D) is an approximation that cannot be defended to a board. Excluding labour (E) is the most common and expensive omission.",
      "context": {
        "Audience": "Board of Directors",
        "Purpose": "Justify infrastructure investment for next fiscal year",
        "Known cost components": "Cloud SQL instances, storage, CMEK"
      }
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 2,
      "q": "You have delivered a cost reduction initiative that saved $60k/month by archiving audit data to BigQuery. Three months later, costs have rebounded to within $15k of the original level. The growth is in compute — three new teams have each provisioned db-custom-16-65536 instances for their services. What governance change would most effectively prevent uncontrolled cost growth going forward?",
      "opts": [
        "Set a GCP budget alert at 110% of target spend and notify the platform team when it triggers",
        "Remove all engineers' ability to provision Cloud SQL instances and route all requests through a DBA ticket queue",
        "Implement a chargeback model where each team is billed internally for their Cloud SQL costs, without changing provisioning controls",
        "Mandate that all new services must use Cloud Spanner instead of Cloud SQL to reduce provisioning flexibility",
        "Establish a Cloud SQL instance provisioning policy with pre-approved tier tiers for different workload classes, require cost sign-off for instances above a threshold, and publish monthly cost-per-team dashboards to create accountability"
      ],
      "ans": 4,
      "fb": "Cost rebound from unconstrained provisioning requires a governance change: a policy that defines appropriate instance sizes for workload types (e.g., development, staging, production-small, production-large), a cost approval gate for large instances, and visible cost accountability through per-team dashboards. Budget alerts (C) are reactive — they notify after costs have grown, not before. Removing all provisioning access (A) creates a bottleneck that slows development. Mandating Spanner (D) is a major architectural shift that adds complexity. Chargeback alone (E) creates financial awareness but without provisioning controls, engineers can still over-provision.",
      "context": {
        "Rebound cause": "3 new teams each provisioned large Cloud SQL instances without review",
        "Required change": "Proactive governance, not just monitoring",
        "Policy components": "Pre-approved tier tiers, approval gate, per-team cost dashboards"
      }
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 3,
      "q": "A new compliance requirement mandates that all SELECT queries on PCI-DSS-regulated tables must be logged with the actual user identity (not just the service account), the tenant context, and the query timestamp. The current architecture uses a single application-level service account. How do you satisfy this requirement without re-architecting the entire authentication model?",
      "opts": [
        "Create individual PostgreSQL users for each application user and revoke the service account",
        "Use Cloud SQL Data Access Audit Logs in GCP — these automatically capture end-user identity from the application",
        "Enable log_statement = 'all' on the Cloud SQL instance — this logs all queries with the connected user",
        "Use pgaudit with OBJECT-level auditing on the regulated tables, and require the application to inject end-user identity and tenant context into the session using SET LOCAL app.user_id and SET LOCAL app.tenant_id at the start of each transaction; pgaudit will log these as session variables alongside the query",
        "Use PostgreSQL row-level security with a policy that logs queries to a separate audit table via a BEFORE SELECT trigger"
      ],
      "ans": 3,
      "fb": "The pattern for injecting application-level user identity into PostgreSQL audit logs without changing the authentication model is session variables: at the start of each transaction, the application sets SET LOCAL app.user_id = '...' and SET LOCAL app.tenant_id = '...'. pgaudit can be configured to log these session parameters alongside the query (using log_line_prefix and pgaudit.log_parameter). This satisfies the requirement for user identity and tenant context in the audit log without requiring individual DB users. log_statement = 'all' (A) logs the service account, not the end-user identity. Individual DB users per application user (B) is architecturally disruptive and impractical at scale. Cloud SQL Data Access Audit Logs (D) capture IAM-level access, not application-level user context. BEFORE SELECT triggers (E) do not exist in PostgreSQL — triggers cannot intercept SELECT statements.",
      "context": {
        "Regulated tables": "payment_instruments, card_tokens, pii_records",
        "Current auth": "Single service account (cloud-sql-sa@project.iam)",
        "Requirement": "Log end-user identity + tenant + timestamp per SELECT"
      }
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 3,
      "q": "You are conducting an authority-level review of the platform's data retention and deletion standard. A new right-to-erasure (GDPR/CCPA) requirement means that deleting a tenant's PII must be reflected in all backups within 30 days. How do you address this architectural challenge given that Cloud SQL PITR backups are immutable?",
      "opts": [
        "Rely on the 35-day PITR retention window: all backups older than 35 days are automatically deleted, satisfying the 30-day requirement",
        "Store all PII in a separate Cloud Storage bucket with object-level deletion, and use Cloud SQL only for non-PII data",
        "Delete and recreate the Cloud SQL instance after each erasure request to ensure all backups are clean",
        "Implement cryptographic erasure: encrypt PII columns with a per-tenant key stored in Cloud KMS; upon erasure, destroy the Cloud KMS key — making the encrypted PII in all existing backups permanently unreadable without physically deleting the rows from backup files",
        "Apply the erasure only to the live database — regulators accept that backup copies are a technical exception to right-to-erasure"
      ],
      "ans": 3,
      "fb": "Cryptographic erasure is the established architectural pattern for satisfying right-to-erasure requirements when backup immutability prevents physical deletion. By encrypting PII columns with per-tenant keys in Cloud KMS and deleting (destroying) the key upon an erasure request, the data in all existing backups becomes permanently unreadable — effectively erased — without modifying the backup files. This satisfies GDPR and CCPA erasure requirements. Recreating the instance (A) is operationally catastrophic and does not address existing backups on other systems. Relying on PITR expiry (C) means data persists for up to 35 days after an erasure request, which may violate the requirement for timely erasure. Separating PII to Cloud Storage (D) is a different architecture, not a solution to the backup immutability problem. Technical exception claims (E) are not universally accepted and expose the platform to regulatory risk.",
      "context": {
        "Requirement": "GDPR/CCPA right-to-erasure: PII must be unrecoverable within 30 days",
        "Backup mechanism": "Cloud SQL PITR (35-day retention, immutable)",
        "Encryption": "CMEK available via Cloud KMS"
      }
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 4,
      "q": "You are building a platform capability that automatically detects tables that are candidates for partitioning based on query patterns and growth metrics. The capability will emit recommendations to teams. What combination of PostgreSQL system catalog data should drive the detection logic?",
      "opts": [
        "Monitor pg_stat_bgwriter.buffers_clean to identify tables that are evicting pages frequently",
        "Monitor pg_locks for tables with frequent lock wait events as a proxy for large table access patterns",
        "Monitor pg_stat_statements for queries with long mean_exec_time and cross-reference with pg_class.reltuples > 100M and pg_stat_user_tables.seq_scan rate increasing over time; additionally check whether the table has a date/time or tenant_id column suitable for range/list partitioning by inspecting information_schema.columns",
        "Monitor only pg_stat_user_indexes.idx_scan and flag tables where index scans drop below a threshold",
        "Monitor pg_stat_user_tables.seq_scan and n_live_tup; flag tables with seq_scan > 1000 and n_live_tup > 10M"
      ],
      "ans": 2,
      "fb": "A partitioning recommendation engine needs multi-signal detection: (1) query performance signal from pg_stat_statements (slow mean_exec_time on queries touching the table), (2) size signal from pg_class.reltuples (row count estimate) and pg_total_relation_size(), (3) access pattern signal from pg_stat_user_tables (rising seq_scan rate over time suggests full scans that partition pruning could eliminate), and (4) schema signal from information_schema.columns to identify whether a suitable partition key column (date, tenant_id) exists. Simply thresholding seq_scan and n_live_tup (A) produces too many false positives (e.g., tables that are small but frequently scanned for other reasons). bgwriter (C) identifies buffer pressure, not partitioning candidates specifically. idx_scan dropping (D) is a weak signal without size context. pg_locks (E) indicates contention, not size/scan patterns.",
      "context": {
        "Platform capability": "Automated partitioning recommendations",
        "Signal sources": "pg_stat_statements, pg_stat_user_tables, pg_class, information_schema",
        "Target": "Tables > 100M rows with suitable partition keys"
      }
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 4,
      "q": "You are designing a platform-wide connection pooling capability using PgBouncer deployed as a GKE sidecar. Teams are complaining that their Liquibase migrations fail when routed through PgBouncer in transaction mode. What is the root cause and the correct architectural decision?",
      "opts": [
        "The fix is to increase PgBouncer's pool size so Liquibase always gets a dedicated connection",
        "PgBouncer in transaction mode is not compatible with PostgreSQL 16 and must be upgraded",
        "PgBouncer in transaction mode is correct but Liquibase must be configured to use SET TRANSACTION instead of advisory locks",
        "Liquibase is incompatible with connection pooling in general and must always connect directly to PostgreSQL",
        "PgBouncer in transaction mode cannot be used with Liquibase because Liquibase uses session-level advisory locks (pg_advisory_lock) to coordinate concurrent migrations; transaction-mode pooling releases the server connection (and the advisory lock) at the end of each transaction, breaking the lock coordination; the correct decision is to bypass PgBouncer for Liquibase migration connections by connecting directly to Cloud SQL, or to use PgBouncer in session mode for the migration role"
      ],
      "ans": 4,
      "fb": "Liquibase uses pg_advisory_lock() to prevent concurrent migrations from running simultaneously. pg_advisory_lock is a session-level lock — it persists for the duration of the database session. In PgBouncer transaction mode, the server-side connection is released back to the pool after each transaction commits. This means the advisory lock acquired by Liquibase at the start of its migration session is released when the first transaction ends, and another Liquibase instance could acquire the same lock and run concurrently — causing data corruption. The correct fix is to route Liquibase connections directly to Cloud SQL (bypassing PgBouncer) or to use PgBouncer in session mode for the migration service role, which holds a dedicated server connection for the duration of the client session. PgBouncer transaction mode is fully compatible with PostgreSQL 16 (A is false). Liquibase works fine with session-mode pooling (C is wrong). pg_advisory_lock cannot be replaced by SET TRANSACTION (D is wrong). Increasing pool size (E) does not change the lock release behaviour.",
      "context": {
        "PgBouncer mode": "transaction",
        "Liquibase version": "4.x",
        "Symptom": "Liquibase fails with 'lock not held' or concurrent migration errors"
      }
    }
  ]
}
