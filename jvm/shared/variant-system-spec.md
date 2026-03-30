# Exercise Variant System — Design Spec

**How parameterized exercises ensure individual work across all JVM training sessions.**

---

## How It Works

Each engineer is assigned a variant letter (A through F) before Session 1. The variant is passed as an environment variable when starting the loyalty-service:

```bash
VARIANT=C SPRING_PROFILES_ACTIVE=gc-pressure ./mvnw spring-boot:run
```

The variant changes **internal behavior parameters** — allocation multipliers, cache sizes, pool limits, sleep durations — so that every engineer's JVM produces different observable numbers. The learning objectives are identical across all variants; only the specific measurements differ.

---

## Implementation in the App

### The Variant Config

A single configuration class reads the variant and exposes parameters:

```java
@Component
public class VariantConfig {

    @Value("${VARIANT:A}")
    private String variant;

    // Each method returns a different value per variant.
    // The variant letter selects from a pre-defined parameter set.

    public int gcPressureListCopies()       { return PARAMS.get(variant).listCopies; }
    public int gcPressureStringLoopSize()    { return PARAMS.get(variant).stringLoopSize; }
    public int leakEntriesPerRequest()       { return PARAMS.get(variant).leakEntriesPerRequest; }
    public int leakEntryPayloadBytes()       { return PARAMS.get(variant).leakPayloadBytes; }
    public int contentionPoolSize()          { return PARAMS.get(variant).hikariPoolSize; }
    public int contentionExecutorSize()      { return PARAMS.get(variant).executorPoolSize; }
    public int slowBatchSleepMs()            { return PARAMS.get(variant).batchSleepMs; }
    public int slowBatchChunkSize()          { return PARAMS.get(variant).batchChunkSize; }
    // ... more per session as needed
}
```

### The Parameter Sets

| Parameter | A | B | C | D | E | F |
|---|---|---|---|---|---|---|
| **Session 2: GC pressure** | | | | | | |
| List copies per calculation | 3 | 5 | 4 | 6 | 3 | 5 |
| String loop iterations | 200 | 150 | 300 | 100 | 250 | 180 |
| BigDecimal reuse | none | none | none | none | none | none |
| *Expected minor GC/min (approx)* | *12-15* | *18-22* | *15-18* | *22-28* | *14-17* | *19-23* |
| *Expected avg pause (approx)* | *4-6ms* | *6-9ms* | *5-7ms* | *8-12ms* | *5-7ms* | *7-10ms* |
| | | | | | | |
| **Session 3: Memory leak** | | | | | | |
| Cache entries added per request | 1 | 2 | 1 | 3 | 2 | 1 |
| Payload size per entry (bytes) | 8,000 | 4,000 | 12,000 | 3,000 | 6,000 | 10,000 |
| *Growth per request (approx)* | *~8KB* | *~8KB* | *~12KB* | *~9KB* | *~12KB* | *~10KB* |
| *Requests to fill 256MB* | *~32K* | *~32K* | *~21K* | *~28K* | *~21K* | *~25K* |
| | | | | | | |
| **Session 4: Container memory** | | | | | | |
| *Uses same parameters as default — variant shows in Xmx/container mismatch configured per k8s manifest variant* | | | | | | |
| Container limit (Mi) | 512 | 512 | 640 | 640 | 512 | 640 |
| Xmx setting | 460m | 440m | 580m | 560m | 470m | 550m |
| *Headroom %* | *10%* | *14%* | *9%* | *12%* | *8%* | *14%* |
| | | | | | | |
| **Session 5: Slow batch (JFR)** | | | | | | |
| Batch chunk size | 1 (N+1) | 1 (N+1) | 1 (N+1) | 1 (N+1) | 1 (N+1) | 1 (N+1) |
| Sleep per member (ms) | 2 | 1 | 3 | 1 | 2 | 3 |
| Synchronized block | yes | yes | yes | yes | yes | yes |
| *Expected batch duration (200K members)* | *~7min* | *~4min* | *~10min* | *~4min* | *~7min* | *~10min* |
| | | | | | | |
| **Session 6: Thread contention** | | | | | | |
| HikariCP max pool | 3 | 2 | 4 | 2 | 3 | 4 |
| Async executor max | 2 | 3 | 2 | 2 | 3 | 3 |
| *Bottleneck type* | *DB pool* | *Mixed* | *Executor* | *Both tight* | *Mixed* | *Executor* |
| | | | | | | |
| **Session 7: G1 vs ZGC** | | | | | | |
| *Same workload across variants — the point is GC algorithm comparison, not variant differences. Variant only changes the target p99 SLA.* | | | | | | |
| Target p99 SLA (ms) | 50 | 40 | 60 | 35 | 45 | 55 |
| | | | | | | |
| **Session 8: JVM config audit** | | | | | | |
| *Each variant has a different set of misconfigurations in the k8s manifest. See session 8 variant table below.* | | | | | | |

