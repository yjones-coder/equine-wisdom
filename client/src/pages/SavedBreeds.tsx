import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Heart, Search, Trash2 } from "lucide-react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function SavedBreeds() {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  
  const { data: savedBreeds, isLoading } = trpc.savedBreeds.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const removeSavedBreed = trpc.savedBreeds.remove.useMutation({
    onSuccess: () => {
      toast.success("Breed removed from saved");
      utils.savedBreeds.list.invalidate();
      utils.dashboard.stats.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove breed");
    },
  });

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="container py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Saved Breeds</h1>
          <p className="text-muted-foreground mb-8">
            Sign in to save and manage your favorite horse breeds.
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
          <h1 className="text-3xl font-bold text-foreground">Saved Breeds</h1>
          <p className="text-muted-foreground mt-1">
            Your collection of favorite horse breeds
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/breeds">
            <Search className="w-4 h-4 mr-2" />
            Browse Breeds
          </Link>
        </Button>
      </div>

      {/* Saved Breeds Grid */}
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
      ) : savedBreeds && savedBreeds.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedBreeds.map((saved) => (
            <Card key={saved.id} className="group relative">
              <Link href={`/breeds/${saved.breed?.slug}`}>
                <CardHeader className="cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {saved.breed?.name}
                      </CardTitle>
                      <CardDescription className="capitalize">
                        {saved.breed?.category} breed
                      </CardDescription>
                    </div>
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {saved.breed?.overview}
                  </p>
                  {saved.notes && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs text-muted-foreground">Your notes:</p>
                      <p className="text-sm mt-1">{saved.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.preventDefault();
                  if (saved.breed?.id) {
                    removeSavedBreed.mutate({ breedId: saved.breed.id });
                  }
                }}
              >
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <Heart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No saved breeds yet</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Browse our breed database and save the ones you're interested in. 
              You can add notes and track breeds for future reference.
            </p>
            <Button asChild size="lg">
              <Link href="/breeds">
                <Search className="w-4 h-4 mr-2" />
                Browse Breeds
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
