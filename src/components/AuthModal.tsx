import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AuthForm } from "./AuthForm";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: "signin" | "signup";
}

export function AuthModal({ open, onOpenChange, defaultMode = "signin" }: AuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-border/80 p-6 sm:max-w-[440px] sm:p-8">
        <DialogTitle className="sr-only">Sign in to Nexora</DialogTitle>
        {/* Remount on open so the form starts in the requested mode. */}
        {open && (
          <AuthForm
            key={defaultMode}
            defaultMode={defaultMode}
            onSuccess={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