### Session 8 — Config Misconfigurations per Variant

| Misconfiguration | A | B | C | D | E | F |
|---|---|---|---|---|---|---|
| Missing HeapDumpOnOOM | ✓ | | ✓ | | ✓ | |
| Xms ≠ Xmx (resize pauses) | | ✓ | | ✓ | | ✓ |
| No container awareness flags | ✓ | ✓ | | | ✓ | ✓ |
| GC logging to stdout (floods logs) | | | ✓ | ✓ | | |
| No JFR enabled | ✓ | | | ✓ | | ✓ |
| Wrong GC algorithm for workload | | ✓ | ✓ | | ✓ | |
| *Total issues to find* | *3* | *3* | *3* | *3* | *3* | *3* |

Each variant has exactly 3 issues — same difficulty, different combination.

---

## Trainer Validation

### The Answer Key

For each session, the trainer has a validation sheet with **expected ranges** per variant. The trainer doesn't need to match exact numbers — JVM behavior has natural variance — but the numbers should fall within the expected range for that variant.

**Example validation for Session 2, Core exercise:**

| Variant | Minor GC/min | Avg pause (ms) | If outside range |
|---|---|---|---|
| A | 10-18 | 3-8 | Wrong profile or wrong variant |
| B | 15-25 | 5-12 | Wrong profile or wrong variant |
| C | 13-22 | 4-9 | Wrong profile or wrong variant |
| D | 18-32 | 7-15 | Wrong profile or wrong variant |
| E | 11-20 | 4-9 | Wrong profile or wrong variant |
| F | 16-26 | 6-13 | Wrong profile or wrong variant |

**What the trainer checks:**
1. Are the numbers in the right range for the assigned variant?
2. Are the numbers clearly different from adjacent variants? (Catches copy-paste)
3. Does the analysis section make sense given those numbers? (Catches "I filled in numbers but didn't actually look")

### Quick Validation Shortcut

The trainer can run a variant spot-check script that starts each variant briefly, generates a short burst of load, and captures the baseline numbers:

```bash
# Run before the session to refresh expected ranges
./scripts/validate-variants.sh gc-pressure
# Output: per-variant expected ranges based on a 60-second sample
```

This script would be part of the loyalty-service repo (generated via Claude Code).

---

## What Engineers See

Engineers don't see the parameter tables above. They see:

1. In the Getting Started guide: "You have an assigned variant letter. Use it when starting the app."
2. In each exercise: "Start the app with your variant: `VARIANT=C SPRING_PROFILES_ACTIVE=gc-pressure ./mvnw spring-boot:run`"
3. In the template they submit: A field for "Variant:" at the top.
4. At the start of the program: "Your variant changes the app's internal behavior so your measurements are unique. The learning is the same — the numbers are different."

They should NOT know the specific parameters per variant. The point isn't for them to predict the numbers; it's for them to observe and analyze what the JVM is actually doing.

---

## Variant Assignment Strategy

With ~6 variants and potentially 20-30 engineers in a cohort:

