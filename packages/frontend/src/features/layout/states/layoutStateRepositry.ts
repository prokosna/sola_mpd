import { atomWithDefault } from "jotai/utils";

import { LayoutStateRepository } from "../services/LayoutStateRepository";

/**
 * Repository provider atom for layout state management.
 *
 * Features:
 * - Dependency injection support
 * - Type-safe repository access
 * - Error handling
 * - Provider pattern integration
 *
 * Implementation:
 * - Uses atomWithDefault for lazy init
 * - Throws descriptive errors
 * - Enforces interface compliance
 * - Supports hot reloading
 *
 * Usage Pattern:
 * ```tsx
 * // Provider setup
 * const App = () => (
 *   <Provider>
 *     <LayoutProvider repository={new MyLayoutRepository()} />
 *     <AppContent />
 *   </Provider>
 * );
 *
 * // Component usage
 * const Component = () => {
 *   const repository = useAtomValue(layoutStateRepositoryAtom);
 *   // Use repository
 * };
 * ```
 *
 * Error Handling:
 * - Throws if accessed before init
 * - Provides clear error messages
 * - Supports error boundaries
 * - Debug-friendly errors
 */
export const layoutStateRepositoryAtom = atomWithDefault<LayoutStateRepository>(
  () => {
    throw new Error("Not initialized. Should be setup DI in the provider.");
  },
);
