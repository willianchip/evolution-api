## AI_RULES.md

### Tech Stack Overview

The application will be built using a modern, component-based architecture focused on performance and developer experience.

1.  **Primary Framework:** React (Functional Components and Hooks).
2.  **Language:** TypeScript (Strict mode enabled for maximum type safety).
3.  **Build Tool:** Vite (For fast development and optimized production builds).
4.  **Styling:** Tailwind CSS (Utility-first approach for rapid and consistent styling).
5.  **Routing:** React Router DOM (For client-side navigation).
6.  **Server State Management:** TanStack Query (React Query) (For server state management, caching, and synchronization).
7.  **Local State Management:** React's built-in hooks (`useState`, `useContext`, `useReducer`).
8.  **UI Components:** shadcn/ui (Pre-built, accessible components).
9.  **Icons:** lucide-react.
10. **Form Handling:** React Hook Form with Zod.

### Library Usage Rules

| Purpose | Required Library/Tool | Rules and Constraints |
| :--- | :--- | :--- |
| **UI Components** | shadcn/ui | Use pre-built components whenever possible. Create new components in `src/components/` if customization is needed. |
| **Styling** | Tailwind CSS | **Strictly use Tailwind CSS utility classes.** Do not use custom CSS files (`.css`, `.scss`), CSS-in-JS libraries, or inline styles unless absolutely necessary for dynamic values. |
| **Server State Management** | TanStack Query (React Query) | Must be used for all asynchronous data fetching, caching, mutation, and synchronization with the server. |
| **Client-Side Routing** | React Router DOM | Use for all navigation within the application. |
| **Form Handling & Validation** | React Hook Form + Zod | Use for managing complex forms and schema validation. |
| **Type Safety** | TypeScript | All components, hooks, utility functions, and API responses must be explicitly typed. |
| **Icons** | lucide-react | Use this library for all graphical icons. |
| **Toasts/Notifications** | sonner (for persistent/system toasts) & shadcn/ui toast (for transient alerts) | Use `sonner` for system-level notifications (e.g., connection status) and `useToast` (shadcn) for user feedback (e.g., form submission success). |

### General Development Rules

1.  **File Structure:** Put pages into `src/pages/` and components into `src/components/`.
2.  **Component Size:** Aim for components that are 100 lines of code or less. Create a new file for every new component or hook.
3.  **Supabase:** All data interaction must go through the Supabase client or Edge Functions.
4.  **Performance:** Use `React.memo`, `useCallback`, and `useMemo` judiciously to prevent unnecessary re-renders.