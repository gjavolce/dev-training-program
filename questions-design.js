var TRACK_DESIGN = {
  "id": "design",
  "label": "Solution Design",
  "icon": "design",
  "desc": "Architecture and system design for distributed BaaS services. Covers API design, data modelling, event-driven patterns, and cross-team architectural decisions.",
  "levels": [
    {
      "num": 1,
      "name": "Foundations",
      "desc": "Understanding existing system designs and contributing to discussions with confidence.",
      "scenarios": [
        "Reading API contracts (OpenAPI specs) and integrating against them independently",
        "Following design discussions and understanding trade-offs being made",
        "Identifying whether a change requires a schema change, new endpoint, or event",
        "Reading and understanding Architecture Decision Records (ADRs)",
        "Articulating why a bug is a design problem, not just a code problem"
      ]
    },
    {
      "num": 2,
      "name": "Practitioner",
      "desc": "Designing features that span service boundaries and documenting those decisions clearly.",
      "scenarios": [
        "Designing multi-service interactions (API contracts, sync vs async, Kafka vs HTTP)",
        "Writing ADRs that explain context, decision, alternatives, and consequences",
        "Designing REST endpoints with correct HTTP verbs, status codes, and pagination",
        "Identifying aggregate roots, consistency boundaries, and data replication trade-offs",
        "Giving concrete design feedback in PRs and design docs"
      ]
    },
    {
      "num": 3,
      "name": "Advanced",
      "desc": "Designing systems that handle complex domains, failure modes, and regulatory constraints.",
      "scenarios": [
        "Designing audit and event sourcing strategies for regulated domains (PCI-DSS, SOX)",
        "Designing sagas (orchestration vs choreography) with compensation and idempotency",
        "Designing API versioning strategies and managing breaking changes",
        "Designing multi-tenancy patterns (data isolation, tenant context propagation)",
        "Designing Kafka retry and dead-letter strategies for external integrations"
      ]
    },
    {
      "num": 4,
      "name": "Specialist",
      "desc": "Owning cross-service designs end-to-end and raising the quality bar across your domain.",
      "scenarios": [
        "Leading cross-team design sessions and maintaining design coherence",
        "Redesigning system boundaries (CQRS, read models, caching) for scale",
        "Identifying reuse opportunities and proposing consolidation across teams",
        "Identifying systemic risks in designs (retry storms, thundering herds, ordering assumptions)",
        "Tracing a financial transaction end-to-end across all services for compliance"
      ]
    },
    {
      "num": 5,
      "name": "Expert",
      "desc": "Setting architectural standards for the organisation and leading the highest-complexity design work.",
      "scenarios": [
        "Identifying diverging architectural decisions across teams and driving standards",
        "Scoping major architectural shifts and presenting phased approaches to leadership",
        "Facilitating stuck design decisions by surfacing real trade-offs and hidden assumptions",
        "Leading technology evaluations (new messaging systems, service meshes, API gateways)",
        "Defining the solution design curriculum for the training programme"
      ]
    },
    {
      "num": 6,
      "name": "Authority",
      "desc": "Architectural governance, technology strategy, and building the organisation's design capability.",
      "scenarios": [
        "Leading architecture for new strategic directions (new markets, new BaaS products)",
        "Redesigning the architectural decision-making process (when ADRs are required, who's involved)",
        "Owning audit/regulatory responses about system design (data flows, failure handling)",
        "Producing structured technical debt assessments with sequenced improvement roadmaps",
        "Building shared architectural vocabulary (standards, design guild, reference architectures)"
      ]
    }
  ],
  "questions": [
    {
      "level": 5,
      "diff": 1,
      "scenario": 0,
      "q": "You notice that three teams have independently built different patterns for propagating tenant context across service calls — one uses HTTP headers, one uses a thread-local, and one injects it via a Spring interceptor. What is the first thing an Expert should do before proposing a standard?",
      "opts": [
        "Document the three existing approaches, catalogue where each is used, and identify concrete problems each has caused in production",
        "Accept the divergence as natural since the three approaches are functionally equivalent and standardisation effort likely exceeds the consistency benefit",
        "Write a shared Spring interceptor library this week that unifies all three patterns, then ask each team to migrate before the next release",
        "Raise the divergence in the next architecture guild meeting and facilitate a vote to select which pattern becomes the standard",
        "Write an ADR immediately mandating the HTTP header approach as the standard because it is the most portable across service boundaries"
      ],
      "ans": 0,
      "fb": "Before proposing a standard you must understand the full landscape: what exists, where it is used, and what real harm the divergence causes. Skipping this step leads to standards that miss edge cases or mandate migration work with unclear benefit. Calling a vote (D) without documented evidence produces uninformed decisions. Immediately writing a new library (C) risks creating a fourth pattern. Doing nothing (E) ignores compounding drift. An immediate ADR (B) without analysis may mandate the wrong approach.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 0,
      "q": "Two teams are building event-driven flows on Kafka. Team A publishes domain events with full entity payloads; Team B publishes thin notification events and expects consumers to query back for state. A new team is about to start building a third consumer and asks which pattern to follow. What should an Expert say?",
      "opts": [
        "Tell the new team to follow Team A's full-payload event pattern because it reduces round-trips and provides consumer autonomy, making it the better default for event-driven flows",
        "Tell the new team to follow Team B's thin notification event pattern because it decouples producers from consumer data needs and keeps event schemas small",
        "Defer the decision entirely to the new team's tech lead since it falls within their service boundary and each team should choose their own event pattern",
        "Tell the new team to implement both fat and thin event patterns and let their consumers choose which approach depending on specific data requirements",
        "Acknowledge both patterns have merit, explain the trade-offs, and flag that a platform decision is needed before the new team picks a direction"
      ],
      "ans": 4,
      "fb": "When a third team enters and both patterns coexist, allowing them to pick freely entrenches the divergence. The Expert role is to surface the trade-offs (fat vs thin events: consumer coupling, schema versioning, query load) and drive a platform-level decision. Recommending one pattern without that discussion (A or B) is premature. Implementing both (D) creates more complexity. Deferring to the new tech lead (E) abdicates the Expert's responsibility to drive standards.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 0,
      "q": "After auditing four services, you find each team has defined its own retry strategy for Kafka consumer failures: fixed delay, exponential backoff with different caps, and one team using no retry at all. You want to drive a standard. Which approach best balances consistency with team autonomy?",
      "opts": [
        "Ask each of the four teams to write their own ADR explaining their current retry approach and submit them for cross-team peer review, so the divergence is documented and teams can learn from each other's rationale",
        "Write a shared Spring Boot starter that provides a configurable retry and DLQ pattern with sensible defaults, let teams adopt it at their own pace, and set a deadline aligned to a platform release",
        "Focus remediation only on teams whose retry bugs have already caused production incidents, since teams with working retry strategies should not be forced to change a pattern that has not caused observable harm",
        "Write a comprehensive ADR documenting the recommended retry and DLQ pattern with detailed configuration examples, then publish it to the architecture wiki and let teams adopt the new standard whenever they choose",
        "Mandate that all four teams adopt exactly the same retry parameters — 3 retries with 500ms exponential backoff and a shared DLQ topic — immediately, and block deployments for any service that does not comply with the standard"
      ],
      "ans": 1,
      "fb": "A shared starter library encodes the standard in code, making the right thing the easy thing, while configurable parameters preserve legitimate team differences. A hard deploy gate (A) is too coercive and creates friction without teaching. An ADR alone (C) is easy to ignore. Per-team ADRs (D) just documents divergence. Incident-triggered standardisation (E) is reactive and misses latent risk. The key Expert move is providing a paved path, not just a written rule.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 0,
      "q": "You are running an architecture guild session. Two senior engineers from different teams argue for opposite pagination strategies: one prefers offset-based pagination, the other prefers cursor-based. Both have implemented their approach in production APIs. How do you facilitate the discussion toward a durable platform decision?",
      "opts": [
        "Frame the decision around concrete axes: dataset size, sort stability, client UX needs, and compliance requirements — then assess which strategy best fits the platform's dominant use cases",
        "Let team size determine the outcome: whichever pagination pattern is currently used by more teams across the platform should become the standard, since majority adoption reduces migration effort and is the pragmatic choice",
        "Treat offset-based and cursor-based pagination as functionally equivalent and document both as acceptable platform patterns, letting new teams freely choose whichever approach their engineers are more familiar with",
        "Adopt cursor-based pagination as the platform-wide standard because it represents the more modern architectural approach and avoids the performance degradation that offset-based pagination suffers on large result sets",
        "Ask the two engineers to each build a performance benchmark simulating the platform's typical query patterns and present the results at the next guild session, then let the fastest approach win the standardisation decision"
      ],
      "ans": 0,
      "fb": "Architecture decisions should be grounded in the platform's actual constraints and use cases, not benchmarks in isolation or recency bias. Framing around axes (dataset size, sort stability, client needs, compliance) gives the guild a structured way to evaluate both patterns against reality. Defaulting to the majority pattern (D) entrenches the status quo regardless of merit. Accepting both (E) perpetuates the divergence. A benchmark alone (A) ignores non-performance trade-offs. 'More modern' (B) is not an engineering argument.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 0,
      "q": "Three teams have diverged on how they model soft deletes: one uses a boolean deleted flag, one uses a deleted_at timestamp, and one uses a status enum with ACTIVE/ARCHIVED/DELETED states. A compliance audit is approaching and the auditors want consistent data retention evidence across the platform. What is the Expert's move?",
      "opts": [
        "Tell the auditors that each team's soft delete approach is internally consistent within its service boundary, and the audit can verify compliance at the individual service level rather than requiring a platform-wide standard for data retention",
        "Engage the compliance team to define the technical standard for soft deletes and hand the specification to engineering for implementation, since compliance owns the requirement definition and engineering should implement what they specify",
        "Pick the boolean deleted flag as the platform standard because it is the simplest approach to implement and audit, then ask all three teams to migrate their data models before the upcoming compliance examination deadline",
        "Take a reactive approach and only modify the soft delete approaches that auditors explicitly flag as non-compliant during the examination, minimising unnecessary engineering work and focusing remediation on the specific gaps identified",
        "Map all three approaches to the compliance requirement, identify whether any fails to meet retention and auditability needs, propose a minimum standard that satisfies compliance, and agree a migration sequence"
      ],
      "ans": 4,
      "fb": "The Expert bridges engineering reality and compliance requirements. The right move is to evaluate each existing pattern against what the audit actually requires — retention period traceability, recoverability, audit log completeness — rather than defaulting to the simplest or waiting for auditors to dictate. Mandating the boolean flag (A) may lose timestamp evidence. Deferring to compliance to write the spec (D) abdicates technical ownership. Reactive-only change (E) is high risk ahead of an audit.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 0,
      "q": "You identify that two teams have independently solved idempotent Kafka consumer processing in incompatible ways: Team A stores a processed-event ID in the same PostgreSQL transaction as the business write; Team B checks a Redis cache before processing and relies on cache TTL for deduplication. A new compliance requirement demands that duplicate event processing must never result in double financial postings, with an auditable guarantee. Which response best represents Expert-level architectural leadership?",
      "opts": [
        "Ask each team to add compensating transactions to their existing idempotency approach so that either pattern can detect and recover from duplicate event processing after the fact, using a reconciliation job that identifies double financial postings within a configurable time window and automatically reverses the duplicate entries with a full audit trail of the compensation action",
        "Mandate Team A's transactional deduplication approach as the platform-wide standard immediately because storing the processed-event ID in the same PostgreSQL transaction as the business write provides a strictly stronger guarantee than cache-based TTL deduplication, and all teams should adopt the strongest available pattern regardless of their current implementation",
        "Treat this as a fundamentally unsolved problem within the platform's current architecture and recommend adopting a third-party exactly-once processing framework such as Kafka's transactional API with read-committed isolation, which would provide a unified idempotency layer that neither team's current approach achieves and would eliminate the need for application-level deduplication logic entirely",
        "Evaluate both approaches against the compliance requirement: transactional deduplication provides durable, auditable guarantees whereas TTL-based cache cannot guarantee deduplication across restarts or evictions — propose transactional deduplication as the standard for financial flows, with a migration plan and a carve-out for non-financial consumers where TTL risk is acceptable",
        "Mandate Team B's Redis-based cache deduplication approach as the platform-wide standard because Redis provides sub-millisecond lookup performance that minimises the latency impact of deduplication checks, and the TTL-based expiry ensures the deduplication cache does not grow unbounded, reducing database write amplification compared to storing idempotency keys in PostgreSQL"
      ],
      "ans": 3,
      "fb": "Expert-level leadership means mapping the technical differences to the compliance requirement precisely. Transactional deduplication (Team A) provides a durable, crash-safe guarantee because the idempotency record and business write commit atomically — this is auditable. Redis TTL (Team B) has a gap: cache eviction or a Redis restart before the TTL expires allows reprocessing. For financial postings under PCI-DSS/SOX, that gap is unacceptable. Mandating Team A without explaining the compliance rationale (A) is correct but incomplete as leadership. Compensating transactions (D) add complexity without addressing the root guarantee gap. A third-party framework (E) avoids the decision.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 0,
      "q": "You discover that teams across the platform have adopted four different strategies for inter-service authentication: mutual TLS, JWT bearer tokens validated locally, JWT tokens validated via a central auth service on every request, and API keys stored in Kubernetes secrets. A security review is imminent. As the Expert responsible for driving standards, you need to decide how to handle this divergence. What is the most defensible approach?",
      "opts": [
        "Ask the security team to evaluate all four authentication patterns, select the most secure option based on their threat assessment criteria, and enforce the chosen standard through CI pipeline gates that reject deployments using non-compliant authentication mechanisms — delegating the decision to security ensures the choice is driven by security expertise rather than engineering convenience",
        "Standardise on JWT bearer tokens with local validation as the platform-wide standard because stateless token verification scales horizontally without a central bottleneck, reduces inter-service latency by eliminating network calls to an auth service, and is compatible with the existing GKE service mesh infrastructure — mandate migration for all services within the next quarter",
        "Accept all four authentication approaches as valid as long as each team can demonstrate they passed their most recent security review and penetration test, since requiring migration to a single pattern would consume significant engineering time without adding measurable security value if each approach independently meets the security baseline requirements",
        "Conduct a threat model for each authentication pattern against your platform's actual attack surface, identify which patterns create unacceptable risk such as long-lived API keys without rotation or unbounded central auth latency, define a standard for new services and high-risk flows, and produce a risk-tiered migration plan for existing services",
        "Mandate mutual TLS for all inter-service communication across the platform because it provides the strongest authentication guarantee — both client and server identities are cryptographically verified, eliminating token theft and replay attack vectors — and GKE's certificate management infrastructure can automate certificate rotation to reduce the operational burden"
      ],
      "ans": 3,
      "fb": "Divergent authentication patterns require a threat-model-driven assessment, not a blanket mandate. mTLS (A) is strong but operationally expensive and may not be the right trade-off for all service-to-service calls on GKE where Workload Identity is available. Accepting all approaches if they passed prior reviews (B) ignores cumulative risk. Deferring to the security team (D) abdicates the Expert's role in translating security requirements into architectural decisions. Mandating stateless JWT (E) is reasonable but the right answer requires evaluating the actual attack surface. The Expert produces a risk-tiered decision with a migration plan, not a one-size-fits-all mandate.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 4,
      "q": "You are tasked with defining the Solution Design curriculum for a multi-team engineering organisation. Which of the following best describes the first step?",
      "opts": [
        "Copy a well-known tech company's engineering curriculum from their blog and adapt the titles to match your platform's technology stack",
        "Assess the current level distribution across teams using the placement quiz, then map curriculum topics to the gaps you find",
        "Write a reading list of architecture books like Fundamentals of Software Architecture and distribute it to all engineers as the curriculum",
        "Run ADR writing workshops across teams and use attendance metrics to gauge which topic areas generate the most interest",
        "Ask each tech lead to submit a prioritised list of topics their team wants to learn, then build the curriculum around the most requested"
      ],
      "ans": 1,
      "fb": "A curriculum should be grounded in evidence of where engineers currently are and what gaps exist. The placement quiz provides structured level data; mapping curriculum to those gaps ensures the investment targets real needs. A reading list (A) is an output, not a starting point. Tech lead input (C) is useful but subjective and does not replace data. Workshop attendance (D) measures engagement, not skill gaps. Copying an external curriculum (E) ignores your platform's specific technology and compliance context.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 4,
      "q": "When designing a learning module on 'Designing multi-service interactions' for Level 2 engineers, which format is most likely to build durable applied judgment rather than surface familiarity?",
      "opts": [
        "A written case study where engineers read about a design decision another team made, analyse the trade-offs documented in the accompanying ADR, and discuss what they would have done differently",
        "A multiple-choice quiz covering REST versus Kafka trade-offs, synchronous versus asynchronous patterns, and API contract design principles, with immediate scoring and explanations for each answer",
        "A recorded conference talk by an external speaker covering established microservice communication patterns such as API gateways, service meshes, and event-driven architecture, with follow-up discussion",
        "A 45-minute lecture covering the theoretical foundations of synchronous versus asynchronous communication, including sequence diagrams for common patterns and a comparison of coupling characteristics",
        "A structured exercise where engineers design a real feature from a simplified version of the platform, defend their choices, and receive structured feedback"
      ],
      "ans": 4,
      "fb": "Durable judgment is built through practice with feedback, not passive exposure. A structured design exercise on a realistic platform scenario — followed by defence and critique — mirrors how engineers actually make decisions and reveals gaps that lectures and quizzes cannot. Lectures (A) and talks (E) build awareness but not application skill. Case studies (B) are useful but passive. MCQ quizzes (D) assess recall, not judgment. The Expert's role in curriculum design is choosing formats that match the competency being developed.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 4,
      "q": "You notice that after three months of running design workshops, engineers can articulate trade-offs confidently in workshop settings but still produce weak ADRs in their actual PRs. What does this tell you about the curriculum design, and what should you change?",
      "opts": [
        "The curriculum is working as designed and ADR quality simply takes longer to improve than workshop discussion performance; give it another quarter before making changes to the programme structure",
        "The ADR template is too complex and intimidating for engineers to use in the flow of their daily PR work — simplify it to three core fields (context, decision, consequence) so engineers can complete it in under five minutes",
        "Add a separate standalone ADR-writing module at the end of the curriculum sequence that specifically addresses the gap between verbal articulation of trade-offs and written documentation of design decisions",
        "The engineers are not sufficiently engaged with the material — increase workshop frequency to weekly sessions and make attendance mandatory for all engineers at Level 2 and above to ensure consistent practice",
        "There is a transfer gap: the learning context (workshop) is too distant from the application context (real PR). Redesign so engineers write and review ADRs within their actual work, not in separate sessions"
      ],
      "ans": 4,
      "fb": "When performance in training does not transfer to work, the curriculum has a context gap. Engineers learn in an artificial setting and the skills do not activate in the real setting. The fix is to embed learning in real work: review actual ADRs in PRs, pair engineers with a more senior reviewer on their next real design decision, or run critique sessions on ADRs they wrote for live features. Making workshops mandatory (A) increases dose without fixing the gap. Adding a separate module (E) still separates learning from application. Simplifying the template (D) addresses form, not skill. Claiming it will come (B) ignores the evidence.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 4,
      "q": "You are designing the Level 3 curriculum module on sagas and compensation patterns. Two engineers on your review panel disagree: one argues engineers should learn orchestration-based sagas first because they are easier to reason about; the other argues choreography-based sagas should come first because the platform uses them more. How do you resolve this?",
      "opts": [
        "Teach orchestration-based sagas first because all authoritative textbooks and reference materials present orchestration before choreography, and following the established pedagogical sequence ensures conceptual consistency",
        "Survey the engineering team to determine which saga pattern the majority prefer to learn first, then structure the module around that preference since learner motivation directly correlates with knowledge retention",
        "Teach choreography-based sagas first because that is the pattern the platform currently uses in production, and defer orchestration to a later optional module since engineers need immediate practical relevance",
        "Design the module to start with the problem being solved — distributed transaction failure modes — then introduce both patterns side by side, using a real platform scenario to show when each is appropriate",
        "Defer to the more senior engineer on the review panel since their experience with the platform gives them better judgment about which sequencing will be most effective for the target audience of Level 3 engineers"
      ],
      "ans": 3,
      "fb": "The sequencing debate is a distraction from the real question: what mental model do engineers need first? Starting with the problem — what goes wrong in distributed transactions, what compensation means — gives engineers the 'why' before the 'how'. Presenting both patterns in contrast against a real scenario lets them understand trade-offs rather than memorising one approach. Deferring to seniority (A) or external references (B) treats the curriculum as a political or citation problem rather than a pedagogical one. Survey-driven curriculum (D) conflates preference with learning effectiveness.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 4,
      "q": "You are asked to decide whether to include a module on 'Designing for PCI-DSS compliance' in the Level 3 Solution Design curriculum, or to leave compliance topics to a separate programme run by the security team. What is the Expert's reasoning?",
      "opts": [
        "Include PCI-DSS compliance content only for engineers working directly on the payments team since they are the ones who need to understand cardholder data handling, tokenisation, and audit log requirements — other teams rarely encounter compliance constraints in their daily design work and the content would not be relevant to their services",
        "Add compliance as an optional reading list item with links to the PCI-DSS specification, SOX Section 404 guidance, and relevant internal policy documents so engineers can self-study the regulatory landscape if they are interested or if their current project touches compliance-sensitive functionality",
        "Include a design-focused module that covers how compliance shapes specific design decisions such as audit event schemas, data isolation boundaries, and retention patterns — rather than compliance rules in the abstract — and coordinate with the security team to avoid duplication",
        "Leave compliance topics entirely to the security team's separate training programme since PCI-DSS and SOX are regulatory frameworks that fall outside the scope of solution design curriculum, and duplicating compliance training across programmes creates inconsistency in how requirements are communicated to engineers",
        "Include a comprehensive compliance certification module that covers all twelve PCI-DSS requirements, SOX Section 404 controls, and data protection regulations in full detail so engineers understand the complete regulatory landscape rather than just the design implications of a subset of requirements"
      ],
      "ans": 2,
      "fb": "PCI-DSS compliance profoundly shapes design decisions on a BaaS platform — audit schemas, tenant data isolation, retention — and engineers need to understand those design implications to do Level 3 work. The Expert's curriculum decision is to teach compliance as a design constraint, not as a legal checklist, and to coordinate with the security team to avoid redundancy. Leaving it out entirely (A) creates engineers who make non-compliant design choices. A full certification module (B) is out of scope for a design curriculum. Optional reading (D) does not build reliable competency. Restricting it to payments (E) ignores cross-cutting concerns on a multi-tenant BaaS platform.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 4,
      "q": "Six months after launching the Solution Design curriculum, quiz placement data shows engineers are advancing from Level 2 to Level 3 at roughly the expected rate, but almost none are reaching Level 4. The Level 3 modules have high satisfaction scores. What is the most likely explanation and what should you investigate first?",
      "opts": [
        "Level 4 is genuinely very difficult and requires years of experience that cannot be accelerated through curriculum design — the plateau at the Level 3 to Level 4 boundary is expected and reflects the natural distribution of engineering talent",
        "Add more Level 3 modules covering additional scenarios and edge cases to give engineers a longer and deeper experience at that level before they attempt the Level 4 boundary, since the transition requires more foundational depth",
        "The high satisfaction scores for Level 3 content indicate the modules are too comfortable — engineers feel good about the material but are not being challenged enough to develop the judgment and leadership skills that Level 4 demands",
        "The placement quiz is likely miscalibrated at the Level 3 and Level 4 boundary — investigate whether Level 4 questions are significantly harder than intended or test skills that the curriculum does not address, and recalibrate accordingly",
        "Investigate whether the Level 3 curriculum covers the competencies that actually gate Level 4 progression, and whether engineers have opportunities to practise Level 4 behaviours such as leading cross-team design sessions in their real work"
      ],
      "ans": 4,
      "fb": "High satisfaction at Level 3 with a plateau at Level 4 is a classic sign that the curriculum is teaching the content of Level 3 but not developing the behaviours needed for Level 4. Level 4 competencies — leading cross-team design sessions, identifying systemic risk, proposing consolidation — require opportunities to practise in real work; they cannot be developed in a classroom alone. The Expert investigates whether those opportunities exist and whether the Level 3 curriculum bridges to them. Quiz miscalibration (C) is worth checking but is a secondary hypothesis. Adding more Level 3 content (E) deepens where engineers already are rather than bridging the gap. Treating the plateau as expected (A) dismisses evidence without investigation.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 4,
      "q": "You have built a Solution Design curriculum and run it for a year. A VP of Engineering asks you to demonstrate its ROI. You have placement quiz data, workshop attendance records, and satisfaction scores. Which approach best demonstrates meaningful impact?",
      "opts": [
        "Ask engineers to complete a self-assessment survey reporting whether the curriculum improved their design confidence, decision-making speed, and architectural reasoning, then aggregate and present the anonymised results",
        "Show a graph of placement level distribution before and after the programme, correlated with a reduction in architecture-related incidents and rework identified in post-mortems",
        "Present the average satisfaction score across all modules — 4.3 out of 5.0 — alongside the total number of engineers who completed the programme and the completion rate percentage as evidence of programme engagement and reach",
        "Count ADRs written by curriculum attendees versus non-attendees, then compare quality scores from guild reviews to demonstrate measurable improvement in documentation practices",
        "Show that the curriculum cost less per engineer than external training providers, demonstrating fiscal efficiency and responsible use of the engineering development budget"
      ],
      "ans": 1,
      "fb": "ROI for a skills programme requires connecting learning outcomes to business outcomes. Level distribution movement from placement data is a leading indicator; reduced architecture-related incidents and rework from post-mortems are lagging indicators that connect skill improvement to real impact. Satisfaction scores (A) measure engagement, not learning or impact. ADR count (C) measures activity, not quality. Self-reported confidence (D) is subjective and susceptible to the Dunning-Kruger effect. Cost comparison (E) measures efficiency, not value. The Expert frames impact in terms the VP cares about: the quality of engineering decisions and their downstream effects.",
      "context": {}
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 2,
      "q": "A PCI-DSS auditor asks your team to produce a data flow diagram showing how cardholder data moves through the platform. Which artifact best satisfies this requirement?",
      "opts": [
        "A system-level data flow diagram annotated with trust boundaries, encryption in transit, and storage classification for each data element",
        "A sequence diagram showing every internal API call between microservices in the payment pipeline, including request payloads and timeout configurations",
        "A network topology diagram showing GKE pod-to-pod communication paths, including ingress controllers, network policies, and firewall rules between data zones",
        "A Kafka topic map showing all producers and consumers for payment-related events, including partition assignments and data classification of each topic",
        "An OpenAPI specification for each service that handles payment data, annotated with field-level data classification tags for cardholder data elements"
      ],
      "ans": 0,
      "fb": "PCI-DSS Requirement 1 mandates network diagrams and data flow diagrams that show all cardholder data flows, including trust boundaries and controls at each boundary. An annotated system-level DFD with encryption status and storage classification directly addresses this. Sequence diagrams are too granular and implementation-focused. OpenAPI specs describe interfaces, not data movement. Network topology and Kafka maps are partial views that miss the end-to-end cardholder data scope auditors require.",
      "context": {
        "PCI-DSS Req 1.2.4": "Maintain accurate network diagrams that show all connections to cardholder data environment",
        "PCI-DSS Req 1.2.1": "Document all services, protocols, and ports including business justification"
      }
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 2,
      "q": "During a SOX audit, the auditor asks how your platform ensures that no single engineer can both approve and deploy a change to a financial calculation service. Which design control directly addresses this segregation-of-duties requirement?",
      "opts": [
        "Storing all deployment audit logs in Cloud Logging with a 7-year retention policy and automated alerting on deployment activity outside approved change windows",
        "Enforcing a minimum of two PR reviewers in GitHub branch protection rules, with CODEOWNERS requiring domain experts to approve financial calculation changes",
        "Running automated tests on every PR that validate financial calculation correctness using property-based testing, achieving 95% coverage on financial logic",
        "Requiring all financial service changes to include an ADR signed off by a principal architect, documenting business justification and rollback plan for each change",
        "Requiring separate individuals to hold the 'approve PR' and 'trigger production deployment' roles, enforced by your CI/CD pipeline and RBAC"
      ],
      "ans": 4,
      "fb": "Segregation of duties (SOD) for SOX requires that approval and execution of a control are performed by different individuals, enforced by a system control rather than convention. Separating the 'approve' and 'deploy' roles in RBAC, enforced by the pipeline, is the canonical SOD control. Two reviewers alone does not prevent the same person from approving and deploying if they hold deployment rights. Automated tests, ADRs, and audit logs are good complementary controls but do not enforce SOD by themselves.",
      "context": {
        "SOX Section 404": "Management must assess internal controls over financial reporting",
        "SOD principle": "No single individual should control all phases of a transaction"
      }
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 2,
      "q": "A regulator requests evidence that your multi-tenant platform correctly isolates one tenant's financial data from another in the event of a code defect. You have row-level security (RLS) in PostgreSQL and tenant context propagated via a Spring interceptor. What is the most compelling evidence package to produce?",
      "opts": [
        "An architecture diagram showing the row-level security layer between the application and the database, annotated with the Spring interceptor's tenant context injection point and the PostgreSQL policy enforcement boundary for each table",
        "The OpenAPI specifications for all tenant-scoped endpoints, annotated with the tenant ID parameter, request validation rules, and response filtering logic that ensures each API response contains only data belonging to the authenticated tenant",
        "Database query logs exported from Cloud SQL audit logging showing that all queries executed against tenant-scoped tables include a tenant_id predicate in the WHERE clause, demonstrating consistent application-level enforcement of data isolation",
        "A penetration test report from an accredited third party demonstrating failed cross-tenant data access attempts, alongside RLS policy definitions and integration test results that assert isolation",
        "A detailed description of the Spring interceptor source code that extracts the tenant ID from the JWT token on every inbound request and sets it in a ThreadLocal variable, which the JPA repository layer uses to append tenant filtering to all queries"
      ],
      "ans": 3,
      "fb": "Regulators require evidence that controls are effective, not just that they exist. A penetration test from an accredited party provides independent validation of the isolation claim. Combined with RLS policy definitions (the control design) and integration tests (continuous verification), this constitutes a defence-in-depth evidence package. OpenAPI specs and architecture diagrams describe intent, not effectiveness. Query logs are incomplete without proof they are exhaustive. Spring interceptor code shows one layer but not the database-level enforcement that prevents bypassed application code from leaking data.",
      "context": {
        "Control design vs. operating effectiveness": "Auditors assess both whether a control is designed correctly and whether it actually operates",
        "Defence in depth": "Multiple independent controls are more credible than a single mechanism"
      }
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 2,
      "q": "Your platform processes payment events via Kafka. An auditor asks: what happens to a payment event if the consumer crashes after committing the Kafka offset but before persisting the database record? How should you document this failure mode for a regulatory response?",
      "opts": [
        "State that Kafka's at-least-once delivery guarantee ensures the payment event message will eventually be re-delivered to a healthy consumer instance after a crash, since the broker retains uncommitted messages and reassigns partitions during consumer group rebalancing, preventing any permanent data loss",
        "State that Cloud SQL's ACID transaction guarantees prevent data loss for any record that has been successfully written, since PostgreSQL's write-ahead log ensures durability even in the event of a crash immediately after the COMMIT statement completes",
        "State that the platform uses database transactions coordinated with Kafka offset commits, so either both the offset commit and the database write succeed atomically or neither does, ensuring no gap exists between message acknowledgement and data persistence",
        "Acknowledge the at-most-once loss window, document the compensating control (idempotency key on re-insertion and a reconciliation job that detects gaps using sequence numbers), and quantify the maximum exposure window based on consumer commit interval",
        "Describe the Kafka consumer group rebalancing mechanism that automatically reassigns orphaned partitions to healthy consumer instances, ensuring that a crashed consumer's workload is picked up by surviving members of the group within the session timeout window"
      ],
      "ans": 3,
      "fb": "This is the classic at-most-once loss scenario: offset committed, application crashed, message not persisted. The honest and correct regulatory response acknowledges the gap exists, then documents the compensating controls that bound and detect it. Idempotency keys and reconciliation jobs are the standard mitigation pair. Quantifying the maximum exposure window (commit interval) shows the risk is understood and bounded. Option A is wrong — at-least-once means the broker will re-deliver uncommitted offsets, not committed ones. Option C is irrelevant to the Kafka commit/DB write ordering problem. Option D describes recovery mechanics, not the failure mode. Option E describes a 2-phase commit that the question explicitly rules out by the scenario.",
      "context": {
        "Commit interval": "If offset is committed before DB write, a crash in between loses the event",
        "Reconciliation": "A batch job that compares expected sequence against persisted records can detect gaps"
      }
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 2,
      "q": "A PCI-DSS QSA asks you to demonstrate how your system detects and alerts on anomalous access to cardholder data — for example, an internal service suddenly querying 10x more records than its baseline. Which design best satisfies this requirement?",
      "opts": [
        "A combination of Cloud SQL data access audit logs ingested into a SIEM, with anomaly detection rules that alert when per-service query volume exceeds a rolling baseline threshold, linked to an incident response runbook",
        "Configure Cloud Monitoring alerts on total Cloud SQL connection count spikes that exceed the baseline by more than 50%, with notification channels routed to the on-call engineer's PagerDuty rotation and a linked runbook for connection pool exhaustion diagnosis",
        "Require all engineers with Cloud SQL access to review the audit logs weekly, sign off on a compliance checklist confirming that no anomalous query patterns were detected, and file the signed attestation in the compliance evidence repository for PCI-DSS retention",
        "Enable Cloud SQL audit logs with a comprehensive logging policy that captures all data access statements, then store them in Cloud Logging with a 7-year retention policy to satisfy PCI-DSS Requirement 10 for log availability and preservation",
        "Implement application-level logging within each service that records every SQL query executed against cardholder data tables, including the query text, execution time, row count, and requesting service identity, stored in the service's own PostgreSQL audit schema"
      ],
      "ans": 0,
      "fb": "PCI-DSS Requirement 10 requires automated log review and alerting on anomalies — manual weekly review does not satisfy automated detection. A SIEM with anomaly detection rules on per-service access volume directly meets the spirit and letter of the requirement. Storing logs without alerting satisfies retention but not detection. Total connection count is too coarse a signal to detect per-service data over-access. Application-level logs in the service's own database create a conflict of interest and are not independent audit evidence. The SIEM approach provides independent evidence and automated detection.",
      "context": {
        "PCI-DSS Req 10.7": "Detect and alert on failures of critical security controls",
        "PCI-DSS Req 10.6": "Review logs and security events to identify anomalies"
      }
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 2,
      "q": "During preparation for a regulatory examination, counsel asks you to produce a written response explaining how the system handles a scenario where a Kafka consumer processes a payment event, the downstream bank rejects the payment, but the rejection message is lost before the platform records it. The regulator's concern is undetected financial exposure. What is the architecturally correct response?",
      "opts": [
        "Explain that the platform's at-least-once Kafka delivery guarantee ensures the bank's rejection message will eventually arrive and be processed by the consumer, since the Kafka broker retains all messages until they are acknowledged, and consumer group rebalancing ensures orphaned partitions are reassigned to healthy instances within the session timeout window",
        "Describe the end-to-end idempotency design: the payment is held in a PENDING state, a reconciliation process polls the bank's status API for any event that has not transitioned within an SLA window, and a dead-letter process escalates unresolvable cases with an audit trail — quantifying the maximum undetected exposure window",
        "State that TLS encryption in transit between the bank's API gateway and the platform's ingress controller prevents messages from being intercepted, corrupted, or lost during network transmission, ensuring the integrity and confidentiality of all payment status communications between the external banking partner and the internal processing pipeline",
        "Describe the retry policy configured on the Kafka consumer that processes bank response messages, including the exponential backoff configuration with a maximum of 5 retries, 1-second initial delay, and 2x multiplier, which ensures transient failures in processing bank responses are automatically recovered without manual intervention",
        "Explain that Kafka's durable commit log means the bank's rejection message is persisted to disk with configurable replication across broker nodes, so the message can always be replayed from the broker's log by resetting the consumer group offset to the timestamp when the rejection event was originally published"
      ],
      "ans": 1,
      "fb": "The failure mode here is that the external bank's rejection response is lost before the platform receives or persists it — this is outside Kafka's delivery guarantees, which only apply to the internal broker. The correct architectural response is a reconciliation loop against the authoritative external source (the bank's status API), combined with a PENDING state that forces explicit resolution. Quantifying the SLA window bounds the maximum exposure period. Options A and B misapply Kafka guarantees to a channel external to the broker. TLS prevents eavesdropping but not message loss. Retry policy addresses internal consumer retries, not external response loss. A regulator will specifically probe whether the platform detects unprompted failures — reconciliation is the answer.",
      "context": {
        "External channel reliability": "Kafka guarantees apply only within the broker; external HTTP responses are a separate reliability domain",
        "PENDING state pattern": "Holds a transaction in an unresolved state until positive confirmation or timeout-triggered reconciliation"
      }
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 2,
      "q": "Your engineering leadership is asked by a regulator to provide a formal written response to the question: 'How does your platform ensure that a change to a financial calculation cannot be deployed to production without a complete audit trail from code commit to live service?' You must write a response that is both technically accurate and audit-defensible. Which response is strongest?",
      "opts": [
        "Describe the automated test suite that runs on every pull request, including unit tests for financial calculation correctness, integration tests against a containerised PostgreSQL instance, and contract tests that verify API compatibility — combined with code coverage thresholds of 90% for financial modules that must be met before the PR can be merged into the main branch",
        "Describe the Git branching strategy using trunk-based development with short-lived feature branches, explaining that all changes go through pull requests with required reviewer approvals, automated status checks, and branch protection rules that prevent direct pushes to main — providing a clear governance trail from code authorship through peer review to merge",
        "State that all production deployments are logged in Cloud Logging with timestamps, deployer identity extracted from the GKE service account, the container image digest that was deployed, and the Kubernetes namespace and deployment resource that was updated — with logs retained for 7 years to satisfy SOX audit evidence requirements for change management controls",
        "Provide a control narrative describing the end-to-end chain: signed commits linked to a PR with required approvals, a CI pipeline that produces a provenance attestation (SLSA), an image registry that stores signed artefacts, and a GKE deployment that rejects unsigned images — with audit log evidence retained for the required period and a quarterly control test",
        "Reference the company's formal change management policy document and IT general controls framework, stating that all changes to financial calculation services follow the documented approval workflow, and provide the policy document version number, last review date, and the name of the executive sponsor who approved the current revision of the change management process"
      ],
      "ans": 3,
      "fb": "An audit-defensible response must demonstrate a verifiable, tamper-resistant chain of custody from source code to production — not just describe process or point to a policy. The strongest response narrates the technical control chain (signed commits to approved PR to provenance attestation to signed image to admission control) with evidence retention and periodic control testing. This satisfies the auditor's need to see both control design and operating effectiveness. A branching strategy and policy document describe intent. Deployment logs provide partial evidence but not the full chain. Test coverage addresses quality, not integrity of the deployment chain. SLSA-based provenance is increasingly the standard regulators expect for software supply chain integrity.",
      "context": {
        "SLSA": "Supply-chain Levels for Software Artifacts — a framework for attestation of build provenance",
        "Control narrative": "A written description of who does what, when, and how evidence is retained — required for audit responses"
      }
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 3,
      "q": "You are asked to lead a technical debt assessment across the platform. What is the correct first step before scoring or sequencing any remediation work?",
      "opts": [
        "Identify the three highest-traffic services on the platform and focus the technical debt assessment exclusively on those, since they carry the most operational risk and any debt in high-traffic paths has the greatest probability of causing production incidents",
        "Ask each team to estimate story points for rewriting or refactoring their most painful services, then aggregate the estimates into a total effort figure and use that as the basis for the roadmap timeline and resource allocation request to leadership",
        "Establish a consistent taxonomy for classifying technical debt (e.g. architecture debt, design debt, code debt, test debt, operational debt) so that findings across teams can be compared and prioritised on the same scale",
        "Run static analysis tools such as SonarQube and dependency vulnerability scanners across all repositories, sort the findings by severity and fix effort, and use the aggregated results as the primary input for the technical debt assessment and remediation prioritisation",
        "Interview the most senior engineers across each team about which parts of the codebase they are most afraid to change, since their institutional knowledge and instinctive risk assessment provides the most accurate signal about where critical technical debt is concentrated"
      ],
      "ans": 2,
      "fb": "A structured assessment requires a shared language before any scoring or sequencing can be meaningful. Without a consistent taxonomy, teams will report debt in incomparable terms — one team's 'high' is another's 'medium', and architectural drift cannot be compared with test coverage gaps. Establishing a taxonomy first ensures the assessment produces a comparable, actionable dataset. Story point estimates and static analysis are useful inputs but cannot be compared across teams without a shared framework. Engineer interviews surface valuable signal but are anecdotal without structure. Focusing only on high-traffic services produces an incomplete picture and misses high-risk low-traffic paths such as compliance-critical flows.",
      "context": {
        "Debt taxonomy": "Common categories: architecture, design, code, test, documentation, operational, dependency",
        "Comparability": "Assessments that lack a shared scale cannot produce a defensible prioritisation"
      }
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 3,
      "q": "When sequencing a technical debt remediation roadmap, which factor most strongly justifies placing a debt item early in the sequence — ahead of items with higher remediation cost?",
      "opts": [
        "The item is in the service with the largest team, meaning more engineers are affected and remediation yields the highest return in total developer hours saved",
        "The item has the most TODO comments in the codebase, indicating widespread awareness that the code is problematic and high frustration affecting team morale",
        "The debt item is a blocking dependency for multiple higher-priority improvements, so deferring it compresses the value of subsequent items",
        "The item was introduced longest ago and has accumulated compound interest through workarounds, making it progressively harder to remediate over time",
        "The item was raised by the most senior engineer, whose experience provides the strongest signal about which items pose the greatest risk to maintainability"
      ],
      "ans": 2,
      "fb": "Sequencing a roadmap requires understanding dependency chains, not just individual item cost or age. A blocking dependency that gates multiple downstream improvements has a multiplier effect: its deferral delays not just its own resolution but everything that depends on it. This is the classic 'pebble in the stream' pattern — small foundational changes that unlock large subsequent value. Age, team size, seniority of the raiser, and comment volume are all weak signals with no necessary relationship to remediation sequencing logic.",
      "context": {
        "Critical path": "The sequence of dependencies that determines the minimum project duration",
        "Opportunity cost": "Deferring a blocking item delays all dependent improvements simultaneously"
      }
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 3,
      "q": "You are producing a technical debt assessment for a platform that has accumulated significant schema coupling — multiple services share the same PostgreSQL schema and write directly to each other's tables. How should you represent this in the roadmap to make the business case for remediation?",
      "opts": [
        "Recommend that all services sharing the PostgreSQL schema be immediately rewritten to use separate databases with clearly defined service-to-service APIs, eliminating the coupling entirely in a single coordinated migration effort — schedule a 3-month programme where all affected teams dedicate 100% of their capacity to the schema separation work",
        "Describe the schema coupling in technical terms — shared tables, cross-service foreign keys, and direct writes — and present the findings to engineering managers, asking them to assess the priority relative to their team's feature roadmap and allocate remediation capacity based on their own judgment of urgency and team bandwidth",
        "Frame the debt as an incident risk multiplier: show historical incidents where schema coupling caused cascading failures, estimate the blast radius of the next likely incident, and model the cost of continued coupling (incident cost times frequency) against the one-time remediation cost",
        "Add the schema coupling as an individual line item in the engineering backlog with a medium priority label, and flag it for consideration during the next quarterly planning cycle when teams reassess their technical improvement commitments alongside feature delivery targets — include a brief description of the coupling pattern for context",
        "List each shared table as a separate technical debt item in a spreadsheet with an estimated refactoring cost in developer-days, the owning team, the services that depend on it, and a difficulty rating — then sort by cost and present the spreadsheet to leadership as the remediation roadmap, working through items from cheapest to most expensive"
      ],
      "ans": 2,
      "fb": "To make a credible business case at authority level, technical debt must be expressed in terms leadership can act on: risk, cost, and expected value of remediation. Framing coupling as an incident risk multiplier — with historical evidence, blast radius modelling, and a cost comparison — converts an abstract technical concern into a decision with quantified stakes. Listing tables as individual items fragments the narrative and loses the systemic risk picture. Recommending immediate full rewrites lacks a phased approach and will not be funded. Delegating priority assessment to managers without a structured framing abdicates the authority responsibility. Backlog-and-defer is the pattern that created the debt in the first place.",
      "context": {
        "Schema coupling blast radius": "A migration on a shared schema can break all services writing to it simultaneously",
        "Cost of delay": "Debt that increases incident frequency has a compounding cost that can be quantified"
      }
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 3,
      "q": "Your technical debt roadmap proposes decomposing a large monolithic Spring Boot service into smaller services over 18 months. Leadership asks how you will ensure the platform does not degrade during the transition. What sequencing principle should anchor the roadmap?",
      "opts": [
        "Run both the monolith and extracted services simultaneously in production indefinitely, maintaining dual routing to eliminate cutover risk but requiring permanent maintenance of both codebases",
        "Extract the highest-traffic endpoints first to maximise early performance gains and demonstrate visible impact to stakeholders, since the most-trafficked endpoints benefit most from independent scaling and dedicated resource allocation in GKE",
        "Extract the simplest and most independent services first to build team confidence and establish extraction patterns before tackling the complex core domains that have deep coupling and shared database dependencies across service boundaries",
        "Sequence extractions so that each phase leaves the system in a fully operational, independently deployable state — using strangler fig with feature flags and parallel-run validation before cutting over",
        "Freeze all feature development on the monolith for the duration of the 18-month decomposition to avoid the complexity of building new features in a codebase that is simultaneously being dismantled and migrated to a new service architecture"
      ],
      "ans": 3,
      "fb": "The strangler fig pattern with incremental cut-overs is the canonical approach to safe decomposition: each extraction leaves the system shippable, no phase produces a half-migrated state that blocks production. Feature flags allow parallel running with rollback, and parallel-run validation confirms correctness before traffic switches. Extracting high-traffic endpoints first optimises for performance but ignores correctness risk. Extracting simple services first is a reasonable heuristic but insufficient as a sequencing principle — it does not guarantee operational continuity. Freezing feature development for 18 months is commercially unacceptable. Running both indefinitely is not a transition strategy; it doubles operational complexity.",
      "context": {
        "Strangler fig": "Incrementally replace components by routing traffic to new implementations while the old one still runs",
        "Parallel run": "Both old and new implementations process the same requests; outputs are compared before cutover"
      }
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 3,
      "q": "A technical debt assessment identifies that 40% of the platform's Kafka consumers lack idempotency guards, creating a risk of duplicate financial records during rebalancing. How should you scope and sequence the remediation in the roadmap?",
      "opts": [
        "Recommend switching to Kafka's exactly-once semantics (EOS) as a platform-wide configuration change that eliminates the need for consumer-level idempotency guards entirely, since EOS ensures each message is processed exactly once through the transactional producer and consumer API without requiring application-level deduplication logic",
        "Accept the risk of duplicate financial records as a known platform limitation, document it in an Architecture Decision Record with a risk acceptance rationale, and rely on the daily reconciliation process to detect and correct any duplicate postings that occur during consumer group rebalancing events",
        "Ask each team that owns a Kafka consumer to prioritise adding idempotency guards in their own sprint backlog, since the teams closest to the code understand their consumer's specific deduplication requirements and are best positioned to implement the appropriate pattern for their domain context",
        "Triage consumers by financial impact: address consumers that write financial records first with idempotency keys and deduplication logic, then address non-financial consumers in order of blast radius, with each phase gated by integration tests that inject duplicate events",
        "Schedule a single focused 2-week sprint where all teams simultaneously add idempotency keys and deduplication logic to their Kafka consumers, coordinated through a shared Slack channel and daily standups to ensure consistent implementation patterns across all 40% of consumers that currently lack guards"
      ],
      "ans": 3,
      "fb": "Risk-based sequencing is the correct approach: financial record consumers carry the highest regulatory and financial exposure and must be remediated first. Gating each phase with integration tests that inject duplicate events confirms the control is working before moving on — this is the kind of evidence trail that supports both operational confidence and potential audit inquiries. A single sprint for all consumers creates a large parallel change risk with many untested interactions. Platform-wide EOS is a valid long-term goal but is a significant infrastructure change that does not address existing consumers quickly. Accepting the risk for financial data is not defensible under PCI-DSS/SOX. Delegating to individual team backlogs without a coordinated roadmap means the highest-risk items may never be addressed.",
      "context": {
        "Idempotency key pattern": "Store the event ID; reject or ignore re-insertions of the same ID",
        "EOS (exactly-once semantics)": "Kafka's transactional producer/consumer API — eliminates duplicates but requires infrastructure and code changes"
      }
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 3,
      "q": "You present a technical debt roadmap to the CTO. The roadmap recommends 6 months of primarily debt remediation with limited new feature work. The CTO pushes back, arguing that the business cannot afford 6 months without feature delivery. How should you respond to maintain the integrity of the assessment while accommodating the business constraint?",
      "opts": [
        "Agree to defer all technical debt remediation work until after the next major product release to avoid creating conflict with the CTO's feature delivery priorities, then revisit the debt roadmap during the subsequent planning cycle when there may be more appetite for infrastructure investment — maintaining the relationship with the CTO is critical for long-term architectural influence",
        "Reduce the debt roadmap from 6 months to 3 months by cutting the lower-priority debt items from the scope and explicitly accepting the residual risk of the items that remain unaddressed, presenting the CTO with a revised timeline that accommodates continued feature delivery alongside a reduced but focused debt remediation effort",
        "Escalate the disagreement to the board's risk committee, framing the technical debt as a risk management decision that requires board-level visibility — present the quantified risk of not remediating the debt, including projected incident costs and velocity degradation, so the board can override the CTO's objection with an informed risk assessment",
        "Propose that the debt roadmap be handed to a dedicated platform engineering team that operates independently from the product feature teams, so product teams can continue feature work uninterrupted while the platform team focuses exclusively on debt remediation — this separation ensures neither track blocks the other and both can proceed at full velocity",
        "Propose an interleaved model: each sprint allocates a fixed percentage of capacity to debt remediation (e.g. 30%) run in parallel with feature work, with explicit checkpoints where debt reduction metrics are reviewed and the allocation adjusted — and show the model's projected impact on feature velocity over time as debt is reduced"
      ],
      "ans": 4,
      "fb": "The authority-level skill here is bridging technical integrity with business reality. An interleaved model with a fixed capacity allocation is the canonical resolution: it does not abandon the debt work (which would leave the risk unaddressed) but makes it compatible with continued feature delivery. Showing how reduced debt improves future velocity reframes remediation as investment, not cost — which is the persuasive framing for a CTO. Cutting items to fit a timeline ignores the risk rationale that justified their inclusion. Deferring all debt work perpetuates the cycle that created the problem. Escalating to the board is disproportionate for this decision. A separate platform team can work for some categories of debt but is not a universal answer and often creates coordination overhead that slows both tracks.",
      "context": {
        "Debt remediation capacity model": "A sustained 20-30% allocation compounds into significant debt reduction over quarters without blocking features",
        "Velocity impact of debt": "Studies consistently show that unaddressed architectural debt reduces feature delivery speed over time"
      }
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 3,
      "q": "You are finalising a structured technical debt assessment for the platform. The document will be reviewed by engineering leadership, product leadership, and the board's risk committee. Which structure makes the document most effective across all three audiences?",
      "opts": [
        "An executive summary with risk and cost framing, a prioritised roadmap with business justification for each phase, and a technical appendix with architectural detail — each section written for its audience with explicit cross-references",
        "A slide deck with one slide per debt item, sorted by team ownership and colour-coded by severity, presented in the same format to all three audiences to ensure consistent messaging",
        "Three separate documents written independently for each audience, each tailored to their vocabulary and concerns without shared structure or cross-references between them",
        "A single detailed technical appendix containing code examples, architectural diagrams, sequence flows, and database schema comparisons for each debt item, presented in its entirety to all three audiences so everyone has access to the full technical evidence base and can draw their own conclusions",
        "A spreadsheet with debt items scored 1-5 for severity, effort, and risk, with pivot tables that allow each audience to sort by their preferred dimension for transparency"
      ],
      "ans": 0,
      "fb": "A well-structured assessment for a mixed audience requires layered communication: the executive summary speaks to risk and investment in terms the board's risk committee and product leadership can act on; the prioritised roadmap with business justification bridges technical and product leadership; the technical appendix gives engineering leadership the depth to challenge and validate the analysis. Cross-references allow any reader to drill into detail without wading through it. A single technical document is inaccessible to non-engineers. A per-item slide deck fragments the systemic narrative. A spreadsheet conveys scores but not reasoning. Separate independent documents create inconsistency and prevent cross-audience alignment, which is critical when seeking board-level approval for remediation investment.",
      "context": {
        "Layered documentation": "Executive summary then decision-maker narrative then technical evidence — each layer self-contained but linked",
        "Risk committee framing": "Boards respond to quantified risk, not technical descriptions; frame debt as likelihood times impact"
      }
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 0,
      "q": "You are preparing a cross-team design session to align the Payments and Ledger teams on a new reconciliation flow. The two teams have never worked together on a shared design. What is the most important thing to establish before the session begins?",
      "opts": [
        "Conduct a detailed comparison of each team's technology stack — frameworks, database versions, messaging libraries — to identify compatibility issues that could block integration during the reconciliation flow design session",
        "Prepare a detailed technical proposal with sequence diagrams and API contracts that both teams can review, comment on, and approve before the session, so the meeting time is spent refining rather than brainstorming from scratch",
        "Establish a voting mechanism with clear rules — majority wins with the session facilitator breaking ties — so that any disagreements during the design session can be resolved quickly without derailing the agenda into extended debate",
        "A shared glossary of domain terms — both teams must agree on what 'reconciliation', 'settlement', and 'posting' mean in this context before any design discussion can be productive",
        "Create a structured agenda that allocates equal speaking time to each team member, with a timekeeper to enforce the slots, ensuring that both teams have fair representation and no single voice dominates the design conversation"
      ],
      "ans": 3,
      "fb": "Cross-team design sessions fail most often because of vocabulary mismatch, not technical disagreement. If the Payments team means 'settlement' as a batch process and the Ledger team means it as a real-time event, the session will produce apparent agreement that collapses during implementation. Establishing a shared glossary forces alignment on meaning before alignment on design. A detailed proposal (A) is premature without shared language. Stack comparison (C) is useful but secondary. Voting (D) produces winners and losers, not coherence. Equal speaking time (E) is procedural fairness but does not address semantic misalignment.",
      "context": {}
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 0,
      "q": "During a cross-team design session, you notice that one team's lead architect is dominating the discussion while engineers from the other team have stopped contributing. The session is halfway through with key decisions still unmade. What should you do?",
      "opts": [
        "End the session early because the dynamic is unproductive, and reschedule with a smaller group of only the lead architects from each team",
        "Interrupt and ask the quiet team to present their current architecture before continuing, so both perspectives are on the table",
        "Let the discussion continue because the dominant architect clearly has the most experience and their perspective should carry more weight in the decisions",
        "Switch to a written design document format where both teams contribute asynchronously, and cancel future live sessions since the dynamic is unproductive",
        "Send a private Slack message to the quiet team's lead asking them to speak up and contribute more actively rather than redirecting the conversation publicly"
      ],
      "ans": 1,
      "fb": "Design coherence requires input from all affected teams. When one team disengages, decisions made in the session will lack their context and constraints, leading to designs that fail at implementation. Interrupting to give the quiet team structured floor time — specifically asking them to present their current architecture — rebalances the conversation with a concrete contribution rather than an abstract 'please speak up'. Letting the dominant voice continue (A) produces a one-sided design. Ending early (C) wastes the progress already made. A private message (D) does not address the group dynamic. Switching entirely to written format (E) abandons the real-time collaboration that cross-team sessions provide.",
      "context": {}
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 0,
      "q": "After a cross-team design session, both teams agree on a design direction. Two weeks later, one team's implementation diverges significantly from what was agreed. What is the Specialist's responsibility?",
      "opts": [
        "Review the diverging implementation to understand why the team deviated — often the agreed design hit a constraint that was not visible during the session — then facilitate a follow-up session to reconcile the design with the new information",
        "Revert the diverging team's implementation changes and require them to follow the original agreed design exactly as documented in the session notes, since design agreements must be treated as binding contracts to maintain cross-team trust and architectural coherence",
        "Report the design divergence to engineering management as a process compliance issue, since teams that agree to a design in a cross-team session and then deviate unilaterally are undermining the collaborative design process and setting a precedent that agreements are not binding",
        "Accept the implementation divergence because the details of how each team implements their service internals are ultimately each team's own responsibility, and cross-team design sessions should only govern the interface contracts, not the internal architecture choices",
        "Send an email to both teams reminding them of the agreed design from the session, attach the session notes and whiteboard photos as evidence, and ask both teams to self-correct any deviations before the next sprint review to maintain alignment"
      ],
      "ans": 0,
      "fb": "Design divergence after a session almost always signals missing information — a constraint that the team discovered during implementation that was not discussed in the session. The Specialist's role is to investigate why the divergence happened, not to enforce compliance blindly. If the original design missed a real constraint, the design needs updating, not the implementation. Reporting to management (A) treats a design problem as a people problem. Reverting changes (C) ignores the constraint that caused the divergence. Accepting it silently (D) abandons design coherence. An email reminder (E) assumes the divergence is carelessness rather than discovery.",
      "context": {}
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 0,
      "q": "You are leading a design session where the Payments team proposes synchronous HTTP calls to the Ledger service for real-time balance checks, but the Ledger team argues that their service cannot meet the latency SLA under peak load. Neither team is willing to compromise. How do you move the design forward?",
      "opts": [
        "Ask both teams to build a time-boxed prototype of their preferred approach — the Payments team implementing the synchronous HTTP call and the Ledger team implementing an async alternative — and reconvene in two weeks to compare real performance data, latency distributions, and failure mode behaviour before committing to either direction",
        "Side with the Ledger team because the service owner should have final authority over their own SLA commitments and resource allocation — if the Ledger team says they cannot meet the latency requirement under peak load, the Payments team must accept that constraint and design their feature around the Ledger's documented capacity limits",
        "Propose an architectural alternative that satisfies both constraints — such as a materialised balance cache maintained by Kafka events from the Ledger, giving Payments sub-millisecond reads without adding synchronous load to the Ledger service — and evaluate the trade-offs of eventual consistency",
        "Escalate the disagreement to the VP of Engineering for a final binding decision, since the two teams have reached an impasse that cannot be resolved at the engineering level and requires leadership authority to break the deadlock and assign accountability for the chosen approach",
        "Side with the Payments team because real-time balance checks are a non-negotiable business requirement driven by the product roadmap and regulatory obligations — the Ledger team should scale their service horizontally on GKE to meet the latency SLA rather than constraining the product's functionality"
      ],
      "ans": 2,
      "fb": "The Specialist's role is to break deadlocks by introducing design alternatives that reframe the trade-off space. A materialised cache fed by Kafka events decouples the Payments team's latency need from the Ledger team's capacity constraint, but introduces eventual consistency that must be evaluated. This is a design contribution, not a compromise — it changes the shape of the problem. Siding with either team (A or B) treats a design problem as a political one. Escalation (D) abdicates the design leadership role. Parallel prototypes (E) burn two sprints without addressing the fundamental architectural tension.",
      "context": {
        "Materialised view": "A read-optimised projection of data maintained by consuming domain events",
        "Eventual consistency trade-off": "Balance cache may be slightly stale; acceptable for reads but not for writes that need strong consistency"
      }
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 0,
      "q": "You lead a design session that produces an agreed architecture for a new feature spanning three services. One team asks: 'Who owns this design going forward? If we need to change an interface, who do we talk to?' What is the correct answer at Specialist level?",
      "opts": [
        "Each team owns their own service boundary and interface changes are communicated via Slack announcements in the shared engineering channel, with each team responsible for updating their consumers when they change their producer API contracts",
        "No single owner is needed because the ADR documents the agreed design decisions and teams should refer to the ADR before making any interface changes — the document serves as the authoritative source of truth and governance mechanism for the shared design",
        "Assign a design owner — typically the Specialist who led the session — who maintains the cross-service design document, reviews interface change proposals, and ensures changes are propagated to all affected teams",
        "The architecture guild collectively owns all cross-team designs and must formally approve every interface change request through the guild's biweekly review process, ensuring that no team can unilaterally alter a shared contract without guild-level oversight",
        "The design is owned by whichever team wrote the most code in the shared flow, since their deeper investment in the implementation gives them the strongest understanding of the interface constraints and the most incentive to maintain design coherence"
      ],
      "ans": 2,
      "fb": "Cross-service designs require an explicit owner who maintains the design as a living document and serves as the coordination point for interface changes. Without this, the design drifts as each team makes local changes without checking cross-service impact. Ownership by code volume (A) is arbitrary. Per-team boundary ownership with Slack communication (B) works for internal changes but fails for shared interfaces. Architecture guild ownership (D) creates a bottleneck that slows all three teams. Relying solely on an ADR (E) assumes the document will be consulted before every change, which experience shows does not happen.",
      "context": {}
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 0,
      "q": "You are reviewing a design proposal from a junior team that introduces a new microservice to handle a function currently embedded in an existing service. The new service would communicate with three other services via REST. You suspect the extraction is premature and adds unnecessary operational complexity. How do you give feedback that maintains design coherence without discouraging the team?",
      "opts": [
        "Ask the team to articulate the specific problem the extraction solves, then evaluate whether that problem can be addressed without a new service — for example, through a module boundary within the existing service — and present the operational cost comparison so the team understands the trade-off",
        "Reject the proposal outright and tell the team to keep the function embedded in the existing service, since premature microservice extraction is a well-known anti-pattern that adds deployment, monitoring, and network complexity without delivering proportional value — the team should focus on feature delivery instead",
        "Suggest the team extract the function as an internal library rather than a network service, packaging the logic as a shared Maven dependency that the existing service and any future consumers can include — this provides code reuse and modularity without introducing network latency, deployment overhead, or distributed system failure modes",
        "Approve the proposal to avoid discouraging the team's architectural initiative, since fostering a culture of microservice thinking is more important than any individual design decision — the team will learn from the experience even if the extraction turns out to be premature, and they can always merge the service back later",
        "Refer the proposal to the architecture guild for a formal review and decision, since a new microservice introduction affects the platform's operational surface area and should be evaluated by the guild's experienced architects rather than decided in a bilateral conversation between the Specialist and the proposing team"
      ],
      "ans": 0,
      "fb": "The Specialist's role is to help teams make well-reasoned decisions, not to approve or reject proposals unilaterally. Asking the team to articulate the problem forces them to examine their own reasoning. Presenting the operational cost comparison — deployment, monitoring, network latency, failure modes — against alternatives like module boundaries within the existing service teaches the trade-off rather than just issuing a verdict. Approving without challenge (A) abandons the design quality role. Rejecting without explanation (B) discourages future initiative. Delegating to the guild (D) avoids the direct feedback responsibility. An internal library (E) is a possible solution but should emerge from the trade-off analysis, not be prescribed.",
      "context": {}
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 0,
      "q": "You are leading a design session for a new multi-tenant billing feature. Mid-session, a senior engineer raises a concern that the proposed design does not account for a regulatory requirement specific to one tenant's jurisdiction. Addressing it would require significant changes to the data model. The session has limited time remaining and several other decisions are pending. How do you handle this?",
      "opts": [
        "Tell the team that regulatory concerns are the compliance team's responsibility and are out of scope for solution design sessions — the design session should focus on the technical architecture, and compliance requirements should be handled through a separate compliance review process after the design is finalised",
        "Ask the senior engineer to write up the regulatory requirement in detail and submit it as a separate feature request through the product backlog, so it can be properly scoped, estimated, and prioritised alongside other product work rather than disrupting the current design session's agenda and timeline",
        "Halt the current design session immediately and restart the design process from scratch to fully accommodate the regulatory requirement, since any design that does not account for jurisdiction-specific data model constraints will need to be reworked later at much greater cost and risk of compliance violations",
        "Acknowledge the concern, assess whether it invalidates the core design or can be accommodated as an extension, document it as an open question with a dedicated follow-up session, and proceed with the remaining decisions that are not affected by the regulatory issue",
        "Dismiss the regulatory concern for now because it only affects one tenant's jurisdiction and can be handled as a special case after the core multi-tenant billing design is implemented — jurisdiction-specific requirements should not compromise the simplicity of the platform-wide data model design"
      ],
      "ans": 3,
      "fb": "The Specialist must balance session productivity with design integrity. A regulatory concern that affects the data model is serious and cannot be dismissed (A) or deferred to another team (E). However, halting the session to redesign from scratch (C) wastes the progress on decisions that are unaffected. The correct move is triage: assess whether the concern invalidates the core design or is an extension, document it formally, schedule a dedicated follow-up, and continue with unaffected decisions. This preserves session momentum without sweeping the concern aside. Treating it as a feature request (D) minimises a design-level constraint.",
      "context": {}
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 0,
      "q": "Two teams present competing designs for a new inter-service communication pattern at a guild session. Design A uses Kafka for all communication; Design B uses a mix of synchronous REST for queries and Kafka for events. Both designs are technically sound for their respective team's context, but adopting both creates platform inconsistency. You must facilitate a decision. How do you proceed?",
      "opts": [
        "Defer the decision for six months to observe which communication pattern the teams naturally converge on through organic adoption, since forcing a premature standardisation decision when both patterns are technically sound risks choosing the wrong approach before sufficient production evidence has accumulated to clearly differentiate them",
        "Merge the two designs into a hybrid architecture that uses both Kafka and synchronous REST for every inter-service interaction — events are published to Kafka for asynchronous processing while REST calls provide synchronous query capability, giving consumers the flexibility to choose the access pattern that suits their latency and consistency requirements",
        "Let each team continue using their preferred communication design since both are technically sound and forcing standardisation would create unnecessary migration work — team autonomy over their own service boundaries is more valuable than platform consistency when both approaches meet the functional and non-functional requirements",
        "Establish decision criteria grounded in the platform's actual constraints — latency requirements, failure mode tolerance, operational complexity budget, and the cost of maintaining two patterns — evaluate both designs against these criteria, and produce a documented decision with explicit carve-outs if a single pattern cannot serve all use cases",
        "Choose Design A (Kafka for all communication) as the platform standard because event-driven architecture is a modern best practice endorsed by industry thought leaders, and committing to a fully asynchronous communication model simplifies the platform's operational model by eliminating synchronous coupling between services entirely"
      ],
      "ans": 3,
      "fb": "When two technically sound designs compete, the decision must be grounded in platform-level criteria, not individual team preferences or architectural fashion. Establishing explicit criteria — latency, failure tolerance, operational cost, consistency cost — and evaluating both designs against them produces a decision that is defensible and understandable. Allowing both (A) entrenches inconsistency. Choosing based on 'modern best practice' (B) is not engineering reasoning. A hybrid (D) doubles complexity. Deferring (E) allows the divergence to deepen and makes future standardisation harder.",
      "context": {}
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 0,
      "q": "After leading design sessions for six months, you notice that cross-team designs are consistently agreed in sessions but diverge during implementation. Post-mortems reveal that implementation teams discover edge cases not discussed in sessions. What systemic change should you make to the design process?",
      "opts": [
        "Replace design sessions entirely with written design documents that teams review asynchronously via comments and suggestions in Confluence, since written reviews give engineers time to think deeply about edge cases that surface-level session discussions miss and create a permanent record of the design evolution",
        "Make design sessions longer — extending from one hour to three hours — to provide sufficient time for covering edge cases, interface details, and failure modes that are currently being missed due to time pressure, with structured breakout groups for deep-diving into specific integration points",
        "Require implementation teams to follow the agreed design exactly as documented in the session notes, reporting any edge cases they discover as bugs against the design specification rather than unilaterally diverging — this maintains design coherence and creates a feedback loop that improves future session quality",
        "Add more senior principal engineers and architects to the design sessions to increase the collective experience in the room, since senior engineers are more likely to anticipate edge cases and integration issues based on their broader platform knowledge and pattern recognition from prior similar designs",
        "Introduce a structured 'design spike' phase between the session and full implementation — a time-boxed period where teams prototype the riskiest interfaces and validate assumptions before committing to the design — with a brief reconvene to update the design based on findings"
      ],
      "ans": 4,
      "fb": "The pattern of session agreement followed by implementation divergence indicates that design sessions are too abstract — they agree on high-level shapes but do not validate at the interface level. A structured design spike between session and implementation lets teams discover edge cases in code before committing, and a brief reconvene integrates those findings back into the design. Longer sessions (A) add fatigue without adding implementation reality. Enforcing exact compliance (B) ignores legitimate discoveries. More seniority (D) helps but does not close the session-to-implementation gap. Purely written reviews (E) lose the real-time collaboration that sessions provide for cross-team alignment.",
      "context": {}
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 1,
      "q": "Your team's Ledger service is experiencing increasing read latency as the transaction table grows. Product requires sub-100ms reads for recent account balances. Which architectural pattern best addresses this without affecting write throughput?",
      "opts": [
        "Implement CQRS by maintaining a separate read model optimised for balance queries, updated asynchronously via Kafka events from the Ledger write model",
        "Add a database materialised view on the transaction table that refreshes hourly with latest balances, providing pre-computed reads that avoid full history scans",
        "Add PostgreSQL read replicas in Cloud SQL to distribute query load, with application-level routing directing balance queries to replicas and writes to primary",
        "Cache all account balances in application memory using Caffeine and invalidate on writes, providing near-instant reads without database round-trips",
        "Vertically scale the Cloud SQL instance to a larger machine type with more CPU and memory, increasing capacity for concurrent reads alongside writes"
      ],
      "ans": 0,
      "fb": "CQRS separates the read and write models so each can be optimised independently. A dedicated read model for balance queries — maintained by consuming Kafka events — allows the read path to use a denormalised structure optimised for the access pattern without affecting write throughput. Read replicas (A) distribute load but still query the same schema, which may not be optimised for balance lookups. Hourly materialised views (C) are too stale for real-time balance queries. Application memory cache (D) becomes a consistency problem at scale with multiple pods. Vertical scaling (E) is a temporary fix that does not address the structural problem.",
      "context": {
        "CQRS": "Command Query Responsibility Segregation — separate models for reads and writes",
        "Read model": "A denormalised projection optimised for specific query patterns"
      }
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 1,
      "q": "A team proposes adding a Redis cache in front of their PostgreSQL-backed Account service to reduce read latency. They plan to cache account details with a 5-minute TTL. What is the most important design concern the Specialist should raise?",
      "opts": [
        "The most important design concern is that Redis introduces an additional infrastructure dependency that increases operational complexity — the team must now monitor Redis availability, manage Redis Sentinel or Cluster configuration, and maintain a separate on-call playbook for Redis-specific incidents alongside PostgreSQL operations",
        "The cache invalidation strategy must be defined: what happens when an account is updated — does the service rely solely on TTL expiry, or does it actively invalidate on writes? Stale reads of financial data within the TTL window may violate consistency requirements.",
        "The 5-minute TTL is too long for financial account data and should be reduced to 30 seconds maximum — shorter TTLs reduce the window during which stale data could be served, bringing the cache's consistency properties closer to what a direct database read would provide",
        "Redis is not ACID-compliant and should never be used as a caching layer alongside PostgreSQL for financial data, since the lack of transactional guarantees means cached values can become inconsistent with the database state during concurrent updates, creating compliance risks",
        "Redis should be replaced with a CDN caching layer such as Cloud CDN or Cloudflare for better global distribution and reduced latency, since CDNs provide built-in cache invalidation APIs, geographic distribution, and can serve account details to clients without routing through the application layer"
      ],
      "ans": 1,
      "fb": "The critical design concern with any cache is the invalidation strategy, especially for financial data. A 5-minute TTL means reads could return stale data for up to 5 minutes after an update. For account balances or limits, this could allow transactions that should be rejected. The Specialist must ensure the team has defined what consistency guarantees the cache provides and whether those are acceptable for the use case. Operational complexity (A) is real but secondary to correctness. Redis not being ACID (C) is misleading — caches are not databases. Shortening the TTL (D) reduces but does not eliminate the problem. A CDN (E) is irrelevant for service-to-service reads.",
      "context": {}
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 1,
      "q": "You are reviewing a design where a team wants to introduce a read model for tenant dashboards. The read model would be a separate PostgreSQL table denormalised for dashboard queries, updated by consuming Kafka events. What is the first question you should ask about this design?",
      "opts": [
        "What database engine should the read model use — PostgreSQL or a purpose-built read-optimised store like Elasticsearch — since the engine determines query capabilities",
        "What Kafka consumer group name should be used — whether to share a group with other consumers or use a dedicated one for the read model projector",
        "What is the maximum table size the read model will reach over time, and has the team planned for partitioning or archival as the denormalised table grows",
        "How will the team handle the eventual consistency gap — what happens when a tenant performs an action and their dashboard does not immediately reflect it?",
        "Should the read model be a separate microservice with its own deployment and scaling, or a module within the existing service sharing the same JVM lifecycle"
      ],
      "ans": 3,
      "fb": "The defining characteristic of a CQRS read model fed by events is eventual consistency. The first question must address the user experience and business impact of the consistency gap: can the dashboard tolerate showing slightly stale data, and if so, for how long? This determines whether the architecture is acceptable for the use case. Database engine (A), table size (C), service boundaries (D), and consumer group naming (E) are all implementation details that follow from the fundamental consistency question.",
      "context": {}
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 1,
      "q": "The Payments service writes transaction records and publishes Kafka events. The Reporting service consumes these events to maintain a read model for financial reports. During peak load, the Reporting service falls behind by several minutes, causing reports to show stale data. Product management is escalating. What is the correct architectural response?",
      "opts": [
        "Switch the Reporting service to query the Payments database directly via a read replica instead of consuming events, eliminating the Kafka lag entirely by reading committed transaction data from PostgreSQL — this provides strong consistency and removes the dependency on event streaming infrastructure",
        "Add a manual refresh button to the financial report UI that lets users trigger an on-demand data synchronisation when they notice stale data, giving them control over when the read model is updated rather than waiting for the consumer to catch up during peak load periods",
        "Increase the Kafka consumer's thread count from 1 to 8 threads and request additional Kafka topic partitions from the platform team to enable parallel event processing, which should increase consumer throughput proportionally and reduce the lag during peak load windows",
        "Reduce the number and size of events published by the Payments service during peak hours using a throttling mechanism, decreasing the volume that the Reporting consumer must process and preventing the lag from growing during the highest-traffic periods of the business day",
        "Investigate the root cause of the lag — whether it is consumer throughput, database write contention on the read model, or event payload size — then address the bottleneck, and separately discuss with product what staleness SLA the reporting use case actually requires"
      ],
      "ans": 4,
      "fb": "The correct response addresses both the technical bottleneck and the product expectations. Consumer lag can be caused by multiple factors — thread count, partition count, database write contention, event size — and the fix depends on the root cause. Equally important is aligning with product on what staleness is acceptable for reporting: financial reports may tolerate minutes of delay, while balance queries may not. Blindly adding threads (A) may not address the actual bottleneck. Direct database queries (C) create coupling and bypass the CQRS boundary. A manual refresh button (D) is a UX hack. Reducing events (E) loses data.",
      "context": {}
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 1,
      "q": "A team is redesigning their Account service and proposes implementing full CQRS with event sourcing — storing all state changes as an append-only event log and deriving the current state by replaying events. The service currently handles 50 requests per second and has a simple CRUD model. What is your assessment?",
      "opts": [
        "Approve the full event sourcing design because event sourcing is an established best practice for financial systems that provides a complete audit trail, enables temporal queries, and supports regulatory compliance requirements — the team should adopt this pattern now rather than retrofitting it later when the service grows and the audit requirements become mandatory under PCI-DSS",
        "Approve the event sourcing design only if the team also implements a saga orchestrator to coordinate state transitions with other services, since event sourcing without orchestration creates an implicit choreography that becomes difficult to debug when state transitions fail and compensation logic must be applied across service boundaries",
        "Ask the team to implement the full event sourcing design in a feature branch and run it in shadow mode for three months alongside the current CRUD model, comparing the operational complexity, query performance, and debugging experience before making a final decision about whether to adopt it permanently in production",
        "Recommend against full event sourcing for this service — the complexity of event replay, schema evolution for events, and snapshot management is not justified by the current scale and domain complexity — suggest starting with a simpler CQRS approach using a change data capture pattern or Kafka events from the existing write model",
        "Reject the event sourcing proposal entirely because event sourcing is too complex and operationally burdensome for any service in the platform at the current team maturity level — the team should focus on mastering simpler patterns like CRUD with change data capture before attempting advanced architectural patterns that require deep expertise"
      ],
      "ans": 3,
      "fb": "Event sourcing adds significant complexity — event schema versioning, snapshot management, replay performance, debugging difficulty — that is justified when the domain genuinely benefits from a complete audit trail of state changes or when temporal queries are a requirement. A 50 RPS CRUD service does not present these needs. The Specialist should recommend the simpler CQRS path: maintain a write model and project to a read model via Kafka events or CDC, gaining the read performance benefits without the event sourcing overhead. Blanket approval (A) or blanket rejection (C) ignores context. A 3-month trial (D) risks sunk cost. A saga orchestrator (E) is unrelated to the read model decision.",
      "context": {
        "Event sourcing cost": "Schema evolution, snapshots, replay performance, debugging complexity",
        "CDC": "Change Data Capture — captures database changes as events without requiring application-level event publishing"
      }
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 1,
      "q": "The platform's Notification service currently queries five different services synchronously to assemble the data for a single notification. Response times are unpredictable because any downstream service can be slow. You are tasked with redesigning the system boundaries. What approach do you recommend?",
      "opts": [
        "Add circuit breakers with Resilience4j on all five downstream service calls and accept that notifications may be incomplete or delayed when any downstream service is slow or unavailable, presenting partial notifications with a disclaimer that some information could not be loaded",
        "Redesign the Notification service to maintain its own read model by consuming Kafka events from each upstream service, so that notification assembly reads from local data and does not depend on synchronous calls to other services at send time",
        "Add a global timeout of 2 seconds to each of the five downstream REST calls and return a partial notification containing only the data from services that responded within the timeout window, with placeholder text for missing data from timed-out services",
        "Cache the responses from all five downstream services in Redis with a 5-minute TTL and assemble notifications from the cached data, falling back to synchronous calls only when the cache is cold — this reduces runtime coupling while keeping the notification data reasonably fresh",
        "Merge the five upstream services and the Notification service into a single monolithic notification service that has direct database access to all required data, eliminating the network calls entirely and providing deterministic notification assembly performance without inter-service dependencies"
      ],
      "ans": 1,
      "fb": "The fundamental problem is runtime coupling: the Notification service's availability and latency are the product of five upstream services' availability and latency. The architectural fix is to invert the dependency by maintaining a local read model that consumes events from each upstream service. At notification time, all data is local, eliminating the synchronous dependency chain. Circuit breakers (A) manage failure but do not solve latency coupling. Merging services (C) replaces network coupling with code coupling and creates a monolith. Global timeouts (D) accept data loss. Caching (E) helps but still requires initial synchronous calls and introduces cache invalidation complexity.",
      "context": {
        "Fan-out coupling": "A service that synchronously calls N services has availability = product of N availabilities",
        "Local read model": "Each service maintains its own copy of data it needs, updated via events"
      }
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 1,
      "q": "You are redesigning the boundary between the Transaction Processing service and the Balance service. Currently, the Transaction service calls the Balance service synchronously to check and update the balance within the same user request. Product requires strong consistency — a transaction must never be approved if the balance is insufficient. The Balance service is the most latency-sensitive service on the platform. How do you redesign this boundary?",
      "opts": [
        "Keep the synchronous call from the Transaction service to the Balance service but add a retry mechanism with exponential backoff and jitter to handle Balance service slowdowns gracefully, ensuring that transient latency spikes do not result in rejected transactions for customers with sufficient funds",
        "Move the balance check into the Transaction service's own database, maintaining a local balance record that is updated transactionally with each transaction approval, and use Kafka events to reconcile with the authoritative Balance service asynchronously",
        "Move all balance calculation and management logic into the Transaction service entirely, eliminating the Balance service as a separate component — this removes the inter-service dependency and ensures that balance checks are always performed within the same database transaction as the transaction approval",
        "Replace the synchronous Balance service call with an asynchronous Kafka message and respond to the user optimistically that the transaction has been accepted, then process the actual balance check asynchronously and send a follow-up notification if the balance was insufficient and the transaction must be reversed",
        "Implement a distributed transaction using two-phase commit across the Transaction Processing and Balance services, with a coordinator that ensures both the balance deduction and transaction record are committed atomically or rolled back together, providing the strong consistency guarantee the product requires"
      ],
      "ans": 1,
      "fb": "This is a classic trade-off between strong consistency requirements and service autonomy. The solution is to localise the balance check within the Transaction service's write path — maintaining a local balance record that is updated atomically with the transaction approval — while using Kafka events for eventual reconciliation with the authoritative Balance service. This preserves the strong consistency guarantee for the user-facing operation without coupling the Transaction service's latency to the Balance service. Retries (A) do not solve the coupling. Eliminating the Balance service (C) loses separation of concerns. Optimistic async (D) violates the consistency requirement. Two-phase commit (E) is operationally fragile across services.",
      "context": {
        "Local authority pattern": "A service maintains a local copy of the data it needs for its critical path, synchronised asynchronously",
        "Reconciliation": "Periodic comparison between the local copy and the authoritative source to detect and correct drift"
      }
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 1,
      "q": "The platform's search functionality currently runs on PostgreSQL full-text search within the main transactional database. Query performance is degrading as the dataset grows, and search queries are competing with transactional writes for database resources. You are tasked with redesigning the system boundary. Multiple teams have a stake in search: Payments, Accounts, and Compliance. What is your approach?",
      "opts": [
        "Replace PostgreSQL full-text search with a database engine that handles both OLTP transactional workloads and full-text search natively, such as CockroachDB or YugabyteDB, so a single data store can serve both the transactional write path and the search read path without resource contention between the two workloads",
        "Ask each of the three teams — Payments, Accounts, and Compliance — to build their own search solution optimised for their specific domain and query patterns, since each team understands their users' search requirements better than a centralised solution could accommodate and team-owned search enables independent iteration",
        "Offload search queries to a Cloud SQL read replica configured with increased memory and CPU to separate the search read workload from the transactional write workload on the primary instance, reducing resource contention while keeping the existing PostgreSQL full-text search indexes and query patterns unchanged",
        "Add more specialised indexes — GIN indexes for full-text search, partial indexes for common filters, and covering indexes for frequently accessed columns — to the existing PostgreSQL tables and upgrade the Cloud SQL instance to a larger machine type with more CPU and memory to handle the growing workload",
        "Introduce a dedicated search service backed by Elasticsearch, fed by Kafka events from the three source services, with a clearly defined API contract that all consuming teams integrate against — and explicitly design the eventual consistency model so teams understand the staleness guarantees"
      ],
      "ans": 4,
      "fb": "The design problem is twofold: PostgreSQL is not optimised for full-text search at scale, and search queries compete with transactional writes. The correct boundary redesign introduces a dedicated search service that separates the search workload entirely. Feeding it via Kafka events from all three source services keeps the data pipeline consistent. The critical design element is the API contract and the explicit eventual consistency model — if teams expect real-time search results after a write, the design must communicate the delay. More indexes (A) add write overhead without solving the architectural conflict. Per-team search (C) fragments the user experience. Replacing PostgreSQL (D) is a disproportionate change. A read replica (E) still uses PostgreSQL full-text search, which is the wrong engine for the workload.",
      "context": {}
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 1,
      "q": "After implementing CQRS for the Ledger service, you discover that during a GKE pod restart, the Kafka consumer replays events that the read model has already processed, causing temporary data inconsistencies in the read model until deduplication catches up. Product has reported duplicate entries appearing briefly on tenant dashboards during deployments. How do you address this at the design level?",
      "opts": [
        "Add a deployment freeze window during peak business hours (9am-5pm) to prevent GKE pod restarts from triggering Kafka consumer event replays during the period when tenants are most likely to notice duplicate entries appearing temporarily on their dashboards",
        "Accept the temporary duplicates as a known limitation of eventual consistency in CQRS architectures and document this behaviour in the tenant-facing SLA, setting expectations that brief duplicate entries may appear during scheduled deployment windows and will self-correct within minutes",
        "Switch from Kafka to a message queue system that provides native exactly-once delivery semantics, such as Amazon SQS FIFO queues or Pulsar with transaction support, eliminating the possibility of duplicate event delivery during consumer restarts and partition rebalancing events",
        "Increase the Kafka consumer's auto-commit interval from the current 5 seconds to 60 seconds to reduce the size of the replay window during pod restarts, since a longer commit interval means fewer uncommitted offsets and therefore fewer events that need to be replayed after recovery",
        "Redesign the read model update logic to be fully idempotent — using event sequence numbers or idempotent upserts — so that replayed events produce the same state as the initial processing, eliminating visible duplicates regardless of replay"
      ],
      "ans": 4,
      "fb": "The root cause is that the read model's update logic is not idempotent — it processes replayed events as new events, producing duplicates. The design fix is to make the update path idempotent: use event sequence numbers to detect duplicates, or use upsert operations keyed on event ID so that replaying an event overwrites rather than duplicates. This is a fundamental CQRS design requirement, not an operational workaround. Accepting duplicates (A) degrades product trust. Deployment freezes (C) mask the problem. Longer commit intervals (D) reduce frequency but do not eliminate the issue. Switching message systems (E) does not solve application-level idempotency.",
      "context": {
        "Idempotent update": "An operation that produces the same result regardless of how many times it is applied",
        "Event sequence number": "A monotonically increasing identifier that allows consumers to detect and skip already-processed events"
      }
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 2,
      "q": "While reviewing services across three teams, you notice that each team has built its own tenant-context propagation library for Spring Boot. All three do essentially the same thing: extract a tenant ID from the HTTP header and set it in a ThreadLocal. What should the Specialist do first?",
      "opts": [
        "Report the duplication to engineering management as a waste of resources and a sign of poor cross-team communication, recommending that management establish a policy requiring teams to check for existing platform libraries before building new ones to prevent future duplication",
        "Tell each team to keep their own tenant-context propagation library since the duplication is functionally harmless — all three libraries extract a tenant ID from HTTP headers and set it in a ThreadLocal, and the maintenance cost of three small libraries is lower than the coordination cost of consolidation",
        "Document the three implementations, compare their feature sets and test coverage, and propose consolidation into a single shared library — involving contributors from all three teams so the shared version addresses each team's edge cases",
        "Rewrite all three libraries from scratch as a single platform library incorporating best practices from industry frameworks, then mandate adoption with a 30-day migration deadline to eliminate duplication quickly",
        "Pick the best-written library based on code quality metrics — test coverage, documentation, error handling completeness — and mandate that all three teams adopt it immediately, deprecating the other two libraries and setting a hard deadline for migration before the next quarterly release"
      ],
      "ans": 2,
      "fb": "Consolidation opportunities must start with understanding why the duplication exists and what each version handles that the others do not. Documenting and comparing the three implementations reveals edge cases that a single shared version must address. Involving contributors from all three teams ensures buy-in and catches requirements that a unilateral decision would miss. Mandating one without comparison (A) risks choosing a version that misses edge cases. Keeping all three (C) accumulates maintenance cost. Rewriting without consultation (D) risks creating a fourth version. Reporting to management (E) treats a design problem as a people problem.",
      "context": {}
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 2,
      "q": "You identify that four services across the platform each implement their own health check endpoint with different response formats, status codes, and failure semantics. GKE liveness and readiness probes are configured inconsistently as a result. What is the reuse opportunity here?",
      "opts": [
        "Standardise only the HTTP response format and status codes for health check endpoints but let each team implement the actual health check logic — database connectivity tests, downstream dependency checks, and readiness criteria — differently based on their service's specific requirements and failure modes",
        "Propose a shared Spring Boot Actuator configuration module that provides consistent health check endpoints, response formats, and probe behaviour — with clear documentation on how to extend it for service-specific checks — and roll it out as part of the next platform release",
        "Ask the platform team to write a GKE admission webhook that intercepts all pod deployments and rewrites the liveness and readiness probe configurations to a standard template, enforcing consistent probe paths, timeouts, and failure thresholds regardless of what the service's own health check endpoint returns",
        "Remove all custom health check endpoints from the four services entirely and rely exclusively on GKE's default TCP socket probes for both liveness and readiness, since TCP connectivity is the most fundamental health indicator and eliminates the inconsistency caused by application-level health logic",
        "Leave each team to manage their own health check implementation since they understand their service's specific health criteria best — the teams closest to the code know which downstream dependencies should be checked and what failure conditions should trigger probe failures for their particular service"
      ],
      "ans": 1,
      "fb": "Inconsistent health check behaviour is an operational risk: if readiness probes have different failure semantics, load balancing and deployment rollouts behave unpredictably across services. A shared Actuator configuration module standardises the common behaviour while allowing service-specific extensions. This is a high-value, low-risk consolidation because Spring Boot Actuator already provides the framework. Leaving it to each team (A) perpetuates the inconsistency. Standardising only format (C) misses the behavioural inconsistency. An admission webhook (D) is a blunt instrument that does not fix the application-level problem. TCP probes alone (E) cannot detect application-level health issues.",
      "context": {}
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 2,
      "q": "You notice that multiple teams have independently created Kafka producer wrapper classes that add tenant ID and correlation ID to event headers. Each wrapper has slightly different header names and serialisation formats. What consolidation approach is most appropriate?",
      "opts": [
        "Let each team keep their existing Kafka producer wrapper library since renaming the headers would require coordinating changes across all consumers that read those headers — the migration cost outweighs the benefit of standardisation, and each team's wrapper works correctly within its own service ecosystem",
        "Ask the Kafka platform team to add tenant ID and correlation ID headers at the broker level using Kafka interceptors or a custom broker plugin, so individual service producers do not need to add these headers themselves and the standardisation happens transparently at the infrastructure layer",
        "Mandate a single header format specification via an ADR that defines the standard header names, serialisation format, and required fields, then let teams migrate their producers and consumers to the new standard on their own schedule without a coordinated migration plan",
        "Create a shared Kafka producer interceptor as a platform library that standardises header names, serialisation, and provides extension points for additional headers — then coordinate a migration plan that updates producers and consumers together",
        "Write a new Kafka producer wrapper from scratch as a clean platform library incorporating all best practices, then deprecate all three existing wrappers without consulting the teams — provide a migration guide and set a hard deadline for all teams to switch to the new library"
      ],
      "ans": 3,
      "fb": "The consolidation must address both the producer and consumer sides because header names and serialisation formats must match. A shared interceptor library with standardised headers — combined with a coordinated migration plan — ensures that producers and consumers move together. Letting teams keep divergent headers (A) makes cross-team event consumption fragile. An ADR without a migration plan (C) creates a standard without a path to adoption. Broker-level headers (D) cannot add application-specific context like tenant ID. Rewriting without consultation (E) risks missing team-specific requirements.",
      "context": {}
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 2,
      "q": "Three teams have each built their own Liquibase migration patterns for schema changes. Team A uses a single changelog file per release. Team B uses one changelog file per table. Team C uses a date-prefixed file per migration. All approaches work but cause confusion during cross-team schema changes and make it harder to audit migration history consistently. How should you propose consolidation?",
      "opts": [
        "Pick Team C's date-prefixed file naming approach as the platform standard because it is the most common industry convention for database migration tools — most Liquibase and Flyway tutorials recommend date-prefixed naming, and aligning with industry practice makes it easier for new engineers joining the platform to understand the migration structure immediately",
        "Analyse the strengths of each approach: Team A's release-based grouping aids rollback planning, Team B's per-table organisation helps domain understanding, and Team C's date-prefixed naming provides clear ordering — then propose a standard that combines date-prefixed naming with release-based grouping, documented in an ADR with migration guides",
        "Mandate that all teams switch from Liquibase to Flyway for database schema migrations, since Flyway's simpler convention-over-configuration approach enforces a consistent file naming pattern by default and eliminates the flexibility that allowed the three divergent patterns to emerge in the first place",
        "Let each team keep their own Liquibase changelog convention since Liquibase handles all three formats correctly and the migration tool itself does not care about the file organisation pattern — standardising the convention would require significant migration effort with no functional improvement to the actual schema change process",
        "Ask the database team to own all schema migrations centrally, removing team-level migration files from individual service repositories — this eliminates the divergent naming conventions by consolidating all changelogs into a single repository managed by database specialists who enforce a consistent structure"
      ],
      "ans": 1,
      "fb": "Each team's approach solves a real problem, and a good consolidation standard captures the best elements rather than arbitrarily picking one. Date-prefixed naming ensures ordering, release-based grouping aids rollback, and both can coexist. An ADR with migration guides provides the rationale and a path for teams to adopt. Picking one approach (A) loses the strengths of the others. Accepting all formats (C) perpetuates the cross-team confusion. Centralising migrations (D) creates a bottleneck and removes team ownership. Switching tools (E) is a disproportionate change that does not solve the naming convention problem.",
      "context": {}
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 2,
      "q": "You discover that the Payments and Accounts teams have each built a fee calculation engine. The Payments version handles transaction fees; the Accounts version handles account maintenance fees. Both use similar discount rules and tiered pricing logic but with different implementations. A new Lending product team is about to build a third fee calculation engine. What do you recommend?",
      "opts": [
        "Let the Lending team build their own fee calculation engine from scratch since each product domain has genuinely unique fee rules, pricing structures, and regulatory constraints — the domain-specific differences between transaction fees, maintenance fees, and lending fees make a shared library impractical and overly abstract",
        "Defer the consolidation decision until the Lending team has completed building their fee calculation engine, so you can compare all three implementations side by side and make a more informed decision about which common elements to extract based on concrete code rather than hypothetical overlap",
        "Propose extracting the common fee calculation logic — tiered pricing, discount application, rounding rules — into a shared domain library, keeping domain-specific fee rules in each service, and have the Lending team be the first adopter of the shared library",
        "Merge the Payments, Accounts, and Lending services into a single unified Fee service that handles all fee calculations across the platform, providing a single source of truth for pricing rules, discount logic, rounding behaviour, and tiered rate calculations for all product verticals",
        "Ask the Lending team to fork the Payments team's fee calculation implementation into their own repository and modify it for lending-specific requirements, since the Payments engine already handles tiered pricing and discount application and provides a working foundation that is faster to adapt than building from scratch"
      ],
      "ans": 2,
      "fb": "The reuse opportunity is in the common calculation logic — tiered pricing, discount application, rounding — not in the domain-specific fee rules which legitimately differ across products. A shared library that encodes the common algorithms while allowing domain-specific configuration gives the Lending team a head start and prevents a third divergent implementation. Letting the Lending team build from scratch (A) entrenches the triplication. Merging into a single service (C) creates an inappropriately broad service boundary. Forking (D) creates a third implementation that will diverge. Deferring (E) is the pattern that created the current duplication.",
      "context": {}
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 2,
      "q": "During a platform architecture review, you identify that five services have each implemented their own error response format for REST APIs. Clients integrating with multiple services must handle five different error structures. You want to propose a consolidated error response standard. What is the critical design consideration?",
      "opts": [
        "Design the standard error format to include a machine-readable error code, a human-readable message, a correlation ID for tracing, and an optional details field for validation errors — then produce a shared Spring Boot error handler library that services can adopt, with a compatibility adapter for clients currently integrated against the old formats",
        "Adopt the RFC 7807 Problem Details for HTTP APIs specification exactly as defined in the standard, with no platform-specific extensions or additional fields, since RFC 7807 is an IETF standard that provides a well-documented, interoperable error response format — clients can use standard libraries to parse error responses and the specification covers type URIs, title, status, detail, and instance fields",
        "Use HTTP status codes exclusively as the error communication mechanism and remove all custom error response bodies from service APIs, since HTTP status codes are universally understood by clients and middleware — 400 for validation errors, 404 for not found, 409 for conflicts, 500 for server errors — and eliminating custom bodies simplifies both the server and client implementations significantly",
        "Ask each client team that integrates with multiple services to build their own error response normalisation layer that translates each service's error format into the client's internal error model — this pushes the adaptation cost to the consumer side, avoids requiring any changes to the five existing service APIs, and lets each client handle errors in the way that best suits their error handling architecture",
        "Choose the simplest error format among the five existing implementations and mandate it as the platform standard across all services, since simplicity maximises adoption speed and reduces the likelihood of implementation errors — a minimal format with just an error code and message string is sufficient for most client error handling scenarios and is the easiest to migrate to"
      ],
      "ans": 0,
      "fb": "Error response consolidation must balance standardisation with practical adoption. The standard format needs enough structure to serve both machine and human consumers, plus a correlation ID for debugging. A shared library makes adoption easy, and compatibility adapters prevent breaking existing client integrations during migration. The simplest format (A) may be insufficient for validation errors. Status codes alone (C) lose valuable error detail. Client-side normalisation (D) pushes the cost to every consumer. RFC 7807 (E) is a good foundation but may need platform-specific extensions like tenant context or audit references that the standard does not define.",
      "context": {}
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 2,
      "q": "You have identified a consolidation opportunity: three teams each maintain a separate audit logging library that writes audit events to Kafka. Each library has different event schemas, topic naming conventions, and retention configurations. The compliance team needs a unified audit trail. You propose consolidation, but two of the three teams resist, arguing that their audit requirements are domain-specific and a shared library would not meet their needs. How do you navigate this?",
      "opts": [
        "Override the two resistant teams' objections because compliance needs for a unified audit trail take clear precedence over individual team preferences about library design — issue a mandatory migration directive with a 90-day deadline and escalate non-compliance to engineering management, since regulatory requirements are non-negotiable regardless of team-level convenience concerns",
        "Accept the teams' resistance and maintain three separate audit logging libraries, since the teams have legitimate domain-specific requirements that a shared library would compromise — each team can continue to own their audit events independently, and the compliance team can build an aggregation layer that unifies the three different schemas for audit reporting purposes",
        "Escalate the consolidation impasse to engineering leadership and request a management directive requiring all three teams to adopt a single shared audit logging library within a specified timeframe, since the compliance team's need for a unified audit trail is a business requirement that should be resolved through management authority rather than technical negotiation",
        "Ask the compliance team to define the exact audit event schema, topic naming convention, and retention requirements based on PCI-DSS and SOX mandates, then impose this specification on all three engineering teams — compliance owns the regulatory requirement and should therefore own the technical specification that implements it",
        "Investigate each team's specific requirements in detail — identify which elements are genuinely domain-specific and which are accidental divergence — then propose a layered design: a shared core that handles common audit fields, topic naming, and retention policy, with domain-specific extensions that each team controls"
      ],
      "ans": 4,
      "fb": "Resistance to consolidation often signals legitimate domain-specific requirements mixed with accidental divergence. The Specialist's role is to separate the two: identify what is genuinely domain-specific (specific audit fields, event types) and what is accidental (topic naming, retention, common fields like timestamp, actor, tenant). A layered design — shared core with domain-specific extensions — addresses both the compliance need for consistency and the teams' need for domain flexibility. Overriding teams (A) creates resentment and brittle adoption. Accepting resistance without investigation (C) abandons the consolidation opportunity. Escalation (D) is premature before investigating the actual requirements. Letting compliance define the schema (E) abdicates technical ownership of the design.",
      "context": {}
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 2,
      "q": "After successfully consolidating a tenant-context propagation library used by six services, you discover three months later that two teams have forked the library and added custom modifications without contributing them back. The forks are now diverging from the main library. What systemic issue does this reveal, and how do you address it?",
      "opts": [
        "Mandate a formal policy that explicitly prohibits forking shared platform libraries, with CI/CD pipeline checks that detect and block builds using forked library versions — teams that need additional functionality must contribute their changes through the standard pull request process on the shared library repository, subject to code review and approval by the platform team",
        "Replace the shared library with a specification document that defines the tenant-context propagation contract — interface, header names, ThreadLocal semantics, and error handling — and let each team implement the specification independently in their own codebase, since the real value is in the standard, not in shared code",
        "Accept the forks as an inevitable consequence of shared library ownership in a multi-team organisation — teams will always customise shared code to fit their specific needs, and maintaining multiple forks is a reasonable trade-off for the flexibility it provides, as long as each fork continues to satisfy the core tenant-context propagation contract",
        "Investigate why the teams forked: likely the shared library does not provide an extension mechanism for their needs, or the contribution process is too slow — then address the root cause by adding extension points and streamlining the contribution workflow, and work with the forked teams to merge their changes back",
        "Add version-checking CI gates that scan each service's dependency tree during builds and prevent deployment of any service using a non-standard or forked version of the tenant-context propagation library — this enforcement mechanism ensures all six services remain on the canonical library version and blocks future forking attempts automatically"
      ],
      "ans": 3,
      "fb": "Library forks are a symptom, not a cause. Teams fork when the shared library does not meet their needs and the cost of contributing back exceeds the cost of maintaining a fork. The systemic fix addresses both: extension points in the library so teams can customise without forking, and a streamlined contribution process so teams prefer upstream changes over local forks. Prohibiting forks (A) does not address the underlying need. Accepting forks (C) abandons the consolidation. A specification document (D) loses the value of shared code. CI gates (E) enforce compliance but do not address why teams needed to fork.",
      "context": {}
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 2,
      "q": "You are proposing a platform-wide consolidation of HTTP client configuration across twelve services. Each service currently configures its own connection pool sizes, timeouts, retry policies, and circuit breaker settings. Some configurations were tuned after production incidents; others use framework defaults. A senior engineer argues that consolidation will lose hard-won production tuning. How do you address this concern?",
      "opts": [
        "Consolidate only the services that currently use framework default HTTP client configurations, since those services have no production-tuned values to preserve and can safely adopt platform defaults — leave the production-tuned services on their own configurations indefinitely, as the risk of changing their settings outweighs the consistency benefit, and document the bifurcation in an ADR explaining why some services are exempt from the shared configuration module",
        "Design the shared HTTP client configuration module with a layered override model: platform defaults that encode production-learned best practices, service-level overrides for legitimate differences, and mandatory minimum settings for safety such as connection pool limits and timeout ceilings — then document the rationale for each production-tuned value and migrate them into the override layer",
        "Ask each team to document their current HTTP client settings — connection pool sizes, timeouts, retry policies, and circuit breaker thresholds — in a standardised format in their service's README file, then maintain them independently as they do today, since the documentation provides the visibility benefit of consolidation without the migration risk of actually changing working production configurations",
        "Agree with the senior engineer that the risk of losing hard-won production tuning is too high and abandon the consolidation effort entirely — the current state where each service independently manages its own HTTP client configuration is the safest approach, since production-tuned values represent battle-tested knowledge that a platform-wide default would override with potentially less optimal settings",
        "Override the senior engineer's concern and apply uniform platform defaults across all twelve services because consistency is more important than individual service tuning — any performance regressions caused by the standardisation can be addressed reactively through monitoring and alerting, and the operational simplicity of a single configuration set across all services outweighs the risk of losing some per-service optimisations"
      ],
      "ans": 1,
      "fb": "The concern is legitimate: production-tuned configurations represent real operational knowledge that must not be lost in consolidation. The solution is a layered model where platform defaults encode the common best practices, but service-level overrides preserve the production-learned values. Documenting the rationale for each override creates institutional knowledge that currently lives only in incident post-mortems. Abandoning consolidation (A) loses the consistency benefit. Uniform defaults (C) ignores real operational differences. Independent management (D) is the current state. Partial consolidation (E) creates two classes of services without addressing the core design problem.",
      "context": {}
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 3,
      "q": "A team proposes adding automatic retries with a 1-second fixed delay to all failed HTTP calls from their service to three downstream services. They argue this will improve resilience. What systemic risk should the Specialist identify?",
      "opts": [
        "The retries will increase Kafka consumer lag because the HTTP retry delays will slow down the service's overall request processing throughput, which will reduce the rate at which the Kafka consumer can poll and commit offsets for incoming events",
        "The retries will cause duplicate database entries because each retry attempt may partially succeed and write a record before the downstream service returns an error, resulting in multiple rows for the same logical operation when the retry eventually succeeds",
        "The retries will consume more CPU on the calling service because each retry attempt requires full request serialisation, TLS handshake overhead, and response deserialisation, effectively tripling the compute cost per failed operation across all three downstream services",
        "The retries will increase end-user perceived latency because each failed call adds a minimum of 1 second of delay before the retry attempt, and with three downstream services the worst-case scenario could add up to 3 seconds of additional wait time per request",
        "Fixed-delay retries to multiple downstream services create a retry storm risk: if a downstream service is slow or failing, retries multiply the load on an already-stressed service, potentially turning a partial degradation into a full outage"
      ],
      "ans": 4,
      "fb": "Retry storms are one of the most common systemic risks in distributed systems. When a downstream service is degraded, fixed-delay retries from multiple callers multiply the load on the struggling service — each retry adds another request to the queue, preventing recovery. The correct pattern is exponential backoff with jitter and circuit breakers. Latency increase (A) is a consequence but not the systemic risk. CPU consumption (C) is minor compared to the downstream impact. Kafka lag (D) is unrelated to HTTP retries. Duplicate entries (E) are possible but depend on the operation's idempotency, not the retry pattern itself.",
      "context": {
        "Retry storm": "When multiple clients retry simultaneously against a degraded service, the aggregate retry load prevents the service from recovering",
        "Exponential backoff with jitter": "Retries at increasing intervals with randomised delays prevent synchronised retry spikes"
      }
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 3,
      "q": "You are reviewing a design where a new service publishes events to Kafka and three consumer services process them. All three consumers start processing the moment an event arrives. The design assumes all three will complete before the next event for the same entity. What ordering assumption should the Specialist flag?",
      "opts": [
        "The design should use Kafka transactions with the transactional producer API to ensure all three consumers process each event atomically — either all three consumers successfully process the event or none of them do, preventing partial processing that could leave the system in an inconsistent state across service boundaries",
        "The three consumers should be configured to use the same Kafka consumer group so they share the processing load across instances, with Kafka's partition assignment protocol ensuring each event is processed by exactly one consumer instance rather than being duplicated across all three services",
        "Kafka does not guarantee message ordering across different partitions, so if the three consumers read from different partitions they may receive events in different sequences, but this is primarily a throughput concern rather than a correctness issue for the entity-level processing assumption",
        "Kafka's consumer group protocol will prevent multiple consumers from reading the same event simultaneously by assigning each partition to exactly one consumer within a group, ensuring that the three consumer services do not duplicate processing effort or compete for the same messages",
        "The design assumes sequential processing across independent consumers, but Kafka consumers process at different rates — if a second event for the same entity arrives before all three consumers finish the first, the consumers may process events out of order, leading to inconsistent state"
      ],
      "ans": 4,
      "fb": "The ordering assumption is that three independent consumers will all finish processing event N before event N+1 for the same entity arrives. In practice, consumers process at different speeds, and a fast producer can outpace a slow consumer. If consumer C is still processing event 1 for entity X when event 2 arrives, consumer C may apply event 2's changes before event 1's, producing an inconsistent state. The Specialist should flag this and ask: does the design require ordered processing per entity? If so, all three consumers need a mechanism to handle out-of-order arrival. Partition ordering (A) is relevant but does not solve the cross-consumer ordering problem. Consumer groups (C, E) address partition assignment, not processing ordering. Kafka transactions (D) ensure atomic publishing, not cross-consumer processing order.",
      "context": {}
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 3,
      "q": "A team has designed a service that queries an external partner API synchronously during request processing. The partner API has an SLA of 99.5% availability. The team's own service has an SLA of 99.9%. What systemic risk does this create?",
      "opts": [
        "The partner API should be replaced with an internally-developed service that replicates the partner's functionality, eliminating the external dependency entirely and giving the team full control over the availability, latency, and deployment schedule of every component in their service's dependency chain",
        "The partner API might change its response format or authentication mechanism without warning, since external partners are not bound by the team's change management — this contract instability requires a defensive anti-corruption layer with schema validation on every response",
        "The team's service cannot meet its 99.9% SLA because it has a hard dependency on a service with only 99.5% availability — the combined availability is at most 99.5%, not 99.9%, unless the design includes a fallback path for partner API failures",
        "The partner API is likely slower than the team's internal services due to network latency, geographic distance, and the partner's own processing time, which will increase the average response time for requests that depend on the partner call and degrade the overall user experience during peak traffic",
        "The team should negotiate a higher SLA with the partner — at least 99.9% — and include contractual penalties for violations, since the dependency is a commercial problem to resolve through vendor management rather than architecture"
      ],
      "ans": 2,
      "fb": "This is a fundamental availability arithmetic problem: a synchronous dependency on a less-available service caps the caller's availability at the dependency's level. 99.9% times 99.5% is 99.4%, which is below the team's own SLA. The Specialist must flag this and ask: what happens when the partner API is unavailable? If there is no fallback path (cached response, default behaviour, degraded mode), the service will fail for 0.5% of requests. Response time (A) is a separate concern. Format changes (C) are a contract risk, not an availability risk. Negotiating a higher SLA (D) is outside the team's control. Replacing the partner (E) is not always feasible.",
      "context": {
        "Availability multiplication": "Synchronous dependencies multiply: 99.9% x 99.5% = 99.4%",
        "Fallback path": "A design pattern where the service provides degraded but functional behaviour when a dependency is unavailable"
      }
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 3,
      "q": "A team presents a design for a new payment processing flow. The flow involves four synchronous service-to-service calls in sequence, each with a 5-second timeout. The team has not discussed what happens if the third service call fails after the first two have already completed and made state changes. What risk pattern should the Specialist identify?",
      "opts": [
        "The design has an incomplete failure mode: if the third call fails after the first two have made state changes, the system is left in a partially completed state — the design needs either compensation logic to undo the first two changes, or an idempotent retry mechanism to resume from the point of failure",
        "The team should adopt asynchronous messaging via Kafka for all four service-to-service calls instead of synchronous HTTP, converting the sequential chain into an event-driven pipeline where each service publishes a completion event that triggers the next step — this eliminates the synchronous coupling and allows each service to process at its own pace",
        "The first two services should not make any state changes until all four calls in the sequence have been confirmed as successful, using a reservation pattern where state changes are held in a pending status and only committed after the fourth call returns successfully — this eliminates the partial-state problem entirely by deferring all commits",
        "The team should reduce the timeout from 5 seconds to 2 seconds per call to limit the total end-to-end latency to 8 seconds maximum and fail fast when a downstream service is not responding within an acceptable timeframe, since a 20-second total timeout is unacceptable for a user-facing payment processing request",
        "The total timeout of 20 seconds across the four sequential calls is too long for a user-facing payment processing request and will result in poor user experience — the team should optimise the downstream services to respond within 1 second each, bringing the total chain latency under 5 seconds including network overhead"
      ],
      "ans": 0,
      "fb": "This is the classic distributed transaction problem: a sequential chain of state-changing calls where a failure mid-chain leaves the system in a partial state. The Specialist must identify that the design lacks a failure recovery strategy. The options are compensation (saga pattern with undo operations), idempotent retry (resume from the failure point), or reserving all state changes until the entire chain confirms. The total timeout (A) is also a concern but secondary to the partial-state risk. Reducing timeouts (C) does not address the partial-state problem. Async messaging (D) may be appropriate but changes the architecture fundamentally. Holding all changes until completion (E) is one solution but may not be feasible if early steps must be visible to other services.",
      "context": {
        "Partial state failure": "A distributed operation that succeeds partially, leaving the system in an inconsistent state",
        "Compensation": "Undoing completed steps of a failed multi-step operation to return the system to a consistent state"
      }
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 3,
      "q": "You discover that a service reads from a Kafka topic where messages are keyed by tenant ID, ensuring per-tenant ordering within a partition. A recent change added a new consumer group that re-keys messages by transaction ID before processing, losing the per-tenant ordering guarantee. The team that made the change is unaware of the ordering dependency. What systemic risk does this create?",
      "opts": [
        "The new consumer group will consume significantly more memory due to the different key distribution pattern, since transaction ID keys have higher cardinality than tenant ID keys and Kafka consumers must maintain offset tracking and buffering for a larger number of distinct partitions when the key space changes",
        "The Kafka topic will need to be expanded with additional partitions to handle the new key distribution effectively, since transaction ID keying produces a much more uniform distribution across partitions than tenant ID keying, and the current partition count may not provide sufficient parallelism for the higher-cardinality key space",
        "Re-keying by transaction ID distributes messages for the same tenant across multiple partitions, breaking the per-tenant ordering guarantee — if downstream processing depends on sequential tenant events (e.g. balance updates), events may be processed out of order, causing incorrect balances or duplicate postings",
        "The new consumer group will process messages more slowly than the existing tenant-keyed consumer because transaction IDs have significantly higher cardinality than tenant IDs, spreading the workload across more partitions and reducing the batch processing efficiency that comes from co-locating related messages on the same partition",
        "Re-keying messages by transaction ID will cause the Kafka consumer group to rebalance more frequently because the partition assignment algorithm must redistribute partitions whenever the key distribution pattern changes significantly, and transaction ID keys produce a fundamentally different partition mapping than tenant ID keys"
      ],
      "ans": 2,
      "fb": "Kafka guarantees ordering only within a partition. When messages are keyed by tenant ID, all events for a given tenant go to the same partition and are processed in order. Re-keying by transaction ID distributes a single tenant's events across multiple partitions, so processing order is no longer guaranteed per tenant. If downstream logic depends on ordered balance updates (e.g. debit before credit), out-of-order processing can cause incorrect balances or rejected transactions. The Specialist must identify this as a systemic risk because the ordering guarantee was an implicit contract that was silently broken. Cardinality (A), partition count (C), memory (D), and rebalancing (E) are secondary concerns compared to correctness.",
      "context": {}
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 3,
      "q": "A team designs a feature where a user action triggers an HTTP request to Service A, which publishes a Kafka event, consumed by Service B, which calls Service C via REST. Service C writes to the database and publishes a completion event. The team expects the entire flow to complete within 2 seconds. What systemic risk should you flag about this timing assumption?",
      "opts": [
        "The end-to-end latency of a chain involving HTTP to Kafka to HTTP to database to Kafka is not deterministic — each link adds variable latency, and under load or during GKE pod scaling events, the 2-second assumption can easily be violated — the design must define what happens when the flow exceeds 2 seconds, including whether the user receives a timeout and how the system handles the in-flight processing",
        "The database write ordering should be rearranged so that Service C writes to the database before publishing the Kafka completion event, reducing the perceived end-to-end latency by overlapping the event publication with the database commit acknowledgement — this optimisation eliminates one sequential step from the critical path",
        "The Kafka consumer in Service B may experience lag due to partition rebalancing triggered by GKE pod scaling events, which temporarily pauses event consumption until the new partition assignment stabilises — this rebalancing latency is unpredictable and could add several seconds to the processing chain during horizontal scaling",
        "The team should replace the REST calls between Service B and Service C with gRPC for lower serialisation overhead and persistent HTTP/2 connections, reducing the per-call latency by approximately 30-40% compared to REST with JSON serialisation and achieving more predictable latency under load",
        "The Kafka producer in Service A should use synchronous send mode instead of asynchronous batched mode to reduce the end-to-end latency, since asynchronous batching introduces a linger time delay while the producer accumulates messages before flushing — synchronous mode ensures each event is sent immediately upon production"
      ],
      "ans": 0,
      "fb": "The systemic risk is a latency assumption applied to a non-deterministic chain. Each link — HTTP call, Kafka publish, consumer poll interval, REST call, database write, Kafka publish — adds variable latency. Under normal conditions the chain might complete in 500ms, but during Kafka consumer rebalancing, GKE pod scaling, or database contention, any link can spike. The critical missing design element is: what happens when 2 seconds is exceeded? Does the user get an error? Does the system continue processing in the background? Is there a reconciliation path? Without answering these questions, the design has an implicit promise it cannot keep. Consumer lag (A) is one factor but not the full picture. Write ordering (C), protocol choice (D), and sync mode (E) are micro-optimisations that do not address the fundamental latency variability.",
      "context": {}
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 3,
      "q": "A senior engineer proposes a caching layer for the Payments service that caches account balance lookups for 30 seconds to reduce load on the Balance service. The Payments service processes real-time transactions that check balances before approving. You suspect this creates a thundering herd risk. Walk through the risk and propose a mitigation.",
      "opts": [
        "The cache is acceptable because 30 seconds of staleness is within a reasonable tolerance for balance checks in a payment processing system — the balance service's authoritative database is still consulted for actual transaction authorisation, and the cache only serves informational balance display queries that do not require strict real-time accuracy for the user interface",
        "The thundering herd risk is minimal because the Balance service has GKE horizontal pod autoscaling enabled with CPU-based scaling policies, which will automatically add replica pods when the surge of cache-miss requests increases CPU utilisation above the configured threshold — the autoscaler should absorb the spike within a few seconds of the herd event",
        "The cache TTL should be increased from 30 seconds to 5 minutes to significantly reduce the frequency of cache refresh cycles, since fewer expiration events means fewer opportunities for thundering herd spikes — the longer TTL trades slightly more staleness for much lower backend load, which is an acceptable trade-off for balance display queries",
        "The cache should be moved from the application layer to a CDN or edge caching layer such as Cloud CDN to distribute the balance lookup load geographically, reducing the number of requests that reach the Balance service by serving responses from edge nodes closer to consumers — this offloads the backend and eliminates thundering herd risk at the origin by distributing cache expiry across edge locations",
        "When the cached balance for a high-volume account expires, all concurrent requests for that account will simultaneously miss the cache and hit the Balance service, creating a spike — this thundering herd can overwhelm the Balance service during peak load; the mitigation is to use cache stampede protection (e.g. probabilistic early expiration or a single-flight pattern where only one request refreshes the cache while others wait or use the stale value)"
      ],
      "ans": 4,
      "fb": "A thundering herd occurs when a popular cache entry expires and many concurrent requests simultaneously attempt to refresh it, overwhelming the backend. For a high-volume account's balance, this means dozens or hundreds of simultaneous requests hitting the Balance service at the 30-second mark. The mitigation is a cache stampede protection pattern: probabilistic early expiration (some requests refresh slightly before TTL), or a single-flight/request-coalescing pattern where only one request refreshes while others wait or use the stale value. Accepting 30-second staleness (A) does not address the herd risk. Auto-scaling (C) is too slow to handle a spike within milliseconds. A CDN (D) is inappropriate for service-to-service calls. A longer TTL (E) makes each herd event less frequent but larger.",
      "context": {
        "Thundering herd": "Multiple clients simultaneously request a resource when a cache entry expires, overwhelming the backend",
        "Single-flight pattern": "Only one goroutine/thread fetches the data; concurrent requests wait for the result of the in-flight request"
      }
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 3,
      "q": "During a production incident review, you discover that a cascade failure was caused by the following chain: the database connection pool on Service A filled up because Service B was slow to respond, which caused Service A to queue requests, which caused its Kafka consumer to stop polling, which triggered a consumer group rebalance, which caused event processing delays across three other services. What design-level systemic risk does this reveal, and what architectural mitigation do you recommend?",
      "opts": [
        "Service B should be redesigned to respond faster by optimising its database queries, adding appropriate indexes, reducing processing per request, and implementing query result caching with Redis — addressing the root cause of the slowness eliminates the downstream cascade effects without requiring any architectural changes to Service A's resource isolation, Kafka consumer threading, or connection pool partitioning",
        "Service A should switch from synchronous HTTP calls to asynchronous message-based communication with Service B via Kafka, completely decoupling the two services so that Service B's response time no longer affects Service A's thread pool or connection pool availability — the Kafka consumer processes Service B's responses on a separate thread pool, isolating the dependency from the main request handling path and from the Kafka event processing path",
        "The incident reveals cascading resource exhaustion: a single slow dependency caused connection pool saturation, which propagated to Kafka consumption, which propagated to other services via rebalancing — the architectural mitigation is to implement bulkhead isolation: separate connection pools and thread pools for different responsibilities within Service A, so that synchronous HTTP call failures cannot starve the Kafka consumer, combined with circuit breakers on the Service B call to fail fast rather than queue",
        "The Kafka consumer should use a significantly longer session timeout — increasing from the default 10 seconds to 60 seconds — to prevent consumer group rebalancing during transient connection pool exhaustion events, giving Service A more time to recover from the temporary resource saturation before Kafka considers the consumer dead and triggers partition reassignment",
        "Service A should increase its HikariCP connection pool size from the current maximum to at least double the configured value, providing sufficient headroom to handle concurrent database access from both the HTTP request handling threads and the Kafka consumer processing threads without exhaustion during peak load or Service B slowdowns — a larger pool gives more breathing room during transient spikes in connection demand across both workloads"
      ],
      "ans": 2,
      "fb": "This is a textbook cascading failure caused by shared resource pools. Service A uses the same connection pool for both HTTP calls to Service B and database access for Kafka event processing. When Service B slows down, it holds connections, preventing the Kafka consumer from accessing the database, which stops polling, which triggers rebalancing, which affects other consumers. The bulkhead pattern isolates these concerns: separate pools for separate responsibilities ensure that one failure domain does not infect another. Circuit breakers on the Service B call prevent connection pool exhaustion by failing fast. Increasing pool size (A) delays but does not prevent exhaustion. Making Service B faster (C) addresses the trigger but not the architectural vulnerability. Longer session timeouts (D) delay rebalancing but do not address the root cause. Async calls (E) may help but require a broader architectural change.",
      "context": {
        "Bulkhead pattern": "Isolate resources (threads, connections, memory) so that failure in one component does not exhaust resources needed by another",
        "Circuit breaker": "Stops sending requests to a failing service after a threshold, allowing it to recover"
      }
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 3,
      "q": "A platform-wide load test reveals that when Kafka consumer throughput exceeds 5,000 events per second, the system experiences back-pressure that propagates from the database write layer through the consumer to the Kafka broker, causing producer-side blocking across all services publishing to the affected topics. What systemic risk does this expose, and what design change addresses it?",
      "opts": [
        "The risk is back-pressure propagation through shared infrastructure: the database write bottleneck creates consumer lag, which fills consumer buffers, which causes the broker to apply flow control on producers, affecting all services — not just the ones whose events caused the bottleneck; the design fix is to decouple the write-heavy consumers from the shared broker by introducing a buffering layer (e.g. a staging table or local queue) that absorbs write-side back-pressure without propagating it to the broker, combined with separate Kafka clusters or topic isolation for critical versus bulk flows",
        "Configure Kafka producers across all services to use fire-and-forget delivery mode by setting acks=0, which prevents the producer from blocking while waiting for broker acknowledgement — this eliminates the possibility of producer-side blocking caused by back-pressure from consumer lag, since the producer returns immediately after sending without waiting for any broker confirmation, and the producer's thread pool is never starved by slow consumer acknowledgement chains propagating through the broker",
        "Add more Kafka consumer instances by scaling up the GKE deployment replica count for the write-heavy consumer service, distributing the event processing workload across more pods and increasing aggregate throughput — Kafka's consumer group protocol will automatically rebalance partitions across the additional instances to parallelise the processing, and with enough consumers each partition's processing rate should exceed the production rate, preventing lag accumulation that causes back-pressure propagation to the broker and upstream producers",
        "Upgrade the Cloud SQL instance to a higher machine type with more CPU cores, memory, and IOPS capacity to handle the higher database write throughput that the consumers are attempting — the database is the bottleneck that causes consumer lag, so increasing the database's write capacity directly addresses the root cause of the back-pressure chain without requiring changes to the Kafka topology, consumer configuration, or producer settings, and Cloud SQL's live migration capability allows the upgrade without downtime",
        "Increase the Kafka topic's partition count to distribute the event load across more partitions and enable more consumer instances to process events in parallel — higher partition counts allow for more granular parallelism and reduce the per-partition event rate, which should prevent any single consumer from falling behind and creating back-pressure that propagates to the broker, since each consumer handles a smaller slice of the total event volume and can maintain its processing rate within its database write capacity"
      ],
      "ans": 0,
      "fb": "This is cross-service back-pressure propagation through shared infrastructure. The critical insight is that back-pressure from one consumer's database writes can propagate backward through the Kafka broker to affect all producers on the same cluster, including services whose events are unrelated to the bottleneck. The architectural fix has two parts: a buffering layer that absorbs write-side back-pressure (preventing consumer lag from propagating to the broker), and topic/cluster isolation that separates critical flows from bulk processing. More partitions (A) distribute load but do not solve database write contention. Instance upgrades (C) and more consumers (D) are scaling solutions that may help but do not address the cross-service propagation risk. Fire-and-forget (E) risks data loss.",
      "context": {
        "Back-pressure propagation": "Slowdowns in a downstream component cascade backward through message brokers, affecting upstream producers",
        "Broker flow control": "When consumer lag grows too large, Kafka can slow producers to prevent unbounded log growth"
      }
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 4,
      "q": "An auditor asks you to trace a specific payment transaction from initiation to settlement across all services. You have the transaction ID but no centralised tracing tool. What is the minimum set of information you need from each service to construct the end-to-end trace?",
      "opts": [
        "A correlation ID (or the transaction ID itself) logged at every service boundary, including Kafka event headers and database records, along with timestamps and the operation performed at each step",
        "OpenTelemetry spans exported from each service to Grafana Tempo or Cloud Trace, providing structured distributed trace data with parent-child span relationships, service names, and operation durations that can be queried by trace ID",
        "Kafka consumer offsets for each service's consumer group showing when each service processed the transaction event, including partition, offset value, and commit timestamp",
        "Database records from each service showing the final persisted state of the transaction, including status, amount, timestamps, and foreign keys linking to related records",
        "Application logs from each service, filtered by a broad timestamp window around the expected transaction processing time, searching for log entries that mention the transaction ID or related entity identifiers across all log levels from DEBUG to ERROR"
      ],
      "ans": 0,
      "fb": "End-to-end tracing without a centralised tool requires a correlation ID that is propagated and logged at every boundary — HTTP headers, Kafka event headers, database records. Combined with timestamps and operation descriptions, this creates a manual trace that shows the transaction's path. Application logs filtered by time (A) are too noisy and may miss async steps. Database records (C) show final state but not the journey. Consumer offsets (D) show when processing happened but not what happened. OpenTelemetry spans (E) would be ideal but the question specifies no centralised tracing tool, so the raw data must be sufficient.",
      "context": {}
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 4,
      "q": "Your platform processes a payment through four services: Payment Gateway, Transaction Processor, Ledger, and Notification. A compliance officer asks: at which points in this flow could a transaction be lost without detection? What is the correct way to analyse this?",
      "opts": [
        "Review the database tables in each of the four services to confirm the transaction was recorded correctly at each stage — check the Payment Gateway's request log table, the Transaction Processor's transaction table, the Ledger's posting table, and the Notification service's delivery table to verify the record exists in each store",
        "Check the network firewall rules and GKE network policies to verify that all four services can communicate with each other, since a network partition or misconfigured firewall rule could prevent transaction data from flowing between services, even if each individual service is functioning correctly within its own pod",
        "Identify every boundary where ownership of the transaction transfers between services — each handoff (HTTP response, Kafka publish, database write) is a potential loss point — then verify whether each boundary has a confirmation mechanism (acknowledgement, idempotent write, reconciliation) that detects if the transaction fails to reach the next stage",
        "Review the Kafka topic retention settings for all payment-related topics to ensure messages are not being automatically deleted before consumers have had time to process them, since a retention period shorter than the maximum consumer lag could result in unprocessed transactions being permanently lost from the broker's commit log",
        "Check the Kafka consumer lag dashboards for each of the four services' consumer groups to see if any service has accumulated significant lag that might indicate messages are queued but not yet processed, which could explain a discrepancy between the notification being sent and the actual financial record being persisted"
      ],
      "ans": 2,
      "fb": "Transaction loss can occur at any boundary where ownership transfers between services. The Specialist must systematically identify every handoff point and verify that each has a detection mechanism. Between the Payment Gateway and Transaction Processor: was the HTTP response received? Between the Transaction Processor and Kafka: was the event published and acknowledged? Between Kafka and the Ledger: was the event consumed and committed to the database? Each gap without a confirmation mechanism is a potential undetected loss point. Lag dashboards (A) show delay, not loss. Database records (C) confirm successful end state but do not identify where losses could occur. Firewall rules (D) address connectivity, not message delivery guarantees. Retention settings (E) address broker-level persistence, not application-level delivery.",
      "context": {}
    },
    {
      "level": 4,
      "diff": 1,
      "scenario": 4,
      "q": "You are asked to verify that a refund transaction was correctly processed across all services. The refund originated in the Payment Gateway, was processed by the Transaction Processor, recorded in the Ledger, and the customer was notified. The customer claims they were notified but the refund has not appeared in their account. Where do you start the investigation?",
      "opts": [
        "Check the Payment Gateway logs for the original refund request to verify that the refund was correctly initiated with the right amount, currency, and customer identifier, since errors at the initiation point would propagate through the entire processing chain and could explain why the refund was processed internally but the customer has not received the funds",
        "Check the Kafka topic for the refund event to verify it was published by the Transaction Processor and consumed by both the Ledger and Notification services, since a missing or malformed event could explain a gap between the notification being sent and the ledger entry being created — compare the event payload with both services' records",
        "Check the customer's bank statement directly or request a statement from the acquiring bank to verify whether the refund credit has been applied to the customer's account, since the issue may be a delay in the banking network's settlement cycle rather than a platform-level processing failure",
        "Start at the Ledger service and verify the refund record exists with the correct status and amount, then trace backward to the Transaction Processor to verify it issued the correct settlement instruction to the bank — the gap is most likely between the Ledger recording the refund and the bank actually processing it",
        "Check the Notification service logs to verify that the refund notification was sent to the correct customer email address or mobile number with the accurate refund amount and reference number, since a notification sent to the wrong recipient or with incorrect details could explain the customer's confusion about the refund status"
      ],
      "ans": 3,
      "fb": "The customer received a notification, so the flow reached the Notification service. The customer says the refund has not appeared, so the issue is in the actual money movement, not the platform's internal processing. Starting at the Ledger — where the platform's authoritative financial record lives — verifies whether the refund was recorded correctly, then tracing backward to the Transaction Processor reveals whether the settlement instruction was sent to the bank. The gap is most likely between the platform and the external bank, not between internal services. Starting at Notification (A) tells you what you already know. Payment Gateway logs (C) show the initiation but not the outcome. Kafka topics (D) show event flow but not bank settlement. The bank statement (E) is useful but the platform should first verify its own records.",
      "context": {}
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 4,
      "q": "During a PCI-DSS audit, an assessor asks you to demonstrate that your platform can trace a cardholder data element from the moment it enters the system to the moment it is purged, including all intermediate storage locations. Your platform has six services that may touch cardholder data. How do you prepare this evidence?",
      "opts": [
        "Provide the encryption key management documentation for all six services, including the Cloud KMS key hierarchy, key rotation schedule, and the mapping of which keys protect which data elements at rest and in transit — this demonstrates that cardholder data is protected by appropriate cryptographic controls at every storage location",
        "Create a cardholder data flow map that shows every entry point, processing step, storage location (including caches, logs, and temporary files), and purge mechanism — annotated with the data element type, encryption status at each point, and retention period — verified against the actual implementation, not just the design documentation",
        "Show the GKE network architecture diagram with firewall rules, network policies, and VPC Service Controls between all services in the cardholder data environment, demonstrating that network-level controls restrict which services can communicate and that traffic is encrypted in transit using mutual TLS or GKE's built-in encryption",
        "Produce a comprehensive list of all PostgreSQL database tables across the six services that contain cardholder data fields, including the column names, data types, encryption status (column-level or tablespace-level), and the Cloud KMS key used to encrypt each table's data at rest via Cloud SQL's CMEK configuration",
        "Produce the data retention policy document that specifies retention periods for each category of cardholder data, and confirm that all six services follow the policy by showing the automated purge job configurations, last execution timestamps, and verification logs that demonstrate compliant deletion of expired cardholder data records"
      ],
      "ans": 1,
      "fb": "PCI-DSS requires knowing exactly where cardholder data exists at every point in its lifecycle, not just in databases. A comprehensive data flow map must include entry points (API, file upload, webhook), processing steps (where data is decrypted, transformed, or forwarded), all storage locations (databases, caches, logs, temp files, Kafka topics), and the purge mechanism for each. The map must reflect reality, not just design intent — verified by checking actual log formats, cache contents, and temporary storage. A table list (A) misses non-database storage like logs and caches. Encryption documentation (C), network diagrams (D), and retention policies (E) are all necessary but do not provide the end-to-end tracing evidence the assessor is requesting.",
      "context": {
        "PCI-DSS Req 3": "Protect stored cardholder data — requires knowing all storage locations",
        "Data flow map": "Shows every point where sensitive data enters, moves through, is stored, and is destroyed"
      }
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 4,
      "q": "You are tracing a failed payment transaction and discover that the Transaction Processor service published a Kafka event, but the Ledger service's consumer never processed it. The Kafka broker shows the message was delivered to the partition. The consumer group shows no offset advance for that partition during the relevant time window. What is the most likely cause, and how do you design for better observability of this failure mode?",
      "opts": [
        "The consumer was likely in a rebalancing state during the relevant window — either a pod restart or scaling event caused the partition to be unassigned, and by the time the new consumer took over, processing resumed from the last committed offset, skipping the problematic window; the design improvement is to add consumer health metrics that track partition assignment changes and lag per partition, with alerts on unassigned partitions exceeding a threshold duration",
        "The Kafka topic's retention period may have expired before the consumer could process the message, since the default retention of 7 days could be insufficient if the consumer was offline for an extended maintenance window — increasing the topic retention period to 14 days or configuring infinite retention for financial event topics would prevent future message expiry before processing",
        "The Kafka message was likely corrupted during network transmission between the broker and the consumer, causing the consumer's deserialiser to silently drop the malformed record — enable consumer-level error logging for deserialisation failures and configure a dead-letter topic to capture corrupted messages for manual investigation and replay",
        "The Ledger service's PostgreSQL database was likely down or unreachable during the relevant time window, which prevented the Kafka consumer from persisting the processed event record — the consumer may have caught the database connection exception, logged it, but continued processing subsequent messages without retrying the failed record",
        "The producer may have used an incorrect topic name or published the transaction event to a different topic partition than expected, causing the message to be delivered to the wrong consumer group — verify the producer's topic configuration and the partition key used for routing to confirm the message was published to the intended destination"
      ],
      "ans": 0,
      "fb": "When a message is on the partition but the consumer group shows no offset advance, the most common cause is a partition assignment gap — the consumer was not assigned to that partition during the relevant window. This happens during rebalancing triggered by pod restarts, scaling events, or consumer crashes. The offset did not advance because no consumer was reading the partition. The design improvement is observability: metrics that track partition assignment state and duration of unassigned windows, with alerts that detect when a partition goes unassigned for longer than an acceptable threshold. Message corruption (A) is extremely rare in Kafka. Database downtime (C) would show processing attempts, not missing offset advances. Retention expiry (D) is unlikely within a normal processing window. Wrong topic (E) would not show the message on the correct partition.",
      "context": {}
    },
    {
      "level": 4,
      "diff": 2,
      "scenario": 4,
      "q": "A compliance review requires you to demonstrate that every state transition of a financial transaction is recorded with an immutable audit trail. Your platform records state changes (INITIATED, AUTHORIZED, SETTLED, FAILED) in the Transaction Processor's database. However, you discover that state transitions are implemented as UPDATE statements that overwrite the previous status. What design change is needed?",
      "opts": [
        "Add a database trigger on the transaction status column that logs every UPDATE operation to a separate audit table, capturing the old status, new status, timestamp, and the database session user — this provides an automatic audit trail without requiring application code changes and captures state transitions even if they bypass the application layer",
        "Add a before-update constraint check that prevents overwriting a terminal status such as SETTLED or FAILED, ensuring that once a transaction reaches a final state it cannot be modified — this protects the integrity of completed transactions but does not address the need for a complete history of intermediate state transitions",
        "Store a cryptographic hash of each state transition record in a separate blockchain-style ledger table, where each entry includes the hash of the previous entry to form a tamper-evident chain — this provides mathematical proof that the audit trail has not been modified after the fact and satisfies the immutability requirement",
        "Redesign the state transition model to use an append-only event log: each state change inserts a new row with the transaction ID, new status, timestamp, actor, and reason — the current state is derived from the latest entry; this provides an immutable, auditable history that cannot be altered by subsequent updates",
        "Enable PostgreSQL's pg_audit extension to log all SQL statements executed against the transaction table, including UPDATE statements that change the status column — this provides a comprehensive audit log of all database operations at the SQL level, capturing who executed each statement and when, without requiring any application code changes"
      ],
      "ans": 3,
      "fb": "An immutable audit trail requires that previous states are preserved, not overwritten. An append-only event log where each state change is a new row provides a complete, tamper-evident history. The current state is derived from the latest entry, and the full history is always available. Database triggers (A) are brittle and can be bypassed. pg_audit (D) logs SQL statements but does not provide a structured audit trail that compliance can query. Before-update checks (C) prevent some overwrites but do not create a history of past transitions. A blockchain-style ledger (E) is unnecessary complexity for an internal audit requirement.",
      "context": {
        "Append-only event log": "Each state change is an INSERT, not an UPDATE — previous states are never modified",
        "Immutable audit trail": "A record that cannot be altered after the fact, providing evidence of the complete history"
      }
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 4,
      "q": "You are tasked with designing a reconciliation system that verifies every financial transaction processed by the platform matches the records held by the external banking partner. The platform processes 100,000 transactions per day across three banking partners, each with different API formats and reconciliation schedules. What design approach ensures completeness and correctness?",
      "opts": [
        "Build a single monolithic reconciliation job that connects to all three banking partner APIs simultaneously at end of day, downloads their transaction records in bulk, and compares them against the platform's internal transaction records in a single batch run — this centralised approach ensures all reconciliation happens in one coordinated process with a single execution log, unified audit trail, and one operational runbook, and avoids the complexity of managing three separate reconciliation processes with independent schedules and failure handling",
        "Build three completely separate reconciliation systems, each dedicated to one banking partner and managed by different engineering teams with their own independent codebases, deployment pipelines, operational runbooks, and on-call rotations — this ensures each team can specialise in their partner's specific API format, authentication mechanism, reconciliation schedule, file format, and discrepancy resolution process without cross-team dependencies or coordination overhead that would slow down partner-specific iterations",
        "Design a reconciliation framework with these elements: a canonical internal transaction record as the source of truth, per-partner adapters that normalise each partner's format to the canonical model, a matching engine that identifies matched, unmatched, and discrepant records, a configurable schedule per partner aligned to their reconciliation windows, and an escalation workflow for unresolved discrepancies with SLA-based deadlines — with each component independently testable and the matching results stored as auditable evidence",
        "Ask each banking partner to adopt a standardised transaction record format such as ISO 20022 or a custom schema defined by the platform, so that a single reconciliation process with one parser and one matching algorithm can handle all three partners identically — this eliminates the need for per-partner adapters, format translators, and field mapping configurations, simplifying the reconciliation engine to a single normalised pipeline that treats all partner data uniformly regardless of source",
        "Rely on the banking partners to proactively notify the platform of any transaction discrepancies through their own reconciliation processes, since the banking partners hold the authoritative financial records and have regulatory obligations to detect and report discrepancies — the platform should only investigate discrepancies that partners escalate rather than running its own matching"
      ],
      "ans": 2,
      "fb": "A reconciliation system for multiple partners with different formats and schedules requires a structured framework, not a monolithic job. The canonical model normalises partner differences, the matching engine handles the core logic, per-partner adapters handle format translation, and configurable schedules align to each partner's availability. Storing matching results as auditable evidence satisfies compliance requirements. A single end-of-day job (A) does not accommodate partners with different schedules. Standardising partner formats (C) is outside your control. Separate systems per partner (D) duplicates the matching logic. Relying on partners (E) abdicates your platform's responsibility to detect its own discrepancies.",
      "context": {
        "Canonical model": "A standardised internal representation that normalises differences across external partners",
        "Reconciliation matching": "Compare internal records against external records to identify matches, mismatches, and gaps"
      }
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 4,
      "q": "During end-to-end transaction tracing for a compliance audit, you discover that a payment transaction has different amounts recorded in two services: the Transaction Processor shows a charge of 100.00, but the Ledger shows 99.95. Investigation reveals that the Transaction Processor applies a fee of 0.05 and publishes the net amount in the Kafka event, but the Ledger records the net amount as the transaction amount without recording the fee separately. The auditor asks: is this a system defect or a design gap? How do you respond?",
      "opts": [
        "It is a rounding error caused by floating-point arithmetic precision loss during the fee calculation in the Transaction Processor — the fix is to switch all monetary calculations from double to BigDecimal with explicit rounding mode (HALF_UP) and scale (2 decimal places), which will ensure the Ledger receives the exact same amount that the Transaction Processor calculated",
        "It is a design gap: the event published by the Transaction Processor should include both the gross amount and the fee breakdown so the Ledger can record the complete financial picture — the current design loses information at the service boundary, making the audit trail incomplete; the fix is to enrich the Kafka event schema with fee details and update the Ledger to record gross amount, fees, and net amount as separate fields",
        "The Ledger service is recording correctly because it faithfully persisted the net amount of 99.95 that it received in the Kafka event — the Ledger's responsibility is to record what it is told, not to reconstruct upstream calculations, and the 100.00 in the Transaction Processor is the gross amount before fees, which is a different data point entirely",
        "The Transaction Processor should not apply fees at all because fee calculation is the Ledger service's responsibility — move all fee logic to the Ledger where the complete financial record is maintained, so that the gross amount, fee calculation, and net amount are all computed and recorded in a single service with a single database transaction",
        "The discrepancy is acceptable from an audit perspective as long as both the Transaction Processor and Ledger services can be queried independently to reconstruct the full financial picture — the gross amount lives in one service and the net amount in another, and a compliance query can join both sources to produce the complete fee breakdown"
      ],
      "ans": 1,
      "fb": "This is a design gap, not a defect. The Transaction Processor applies a fee and publishes only the net amount, losing the fee information at the service boundary. The Ledger records what it received, but the audit trail is incomplete because no single service records the complete financial breakdown. The fix is an event schema enrichment: the Kafka event must carry gross amount, fee breakdown, and net amount so the Ledger can record the full picture. Calling it a rounding error (A) misdiagnoses the cause. Saying the Ledger is correct (C) ignores the audit trail gap. Moving fee logic to the Ledger (D) does not solve the schema problem. Querying both services (E) is a workaround that will not satisfy auditors who need a single authoritative record.",
      "context": {
        "Event schema enrichment": "Adding fields to an event to carry information that downstream services need for complete record-keeping",
        "Audit trail completeness": "Every financial calculation must be traceable from gross to net with all intermediate steps visible"
      }
    },
    {
      "level": 4,
      "diff": 3,
      "scenario": 4,
      "q": "You are building end-to-end transaction tracing capability for the platform. Currently, each service logs independently, and there is no standardised way to correlate a transaction's journey across services. You must design a tracing strategy that satisfies both operational debugging and compliance requirements. What is the correct architectural approach?",
      "opts": [
        "Use Kafka message headers to propagate the transaction ID and tenant context from the producing service through to all downstream consumers, then build a dedicated aggregator consumer that reads from all payment-related Kafka topics and assembles a complete event timeline for each transaction — this provides a centralised trace view without requiring changes to individual service logging, though it only covers event-driven portions of the flow",
        "Build a custom distributed tracing library as a shared Maven dependency that each Spring Boot service must integrate, providing standardised span creation, context propagation via HTTP headers and Kafka headers, and trace storage in a centralised PostgreSQL database — this ensures all services use identical tracing semantics and produces consistent trace data that can be queried by transaction ID",
        "Add the transaction ID as a structured log field to all log messages across all services using SLF4J's MDC (Mapped Diagnostic Context), then use Cloud Logging's advanced query syntax to search across all service logs by transaction ID — this provides a lightweight correlation mechanism that requires minimal code changes and leverages existing logging infrastructure, though it lacks the structured parent-child span relationships and latency measurements that a purpose-built distributed tracing system provides",
        "Deploy Jaeger as the platform's distributed tracing backend and rely on OpenTelemetry's automatic instrumentation for Spring Boot to capture all HTTP and Kafka spans without requiring manual code changes — auto-instrumentation automatically captures entry and exit points for all inbound and outbound calls, providing complete trace coverage across all services in the platform with span timing, parent-child relationships, and error propagation, without engineers needing to add any manual instrumentation code",
        "Mandate OpenTelemetry instrumentation with auto-instrumentation for Spring Boot services as the base layer, supplemented by manual span annotations at critical business boundaries (payment state transitions, fee calculations, ledger entries) — propagate the business transaction ID alongside the trace ID through HTTP headers and Kafka headers so that both operational traces and compliance audit trails can be correlated — store traces in Grafana Tempo for operational use and export critical business spans to an immutable audit store for compliance retention"
      ],
      "ans": 4,
      "fb": "The correct approach layers operational tracing (OpenTelemetry, Grafana Tempo) with compliance tracing (business transaction ID, immutable audit store). Auto-instrumentation captures the technical trace; manual annotations at business boundaries capture the compliance-relevant steps. Propagating both the trace ID and business transaction ID through HTTP and Kafka headers allows correlation between operational and compliance views. Relying solely on auto-instrumentation (A) misses business-level annotations. Log-based correlation (C) is fragile and does not provide structured trace data. A custom library (D) reinvents what OpenTelemetry provides. Kafka-only aggregation (E) misses synchronous HTTP call paths.",
      "context": {
        "Dual-purpose tracing": "Operational traces for debugging and compliance traces for audit serve different retention, query, and evidence requirements",
        "Business span annotation": "Manual instrumentation at domain-significant points (state transitions, calculations) that auto-instrumentation cannot infer"
      }
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 1,
      "q": "The VP of Engineering asks you to scope a migration from a monolithic Spring Boot application to a microservices architecture. Three teams share the monolith. The VP wants a timeline and cost estimate. What is the correct first step before producing any estimates?",
      "opts": [
        "Look at published case studies from other fintech companies of similar size that have completed monolith-to-microservices migrations, extract their average timelines and cost per extracted service, and use those benchmarks as the basis for your own estimate — adjusting for differences in team size, technology stack, and domain complexity between their platform and yours",
        "Ask each of the three teams that share the monolith to independently estimate how long it would take them to extract their portion into separate services, then aggregate the three estimates into a total timeline — the teams closest to the code have the most accurate understanding of the coupling complexity and migration effort for their respective domains",
        "Estimate the total number of microservices that will be needed after decomposition based on the current module structure, then multiply by an average development time per service derived from industry benchmarks for similar Spring Boot service extractions — typically 4-6 weeks per service including API contracts, database separation, and integration testing",
        "Decompose the monolith into bounded contexts by analysing the domain model, data ownership, and team boundaries — then identify which boundaries are real (different data, different release cadences, different scaling needs) and which are artificial (shared data, tightly coupled logic) — because the decomposition strategy determines the scope, risk, and sequencing of the migration, without which any timeline is fiction",
        "Start by extracting the simplest and most independent module from the monolith to establish a concrete velocity baseline for service extraction, then extrapolate the timeline for the remaining modules based on the actual effort observed during the first extraction — this empirical approach produces more accurate estimates than theoretical decomposition analysis"
      ],
      "ans": 3,
      "fb": "Any timeline or cost estimate for a monolith decomposition is meaningless without first understanding the actual boundaries in the codebase. Bounded context analysis reveals which parts are genuinely independent (different data, different release cadences) versus tightly coupled (shared schemas, transactional dependencies). This analysis determines how many services are needed, which extractions are safe versus risky, and what sequencing is required. Counting services and multiplying (A) produces fabricated precision. Team estimates without decomposition analysis (C) will undercount shared dependencies. External benchmarks (D) do not account for your platform's specific coupling. Extracting the simplest module first (E) is a reasonable tactical step but does not answer the VP's scoping question.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 1,
      "q": "You are presenting a phased migration plan to leadership for moving the platform from a shared PostgreSQL schema to service-owned schemas. Leadership wants to understand the risk. What is the single most important risk to communicate clearly?",
      "opts": [
        "The transition period where some services have migrated and others have not is the highest-risk phase — during this period, data that was previously accessed via SQL joins must be accessed via inter-service calls or event-driven replication, and any gap in this translation creates data inconsistency or service failures",
        "The migration to service-owned schemas will require more total storage space due to data replication across services — data that was previously stored once in the shared schema will now be duplicated as each service maintains its own copy of the data it needs, increasing Cloud SQL storage costs proportionally to the degree of data overlap",
        "Some engineering teams may resist the schema separation because they prefer the current shared schema's simplicity — cross-table JOINs are straightforward, there is no data synchronisation complexity, and developers can query any data they need without building inter-service APIs or consuming events from other teams' Kafka topics",
        "Developer productivity will decrease significantly during the transition period because teams will need to learn new patterns for accessing data that was previously available via simple SQL JOINs — building event consumers, designing API contracts, and managing eventual consistency are all new skills that require ramp-up time and will slow feature delivery",
        "The schema migration will require production downtime during the actual schema changes, since separating tables that currently share foreign key relationships and moving them to service-owned schemas requires coordinated DDL operations that cannot be performed while the services are actively reading and writing to the shared tables"
      ],
      "ans": 0,
      "fb": "The highest risk in any phased migration is the hybrid state — the period where the old and new architectures coexist. During this phase, services that have migrated can no longer join across tables they previously shared, and services that have not migrated still depend on the old schema. Every interaction between migrated and unmigrated services is a potential failure point. This risk determines the sequencing strategy and must be communicated clearly so leadership understands why phasing matters. Downtime (A), productivity (B), storage (D), and resistance (E) are real concerns but secondary to the data consistency risk in the hybrid period.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 1,
      "q": "You are scoping a platform-wide migration from synchronous REST-based inter-service communication to event-driven architecture using Kafka for three critical payment flows. Leadership asks for a phased approach that minimises disruption. How do you structure the phases?",
      "opts": [
        "Structure three phases, each migrating one payment flow: Phase 1 migrates the lowest-risk flow (e.g. notification dispatch) to validate the event-driven pattern end-to-end; Phase 2 migrates a medium-complexity flow using lessons from Phase 1; Phase 3 migrates the highest-risk flow (e.g. settlement) with the full operational playbook — each phase includes a parallel-run period where both REST and Kafka paths process traffic, with comparison checks, before decommissioning the REST path",
        "Implement a universal REST-to-Kafka adapter service that sits between the existing REST-based services and translates all current synchronous HTTP calls into asynchronous Kafka messages without requiring any changes to the existing service logic — this provides a gradual migration path where services can be individually reconfigured to produce and consume Kafka events through the adapter layer",
        "Migrate all three payment flows simultaneously in a single coordinated release to minimise the duration of the hybrid state where some flows use REST and others use Kafka — a parallel cutover reduces the total calendar time of the migration and avoids the operational complexity of maintaining two communication patterns during a prolonged phased transition",
        "Start with the most complex and highest-risk payment flow first — such as the settlement flow — to tackle the hardest migration challenge while the team has fresh energy and focus, since delaying the most difficult work to later phases risks discovering fundamental blockers after significant effort has been invested in the simpler migrations",
        "Ask each team to independently migrate their own service interactions from REST to Kafka on their own timeline without any cross-team coordination or shared migration plan, since each team understands their service's specific communication patterns best and can choose the optimal migration approach, error handling strategy, and event schema design for their consumers"
      ],
      "ans": 0,
      "fb": "Phased migration with increasing complexity is the canonical approach for presenting to leadership. Starting with the lowest-risk flow validates the pattern, builds operational experience, and produces a playbook for subsequent phases. Each phase includes parallel running — both old and new paths active simultaneously — to catch discrepancies before decommissioning the old path. Migrating all at once (A) multiplies risk. Starting with the hardest (C) risks a costly failure before the team has experience. Independent team migration (D) creates coordination gaps in shared flows. A universal adapter (E) adds a translation layer without delivering the architectural benefits of event-driven design.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 1,
      "q": "Leadership approves a migration to separate the Ledger service's read and write paths using CQRS. The Ledger currently handles 2,000 writes/second and 15,000 reads/second. You must present a phased plan. The key architectural risk is that the read model, fed by Kafka events, introduces eventual consistency where the current design provides strong consistency. How do you present this trade-off to non-technical leadership?",
      "opts": [
        "Frame it in business terms: after a balance update, the dashboard may show the previous balance for up to 500 milliseconds before reflecting the change — under normal load, this delay is imperceptible, but during outages the delay could extend to seconds — then present the monitoring and alerting strategy that detects when the delay exceeds acceptable thresholds and the fallback mechanisms that preserve correctness for critical operations like balance checks at transaction time",
        "Tell leadership that eventual consistency means the platform will sometimes display incorrect or outdated balance information to customers and let them decide whether that level of data staleness is acceptable for the business — frame the trade-off as a binary choice between perfect consistency with current performance and eventual consistency with improved read latency",
        "Tell leadership that eventual consistency is an industry-standard architectural pattern used by every major financial technology platform including Stripe, Square, and modern banking systems — they should not be concerned about it because the pattern has been proven at scale and the platform's adoption of CQRS follows established best practices",
        "Avoid mentioning the eventual consistency trade-off to leadership because it will create unnecessary concern and potentially block the migration approval — focus the presentation entirely on the performance benefits (7.5x read throughput improvement) and operational scalability gains, and address consistency questions only if leadership specifically asks about them",
        "Present a fully strongly-consistent CQRS design that uses distributed transactions with two-phase commit between the write model and read model to avoid the eventual consistency trade-off entirely — this eliminates the need to discuss staleness with leadership and provides the read performance benefits without any consistency compromise for customers"
      ],
      "ans": 0,
      "fb": "Non-technical leadership needs trade-offs framed in business impact terms, not technical jargon. Saying 'eventual consistency' means nothing to a VP; saying 'the dashboard may show the previous balance for up to 500ms' is concrete and actionable. Quantifying the normal delay, the worst-case delay during outages, and the monitoring strategy demonstrates that the risk is understood and managed. Framing it as 'sometimes wrong data' (A) is technically accurate but alarmist. Dismissing the concern (C) or hiding it (D) erodes trust when leadership discovers the trade-off later. Distributed transactions for CQRS (E) negate the performance benefit that motivated the migration.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 1,
      "q": "You have scoped a migration to replace the platform's custom API gateway with a managed service (e.g. Apigee or Cloud Endpoints). The migration affects all 15 services. During the scoping, you discover that three services have embedded custom authentication logic in the current gateway that the managed service does not support natively. Leadership wants a timeline. How do you present the scope accurately?",
      "opts": [
        "Present two phases: Phase 1 migrates the 12 services that the managed gateway supports natively, with a concrete timeline and low risk; Phase 2 addresses the three services with custom authentication, which requires either refactoring the auth logic into the services themselves or building a custom plugin for the managed gateway — present Phase 2 with a range estimate and a spike to reduce uncertainty, and make clear that the total timeline is Phase 1 plus Phase 2, not just Phase 1",
        "Recommend that the three services with custom authentication logic keep using the old custom gateway indefinitely to avoid the complexity of migrating their embedded business logic, while the other 12 services move to the managed gateway — maintain both gateways permanently with separate operational runbooks and monitoring dashboards for each",
        "Exclude the three services with custom authentication from the migration timeline and note them as explicitly out of scope in the planning document — present the timeline for the 12 straightforward services only, with a footnote that the remaining three will be addressed in a future initiative once the authentication refactoring approach is determined",
        "Include all 15 services in a single unified timeline with a buffer of 4-6 weeks added to account for the authentication refactoring complexity, since presenting two separate phases may confuse leadership and make the project appear more risky than it actually is — a single timeline with appropriate padding is a simpler and more decisive presentation",
        "Tell leadership that the custom authentication requirement embedded in three services means the managed API gateway migration is not viable for the platform at this time — recommend postponing the entire gateway migration initiative until the authentication logic has been independently refactored out of the gateway layer as a separate prerequisite project first"
      ],
      "ans": 0,
      "fb": "Accurate scoping requires separating the known (12 straightforward services) from the uncertain (3 services with custom auth). Presenting two phases gives leadership a reliable Phase 1 timeline while being honest about Phase 2 uncertainty. A spike in Phase 2 to evaluate the auth refactoring options reduces uncertainty before committing to a timeline. Excluding the three services (A) misleads on total scope. Padding a single timeline (C) hides the structural risk. Keeping the old gateway for three services (D) maintains two gateways indefinitely. Declaring the migration non-viable (E) abandons a valid initiative because of a solvable problem.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 1,
      "q": "You are presenting a major architectural shift to the board: migrating the platform from a single-region GCP deployment to a multi-region active-active architecture to meet new disaster recovery SLAs. The migration will take 18 months and require significant investment. The board asks: 'What is the minimum viable step that gives us some DR capability while the full migration is in progress?' How do you respond?",
      "opts": [
        "Suggest that the fastest and most cost-effective DR improvement is to increase the Cloud SQL backup frequency from daily to hourly, reducing the maximum data loss window (RPO) from 24 hours to 1 hour — this can be implemented within a week through a configuration change and requires no architectural modifications to the existing platform deployment",
        "Explain to the board that there is no meaningful intermediate step between the current single-region deployment and a full active-active multi-region architecture — DR capability requires both regions to actively serve traffic, and a partially-implemented multi-region setup would give false confidence without actually providing reliable failover capability",
        "Recommend purchasing a commercial disaster recovery solution such as Zerto or CloudEndure that specialises in cross-region replication and automated failover, rather than investing 18 months of engineering effort building custom DR infrastructure in-house — commercial solutions provide faster time-to-value and come with SLA guarantees from the vendor",
        "Propose that only the Payments service — the single most critical service on the platform — be deployed in a multi-region active-active configuration, with all other services remaining single-region — this concentrates the DR investment on the highest-value service and reduces the multi-region migration scope by approximately 90%",
        "Propose a phased approach where the first milestone (achievable in 3-4 months) is a warm standby in a second region with automated database failover and read-only service replicas — this provides RTO of minutes for database recovery and a fallback for read traffic, while the full active-active migration continues in parallel; present the risk reduction at each milestone so the board can see incremental value, not just a binary 18-month bet"
      ],
      "ans": 4,
      "fb": "The board is asking for incremental risk reduction, not an all-or-nothing commitment. A warm standby with automated database failover provides meaningful DR capability (database-level RTO of minutes) at a fraction of the full active-active complexity and can be delivered early in the migration timeline. Presenting milestones with risk reduction at each step lets the board see value accruing continuously rather than waiting 18 months. Claiming no intermediate step (A) fails to decompose the problem. Hourly backups (C) improve RPO slightly but do not address RTO. A commercial solution (D) may not integrate with the platform's specific architecture. Single-service multi-region (E) is a valid tactic but does not address the DR requirement holistically.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 1,
      "q": "You have been scoping a migration to replace the platform's Kafka deployment with Confluent Cloud to reduce operational overhead. During evaluation, you discover that two teams have built custom Kafka Streams applications that rely on internal Kafka features not available in Confluent Cloud's managed offering. The migration for the other 10 services is straightforward. Leadership wants a recommendation. How do you present this?",
      "opts": [
        "Recommend rewriting both Kafka Streams applications from scratch using standard Kafka consumer APIs that are fully compatible with Confluent Cloud's managed offering, eliminating the dependency on internal Kafka features — while this is a significant engineering investment, it produces a clean migration path and avoids the long-term operational cost of maintaining two separate Kafka infrastructures",
        "Migrate the 10 straightforward services to Confluent Cloud immediately and defer the two Kafka Streams applications indefinitely, keeping them on the self-managed Kafka cluster — the operational overhead of maintaining the self-managed cluster is acceptable since it only serves two applications, and eventually the Kafka Streams applications may be retired or rewritten as part of normal platform evolution",
        "Ask the two teams that own the Kafka Streams applications to investigate potential workarounds for the internal Kafka feature dependencies and present their findings in 3 months before making any migration decision — this provides time for the teams to evaluate whether the features can be replaced with Confluent Cloud-compatible alternatives without committing to a migration timeline prematurely",
        "Present a decision framework: quantify the operational cost savings from migrating the 10 straightforward services, estimate the refactoring cost for the two Kafka Streams applications, and present three options with trade-offs — (1) migrate all 12 with refactoring, showing total cost and timeline; (2) migrate 10 and keep the two on self-managed Kafka, showing ongoing dual-infrastructure cost; (3) defer the migration until all 12 can move, showing the cost of delay — with a clear recommendation based on which option delivers the best risk-adjusted ROI",
        "Recommend against the entire Confluent Cloud migration because two services cannot be migrated without significant refactoring work, and maintaining a dual Kafka infrastructure permanently — one self-managed cluster for the two Kafka Streams applications and Confluent Cloud for the other ten services — is operationally unacceptable and would double the on-call burden and operational knowledge requirements for the platform team"
      ],
      "ans": 3,
      "fb": "The Expert's role is to present structured options with quantified trade-offs, not to make the decision unilaterally or defer it indefinitely. By quantifying the savings, the refactoring cost, and the dual-infrastructure cost, the framework lets leadership make an informed choice. Recommending against the entire migration (A) lets two services block ten. Migrating 10 and deferring two indefinitely (C) accepts permanent dual infrastructure without evaluating alternatives. Rewriting from scratch (D) may be the right choice but should be presented as an option with cost, not as the only path. Deferring for 3 months (E) delays the decision without adding information.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 2,
      "q": "Two teams have been debating for three weeks whether a new feature should be implemented as a synchronous REST API or an asynchronous Kafka event flow. Both teams have written design documents defending their position. The product owner asks you to help resolve the impasse. What is the Expert's first move?",
      "opts": [
        "Propose a compromise architecture that uses both REST and Kafka for the new feature: synchronous REST for the initial request-response and asynchronous Kafka for subsequent updates and notifications — this gives each team the communication pattern they advocated for and avoids either side feeling they lost the debate",
        "Escalate the impasse to the VP of Engineering and request a management decision, since the two teams have been debating for three weeks without resolution and the product owner needs the feature delivered — a leadership tiebreaker is the most time-efficient way to resolve a deadlock that technical discussion has failed to break",
        "Ask each team to present their design case in a joint architecture guild meeting, then hold a structured vote among all attending senior engineers to determine which approach the platform should adopt — democratic decision-making ensures the outcome has broad support and prevents any single team from feeling overruled by authority",
        "Identify the hidden assumptions driving each position — often the disagreement is not about REST vs Kafka but about different assumptions regarding latency requirements, failure tolerance, or data consistency needs — surface these assumptions explicitly so the teams can see where they actually disagree versus where they agree",
        "Read both design documents carefully, evaluate the technical merits of each approach based on your own architectural expertise, and select the one that is technically stronger — the Expert's role is to make decisive technical judgments, and picking the better-designed solution is more efficient than extended facilitation when both teams have already made their cases"
      ],
      "ans": 3,
      "fb": "Stuck design decisions almost always have hidden assumptions that the teams have not made explicit. One team may assume sub-second response time is required (favouring REST); the other may assume at-least-once delivery is critical (favouring Kafka). These are not contradictory — they reflect different views of the requirements. The Expert's role is to surface these assumptions so the real disagreement becomes visible, which often reveals that the teams agree on more than they think. Picking a winner (A) resolves the impasse but does not address the underlying disagreement. Voting (B) produces a political outcome. A compromise (D) doubles complexity. Escalation (E) is premature before facilitation has been attempted.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 2,
      "q": "A design discussion has stalled because the team cannot agree on whether to use a relational PostgreSQL schema or a document-oriented approach for a new feature. Both sides cite performance as their main argument. What question should the Expert ask to unblock the discussion?",
      "opts": [
        "Which database technology approach is the team more familiar with — relational PostgreSQL or document-oriented stores like MongoDB? Team familiarity reduces implementation risk and accelerates delivery, since engineers will make fewer mistakes and need less ramp-up time working with a technology they already understand well",
        "What does the architecture guild's current technology radar recommend for data storage patterns? The guild's guidance should be the primary input for data model decisions, since the guild has already evaluated the platform's technology landscape and established standards that ensure consistency across services",
        "What are the actual query patterns and access patterns for this feature — reads versus writes, single-record lookups versus multi-record aggregations, schema evolution frequency — because the data model decision should be driven by the access pattern, not by abstract performance claims",
        "Can the team build a time-boxed proof-of-concept implementing the feature with both a relational PostgreSQL schema and a document-oriented approach, then compare the two implementations on query performance, schema flexibility, and developer ergonomics to make a data-driven decision based on measured results?",
        "Are there published benchmark results comparing PostgreSQL and document databases for this type of use case — specifically looking at read latency percentiles, write throughput under concurrent load, and storage efficiency — since performance is the main argument both sides are citing and benchmarks provide objective evidence?"
      ],
      "ans": 2,
      "fb": "Design decisions get stuck when the arguments are abstract rather than grounded in the actual use case. Asking about concrete access patterns — how the data will be read, written, queried, and evolved — reframes the discussion from 'which technology is better in general' to 'which approach serves our actual needs'. Performance claims without access pattern context are meaningless. Benchmarks (A) are useful but only after the access pattern is defined. Team familiarity (C) is relevant but should not drive data model decisions. Guild recommendations (D) are general, not feature-specific. Prototyping both (E) is expensive and should only be done after the question is well-framed.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 2,
      "q": "You are facilitating a design review where a team proposes a complex saga orchestrator for a workflow that currently uses a simple two-step synchronous flow. A senior engineer on the team argues for the saga because 'we will need it eventually as the system grows.' Another engineer argues the current synchronous approach is fine because the workflow has only two steps and 50 requests per second. The discussion is going in circles. How do you break the deadlock?",
      "opts": [
        "Defer the decision and ask the team to gather more detailed data on growth projections for the next 12-18 months, including expected request volume increases, new workflow steps that might be added, and the likelihood of additional external integrations — more data will clarify whether the current synchronous approach will become insufficient and justify the saga investment",
        "Acknowledge both positions, then reframe the decision: ask the team to define the specific trigger that would justify migrating to a saga — for example, 'if the workflow exceeds 3 steps or 500 RPS' — and document this as a decision with a revisit condition, so the team adopts the simpler approach now with a clear, measurable threshold for when to reconsider",
        "Side with the second engineer's position because simplicity should always be the default architectural choice until concrete evidence demands otherwise — the current two-step synchronous flow at 50 RPS works correctly, and introducing a saga orchestrator for a hypothetical future need violates the YAGNI principle and adds unjustified operational complexity",
        "Side with the senior engineer because their greater experience with the platform gives them better judgment about where architectural complexity is heading, and building the saga infrastructure now is less expensive than retrofitting it later when the workflow has grown to multiple steps and production traffic makes migration risky",
        "Ask the team to implement the saga orchestrator now because refactoring from a synchronous flow to a saga pattern later is significantly more expensive and risky than building it correctly from the start — the incremental cost of the saga infrastructure is small compared to the future migration cost when the workflow inevitably becomes more complex"
      ],
      "ans": 1,
      "fb": "The Expert breaks the deadlock by separating the 'what do we do now' decision from the 'when do we reconsider' decision. The current workflow's simplicity (two steps, 50 RPS) does not justify a saga orchestrator's complexity. But the senior engineer's concern about future growth is legitimate. The resolution is to adopt the simpler approach with a documented revisit condition: a specific, measurable threshold that triggers reconsideration. This gives the team a clear decision now and a defined escalation path later. Siding with either person (A, B) is a political resolution. Building for hypothetical future needs (D) is premature engineering. Deferring for more data (E) prolongs the deadlock when the current data is sufficient for the current decision.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 2,
      "q": "A team is designing a tenant onboarding flow and is stuck between two approaches: provisioning a dedicated database schema per tenant for strong isolation, or using row-level security (RLS) on shared tables with a tenant ID column. The security team strongly favours schema-per-tenant. The platform team argues RLS is operationally simpler and scales better. Both sides have legitimate concerns. How do you facilitate this?",
      "opts": [
        "Ask both teams to write a formal ADR defending their preferred tenant isolation approach, then submit both ADRs to the architecture guild for a binding decision at the next biweekly guild session — this ensures the decision goes through the standard governance process and is documented with full context, alternatives, and consequences for future reference",
        "Surface the actual requirements: ask the security team what specific isolation guarantees they need (e.g. blast radius of a code defect, regulatory data residency, independent backup/restore per tenant) and ask the platform team to assess which of those guarantees RLS can and cannot provide — then evaluate whether RLS with additional controls (separate encryption keys, audit logging) meets the security requirements at lower operational cost",
        "Propose a hybrid architecture where high-value enterprise tenants receive dedicated schema-per-tenant isolation for maximum blast radius containment, while smaller self-service tenants use shared tables with row-level security — this gives the security team the strong isolation they want for the most sensitive tenants while accepting the platform team's operational efficiency argument for the rest",
        "Defer to the security team's recommendation for schema-per-tenant isolation because data isolation is fundamentally more important than operational simplicity on a financial platform — security requirements should take precedence over engineering convenience, and the platform team should invest in automation to manage the operational overhead of per-tenant schemas",
        "Defer to the platform team's recommendation for row-level security because they are responsible for maintaining the infrastructure long-term and understand the operational scaling implications — the platform team will bear the on-call burden of schema-per-tenant, so their assessment of operational feasibility should carry more weight"
      ],
      "ans": 1,
      "fb": "The teams are arguing about solutions (schema-per-tenant vs RLS) instead of requirements (what isolation guarantees are actually needed). The Expert's role is to decompose 'isolation' into specific, testable requirements — blast radius, data residency, backup granularity — and then evaluate which approach meets each requirement. RLS with additional controls may satisfy most security requirements at lower operational cost, but some requirements (e.g. independent backup/restore per tenant) may genuinely require schema separation. A hybrid approach (D) may emerge from this analysis but should not be proposed before the requirements are understood. Deferring to either team (A, B) avoids the Expert's facilitation responsibility.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 2,
      "q": "You are reviewing a design where two architects disagree on API versioning strategy. Architect A argues for URL path versioning (e.g. /v1/accounts, /v2/accounts) because it is explicit and easy to route. Architect B argues for content negotiation via Accept headers because it keeps URLs clean and allows more granular versioning. The platform currently has no versioning standard and needs one. How do you facilitate the decision?",
      "opts": [
        "Let each team decide their own API versioning strategy based on their service's specific consumer requirements, since there is no current standard and forcing a single approach before sufficient production experience is accumulated would be premature — once teams have implemented their chosen strategies, a natural standard will emerge from the most successful approach",
        "Pick content negotiation via Accept headers as the platform standard because it is more aligned with RESTful principles and HTTP specification semantics — the Accept header is the standard HTTP mechanism for content negotiation, and using it for API versioning follows the protocol's design intent, which promotes interoperability with standard HTTP clients and middleware",
        "Avoid versioning entirely by establishing a strict API evolution policy that ensures APIs never introduce breaking changes — use additive-only changes (new optional fields, new endpoints) and deprecation periods so that existing consumers are never broken, eliminating the need for explicit version management and the associated routing and maintenance complexity",
        "Map both approaches against the platform's actual constraints: how many external consumers exist and what integration sophistication they have, how the API gateway handles routing, what the deployment strategy is for running multiple versions simultaneously, and what the deprecation process looks like — then evaluate which approach better fits these real constraints rather than abstract REST purity",
        "Pick URL path versioning as the platform standard because it is simpler to implement and more widely adopted across the industry — developers can see the version directly in the URL, API gateway routing rules are straightforward, and most API documentation tools like Swagger and Redoc render URL-versioned APIs with clearer navigation between versions"
      ],
      "ans": 3,
      "fb": "The Expert resolves this by moving from architectural philosophy to platform reality. URL versioning is simpler for unsophisticated consumers and easy to route at the gateway level, but can lead to URL proliferation. Content negotiation is more granular but requires consumer sophistication and gateway support for header-based routing. The right choice depends on who the consumers are, what the gateway supports, and how the team manages multi-version deployments. Picking based on simplicity (A) or RESTfulness (B) ignores the platform context. Per-team choice (D) creates the divergence the standard is meant to prevent. Never breaking APIs (E) is aspirational but unrealistic for a growing platform.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 2,
      "q": "You are called in to facilitate a stuck design decision that has been escalated by three teams. The issue: two services need to share customer data, and the teams disagree on the sharing mechanism. Team A wants a shared database. Team B wants an event-driven data replication pattern. Team C wants a REST API. Each team has a reasonable argument based on their own service's needs. Previous facilitation attempts by their tech leads have failed because each lead advocates for their own team's preferred approach. How do you break through?",
      "opts": [
        "Ask the CTO to make the final decision to break the three-way deadlock, since the teams and their tech leads have already attempted to resolve the disagreement through technical discussion and facilitation — the decision has been escalated through the appropriate channels, and a leadership decision will end the impasse and allow all three teams to move forward with implementation",
        "Select the approach advocated by the most senior engineer among the three teams, since their deeper experience with distributed systems and the platform's evolution gives them the best judgment about which data sharing mechanism will serve the platform's long-term architectural direction — seniority should be the tiebreaker when technical arguments are evenly matched",
        "Acknowledge all three approaches, then shift the discussion from 'which mechanism' to 'what properties does this data sharing need to have' — define the requirements axis by axis: consistency latency (how stale can the data be?), failure isolation (what happens when one service is down?), schema evolution (how do changes propagate?), and query complexity (what access patterns are needed?) — then evaluate each approach against these axes and let the requirements determine the answer",
        "Build all three data sharing approaches and let each team use their preferred mechanism — Team A uses the shared database for direct queries, Team B consumes events for data replication, and Team C calls the REST API on demand — since each approach is technically sound and the teams have already demonstrated they cannot agree on a single pattern",
        "Form a committee of the three tech leads with a formal 2-week deadline to reach consensus on the data sharing mechanism, using a structured decision-making framework such as weighted scoring against agreed criteria — if the committee cannot reach consensus within the deadline, escalate to the architecture guild for a binding arbitration decision"
      ],
      "ans": 2,
      "fb": "When three teams each advocate for their own approach, the facilitation has been framed wrong — it is a political negotiation, not a requirements-driven decision. The Expert reframes by defining the requirements axes that any solution must satisfy. Once the teams agree on the properties the data sharing needs (consistency latency, failure isolation, schema evolution, query patterns), the mechanism often becomes obvious — or at least the trade-offs become explicit and defensible. Seniority-based decisions (A) produce resentment. Committee-based deadlines (C) repeat the failed pattern with a timer. Building all three (D) triples maintenance. CTO escalation (E) signals process failure and produces a decision without the teams' understanding or buy-in.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 2,
      "q": "A design decision has been stuck for two months: whether to build a new notification system in-house or adopt a third-party service. The engineering team strongly prefers building in-house for control and customisation. Product management strongly prefers the third-party service for faster time-to-market. Technical arguments have been exchanged extensively and both sides have valid points. You are asked to facilitate a final decision. What is the Expert's approach?",
      "opts": [
        "Side with the engineering team because they understand the technical implications, maintenance burden, and long-term architectural consequences better than product management — building in-house provides full control over the notification system's feature roadmap, customisation for multi-tenant requirements, and avoids vendor lock-in that could constrain the platform's evolution in ways that are difficult to predict at evaluation time",
        "Reframe the decision as a build-vs-buy evaluation with explicit criteria: total cost of ownership over 3 years (including maintenance for build and licensing for buy), time-to-market difference quantified in weeks, customisation requirements mapped against the third-party service's extension model, vendor lock-in risk assessed against the platform's multi-tenancy and compliance requirements, and operational burden compared to current team capacity — then score both options against these criteria and present the result as a structured recommendation, not a preference",
        "Propose starting with the third-party notification service for immediate time-to-market advantage, with a planned migration to an in-house solution within 12-18 months once the product requirements are better understood — this gives product management the quick delivery they want while giving engineering the control they want on a defined timeline, treating the third-party service as a temporary bridge",
        "Side with product management because business needs and time-to-market should always take priority over engineering preferences for custom-built solutions — the third-party notification service already exists, has been proven at scale by other companies, and will deliver the capability months faster than an in-house build, directly serving the product roadmap and revenue goals that the business is counting on for the next quarter",
        "Ask each side to formally present their case to the CTO in a structured 30-minute session with slides, cost estimates, and risk assessments, then let the CTO make the final binding decision — this ensures the decision-maker has heard both the engineering and product perspectives directly and can weigh the technical trade-offs against business priorities with full context, producing a decision that carries executive authority and ends the two-month impasse"
      ],
      "ans": 1,
      "fb": "When a decision has been stuck for two months with valid technical and business arguments on both sides, the problem is not lack of information — it is lack of a decision framework. The Expert introduces explicit, measurable criteria that both sides agree to evaluate against. Total cost of ownership, time-to-market quantification, customisation fit, lock-in risk, and operational burden transform the debate from 'I prefer' to 'the data shows.' The structured result is a recommendation, not a mandate, but it is defensible because the criteria are transparent. Siding with either team (A, B) does not resolve the underlying tension. Starting with buy and planning to migrate (D) is a possible outcome but should emerge from the evaluation. CTO escalation (E) produces a decision without the structured reasoning the organisation needs for future similar decisions.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 3,
      "q": "Your platform currently uses Kafka for inter-service messaging. A team proposes adopting RabbitMQ for a new notification service because it supports priority queues natively, which Kafka does not. Before evaluating the technical merits, what is the Expert's first concern?",
      "opts": [
        "Whether the team proposing RabbitMQ has prior production experience operating and troubleshooting RabbitMQ clusters, since adopting a messaging system without operational expertise creates a knowledge gap that leads to longer incident resolution times and configuration mistakes in production environments",
        "Whether RabbitMQ is available under an open-source licence that is compatible with the platform's software licensing policy, since some messaging systems have recently changed their licensing terms in ways that restrict commercial use or require additional licensing fees for enterprise features",
        "Whether RabbitMQ can handle the platform's current and projected message throughput — specifically the peak events-per-second rate during high-traffic periods — since a messaging system that cannot match Kafka's throughput characteristics would create a performance bottleneck in the notification pipeline",
        "Whether RabbitMQ integrates cleanly with the platform's existing monitoring and alerting stack — Prometheus metrics exporters, Grafana dashboards, Cloud Monitoring integration, and PagerDuty alerting — since a messaging system without proper observability creates blind spots during production incidents",
        "Whether introducing a second messaging system creates operational overhead that outweighs the benefit — the platform team must now maintain, monitor, and troubleshoot two messaging systems, and engineers must understand two sets of semantics, failure modes, and configuration patterns"
      ],
      "ans": 4,
      "fb": "The Expert's first concern with any technology addition is not the technology's capability but the systemic cost of operating a second system. A second messaging platform means two sets of operational knowledge, two monitoring configurations, two sets of failure modes, and two on-call playbooks. The priority queue requirement must be weighed against this ongoing cost. Perhaps Kafka can approximate priority queues via separate topics, or perhaps the cost is justified — but the evaluation must start with the systemic impact, not the feature comparison. Throughput (A), team experience (B), monitoring integration (D), and licensing (E) are all relevant but secondary to the operational complexity question.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 1,
      "scenario": 3,
      "q": "A team asks you to evaluate whether the platform should adopt GraphQL for a new client-facing API, replacing the current REST approach. They cite reduced over-fetching and flexible queries as the main benefits. What is the Expert's first step in the evaluation?",
      "opts": [
        "Research GraphQL's performance characteristics in detail — query execution overhead, N+1 resolution patterns, batching behaviour, and caching limitations compared to REST — and present a comparative analysis showing where GraphQL outperforms REST and where it introduces latency penalties that could affect the platform's API response time SLOs",
        "Define the evaluation criteria before examining any technology: what problems does the current REST approach cause for clients, what are the security implications of allowing arbitrary query shapes, how does GraphQL interact with the platform's existing API gateway and authentication, and what is the migration cost for existing clients — then evaluate GraphQL against these criteria",
        "Set up a proof-of-concept GraphQL server using Spring Boot's GraphQL integration, implement three representative API endpoints in both REST and GraphQL, and run a benchmark comparing response times, payload sizes, and server resource consumption under simulated production load — present the quantitative results as the basis for the adoption decision",
        "Survey the engineering team across all services to assess how many engineers have prior GraphQL experience, what training investment would be required to bring the team to production readiness, and whether there is sufficient enthusiasm for the technology to sustain adoption — team capability and willingness are critical factors in any technology transition",
        "Review GraphQL adoption trends across the fintech industry and among peer companies to evaluate whether GraphQL is the right long-term strategic direction for the platform's API layer — industry momentum, community size, tooling maturity, and the trajectory of REST versus GraphQL adoption rates all inform whether this is the right time to adopt"
      ],
      "ans": 1,
      "fb": "Technology evaluations must start with criteria, not with the technology. Defining what problems exist (over-fetching, excessive API calls), what constraints apply (security, gateway compatibility, auth), and what the migration cost is creates a framework that GraphQL — or any alternative — can be evaluated against. Starting with performance research (A) or a proof-of-concept (C) evaluates the technology before knowing what to evaluate it for. Team experience surveys (D) measure current capability, not fit. Industry trends (E) are not engineering arguments. The Expert establishes the evaluation framework first, then fills it in with evidence.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 3,
      "q": "You are leading an evaluation of whether to replace the platform's custom service mesh with Istio. The evaluation team has spent three weeks running performance benchmarks and the results show Istio adds 2ms of latency per hop. The team is divided: some say 2ms is acceptable, others say it is not. How do you structure the decision?",
      "opts": [
        "Move the discussion beyond latency benchmarks: map the 2ms per hop to end-to-end impact on the platform's critical paths (e.g. a 5-hop payment flow adds 10ms), compare that against current SLO budgets, and evaluate the latency cost alongside the operational benefits Istio provides (mTLS, traffic management, observability) — then present a decision that weighs the latency cost against the operational value, not a single-dimension benchmark",
        "Contact the Istio vendor support team and request a latency optimisation guide specific to the platform's GKE configuration, then re-run the performance benchmarks with the recommended optimisations applied — the 2ms figure may be reducible to sub-millisecond with proper sidecar proxy tuning, connection pooling, and protocol buffer serialisation settings",
        "Reject Istio adoption because any additional per-hop latency is unacceptable for a financial platform that processes real-time payments — even 2ms per hop compounds across multi-service call chains and could push critical payment flows outside their SLO latency budgets, creating a measurable degradation in customer experience and regulatory compliance risk",
        "Approve Istio adoption selectively: deploy Istio service mesh sidecars only on non-latency-sensitive services such as reporting, notifications, and batch processing, while keeping the custom mesh for latency-critical payment processing services — this captures the operational benefits of Istio for the majority of services without impacting the critical path",
        "Accept the 2ms per-hop overhead as negligible because it falls well within the range of typical network jitter on a GKE cluster, where pod-to-pod latency already varies by 1-3ms depending on node placement, network policies, and cluster load — the Istio overhead is effectively invisible within the existing latency variance of the platform's infrastructure"
      ],
      "ans": 0,
      "fb": "A technology evaluation must map benchmark results to business impact, not evaluate them in isolation. 2ms per hop becomes 10ms on a 5-hop path — is that within the SLO budget? For some paths it may be acceptable, for others it may not. The decision must weigh the latency cost against the operational benefits: mTLS without application changes, traffic management, observability — features that the custom mesh may lack. Dismissing 2ms (A) ignores compounding across hops. Rejecting on latency alone (B) ignores the benefits. Vendor optimisation (D) delays the decision. Split deployment (E) is a possible outcome but should emerge from the analysis, not be the default.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 3,
      "q": "The platform team proposes replacing the current Liquibase-based schema migration tool with Flyway, arguing that Flyway is simpler and has better Spring Boot integration. Six teams use Liquibase with varying levels of sophistication — some use basic changelog files, others use Liquibase's advanced features like contexts and preconditions. How do you structure the evaluation?",
      "opts": [
        "Approve the migration from Liquibase to Flyway because Flyway's simpler convention-over-configuration approach will reduce the learning curve for new engineers and eliminate the configuration complexity that has led to the divergent Liquibase patterns — simplifying the migration tooling across all six teams is a clear win that should not be delayed by edge case concerns",
        "Defer the Flyway migration decision until Flyway adds equivalent support for Liquibase's advanced features such as contexts, preconditions, and rollback scripts — migrating before feature parity exists would force teams that rely on these capabilities to build workarounds, and waiting for Flyway to mature avoids the risk of capability regression",
        "Audit the actual Liquibase feature usage across all six teams: identify which teams use only basic features that Flyway supports equivalently, which teams rely on advanced features that would require workarounds in Flyway, and quantify the migration cost — then evaluate whether the simplicity benefit of Flyway justifies the migration cost and feature trade-offs for the teams that would lose capability",
        "Survey all six teams to gauge their preference between Liquibase and Flyway, then follow the majority vote — the teams that use the migration tool daily have the most relevant perspective on which tool better serves their workflow, and a democratic decision ensures broad buy-in for whichever tool is selected as the platform standard",
        "Ask the team with the most complex Liquibase usage — the one using contexts and preconditions extensively — to prototype migrating their changelogs to Flyway and report back on the experience, effort required, and any capability gaps — this provides concrete evidence of the migration cost for the hardest case before committing the other five teams"
      ],
      "ans": 2,
      "fb": "A tool migration evaluation for a platform used by six teams must assess the actual usage landscape, not just the proposing team's experience. Auditing feature usage reveals the true migration scope: teams using basic features may migrate trivially, but teams using contexts and preconditions face real capability loss. The decision weighs simplicity gains against migration cost and feature trade-offs. Approving without assessment (A) ignores the teams that would lose capability. A preference survey (B) is not an engineering evaluation. A single team's prototype (D) may not represent the full complexity. Waiting for feature parity (E) is indefinite deferral.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 2,
      "scenario": 3,
      "q": "You are evaluating whether to adopt an API gateway product (e.g. Kong, Apigee) to replace custom gateway code that three teams maintain independently. During evaluation, you discover that each team has embedded business logic in their gateway layer — rate limiting rules that encode business contracts, authentication flows specific to tenant types, and request transformation logic. How does this discovery change your evaluation?",
      "opts": [
        "Abandon the API gateway evaluation entirely because the discovery of embedded business logic in the gateway layers makes the migration scope fundamentally larger than originally estimated — the custom code is too deeply entangled with rate limiting rules, authentication flows, and request transformation to be replaced by a managed product without unacceptable risk",
        "Adopt the managed API gateway only for the teams that have not embedded business logic in their gateway layer, and leave the teams with custom business logic on their existing custom gateway code indefinitely — this captures the benefits of the managed gateway for the majority of services while avoiding the complexity of extracting business logic from the remaining services",
        "Redefine the evaluation scope: the gateway replacement is now inseparable from the business logic extraction — first, catalogue all business logic embedded in the gateway layers, then evaluate whether that logic should be moved into the services themselves (where it belongs) or into the gateway product's extension model — the gateway adoption timeline must include the business logic migration, not just the infrastructure swap",
        "Proceed with the managed API gateway adoption as originally planned and migrate all business logic — rate limiting rules, tenant-specific authentication flows, and request transformation logic — into the gateway product's plugin and extension framework, since managed gateways like Kong and Apigee provide extensible plugin systems designed for exactly this type of customisation",
        "Ask each team to independently extract and remove the business logic from their gateway code as a prerequisite before the API gateway evaluation can continue — each team should refactor their rate limiting, authentication, and transformation logic into their application services, and only after all three teams have completed this extraction should the managed gateway evaluation resume"
      ],
      "ans": 2,
      "fb": "Discovering business logic in the gateway layer changes the evaluation from a pure infrastructure swap to a combined infrastructure and business logic migration. The Expert must redefine the scope to include cataloguing and migrating the embedded business logic — either into the services (preferred for domain logic like rate limiting rules) or into the gateway product's extension model (appropriate for cross-cutting concerns like request transformation). Ignoring the business logic (A) produces a gateway that breaks business rules. Abandoning the evaluation (B) accepts permanent fragmentation. Asking teams to remove logic first (D) is the right direction but should be part of the evaluation plan, not a prerequisite. Partial adoption (E) perpetuates the dual-infrastructure problem.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 3,
      "q": "You are leading a technology evaluation to determine whether the platform should adopt gRPC for inter-service communication, replacing REST for internal APIs. The evaluation has reached a critical point: the performance benefits are clear (lower latency, smaller payloads, streaming support), but several engineers raise concerns about debugging difficulty (binary protocol), tooling maturity (fewer API testing tools), and the learning curve for teams unfamiliar with Protocol Buffers. Leadership asks for your recommendation. How do you structure it?",
      "opts": [
        "Allow each team to decide independently whether to adopt gRPC for their own services based on their specific latency requirements and team capabilities, since a platform-wide mandate removes the team autonomy that drives innovation — teams that would benefit most from gRPC's performance characteristics can adopt it voluntarily while others continue with REST until the tooling matures",
        "Recommend against adopting gRPC for the platform because the debugging difficulty with binary Protocol Buffer payloads, the immaturity of gRPC testing tools compared to REST, and the significant learning curve for teams unfamiliar with Protocol Buffers create too much operational risk — the performance benefits do not justify the increase in debugging complexity and developer friction across 15 services",
        "Present a risk-adjusted recommendation: adopt gRPC for high-throughput internal service-to-service paths where performance benefits are measurable and significant, retain REST for external-facing APIs and low-volume internal APIs where debugging ease and tooling maturity matter more — include a required investment in debugging tooling (gRPC reflection, Postman gRPC support, structured logging of gRPC payloads) and a team training plan as prerequisites for adoption, with a pilot on one high-throughput path before broader rollout",
        "Recommend full adoption of gRPC for all inter-service communication across the platform because the measured performance benefits — lower serialisation overhead, smaller payloads, persistent HTTP/2 connections, and native streaming support — outweigh the tooling and debugging concerns, which are temporary and will be resolved as the gRPC ecosystem matures and teams gain experience with the technology",
        "Recommend waiting until gRPC tooling matures to match REST's level of debugging support, API testing capability, and developer ergonomics before adopting it on the platform — the current tooling gaps create real operational risk, and adopting gRPC prematurely would lock the platform into a technology whose ecosystem is not yet ready for production financial services workloads"
      ],
      "ans": 2,
      "fb": "The Expert's recommendation must balance performance gains against operational costs. Full adoption (A) ignores real tooling and debugging concerns. Full rejection (B) sacrifices measurable performance gains. The risk-adjusted approach segments the adoption by where the benefits are largest and the risks are manageable, requires tooling and training investments as prerequisites (not afterthoughts), and validates with a pilot before broader rollout. Waiting for tooling maturity (D) defers value indefinitely. Per-team decisions (E) create the divergence the evaluation is meant to prevent.",
      "context": {}
    },
    {
      "level": 5,
      "diff": 3,
      "scenario": 3,
      "q": "You are evaluating whether to migrate the platform's observability stack from a self-managed Prometheus/Grafana deployment to a fully managed solution (e.g. Google Cloud Managed Prometheus with Grafana Cloud). The managed solution costs significantly more but eliminates the operational burden of maintaining the self-managed stack. During the evaluation, the platform team reveals that they spend approximately 20% of their time managing the observability infrastructure, including upgrades, scaling, and incident response for the observability stack itself. How do you frame the recommendation for leadership?",
      "opts": [
        "Ask the platform team to optimise their observability maintenance processes and reduce their time spent from 20% to under 10% before evaluating external managed solutions — the current operational overhead may reflect inefficient processes such as manual upgrade procedures, unautomated scaling, and reactive incident response for the observability stack itself, rather than an inherent limitation of self-managed infrastructure, and improving internal efficiency is cheaper than paying for a managed service",
        "Adopt a hybrid deployment model where the most critical production monitoring dashboards and alerting rules run on Grafana Cloud's managed infrastructure for reliability, while development and staging monitoring and lower-priority observability remain on the self-managed Prometheus and Grafana stack — this reduces the operational burden for the highest-value monitoring without incurring the full cost of migrating everything to managed services, and the platform team can focus their maintenance effort on the remaining self-managed components",
        "Frame the decision as a total cost of ownership comparison: quantify the 20% platform team time in salary cost and opportunity cost (what the team could build instead), compare it against the managed solution's licensing cost, factor in the risk cost of observability outages during critical production incidents (if the observability stack is down when a payment incident occurs, the cost is not just engineering time but business impact), and present the recommendation with a sensitivity analysis showing at what scale the managed solution breaks even — let leadership make the investment decision with complete information",
        "Recommend staying with the self-managed Prometheus and Grafana deployment because the cost difference between self-managed and fully managed observability is too large to justify — the platform team's 20% maintenance overhead is a known and budgeted cost, whereas the managed solution's licensing fees represent a new and significantly higher ongoing expense that would need to be justified against competing engineering budget priorities",
        "Recommend the fully managed observability solution because it completely eliminates the operational overhead of maintaining the self-managed Prometheus and Grafana stack — the 20% platform team time currently spent on maintenance, upgrades, scaling, and incident response for the observability infrastructure would be freed up for higher-value platform engineering work such as building shared libraries, improving CI/CD pipelines, and reducing developer friction, and the managed solution's SLA provides better reliability guarantees than what the self-managed deployment can achieve"
      ],
      "ans": 2,
      "fb": "The Expert's role in a technology evaluation is to produce a decision framework, not a binary recommendation. Total cost of ownership must include not just licensing versus infrastructure costs, but also the opportunity cost of platform team time (what they could build instead), the risk cost of observability outages (losing monitoring during a production incident has business impact beyond engineering hours), and a break-even analysis at different scales. This lets leadership make an investment decision with complete information. Simply recommending managed (A) or self-managed (B) without quantification is advocacy, not evaluation. Asking the team to reduce maintenance first (D) optimises the wrong variable. A hybrid (E) may emerge from the analysis but should not be the default recommendation.",
      "context": {}
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 0,
      "q": "Your company is expanding its BaaS platform into a new geographic market with different regulatory requirements (e.g. data residency laws requiring all data to be stored within the country). As the architectural authority, what is the first architectural assessment you must produce?",
      "opts": [
        "Produce a list of all services that need to be deployed in the new geographic region, grouped by domain (payments, accounts, ledger, notifications) with estimated infrastructure costs per service — this gives leadership a concrete deployment plan with cost projections that can be used for budgeting the expansion initiative",
        "A data residency impact analysis that identifies every data store, event stream, log sink, and cache in the platform that contains regulated data, maps which data must be resident in the target country versus which can be shared, and assesses the architectural changes required — including database isolation, Kafka topic separation, log routing, and CDN configuration — to satisfy the residency requirements while preserving platform operability",
        "Propose building a completely independent platform instance for the new market from scratch, deployed in a separate GCP project in the target country's region — this provides the cleanest data residency guarantee since no data crosses regional boundaries, and allows the new market team to iterate independently without being constrained by the existing platform's architecture",
        "Produce a detailed cost estimate for deploying a second GCP region in the target country, including compute (GKE cluster), database (Cloud SQL instances), messaging (Kafka cluster), storage, and network egress costs — this financial analysis is the most critical input for leadership's decision on whether to proceed with the geographic expansion",
        "Request a compliance checklist from the legal team that enumerates all regulatory requirements for the target country, then translate each legal requirement into a specific engineering task with effort estimates — this ensures the engineering work is directly traceable to regulatory obligations and no requirements are missed during the platform adaptation"
      ],
      "ans": 1,
      "fb": "Data residency is the architectural constraint that drives all other decisions when entering a new market. Before estimating cost (A) or listing services (C), you must understand the full scope of regulated data across all storage layers — databases, Kafka topics, logs, caches, backups — and determine which must be resident versus shareable. This analysis drives the architectural strategy: is it tenant-based routing, a separate cluster, or a federated model? A legal checklist (D) describes requirements but not architecture. A completely independent platform (E) may be the answer but should be the conclusion of the analysis, not the starting point.",
      "context": {}
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 0,
      "q": "Leadership announces that the platform will add a new product vertical: embedded lending, alongside the existing payments and accounts products. As the architectural authority, you must advise on whether the lending product should be built within the existing platform or as a separate system. What is the most important architectural question to answer first?",
      "opts": [
        "Assess whether the lending engineering team has the skills and experience needed to work effectively in the existing platform codebase, since the current Spring Boot, Kafka, and PostgreSQL stack requires domain-specific knowledge that a team accustomed to different technologies would need significant ramp-up time to acquire",
        "How much of the existing platform's infrastructure (Kafka, Cloud SQL, GKE, IAM) and domain data (customer profiles, account data, transaction history) the lending product needs — because high data overlap argues for integration while low overlap and different scaling/compliance profiles argue for separation",
        "Determine how many engineers will be allocated to the lending team and whether that headcount is sufficient to build and operate a separate system versus integrating into the existing platform, since the team size directly impacts the viable architectural options and the timeline for delivering the lending product to market",
        "Evaluate whether the lending product will generate sufficient revenue within its first two years to justify the infrastructure investment required for either integration or separation, since the financial viability of the product determines how much architectural investment is warranted at this stage versus building a minimal viable product first",
        "Research whether competitor BaaS platforms have built their lending capabilities as separate systems or integrated features within their existing platform, since industry precedent provides valuable signal about which architectural approach is more likely to succeed and which pitfalls to avoid based on others' experience"
      ],
      "ans": 1,
      "fb": "The architectural decision between integration and separation is driven by data and infrastructure overlap. If lending needs real-time access to customer profiles, account balances, and transaction history — all of which live in the existing platform — building separately means replicating that data and the synchronisation infrastructure. If lending has fundamentally different scaling, compliance, or availability requirements, integration may constrain it. The Authority's first analysis maps the actual dependencies to determine the optimal boundary. Team skills (A), revenue projections (C), headcount (D), and competitor analysis (E) are all relevant inputs but do not answer the fundamental architectural question.",
      "context": {}
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 0,
      "q": "You are leading the architecture for a new BaaS product that serves both consumer and business clients. Consumer clients require sub-200ms API latency; business clients process large batch operations that can tolerate minutes of latency but require guaranteed completion. Your existing platform is optimised for real-time request-response. How do you architect the system to serve both client types without one degrading the other?",
      "opts": [
        "Build a single unified API that handles both real-time consumer requests and batch business client operations, using priority queues in the application layer to ensure consumer traffic receives preferential processing over batch operations — implement a weighted fair queuing algorithm that allocates 80% of processing capacity to real-time requests and 20% to batch operations during peak periods",
        "Build a completely separate platform instance for business clients with its own dedicated GKE cluster, Cloud SQL databases, and Kafka topics, ensuring total infrastructure isolation between consumer and business workloads — this guarantees that batch operations can never affect consumer latency because they run on entirely independent hardware and networking",
        "Tell business clients to limit their batch operation sizes to a maximum of 100 transactions per submission and throttle their API call rate to 10 requests per second to prevent their bulk processing from consuming resources needed for consumer real-time traffic — enforce these limits through API gateway rate limiting rules with clear SLA documentation",
        "Route all business client API traffic through Cloud CDN caching to reduce the number of requests that reach the backend services, serving frequently requested data such as account summaries and transaction histories from cached responses — this reduces the backend load from business clients without requiring architectural changes to the application layer",
        "Design a dual-path architecture: a real-time API path for consumer clients with strict latency SLOs backed by connection pool isolation and request prioritisation, and a separate batch processing path for business clients that uses asynchronous job submission with progress callbacks — both paths share the same domain services and data stores but are isolated at the ingress and resource allocation layers to prevent batch operations from consuming resources needed for real-time traffic"
      ],
      "ans": 4,
      "fb": "The architectural challenge is resource isolation between workloads with fundamentally different profiles. A dual-path architecture provides separate ingress and resource allocation (connection pools, thread pools, compute resources) so batch processing cannot starve real-time traffic, while sharing domain services and data stores to avoid duplicating business logic and data. A single API with priority queues (A) is insufficient because batch operations may still exhaust shared resources like database connections. A separate platform (C) duplicates everything unnecessarily. Limiting batch sizes (D) constrains the product rather than solving the architecture. CDN caching (E) is irrelevant for write-heavy batch operations.",
      "context": {}
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 0,
      "q": "Your platform is expanding to support a new market segment that requires real-time event notifications to external partners. The existing platform uses Kafka internally but has no external event streaming capability. Partners require webhooks with guaranteed delivery, retry, and idempotency. As the architectural authority, you must design the external event notification architecture. How do you approach this?",
      "opts": [
        "Use a third-party webhook delivery service such as Svix or Hookdeck and route all internal Kafka events through it, delegating the webhook delivery, retry logic, and monitoring to the vendor — this avoids building custom webhook infrastructure and provides immediate production-ready delivery capabilities with guaranteed delivery, retry policies, and delivery dashboards out of the box",
        "Ask external partners to poll a REST API endpoint for new events at a configurable interval instead of implementing push-based webhook notifications, since polling is simpler to implement, does not require the platform to manage partner endpoint availability, and gives partners control over their own consumption rate and error handling without the complexity of callback URL management",
        "Design an external event gateway service that consumes internal Kafka events and translates them into partner-facing webhooks — the gateway manages partner-specific configurations (URLs, authentication, payload formats), provides guaranteed delivery via a persistent outbox with retry logic, ensures idempotency via event IDs that partners can use for deduplication, and includes a partner-facing dashboard for delivery status and replay — keeping internal Kafka topology hidden from external consumers",
        "Build individual webhook integrations directly within each service that generates events — the Payments service builds its own payment webhook sender, the Accounts service builds its own account webhook sender — since each service team understands their domain events best and can implement partner-specific payload formatting and delivery logic tailored to their event types",
        "Expose the internal Kafka topics directly to external partners using Kafka's REST Proxy, which provides an HTTP interface for consuming Kafka messages — partners can subscribe to the topics they are interested in and consume events at their own pace using standard HTTP polling, leveraging Kafka's built-in consumer group management and offset tracking"
      ],
      "ans": 2,
      "fb": "An external event gateway provides the necessary architectural boundary between internal event infrastructure and external partners. It hides internal Kafka topology, manages partner-specific configuration, provides delivery guarantees through a persistent outbox pattern, and offers idempotency semantics that partners need. Exposing Kafka directly (A) couples partners to internal infrastructure and creates security risks. Per-service webhook integrations (C) fragment the partner management and delivery guarantee logic across services. A third-party service (D) may be part of the solution but the architectural design must be owned regardless. Polling (E) may be acceptable for some use cases but does not satisfy the real-time notification requirement.",
      "context": {}
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 0,
      "q": "Your company decides to offer the BaaS platform as a white-label product that other financial institutions can deploy under their own brand. This requires multi-instance deployment capability. Currently, the platform runs as a single multi-tenant instance. As the architectural authority, you must advise on the deployment model. What architectural analysis is required?",
      "opts": [
        "Estimate the infrastructure cost of running separate GKE clusters, Cloud SQL instances, Kafka topics, and networking infrastructure for each white-label customer, then present the cost model to leadership showing per-customer infrastructure costs at different scale points — this financial analysis determines whether the white-label business model is economically viable and at what customer volume the infrastructure investment breaks even against the licensing revenue from white-label customers over a projected three-year period",
        "Analyse the platform's current architecture across three dimensions: configuration isolation (can branding, feature flags, and business rules be configured per deployment without code changes?), data isolation (can each instance have its own database or schema without schema coupling?), and deployment independence (can each instance be upgraded, scaled, and maintained independently?) — then identify which architectural changes are needed to support independent deployment, and evaluate the trade-off between shared infrastructure with tenant isolation versus fully independent instances for each white-label customer",
        "Ask each prospective white-label customer what deployment model they prefer — shared multi-tenant infrastructure with logical isolation, dedicated single-tenant infrastructure with full resource separation, or a hybrid approach where some services are shared and others are dedicated — then design the architecture around the most commonly requested model, since customer deployment preferences and regulatory requirements should directly drive the architectural decisions rather than internal engineering assumptions",
        "Build a separate container image for each white-label customer with their branding assets, configuration values, feature flags, and business rules baked into the image at build time from a parameterised CI/CD pipeline — this provides clean deployment isolation since each customer runs their own uniquely-configured image, and the build pipeline can be parameterised to produce per-customer builds from the shared codebase while ensuring each customer's image contains only their specific configuration",
        "Deploy all white-label customers on the existing shared multi-tenant platform instance with CSS theme switching, configurable brand assets including logos, colours, and fonts, and tenant-specific feature flags to control product behaviour — since the current multi-tenant architecture already provides data isolation via row-level security, the visual customisation and feature configuration can be handled entirely through the existing tenant configuration system without requiring any backend architectural changes"
      ],
      "ans": 1,
      "fb": "White-label deployment is an architectural challenge across three dimensions that must be assessed systematically. Configuration isolation determines whether branding and business rules can be externalised. Data isolation determines whether customer data can be physically separated. Deployment independence determines whether each customer can have its own upgrade cycle. These dimensions drive the deployment model: shared infrastructure with strong tenant isolation is cheaper but constrains independence; fully independent instances are expensive but give maximum flexibility. Cost estimation (A) is premature without understanding the architectural requirements. Customer preference (C) is input but not architecture. Baked-in configuration (D) prevents runtime changes. CSS-only theming (E) does not address data isolation or deployment independence.",
      "context": {}
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 0,
      "q": "You are leading the architecture for a strategic initiative: building a real-time payments capability on the existing BaaS platform. Real-time payments require sub-second end-to-end processing, 99.99% availability, and irrevocability (once confirmed, a payment cannot be reversed through the system — only compensating transactions are possible). Your current platform processes batch payments with an SLA of 99.9% and settlement within 24 hours. The CTO asks: can the existing platform support real-time payments, or do we need a new system? How do you structure your assessment?",
      "opts": [
        "Produce a structured gap analysis: map the real-time requirements (sub-second latency, 99.99% availability, irrevocability) against the existing platform's architecture across each layer — API gateway (can it route with sub-second overhead?), service processing (can the current synchronous/async mix meet the latency budget?), database (can Cloud SQL HA provide 99.99% availability?), messaging (can Kafka provide the ordering and delivery guarantees irrevocability requires?), and operational infrastructure (does the monitoring and alerting stack detect sub-second degradation?) — then identify which layers can be extended versus which require new components, and present a hybrid recommendation with phased delivery",
        "Recommend building a completely new real-time payments system from scratch because the requirements — sub-second end-to-end latency, 99.99% availability, and irrevocability — are fundamentally different from the existing batch payment platform's architecture, and attempting to extend a system originally designed for 24-hour settlement cycles and 99.9% availability to support sub-second irrevocable processing would require changing so many components across every layer that the result would be neither the old system nor a properly designed new one, creating a hybrid that is harder to reason about than either approach in isolation",
        "Propose building a focused proof-of-concept that processes a single real-time payment transaction end-to-end through the existing platform infrastructure, measuring the actual latency at each stage — API gateway routing, service processing and validation, database write and commit, Kafka event publication and acknowledgement — to determine empirically whether the current architecture can meet the sub-second requirement without major architectural changes, and use the measured latency breakdown to identify which specific layers would need modification if the end-to-end target is not met",
        "Ask the CTO to choose between two strategic options: extending the existing platform for faster time-to-market at the cost of architectural compromise and technical debt, or building a purpose-designed real-time payments system for architectural purity at the cost of a longer delivery timeline and higher upfront investment — present the trade-offs clearly with estimated timelines and costs for each option so the CTO can make the decision based on business priorities, competitive pressure, and risk tolerance rather than having the architectural authority prescribe a single recommendation",
        "Recommend extending the existing platform to support real-time payments because building a completely new system from scratch would be too expensive and too slow, requiring at least 24 months versus an estimated 12 months for an extension approach — the existing platform already handles all the core payment processing domain logic including validation, routing, ledger posting, and notification, and the engineering investment should focus on optimising the current architecture for lower latency and higher availability rather than duplicating the entire payment domain in a parallel system"
      ],
      "ans": 0,
      "fb": "The CTO's question requires an evidence-based assessment, not a binary recommendation. A structured gap analysis across each architectural layer reveals precisely where the existing platform can serve real-time payments and where new components are needed. For example, the API gateway and some service layers may be adequate, but Cloud SQL's HA SLA may not reach 99.99% without additional measures, and irrevocability may require a new event-driven confirmation flow. A hybrid recommendation — extend where possible, build new where necessary — with phased delivery is the most defensible answer. Recommending all-new (A) or all-existing (B) without this analysis is opinion, not architecture. A POC (D) tests one path but does not assess the full gap. Asking the CTO to choose (E) abdicates the architectural authority's responsibility to present a structured recommendation.",
      "context": {}
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 0,
      "q": "Your platform currently serves a single country. The board has approved a 3-year strategy to expand to five additional countries. Each country has different regulatory requirements, different banking partners, and different payment schemes. You must present the architectural strategy for internationalisation. What is the architectural framework you present?",
      "opts": [
        "Copy the current platform codebase into a separate repository for each of the five new countries and let each country's engineering team modify their copy independently to accommodate local regulatory requirements, banking partner integrations, and payment scheme interfaces — this provides maximum flexibility for each country team to move at their own pace without being constrained by cross-country coordination or shared release cycles, and each team can adopt country-specific technologies or patterns that may not be appropriate for other markets",
        "Present a layered internationalisation architecture: a shared core platform layer that contains country-agnostic domain logic (account management, transaction processing, ledger), a country-specific adapter layer that encapsulates regulatory rules, banking partner integrations, and payment scheme interfaces, and a configuration layer that determines per-country behaviour — with a deployment model analysis showing whether the shared core runs as a single global instance or per-region instances based on data residency and latency requirements — sequenced across the five countries with the second country serving as the architectural validation before scaling to the remaining three",
        "Propose deploying a completely separate, fully independent instance of the platform in each new country, with each instance running its own GKE cluster, Cloud SQL databases, Kafka topics, and monitoring stack in the target country's GCP region — this provides the simplest data residency compliance since all data for each country remains within its national boundary with no cross-border data flows, and each instance can be managed independently by a local operations team with its own deployment pipeline, on-call rotation, and upgrade schedule",
        "Wait until the first international expansion into the second country is fully complete before designing any framework or architectural pattern for subsequent country expansions — the practical lessons learned from the first real international deployment will reveal the actual technical and regulatory challenges that cannot be predicted theoretically, and building a framework based on real experience rather than speculation will produce a more practical and battle-tested approach for the remaining three countries",
        "Build all country-specific regulatory rules, banking partner integrations, and payment scheme logic directly into the existing platform codebase using feature flags keyed by country code, with runtime configuration determining which regulatory rules, partner adapters, and payment scheme interfaces apply for each request based on the tenant's registered country — this keeps a single deployable artefact, avoids the complexity of maintaining separate adapter layers, and leverages the existing feature flag infrastructure to control country-specific behaviour"
      ],
      "ans": 1,
      "fb": "Internationalisation at scale requires a layered architecture that separates what is universal from what is country-specific. The shared core (account management, transaction processing) avoids duplicating domain logic across countries. The adapter layer (regulatory rules, banking integrations, payment schemes) encapsulates country differences behind stable interfaces. The configuration layer drives per-country behaviour without code changes. Deploying the second country validates the architecture before committing to three more. Separate instances per country (A) duplicates everything. Feature flags (B) embed country logic in the core, creating a maintenance nightmare at five countries. Codebase copies (D) create five diverging platforms. Waiting to design the framework (E) means the first expansion sets an unplanned architectural precedent.",
      "context": {}
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 1,
      "q": "You are reviewing the current state of architectural decision-making across the organisation. You find that some teams write ADRs for every decision, other teams write ADRs only when asked, and some teams have never written an ADR. Leadership asks you to establish when an ADR should be required. What is the correct framework for determining ADR scope?",
      "opts": [
        "Require ADRs only for decisions that exceed a specified cost threshold — for example, any technical decision estimated at more than 10 developer-days of implementation effort — since the effort threshold ensures ADRs are written for consequential decisions while avoiding bureaucratic overhead for small changes that can be easily reversed",
        "Require a formal ADR for every technical decision made by any team across the organisation to ensure complete documentation of the architectural decision history, since gaps in the ADR record create blind spots where the rationale for past decisions is lost and future engineers cannot understand why certain approaches were chosen",
        "Let each team define their own ADR policy based on their team's maturity level, domain complexity, and engineering culture, since teams understand their own decision-making needs best and a one-size-fits-all ADR policy will be either too burdensome for simple domains or insufficient for complex regulated domains",
        "Require ADRs only when a principal architect or engineering director specifically requests one for a particular decision, since architects have the best judgment about which decisions are significant enough to warrant formal documentation and which can be adequately captured in PR descriptions or design document comments",
        "Require ADRs only when a decision is irreversible or has cross-team impact — define clear triggers: changes to data models shared across services, new inter-service communication patterns, introduction of new technology or frameworks, and security or compliance-affecting architectural changes — and make all other ADRs optional but encouraged"
      ],
      "ans": 4,
      "fb": "ADR requirements must be scoped to decisions where the documentation provides clear value: irreversible decisions (hard to undo later), cross-team decisions (affect services beyond the deciding team), and compliance-affecting decisions (require audit evidence). Requiring ADRs for everything (A) creates bureaucratic overhead and dilutes the signal — teams will write perfunctory ADRs that serve no one. Architect-triggered ADRs (C) create a bottleneck and miss decisions architects are not involved in. Per-team policies (D) produce the current inconsistent state. Cost-based thresholds (E) miss low-cost decisions with high architectural impact (e.g. choosing an event format that all consumers must follow).",
      "context": {}
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 1,
      "q": "You discover that the organisation has accumulated 120 ADRs over two years, but engineers report that they rarely read them because they do not know which ones are still relevant. Many ADRs have been superseded by subsequent decisions without being updated. What governance change addresses this?",
      "opts": [
        "Reduce the number of ADRs the organisation produces by raising the threshold for when an ADR is required — if fewer ADRs are written, each one will be more significant and more likely to be maintained, since the current volume of 120 ADRs overwhelms engineers' capacity to keep track of which decisions are still active and relevant to their work",
        "Create a curated summary document that lists only the 20-30 most important and currently relevant ADRs with brief descriptions of each decision, and distribute this summary to all engineering teams as the primary reference — engineers can consult the full ADR only when they need the detailed rationale behind a decision listed in the summary",
        "Delete all ADRs that are older than 6 months and start the ADR programme fresh with a clean repository, since the accumulated 120 documents with unknown relevance create more confusion than value — a fresh start with stricter maintenance requirements will produce a more trustworthy and usable ADR repository going forward",
        "Introduce a lifecycle status for ADRs (PROPOSED, ACCEPTED, SUPERSEDED, DEPRECATED) and require that any new ADR that changes a previous decision must update the old ADR's status with a link to the successor — additionally, assign ADR ownership so that each ADR has a named person responsible for keeping it current, and schedule a quarterly review of active ADRs",
        "Move all ADRs from the source code repository into a dedicated Confluence wiki or Notion workspace where they are more discoverable through search, tagging, and categorisation features — the primary reason engineers do not read ADRs is that they are buried in code repositories where they are difficult to find and browse without knowing the exact file path"
      ],
      "ans": 3,
      "fb": "The core problem is ADR lifecycle management: ADRs are created but never updated when their context changes. Lifecycle statuses (PROPOSED, ACCEPTED, SUPERSEDED, DEPRECATED) make the currency of each ADR immediately visible. Requiring successor links ensures the decision trail is traceable. Named ownership ensures someone is responsible for keeping each ADR current. Quarterly reviews catch ADRs that have drifted. Deleting old ADRs (A) destroys institutional knowledge. A summary document (C) creates a maintenance burden on top of the ADRs. Moving to a wiki (D) changes the location but not the lifecycle problem. Reducing ADR count (E) addresses volume but not currency.",
      "context": {}
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 1,
      "q": "You are redesigning the architectural decision-making process because the current process creates bottlenecks: all cross-team decisions require the architecture guild to convene, which meets biweekly and has a growing backlog of 15 pending decisions. Teams are blocked waiting for guild approval. How do you restructure the process?",
      "opts": [
        "Tiered decision authority: define decision categories based on impact scope — team-local decisions (single service, reversible) are made by the team with documentation; domain decisions (affecting 2-3 related services) are made by the domain's senior engineers with ADR and peer review; platform-wide decisions (cross-domain, infrastructure, compliance) go to the guild — with clear criteria for each tier and an escalation path from lower tiers to higher tiers when scope is ambiguous",
        "Eliminate the architecture guild entirely and let teams make all architectural decisions independently within their service boundaries, relying on code reviews and integration testing to catch any cross-team architectural inconsistencies — this removes the bottleneck while trusting engineers to make responsible decisions and escalate when they recognise cross-team impact",
        "Replace the biweekly guild meetings with asynchronous Slack-based architecture reviews for all decisions, where teams post their proposals in a dedicated channel and guild members provide feedback within a 48-hour window — this eliminates the scheduling bottleneck while preserving the review function and allowing guild members to review proposals on their own schedule",
        "Add more senior architects and principal engineers as members of the architecture guild so it can run multiple parallel review sessions simultaneously, processing the 15-decision backlog faster — with twice the membership, the guild can split into two subgroups that each meet biweekly, effectively doubling the review throughput without changing the governance model",
        "Increase the architecture guild meeting frequency from biweekly to weekly to process the growing backlog of pending decisions faster and reduce the average wait time for teams seeking guild approval — the additional meeting cadence should clear the 15-decision backlog within a month and prevent future backlogs from accumulating beyond a manageable size"
      ],
      "ans": 0,
      "fb": "The bottleneck is caused by routing all cross-team decisions through a single body. Tiered decision authority distributes decisions to the appropriate level: team-local decisions need no guild involvement, domain decisions are handled by domain experts, and only platform-wide decisions require the guild. Clear criteria for each tier prevent both under-escalation (a team making a platform-wide decision alone) and over-escalation (the guild reviewing a single-service change). Increasing meeting frequency (A) treats the symptom. Eliminating the guild (C) removes governance entirely. More members (D) does not address the categorisation problem. Async reviews (E) may work for some decisions but do not address the scope problem.",
      "context": {}
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 1,
      "q": "You are introducing a new ADR template to the organisation. The current template has 12 sections including Problem Statement, Decision Drivers, Considered Options, Decision Outcome, Pros and Cons, Links, and several others. Engineers complain that writing an ADR takes too long and the template is intimidating. How do you redesign the template to improve adoption without losing rigour?",
      "opts": [
        "Keep the current 12-section ADR template but add detailed examples and fill-in guides for each section, making it easier for engineers to understand what is expected — the sections exist for good reasons and removing them would lose important context, so the solution is better guidance rather than fewer sections, supplemented with a sample ADR that demonstrates each section",
        "Redesign the template with a minimal required core (Context, Decision, Consequences — 3 sections) and optional expansion sections (Alternatives Considered, Trade-offs, Links) that are available but not required — the minimal core captures the essential information in under 30 minutes, while the expansion sections are used for high-impact or contested decisions that warrant deeper documentation",
        "Replace written ADRs entirely with verbal architecture decisions recorded during team meetings, captured in meeting notes with action items — this eliminates the writing overhead that engineers find intimidating while still preserving a record of what was decided, who was present, and what alternatives were discussed during the decision-making conversation",
        "Reduce the ADR template to a single free-text field with no structural requirements so engineers can write their decision rationale in whatever format feels most natural to them — removing structural constraints eliminates the intimidation factor and lets engineers focus on capturing the essential reasoning rather than worrying about filling in prescribed template sections",
        "Create two separate ADR templates — a short 3-section template for routine decisions and a comprehensive 12-section template for significant architectural decisions — with clear guidance on which template to use based on the decision's scope and impact, so engineers always know which format is appropriate for their situation"
      ],
      "ans": 1,
      "fb": "Template adoption is driven by the ratio of effort to value. A minimal required core (Context, Decision, Consequences) captures the essential information that makes an ADR useful: why this decision was made and what its implications are. Optional expansion sections allow deeper documentation when warranted without burdening every ADR. A single free-text field (A) loses the structural consistency that makes ADRs comparable. Adding examples to 12 sections (C) does not reduce the intimidation factor. Meeting notes (D) are not searchable or structured. Two separate templates (E) create confusion about which to use. The redesigned template makes the default path quick while allowing depth when needed.",
      "context": {}
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 1,
      "q": "The architecture guild has been making decisions, but six months later you discover that several decisions are not being followed by teams. Investigation reveals that the teams were not involved in the decisions and learned about them only after the ADRs were published. How do you fix the governance process?",
      "opts": [
        "Enforce compliance with architectural decisions by adding automated CI checks that scan code changes for patterns that violate published ADRs — for example, detecting the use of non-standard authentication libraries or unsanctioned database technologies — and blocking deployments that fail these architectural compliance checks until the team updates their code or obtains an exemption",
        "Create a mandatory read-receipt system where engineers must electronically acknowledge that they have read and understood each new ADR within 5 business days of publication — track acknowledgement rates per team and report non-compliance to engineering managers, ensuring that awareness of architectural decisions is universal even if implementation compliance varies",
        "Hold a quarterly all-hands engineering meeting where the architecture guild presents all recent architectural decisions, explains the rationale behind each, and answers questions from the engineering teams — this provides a regular communication cadence that keeps all engineers informed of the latest decisions and gives them an opportunity to raise concerns",
        "Send a monthly email digest summarising all recent architectural decisions to all engineering teams, with links to the full ADRs and a brief explanation of how each decision affects different teams and services — consistent written communication ensures that no team can claim they were unaware of decisions that affect their service boundaries and interfaces",
        "Add a mandatory stakeholder identification step to the decision process: before any architectural decision is made, identify all teams and services affected, ensure representatives from those teams are either present in the decision forum or have reviewed and provided input on the proposal, and include an explicit 'affected parties' section in the ADR that lists who was consulted"
      ],
      "ans": 4,
      "fb": "Decisions made without stakeholder involvement fail because the affected teams have no ownership of the outcome. The fix is structural: before a decision is made, systematically identify affected teams and ensure they have input. The 'affected parties' section in the ADR creates accountability for inclusion. CI compliance checks (A) enforce the letter of decisions but create adversarial friction. Email summaries (C) and read receipts (D) ensure awareness but not involvement. Quarterly presentations (E) communicate but do not provide input channels. The governance fix is in the decision-making process, not in the communication process.",
      "context": {}
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 1,
      "q": "You are redesigning the architectural decision-making process for an organisation that is growing from 4 teams to 12 teams over the next year. The current process works well at 4 teams but will not scale. You must design a governance model that scales to 12 teams without creating bottlenecks or losing architectural coherence. What do you propose?",
      "opts": [
        "Give each of the 12 teams full architectural autonomy to make their own technology and design decisions independently, with annual architecture audits conducted by external consultants to check for drift and inconsistency — this maximises team velocity and autonomy while providing a periodic governance check that catches significant architectural divergence before it becomes too expensive to remediate",
        "Eliminate formal architecture governance entirely and rely on code reviews, integration testing, and peer pressure to catch architectural issues organically — governance processes create overhead that slows teams down, and at 12 teams the organisation needs speed more than control, since well-hired engineers will naturally converge on good architectural patterns through collaboration",
        "Create a central architecture team of 4-5 senior architects who review all significant technical decisions for all 12 teams, providing consistent architectural oversight and ensuring that every cross-team and platform-impacting decision receives expert review before implementation — this centralised model ensures coherence because every decision passes through the same experienced reviewers",
        "Keep the current architecture governance process unchanged and add more architects to the existing guild to handle the increased decision volume from 12 teams — the current process works well for 4 teams and the structure is sound, so the scaling challenge is simply one of capacity that can be addressed by hiring additional architects to review more decisions in parallel",
        "Design a federated governance model: organise the 12 teams into 3-4 domains, each with a domain architect who owns decisions within their domain boundary; cross-domain decisions are handled by a small architecture council composed of domain architects; the council sets platform-wide principles and standards that domain architects apply within their domains — with clear escalation criteria, a shared ADR repository with domain-level namespacing, and a quarterly architecture review that assesses coherence across domains"
      ],
      "ans": 4,
      "fb": "Scaling from 4 to 12 teams requires a federated model that distributes decision-making authority while maintaining coherence. Domain architects handle local decisions with context and speed; the architecture council handles cross-domain decisions that require broader coordination; platform-wide principles provide guardrails that prevent drift without bottlenecking every decision. This model scales because most decisions are local and handled within domains. Adding architects to the current process (A) does not change the single-bottleneck structure. A central review team (C) creates a worse bottleneck at 12 teams. No formal governance (D) produces rapid divergence. Annual audits (E) detect drift too late to prevent it.",
      "context": {}
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 1,
      "q": "You have implemented a tiered architectural decision-making process. After 6 months, you observe that teams are gaming the system by framing platform-impacting decisions as team-local to avoid the guild review process. For example, a team introduced a new database technology as a 'team-local experiment' that other teams now depend on. How do you address this systemically without creating adversarial governance?",
      "opts": [
        "Implement a lightweight 'architectural change detection' mechanism: require that any new technology introduction, new external dependency, or new inter-service interface be announced in a shared channel with a brief description before adoption — combine this with a periodic 'architecture radar' review where the guild scans for undeclared platform-impacting changes — and when gaming is detected, use it as a learning opportunity to refine the tier criteria rather than as a compliance failure",
        "Assign a dedicated architect to shadow each team and monitor their technical decisions for signs of tier manipulation, reporting any suspected misclassification to the architecture guild for review — this provides continuous oversight that detects gaming in real time rather than after the fact, and the embedded architect can also provide guidance that helps teams classify their decisions correctly",
        "Require architecture guild pre-approval for every technical decision regardless of the tier classification, eliminating the possibility of gaming by removing the tiered system entirely — this reverts to a single-tier model where all decisions receive the same level of scrutiny, which is more bureaucratic but prevents the loophole that teams are currently exploiting",
        "Add stricter and more detailed definitions to the tier classification criteria with explicit examples of what qualifies as team-local versus platform-impacting, reducing the ambiguity that allows teams to misclassify their decisions — clearer criteria with concrete examples for common edge cases leave less room for subjective interpretation and gaming of the boundaries",
        "Punish teams that are caught misclassifying their decisions by requiring them to retroactively write full guild-reviewed ADRs for all technical decisions they have made in the past quarter, regardless of tier — this creates a significant enough consequence that teams will think carefully before attempting to circumvent the tier classification process in the future"
      ],
      "ans": 0,
      "fb": "Gaming tier criteria signals that the criteria are unclear or the review process is perceived as too costly. The systemic fix combines detection (lightweight announcement of new technologies and interfaces) with periodic scanning (architecture radar), creating visibility without pre-approval overhead. Critically, when gaming is detected, it is used to refine the criteria — not to punish — because punishment drives gaming underground. Stricter definitions alone (A) will be gamed differently. Pre-approval for everything (C) is the bottleneck the tiered system was designed to eliminate. Per-team architects (D) are expensive and create dependency. Retroactive ADRs (E) are punitive and do not prevent future gaming.",
      "context": {}
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 4,
      "q": "You are tasked with establishing a shared architectural vocabulary across the organisation. Engineers from different teams use different terms for the same concepts — one team says 'event sourcing' when they mean 'event-driven,' another uses 'microservice' to describe a module within a monolith. What is the most effective first step?",
      "opts": [
        "Publish an internal architecture wiki with definitions and examples from the platform's own codebase — using real service names, real design decisions, and real ADRs as the source material — then validate the definitions with engineers across teams to ensure the vocabulary reflects how the organisation actually works, not how textbooks define the terms",
        "Create an automated Slack bot that monitors engineering channels for misused architectural terms and posts corrections with links to the official definition, helping engineers learn the correct terminology in the flow of their daily communication without requiring them to proactively consult a reference document",
        "Distribute a comprehensive glossary document defining all architectural terms used across the platform — event sourcing, CQRS, saga, bounded context, aggregate root — with textbook definitions and generic examples, then require all engineers to review the glossary during their quarterly professional development time",
        "Send all senior engineers to an external architecture training course from a recognised provider such as O'Reilly or ThoughtWorks, which provides a common foundation of industry-standard definitions and patterns that will naturally align the team's vocabulary through shared educational experience and certified understanding",
        "Host a single company-wide all-hands engineering session where you present the definitive definitions for all commonly misused architectural terms, with slides showing the correct usage and common misuses, followed by a quiz to verify comprehension — record the session for engineers who cannot attend live"
      ],
      "ans": 0,
      "fb": "Shared vocabulary must be grounded in the organisation's own context, not in abstract definitions. An internal wiki with examples from the platform's actual codebase and ADRs makes terms concrete: 'event sourcing' is linked to a specific service that uses it; 'CQRS' is linked to an actual read model implementation. Validating definitions with engineers ensures the vocabulary reflects usage, not prescription. A glossary document (A) is passive and will not be consulted. External training (C) uses generic examples that may not match your platform. A single presentation (D) does not create durable reference material. An automated Slack bot (E) is adversarial and pedantic.",
      "context": {}
    },
    {
      "level": 6,
      "diff": 1,
      "scenario": 4,
      "q": "You want to create a design guild that meets regularly to discuss architectural topics. Several previous attempts at guilds have failed due to low attendance after the first few sessions. What is the most important structural decision to make the guild sustainable?",
      "opts": [
        "Keep the design guild membership small and exclusive, limited to principal architects and staff engineers, to ensure that every session features high-quality technical discussion without being diluted by less experienced perspectives — a senior-only composition maintains the guild's credibility and ensures decisions are made by the most qualified engineers",
        "Make attendance mandatory for all senior engineers and above through a formal policy enforced by engineering management, with attendance tracked and included in performance reviews — mandatory participation ensures consistent guild membership and prevents the attendance decline that has caused previous guild attempts to fail after initial enthusiasm",
        "Invite external speakers from industry — conference presenters, open-source maintainers, authors of architecture books — to present at each guild session, keeping the content fresh and exposing engineers to perspectives beyond the platform's own challenges, which sustains interest and provides continuous learning opportunities",
        "Structure each session around a real, current design problem that affects attendees — not abstract topics or presentations — so that attending the guild directly helps engineers with their immediate work; rotate the problem source across teams so every team sees the guild as relevant to their domain",
        "Schedule the design guild at the same time and day every week for predictable cadence, with calendar invites sent to all senior engineers at the start of each quarter — consistent scheduling eliminates the friction of finding meeting times and allows engineers to build guild attendance into their weekly routine as a protected block"
      ],
      "ans": 3,
      "fb": "Guilds fail when they become abstract or disconnected from engineers' daily work. Structuring sessions around real, current design problems from attendees' own teams creates immediate value: engineers attend because the discussion helps them solve a problem they are facing right now. Rotating the problem source across teams ensures every team has a reason to participate. Mandatory attendance (A) creates resentment. Fixed scheduling (C) is useful but does not address content relevance. External speakers (D) can supplement but do not sustain. Senior-only membership (E) limits perspectives and creates an ivory tower dynamic.",
      "context": {}
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 4,
      "q": "You have established a design guild and want to create reference architectures that teams can use as starting points for common design patterns. You plan to create reference architectures for event-driven processing, CQRS, multi-tenant data isolation, and API versioning. How should you construct these reference architectures to maximise adoption?",
      "opts": [
        "Hire a technical writer to produce polished, professionally formatted architecture documentation for each reference architecture, with consistent visual design, clear diagrams, and accessible language — high-quality presentation increases the likelihood that engineers will read and reference the documentation, since poorly formatted technical documents are often ignored regardless of content quality",
        "Link to external blog posts, conference talks, and open-source examples for each pattern — Martin Fowler's articles on event sourcing, Chris Richardson's microservices patterns, and relevant CNCF project documentation — since these authoritative external resources are well-maintained, peer-reviewed, and provide broader context than internally-produced documentation",
        "Build each reference architecture as a working, deployable example using the platform's actual tech stack (Spring Boot, Kafka, Cloud SQL, GKE) with production-quality code, tests, and documentation — source the initial implementations from existing services that already implement the pattern well, refactored to be clear and generalised — and include a 'decision guide' for each reference architecture that explains when to use it, when not to use it, and what trade-offs it implies",
        "Write detailed specification documents for each architectural pattern with formal UML sequence diagrams, component diagrams, and deployment diagrams that precisely define the expected interactions, data flows, and component boundaries — these specifications serve as unambiguous contracts that teams can implement against with confidence that they are following the intended design",
        "Ask each team to contribute their own implementation of each architectural pattern to a shared examples repository, creating a collection of real-world implementations that showcase how different teams have applied event-driven processing, CQRS, multi-tenant isolation, and API versioning within their specific domain contexts and service architectures"
      ],
      "ans": 2,
      "fb": "Reference architectures are adopted when they are usable, not when they are readable. A working, deployable example using the platform's actual stack removes the translation gap between documentation and implementation. Sourcing from existing services that already implement the pattern well gives the reference credibility and grounds it in production reality. The decision guide prevents misapplication — telling engineers when not to use the pattern is as important as showing them how. Specification documents (A) describe but do not demonstrate. Team-contributed implementations (C) may vary in quality. Technical writers (D) improve presentation but cannot create working code. External links (E) are not contextualised to the platform.",
      "context": {}
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 4,
      "q": "You have published four reference architectures and notice that two are widely adopted but two are rarely used. The rarely-used ones cover CQRS and saga patterns. After investigation, you find that engineers understand the patterns intellectually but do not feel confident applying them to their own services. What intervention builds adoption?",
      "opts": [
        "Run a workshop series covering CQRS and saga pattern fundamentals — including theory, sequence diagrams, failure mode analysis, and hands-on exercises with simplified examples — to deepen engineers' conceptual understanding and close the gap between intellectual comprehension and practical confidence through additional structured learning and repeated exposure to the patterns",
        "Write more detailed documentation for the underused CQRS and saga reference architectures, adding step-by-step implementation guides, common pitfall descriptions, troubleshooting sections, and FAQ pages that address the specific questions and concerns engineers have raised — better documentation lowers the barrier to adoption by providing comprehensive self-service guidance",
        "Create a structured pairing programme where engineers who want to adopt CQRS or sagas in their service work alongside an engineer who has successfully implemented the pattern — the pairing is project-based, lasting through the design and initial implementation of the pattern in the engineer's actual service — producing a new production implementation that reinforces the reference architecture while building confidence through guided practice",
        "Make CQRS and saga patterns mandatory for all new service implementations going forward, requiring teams to use the reference architectures as their starting template — mandatory adoption eliminates the confidence barrier by making the patterns the default rather than an opt-in choice, and engineers will gain confidence through forced practice on their actual service implementations",
        "Add the underused CQRS and saga reference architectures to the mandatory onboarding programme for all new engineers joining the organisation, ensuring that every new hire is trained on these patterns during their first month — this builds a growing population of engineers who are familiar with the patterns and can advocate for their adoption within their teams"
      ],
      "ans": 2,
      "fb": "The gap is not knowledge (engineers understand the patterns) but confidence (they do not feel ready to apply them). Confidence is built through guided practice on real work, not through more documentation (A) or workshops (C). A structured pairing programme gives the engineer a safety net — an experienced practitioner working alongside them on their actual service — while producing a new production implementation that proves the pattern works in their context. Making patterns mandatory (D) forces adoption without building competence. Adding to onboarding (E) targets new engineers when the gap is in existing team members.",
      "context": {}
    },
    {
      "level": 6,
      "diff": 2,
      "scenario": 4,
      "q": "You are defining the organisation's architectural standards and want to balance prescriptiveness with team autonomy. You must decide which aspects of the architecture should be standardised (everyone follows the same approach) versus which should be guided (recommended with flexibility). How do you draw this line?",
      "opts": [
        "Let teams decide what aspects of the architecture they want to standardise through an organisation-wide survey where engineers vote on which patterns, technologies, and practices should be mandated versus left to team discretion — democratic decision-making ensures that standards reflect the collective preferences and practical experience of the engineering organisation and have broad buy-in for adoption, since engineers are more likely to follow standards they helped define",
        "Draw the line based on blast radius: standardise aspects where divergence creates cross-team risk or operational confusion (inter-service communication protocols, authentication patterns, error response formats, data serialisation formats), and provide guidance with flexibility for aspects where team-local choices do not affect other teams (internal data models, internal class structures, testing approaches, local caching strategies) — document the rationale for each classification so teams understand why certain areas are standardised and others are not",
        "Standardise only the architectural aspects that have already caused production incidents due to cross-team inconsistency — for example, if divergent error response formats caused a client integration failure, standardise error formats; if inconsistent authentication patterns caused a security incident, standardise authentication — this ensures every standard is justified by a concrete incident and avoids over-standardisation of areas that have not yet caused problems",
        "Standardise only the aspects of the architecture that can be enforced automatically through CI/CD pipeline checks, linting rules, or automated compliance scanning — if a standard cannot be mechanically verified, it will inevitably drift as teams make expedient local choices, so the enforcement mechanism should determine the standardisation scope rather than the theoretical importance of consistency",
        "Standardise everything across the platform to maximise consistency and minimise the cognitive overhead of engineers moving between teams and services — when every service follows the same patterns for data models, API design, error handling, testing, logging, and deployment, engineers can be productive in any part of the codebase immediately without learning team-specific conventions and preferences"
      ],
      "ans": 1,
      "fb": "The standard vs. guidance line should be drawn by blast radius: how much damage does divergence in this area cause? Inter-service protocols, authentication, error formats, and serialisation affect every consumer and must be consistent. Internal data models and class structures affect only the owning team and benefit from flexibility. Documenting the rationale for each classification helps teams understand the principle so they can apply it to new decisions. Standardising everything (A) removes team autonomy without proportional benefit. CI/CD enforcement (B) conflates 'enforceable' with 'should be standardised.' Survey-based standardisation (D) produces political outcomes. Incident-triggered standardisation (E) is reactive.",
      "context": {}
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 4,
      "q": "You have built a comprehensive architectural standards programme: reference architectures, a design guild, a shared vocabulary wiki, and a tiered decision-making process. After a year, you notice that the standards are being followed by the original four teams but not by the four new teams that joined over the past year. The new teams are building with different patterns and technologies. What is your assessment of the failure, and what do you change?",
      "opts": [
        "The standards are too rigid and prescriptive, which is why new teams with different backgrounds and working styles are not following them — relax the standards to be more flexible and accommodating of diverse engineering approaches, since the new teams may bring valid alternative patterns from their previous experience that could improve the platform's architecture",
        "The new teams are not following the standards because they were never trained on them — add mandatory architectural onboarding sessions for all new teams that cover the reference architectures, design guild, shared vocabulary, and tiered decision-making process, with a certification requirement that must be completed within the first 30 days of joining the organisation",
        "The standards programme assumed a stable team composition and did not account for growth — the fix is to embed standards into the platform itself (shared libraries, starter templates, CI policies) so that new teams encounter the standards through the tools they use, not through documents they must discover — supplement this with a 'first 90 days' architectural onboarding that pairs each new team with a team that has deep standards context",
        "The standards need to be updated and expanded to accommodate the new teams' different requirements and technology preferences — conduct interviews with the four new teams to understand their architectural approaches, then revise the standards to incorporate valid patterns they have brought from their previous organisations, creating a more inclusive and comprehensive standard set",
        "Assign a dedicated architect to each of the four new teams with the explicit mandate to enforce compliance with the existing architectural standards, reviewing all pull requests for architectural conformance and blocking deployments that deviate from the established patterns — this direct oversight ensures standards are followed from day one"
      ],
      "ans": 2,
      "fb": "The failure is a distribution problem: standards that exist only as documents, guild sessions, and tribal knowledge do not reach new teams that were not present when the standards were established. The fix is to encode standards into the platform's tooling — shared libraries, starter templates, CI policies — so that the path of least resistance is the standard path. New teams encounter the standards through the tools they use, not through documents they must find. A paired onboarding supplements tooling with context. Mandatory training sessions (A) address awareness but not workflow integration. Updating standards for new teams (C) may be appropriate but is not the root cause of non-adoption. Relaxing standards (D) abandons the programme. Per-team architects (E) are expensive and create dependency rather than self-sufficiency.",
      "context": {}
    },
    {
      "level": 6,
      "diff": 3,
      "scenario": 4,
      "q": "You are presenting your architectural standards programme to the board as part of a broader engineering capability review. The board asks: 'How do you know the standards are actually improving engineering quality and not just adding bureaucracy?' What evidence do you present?",
      "opts": [
        "Present the total number of ADRs written across the organisation and the attendance figures for guild sessions over the past year as evidence that the standards programme has driven meaningful engagement and participation in architectural governance — high ADR volume demonstrates that teams are making deliberate, documented architectural decisions rather than ad-hoc choices, and consistent guild attendance across quarters shows sustained institutional investment in architectural quality, indicating that engineers find the programme valuable enough to continue attending voluntarily",
        "Collect and present detailed testimonials from senior engineers, tech leads, and engineering managers describing specific examples of how the architectural standards have improved their team's design quality, reduced cross-team integration friction, accelerated onboarding for new engineers, and prevented architectural mistakes they would have otherwise made — qualitative evidence from respected engineers across multiple teams provides compelling narrative evidence that the programme is delivering tangible value to the people it was designed to serve",
        "Present the number of reference architectures published, the count of teams actively using each one in production, the download and dependency statistics for shared libraries and starter templates, and the percentage of new services built using reference architectures versus from scratch — these adoption metrics demonstrate that the programme's outputs are being actively consumed by engineering teams and directly influencing how new services are designed and built, which is a necessary precondition for quality improvement",
        "Calculate the total cost of the standards programme — including architect salaries allocated to guild sessions, engineering time spent writing and reviewing ADRs, and the development cost of building reference architectures, shared libraries, and starter templates — then compare the total programme cost to the average fully-loaded cost of a single major architecture-related production incident to argue that preventing even one outage caused by architectural inconsistency pays for the entire standards programme several times over",
        "Present a multi-dimensional impact assessment: (1) architectural consistency metrics — percentage of services using standard patterns, measured by tooling not self-report; (2) leading indicators — reduction in cross-team integration issues and architecture-related PR review comments over time; (3) lagging indicators — reduction in production incidents attributable to architectural decisions (retry storms, cascading failures, data inconsistency) compared to the pre-standards baseline; (4) velocity indicators — time-to-production for new services using reference architectures versus those built from scratch — and acknowledge the programme's limitations where standards have not yet demonstrably improved outcomes"
      ],
      "ans": 4,
      "fb": "The board wants evidence of impact, not activity. ADR counts and attendance (A) measure effort, not outcome. Reference architecture counts (B) measure output, not adoption or impact. Testimonials (D) are anecdotal. Simple cost comparison (E) is persuasive but not rigorous. A multi-dimensional impact assessment connects the standards programme to measurable engineering outcomes: consistency metrics show adoption, integration issue reduction shows friction reduction, incident reduction shows risk mitigation, and velocity indicators show productivity impact. Acknowledging limitations demonstrates intellectual honesty and prevents the board from dismissing the presentation as advocacy.",
      "context": {}
    }
  ]
};
