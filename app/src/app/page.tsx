import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SupabaseTest } from "@/components/SupabaseTest";

export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-bold">Monday Morning Readout</h1>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">89%</p>
                <Button className="mt-4">View Details</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">12</p>
                <Button variant="outline" className="mt-4">
                  View All
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">8</p>
                <Button variant="secondary" className="mt-4">
                  Manage Team
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Detailed View</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Detailed statistics and metrics will be shown here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>Welcome</CardHeader>
          <CardContent>
            <p>This is your Monday Morning Readout dashboard.</p>
          </CardContent>
        </Card>
        <SupabaseTest />
      </div>
    </div>
  );
}
