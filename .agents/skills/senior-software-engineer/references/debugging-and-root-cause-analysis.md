# Debugging & Root Cause Analysis Guide

A Junior Engineer tries random fixes until the symptom disappears. A Senior Engineer diagnoses the underlying mechanism, isolates the root cause, and eliminates the entire class of defect.

---

## 1. The Senior Debugging Protocol

```
1. REPRODUCE      -> Establish a minimal, deterministic reproduction case.
2. ISOLATE        -> Binary search / trace inputs to locate the exact failing boundary.
3. HYPOTHESIZE    -> Formulate a testable theory for WHY it fails.
4. EXPERIMENT     -> Test the hypothesis without altering unrelated code.
5. FIX ROOT CAUSE -> Implement the targeted, minimal fix.
6. REGRESSION-TEST-> Verify the fix AND ensure adjacent features remain intact.
```

---

## 2. Common Bug Patterns & Root Cause Archetypes

### A. Asynchronous Race Conditions
- *Symptom*: Works 95% of the time, intermittently fails under rapid user clicking or variable network speeds.
- *Root Cause*: Two asynchronous operations finish in arbitrary order, with an earlier stale request overwriting later fresh state.
- *Solution*: Use abort controllers (`AbortController`), cancellation flags, or optimistic state locking.

### B. Hydration Mismatches (SSR / Next.js)
- *Symptom*: React warnings: "Text content did not match server-rendered HTML."
- *Root Cause*: Rendering dynamic values (dates formatted with local timezone, `window.innerWidth`, random numbers) during server render vs browser mount.
- *Solution*: Ensure initial render matches server output, and defer client-only calculations to `useEffect` or use `suppressHydrationWarning` on specific isolated elements.

### C. Memory Leaks & Event Listener Accumulation
- *Symptom*: Application gets progressively sluggish, memory usage balloons.
- *Root Cause*: Event listeners, intervals, or WebSocket subscriptions added inside `useEffect` without cleanup returns.
- *Solution*: Always return a cleanup function:
  ```javascript
  useEffect(() => {
    const handleResize = () => setDimensions(...);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  ```

### D. Unhandled Promise Rejections & Floating Promises
- *Symptom*: Node process crash or silent failures where operations seem to vanish.
- *Root Cause*: Not `await`ing a promise or omitting `.catch()` handlers on fire-and-forget background jobs.
- *Solution*: Explicitly handle every promise or wrap background tasks in error logging boundaries.

---

## 3. The 5-Whys Post-Mortem Method

When an issue occurs in production, investigate 5 levels deep:
1. *Why did the booking fail?* -> The database transaction rolled back.
2. *Why did it roll back?* -> A unique constraint failed on the slot time.
3. *Why did the unique constraint fail?* -> Two users selected the same slot simultaneously.
4. *Why were both allowed to select it?* -> The UI showed the slot as available without locking.
5. *Why was there no locking?* -> The booking endpoint lacked pessimistic slot locking (`SELECT FOR UPDATE`) or optimistic version checking.
*Permanent Fix*: Implement atomic reservation with expiration lock in the database transaction.
