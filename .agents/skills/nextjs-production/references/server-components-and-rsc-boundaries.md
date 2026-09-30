# React Server Components (RSC) & Boundary Architecture

Mastering the boundary between Server Components and Client Components is the foundation of high-performance Next.js engineering.

---

## 1. When to Use Which

| Requirement | Server Component (Default) | Client Component (`'use client'`) |
| :--- | :---: | :---: |
| Fetching database data (Prisma) | ✅ | ❌ (Exposes credentials/queries) |
| Reading backend secrets / API keys | ✅ | ❌ |
| Keeping heavy libraries on server | ✅ | ❌ (Bloats client bundle) |
| Event listeners (`onClick`, `onChange`) | ❌ | ✅ |
| State hooks (`useState`, `useReducer`) | ❌ | ✅ |
| Lifecycle hooks (`useEffect`) | ❌ | ✅ |
| Browser APIs (`window`, `localStorage`) | ❌ | ✅ |
| Custom interactive hooks | ❌ | ✅ |

---

## 2. Composing Server and Client Components

### The "Slot" / Children Composition Pattern
Never import a Server Component directly into a Client Component (it will convert the Server Component into a client component). Instead, pass Server Components as `children` or explicit JSX props:

```jsx
// ❌ Anti-pattern: Importing Server Component into Client Component
// ModalClient.jsx ('use client')
import HeavyDoctorProfileServer from './HeavyDoctorProfileServer'; // FORCED TO CLIENT!

export default function ModalClient() {
  const [open, setOpen] = useState(false);
  return open ? <HeavyDoctorProfileServer /> : null;
}

// ✅ Production Pattern: Pass as children
// ModalClient.jsx ('use client')
'use client';
import { useState } from 'react';

export default function ModalClient({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open Details</button>
      {open && <div className="modal-overlay">{children}</div>}
    </>
  );
}

// Page.jsx (Server Component)
import ModalClient from './ModalClient';
import HeavyDoctorProfileServer from './HeavyDoctorProfileServer';

export default async function Page() {
  const doctor = await prisma.doctor.findUnique(...);
  return (
    <ModalClient>
      {/* HeavyDoctorProfileServer stays a 100% Server Component! */}
      <HeavyDoctorProfileServer doctor={doctor} />
    </ModalClient>
  );
}
```

---

## 3. Serialization Rules at the Boundary

Props passed from a Server Component to a Client Component must be **serializable**:
- Allowed: Plain objects, arrays, strings, numbers, booleans, `null`, `undefined`, BigInt, and Promises.
- Not Allowed: Functions (except Server Actions), Class instances with methods, Date objects (convert to ISO string or timestamp to prevent hydration mismatch).
