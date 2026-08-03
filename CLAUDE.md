# Claude Agent Context — Verquo Platform

Please refer to `@AGENTS.md` and `@ARCHITECTURE.md` for complete rules, BFF pattern specifications, directory layout, naming conventions, and API integration guidelines.

## Quick Summary of Rules:
1. **Always use BFF Method**: Client components call `@/services/<domain>/<domain>.services.ts` -> `clientApi` -> Next.js API routes (`app/api/<domain>/route.ts`).
2. **Next.js BFF Handlers**: Wrapped with `withErrorHandler` from `@/services/api/handle-route` -> `serverApi` (`@/services/api/server-axios`).
3. **Form Validations**: Always use Zod schemas in `lib/validations/<domain>.ts`, infer types in `types/<domain>.types.ts`, and use `zodResolver` with `react-hook-form`.
4. **Auth Cookies**: Role-based token mapping (`candidate_token`, `recruiter_token`, `admin_token`). Managed via `setAuthCookies` and `proxy.ts`.
5. **Static Mock Data**: Keep using `@/data/mock.ts` for pages without integrated APIs until explicitly requested.
