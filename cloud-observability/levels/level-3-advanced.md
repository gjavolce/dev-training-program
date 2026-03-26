# Level 3 — Advanced

**Focus:** Diagnosing complex production issues across multiple services and owning the observability for a domain.

## Which of these scenarios can you handle confidently today?

- When a production incident involves latency degradation that isn't obviously caused by a single service, I can use distributed traces to identify where time is being lost, correlate that with metrics (GC pauses, database query times, Kafka consumer lag), and produce a coherent diagnosis rather than guessing.
  `Grafana Tempo` `trace correlation` `span attributes` `kafka_consumer_lag` `GC pause duration` `Cloud SQL query latency` `exemplars` `trace-to-metrics linking`

- When GKE nodes are showing high CPU or memory utilisation and the cause isn't a single misbehaving pod, I can investigate at the node level: identify which pods are responsible, whether any are being throttled due to limit settings, and propose the right remedy.
  `kubectl top node` `kubectl top pod` `CFS throttling` `container/cpu/limit_utilization` `node pool metrics` `GKE system metrics` `throttled_time` `resource limits`

- When our OpenTelemetry instrumentation is producing too much data (high cardinality, excessive sampling, or noisy spans), I can tune the configuration: adjust sampling rates, filter low-value spans, and reduce cardinality without losing the signals that matter for diagnosis.
  `otel.traces.sampler` `otel.traces.sampler.arg` `TraceIdRatioBased sampler` `span processor` `attribute cardinality` `span filtering` `OTEL collector config` `tail-based sampling`

- When I need to build a dashboard for a business-critical flow, I can design it from the user perspective: identify the right golden signals for that flow (request rate, error rate, latency, saturation), choose the right visualisations, and ensure the dashboard tells a story rather than just showing numbers.
  `golden signals` `rate / errors / latency / saturation` `Grafana dashboard` `histogram_quantile` `error rate PromQL` `SLI panels` `time series vs stat panels` `dashboard variables`

- When Terraform is used to manage our GKE workloads and Cloud SQL instances, I can read and modify the relevant modules, plan and apply changes safely, and understand what a Terraform state conflict or drift means in practice.
  `google_container_cluster` `google_sql_database_instance` `terraform plan` `terraform apply` `terraform state` `state drift` `terraform import` `module variables`

## Training Track

Engineers at this level join **Track B: Advanced → Specialist** together with Level 4 engineers.
