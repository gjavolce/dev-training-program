# Loyalty Service — Training Application Spec

**Purpose:** A single Spring Boot 3.x (Java 21) application used across all JVM training sessions. Each session introduces a different JVM problem — memory leak, GC pressure, thread contention, misconfigured container limits — that engineers diagnose using JVM tools.

The app is the "patient." Sessions are the "case studies."

---

## Domain: Credit Card Loyalty Program

A loyalty points system layered on the existing BaaS platform (tenants, customers, accounts, transactions).

### Entities

| Entity | Description | Key relationships |
|---|---|---|
| `loyalty_members` | A customer enrolled in the loyalty program | → customers (from BaaS schema), has tier and points_balance |
| `points_transactions` | Individual points events: earn, redeem, expire, adjust | → loyalty_members, timestamped, immutable |
| `tier_rules` | Threshold definitions for tier upgrades | Bronze/Silver/Gold/Platinum, min points, min spend |
| `rewards_catalog` | Redeemable items with point costs | name, category, points_cost, stock, active flag |
| `redemptions` | Tracks reward claims by members | → loyalty_members, → rewards_catalog, status, fulfilled_at |

### Schema (PostgreSQL — extends the training database)

```sql
CREATE TABLE loyalty_members (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    tier TEXT NOT NULL DEFAULT 'BRONZE' CHECK (tier IN ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM')),
    points_balance BIGINT NOT NULL DEFAULT 0,
    lifetime_points BIGINT NOT NULL DEFAULT 0,
    tier_evaluated_at TIMESTAMPTZ,
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed'))
);

CREATE TABLE points_transactions (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL REFERENCES loyalty_members(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    type TEXT NOT NULL CHECK (type IN ('EARN', 'REDEEM', 'EXPIRE', 'ADJUST', 'BONUS')),
    points BIGINT NOT NULL,
    balance_after BIGINT NOT NULL,
    description TEXT,
    reference_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tier_rules (
    id SERIAL PRIMARY KEY,
    tier TEXT NOT NULL UNIQUE CHECK (tier IN ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM')),
    min_lifetime_points BIGINT NOT NULL,
    min_annual_spend NUMERIC(18,2),
    bonus_earn_multiplier NUMERIC(4,2) NOT NULL DEFAULT 1.0
);

CREATE TABLE rewards_catalog (
    id BIGSERIAL PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    points_cost BIGINT NOT NULL,
    stock INT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE redemptions (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL REFERENCES loyalty_members(id),
    reward_id BIGINT NOT NULL REFERENCES rewards_catalog(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    points_spent BIGINT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'FULFILLED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    fulfilled_at TIMESTAMPTZ
);
```

### Target data volumes (for training)

| Table | Rows | Notes |
|---|---|---|
| loyalty_members | 200K | Subset of the 500K customers |
| points_transactions | 5M | ~25 per member average, 12 months |
| tier_rules | 4 | One per tier |
| rewards_catalog | 500 | Mixed categories, some inactive |
| redemptions | 100K | ~0.5 per member average |

---

## Application Architecture

```
loyalty-service/
├── src/main/java/com/seb/loyalty/
│   ├── LoyaltyServiceApplication.java
│   ├── config/
│   │   ├── DataSourceConfig.java          # HikariCP configuration
│   │   ├── KafkaConsumerConfig.java       # Kafka listener config
│   │   └── AsyncConfig.java               # Thread pool for async ops
│   ├── controller/
│   │   ├── MemberController.java          # REST: member lookup, enrollment
│   │   ├── PointsController.java          # REST: points balance, history
│   │   ├── RewardsController.java         # REST: catalog browse, redeem
│   │   └── AdminController.java           # REST: tier evaluation trigger, stats
│   ├── service/
│   │   ├── MemberService.java
│   │   ├── PointsService.java             # Points calculation logic
│   │   ├── TierEvaluationService.java     # Batch tier re-evaluation
│   │   ├── RewardsService.java            # Catalog + redemption
│   │   ├── PointsExpiryService.java       # Scheduled expiry job
│   │   └── RewardsCacheService.java       # In-memory catalog cache
│   ├── kafka/
│   │   ├── TransactionEventListener.java  # Consumes transaction events → earns points
│   │   └── TransactionEvent.java          # Event DTO
│   ├── repository/
│   │   ├── LoyaltyMemberRepository.java
│   │   ├── PointsTransactionRepository.java
│   │   ├── RewardsCatalogRepository.java
│   │   └── RedemptionRepository.java
│   └── model/
│       ├── LoyaltyMember.java
│       ├── PointsTransaction.java
│       ├── TierRule.java
│       ├── RewardItem.java
│       └── Redemption.java
├── src/main/resources/
│   ├── application.yml                    # Default config (sane defaults)
│   ├── application-leak.yml               # Session 3: activates memory leak
│   ├── application-gc-pressure.yml        # Session 2: high allocation rate
│   ├── application-oom.yml                # Session 4: Xmx too high for container
│   ├── application-contention.yml         # Session 6: thread pool too small
│   ├── application-slow-batch.yml         # Session 5: tier eval is slow
│   └── application-sick.yml               # Session 9: multiple problems combined
├── src/test/java/...
├── Dockerfile
├── k8s/
│   ├── deployment.yaml                    # GKE deployment manifest
│   ├── service.yaml
│   └── configmap.yaml                     # JVM flags per profile
├── docker-compose.yml                     # Local: PostgreSQL + Kafka + app
├── data/
│   ├── schema.sql                         # DDL for loyalty tables
│   ├── seed-data.sql                      # 200K members, 5M points_transactions
│   └── seed-rewards.sql                   # 500 catalog items
└── docs/
    └── GETTING-STARTED.md                 # How to run locally, how to switch profiles
```

