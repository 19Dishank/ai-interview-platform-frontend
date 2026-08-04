# Verquo — Git Branching Strategy & Guidelines

This document outlines the official Git branching strategy, workflow rules, and environment promotion model for the **Verquo Platform**. All developers and AI Coding Assistants MUST adhere to this structure.

---

## 🌲 Branch Hierarchy & Roles

```
  [ main ]         <-- Default Protected Branch (No direct pushes)
     ▲
  [ dev ]          <-- Production Branch (Stable, fully tested code)
     ▲
 [ staging ]       <-- Staging & Testing Branch (Integration testing)
     ▲
 [ feat-* ]        <-- Feature Development Branches (e.g. feat-auth, feat-candidate)
```

### 1. `main` (Default Branch)
- **Role**: Default protected root repository branch.
- **Rule**: **No direct commits or pushes** are allowed on `main`. 

### 2. `dev` (Production Branch)
- **Role**: Serves as the primary production-grade codebase for live deployment.
- **Rule**: Code is merged into `dev` **ONLY** after it has passed all testing, QA, and validation phases on the `staging` branch.

### 3. `staging` (Staging & Integration Branch)
- **Role**: Environment for integrating and testing fully implemented features before production release.
- **Rule**: When a feature branch (`feat-*`) completes development, it is merged into `staging` for integration testing.

### 4. `feat-*` (Feature Branches)
- **Role**: Isolated branches created for active feature development (e.g., `feat-auth`, `feat-candidate`, `feat-recruiter`).
- **Rule**: All new feature work MUST happen inside a dedicated `feat-*` branch created off `staging`.

---

## 🔄 Feature Lifecycle Workflow

1. **Start Feature Work**: Create a new branch named `feat-<feature_name>` off `staging`:
   ```bash
   git checkout staging
   git checkout -b feat-candidate
   ```
2. **Develop & Verify**: Implement feature code, BFF API routes, Zod validations, and test locally (`npm run build`).
3. **Merge to Staging**: Once the feature is complete, merge `feat-*` into `staging` for testing:
   ```bash
   git checkout staging
   git merge feat-candidate
   ```
4. **Promote to Production (`dev`)**: Once testing passes on `staging`, promote and merge `staging` into `dev`:
   ```bash
   git checkout dev
   git merge staging
   ```
