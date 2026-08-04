# Verquo Platform — Full Architecture & BFF Integration Guide

This guide details the complete system architecture, BFF (Backend-For-Frontend) API integration rules, directory standards, and code patterns for the Verquo platform.

---

## 🏛️ System Architecture Overview

Verquo follows a modern 3-Tier Backend-For-Frontend (BFF) architecture in Next.js App Router:

```
┌─────────────────────────────────────────────────────────┐
│                    Client Browser                       │
│  - React 19 Client Components                           │
│  - React Hook Form + Zod Validations                    │
│  - clientApi (services/api/client-axios.ts)             │
└────────────────────────────┬────────────────────────────┘
                             │ HTTP Requests (/api/*)
                             ▼
┌─────────────────────────────────────────────────────────┐
│              Next.js BFF Layer (App Router)             │
│  - app/api/<domain>/<action>/route.ts                   │
│  - Wrapped with withErrorHandler()                      │
│  - Proxy Route Protection (proxy.ts)                    │
│  - Auth Cookie Management (lib/set-auth-cookies.ts)     │
│  - serverApi (services/api/server-axios.ts)             │
└────────────────────────────┬────────────────────────────┘
                             │ Forwarded HTTP Requests
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    External Backend                     │
│  - process.env.NEXT_PUBLIC_BACKEND_URL                  │
│  - Authentication, Database & AI Interview Services     │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 API Integration Workflow (BFF Standard)

When prompted to integrate an API endpoint (e.g. `POST /candidate/profile`), ALWAYS follow these exact steps:

### Step 1: Define Zod Validation & TypeScript Types

1. Create/update `lib/validations/<domain>.ts`:
```typescript
import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  // ... other fields
});
```

2. Infer type in `types/<domain>.types.ts`:
```typescript
import { z } from "zod";
import { profileSchema } from "@/lib/validations/profile";

export type ProfileForm = z.infer<typeof profileSchema>;
```

### Step 2: Create Client Service Function

Create/update `services/<domain>/<domain>.services.ts`:
```typescript
import { clientApi } from "../api/client-axios";
import { ProfileForm } from "@/types/profile.types";

export const updateProfile = async (payload: ProfileForm) => {
  try {
    const response = await clientApi.post("/candidate/profile", payload);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
```

### Step 3: Create Next.js BFF Route Handler

Create `app/api/<domain>/<action>/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { withErrorHandler } from "@/services/api/handle-route";
import serverApi from "@/services/api/server-axios";

export const POST = withErrorHandler(async (req: Request) => {
  const body = await req.json();

  // Forward request to external backend serverApi
  const response = await serverApi.post("/candidate/profile", body);

  return NextResponse.json({
    success: response.data.success,
    message: response.data.message,
    data: response.data.data,
  });
});
```

### Step 4: Wire Component to Service & Form

Inside your React client component (`"use client"`):
```tsx
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "@/lib/validations/profile";
import { ProfileForm } from "@/types/profile.types";
import { updateProfile } from "@/services/candidate/candidate.services";

export default function ProfileFormContainer() {
  const methods = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { ... },
  });

  const onSubmit = async (data: ProfileForm) => {
    await updateProfile(data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </FormProvider>
  );
}
```

---

## 🔑 Token & Cookie System

The application handles 3 distinct roles using role-mapped cookies:

| Role | Access Token Cookie | Refresh Token Cookie | Role Cookie |
| :--- | :--- | :--- | :--- |
| `CANDIDATE` | `candidate_token` | `candidate_refresh_token` | `user_role = "CANDIDATE"` |
| `RECRUITER` | `recruiter_token` | `recruiter_refresh_token` | `user_role = "RECRUITER"` |
| `ADMIN` | `admin_token` | `admin_refresh_token` | `user_role = "ADMIN"` |

- **Setting Cookies**: Done inside Next.js API routes using `setAuthCookies(res, role, accessToken, refreshToken)` from `@/lib/set-auth-cookies`.
- **Reading Cookies**: `serverApi` automatically reads `user_role` and attaches `Authorization: Bearer <role_token>` on outgoing backend requests.
- **Route Access**: Enforced via `proxy.ts` (Next.js route proxy).

---

## 📂 Project Structure & Naming Reference

```
app/
 ├── (auth)/continue/page.tsx      # Auth entry point (OTP/Google Login)
 ├── candidate/                    # Candidate portal views
 ├── recruiter/                    # Recruiter portal views
 ├── admin/                        # Admin dashboard views
 └── api/                          # Next.js BFF Route Handlers
      ├── auth/
      │    ├── google/route.ts
      │    ├── send-otp/route.ts
      │    ├── verify-otp/route.ts
      │    └── logout/route.ts
      └── candidate/...

components/
 ├── ui/                           # Reusable primitive controls (Button, Input, Card)
 ├── auth/                         # Authentication forms (EmailVerify, OtpVerify)
 └── candidate/                    # Candidate profile forms

lib/
 ├── validations/                  # Zod validation schemas (auth.ts, profile.ts)
 ├── auth/role-cookie-map.ts       # Role & cookie token mappings
 └── set-auth-cookies.ts           # Cookie setter helper

services/
 ├── api/
 │    ├── client-axios.ts          # Client-side Axios instance (talks to /api)
 │    ├── server-axios.ts          # Server-side Axios instance (talks to backend)
 │    └── handle-route.ts          # BFF error handling wrapper (withErrorHandler)
 └── auth/
      └── auth.services.ts         # Client auth service calls

types/                             # TypeScript interfaces & inferred Zod types
```
