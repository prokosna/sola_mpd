# Chakra UI to Mantine UI Migration Plan

## 1. Goal

Incrementally migrate the frontend application from Chakra UI v2 to Mantine UI v8, ensuring the application remains fully functional throughout the transition.

## 2. Core Strategies

### 2.1. Library Coexistence
- **MantineProvider Wraps ChakraProvider**: Mantine and Chakra UI will coexist. The `MantineProvider` will wrap the `ChakraProvider` to ensure both theming systems work in harmony.
- **Incremental Removal**: Chakra UI dependencies will only be removed after all components and pages have been fully migrated.

### 2.2. Styling and Theme Migration
- **Parallel Themes**: The existing Chakra UI theme (`theme.ts`) will be preserved. A new Mantine theme (`mantine.theme.ts`) will be created to replicate the application's design tokens (colors, fonts, etc.).
- **Global Styles**: Chakra's global CSS and custom classes (`.layout-border-all`, etc.) will be phased out and replaced with Mantine's styling solutions (e.g., style props, `createStyles`) as components are migrated.

### 2.3. Page-by-Page Migration
- **Atomic Page Migration**: The migration will proceed on a page-by-page basis. Each page will be fully converted to Mantine UI before moving to the next, ensuring each step results in a stable, testable state.
- **Defined Order**: Migration will start with simpler pages and proceed to more complex ones.

### 2.4. Shared Layout: The "Hybrid" Strategy
- **Parallel Layouts**: A new `MantineHomeLayout.tsx` will be created alongside the existing Chakra-based `HomeLayout.tsx`.
- **Router-Based Switching**: The application router will be configured to switch between the two layouts. This allows migrated pages to be tested within the new Mantine shell (e.g., via `/mantine/browse`) without affecting the production-ready Chakra-based pages.

## 3. Phase 1: Setup & Configuration

**Owner**: USER
**Reviewer**: Cascade

**Description**: The USER, having deeper knowledge of the monorepo structure, will perform the initial setup. Cascade will review the changes to ensure they align with the migration plan.

-   [ ] **Package Installation**: Add `@mantine/core`, `@mantine/hooks`, `@mantine/notifications`, and other necessary packages.
-   [ ] **PostCSS Configuration**: Ensure PostCSS is set up with `postcss-preset-mantine`.
-   [ ] **Theme Creation**: Create `packages/frontend/src/mantine.theme.ts`.
-   [ ] **Provider Setup**: In the application's entry point, wrap the `ChakraProvider` with the `MantineProvider` and apply the new theme.

## 4. Phase 2: Layout & Pilot Migration
**Core Requirement**: The migration must be incremental and verifiable without breaking the existing, fully functional application.

**Analysis**: The main layout is defined in `HomeLayout.tsx` using Chakra UI's `Grid`, `GridItem`, and `useDisclosure` hook. It is deeply integrated with the application's structure.

**Chosen Strategy: Hybrid Layout**

This approach offers maximum safety and aligns with the core requirement.

1.  **Create Parallel Layout**: A new `MantineHomeLayout.tsx` will be created as a parallel version of the existing `HomeLayout.tsx`. This new layout will be built entirely with Mantine components (e.g., `AppShell`).

2.  **Router-Based Switching**: The application's router will be configured to serve different layouts based on the URL. This allows for a clear separation between migrated and non-migrated parts of the app.
    -   **Example**: A temporary route like `/mantine/browse` will render the `Browser` page within the new `MantineHomeLayout`.
    -   The existing `/browse` route will continue to render the `Browser` page within the old Chakra-based `HomeLayout`.

3.  **Incremental Rollout**: Once a page and its layout are fully migrated and tested under the `/mantine/*` route, the original route (`/browse`) will be switched to use the `MantineHomeLayout`. This process will be repeated for each page.

## 6. Phase 5: Hooks and External Library Integration

- **`useNotification` Hook**: This custom hook wraps Chakra's `useToast`. It will be migrated by creating a new hook that uses the `@mantine/notifications` package. The replacement will happen as each page using notifications is migrated.
- **`useAgGridTheme` Hook**: This hook uses Chakra's `useColorMode` to switch AG Grid's theme. It will be updated to use Mantine's `useMantineColorScheme` hook during the migration of pages that contain AG Grid tables.
- **Icons**: The project does not use `@chakra-ui/icons`. Icons are likely handled by a third-party library (e.g., `react-icons`) via Chakra's generic `<Icon>` component. This simplifies migration, as we can use the same library with Mantine's equivalent component.

## 5. Phase 4: Pilot Migration

- Select a simple, low-impact component that uses some of the global styles to test the migration strategy.
- Replace the component and its styling.
- Verify functionality and visual consistency in both light and dark modes.

## 5. Phase 4: Full-Scale Migration (Page-by-Page Approach)

**Core Strategy:** Migration will be performed on a **page-by-page** basis, not component-by-component. A single page (e.g., the "Browser" page) and all its child components will be fully migrated to Mantine UI, ensuring it is fully functional and visually consistent before moving to the next page.

**Migration Order (Tentative):**
1.  **Settings/Profile Page:** A simple page with basic forms to start.
2.  **Browser Page (`/browse`):** A more complex page involving navigation, content display, and context menus.
3.  **Search Page (`/search`):** Similar complexity to the Browser page.
4.  **Player Components:** The global player is complex and used everywhere, so it should be migrated carefully.
5.  **Remaining Pages & Modals.**

## 6. Phase 5: Cleanup

- Once all components are migrated, remove the Chakra UI packages (`@chakra-ui/react`, etc.).
- Delete the old `theme.ts` file and the now-unused global CSS class definitions.
- Remove the `ChakraProvider` from `providers.tsx`.
