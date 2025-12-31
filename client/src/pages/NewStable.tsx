import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { ArrowLeft, Warehouse, Loader2 } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function NewStable() {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    capacity: 10,
  });

  const createStable = trpc.stables.create.useMutation({
    onSuccess: (data) => {
      toast.success("Stable created successfully!");
      utils.stables.list.invalidate();
      utils.dashboard.stats.invalidate();
      navigate(`/stables/${data?.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create stable");
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
          <h1 className="text-2xl font-bold mb-4">Create a Stable</h1>
          <p className="text-muted-foreground mb-8">
            Sign in to create and manage your virtual stables.
          </p>
          <Button asChild size="lg">
            <a href={getLoginUrl()}>Sign In to Continue</a>
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Please enter a stable name");
      return;
    }

    createStable.mutate({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      location: formData.location.trim() || undefined,
      capacity: formData.capacity,
    });
  };

  return (
    <div className="container py-8 max-w-2xl">
      {/* Back Button */}
      <Button variant="ghost" className="mb-6" asChild>
        <Link href="/stables">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Stables
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Warehouse className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle>Create New Stable</CardTitle>
              <CardDescription>
                Set up a virtual stable to organize and manage your horses
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Stable Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Sunny Meadows Farm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Kentucky, USA"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Optional: Add a location to help organize your stables
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                max={100}
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 10 })}
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of horses this stable can hold
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your stable, its purpose, or any special features..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/stables")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={createStable.isPending}
              >
                {createStable.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Stable"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
