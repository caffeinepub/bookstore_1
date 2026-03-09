import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { BookOpen, ShieldX } from "lucide-react";
import React from "react";

export default function AccessDeniedScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <ShieldX className="w-10 h-10 text-destructive" />
      </div>
      <h1 className="font-serif text-3xl font-semibold mb-3">Access Denied</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        You don't have permission to view this page. This area is restricted to
        administrators only.
      </p>
      <Button onClick={() => navigate({ to: "/" })} className="gap-2">
        <BookOpen className="w-4 h-4" />
        Back to Catalog
      </Button>
    </div>
  );
}
