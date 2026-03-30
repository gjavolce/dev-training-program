# Claude Code Prompts — JVM Training

Prompts for Claude Code to generate and evolve the loyalty-service Spring Boot application. Run these in order. Each prompt is self-contained with enough context.

---

## Prompt 1: Scaffold the Loyalty Service

```
Create a Spring Boot 3.3 (Java 21) project called "loyalty-service" in the current directory.

Tech stack:
- Spring Boot 3.3.x with spring-boot-starter-web, spring-boot-starter-data-jpa, spring-boot-starter-actuator
- spring-kafka for Kafka consumer/producer
- HikariCP (comes with Spring Boot, but we'll configure it explicitly)
- PostgreSQL driver
- Liquibase for schema management
- Micrometer for metrics
- Lombok

Project structure — standard layered Spring Boot, NOT hexagonal or CQRS:

src/main/java/com/seb/loyalty/
├── LoyaltyServiceApplication.java
├── config/
│   ├── DataSourceConfig.java          # Explicit HikariCP config (pool size, timeouts, leak detection)
│   ├── KafkaConsumerConfig.java       # Consumer factory, deserializer, concurrency
│   └── AsyncConfig.java              # ThreadPoolTaskExecutor for async operations
├── controller/
│   ├── MemberController.java         # GET /api/members/{id}, GET /api/members/{id}/points
│   ├── RewardsController.java        # GET /api/rewards, POST /api/rewards/{id}/redeem
│   └── AdminController.java          # POST /admin/tier-evaluation, POST /admin/points-expiry
├── service/
│   ├── MemberService.java
│   ├── PointsService.java            # Points calculation from transactions
│   ├── TierEvaluationService.java    # Batch: re-evaluate all member tiers
│   ├── RewardsService.java           # Catalog browse + redemption
│   ├── PointsExpiryService.java      # Expire old unused points
│   └── RewardsCacheService.java      # In-memory cache of rewards catalog
├── kafka/
│   ├── TransactionEventListener.java # @KafkaListener on "transaction.completed"
│   └── TransactionEvent.java         # DTO: customerId, accountId, amount, type, timestamp
├── repository/
│   ├── LoyaltyMemberRepository.java  # Spring Data JPA
│   ├── PointsTransactionRepository.java
│   ├── RewardsCatalogRepository.java
│   └── RedemptionRepository.java
└── model/
    ├── LoyaltyMember.java            # JPA entity
    ├── PointsTransaction.java        # JPA entity (type: EARN/REDEEM/EXPIRE/ADJUST/BONUS)
    ├── TierRule.java                 # JPA entity
    ├── RewardItem.java               # JPA entity
    └── Redemption.java               # JPA entity

Domain logic:
- When a transaction.completed Kafka event arrives, look up the member by customerId, calculate points (1 point per 10 SEK spent, multiplied by tier bonus_earn_multiplier), create a points_transaction record, update points_balance.
- Tier evaluation: for each member, check lifetime_points against tier_rules, upgrade/downgrade tier if needed.
- Points expiry: find points_transactions of type EARN older than 12 months that haven't been redeemed, create EXPIRE entries, deduct from balance.
- Rewards redemption: check member has enough points, deduct points, create redemption record, create REDEEM points_transaction.
- RewardsCacheService: loads the full rewards_catalog into a ConcurrentHashMap on startup. The GET /api/rewards endpoint reads from this cache.

Configuration (application.yml):
- spring.datasource: use HikariCP explicitly, pool size 10, connection timeout 30s, max lifetime 1800s, leak detection threshold 60s
- spring.kafka: bootstrap-servers from env, consumer group "loyalty-service", auto-offset-reset earliest, concurrency 3
- server.tomcat.threads.max: 200 (default)
- management.endpoints.web.exposure.include: health,metrics,prometheus
- Actuator health includes: db, diskSpace, kafka

Include:
- docker-compose.yml with PostgreSQL 15 and Kafka (Confluent or Redpanda, whichever is simpler)
- Liquibase changelogs for the loyalty tables schema (see schema below)
- A data/seed-data.sql that inserts 4 tier_rules and 50 sample rewards_catalog items
- Dockerfile (multi-stage build, Eclipse Temurin 21 base)
- k8s/deployment.yaml with JVM flags: -Xmx512m -Xms512m -XX:+UseG1GC -XX:+HeapDumpOnOutOfMemoryError
- docs/GETTING-STARTED.md explaining how to run locally with docker-compose

Schema (PostgreSQL):
[paste the schema from loyalty-service-spec.md]

Keep the code SIMPLE. This is a training app for engineers at various levels — a Level 1 engineer should be able to read and follow the code. No fancy abstractions, no mappers framework, no custom exceptions hierarchy. Plain Spring Boot patterns.
```

---

## Prompt 2: Add Training Profiles (the "bugs")

