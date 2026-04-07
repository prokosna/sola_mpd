import { useSetAtom } from "jotai";

import { togglePauseActionAtom } from "../../player/states/actions/togglePauseActionAtom";

import { useInputKeyCombination } from "./useInputKeyCombination";

/**
 * Global keyboard shortcut handler for media control.
 *
 * Features:
 * - Media playback control
 * - Context-aware actions
 * - Input element safety
 * - MPD command integration
 *
 * Supported Shortcuts:
 * - Space: Toggle playback
 *   - Stop → Play
 *   - Play → Pause
 *   - Pause → Play
 *
 * Implementation:
 * - Uses useInputKeyCombination for key handling
 * - Checks input element focus state
 * - Manages MPD client commands
 * - Handles connection state
 *
 * Safety Features:
 * - Ignores shortcuts when inputs focused
 * - Validates MPD client state
 * - Checks profile availability
 * - Handles all playback states
 *
 * Dependencies:
 * - MPD client connection
 * - Current MPD profile
 * - Player status state
 * - Input combination hook
 */
export function useGlobalKeyShortcuts(): void {
	const togglePause = useSetAtom(togglePauseActionAtom);

	useInputKeyCombination(undefined, [" "], () => {
		togglePause();
	});
}
