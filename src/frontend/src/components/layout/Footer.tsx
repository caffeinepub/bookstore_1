import { Link } from "@tanstack/react-router";
import { BookOpen, Heart } from "lucide-react";
import React from "react";

export default function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(
    window.location.hostname || "gopal-book-agency",
  );

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="font-serif text-lg font-semibold">
                Gopal Book Agency
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your community bookstore. Discover great books at discounted
              prices.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-base font-semibold mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/"
                  className="hover:text-foreground transition-colors"
                >
                  Book Catalog
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="hover:text-foreground transition-colors"
                >
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="hover:text-foreground transition-colors"
                >
                  My Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-serif text-base font-semibold mb-3">About</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Browse our curated collection of books with exclusive community
              discounts. Secure ordering powered by the Internet Computer.
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>© {year} Gopal Book Agency. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Built with{" "}
            <Heart className="w-3.5 h-3.5 text-destructive fill-destructive" />{" "}
            using{" "}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-foreground transition-colors underline underline-offset-2"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
