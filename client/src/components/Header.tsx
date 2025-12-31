import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Menu, X, User, LogOut, LayoutDashboard, Warehouse, Heart, Settings } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/identify", label: "Identify Breed" },
  { href: "/breeds", label: "Browse Breeds" },
  { href: "/learn", label: "Learn" },
];

const userMenuLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/stables", label: "My Stables", icon: Warehouse },
  { href: "/saved-breeds", label: "Saved Breeds", icon: Heart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Header() {
  const [location, navigate] = useLocation();
  const { user, isAuthenticated, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">EW</span>
          </div>
          <span className="font-semibold text-xl text-foreground hidden sm:inline">
            Equine Wisdom
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant={location === link.href ? "secondary" : "ghost"}
                className="text-sm font-medium"
              >
                {link.label}
              </Button>
            </Link>
          ))}
          {isAuthenticated && (
            <Link href="/dashboard">
              <Button
                variant={location.startsWith("/dashboard") || location.startsWith("/stables") ? "secondary" : "ghost"}
                className="text-sm font-medium"
              >
                Dashboard
              </Button>
            </Link>
          )}
        </nav>

        {/* Auth & Mobile Menu */}
        <div className="flex items-center gap-2">
          {/* Auth */}
          {!loading && (
            <>
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem disabled className="text-muted-foreground font-medium">
                      {user?.name || user?.email || "User"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {userMenuLinks.map((link) => (
                      <DropdownMenuItem 
                        key={link.href} 
                        onClick={() => navigate(link.href)}
                        className="cursor-pointer"
                      >
                        <link.icon className="mr-2 h-4 w-4" />
                        {link.label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:inline-flex"
                  onClick={() => (window.location.href = getLoginUrl())}
                >
                  Sign in
                </Button>
              )}
            </>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={location === link.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
            
            {isAuthenticated && (
              <>
                <div className="border-t border-border my-2" />
                <p className="text-xs text-muted-foreground px-4 py-1">My Account</p>
                {userMenuLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <Button
                      variant={location === link.href ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <link.icon className="mr-2 h-4 w-4" />
                      {link.label}
                    </Button>
                  </Link>
                ))}
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </>
            )}
            
            {!isAuthenticated && !loading && (
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => (window.location.href = getLoginUrl())}
              >
                Sign in
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