---

## Spring Profiles — One App, Nine Problems

Each training session activates different behavior via Spring profiles. The "bugs" are implemented as real code paths that get activated — not artificial mocks.

| Profile | Session | What it does |
|---|---|---|
| `default` | 1 | Clean app, healthy. Engineers inspect a working JVM. |
| `gc-pressure` | 2 | PointsService creates excessive short-lived objects during batch calculation (new BigDecimal per operation, intermediate list copies, unnecessary string concatenation). High young-gen allocation rate. |
| `leak` | 3 | RewardsCacheService holds a `Map<Long, RewardItem>` that grows unbounded — entries are added on every catalog browse but never evicted. Classic cache-without-eviction leak. |
| `oom` | 4 | Deployment manifest sets `-Xmx` to 90% of container limit, leaving no room for Metaspace, thread stacks, or direct buffers. Under load (more Kafka consumers + HTTP threads), the pod gets OOMKilled. |
| `slow-batch` | 5 | TierEvaluationService processes all 200K members sequentially, does N+1 queries (fetches points history per member instead of batch), and the hot method has an unnecessary synchronized block. JFR reveals the bottleneck. |
| `contention` | 6 | HikariCP pool set to 3 connections, async executor pool set to 2 threads, but the tier evaluation and points earning run concurrently. Thread dump shows threads BLOCKED waiting for connections and stuck in a synchronized block. |
| `g1` / `zgc` | 7 | Same workload, different GC. Points redemption endpoint has strict p99 latency SLA. G1 with default pause target causes occasional breaches; ZGC doesn't. |
| `misconfigured` | 8 | Multiple JVM flag problems: no HeapDumpOnOutOfMemoryError, Xms ≠ Xmx (resize pauses), no container awareness flags, GC logging to stdout flooding logs, no JFR enabled. |
| `sick` | 9 | Combines leak (from session 3) + contention (from session 6) + a new issue: Kafka consumer lag because consumer threads are GC-paused. Three root causes, one sick service. |

---

## Key Endpoints

| Method | Path | Description | JVM training relevance |
|---|---|---|---|
| GET | `/api/members/{id}` | Member details + tier | Simple DB read, baseline |
| GET | `/api/members/{id}/points` | Points history (paginated) | Can trigger N+1 if not careful |
| POST | `/api/members/{id}/points/calculate` | Recalculate points from transactions | Allocation-heavy (session 2) |
| GET | `/api/rewards` | Browse catalog | Hits cache (session 3 leak source) |
| POST | `/api/rewards/{id}/redeem` | Redeem a reward | Latency-sensitive (session 7) |
| POST | `/admin/tier-evaluation` | Trigger batch tier re-eval | Long-running, CPU + DB (session 5) |
| POST | `/admin/points-expiry` | Run points expiry job | Background batch (session 5 variant) |
| GET | `/actuator/health` | Standard Spring Boot health | Kubernetes probes |
| GET | `/actuator/metrics` | Micrometer metrics | JVM metrics in training |

### Kafka Topics

| Topic | Direction | Payload |
|---|---|---|
| `transaction.completed` | Consume | `{ customerId, accountId, amount, type, timestamp }` |
| `points.earned` | Produce | `{ memberId, points, reason, timestamp }` |

---

## What the App Must NOT Be

- **Not a production-quality loyalty system.** It's a training prop. The "bugs" are intentional and clearly separated by profile.
- **Not over-engineered.** Keep the code simple enough that a Level 1 engineer can read and understand the structure. No hexagonal architecture, no CQRS, no event sourcing. Standard Spring Boot layers: controller → service → repository.
- **Not dependent on external infrastructure to start.** `docker-compose up` must work. The Kubernetes deployment is optional (for sessions 4, 8, 9 where container limits matter).

---

## Claude Code Prompt (for generating the project)

See `jvm/shared/claude-code-prompts.md` for the exact prompt to feed to Claude Code to generate this application.
