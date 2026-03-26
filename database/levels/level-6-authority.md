# Level 6 — Principal

**Focus:** Organizational strategy, disaster recovery validation, and technology direction.

## Which of these scenarios can you handle confidently today?

- When the organization needs a database strategy that spans regions (for disaster recovery, data residency, or latency requirements), I can design the approach — including cross-region replication topology, failover procedures, and the trade-offs between consistency, availability, and cost — and present it at the leadership level.
  `cross-region replication` `Cloud SQL cross-region replica` `RTO` `RPO` `data residency` `PITR` `failover topology` `CAP theorem`
- When we're evaluating whether to stay on Cloud SQL or explore alternatives (AlloyDB, self-managed PostgreSQL on GKE), I can run the evaluation: define the criteria, set up a proof-of-concept, benchmark the relevant workloads, and produce a written recommendation that non-technical stakeholders can act on.
  `AlloyDB` `Cloud SQL` `self-managed PostgreSQL on GKE` `pgbench` `benchmark criteria` `TCO` `managed vs self-hosted` `technology evaluation`
- When we need to validate that our disaster recovery actually works (not just that it exists on paper), I can design and run a failover drill — including defining success criteria, coordinating with affected teams, measuring actual recovery time, and documenting the gaps we find.
  `DR drill` `Cloud SQL failover` `PITR restore` `RTO measurement` `runbook validation` `incident coordination` `gap analysis`
- When a team is building new internal tooling (CI migration checks, schema validation, monitoring dashboards, Terraform modules for Cloud SQL), I can review or contribute to the design, ensuring it meets the needs of multiple teams and doesn't create operational debt.
  `Terraform Cloud SQL module` `Liquibase CI` `schema validation` `Cloud Monitoring dashboard` `platform tooling` `reusable modules` `operational debt`
- When leadership asks "how long until we need to scale this database, and what will it cost?", I can produce a capacity projection grounded in actual growth data — storage trajectory, connection count trends, instance tier headroom — with clear decision points and cost estimates for each scaling path.
  `capacity planning` `storage growth rate` `connection count trends` `instance tier upgrade` `Cloud SQL metrics` `cost projection` `scaling thresholds`

## Role in Training Program

Engineers at this level serve as **Mentors & Workshop Leads** for Track A and Track B.
