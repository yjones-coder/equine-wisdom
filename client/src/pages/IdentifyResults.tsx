import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, CheckCircle, Info, RefreshCw } from "lucide-react";

interface BreedMatch {
  breedName: string;
  confidence: number;
  reasoning: string;
  breedId: number | null;
  breed: {
    id: number;
    name: string;
    slug: string;
    category: string;
    overview: string;
    heightMin: number | null;
    heightMax: number | null;
    origin: string | null;
    temperament: string | null;
    colors: string[] | null;
  } | null;
}

interface IdentifyResults {
  matches: BreedMatch[];
  additionalNotes: string;
}

export default function IdentifyResults() {
  const [, navigate] = useLocation();
  const [results, setResults] = useState<IdentifyResults | null>(null);
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    const storedResults = sessionStorage.getItem("identifyResults");
    const storedDescription = sessionStorage.getItem("identifyDescription");
    
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    }
    if (storedDescription) {
      setDescription(storedDescription);
    }
  }, []);

  if (!results) {
    return (
      <div className="py-16">
        <div className="container max-w-4xl text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">No Results Found</h1>
          <p className="text-muted-foreground mb-8">
            It looks like you haven't submitted a horse description yet.
          </p>
          <Link href="/identify">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Identification
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600";
    if (confidence >= 60) return "text-yellow-600";
    return "text-orange-600";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return "High Match";
    if (confidence >= 60) return "Good Match";
    return "Possible Match";
  };

  return (
    <div className="py-8 md:py-16">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/identify">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              New Identification
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Breed Identification Results
          </h1>
          <p className="text-muted-foreground">
            Based on your description, here are the most likely breed matches
          </p>
        </div>

        {/* Your Description */}
        {description && (
          <Card className="mb-8 bg-muted/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Your Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{description}</p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        <div className="space-y-6 mb-8">
          {results.matches.map((match, index) => (
            <Card 
              key={index} 
              className={index === 0 ? "border-2 border-primary/50 shadow-lg" : ""}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {index === 0 && (
                        <Badge variant="default" className="bg-primary">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Best Match
                        </Badge>
                      )}
                      <Badge variant="secondary" className="capitalize">
                        {match.breed?.category || "Unknown"}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl">{match.breedName}</CardTitle>
                    {match.breed && (
                      <CardDescription className="mt-1">
                        {match.breed.heightMin}-{match.breed.heightMax} hands • {match.breed.origin}
                      </CardDescription>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${getConfidenceColor(match.confidence)}`}>
                      {match.confidence}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {getConfidenceLabel(match.confidence)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Confidence Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className={getConfidenceColor(match.confidence)}>{match.confidence}%</span>
                  </div>
                  <Progress value={match.confidence} className="h-2" />
                </div>

                {/* Reasoning */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Why this breed?</h4>
                  <p className="text-sm text-muted-foreground">{match.reasoning}</p>
                </div>

                {/* Breed Overview */}
                {match.breed && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">About {match.breedName}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {match.breed.overview}
                    </p>
                  </div>
                )}

                {/* Colors */}
                {match.breed?.colors && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Common Colors</h4>
                    <div className="flex flex-wrap gap-2">
                      {(match.breed.colors as string[]).slice(0, 6).map((color, i) => (
                        <Badge key={i} variant="outline" className="capitalize">
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* View More */}
                {match.breed && (
                  <Link href={`/breeds/${match.breed.slug}`}>
                    <Button variant="outline" className="w-full mt-2">
                      Learn More About {match.breedName}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Notes */}
        {results.additionalNotes && (
          <Card className="mb-8 border-accent/20 bg-accent/5">
            <CardContent className="p-6">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-foreground mb-2">Additional Notes</h3>
                  <p className="text-sm text-muted-foreground">{results.additionalNotes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/identify" className="flex-1">
            <Button variant="outline" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Another Description
            </Button>
          </Link>
          <Link href="/breeds" className="flex-1">
            <Button className="w-full">
              Browse All Breeds
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
