# Level 4 — Specialist

**Focus:** Operating at scale, managing platform-level database concerns, and ensuring compliance.

## Which of these scenarios can you handle confidently today?

- When a table grows to tens of millions of rows and queries start slowing down, I can evaluate whether partitioning is the right solution, design the partitioning strategy, and plan the migration from unpartitioned to partitioned — including handling the transition period.
  `PARTITION BY RANGE` `PARTITION BY LIST` `PARTITION BY HASH` `pg_partman` `declarative partitioning` `partition pruning` `attach partition`
- When our Cloud SQL instance fails over (planned or unplanned), I can explain to the team what happened, why the downtime lasted as long as it did, and whether our application handled reconnection correctly — and I can suggest improvements if it didn't.
  `Cloud SQL HA` `regional instance` `failover replica` `HikariCP reconnect` `connection retry` `Cloud SQL Auth Proxy reconnect` `spring.datasource.hikari`
- When we're hitting connection limits or seeing connection timeout errors, I can trace the problem through the full stack (application pool settings, Auth Proxy behavior, Cloud SQL instance limits) and propose the right fix at the right layer.
  `HikariCP` `maximumPoolSize` `connectionTimeout` `max_connections` `pg_stat_activity` `PgBouncer` `Cloud SQL Auth Proxy` `wait_timeout`
- When a compliance review asks how our database encryption works or where our data retention policies are implemented, I can answer confidently — including explaining our CMEK setup, what's encrypted at rest, and how our archival strategy meets regulatory requirements.
  `CMEK` `Cloud KMS` `encryption at rest` `pgaudit` `data retention` `archival` `Cloud SQL disk encryption` `PCI-DSS` `SOX`
- When someone proposes changing a PostgreSQL configuration flag on Cloud SQL, I can evaluate whether it's likely to help, test it safely on a cloned instance, and measure the actual impact before recommending it for production.
  `Cloud SQL flags` `work_mem` `shared_buffers` `max_connections` `checkpoint_completion_target` `clone instance` `pg_stat_bgwriter`
- When the team is debugging a performance issue that isn't a single slow query but a system-level pattern (high I/O wait, checkpoint pressure, cache miss rate), I can use Cloud Monitoring metrics and PostgreSQL stats views to identify the bottleneck.
  `pg_stat_bgwriter` `checkpoints_timed` `blks_hit` `blks_read` `cache hit ratio` `Cloud Monitoring` `disk I/O metrics` `WAL write rate`

## Training Track

Engineers at this level join **Track B: Advanced → Specialist** together with Level 3 engineers.
