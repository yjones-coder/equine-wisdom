import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2, Search, Info, History, Clock } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const sizeOptions = [
  { value: "pony", label: "Pony (under 14.2 hands)" },
  { value: "small", label: "Small (14-15 hands)" },
  { value: "medium", label: "Medium (15-16 hands)" },
  { value: "large", label: "Large (16-17 hands)" },
  { value: "very-large", label: "Very Large (17+ hands)" },
];

const colorOptions = [
  { value: "bay", label: "Bay (brown body, black points)" },
  { value: "chestnut", label: "Chestnut/Sorrel (reddish-brown)" },
  { value: "black", label: "Black" },
  { value: "gray", label: "Gray/White" },
  { value: "palomino", label: "Palomino (golden with white mane)" },
  { value: "buckskin", label: "Buckskin (tan with black points)" },
  { value: "dun", label: "Dun (tan with dorsal stripe)" },
  { value: "roan", label: "Roan (mixed white and colored hairs)" },
  { value: "pinto", label: "Pinto/Paint (large patches of color)" },
  { value: "spotted", label: "Spotted/Appaloosa pattern" },
  { value: "other", label: "Other" },
];

const buildOptions = [
  { value: "light", label: "Light/Athletic (lean, refined)" },
  { value: "stock", label: "Stock Horse (muscular, compact)" },
  { value: "warmblood", label: "Warmblood (athletic, well-proportioned)" },
  { value: "draft", label: "Draft (heavy, powerful)" },
  { value: "pony", label: "Pony Type (sturdy, compact)" },
];

