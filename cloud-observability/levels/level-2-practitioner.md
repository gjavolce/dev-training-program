# Level 2 — Practitioner

**Focus:** Instrumenting your service correctly and contributing to the team's observability setup.

## Which of these scenarios can you handle confidently today?

- When I deploy a new service to GKE, I can configure its resource requests and limits correctly, set up the liveness and readiness probes, and verify that the service appears healthy in Cloud Monitoring before declaring the deployment done.
  `resources.requests` `resources.limits` `livenessProbe` `readinessProbe` `kubectl rollout status` `Cloud Monitoring uptime check` `GKE workload health`

- When I add a new feature that touches a critical business flow, I can add structured log statements with the right fields (trace ID, tenant ID, operation name, duration) so that the flow is traceable in Cloud Logging without producing log spam.
  `structured logging` `JSON log format` `trace_id field` `Spring Boot logback` `MDC (Mapped Diagnostic Context)` `log severity levels` `Cloud Logging jsonPayload`

- When I need to add a custom metric for a new feature (e.g. number of payment retries per minute), I can instrument it with Micrometer in Spring Boot, verify it appears in Prometheus scraping, and build a simple Grafana panel to display it.
  `Micrometer` `Counter` `MeterRegistry` `prometheus scrape` `Spring Boot Actuator /actuator/prometheus` `Grafana panel editor` `PromQL`

- When I need to understand how a request flows through our system, I can use the trace view in Cloud Trace or Grafana Tempo to follow a trace ID across services and identify where the latency is being spent.
  `Cloud Trace` `Grafana Tempo` `trace ID` `span` `OpenTelemetry` `trace waterfall view` `service-to-service latency`

- When the team needs to create a basic alert for a new service, I can define the alert condition, set an appropriate threshold, link it to a runbook, and configure the notification channel — without creating a noisy alert that pages people at 3am for non-issues.
  `Cloud Monitoring alerting policy` `alert condition` `notification channel` `alert threshold` `runbook URL annotation` `alert duration window` `Grafana alert rule`

## Training Track

Engineers at this level join **Track A: Foundations → Practitioner** together with Level 1 engineers.
