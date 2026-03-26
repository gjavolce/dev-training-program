# Level 5 — Expert

**Focus:** Making architecture decisions that affect multiple teams, and operating at the boundary between database engineering and platform strategy.

## Which of these scenarios can you handle confidently today?

- When the organization is deciding whether a domain should have its own Cloud SQL instance or share with another domain, I can lead the analysis — weighing blast-radius isolation, operational cost, cross-instance query complexity, and compliance boundaries — and present a clear recommendation to stakeholders.
  `Cloud SQL instance isolation` `blast radius` `cross-database queries` `compliance boundaries` `ADR` `cost modelling` `multi-tenant architecture`
- When a team needs to offload reporting or analytics queries from their primary database, I can design the read-replica routing strategy, define which workloads go where, and help the team understand the consistency trade-offs (how stale is acceptable for each use case).
  `Cloud SQL read replica` `replication lag` `replica routing` `read-after-write consistency` `analytics workloads` `Spring AbstractRoutingDataSource`
- When a schema change needs to touch a table with tens of millions of rows in production, I can own the migration plan end-to-end: estimate the duration on a Cloud SQL clone, write the runbook, define the monitoring plan, prepare the rollback procedure, and communicate the risk to stakeholders.
  `Cloud SQL clone` `migration runbook` `pg_stat_progress_alter_table` `lock monitoring` `rollback plan` `Liquibase` `pg_repack`
- When a query is slow and the fix isn't obvious from a basic EXPLAIN, I can dig into the planner's decisions — understanding why it chose a particular join order or scan strategy — and find ways to guide it toward a better plan without resorting to workarounds.
  `query planner` `planner statistics` `pg_stats` `default_statistics_target` `join order` `enable_hashjoin` `enable_seqscan` `ANALYZE`
- When another team asks for help with a database design question outside my own domain, I can review their proposal, identify risks they may have missed, and provide actionable feedback — and I've contributed to shared standards (ADRs, modeling guidelines, Terraform modules) that teams actually reference.
  `ADR` `Terraform Cloud SQL module` `schema review` `data modeling` `referential integrity` `naming conventions` `shared standards`
- When we're reviewing Cloud SQL costs and someone asks whether we're spending appropriately, I can break down the cost drivers (instance tier, HA, storage, replicas, network) and propose specific changes with their performance and cost implications.
  `Cloud SQL pricing` `instance tier` `HA standby` `read replica cost` `storage auto-increase` `network egress` `committed use discounts`

## Role in Training Program

Engineers at this level serve as **Mentors & Workshop Leads** for Track A and Track B.
