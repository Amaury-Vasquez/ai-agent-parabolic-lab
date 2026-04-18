# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ParabolicLab is a Next.js application designed to support learning about parabolic motion physics ("tiro parabólico"). This is an educational platform for teachers (docentes) and students to work with physics scenarios and track progress.

## CRITICAL ENCODING RULE

**NEVER use the replacement character � (U+FFFD) in any code or text.**
- Always use proper UTF-8 encoding for Spanish characters: á, é, í, ó, ú, ñ, ü
- Common words: salón, código, información, descripción, etc.
- If you see � in any file, it MUST be fixed immediately with the correct accented character
- Examples:
  - ✅ CORRECT: "salón", "código", "Pídele"
  - ❌ FORBIDDEN: "sal�n", "c�digo", "P�dele"

## Key Commands

```bash
# Development
npm run dev          # Start dev server with Turbopack
npm run build        # Build for production with Turbopack
npm start            # Start production server
npm run lint         # Run ESLint
```

## Architecture

### Route Groups & Layouts

The application uses Next.js 16 App Router with **route groups** to separate authenticated and unauthenticated routes:

- **`(unauth-routes)/`** - Public routes that use `MainLayout`
  - Simple fixed navbar with hamburger button and app name
  - Used for landing pages, registration, etc.

- **`(withauth-routes)/`** - Protected routes that use `AuthenticatedLayout`
  - Sidebar navigation menu for teacher dashboard
  - Contains `/docente/*` routes for teacher functionality

**Important**: Route groups use parentheses and don't affect the URL structure. Both groups inherit from the root `layout.tsx`.

### Layout System

Two main layouts in `src/layouts/`:

1. **`MainLayout.tsx`** - Unauthenticated pages
   - Fixed navbar with `bg-base-200`
   - Centered "ParabolicLab" branding
   - Left-aligned hamburger button
   - Uses `position: fixed` with `pt-16` content padding

2. **`AuthenticatedLayout.tsx`** - Authenticated pages
   - Left sidebar (`w-56`) with navigation menu
   - Uses DaisyUI menu component with route array and `.map()`
   - Dynamic active state using `usePathname()`
   - Main content area with `bg-base-100`

### Styling Approach

- **amvasdev-ui** is the primary component library - always use amvasdev-ui components instead of direct DaisyUI classes
- **DaisyUI** powers the underlying theme system
- **Tailwind CSS 4** for utility classes
- Theme is set in root layout: `data-theme="winter"`
- Color palette uses DaisyUI semantic colors: `bg-base-100`, `bg-base-200`, `bg-base-300`, `bg-primary`, `text-primary-content`
- Never use hardcoded color values - always use DaisyUI theme colors
- **NEVER use `text-base-content`** - This is the default text color and doesn't need to be specified
- **NEVER use `min-h-screen` or background gradients in modules** - Layouts already handle height and background styling
- For component usage reference, see `docs/COMPONENT_USAGE_GUIDE.md`

### Path Aliases

TypeScript is configured with path alias `@/*` pointing to `src/*`:
```tsx
import MainLayout from "@/layouts/MainLayout";
import Component from "@/components/Component";
```

### Custom Components

**`CustomLink`** - Located at `src/components/CustomLink/index.tsx`
- Use this component when you need a Next.js Link that looks like a button
- Combines Next.js Link functionality with DaisyUI button styling
- Uses the `getButtonClasses()` utility from amvasdev-ui
- Supports all button variants, sizes, and outlined styles

```tsx
import CustomLink from "@/components/CustomLink";

// Basic usage
<CustomLink href="/dashboard">Go to Dashboard</CustomLink>

// With button styling
<CustomLink href="/about" variant="primary" size="lg">
  Learn More
</CustomLink>

// Ghost variant (common for navbar links)
<CustomLink href="/" variant="ghost">
  ParabolicLab
</CustomLink>
```

## Development Patterns

### Input Placeholders:
- **Always use examples instead of instructions** in input placeholders
- Show what the user should enter, not how to enter it
- Examples:
  - ✅ Good: `placeholder="Juan"` (for name field)
  - ✅ Good: `placeholder="cmartinez@ejemplo.com"` (for email)
  - ✅ Good: `placeholder="07738"` (for postal code)
  - ✅ Good: `placeholder="••••••••"` (for password)
  - ✅ Good: `placeholder="Maestría en Física"` (for academic degree)
  - ❌ Bad: `placeholder="Ingresa tu nombre"`
  - ❌ Bad: `placeholder="correo@ejemplo.com"` (unless specifically for institutional emails)
  - ❌ Bad: `placeholder="Crea una contraseña segura"`

