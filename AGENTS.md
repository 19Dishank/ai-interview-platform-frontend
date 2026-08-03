# Verquo Platform — AI Agent Guidelines & Context

This document serves as the authoritative context and instruction manual for AI coding assistants (Antigravity IDE, Claude, Cursor, Copilot, etc.) working on the **Verquo AI-Powered Technical Interviewing Platform**.

---

## 🎯 MANDATORY INSTRUCTIONS FOR AI AGENTS

Whenever you are prompted to add features, fix bugs, or **integrate any API**:
1. **READ THIS DOCUMENT & ARCHITECTURE GUIDES FIRST**: You must strictly follow the established BFF (Backend-For-Frontend) pattern, directory structure, naming conventions, and validation standards without needing explicit reminders. Refer to `PROMPT_GUIDE.md` for prompt templates.
2. **NEVER CALL BACKEND DIRECTLY FROM THE CLIENT**: All browser/client API requests MUST hit Next.js BFF routes (`/api/...`) via `@/services/api/client-axios`.
3. **DO NOT REMOVE MOCK DATA UNLESS INSTRUCTED**: Pages that do not have an API integrated yet rely on `@/data/mock.ts`. Keep static mock data intact until an API integration is explicitly requested.

---

## 🏗️ 1. BFF (Backend-For-Frontend) Architecture & API Conventions

Every API integration in this project MUST follow the 3-Tier BFF flow:

```
[ Client Component ] 
       │ (clientApi / Axios + Sonner Toasts)
       ▼
[ Next.js API Route: app/api/<domain>/<action>/route.ts ] (BFF Layer)
       │ (serverApi / Axios + Automatic Role Token Injection & Refresh)
       ▼
[ External Backend API: process.env.NEXT_PUBLIC_BACKEND_URL ]
```

### Tier 1: Client Service Layer (`services/<domain>/<domain>.services.ts`)
- Client components MUST NOT write raw `fetch` or `axios` calls directly.
- Wrap all client HTTP requests in functions exported from `@/services/<domain>/<domain>.services.ts`.
- Use `clientApi` exported from `@/services/api/client-axios`.
- `clientApi` has built-in response interceptors for Sonner toast notifications and automatic 401 handling (`/continue` redirect).

### Tier 2: Next.js BFF Route Handlers (`app/api/<domain>/.../route.ts`)
- All Next.js API routes MUST be wrapped with `withErrorHandler` from `@/services/api/handle-route`.
- Forward requests to the external backend using `serverApi` from `@/services/api/server-axios`.
- Manage authentication cookies using `setAuthCookies` from `@/lib/set-auth-cookies`.
- Return standardized JSON responses: `{ success: boolean, message?: string, data?: any }`.

### Tier 3: Server Axios & Auth Cookie Management
- `serverApi` (`@/services/api/server-axios.ts`) automatically extracts the user's role from the `user_role` cookie and retrieves the corresponding token (`candidate_token`, `recruiter_token`, `admin_token`) via `roleTokenMap` from `@/lib/auth/role-cookie-map.ts`.
- It automatically handles Authorization header injection (`Bearer <token>`) and 401 token refresh mechanisms.

---

## 🔐 2. Route Protection & Proxying (`proxy.ts`)

- Route protection is managed by `proxy.ts` (Next.js route proxy).
- It protects `/candidate/*`, `/recruiter/*`, and `/admin/*` routes.
- Checks for active session cookies (`user_role` + role token) and verifies role permissions against requested routes.
- Unauthorized users are redirected to `/continue` (login/signup page).

---

## 📋 3. Form Validation & Schema Conventions

All forms in this project MUST use `react-hook-form` paired with `zod` and `@hookform/resolvers/zod`:

1. **Schema Definitions**: Define all Zod schemas in `lib/validations/<domain>.ts` (e.g., `lib/validations/auth.ts`, `lib/validations/profile.ts`).
2. **Type Inference**: Export TypeScript types in `types/<domain>.types.ts` inferred directly from Zod using `z.infer<typeof schema>`. Never duplicate interface types manually.
3. **Form Setup**:
   ```tsx
   import { useForm, FormProvider } from "react-hook-form";
   import { zodResolver } from "@hookform/resolvers/zod";
   import { mySchema } from "@/lib/validations/domain";
   import { MyFormTypes } from "@/types/domain.types";

   const methods = useForm<MyFormTypes>({
     resolver: zodResolver(mySchema),
     defaultValues: { ... },
   });
   ```
4. **Step-by-Step Validation**: For multi-step forms (e.g. `ProfileBuilder`), validate only active step fields before step progression using `await methods.trigger("stepFieldName")`.

---

## 📁 4. Project File & Naming Conventions

- **Next.js Pages & Routes**: `app/<portal>/<page>/page.tsx`, `app/api/<feature>/route.ts`
- **UI Components**: `components/ui/<ComponentName>.tsx` (PascalCase)
- **Domain Components**: `components/<domain>/<ComponentName>.tsx` (PascalCase)
- **Validations**: `lib/validations/<domain>.ts` (lowercase)
- **Services**: `services/<domain>/<domain>.services.ts`
- **Types**: `types/<domain>.types.ts`
- **Context**: `context/<ProviderName>.tsx`

---

## 🛠️ Tech Stack Reference

- **Next.js 16 (App Router)**
- **React 19**
- **Tailwind CSS v4**
- **Zod & @hookform/resolvers**
- **Axios (clientApi & serverApi)**
- **Sonner (Toast notifications)**
- **Lucide React (Icons)**
