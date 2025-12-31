import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Edit, 
  Trash2, 
  Loader2,
  Calendar,
  Stethoscope,
  Scissors,
  Dumbbell,
  Pill,
  MoreHorizontal,
  Plus,
  Clock,
  Search
} from "lucide-react";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";

// Horse icon component
function HorseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 8.5c0-1.5-1-2.5-2-3-.5-2-2-3-4-3-1 0-2 .5-3 1.5C12 5 11 6 11 7.5c0 .5 0 1 .5 1.5L8 13l-3-1-2 3 3 3 1-1 2 4h4l1-4 3-1 2 2 2-2-2-3c.5-.5 1-1.5 1-2.5z"/>
    </svg>
  );
}

const careTypeIcons: Record<string, React.ReactNode> = {
  feeding: <Calendar className="w-4 h-4" />,
  grooming: <Scissors className="w-4 h-4" />,
  exercise: <Dumbbell className="w-4 h-4" />,
  veterinary: <Stethoscope className="w-4 h-4" />,
  farrier: <Scissors className="w-4 h-4" />,
  medication: <Pill className="w-4 h-4" />,
  other: <MoreHorizontal className="w-4 h-4" />,
};

const careTypeColors: Record<string, string> = {
  feeding: "bg-green-100 text-green-700",
  grooming: "bg-blue-100 text-blue-700",
  exercise: "bg-orange-100 text-orange-700",
  veterinary: "bg-red-100 text-red-700",
  farrier: "bg-purple-100 text-purple-700",
  medication: "bg-pink-100 text-pink-700",
  other: "bg-gray-100 text-gray-700",
};

export default function HorseDetail() {
  const { id } = useParams<{ id: string }>();
  const horseId = parseInt(id || "0");
  const [, navigate] = useLocation();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: horse, isLoading } = trpc.horses.getById.useQuery(
    { id: horseId },
    { enabled: isAuthenticated && horseId > 0 }
  );

  const { data: careLogs, isLoading: careLogsLoading } = trpc.careLogs.listByHorse.useQuery(
    { horseId, limit: 20 },
    { enabled: isAuthenticated && horseId > 0 }
  );

  const deleteHorse = trpc.horses.delete.useMutation({
    onSuccess: () => {
      toast.success("Horse removed successfully");
      utils.horses.list.invalidate();
      utils.stables.list.invalidate();
      utils.dashboard.stats.invalidate();
      navigate("/stables");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove horse");
    },
  });

  // Show login prompt if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="container py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <HorseIcon className="w-8 h-8 text-amber-700" />
          </div>
          <h1 className="text-2xl font-bold mb-4">View Horse</h1>
          <p className="text-muted-foreground mb-8">
            Sign in to view and manage your horses.
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
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!horse) {
    return (
      <div className="container py-16">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Horse Not Found</h1>
          <p className="text-muted-foreground mb-8">
            This horse doesn't exist or you don't have access to it.
          </p>
          <Button asChild>
            <Link href="/stables">Back to Stables</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    deleteHorse.mutate({ id: horseId });
  };

  return (
    <div className="container py-8">
      {/* Back Button */}
      <Button variant="ghost" className="mb-6" asChild>
        <Link href={`/stables/${horse.stableId}`}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Stable
        </Link>
      </Button>

      {/* Horse Header */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-amber-100 rounded-lg flex items-center justify-center">
                <HorseIcon className="w-10 h-10 text-amber-700" />
              </div>
              <div>
                <CardTitle className="text-2xl">{horse.name}</CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  {horse.breed && (
                    <Badge variant="secondary">{horse.breed.name}</Badge>
                  )}
                  {horse.gender && horse.gender !== 'unknown' && (
                    <Badge variant="outline" className="capitalize">{horse.gender}</Badge>
                  )}
                  {horse.age && (
                    <Badge variant="outline">{horse.age} years old</Badge>
                  )}
                </div>
                {horse.matchedBreed && (
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <Search className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">
                      Identified as <span className="font-medium text-foreground">{horse.matchedBreed.name}</span>
                      {horse.matchConfidence && ` (${horse.matchConfidence}% confidence)`}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/horses/${horseId}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Remove Horse</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to remove "{horse.name}" from your stable? This will also delete all care logs. This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDelete}
                      disabled={deleteHorse.isPending}
                    >
                      {deleteHorse.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Removing...
                        </>
                      ) : (
                        "Remove Horse"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="care">Care Logs</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Physical Characteristics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Physical Characteristics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Color</p>
                    <p className="font-medium">{horse.color || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Height</p>
                    <p className="font-medium">{horse.height ? `${horse.height} hands` : "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Weight</p>
                    <p className="font-medium">{horse.weight ? `${horse.weight} lbs` : "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Age</p>
                    <p className="font-medium">{horse.age ? `${horse.age} years` : "Not specified"}</p>
                  </div>
                </div>
                {horse.markings && (
                  <div>
                    <p className="text-sm text-muted-foreground">Markings</p>
                    <p className="font-medium">{horse.markings}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Care Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Care Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Veterinarian</p>
                  <p className="font-medium">{horse.veterinarian || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Farrier</p>
                  <p className="font-medium">{horse.farrier || "Not specified"}</p>
                </div>
                {horse.feedingSchedule && (
                  <div>
                    <p className="text-sm text-muted-foreground">Feeding Schedule</p>
                    <p className="font-medium">{horse.feedingSchedule}</p>
                  </div>
                )}
                {horse.specialNeeds && (
                  <div>
                    <p className="text-sm text-muted-foreground">Special Needs</p>
                    <p className="font-medium">{horse.specialNeeds}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          {horse.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{horse.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Breed Identification */}
          {!horse.matchedBreedId && (
            <Card className="border-dashed">
              <CardContent className="flex items-center justify-between py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Search className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Identify this horse's breed</h3>
                    <p className="text-sm text-muted-foreground">
                      Use our AI-powered tool to identify the breed based on physical characteristics
                    </p>
                  </div>
                </div>
                <Button asChild>
                  <Link href={`/identify?horseId=${horseId}`}>
                    Identify Breed
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Care Logs Tab */}
        <TabsContent value="care" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Care History</h2>
            <Button asChild>
              <Link href={`/horses/${horseId}/care/new`}>
                <Plus className="w-4 h-4 mr-2" />
                Add Care Log
              </Link>
            </Button>
          </div>

          {careLogsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : careLogs && careLogs.length > 0 ? (
            <div className="space-y-4">
              {careLogs.map((log) => (
                <Card key={log.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${careTypeColors[log.careType]}`}>
                        {careTypeIcons[log.careType]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{log.title}</h3>
                            <p className="text-sm text-muted-foreground capitalize">{log.careType}</p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="text-muted-foreground">
                              {format(new Date(log.date), "MMM d, yyyy")}
                            </p>
                            {log.cost && (
                              <p className="font-medium">${(log.cost / 100).toFixed(2)}</p>
                            )}
                          </div>
                        </div>
                        {log.description && (
                          <p className="text-sm text-muted-foreground mt-2">{log.description}</p>
                        )}
                        {log.nextDueDate && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
                            <Clock className="w-3 h-3" />
                            Next due: {formatDistanceToNow(new Date(log.nextDueDate), { addSuffix: true })}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">No care logs yet</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                  Start tracking veterinary visits, grooming sessions, feeding schedules, and more.
                </p>
                <Button asChild>
                  <Link href={`/horses/${horseId}/care/new`}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Care Log
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