- Assign variants round-robin: engineer 1 = A, engineer 2 = B, ..., engineer 7 = A, etc.
- Engineers sitting next to each other should have different variants (so adjacent people can't compare directly)
- The trainer keeps a simple spreadsheet: `Name | Variant | Team`
- Variants persist across all sessions — engineer C is always variant C

If you have very large cohorts (40+), add variants G and H by interpolating between existing parameter values.

---

## Claude Code Prompt Addition

Add this to the Claude Code prompts to implement the variant system:

```
## Prompt 5: Add Variant System

The loyalty-service needs a parameterization system for training exercises.

Add a VariantConfig component that reads VARIANT env var (A-F, default A) and
exposes per-session parameters. Each "buggy" service class should inject VariantConfig
and use its methods instead of hardcoded values.

Specifically:

1. Create src/main/java/com/seb/loyalty/config/VariantConfig.java
   - Reads @Value("${VARIANT:A}")
   - Contains a static Map<String, VariantParams> with 6 variants (A-F)
   - VariantParams is an inner record with fields for each session's tunable values
   - Expose typed getter methods: gcPressureListCopies(), leakEntriesPerRequest(), etc.

2. Modify PointsService (gc-pressure profile path):
   - Inject VariantConfig
   - Use variantConfig.gcPressureListCopies() for the number of intermediate list copies
   - Use variantConfig.gcPressureStringLoopSize() for the string concatenation loop

3. Modify RewardsCacheService (leak profile path):
   - Inject VariantConfig
   - Use variantConfig.leakEntriesPerRequest() for how many entries to add per request
   - Use variantConfig.leakEntryPayloadBytes() for the size of each cached payload

4. Modify DataSourceConfig (contention profile path):
   - Use variantConfig.contentionPoolSize() for HikariCP maximumPoolSize

5. Modify AsyncConfig (contention profile path):
   - Use variantConfig.contentionExecutorSize() for thread pool sizes

6. Modify TierEvaluationService (slow-batch profile path):
   - Use variantConfig.slowBatchSleepMs() for the artificial sleep
   - Use variantConfig.slowBatchChunkSize() for batch vs N+1

7. Create k8s/ deployment variants for Session 4 and 8:
   - k8s/deployment-variant-A.yaml through deployment-variant-F.yaml
   - Session 4: different Xmx/container limit combos per variant
   - Session 8: different misconfiguration combos per variant

8. Add a /admin/variant endpoint that returns:
   { "variant": "C", "session": "gc-pressure", "params": { ... } }
   This is for the trainer only (to verify a student is running the right variant).
   Protect it under the "admin" profile or a simple flag.

9. Create scripts/validate-variants.sh that:
   - Starts the app with each variant + a given profile
   - Runs 30 seconds of load
   - Captures key metrics (GC count, avg pause, heap growth rate)
   - Outputs a table of expected ranges per variant
   - Stops the app between variants

Parameter values per variant:
[paste the parameter table from the variant spec document]
```

---

## Session 9 (Capstone) — Variant Combination

Session 9 uses the `sick` profile which combines multiple issues. For the variant system, each variant gets a different combination emphasis:

| Variant | Primary issue | Secondary issue | Tertiary issue |
|---|---|---|---|
| A | Leak (high rate) | Contention (tight DB pool) | Kafka lag (moderate) |
| B | Contention (tight executor) | Leak (slow rate) | Kafka lag (high) |
| C | Leak (medium rate) | Kafka lag (high) | Contention (moderate) |
| D | Contention (both pools tight) | Kafka lag (moderate) | Leak (slow rate) |
| E | Kafka lag (high) | Leak (high rate) | Contention (moderate) |
| F | Leak (slow rate) | Contention (tight DB pool) | Kafka lag (high) |

All three issues exist in every variant — but the relative severity differs, so different engineers will discover the root causes in a different order during diagnosis. This makes the team exercise richer when they compare notes.

---

*Variant System v1.0 — JVM Training Program*
