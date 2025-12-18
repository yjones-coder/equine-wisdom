import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Search, Filter, ArrowRight } from "lucide-react";

const categories = [
  { value: "all", label: "All Breeds" },
  { value: "light", label: "Light Horses" },
  { value: "draft", label: "Draft Horses" },
  { value: "pony", label: "Ponies" },
  { value: "gaited", label: "Gaited Breeds" },
  { value: "warmblood", label: "Warmbloods" },
];

export default function BrowseBreeds() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: allBreeds, isLoading } = trpc.breeds.list.useQuery();
  const { data: searchResults, isLoading: searchLoading } = trpc.breeds.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  // Filter breeds based on category and search
  const filteredBreeds = (() => {
    let breeds = searchQuery ? searchResults : allBreeds;
    if (!breeds) return [];
    
    if (selectedCategory !== "all") {
      breeds = breeds.filter((b) => b.category === selectedCategory);
    }
    
    return breeds;
  })();

  const loading = isLoading || (searchQuery && searchLoading);

  return (
    <div className="py-8 md:py-16">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Browse Horse Breeds
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our comprehensive database of horse breeds from around the world
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search breeds by name or characteristics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="w-full flex-wrap h-auto gap-2 bg-transparent justify-center">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.value}
                  value={cat.value}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading..." : `${filteredBreeds.length} breeds found`}
          </p>
          {searchQuery && (
            <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")}>
              Clear search
            </Button>
          )}
        </div>

        {/* Breeds Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredBreeds.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Filter className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No breeds found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filter criteria
              </p>
              <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}>
                Clear filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBreeds.map((breed) => (
              <Link key={breed.id} href={`/breeds/${breed.slug}`}>
                <Card className="h-full hover:shadow-lg transition-all cursor-pointer group border-2 border-transparent hover:border-primary/20">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {breed.name}
                      </CardTitle>
                      <Badge variant="secondary" className="capitalize shrink-0">
                        {breed.category}
                      </Badge>
                    </div>
                    <CardDescription>
                      {breed.heightMin && breed.heightMax && (
                        <span>{breed.heightMin}-{breed.heightMax} hands</span>
                      )}
                      {breed.origin && (
                        <span> • {breed.origin}</span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {breed.overview}
                    </p>
                    
                    {/* Colors */}
                    {breed.colors && (
                      <div className="flex flex-wrap gap-1">
                        {(breed.colors as string[]).slice(0, 4).map((color, i) => (
                          <Badge key={i} variant="outline" className="text-xs capitalize">
                            {color}
                          </Badge>
                        ))}
                        {(breed.colors as string[]).length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{(breed.colors as string[]).length - 4} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center text-sm text-primary font-medium group-hover:gap-2 transition-all">
                      Learn more <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Category Descriptions */}
        {selectedCategory !== "all" && !searchQuery && (
          <Card className="mt-12 bg-muted/50">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-2">
                About {categories.find(c => c.value === selectedCategory)?.label}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedCategory === "light" && "Light horses are typically 14.2 hands or taller and weigh between 900-1,500 pounds. They are bred for riding, racing, and various equestrian sports."}
                {selectedCategory === "draft" && "Draft horses are the largest and strongest breeds, typically 16-19 hands tall and weighing 1,500-2,200+ pounds. They were bred for heavy farm and industrial work."}
                {selectedCategory === "pony" && "Ponies are horses under 14.2 hands tall. Despite their small size, they are often stronger pound-for-pound than larger horses and are popular for children and driving."}
                {selectedCategory === "gaited" && "Gaited horses have unique, smooth four-beat gaits that provide an exceptionally comfortable ride. These natural gaits are inherited and don't require special training."}
                {selectedCategory === "warmblood" && "Warmbloods are athletic sport horses that combine the spirit of 'hot-blooded' breeds like Thoroughbreds with the calm temperament of 'cold-blooded' draft breeds."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