```
The loyalty-service is a training application. Each JVM training session needs a specific "bug" or behavior activated via Spring profiles. Add the following profiles:

### Profile: gc-pressure
In PointsService, when the "gc-pressure" profile is active, the points calculation method should:
- Create a new BigDecimal for every single arithmetic operation (no reuse)
- Build intermediate ArrayList copies of the full points history on every calculation
- Use String concatenation in a loop (instead of StringBuilder) for building the description field
- Create a new SimpleDateFormat instance on every call (instead of DateTimeFormatter)
The goal: high young-generation allocation rate, frequent minor GCs, visible in GC logs.

### Profile: leak
In RewardsCacheService, when the "leak" profile is active:
- Every call to GET /api/rewards adds entries to the internal map keyed by request timestamp (or a counter)
- Entries are NEVER evicted
- Each entry holds a copy of the full catalog (not just a reference)
- After ~1000 requests, heap usage should be visibly growing
The goal: a classic unbounded cache memory leak, diagnosable with heap dumps.

### Profile: oom
Don't change Java code. Instead create k8s/deployment-oom.yaml where:
- Container memory limit: 512Mi
- JVM flags: -Xmx460m (90% of container, leaving almost no room for non-heap)
- Under load with Kafka consumers + HTTP threads + Metaspace, the pod should get OOMKilled
Also create k8s/deployment-healthy.yaml with -Xmx350m (68%) for comparison.

### Profile: slow-batch
In TierEvaluationService, when "slow-batch" is active:
- Process members one at a time (no batching)
- For each member, issue a separate query to fetch their points history (N+1)
- Add an unnecessary synchronized block around the tier calculation logic
- Add a Thread.sleep(1) inside the loop to simulate "thinking" (makes it slow enough to profile)
The goal: JFR shows the synchronized block as hot, the N+1 is visible in method profiling.

### Profile: contention
In DataSourceConfig, when "contention" is active:
- Set HikariCP pool to maximumPoolSize=3
In AsyncConfig, when "contention" is active:
- Set thread pool to corePoolSize=2, maxPoolSize=2
The tier evaluation and points earning should run concurrently, causing:
- Threads BLOCKED waiting for HikariCP connections
- Threads WAITING for the async executor
The goal: thread dump diagnosis — find what's blocking what.

### Profile: sick (combines multiple issues)
Activate when spring.profiles.active=sick:
- Enable the leak behavior from RewardsCacheService
- Enable the contention settings (small pools)
- Add: Kafka consumer processing becomes slow because GC pauses from the leak cause consumer heartbeat timeouts, triggering rebalances
The goal: three interacting root causes for the capstone team exercise.

Implementation rules:
- Use @Profile or @ConditionalOnProperty to toggle behaviors
- The default profile should be a HEALTHY app with none of these issues
- Add a brief comment at the top of each buggy code path: // TRAINING: activated by profile 'X' — intentional for Session N
- Don't make the bugs obvious from class names — they should look like plausible production code mistakes
```

---

## Prompt 3: Add Load Generation Tooling

```
Add a simple load generator to the loyalty-service project. This is NOT for production — it's for training exercises where engineers need to generate load to observe JVM behavior.

Create src/main/java/com/seb/loyalty/tools/LoadGenerator.java (or a separate module/script):

Option A (preferred): A Spring Boot CLI runner activated by profile "load-gen":
- When spring.profiles.active includes "load-gen", instead of starting the web server, run load generation against a target URL (configurable)
- Modes:
  - "steady": 10 req/sec to GET /api/rewards + 5 req/sec to GET /api/members/{random_id}/points
  - "spike": Ramp from 10 to 100 req/sec over 60 seconds on POST /api/members/{random_id}/points/calculate
  - "batch": Trigger POST /admin/tier-evaluation and monitor response time
  - "mixed": All of the above concurrently
- Duration: configurable, default 5 minutes
- Output: req/sec, p50/p95/p99 latency, error rate — printed to console every 10 seconds

Option B (alternative): A simple bash script using `hey` or `wrk`:
- scripts/load-steady.sh
- scripts/load-spike.sh
- scripts/load-batch.sh

Either way, include instructions in docs/GETTING-STARTED.md on how to generate load.
```

---

## Prompt 4: Add Kafka Event Simulation

```
The training environment may not always have a running Kafka producing real transaction events. Add a simulation mode:

When spring.profiles.active includes "simulate-events":
- A @Scheduled method fires every 100ms
- Each invocation creates a TransactionEvent with:
  - Random customerId (from the loyalty_members that exist in DB)
  - Random amount between 50 and 5000 SEK
  - type = "PURCHASE"
- Publishes to the internal TransactionEventListener directly (bypassing Kafka)
- This lets engineers observe points earning, tier evaluation, and cache behavior without needing Kafka infrastructure

Also add a REST endpoint POST /admin/simulate-burst?count=1000&delayMs=10 that fires a burst of events for load testing.
```

---

## Usage Notes

- Run prompts 1–4 in sequence in Claude Code
- After each prompt, verify the app compiles and starts: `./mvnw spring-boot:run` (or `docker-compose up`)
- The app should start cleanly with the default profile
- Test each profile individually before the training sessions
- The load generator and event simulator are tools for the trainer, not for the engineers — they're pre-configured in each session's exercise instructions
