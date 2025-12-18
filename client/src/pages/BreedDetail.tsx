import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Ruler, Weight, MapPin, Clock, Heart, Stethoscope, Apple, Dumbbell } from "lucide-react";

export default function BreedDetail() {
  const params = useParams<{ slug: string }>();
  const { data: breed, isLoading, error } = trpc.breeds.getBySlug.useQuery(
    { slug: params.slug || "" },
    { enabled: !!params.slug }
  );

  if (isLoading) {
    return (
      <div className="py-8 md:py-16">
        <div className="container max-w-4xl">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-12 bg-muted rounded w-3/4" />
            <div className="h-6 bg-muted rounded w-1/2" />
            <div className="grid md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded" />
              ))}
            </div>
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !breed) {
    return (
      <div className="py-16">
        <div className="container max-w-4xl text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Breed Not Found</h1>
          <p className="text-muted-foreground mb-8">
            We couldn't find the breed you're looking for.
          </p>
          <Link href="/breeds">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Browse All Breeds
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-16">
      <div className="container max-w-4xl">
        {/* Back Button */}
        <Link href="/breeds">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Breeds
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="secondary" className="capitalize text-sm">
              {breed.category}
            </Badge>
            {breed.popularity && (
              <Badge variant="outline" className="capitalize">
                {breed.popularity}
              </Badge>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {breed.name}
          </h1>
          <p className="text-xl text-muted-foreground">
            {breed.overview}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Ruler className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Height</p>
                <p className="font-semibold text-foreground">
                  {breed.heightMin}-{breed.heightMax} hands
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Weight className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Weight</p>
                <p className="font-semibold text-foreground">
                  {breed.weightMin?.toLocaleString()}-{breed.weightMax?.toLocaleString()} lbs
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Origin</p>
                <p className="font-semibold text-foreground">{breed.origin || "Unknown"}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lifespan</p>
                <p className="font-semibold text-foreground">{breed.lifespan || "25-30 years"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colors */}
        {breed.colors && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Common Colors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(breed.colors as string[]).map((color, i) => (
                  <Badge key={i} variant="secondary" className="capitalize">
                    {color}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="physical" className="mb-8">
          <TabsList className="w-full flex-wrap h-auto gap-2 bg-muted/50 p-2">
            <TabsTrigger value="physical">Physical</TabsTrigger>
            <TabsTrigger value="temperament">Temperament</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="care">Care</TabsTrigger>
          </TabsList>

          <TabsContent value="physical" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-primary" />
                  Physical Characteristics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {breed.physicalDescription && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Description</h4>
                    <p className="text-muted-foreground">{breed.physicalDescription}</p>
                  </div>
                )}
                {breed.distinctiveFeatures && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Distinctive Features</h4>
                    <p className="text-muted-foreground">{breed.distinctiveFeatures}</p>
                  </div>
                )}
                {breed.uses && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Common Uses</h4>
                    <p className="text-muted-foreground">{breed.uses}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="temperament" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Temperament & Personality
                </CardTitle>
              </CardHeader>
              <CardContent>
                {breed.temperament ? (
                  <p className="text-muted-foreground">{breed.temperament}</p>
                ) : (
                  <p className="text-muted-foreground">
                    Temperament information not available for this breed.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  History & Origin
                </CardTitle>
              </CardHeader>
              <CardContent>
                {breed.history ? (
                  <p className="text-muted-foreground">{breed.history}</p>
                ) : (
                  <p className="text-muted-foreground">
                    Historical information not available for this breed.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="care" className="mt-6">
            <div className="space-y-6">
              {breed.careRequirements && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Dumbbell className="h-5 w-5 text-primary" />
                      Care Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{breed.careRequirements}</p>
                  </CardContent>
                </Card>
              )}

              {breed.feedingNotes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Apple className="h-5 w-5 text-primary" />
                      Feeding Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{breed.feedingNotes}</p>
                  </CardContent>
                </Card>
              )}

              {breed.healthConsiderations && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-primary" />
                      Health Considerations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{breed.healthConsiderations}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  Think your horse might be a {breed.name}?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Use our AI-powered identification tool to find out
                </p>
              </div>
              <Link href="/identify">
                <Button>Identify Your Horse</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
