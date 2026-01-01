import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Loader2, ChevronDown } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import { FeedingScheduleBuilder, type FeedingSchedule } from "@/components/FeedingScheduleBuilder";

// Horse icon component
function HorseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 8.5c0-1.5-1-2.5-2-3-.5-2-2-3-4-3-1 0-2 .5-3 1.5C12 5 11 6 11 7.5c0 .5 0 1 .5 1.5L8 13l-3-1-2 3 3 3 1-1 2 4h4l1-4 3-1 2 2 2-2-2-3c.5-.5 1-1.5 1-2.5z"/>
    </svg>
  );
}

// Default feeding schedule
const DEFAULT_FEEDING_SCHEDULE: FeedingSchedule = {
  type: "3x_daily",
  slots: [
    {
      id: "morning",
      name: "Morning Feeding",
      time: "06:00",
      icon: "morning",
      hay: { amount: 3, unit: "flakes" },
      grain: { amount: 2, unit: "lbs", type: "" },
      supplements: [],
      water: true,
      notes: "",
    },
    {
      id: "noon",
      name: "Noon Feeding",
      time: "12:00",
      icon: "noon",
      hay: { amount: 2, unit: "flakes" },
      grain: { amount: 0, unit: "lbs", type: "" },
      supplements: [],
      water: true,
      notes: "",
    },
    {
      id: "evening",
      name: "Evening Feeding",
      time: "18:00",
      icon: "evening",
      hay: { amount: 3, unit: "flakes" },
      grain: { amount: 2, unit: "lbs", type: "" },
      supplements: [],
      water: true,
      notes: "",
    },
  ],
  weeklyVariations: false,
  variations: [],
};

