import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { 
  Home, 
  Plus, 
  Search, 
  Heart, 
  Clock, 
  Bell,
  ChevronRight,
  Warehouse
} from "lucide-react";
import { getLoginUrl } from "@/const";
import { formatDistanceToNow } from "date-fns";

// Horse icon component since lucide doesn't have one
function HorseIconCustom({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 8.5c0-1.5-1-2.5-2-3-.5-2-2-3-4-3-1 0-2 .5-3 1.5C12 5 11 6 11 7.5c0 .5 0 1 .5 1.5L8 13l-3-1-2 3 3 3 1-1 2 4h4l1-4 3-1 2 2 2-2-2-3c.5-.5 1-1.5 1-2.5z"/>
    </svg>
  );
}

export default function Dashboard() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const { data: stables, isLoading: stablesLoading } = trpc.stables.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const { data: savedBreeds, isLoading: savedBreedsLoading } = trpc.savedBreeds.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="container py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Home className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Welcome to Your Dashboard</h1>
          <p className="text-muted-foreground mb-8">
            Sign in to access your virtual stables, saved breeds, and personalized horse care features.
          </p>
          <Button asChild size="lg">
            <a href={getLoginUrl()}>Sign In to Continue</a>
          </Button>
        </div>
      </div>
    );
  }

  const isLoading = authLoading || statsLoading;

  return (
    <div className="container py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back{user?.name ? `, ${user.name}` : ''}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your stables, horses, and explore breed information.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Warehouse className="w-5 h-5 text-primary" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.stableCount || 0}</p>
                )}
                <p className="text-sm text-muted-foreground">Stables</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-amber-100 rounded-lg">
                <HorseIconCustom className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.horseCount || 0}</p>
                )}
                <p className="text-sm text-muted-foreground">Horses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="w-5 h-5 text-red-600" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.savedBreedCount || 0}</p>
                )}
                <p className="text-sm text-muted-foreground">Saved Breeds</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                {isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <p className="text-2xl font-bold">{stats?.identificationCount || 0}</p>
                )}
                <p className="text-sm text-muted-foreground">Identifications</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content - Stables */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Stables */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Stables</CardTitle>
                <CardDescription>Manage your virtual stables and horses</CardDescription>
              </div>
              <Button asChild>
                <Link href="/stables/new">
                  <Plus className="w-4 h-4 mr-2" />
                  New Stable
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {stablesLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                      <Skeleton className="w-12 h-12 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : stables && stables.length > 0 ? (
                <div className="space-y-4">
                  {stables.slice(0, 3).map((stable) => (
                    <Link key={stable.id} href={`/stables/${stable.id}`}>
                      <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Warehouse className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{stable.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {stable.horseCount} horse{stable.horseCount !== 1 ? 's' : ''}
                            {stable.location && ` • ${stable.location}`}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                  {stables.length > 3 && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/stables">View All Stables</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Warehouse className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">No stables yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first virtual stable to start managing your horses.
                  </p>
                  <Button asChild>
                    <Link href="/stables/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Stable
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Identifications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Identifications</CardTitle>
                <CardDescription>Your latest breed identification results</CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link href="/identify">
                  <Search className="w-4 h-4 mr-2" />
                  New Search
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                      <Skeleton className="w-10 h-10 rounded" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-48 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : stats?.recentIdentifications && stats.recentIdentifications.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentIdentifications.map((identification) => {
                    const topMatch = (identification.matchedBreeds as any[])?.[0];
                    return (
                      <div key={identification.id} className="flex items-start gap-4 p-3 border rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                          <Search className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {topMatch ? `${topMatch.breedName} (${topMatch.confidence}% match)` : 'No match found'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {identification.description?.slice(0, 60)}...
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {formatDistanceToNow(new Date(identification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    No breed identifications yet. Try identifying your horse's breed!
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/identify">Identify a Horse</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/identify">
                  <Search className="w-4 h-4 mr-2" />
                  Identify a Breed
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/breeds">
                  <HorseIconCustom className="w-4 h-4 mr-2" />
                  Browse Breeds
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/learn">
                  <Clock className="w-4 h-4 mr-2" />
                  Learn Horse Facts
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/settings">
                  <Bell className="w-4 h-4 mr-2" />
                  Notification Settings
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Saved Breeds */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Saved Breeds</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/saved-breeds">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {savedBreedsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : savedBreeds && savedBreeds.length > 0 ? (
                <div className="space-y-2">
                  {savedBreeds.slice(0, 5).map((saved) => (
                    <Link key={saved.id} href={`/breeds/${saved.breed?.slug}`}>
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                        <span className="text-sm font-medium">{saved.breed?.name}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No saved breeds yet. Browse breeds and save your favorites!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : stats?.upcomingReminders && stats.upcomingReminders.length > 0 ? (
                <div className="space-y-3">
                  {stats.upcomingReminders.slice(0, 3).map((reminder) => (
                    <div key={reminder.id} className="flex items-start gap-3 p-2 border rounded-lg">
                      <Bell className="w-4 h-4 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{reminder.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {reminder.nextDueDate && formatDistanceToNow(new Date(reminder.nextDueDate), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming reminders. Add care logs to your horses to set reminders.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