### Constants Naming Convention:
- **All constants MUST be defined in UPPERCASE with underscores** (SCREAMING_SNAKE_CASE)
- Constants should be placed in `src/constants/` directory
- Export constants as named exports, not default exports
- Example:
```tsx
// src/constants/navLinks.tsx
export const MAIN_NAV_LINKS: NavLink[] = [
  { label: "Inicio", href: "/" },
  { label: "Contacto", href: "/contact" },
];

export const TEACHER_NAV_LINKS: NavLink[] = [
  { href: "/docente", label: "Mis Salones" },
];

// Usage in components
import { MAIN_NAV_LINKS } from "@/constants/navLinks";
```

### Import Organization:
- **Always keep imports sorted** - ESLint will enforce this automatically
- Import order (all sorted A-Z within each group):
  1. External libraries (npm packages): `amvasdev-ui`, `clsx`, `next/link`, `react`, etc.
  2. Relative imports (`./ or ../`): `./ComponentName`, `../utils/helper`
  3. Internal project files (using `@/` alias): `@/components/...`, `@/layouts/...`, etc.
- No blank lines between import groups
- **Relative imports MUST come before `@/` alias imports**
- Example:
```tsx
import clsx from "clsx";
import { ButtonVariant, ButtonSize, getButtonClasses } from "amvasdev-ui";
import Link from "next/link";
import { ReactNode } from "react";
import SalonCard from "./SalonCard";
import CustomComponent from "@/components/CustomComponent";
import { helperFunction } from "@/utils/helpers";
```

### Component Export Pattern:
- **Page components** (in `src/app/**/page.tsx`): Use `export default function PageName() {}`
- **All other components** (modules, UI components, sections): Use arrow functions with const
  ```tsx
  // ✅ Correct - Page component
  // src/app/docente/page.tsx
  export default function DocentePage() {
    return <Docente />;
  }

  // ✅ Correct - Module/Component (avoid braces when possible)
  // src/modules/Home/HeroSection.tsx
  const HeroSection = () => (
    <section>
      <h1>Hero Content</h1>
    </section>
  );

  export default HeroSection;

  // ✅ Use braces only when needed (hooks, logic, etc.)
  const ComplexComponent = () => {
    const [state, setState] = useState();

    return <div>{state}</div>;
  };

  export default ComplexComponent;
  ```

### Conditional Rendering:
- **Prefer ternary operators over logical AND (`&&`)** for conditional rendering
- Always provide explicit `null` in the else branch
- This prevents rendering `0` or `false` as text when conditions fail
  ```tsx
  // ✅ Correct - Ternary with explicit null
  {showComponent ? <Component /> : null}

  // ✅ Correct - Multiple conditions
  {condition1 && condition2 ? <Component /> : null}

  // ❌ Avoid - Logical AND can render 0 or false
  {count && <Component />}  // renders "0" when count is 0
  {showComponent && <Component />}  // might render "false"
  ```

### When creating navigation or lists:
- Define items in an array/object outside JSX
- Use `.map()` to render repeated elements
- Avoid duplicating values in multiple places (e.g., use `route.href` once for both `href` and comparison)

