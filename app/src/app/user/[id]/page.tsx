import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface UserPageProps {
  params: {
    id: string;
  };
}

export default function UserPage({ params }: UserPageProps) {
  // For now, we'll just show a placeholder
  // Later this will fetch user-specific data
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">User Details</h2>
      </div>
      <Card>
        <CardHeader>User ID: {params.id}</CardHeader>
        <CardContent>
          <p>Detailed user statistics will be shown here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
