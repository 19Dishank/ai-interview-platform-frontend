# Verquo — AI Prompting & Reference Guide

This document provides ready-to-use prompt templates for instructing AI Coding Assistants (Antigravity IDE, Claude, Cursor, Copilot, etc.) on the **Verquo Platform**.

Because project rules are defined in `@AGENTS.md` and `@ARCHITECTURE.md`, AI agents will automatically follow the **3-Tier BFF Architecture**, **Zod Form Validations**, and **Role Cookie System** without requiring verbose technical explanations.

---

## 🎯 Quick Copy-Paste Prompts

### 1. API Integration Prompt
Use this when you want to connect a frontend feature to a backend endpoint:

```text
Integrate the [Feature Name] API endpoint (`POST /path/to/endpoint`).
Please follow our established BFF architecture in AGENTS.md.
```

*Example:*
> *"Integrate the candidate profile save API (`POST /candidate/profile`). Please follow our established BFF architecture in AGENTS.md."*

---

### 2. Convert Mock Page to Real API
Use this when you are ready to replace `@/data/mock.ts` with real API calls:

```text
Replace the mock data in `app/[portal]/[page]/page.tsx` with a real API integration for fetching data (`GET /api/endpoint`). Follow our BFF service and route handler standards in ARCHITECTURE.md.
```

*Example:*
> *"Replace the mock data in `app/recruiter/search/page.tsx` with a real API integration for fetching candidates (`GET /candidates`). Follow our BFF service and route handler standards in ARCHITECTURE.md."*

---

### 3. Build a New Form with Validations
Use this when creating a new form:

```text
Create a new form component for [Form Name]. Define Zod schema in `lib/validations/`, infer types in `types/`, and wire it up with `react-hook-form` and `zodResolver`.
```

*Example:*
> *"Create a new form component for Recruiter Job Creation. Define Zod schema in `lib/validations/jobs.ts`, infer types in `types/jobs.types.ts`, and wire it up with `react-hook-form` and `zodResolver`."*

---

### 4. Fix a Bug or Refactor API Logic
Use this when troubleshooting an existing route or API call:

```text
Fix an issue in [Feature/File Name]. Make sure `clientApi` is used on the client side, `serverApi` is used in the Next.js BFF route, and responses use `withErrorHandler`.
```

*Example:*
> *"Fix the error handling in `app/api/auth/verify-otp/route.ts`. Make sure `serverApi` is used and responses are properly wrapped with `withErrorHandler`."*

---

### 5. Multi-Step Form Feature
Use this when extending a multi-step form (like `ProfileBuilder`):

```text
Add a new step [Step Name] to the Candidate Profile Builder. Update `lib/validations/profile.ts`, `types/profile.types.ts`, and add step-by-step trigger validation in `handleNext`.
```

---

## 💡 Best Practices for Prompting in this Workspace

1. **Tag Context Files**: If your IDE supports file tagging (like Cursor or Antigravity), tag `@AGENTS.md` or `@ARCHITECTURE.md` in your prompt for maximum accuracy.
2. **Keep Prompts Concise**: Focus on **WHAT** business logic or endpoint you want, rather than **HOW** to write Axios calls or Zod schemas.
3. **Specify Endpoints**: Mention the HTTP method (`GET`, `POST`, `PUT`, `DELETE`) and the backend path whenever known.
