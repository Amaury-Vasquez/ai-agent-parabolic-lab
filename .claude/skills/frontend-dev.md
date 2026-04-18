---
name: frontend-dev
description: Frontend development guidelines for the ParabolicLab project. Use when creating, editing, or reviewing any file inside the parabolic-lab-frontend/ directory. Apply when building React components, pages, modules, hooks, utils, or constants.
user-invocable: false
---

# Frontend Development Guidelines

These rules apply to all work inside the `parabolic-lab-frontend/` directory.

## Core Principles

- **Clean code**: Keep files short and focused. Avoid bloated components.
- **Single Responsibility**: Each function, hook, and component does one thing.
- **Abstraction**: Extract reusable logic into hooks or utils. Extract UI into smaller components.
- **amvasdev-ui first**: Always use amvasdev-ui components instead of raw HTML elements or direct DaisyUI classes.

## Directory Structure

```
parabolic-lab-frontend/src/
├── app/            # Next.js 16 App Router (route groups + pages)
├── modules/        # Page-level components (one folder per module)
├── components/     # Shared, reusable components
├── hooks/          # Custom React hooks (reusable logic)
├── queries/        # Custom hooks wrapping useQuery (one file per hook)
├── mutations/      # Custom hooks wrapping useMutation (one file per hook)
├── utils/          # Pure utility functions (reusable logic)
├── constants/      # Shared constant values (SCREAMING_SNAKE_CASE)
├── contexts/       # React Context providers
├── providers/      # Wrapper providers (cookies, query client, etc.)
├── layouts/        # Layout wrappers (MainLayout, SidebarLayout)
├── models/         # TypeScript interfaces for domain entities
└── types/          # TypeScript types (form schemas, config shapes, etc.)
```

## Pages (`/app`)

Page files are **thin orchestrators**. They should only:

1. Fetch data (API calls, route params, query params)
2. Derive the props needed by the module
3. Render a **single** module component, passing the props

```tsx
// app/docente/page.tsx
import Docente from "@/modules/Docente";

export default function DocentePage() {
  return <Docente />;
}
```

- Use `export default function PageName() {}` for page components.
- Do NOT put layout, UI logic, or nested component trees in page files.
- Public pages go in `app/(unauth-routes)/`.
- Teacher pages go in `app/docente/`.
- Student pages go in `app/alumno/`.

## Modules (`/modules`)

Each page-level component lives in its own folder under `/modules`:

```
modules/
├── Docente/
│   ├── index.tsx          # Main module component (exported)
│   └── SalonCard.tsx      # Sub-component used only in Docente
├── Alumno/
│   ├── index.tsx
│   └── ClassroomCard.tsx
├── Home/
│   ├── index.tsx
│   ├── HeroSection.tsx
│   ├── FeaturesSection.tsx
│   └── CTASection.tsx
```

- `index.tsx` exports the main module component.
- Sub-components used **only** within this module live as sibling files in the same folder.
- If a sub-component is needed by multiple modules, move it to `/components`.
- Module components use arrow function pattern: `const ComponentName = () => (...); export default ComponentName;`
- Use braces only when the component needs hooks or logic.
- Component-specific constants can be defined in the same file as the component.

## Components (`/components`)

Shared, reusable components that are used across multiple modules or pages. Keep them generic and prop-driven.

Each component gets its own folder with an `index.tsx`:

```
components/
├── Card/index.tsx
├── CustomLink/index.tsx
├── Sidebar/index.tsx
```

## Hooks (`/hooks`)

When writing a function that contains **stateful or side-effect logic** (useState, useEffect, subscriptions), evaluate if it can be reused. If yes, extract it into a custom hook under `/hooks`.

```tsx
// hooks/useIsMobile.ts
import useBreakpoint from "./useBreakpoint";
import { SM } from "@/constants/breakpoints";

const useIsMobile = () => useBreakpoint(SM);

export default useIsMobile;
```

## Utils (`/utils`)

When writing a **pure function** with logic (no React state, no side effects), evaluate if it can be reused. If yes, extract it to `/utils`.

```tsx
// utils/string.ts
export const normalizeString = (str: string): string =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
```

## Constants (`/constants`)

Constants that may be reused across the codebase go under `/constants` in a descriptively named file. **All constants MUST use SCREAMING_SNAKE_CASE.**

```tsx
// constants/physicsDefaults.ts
export const PHYSICS_DEFAULTS = {
  ANGLE_MIN: 0,
  ANGLE_MAX: 90,
  VELOCITY_MIN: 1,
  VELOCITY_MAX: 100,
} as const;
```

- One file per logical group of constants (e.g., `salones.ts`, `navLinks.tsx`, `breakpoints.ts`).
- Constants scoped to a single module that are unlikely to be reused can stay in that module's folder.
- Export constants as named exports, not default exports.

## Models (`/models`)

TypeScript interfaces that represent **domain entities** from the backend or business logic.

```tsx
// models/users.ts
export type UserType = "docente" | "alumno" | "admin";
```

Use `/models` for entity shapes. Use `/types` for form schemas, config shapes, and other non-entity types.

## Queries (`/queries`)

One file per custom hook that wraps `useQuery` from `@tanstack/react-query`. Each file follows this structure:

