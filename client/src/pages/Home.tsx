import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Search, BookOpen, Heart, ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  const { data: popularBreeds, isLoading: breedsLoading } = trpc.breeds.popular.useQuery({ limit: 6 });
  const { data: randomFacts, isLoading: factsLoading } = trpc.facts.random.useQuery({ limit: 3 });

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Breed Identification
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Discover Your Horse's
              <span className="text-primary block">True Heritage</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Whether you're a first-time horse owner or a seasoned equestrian, 
              Equine Wisdom helps you identify breeds, understand their unique traits, 
              and provide the best care for your equine companion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/identify">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  <Search className="w-5 h-5" />
                  Identify Your Horse
                </Button>
              </Link>
              <Link href="/breeds">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                  <BookOpen className="w-5 h-5" />
                  Browse All Breeds
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our intelligent system analyzes your horse's characteristics to find the best breed matches
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 border-transparent hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <CardTitle>Describe Your Horse</CardTitle>
                <CardDescription>
                  Tell us about your horse's size, color, build, and any distinctive features
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-2 border-transparent hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <CardTitle>AI Analysis</CardTitle>
                <CardDescription>
                  Our AI compares your description against our comprehensive breed database
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-2 border-transparent hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <CardTitle>Get Results</CardTitle>
                <CardDescription>
                  Receive detailed breed matches with confidence scores and care information
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Breeds Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Popular Breeds</h2>
              <p className="text-muted-foreground">Explore some of the most beloved horse breeds</p>
            </div>
            <Link href="/breeds">
              <Button variant="ghost" className="gap-2">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          {breedsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
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
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularBreeds?.map((breed) => (
                <Link key={breed.id} href={`/breeds/${breed.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="group-hover:text-primary transition-colors">
                          {breed.name}
                        </CardTitle>
                        <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground capitalize">
                          {breed.category}
                        </span>
                      </div>
                      <CardDescription>
                        {breed.heightMin}-{breed.heightMax} hands • {breed.origin}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {breed.overview}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Horse Facts Section */}
      <section className="py-16 md:py-24 bg-accent/5">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Did You Know?</h2>
              <p className="text-muted-foreground">Fascinating facts about horses</p>
            </div>
            <Link href="/learn">
              <Button variant="ghost" className="gap-2">
                Learn More <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          {factsLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-24 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {randomFacts?.map((fact) => (
                <Card key={fact.id} className="border-l-4 border-l-accent">
                  <CardHeader>
                    <CardTitle className="text-lg">{fact.title}</CardTitle>
                    <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent w-fit capitalize">
                      {fact.category}
                    </span>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-4">
                      {fact.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <Card className="bg-primary text-primary-foreground overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="max-w-2xl mx-auto text-center">
                <Heart className="w-12 h-12 mx-auto mb-6 opacity-80" />
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Learn About Your Horse?
                </h2>
                <p className="text-lg opacity-90 mb-8">
                  Start your journey to understanding your equine companion better. 
                  Our AI-powered tool is free to use and provides instant results.
                </p>
                <Link href="/identify">
                  <Button size="lg" variant="secondary" className="gap-2">
                    <Search className="w-5 h-5" />
                    Start Identification
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
