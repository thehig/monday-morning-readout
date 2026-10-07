import type { Engagement } from "./engagements";

/**
 * The things worth saying out loud before the Plan is closed.
 *
 * The header counts these already - "1 committed nothing", "5 past or
 * overrunning" - but a count in a strip is read once and forgotten, and the
 * engagement behind it is somewhere in a column of fifteen. This names them,
 * so the call ends on the exceptions rather than on whichever owner happens
 * to sit in the last column.
 */

export interface OwnerLoad {
  owner: string;
  ownerKey: string;
  commitments: number;
  engagements: number;
}

export interface PlanExceptions {
  /** Filed a report, committed to nothing. Worst schedule first. */
  silent: Engagement[];
  /** Whoever is carrying the most of next week, when it is not even. */
  heaviest: OwnerLoad | null;
  /** Whoever owns the most engagements that will not make their date. */
  mostBehind: OwnerLoad | null;
  /** False when the week has nothing to answer for and the band can go. */
  any: boolean;
}

/** Past the deadline, or on an estimate that lands after it. */
function behind(engagement: Engagement): boolean {
  return engagement.state === "late" || (engagement.slipDays ?? 0) > 0;
}

function tally(
  engagements: Engagement[],
  count: (engagement: Engagement) => number
): OwnerLoad[] {
  const byOwner = new Map<string, OwnerLoad>();

  for (const engagement of engagements) {
    const load = byOwner.get(engagement.ownerKey) ?? {
      owner: engagement.owner,
      ownerKey: engagement.ownerKey,
      commitments: 0,
      engagements: 0,
    };

    const n = count(engagement);
    if (n > 0) {
      load.commitments += n;
      load.engagements += 1;
    }
    byOwner.set(engagement.ownerKey, load);
  }

  return [...byOwner.values()]
    .filter((load) => load.commitments > 0)
    .sort((a, b) => b.commitments - a.commitments || b.engagements - a.engagements);
}

/**
 * A leader only counts when there is something to lead by. With everyone on
 * one or two, naming a "heaviest" owner invents a problem.
 */
function leader(loads: OwnerLoad[]): OwnerLoad | null {
  const [first, second] = loads;
  if (!first || first.commitments < 2) return null;
  if (second && second.commitments === first.commitments) return null;
  return first;
}

export function planExceptions(engagements: Engagement[]): PlanExceptions {
  const silent = engagements
    .filter((engagement) => engagement.commitments.length === 0)
    .sort((a, b) => (b.slipDays ?? -Infinity) - (a.slipDays ?? -Infinity));

  const heaviest = leader(tally(engagements, (e) => e.commitments.length));
  const mostBehind = leader(tally(engagements, (e) => (behind(e) ? 1 : 0)));

  return {
    silent,
    heaviest,
    mostBehind,
    any: silent.length > 0 || heaviest !== null || mostBehind !== null,
  };
}
