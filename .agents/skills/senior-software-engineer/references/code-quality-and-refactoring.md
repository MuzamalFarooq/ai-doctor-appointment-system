# Code Quality & Refactoring Guide

Clean code is not about dogma; it is about reducing cognitive load for the next engineer who reads, modifies, or debugs the code.

---

## 1. Principles of Clean Code

### A. The Single Responsibility Principle (SRP)
Each module, function, or component should have **one reason to change**.
- *Code Smell*: A 600-line React component that fetches data, formats dates, calculates tax, handles form validation, and renders complex nested modals.
- *Refactoring*: Extract custom hooks for data fetching, utility functions for date/math formatting, and separate presentation subcomponents.

### B. DRY (Don't Repeat Yourself) vs. AHA (Avoid Hasty Abstractions)
- Duplication is cheaper than the wrong abstraction.
- Wait until a pattern repeats at least **three times** (Rule of Three) before extracting a shared abstraction.
- When abstracting, ensure the underlying concepts truly share domain meaning, not just visual coincidence.

### C. Guard Clauses & Early Returns (Bouncer Pattern)
Avoid deep nesting (`if` inside `if` inside `if`). Check for preconditions first and exit early:

```javascript
// ❌ Poor: Nested pyramid of doom
async function bookAppointment(req, res) {
  if (req.user) {
    if (req.body.doctorId) {
      const doctor = await getDoctor(req.body.doctorId);
      if (doctor) {
        if (doctor.isAvailable) {
          // ... 40 lines later
        } else {
          return res.status(400).json({ error: "Doctor is unavailable" });
        }
      } else {
        return res.status(404).json({ error: "Doctor not found" });
      }
    } else {
      return res.status(400).json({ error: "Missing doctorId" });
    }
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

// ✅ Senior: Guard clauses with linear reading flow
async function bookAppointment(req, res) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { doctorId } = req.body;
  if (!doctorId) {
    return res.status(400).json({ error: "Missing doctorId" });
  }

  const doctor = await getDoctor(doctorId);
  if (!doctor) {
    return res.status(404).json({ error: "Doctor not found" });
  }

  if (!doctor.isAvailable) {
    return res.status(400).json({ error: "Doctor is unavailable" });
  }

  // Linear, unindented core execution
  const appointment = await createAppointmentRecord({ userId: req.user.id, doctorId });
  return res.status(201).json({ success: true, appointment });
}
```

---

## 2. Safe Refactoring Workflow

When refactoring legacy code:

1. **Verify Existing Behavior**: Understand exactly what the code currently does, including edge cases and implicit assumptions.
2. **Small Incremental Steps**: Never rewrite an entire module in a single massive diff. Change one piece at a time.
3. **Keep Tests/Types Green**: After each step, verify that type checks and linting pass.
4. **Preserve Public Interfaces**: Do not alter external function signatures or component props unless intentionally updating callers.
5. **Delete Dead Code**: Do not leave commented-out blocks or unused imports ("we might need this later" — Git history retains it).

---

## 3. Defensive Programming Rules

1. **Handle Nullish Values Gracefully**: Use optional chaining (`?.`) and nullish coalescing (`??`), but do not swallow real errors.
2. **Strict Equality**: Always use `===` instead of `==`.
3. **Immutability by Default**: Prefer `const` over `let`. Never use `var`. Avoid mutating arrays or objects directly in UI state; use functional transformations (`.map()`, `.filter()`, spread operator).
4. **Timeout All External Calls**: Never make an outbound HTTP call or database query without a defined timeout.