export default function Identify() {
  const [, navigate] = useLocation();
  const searchParams = useSearch();
  const horseId = new URLSearchParams(searchParams).get("horseId");
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  
  const [formData, setFormData] = useState({
    description: "",
    size: "",
    color: "",
    build: "",
    distinctiveFeatures: "",
  });

  // Get recent searches for logged-in users
  const { data: recentSearches } = trpc.searchHistory.recent.useQuery(
    { limit: 3 },
    { enabled: isAuthenticated }
  );

  // Get horse details if horseId is provided
  const { data: horse } = trpc.horses.getById.useQuery(
    { id: parseInt(horseId || "0") },
    { enabled: isAuthenticated && !!horseId }
  );

  // Pre-fill form if horse data is available
  useEffect(() => {
    if (horse) {
      setFormData({
        description: `${horse.name} is ${horse.age ? `${horse.age} years old` : "of unknown age"}. ${horse.color ? `Color: ${horse.color}.` : ""} ${horse.markings ? `Markings: ${horse.markings}.` : ""} ${horse.notes || ""}`,
        size: horse.height ? (horse.height < 14.2 ? "pony" : horse.height < 15 ? "small" : horse.height < 16 ? "medium" : horse.height < 17 ? "large" : "very-large") : "",
        color: "",
        build: "",
        distinctiveFeatures: horse.markings || "",
      });
    }
  }, [horse]);

  const identifyMutation = trpc.identify.analyze.useMutation({
    onSuccess: (data) => {
      // Store results in sessionStorage for the results page
      sessionStorage.setItem("identifyResults", JSON.stringify(data));
      sessionStorage.setItem("identifyDescription", formData.description);
      if (horseId) {
        sessionStorage.setItem("identifyHorseId", horseId);
      }
      
      // Invalidate search history cache
      if (isAuthenticated) {
        utils.searchHistory.recent.invalidate();
        utils.dashboard.stats.invalidate();
      }
      
      navigate("/identify/results");
    },
    onError: (error) => {
      toast.error("Failed to identify breed", {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      toast.error("Please describe your horse");
      return;
    }
    identifyMutation.mutate({
      ...formData,
      horseId: horseId ? parseInt(horseId) : undefined,
    });
  };

  const handleRerunSearch = (search: { description: string; size?: string | null; color?: string | null; build?: string | null; distinctiveFeatures?: string | null; topBreedMatch?: string | null }) => {
    setFormData({
      description: search.description,
      size: search.size || "",
      color: search.color || "",
      build: search.build || "",
      distinctiveFeatures: search.distinctiveFeatures || "",
    });
    toast.success("Search loaded", { description: "Click 'Identify Breed' to run again" });
  };

  return (
    <div className="py-8 md:py-16">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {horse ? `Identify ${horse.name}'s Breed` : "Identify Your Horse's Breed"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Describe your horse's physical characteristics and our AI will analyze them 
            to suggest the most likely breed matches.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Horse Description</CardTitle>
                <CardDescription>
                  The more details you provide, the more accurate our identification will be
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Main Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      Describe Your Horse <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Tell us about your horse. Include details like their overall appearance, any unique markings, head shape, body proportions, leg features, mane and tail characteristics, and anything else that stands out..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="min-h-[150px]"
                    />
                    <p className="text-xs text-muted-foreground">
                      Example: "My horse is about 15 hands tall with a golden coat and white mane and tail. 
                      She has a refined head with large eyes and a slightly dished profile. Very elegant movement."
                    </p>
                  </div>

                  {/* Size and Color Row */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="size">Approximate Size</Label>
                      <Select
                        value={formData.size}
                        onValueChange={(value) => setFormData({ ...formData, size: value })}
                      >
                        <SelectTrigger id="size">
                          <SelectValue placeholder="Select size range" />
                        </SelectTrigger>
                        <SelectContent>
                          {sizeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="color">Primary Color</Label>
                      <Select
                        value={formData.color}
                        onValueChange={(value) => setFormData({ ...formData, color: value })}
                      >
                        <SelectTrigger id="color">
                          <SelectValue placeholder="Select primary color" />
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Build */}
                  <div className="space-y-2">
                    <Label htmlFor="build">Body Type/Build</Label>
                    <Select
                      value={formData.build}
                      onValueChange={(value) => setFormData({ ...formData, build: value })}
                    >
                      <SelectTrigger id="build">
                        <SelectValue placeholder="Select body type" />
                      </SelectTrigger>
                      <SelectContent>
                        {buildOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Distinctive Features */}
                  <div className="space-y-2">
                    <Label htmlFor="distinctiveFeatures">Distinctive Features</Label>
                    <Input
                      id="distinctiveFeatures"
                      placeholder="e.g., feathered legs, dished face, spotted pattern, high tail carriage..."
                      value={formData.distinctiveFeatures}
                      onChange={(e) => setFormData({ ...formData, distinctiveFeatures: e.target.value })}
                    />
                  </div>

                  {/* Tips */}
                  <Card className="bg-accent/5 border-accent/20">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-foreground mb-1">Tips for better results:</p>
                          <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                            <li>Mention any unique markings (stars, blazes, socks)</li>
                            <li>Describe the head shape (refined, heavy, dished, Roman nose)</li>
                            <li>Note the mane and tail (thick, thin, wavy, feathered legs)</li>
                            <li>Include temperament if known (calm, spirited, gentle)</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Submit */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={identifyMutation.isPending || !formData.description.trim()}
                  >
                    {identifyMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-5 w-5" />
                        Identify Breed
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Recent Searches */}
          <div className="lg:col-span-1">
            {isAuthenticated && recentSearches && recentSearches.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Recent Searches
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentSearches.map((search) => (
                    <button
                      key={search.id}
                      onClick={() => handleRerunSearch(search)}
                      className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <p className="text-sm line-clamp-2 mb-1">
                        {search.description.substring(0, 80)}
                        {search.description.length > 80 ? "..." : ""}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(search.createdAt), { addSuffix: true })}
                      </div>
                      {search.topBreedMatch && (
                        <p className="text-xs text-primary mt-1">
                          Top match: {search.topBreedMatch}
                        </p>
                      )}
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Sign in prompt for non-authenticated users */}
            {!isAuthenticated && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <History className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-foreground mb-1">Save your searches</p>
                      <p className="text-muted-foreground">
                        Sign in to save your identification history and track your horses' breeds over time.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
