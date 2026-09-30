# Senior Code Review Rubric & Checklist

Use this rubric when reviewing code changes, pull requests, or evaluating proposed refactors.

---

## 1. High-Impact Review Checklist

| Category | Checks | Severity |
| :--- | :--- | :--- |
| **Correctness & Edge Cases** | • Does it handle empty, null, undefined, and malformed inputs?<br>• Are asynchronous flows awaited properly without race conditions?<br>• What happens when an external API or DB call fails? | 🔴 Blocker |
| **Security** | • Is input sanitized and validated at boundaries (Zod)?<br>• Are authorization checks enforced (ownership verification)?<br>• Are SQL injections, XSS, or IDOR vulnerabilities present?<br>• Are any secret keys or PII exposed? | 🔴 Blocker |
| **Data Integrity & DB** | • Are database migrations backward-compatible?<br>• Are foreign keys and query filters indexed?<br>• Are transactions used for multi-step mutations? | 🔴 Blocker |
| **Performance** | • Are there N+1 queries?<br>• Are client bundles bloated with unnecessary server code?<br>• Are heavy re-renders triggered unnecessarily? | 🟡 Warning |
| **Maintainability** | • Are names descriptive and self-documenting?<br>• Is code cleanly decoupled and modular?<br>• Is dead or commented-out code eliminated? | 🟢 Suggestion |

---

## 2. Review Feedback Tone & Etiquette

- **Be Specific & Actionable**: Point out the exact line and explain *why* the suggestion improves reliability or performance.
- **Prefix Comments**:
  - `[BLOCKER]`: Critical security, data integrity, or breaking bug. Must be resolved before merge.
  - `[PERF]`: Significant performance bottleneck.
  - `[NIT]`: Minor style or naming improvement. Non-blocking.
  - `[QUESTION]`: Inquiring into architectural intent or clarifying requirements.
