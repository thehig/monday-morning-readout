import {
  flattenCommitments,
  scheduleNote,
  toEngagements,
  groupByOwner,
} from "./engagements";
import type { POFeedback } from "../types/feedback";

const TODAY = new Date(2026, 9, 7);

function row(over: Partial<POFeedback> = {}): POFeedback {
  return {
    id: 1,
    created_at: "2026-10-02T14:42:39Z",
    submitted_by: "adwait.sompura@united-signals.com",
    progress_percent: 5,
    team_happiness: 4,
    customer_happiness: 4,
    velocity_next_week: "Grün",
    customer: "Suissebank",
    ...over,
  } as POFeedback;
}

describe("the Plan's data", () => {
  describe("flattenCommitments", () => {
    it("numbers every promise in the week, worst schedule first", () => {
      const engagements = toEngagements(
        [
          row({
            id: 1,
            customer: "FLOWNIQ",
            target_date: "2026-11-05",
            estimated_completion_date: "2026-11-05",
            goals_next_week: "- Continue cycle\n- Bugfixes",
          }),
          row({
            id: 2,
            customer: "FIDUS Finanz AG",
            target_date: "2026-05-31",
            estimated_completion_date: "2026-10-23",
            goals_next_week: "1. Finalise V-Bank and UBS connections",
          }),
        ],
        TODAY
      );

      const commitments = flattenCommitments(engagements);

      expect(commitments.map((c) => c.index)).toEqual([1, 2, 3]);
      // FIDUS is 145 days past its deadline, so its promise leads
      expect(commitments[0].engagement.customer).toBe("FIDUS Finanz AG");
      expect(commitments[0].text).toBe("Finalise V-Bank and UBS connections");
      expect(commitments[1].engagement.customer).toBe("FLOWNIQ");
    });

    it("contributes nothing for an engagement that promised nothing", () => {
      const engagements = toEngagements(
        [row({ id: 1, customer: "Test API", goals_next_week: "-" })],
        TODAY
      );

      expect(flattenCommitments(engagements)).toEqual([]);
    });

    it("is empty for an empty week", () => {
      expect(flattenCommitments([])).toEqual([]);
    });
  });

  describe("scheduleNote", () => {
    const note = (over: Partial<POFeedback>) =>
      scheduleNote(toEngagements([row(over)], TODAY)[0]);

    it("counts the days past a deadline that has gone", () => {
      expect(
        note({
          target_date: "2026-05-31",
          estimated_completion_date: "2026-10-23",
        })
      ).toBe("145 days past deadline");
    });

    it("describes an overrun whose deadline is still ahead", () => {
      expect(
        note({
          target_date: "2026-11-30",
          estimated_completion_date: "2026-12-15",
        })
      ).toBe("estimate overruns by 15 days");
    });

    it("gives the date when nothing has slipped", () => {
      expect(
        note({
          target_date: "2026-11-06",
          estimated_completion_date: "2026-11-06",
        })
      ).toBe("due Nov 6, 2026");
    });

    it("says so when no deadline was recorded", () => {
      expect(note({})).toBe("no deadline recorded");
    });
  });

  describe("groupByOwner for the plan", () => {
    it("counts each owner's engagements and promises", () => {
      const groups = groupByOwner(
        toEngagements(
          [
            row({
              id: 1,
              customer: "Volksbank Kraichgau",
              submitted_by: "david.siegel+vbk@united-signals.com",
              goals_next_week: "- API analysis\n- Check Agree\n- Show the flow",
            }),
            row({
              id: 2,
              customer: "PROAKTIVA VV",
              submitted_by: "david.siegel+pa@united-signals.com",
              goals_next_week: "- Work in the feedback",
            }),
          ],
          TODAY
        )
      );

      // plus-addressing is a per-engagement tag, not a different person
      expect(groups).toHaveLength(1);
      expect(groups[0].owner).toBe("David Siegel");
      expect(groups[0].engagements).toHaveLength(2);
      expect(groups[0].commitments).toBe(4);
    });
  });
});
