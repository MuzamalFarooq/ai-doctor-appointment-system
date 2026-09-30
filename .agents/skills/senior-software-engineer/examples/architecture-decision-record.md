# Architecture Decision Record (ADR) Template

Documenting architectural decisions prevents bikeshedding, captures technical context for future team members, and evaluates trade-offs objectively.

---

## Template

### ADR-[000X]: [Short Title of the Decision]

- **Status**: [Proposed | Accepted | Rejected | Superseded by ADR-XXX]
- **Date**: YYYY-MM-DD
- **Decision Makers**: [Names / Roles]
- **Technical Context**: [Brief description of the problem, constraints, and business context]

### Context & Problem Statement
*Describe the context, user pain point, or technical bottleneck that requires this architectural decision.*

### Considered Options
1. **Option A**: [Description, e.g., Use Server Actions with Prisma directly]
2. **Option B**: [Description, e.g., Dedicated REST API route handlers with Service layer]
3. **Option C**: [Description, e.g., External GraphQL gateway]

### Decision Outcome
**Chosen Option**: [Option B]

#### Positive Consequences / Pros:
- Decouples client presentation from database access.
- Easy to unit test services in isolation without mocking Next.js request context.
- Can be reused by mobile clients or third-party webhooks in the future.

#### Negative Consequences / Trade-offs:
- Slightly more boilerplate than inline Server Actions.
- Requires maintaining explicit DTO / serialization types.

### Mitigation Strategy
*How will we minimize the negative consequences or technical debt introduced by this trade-off?*
