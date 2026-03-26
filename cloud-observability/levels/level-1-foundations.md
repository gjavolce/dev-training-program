# Level 1 — Foundations

**Focus:** Reading what the platform is telling you and navigating GCP without getting lost.

## Which of these scenarios can you handle confidently today?

- When a service alert fires in Grafana, I can open the dashboard, understand what the panel is measuring, and tell the difference between a metric that's genuinely out of range and one that's noisy or stale.
  `Grafana` `alert state` `no data vs firing` `evaluation interval` `alert thresholds` `dashboard panels` `time range selector`

- When a pod is restarting in GKE, I can use `kubectl` to get the pod status, read the recent logs, and identify whether it's an OOM kill, a failing liveness probe, or a crash at startup.
  `kubectl describe pod` `kubectl logs --previous` `OOMKilled` `liveness probe` `CrashLoopBackOff` `exit codes` `pod restart count`

- When I need to find a specific log line from a service in the last hour, I can use Cloud Logging's query interface to filter by service name, severity, and time range without needing someone to write the query for me.
  `Cloud Logging` `Log Explorer` `resource.type` `severity filter` `timestamp filter` `log query language` `jsonPayload`

- When an alert fires for a service I don't own, I can look at the runbook link, follow the triage steps, and escalate to the right team with a useful summary of what I observed — not just "the alert fired".
  `runbook` `alert annotations` `escalation path` `Cloud Monitoring alert policy` `Grafana alert labels` `incident summary`

- When I look at a Cloud SQL metrics dashboard, I can read CPU utilisation, connection count, and storage usage, and tell whether any of those numbers suggest something needs attention.
  `Cloud SQL metrics` `database/cpu/utilization` `database/postgresql/num_backends` `storage utilization` `Cloud Monitoring` `GCP Console` `metrics explorer`

## Training Track

Engineers at this level join **Track A: Foundations → Practitioner** together with Level 2 engineers.
