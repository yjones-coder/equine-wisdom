import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2, Search, Info } from "lucide-react";
import { toast } from "sonner";

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
  const [formData, setFormData] = useState({
    description: "",
    size: "",
    color: "",
    build: "",
    distinctiveFeatures: "",
  });

  const identifyMutation = trpc.identify.analyze.useMutation({
    onSuccess: (data) => {
      // Store results in sessionStorage for the results page
      sessionStorage.setItem("identifyResults", JSON.stringify(data));
      sessionStorage.setItem("identifyDescription", formData.description);
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
    identifyMutation.mutate(formData);
  };

  return (
    <div className="py-8 md:py-16">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Identify Your Horse's Breed
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Describe your horse's physical characteristics and our AI will analyze them 
            to suggest the most likely breed matches.
          </p>
        </div>

        {/* Form */}
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
    </div>
  );
}
