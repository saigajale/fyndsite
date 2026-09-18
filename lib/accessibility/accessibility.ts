import { overpassAccessibilityProvider } from "./providers/overpass";
import type { AccessibilityProvider } from "./provider";

// Swap the active accessibility provider here later (e.g. a commercial
// transit/roads API) without touching any consuming route or component.
// Only one implementation exists today, so this stays a plain alias rather
// than the env-driven selection healthcare uses for its two providers.
export const accessibilityProvider: AccessibilityProvider = overpassAccessibilityProvider;