1. **Imports** — react-query, `api` instance, types
2. **Exported API function** — the standalone fetch function (exported so consumers can call it directly)
3. **Exported response type** — only if it does not already exist in `models/` or `types/`. If it exists, import from there — do not duplicate.
4. **Exported query key** — if static, export a `SCREAMING_SNAKE_CASE` constant. If dynamic (depends on params), export a function that returns the key.
5. **Query function** — returns the query options object (`queryKey`, `queryFn`, etc.)
6. **Custom hook** — calls `useQuery` with the query function

Static query key example:

```tsx
// queries/useSalones.ts
import { useQuery } from "@tanstack/react-query";
import type { Salon } from "@/models/salon";
import { api } from "@/services/api";

export const SALONES_QUERY_KEY = ["salones"] as const;

export async function getSalones(): Promise<Salon[]> {
  const { data } = await api.get<Salon[]>("/salones");
  return data;
}

function salonesQuery() {
  return {
    queryKey: SALONES_QUERY_KEY,
    queryFn: getSalones,
  };
}

export function useSalones() {
  const { data: salones, ...rest } = useQuery(salonesQuery());
  return { salones, ...rest };
}
```

Dynamic query key example:

```tsx
// queries/useSalon.ts
import { useQuery } from "@tanstack/react-query";
import type { Salon } from "@/models/salon";
import { api } from "@/services/api";

export async function getSalon(id: string): Promise<Salon> {
  const { data } = await api.get<Salon>(`/salones/${id}`);
  return data;
}

export function salonQueryKey(id: string) {
  return ["salon", id] as const;
}

function salonQuery(id: string) {
  return {
    queryKey: salonQueryKey(id),
    queryFn: (): Promise<Salon> => getSalon(id),
    enabled: !!id,
  };
}

export function useSalon(id: string) {
  const { data: salon, ...rest } = useQuery(salonQuery(id));
  return { salon, ...rest };
}
```

## Mutations (`/mutations`)

One file per custom hook that wraps `useMutation` from `@tanstack/react-query`. Each file follows this structure:

1. **Imports** — react-query, `api` instance, types
2. **Exported API function** — the standalone mutation function (exported so consumers can call it directly)
3. **Exported response type** — only if it does not already exist in `models/` or `types/`. If it exists, import from there — do not duplicate.
4. **Custom hook** — calls `useMutation`, renames `mutateAsync` to a descriptive action name and `data` to a descriptive result name

Pass the API function directly to `mutationFn`. If the API function takes multiple arguments, use an inline arrow with a params interface to collapse them into a single argument — do NOT create a named wrapper function that just calls through.

Single-arg API function — pass directly:

```tsx
// mutations/useDeleteSalon.ts
import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/api";

export async function deleteSalon(id: string): Promise<void> {
  await api.delete(`/salones/${id}`);
}

export function useDeleteSalon() {
  const { mutateAsync: removeSalon, ...rest } = useMutation({ mutationFn: deleteSalon });
  return { removeSalon, ...rest };
}
```

Multi-arg API function — inline arrow with params interface:

```tsx
// mutations/useLogin.ts
import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/api";

export async function login(email: string, password: string): Promise<AuthToken> {
  const { data } = await api.post<AuthToken>("/auth/login", { email, password });
  return data;
}

interface LoginParams {
  email: string;
  password: string;
}

export function useLogin() {
  const { mutateAsync: loginUser, data: authToken, ...rest } = useMutation({
    mutationFn: (params: LoginParams) => login(params.email, params.password),
  });
  return { loginUser, authToken, ...rest };
}
```

## Styling Rules

- **amvasdev-ui** is the primary component library — always prefer it over raw elements.
- **DaisyUI** powers the theme system. Use semantic colors: `bg-base-100`, `bg-primary`, `text-primary-content`.
- **Never** use hardcoded color values — always use DaisyUI theme tokens.
- **Never** use `text-base-content` — it is the default text color.
- **Never** use `min-h-screen` or background gradients in modules — layouts handle this.
- Use **clsx** for combining multiple class names.
- Do NOT use the `ui:` prefix — DaisyUI is installed locally.
- Do NOT specify props with default values (e.g., omit `size="md"` on Button since it is the default).

## Import Organization

Imports must be sorted (ESLint enforces this). Order:

1. External libraries (npm): `amvasdev-ui`, `clsx`, `next/link`, `react`, etc.
2. Relative imports (`./` or `../`): `./SalonCard`, `../utils/helper`
3. Internal alias imports (`@/`): `@/components/...`, `@/constants/...`, etc.

All sorted A-Z within each group. No blank lines between groups. Relative imports MUST come before `@/` alias imports.

```tsx
import { Button } from "amvasdev-ui";
import clsx from "clsx";
import { useState } from "react";
import SalonCard from "./SalonCard";
import { SALONES } from "@/constants/salones";
```

## Decision Checklist

Before writing code, ask:

1. **Is this logic reusable?**
   - Stateful/side-effect logic → `/hooks`
   - Pure function logic → `/utils`
   - Constant value → `/constants` (if reusable) or module-local (if not)
2. **Is this component used by multiple modules?** → `/components`
3. **Is this component used only in one module?** → `/modules/<ModuleName>/ComponentName.tsx`
4. **Is this a page file?** → Only data fetching + render a single module component.
5. **Is this a domain entity type?** → `/models`
6. **Is this a form/config type?** → `/types`
7. **Does this fetch data?** → `/queries` with useQuery pattern
8. **Does this mutate data?** → `/mutations` with useMutation pattern
