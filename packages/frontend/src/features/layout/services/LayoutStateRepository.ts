import type { LayoutState } from "@sola_mpd/domain/src/models/layout_pb.js";

/**
 * Repository interface for layout state persistence.
 *
 * Features:
 * - Async state management
 * - Type-safe operations
 * - Error handling support
 * - Persistence abstraction
 *
 * Managed States:
 * - Pane dimensions
 * - Panel configurations
 * - View preferences
 * - UI component states
 *
 * Implementation Requirements:
 * - Async/await support
 * - Error boundary handling
 * - Data validation
 * - State versioning
 * - Atomic operations
 *
 * Best Practices:
 * - Handle storage failures gracefully
 * - Validate state integrity
 * - Provide fallback states
 * - Maintain backwards compatibility
 *
 * @example
 * ```typescript
 * class LocalStorageLayoutRepository implements LayoutStateRepository {
 *   async fetch(): Promise<LayoutState> {
 *     // Implementation
 *   }
 *   async save(state: LayoutState): Promise<void> {
 *     // Implementation
 *   }
 * }
 * ```
 */
export interface LayoutStateRepository {
	fetch: () => Promise<LayoutState>;
	save: (layoutState: LayoutState) => Promise<void>;
}
