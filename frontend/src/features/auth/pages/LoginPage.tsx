import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { loginSchema, type LoginFormData } from "@/schemas";
import { useAuth } from "@/lib/auth/AuthProvider";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  User,
} from "lucide-react";

const demoAccounts = [
  { role: "Lokeek Lokhande (Admin)", email: "admin@demo-retail.com", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { role: "Gauri Dhondge (Analyst)", email: "analyst@demo-retail.com", color: "bg-violet-50 text-violet-700 border-violet-200" },
  { role: "Ved Mahajan (Manager)", email: "manager@demo-retail.com", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
];

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      await login(data);
      navigate("/dashboard");
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const fillDemo = (email: string) => {
    setValue("email", email);
    setValue("password", "Password123!");
    setError(null);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your customer journey intelligence dashboard."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Sign in failed</p>
              <p className="mt-0.5 text-destructive/80">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Work email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              className="h-11 pl-10"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" />
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              className="h-11 pl-10 pr-10"
              {...register("password")}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" />
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            id="remember"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
          />
          <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground cursor-pointer">
            Keep me signed in for 7 days
          </Label>
        </div>

        <Button
          type="submit"
          className="h-11 w-full text-base font-medium shadow-md shadow-primary/20"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Signing in...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Sign in to dashboard
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 text-muted-foreground">Demo accounts</span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5" />
          Click to auto-fill · Password: <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">Password123!</code>
        </p>
        <div className="grid gap-2">
          {demoAccounts.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => fillDemo(account.email)}
              className={cn(
                "flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-all hover:shadow-sm",
                account.color,
              )}
            >
              <span className="flex items-center gap-2">
                <User className="h-4 w-4 opacity-60" />
                <span className="font-medium">{account.role}</span>
              </span>
              <span className="font-mono text-xs opacity-80">{account.email}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Create organization account
        </Link>
      </p>
    </AuthLayout>
  );
}
