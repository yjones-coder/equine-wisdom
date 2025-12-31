import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Plus, Warehouse, MapPin, ChevronRight } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Stables() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { data: stables, isLoading } = trpc.stables.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="container py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Warehouse className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Your Virtual Stables</h1>
          <p className="text-muted-foreground mb-8">
            Sign in to create and manage your virtual stables, add horses, and track their care.
          </p>
          <Button asChild size="lg">
            <a href={getLoginUrl()}>Sign In to Continue</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Stables</h1>
          <p className="text-muted-foreground mt-1">
            Manage your virtual stables and horses
          </p>
        </div>
        <Button asChild>
          <Link href="/stables/new">
            <Plus className="w-4 h-4 mr-2" />
            New Stable
          </Link>
        </Button>
      </div>

      {/* Stables Grid */}
      {isLoading || authLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stables && stables.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stables.map((stable) => (
            <Link key={stable.id} href={`/stables/${stable.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Warehouse className="w-6 h-6 text-primary" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="mt-4">{stable.name}</CardTitle>
                  {stable.location && (
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {stable.location}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {stable.horseCount} horse{stable.horseCount !== 1 ? 's' : ''}
                    </span>
                    <span className="text-muted-foreground">
                      Capacity: {stable.capacity || 10}
                    </span>
                  </div>
                  {stable.description && (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {stable.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
          
          {/* Add New Stable Card */}
          <Link href="/stables/new">
            <Card className="h-full border-dashed hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px]">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Plus className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="font-medium">Add New Stable</p>
                <p className="text-sm text-muted-foreground">Create another virtual stable</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <Warehouse className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No stables yet</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Create your first virtual stable to start managing your horses. 
              You can add multiple stables to organize horses by location or purpose.
            </p>
            <Button asChild size="lg">
              <Link href="/stables/new">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Stable
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
