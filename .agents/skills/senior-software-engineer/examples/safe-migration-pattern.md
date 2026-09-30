# Safe Zero-Downtime Database Migration Pattern

A Senior Engineer never runs a destructive schema change directly in production. Use the **Expand and Contract (Parallel Run)** pattern to evolve schemas safely.

---

## The 4-Phase Migration Lifecycle

### Phase 1: Expand (Add New Column/Table)
- Add new column as nullable or with a safe default value.
- *Never* rename or delete the old column in this phase.
- Deploy database migration.
- Result: Old code still reads/writes old column without disruption.

### Phase 2: Dual-Write (Application Update)
- Update application logic to write to BOTH the old and new columns.
- Read from the old column, with fallback to new column if null.
- Deploy application code.

### Phase 3: Backfill (Data Sync)
- Run a background script or batch SQL job to copy historical data from old column to new column.
- Verify 100% data parity between old and new columns.
- Switch application reads to the new column.

### Phase 4: Contract (Cleanup)
- Remove dual-write from application code; write exclusively to new column.
- Drop the old column or deprecated table in a final, clean database migration.
