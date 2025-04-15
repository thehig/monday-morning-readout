import { FeedbackContent } from "./feedback-content";

// This needs to be a server component to use generateStaticParams
export async function generateStaticParams() {
  // Pre-generate a reasonable range of IDs
  return Array.from({ length: 1000 }, (_, i) => ({
    id: (i + 1).toString(),
  }));
}

export default function FeedbackPage() {
  return <FeedbackContent />;
}
