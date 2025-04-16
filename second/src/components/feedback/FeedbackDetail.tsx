import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { usePOFeedbackById } from "../../hooks/use-po-feedback";
import { Button } from "../ui/button";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { VelocityIndicator } from "../indicators";

export function FeedbackDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const week = searchParams.get("week");

  const { data: feedback, isLoading } = usePOFeedbackById(id ? id : undefined);

  const handleBack = () => {
    navigate(week ? `/?week=${week}` : "/");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">Loading feedback...</div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-gray-600">Feedback not found</div>
        <Button onClick={handleBack} variant="outline">
          <ChevronLeftIcon className="w-4 h-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Button onClick={handleBack} variant="outline">
          <ChevronLeftIcon className="w-4 h-4" />
          Back to List
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">{feedback.submitted_by}</h2>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Progress</h3>
              <p className="text-2xl font-bold">{feedback.progress_percent}%</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Team Happiness</h3>
              <p className="text-2xl font-bold">{feedback.team_happiness}/10</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Customer Happiness</h3>
              <p className="text-2xl font-bold">
                {feedback.customer_happiness}/10
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Velocity Next Week</h3>
              <p className="text-2xl font-bold">
                {feedback.velocity_next_week}
              </p>
            </div>
          </div>
          {feedback.milestones_done && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Milestones Done</h3>
              <p className="whitespace-pre-wrap">{feedback.milestones_done}</p>
            </div>
          )}
          {feedback.goals_next_week && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Goals Next Week</h3>
              <p className="whitespace-pre-wrap">{feedback.goals_next_week}</p>
            </div>
          )}
          {feedback.risks && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Risks</h3>
              <p className="whitespace-pre-wrap">{feedback.risks}</p>
            </div>
          )}
          {feedback.ps_call_status && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">PS Call Status</h3>
              <p className="whitespace-pre-wrap">{feedback.ps_call_status}</p>
            </div>
          )}
          {/* Velocity Prediction */}
          {feedback.velocity_next_week && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Next Week's Velocity Prediction
              </h2>
              <div className="p-4 bg-gray-50 rounded-lg">
                <VelocityIndicator
                  velocity={feedback.velocity_next_week}
                  showLabel
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
