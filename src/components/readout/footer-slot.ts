import { createContext } from "react";

/**
 * The footer's right-hand slot.
 *
 * The footer carries the keys, and which keys are worth showing depends on
 * where you are: the Layout knows the ones that move between states, the state
 * knows its own. The Layout puts the node here; `FooterActions` fills it.
 */
export const FooterSlotContext = createContext<HTMLElement | null>(null);
