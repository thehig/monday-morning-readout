import React from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { formatTime, formatDate } from "../../../lib/date-utils";
import { TechnicalDetailsProps } from "../../../types/components";

/**
 * Displays technical metadata about a feedback submission
 */
export const TechnicalDetails: React.FC<TechnicalDetailsProps> = ({
  id,
  week,
  submissionDate,
  createdAt,
  submittedBy,
  relativeTime,
  allSubmissionDates,
  isAggregated,
  allIds,
}) => {
  return (
    <div className="mt-8 pt-6 border-t border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-500">Technical Details</h2>
        <div className="text-xs text-gray-400">System Information</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div className="space-y-1">
          <div className="text-xs text-gray-400">
            Feedback ID{isAggregated && allIds && allIds.length > 1 ? "s" : ""}
          </div>
          {isAggregated && allIds ? (
            <div className="font-mono text-gray-600 space-y-1">
              {allIds.map((feedbackId, index) => (
                <div key={feedbackId}>
                  {feedbackId} {index === 0 && "(Latest)"}
                </div>
              ))}
            </div>
          ) : (
            <div className="font-mono text-gray-600">{id}</div>
          )}
        </div>

        <div className="space-y-1">
          <div className="text-xs text-gray-400">Calendar Week</div>
          <div className="font-mono text-gray-600">{week}</div>
        </div>

        {isAggregated && allSubmissionDates ? (
          <div className="space-y-1">
            <div className="text-xs text-gray-400">Submission Dates</div>
            <div className="font-mono text-gray-600 space-y-1">
              {allSubmissionDates.map((date, index) => (
                <div key={date}>
                  {formatDate(new Date(date), "isoDate")}{" "}
                  {index === 0 && "(Latest)"}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <div className="text-xs text-gray-400">Submission Time</div>
              <div className="font-mono text-gray-600">
                {formatTime(submissionDate, true)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-gray-400">Submission Date</div>
              <div className="font-mono text-gray-600">
                {formatDate(submissionDate, "isoDate")}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-gray-400">Raw Timestamp</div>
              <div className="font-mono text-gray-600">{createdAt}</div>
            </div>
          </>
        )}

        <div className="space-y-1">
          <div className="text-xs text-gray-400">Submitter Email</div>
          <div className="font-mono text-gray-600 truncate" title={submittedBy}>
            {submittedBy}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
        <InformationCircleIcon className="w-4 h-4" />
        <span>Last updated: {relativeTime}</span>
      </div>
    </div>
  );
};
