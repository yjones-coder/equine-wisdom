import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Link, useParams, useLocation } from "wouter";
import { 
  ArrowLeft, 
  Warehouse, 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronRight,
  Loader2
} from "lucide-react";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { toast } from "sonner";

// Horse icon component
function HorseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 8.5c0-1.5-1-2.5-2-3-.5-2-2-3-4-3-1 0-2 .5-3 1.5C12 5 11 6 11 7.5c0 .5 0 1 .5 1.5L8 13l-3-1-2 3 3 3 1-1 2 4h4l1-4 3-1 2 2 2-2-2-3c.5-.5 1-1.5 1-2.5z"/>
    </svg>
  );
}

export default function StableDetail() {
  const { id } = useParams<{ id: string }>();
  const stableId = parseInt(id || "0");
  const [, navigate] = useLocation();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: stable, isLoading } = trpc.stables.getWithHorses.useQuery(
    { id: stableId },
    { enabled: isAuthenticated && stableId > 0 }
  );

  const deleteStable = trpc.stables.delete.useMutation({
    onSuccess: () => {
      toast.success("Stable deleted successfully");
      utils.stables.list.invalidate();
      utils.dashboard.stats.invalidate();
      navigate("/stables");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete stable");
    },
  });

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="container py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Warehouse className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-4">View Stable</h1>
          <p className="text-muted-foreground mb-8">
            Sign in to view and manage your stables.
          </p>
          <Button asChild size="lg">
            <a href={getLoginUrl()}>Sign In to Continue</a>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || authLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-32 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stable) {
    return (
      <div className="container py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Stable Not Found</h1>
          <p className="text-muted-foreground mb-8">
            This stable doesn't exist or you don't have access to it.
          </p>
          <Button asChild>
            <Link href="/stables">Back to Stables</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    deleteStable.mutate({ id: stableId });
  };

  return (
    <div className="container py-8">
      {/* Back Button */}
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/stables">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Stables
        </Link>
      </Button>

      {/* Stable Header */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <Warehouse className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{stable.name}</CardTitle>
                {stable.location && (
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" />
                    {stable.location}
                  </CardDescription>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/stables/${stableId}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Stable</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete "{stable.name}"? This will also delete all horses in this stable. This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDelete}
                      disabled={deleteStable.isPending}
                    >
                      {deleteStable.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete Stable"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        {stable.description && (
          <CardContent>
            <p className="text-muted-foreground">{stable.description}</p>
          </CardContent>
        )}
        <CardContent className="border-t pt-4">
          <div className="flex gap-8 text-sm">
            <div>
              <span className="text-muted-foreground">Horses:</span>{" "}
              <span className="font-medium">{stable.horses?.length || 0}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Capacity:</span>{" "}
              <span className="font-medium">{stable.capacity || 10}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Horses Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Horses in this Stable</h2>
        <Button asChild>
          <Link href={`/stables/${stableId}/horses/new`}>
            <Plus className="w-4 h-4 mr-2" />
            Add Horse
          </Link>
        </Button>
      </div>

      {stable.horses && stable.horses.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stable.horses.map((horse) => (
            <Link key={horse.id} href={`/horses/${horse.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <HorseIcon className="w-6 h-6 text-amber-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{horse.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {horse.color && `${horse.color} • `}
                        {horse.gender && horse.gender !== 'unknown' && `${horse.gender} • `}
                        {horse.age ? `${horse.age} years` : 'Age unknown'}
                      </p>
                      {horse.matchedBreedId && (
                        <p className="text-xs text-primary mt-1">
                          Identified breed • {horse.matchConfidence}% match
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          
          {/* Add Horse Card */}
          <Link href={`/stables/${stableId}/horses/new`}>
            <Card className="border-dashed hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer h-full">
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[120px] pt-6">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mb-3">
                  <Plus className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="font-medium text-sm">Add Horse</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <HorseIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No horses yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
              Add your first horse to this stable to start tracking their information and care.
            </p>
            <Button asChild>
              <Link href={`/stables/${stableId}/horses/new`}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Horse
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