export default function NewHorse() {
  const { stableId: stableIdParam } = useParams<{ stableId: string }>();
  const stableId = parseInt(stableIdParam || "0");
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  
  const { data: stable } = trpc.stables.getById.useQuery(
    { id: stableId },
    { enabled: isAuthenticated && stableId > 0 }
  );

  const { data: breeds } = trpc.breeds.list.useQuery();

  const [formData, setFormData] = useState({
    name: "",
    breedId: undefined as number | undefined,
    age: undefined as number | undefined,
    gender: "unknown" as "mare" | "stallion" | "gelding" | "colt" | "filly" | "unknown",
    color: "",
    markings: "",
    height: undefined as number | undefined,
    weight: undefined as number | undefined,
    notes: "",
    specialNeeds: "",
    veterinarian: "",
    farrier: "",
  });

  const [feedingSchedule, setFeedingSchedule] = useState<FeedingSchedule>(DEFAULT_FEEDING_SCHEDULE);
  const [feedingExpanded, setFeedingExpanded] = useState(true);

  const createHorse = trpc.horses.create.useMutation({
    onSuccess: (data) => {
      toast.success("Horse added successfully!");
      utils.stables.getWithHorses.invalidate({ id: stableId });
      utils.horses.list.invalidate();
      utils.dashboard.stats.invalidate();
      navigate(`/horses/${data?.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add horse");
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
          <h1 className="text-2xl font-bold mb-4">Add a Horse</h1>
          <p className="text-muted-foreground mb-8">
            Sign in to add horses to your stables.
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
      toast.error("Please enter a horse name");
      return;
    }

    // Generate a text summary of the feeding schedule for legacy field
    const feedingSummary = feedingSchedule.slots
      .map(slot => `${slot.name}: ${slot.time} - Hay: ${slot.hay.amount} ${slot.hay.unit}, Grain: ${slot.grain.amount} ${slot.grain.unit}${slot.supplements.length > 0 ? `, Supplements: ${slot.supplements.join(", ")}` : ""}`)
      .join("; ");

    createHorse.mutate({
      stableId,
      name: formData.name.trim(),
      breedId: formData.breedId,
      age: formData.age,
      gender: formData.gender,
      color: formData.color.trim() || undefined,
      markings: formData.markings.trim() || undefined,
      height: formData.height,
      weight: formData.weight,
      notes: formData.notes.trim() || undefined,
      specialNeeds: formData.specialNeeds.trim() || undefined,
      feedingSchedule: feedingSummary,
      feedingScheduleData: feedingSchedule,
      veterinarian: formData.veterinarian.trim() || undefined,
      farrier: formData.farrier.trim() || undefined,
    });
  };

  return (
    <div className="container py-8 max-w-3xl">
      {/* Back Button */}
      <Button variant="ghost" className="mb-6" asChild>
        <Link href={`/stables/${stableId}`}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {stable?.name || "Stable"}
        </Link>
      </Button>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <HorseIcon className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <CardTitle>Add New Horse</CardTitle>
                <CardDescription>
                  Add a horse to {stable?.name || "your stable"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Basic Information</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Horse Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Thunder"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="breed">Breed</Label>
                  <Select
                    value={formData.breedId?.toString() || ""}
                    onValueChange={(value) => setFormData({ ...formData, breedId: value ? parseInt(value) : undefined })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select breed (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {breeds?.map((breed) => (
                        <SelectItem key={breed.id} value={breed.id.toString()}>
                          {breed.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Don't know the breed? Use our <Link href="/identify" className="text-primary underline">breed identifier</Link>
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age (years)</Label>
                  <Input
                    id="age"
                    type="number"
                    min={0}
                    max={50}
                    placeholder="e.g., 8"
                    value={formData.age || ""}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value: typeof formData.gender) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unknown">Unknown</SelectItem>
                      <SelectItem value="mare">Mare</SelectItem>
                      <SelectItem value="stallion">Stallion</SelectItem>
                      <SelectItem value="gelding">Gelding</SelectItem>
                      <SelectItem value="colt">Colt</SelectItem>
                      <SelectItem value="filly">Filly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    placeholder="e.g., Bay"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Physical Characteristics */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Physical Characteristics</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (hands)</Label>
                  <Input
                    id="height"
                    type="number"
                    min={1}
                    max={25}
                    step={0.1}
                    placeholder="e.g., 15.2"
                    value={formData.height || ""}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  <Input
                    id="weight"
                    type="number"
                    min={100}
                    max={3000}
                    placeholder="e.g., 1100"
                    value={formData.weight || ""}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="markings">Markings</Label>
                <Textarea
                  id="markings"
                  placeholder="Describe any distinctive markings (star, blaze, socks, etc.)"
                  value={formData.markings}
                  onChange={(e) => setFormData({ ...formData, markings: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feeding Schedule Card */}
        <Card>
          <Collapsible open={feedingExpanded} onOpenChange={setFeedingExpanded}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      🌾 Feeding Schedule
                    </CardTitle>
                    <CardDescription>
                      Set up your horse's daily feeding routine with times, amounts, and supplements
                    </CardDescription>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform ${feedingExpanded ? "rotate-180" : ""}`} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <FeedingScheduleBuilder
                  value={feedingSchedule}
                  onChange={setFeedingSchedule}
                />
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Care & Contact Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Care & Contact Information</CardTitle>
            <CardDescription>
              Special needs and care provider contacts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="specialNeeds">Special Needs</Label>
              <Textarea
                id="specialNeeds"
                placeholder="Any medical conditions, allergies, or special care requirements"
                value={formData.specialNeeds}
                onChange={(e) => setFormData({ ...formData, specialNeeds: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="veterinarian">Veterinarian</Label>
                <Input
                  id="veterinarian"
                  placeholder="Vet name or clinic"
                  value={formData.veterinarian}
                  onChange={(e) => setFormData({ ...formData, veterinarian: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="farrier">Farrier</Label>
                <Input
                  id="farrier"
                  placeholder="Farrier name"
                  value={formData.farrier}
                  onChange={(e) => setFormData({ ...formData, farrier: e.target.value })}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any other information about this horse"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => navigate(`/stables/${stableId}`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={createHorse.isPending}
          >
            {createHorse.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Horse"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
