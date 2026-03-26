# Level 4 — Specialist

**Focus:** Owning the observability platform for the domain and ensuring the team can operate services in production with confidence.

## Which of these scenarios can you handle confidently today?

- When the team needs to define SLOs for a critical service, I can lead the process: define the right SLI measurements, set realistic error budget targets based on actual traffic patterns, configure the Cloud Monitoring SLO, and explain to stakeholders what the error budget means in practice.
  `Cloud Monitoring SLO` `SLI definition` `error budget` `request-based SLI` `window-based SLI` `burn rate alert` `good request ratio` `99th percentile latency SLO`

- When GCP cloud costs for the domain are growing faster than traffic, I can analyse the cost breakdown, identify the main drivers (GKE instance types, Cloud SQL tier, storage, network egress), and propose concrete changes with their cost and performance implications.
  `GCP Billing export` `BigQuery cost analysis` `GKE cost breakdown` `Cloud SQL tier` `network egress cost` `committed use discounts` `Spot VMs` `resource rightsizing`

- When we need to do a zero-downtime deployment of a change that requires GKE rolling updates and a database migration simultaneously, I can design and execute the deployment sequencing: migration first, then application rollout, with rollback triggers and observability checkpoints at each step.
  `kubectl rollout` `rolling update strategy` `maxUnavailable / maxSurge` `Liquibase` `blue-green deployment` `deployment observability gate` `rollback trigger` `readiness probe during migration`

- When a team in another domain asks how to set up observability for a new service, I can produce a reusable guide: the standard logging format, the required metrics, the tracing setup, the alert templates, and the Grafana dashboard starting point — so they don't have to figure it out from scratch.
  `observability template` `standard log format` `required Micrometer metrics` `OTEL Java agent config` `Grafana dashboard JSON` `alert policy template` `Spring Boot Actuator` `runbook template`

- When a Cloud SQL instance needs maintenance (version upgrade, certificate rotation, configuration change), I can plan and execute the change with minimum disruption: schedule the window, communicate to stakeholders, verify application reconnection behaviour, and confirm service health afterwards.
  `Cloud SQL maintenance window` `SSL certificate rotation` `HikariCP reconnection` `Cloud SQL flags` `Cloud SQL instance restart` `connection validation` `maintenance notification` `gcloud sql instances patch`

## Training Track

Engineers at this level join **Track B: Advanced → Specialist** together with Level 3 engineers.
