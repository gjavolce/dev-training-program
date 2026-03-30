# Level 1 — Foundations

**Focus:** I know my app uses memory and I can see it.

*Production lens: I'm on-call, an alert fires about memory — I can find the right dashboard, see that something is wrong, and escalate with useful information.*

## Which of these scenarios can you handle confidently today?

- When I look at Grafana dashboards for our services, I can find memory-related panels (pod memory usage, JVM heap usage, GC pause times, restart counts) and tell "steady" from "growing" from "spiking."
  `jvm.memory.used` `jvm.memory.max` `container_memory_usage_bytes` `Grafana` `Cloud Monitoring` `pod memory` `heap committed` `sawtooth pattern`

- When a pod restarts and someone says "it got OOMKilled," I understand that means it used more memory than it was allowed — even if I don't yet know where the memory went.
  `OOMKilled` `exit code 137` `kubectl describe pod` `Last State: Terminated` `resources.limits.memory` `container memory limit` `pod restart count`

- When I see memory-related configuration in our deployment manifests (`-Xmx`, resource limits), I know these control how much memory the service gets, even if I can't evaluate whether the values are right.
  `-Xmx` `-Xms` `resources.requests.memory` `resources.limits.memory` `JAVA_OPTS` `JDK_JAVA_OPTIONS` `deployment manifest`

- When a Spring Boot service starts behaving differently right after deployment versus 10 minutes later, I'm aware that "warming up" is a real thing — the JVM needs time to optimize hot code paths.
  `JIT compilation` `cold start` `warm-up` `readinessProbe` `Spring Boot startup` `first requests slow` `class loading`

- When someone mentions heap, stack, garbage collection, or OutOfMemoryError in a discussion, I have a rough mental model — objects live in memory, the runtime cleans up what's no longer needed, and sometimes things go wrong.
  `heap` `stack` `garbage collection` `OutOfMemoryError` `GC pause` `memory leak` `java.lang.Error` `OOM`

> **What this level is about:** Building vocabulary and observation skills. You can point at the right dashboard, recognize symptoms, and follow a conversation — but you're not yet diagnosing or fixing.

## Training Track

Engineers at this level join **Track A: Foundations → Practitioner** together with Level 2 engineers.

---

*Tags:* #training-program #memory-management #level-1 #track-a
