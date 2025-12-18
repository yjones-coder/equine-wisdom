import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { 
  BookOpen, 
  Heart, 
  Brain, 
  Apple, 
  Dumbbell, 
  Clock, 
  Stethoscope,
  RefreshCw,
  GraduationCap,
  Users
} from "lucide-react";

const categories = [
  { value: "all", label: "All Topics", icon: BookOpen },
  { value: "general", label: "General", icon: BookOpen },
  { value: "health", label: "Health", icon: Stethoscope },
  { value: "behavior", label: "Behavior", icon: Brain },
  { value: "nutrition", label: "Nutrition", icon: Apple },
  { value: "training", label: "Training", icon: Dumbbell },
  { value: "history", label: "History", icon: Clock },
  { value: "care", label: "Care", icon: Heart },
];

const levels = [
  { value: "all", label: "All Levels", icon: Users },
  { value: "beginner", label: "Beginner", icon: GraduationCap },
  { value: "intermediate", label: "Intermediate", icon: GraduationCap },
  { value: "advanced", label: "Advanced", icon: GraduationCap },
];

const getCategoryIcon = (category: string) => {
  const cat = categories.find(c => c.value === category);
  return cat?.icon || BookOpen;
};

const getLevelColor = (level: string) => {
  switch (level) {
    case "beginner": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "advanced": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default: return "bg-muted text-muted-foreground";
  }
};

export default function Learn() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const initialCategory = searchParams.get("category") || "all";
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedLevel, setSelectedLevel] = useState("all");

  const { data: allFacts, isLoading } = trpc.facts.list.useQuery();
  const { data: randomFacts, refetch: refetchRandom } = trpc.facts.random.useQuery({ limit: 1 });

  // Filter facts based on selections
  const filteredFacts = (() => {
    if (!allFacts) return [];
    
    let facts = allFacts;
    
    if (selectedCategory !== "all") {
      facts = facts.filter(f => f.category === selectedCategory);
    }
    
    if (selectedLevel !== "all") {
      facts = facts.filter(f => f.audienceLevel === selectedLevel || f.audienceLevel === "all");
    }
    
    return facts;
  })();

  // Group facts by category for display
  const groupedFacts = filteredFacts.reduce((acc, fact) => {
    const category = fact.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(fact);
    return acc;
  }, {} as Record<string, typeof filteredFacts>);

  return (
    <div className="py-8 md:py-16">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Horse Knowledge & Facts
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Expand your understanding of horses with our curated collection of facts, 
            tips, and insights for horse owners of all experience levels
          </p>
        </div>

        {/* Random Fact Highlight */}
        {randomFacts && randomFacts[0] && (
          <Card className="mb-12 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Badge variant="secondary" className="mb-3">
                    Did You Know?
                  </Badge>
                  <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
                    {randomFacts[0].title}
                  </h3>
                  <p className="text-muted-foreground">
                    {randomFacts[0].content}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => refetchRandom()}
                  className="shrink-0"
                >
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="space-y-4 mb-8">
          {/* Category Filter */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Filter by Topic</h3>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="w-full flex-wrap h-auto gap-2 bg-transparent justify-start">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <TabsTrigger
                      key={cat.value}
                      value={cat.value}
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {cat.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>

          {/* Level Filter */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Experience Level</h3>
            <div className="flex flex-wrap gap-2">
              {levels.map((level) => (
                <Button
                  key={level.value}
                  variant={selectedLevel === level.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLevel(level.value)}
                  className="gap-2"
                >
                  {level.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-6">
          {isLoading ? "Loading..." : `${filteredFacts.length} articles found`}
        </p>

        {/* Facts Display */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                </CardHeader>
                <CardContent>
                  <div className="h-24 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredFacts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters to see more content
              </p>
              <Button 
                variant="outline" 
                onClick={() => { setSelectedCategory("all"); setSelectedLevel("all"); }}
              >
                Clear filters
              </Button>
            </CardContent>
          </Card>
        ) : selectedCategory === "all" ? (
          // Grouped view when showing all categories
          <div className="space-y-12">
            {Object.entries(groupedFacts).map(([category, facts]) => {
              const CategoryIcon = getCategoryIcon(category);
              return (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-6">
                    <CategoryIcon className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground capitalize">{category}</h2>
                    <Badge variant="secondary">{facts.length}</Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {facts.map((fact) => (
                      <FactCard key={fact.id} fact={fact} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Grid view for single category
          <div className="grid md:grid-cols-2 gap-6">
            {filteredFacts.map((fact) => (
              <FactCard key={fact.id} fact={fact} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface FactCardProps {
  fact: {
    id: number;
    title: string;
    content: string;
    category: string;
    audienceLevel: string;
    source: string | null;
  };
}

function FactCard({ fact }: FactCardProps) {
  const [expanded, setExpanded] = useState(false);
  const CategoryIcon = getCategoryIcon(fact.category);
  const isLongContent = fact.content.length > 300;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <CategoryIcon className="h-4 w-4 text-primary" />
            </div>
            <Badge variant="outline" className="capitalize">
              {fact.category}
            </Badge>
          </div>
          <Badge className={`capitalize ${getLevelColor(fact.audienceLevel)}`}>
            {fact.audienceLevel === "all" ? "All Levels" : fact.audienceLevel}
          </Badge>
        </div>
        <CardTitle className="text-lg mt-3">{fact.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <p className={`text-muted-foreground flex-1 ${!expanded && isLongContent ? "line-clamp-4" : ""}`}>
          {fact.content}
        </p>
        {isLongContent && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 self-start"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Show less" : "Read more"}
          </Button>
        )}
        {fact.source && (
          <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
            Source: {fact.source}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
