import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Identify from "./pages/Identify";
import IdentifyResults from "./pages/IdentifyResults";
import BrowseBreeds from "./pages/BrowseBreeds";
import BreedDetail from "./pages/BreedDetail";
import Learn from "./pages/Learn";
import Header from "./components/Header";
import Footer from "./components/Footer";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/identify" component={Identify} />
      <Route path="/identify/results" component={IdentifyResults} />
      <Route path="/breeds" component={BrowseBreeds} />
      <Route path="/breeds/:slug" component={BreedDetail} />
      <Route path="/learn" component={Learn} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1">
              <Router />
            </main>
            <Footer />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
