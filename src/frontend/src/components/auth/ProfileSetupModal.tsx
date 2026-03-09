import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Loader2 } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useSaveCallerUserProfile } from "../../hooks/useQueries";

interface ProfileSetupModalProps {
  open: boolean;
}

export default function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [errors, setErrors] = useState<{ name?: string; contact?: string }>({});

  const saveProfile = useSaveCallerUserProfile();

  const validate = () => {
    const newErrors: { name?: string; contact?: string } = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!contact.trim()) newErrors.contact = "Contact is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await saveProfile.mutateAsync({
      name: name.trim(),
      contact: contact.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="font-serif text-2xl">
              Welcome to BookStore!
            </DialogTitle>
          </div>
          <DialogDescription>
            Please set up your profile to start browsing and ordering books.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              placeholder="e.g. Jane Austen"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact">Contact (email or phone)</Label>
            <Input
              id="contact"
              placeholder="e.g. jane@example.com"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className={errors.contact ? "border-destructive" : ""}
            />
            {errors.contact && (
              <p className="text-xs text-destructive">{errors.contact}</p>
            )}
          </div>

          {saveProfile.isError && (
            <p className="text-sm text-destructive">
              Failed to save profile. Please try again.
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={saveProfile.isPending}
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Complete Setup"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