### When using amvasdev-ui components:
- **Always import from amvasdev-ui**: `import { Button, Input } from "amvasdev-ui"`
- Use `Button` component instead of `<button className="btn">`
- Use `Input` component instead of `<input className="input">`
- For links styled as buttons, use the `CustomLink` component
- Refer to `docs/COMPONENT_USAGE_GUIDE.md` for complete component API
- Use semantic variant props: `variant="primary"`, `variant="ghost"`, etc.
- Use size props: `size="xs"`, `size="sm"`, `size="md"`, `size="lg"`
- **Do NOT use the `ui:` prefix** - DaisyUI is installed locally, so classes don't need prefixing
- **Always use `clsx`** for combining multiple class names: `clsx(baseClasses, conditionalClass, className)`
- **NEVER specify props with default values** - Omit props that match component defaults (e.g., don't use `size="md"` on Button since `md` is already the default)

### Route Organization:
- Public pages go in `src/app/(unauth-routes)/`
- Teacher/admin pages go in `src/app/(withauth-routes)/docente/`
- Each route group has its own `layout.tsx` that applies the appropriate wrapper layout

### Module Pattern for Pages:
Each page should have its content defined in a separate module in `src/modules/` to keep the page files clean and handle SSR data fetching.

**Naming Convention:**
- Module directory name matches the route segment (e.g., `Docente/` for `/docente` route)
- Page file exports a descriptive function name (e.g., `DocentePage`) using `export default async function`
- Module components use arrow function pattern: `const ComponentName = () => (...);`
- Subcomponents are extracted to separate files within the module directory
- Component-specific constants can be defined in the same file as the component

**Structure:**
```
src/
├── app/
│   └── docente/
│       └── page.tsx          # Server component — SSR prefetch + HydrationBoundary
├── modules/
│   └── Docente/              # Module named after route
│       ├── index.tsx         # "use client" — uses useQuery (picks up hydrated data)
│       ├── SalonCard.tsx     # Subcomponents
│       └── HeroSection.tsx   # Section components (with their own constants)
├── fetchers/
│   └── salones.ts            # Server-safe: query key + fetch function
├── queries/
│   └── useMySalones.ts       # "use client": useQuery hook (imports from fetchers/)
└── constants/
    └── salones.ts            # Shared data constants (SCREAMING_SNAKE_CASE)
```

**Example:**
```tsx
// src/app/docente/page.tsx (server component — handles SSR prefetch)
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import Docente from "@/modules/Docente";
import { fetchMySalones, MY_SALONES_QUERY_KEY } from "@/fetchers/salones";

export default async function DocentePage() {
  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    await queryClient.prefetchQuery({
      queryKey: MY_SALONES_QUERY_KEY,
      queryFn: () => fetchMySalones(token),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Docente />
    </HydrationBoundary>
  );
}

// src/modules/Docente/index.tsx ("use client" — useQuery picks up hydrated data)
"use client";
import SalonCard from "./SalonCard";
import { useMySalones } from "@/queries/useMySalones";

const Docente = () => {
  const { data: salones } = useMySalones();

  return (
    <div>
      {salones?.map((salon) => (
        <SalonCard key={salon.idsalon} salon={salon} />
      ))}
    </div>
  );
};

export default Docente;
```

**Benefits:**
- SSR prefetch eliminates hydration mismatches — server and client render the same data
- Organizes related components together
- Makes components reusable and testable
- Separates data/constants from presentation logic

### SSR Data Fetching with React Query:
**All data fetching queries MUST be prefetched server-side in `page.tsx`** to avoid hydration mismatches. Never rely solely on client-side `useQuery` for initial data — the server renders one state (empty/loading) while the client renders another, causing React hydration errors.

**Pattern:** Use TanStack Query's Hydration API — `prefetchQuery` + `dehydrate` + `HydrationBoundary` in the server component (`page.tsx`), and the client module's `useQuery` automatically picks up the prefetched data.

**File convention — split server-safe fetchers from client hooks:**

`"use client"` makes an entire module a client boundary, so server components cannot import from it. Query keys and fetch functions must live in `src/fetchers/`, separate from the `useQuery` hooks in `src/queries/`.

- **`src/fetchers/<resource>.ts`** (no `"use client"`) — query key constant (SCREAMING_SNAKE_CASE) + fetch function. Importable by both server and client code.
- **`src/queries/use<Resource>.ts`** (`"use client"`) — the `useQuery` hook. Imports from the fetcher file.

```tsx
// src/fetchers/salones.ts (server-safe — no "use client")
import { get } from "@/services/api";
import { Salon } from "@/types/salon";

export const MY_SALONES_QUERY_KEY = ["salones", "me"];

export async function fetchMySalones(token: string): Promise<Salon[]> {
  return get<Salon[]>("/salones/me", {
    "x-stack-access-token": token,
  });
}

// src/queries/useMySalones.ts ("use client" — hook only)
"use client";
import { useQuery } from "@tanstack/react-query";
import { useCookies } from "react-cookie";
import { fetchMySalones, MY_SALONES_QUERY_KEY } from "@/fetchers/salones";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";

export function useMySalones() {
  const [cookies] = useCookies([ACCESS_TOKEN_COOKIE]);
  const token = cookies[ACCESS_TOKEN_COOKIE];

  return useQuery({
    queryKey: MY_SALONES_QUERY_KEY,
    queryFn: () => fetchMySalones(token),
    enabled: !!token,
  });
}
```

**Page file (`page.tsx`) — server-side prefetch:**
```tsx
// src/app/docente/page.tsx (server component — imports from fetcher)
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/constants/auth";
import Docente from "@/modules/Docente";
import { fetchMySalones, MY_SALONES_QUERY_KEY } from "@/fetchers/salones";

export default async function DocentePage() {
  const queryClient = new QueryClient();
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (token) {
    await queryClient.prefetchQuery({
      queryKey: MY_SALONES_QUERY_KEY,
      queryFn: () => fetchMySalones(token),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Docente />
    </HydrationBoundary>
  );
}
```

**Key rules:**
- `page.tsx` is always a **server component** (no `"use client"`) — this is where SSR prefetching happens
- **Never import from a `"use client"` file in a server component** — query keys and fetch functions go in `src/fetchers/`
- Use `cookies()` from `next/headers` to access auth tokens server-side
- The module component keeps its `useQuery` hook unchanged — `HydrationBoundary` hydrates the cache automatically
- **Never fetch data only on the client** (`useQuery` without server prefetch) for data that renders on initial page load
