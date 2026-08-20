import { Link } from "react-router-dom";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll send you instructions to reset your password."
    >
      <div className="rounded-xl border bg-muted/30 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Password reset functionality will be available in a future release.
          For now, please use the demo accounts on the sign-in page.
        </p>
        <Button variant="outline" className="mt-6" asChild>
          <Link to="/login">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sign in
          </Link>
        </Button>
      </div>
    </AuthLayout>
  );
}
