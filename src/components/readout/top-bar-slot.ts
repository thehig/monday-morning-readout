import { createContext } from "react";

/**
 * The navy bar's right-hand slot.
 *
 * A state's view switcher belongs to the state - the Wall knows it has two
 * layouts, the Dates two views - but it reads as chrome, so it sits in
 * the bar with the week rather than in a second strip below it. The Layout
 * puts the node here; `TopBarActions` renders into it.
 */
export const TopBarSlotContext = createContext<HTMLElement | null>(null);
