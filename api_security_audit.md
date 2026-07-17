# Verquo Security & Data Leakage Audit (Backend Integration Plan)

This document outlines key security boundaries, data exposure risks, and best practices as you migrate from local mock data to real backend API integration in the Verquo platform.

---

## 🔒 1. Client-Side vs. Server-Side Data Filtering (Critical Risk)

### Current Implementation:
In your client components (e.g., **[search/page.tsx](file:///e:/React%20Js/ai-interview-platform/app/recruiter/search/page.tsx)**), the entire candidate database (`mockCandidates`) is loaded into the browser bundle and filtered client-side:
```tsx
const filtered = mockCandidates.filter(c => {
  // Filtering logic runs in the browser
})
```

### ⚠️ The Risk:
When you query the backend, if your search endpoint returns the full candidate objects (containing `email`, `phone`, and full internal interview transcripts) to the browser, **anyone can inspect the network response tab in Chrome DevTools and extract candidates' private contact details without authorization.**

### ✅ Security Resolution:
1. **Sanitize Search APIs**: The candidate search endpoint (`GET /api/candidates`) must return a sanitized payload. Remove sensitive properties such as `email`, `phone`, and raw interview transcripts from the search results.
2. **Server-Side Querying**: Pass parameters like `domain`, `level`, and `query` as query parameters to your backend (`/api/candidates?domain=Frontend&level=Senior`), and perform the filtering in your database (e.g., PostgreSQL `WHERE` clauses).
3. **Contact Authorization Gate**: Create a specific, rate-limited endpoint (`POST /api/candidates/:id/reveal-contact`) that checks if the recruiter has a valid subscription seat before returning `email` or `phone`.

---

## 🛡️ 2. Route Protection & Middleware (Authentication Boundaries)

Currently, all portals (`/candidate/*`, `/recruiter/*`, `/admin/*`) are accessible simply by typing the URL. When connecting a backend:

### ✅ Security Resolution:
Implement a Next.js Middleware file (`middleware.ts` in the root folder) to intercept incoming requests and validate session tokens (e.g., via NextAuth.js, Firebase Auth, or JWTs):

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt' // if using NextAuth

export async function middleware(req: NextRequest) {
  const token = await getToken({ req })
  const { pathname } = req.nextUrl

  // 1. Unauthenticated users seeking secure pages -> redirect to login
  if (!token) {
    if (pathname.startsWith('/candidate') || pathname.startsWith('/recruiter') || pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // 2. Role-based Access Control (RBAC)
  if (token) {
    const userRole = token.role // 'candidate' | 'recruiter' | 'admin'

    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/_not-found', req.url))
    }
    if (pathname.startsWith('/recruiter') && userRole !== 'recruiter' && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/_not-found', req.url))
    }
    if (pathname.startsWith('/candidate') && userRole !== 'candidate') {
      return NextResponse.redirect(new URL('/_not-found', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/candidate/:path*', '/recruiter/:path*', '/admin/:path*'],
}
```

---

## 📊 3. Admin Dashboard Isolation

### Current Implementation:
**[data/mock.ts](file:///e:/React%20Js/ai-interview-platform/data/mock.ts)** stores global metrics, billing tables, and user control records:
* `mockAdminStats`
* `mockPlans`
* `mockUsers`

### ⚠️ The Risk:
Under no circumstances should candidate or recruiter endpoints ever return or reference statistics from these models. 

### ✅ Security Resolution:
* Ensure that all admin endpoints (e.g., `/api/admin/*`) are explicitly protected with a strict `isAdmin` check on the server controller layer, checking the user's role on the session token directly in the database before querying admin-only collections.

---

## 🗃️ 4. Recommended Data Schemas (API Boundary Mapping)

To prevent data leaks, split candidate payloads into **Public Profile** and **Secure/Contact Profile**:

### Public Candidate Payload (Safe for Search / General Listing)
```json
{
  "id": "c1",
  "name": "Arjun Mehta",
  "photo": "https://images.unsplash.com/...jpg",
  "title": "Senior Frontend Engineer",
  "experience": 6,
  "skills": ["React", "TypeScript", "Next.js"],
  "domain": "Frontend",
  "level": "Senior",
  "salaryExpectation": "₹32–38 LPA",
  "noticePeriod": "30 days",
  "overallScore": 87,
  "technicalScore": 91,
  "communicationScore": 82,
  "summary": "Exceptional system design thinking..."
}
```

### Secured Candidate Contact Payload (Available ONLY after Recruiter unlock)
```json
{
  "email": "arjun.mehta@email.com",
  "phone": "+91 98765 43210",
  "github": "https://github.com/arjunmehta",
  "linkedin": "https://linkedin.com/in/arjunmehta"
}
```
