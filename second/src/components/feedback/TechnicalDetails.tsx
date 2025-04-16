import { formatTime, formatDate } from "@/lib/date-utils";

interface TechnicalDetailsProps {
  /** The feedback ID */
  id: number;
  /** The calendar week number */
  week: number;
  /** The submission date */
  submissionDate: Date;
  /** The raw timestamp string */
  createdAt: string;
  /** The submitter's email */
  submittedBy: string;
  /** Relative time string (e.g. "2 days ago") */
  relativeTime: string;
}

/**
 * Displays technical metadata about a feedback submission
 */
export function TechnicalDetails({
  id,
  week,
  submissionDate,
  createdAt,
  submittedBy,
  relativeTime,
}: TechnicalDetailsProps) {
  return (
    <div className="mt-8 pt-6 border-t border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-500">Technical Details</h2>
        <div className="text-xs text-gray-400">System Information</div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div className="space-y-1">
          <div className="text-xs text-gray-400">Feedback ID</div>
          <div className="font-mono text-gray-600">{id}</div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-gray-400">Calendar Week</div>
          <div className="font-mono text-gray-600">{week}</div>
        </div>
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
        <div className="space-y-1">
          <div className="text-xs text-gray-400">Submitter Email</div>
          <div className="font-mono text-gray-600 truncate" title={submittedBy}>
            {submittedBy}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Last updated: {relativeTime}</span>
      </div>
    </div>
  );
}
