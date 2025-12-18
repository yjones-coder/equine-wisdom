import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">EW</span>
              </div>
              <span className="font-semibold text-lg text-foreground">Equine Wisdom</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-md">
              Helping horse owners discover, understand, and care for their equine companions 
              through natural knowledge and breed identification.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/identify" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Identify Your Horse
                </Link>
              </li>
              <li>
                <Link href="/breeds" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Browse Breeds
                </Link>
              </li>
              <li>
                <Link href="/learn" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Horse Facts
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/learn?category=care" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Care Guides
                </Link>
              </li>
              <li>
                <Link href="/learn?category=health" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Health Tips
                </Link>
              </li>
              <li>
                <Link href="/learn?category=training" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Training Basics
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Equine Wisdom. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            For educational purposes. Always consult a veterinarian for medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
