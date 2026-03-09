import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Lock } from "lucide-react";
import type React from "react";
import { useState } from "react";

const ADMIN_PASSWORD = "gba@2467";

interface PasswordPromptScreenProps {
  onSuccess: () => void;
}

export default function PasswordPromptScreen({
  onSuccess,
}: PasswordPromptScreenProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Small delay for UX feedback
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem("adminAuthenticated", "true");
        onSuccess();
      } else {
        setError("Incorrect password. Please try again.");
        setPassword("");
      }
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Admin Access
          </h1>
          <p className="text-muted-foreground text-sm mt-1 text-center">
            Enter the admin password to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError("");
              }}
              placeholder="Enter admin password"
              autoFocus
              autoComplete="current-password"
              className={
                error ? "border-destructive focus-visible:ring-destructive" : ""
              }
            />
            {error && (
              <p className="text-sm text-destructive flex items-center gap-1">
                {error}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !password}
          >
            {isSubmitting ? "Verifying..." : "Access Admin Panel"}
          </Button>
        </form>

        {/* Back link */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Back to Catalog
          </a>
        </div>
      </div>
    </div>
  );
}
