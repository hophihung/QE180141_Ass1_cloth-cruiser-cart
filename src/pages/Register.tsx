import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { register: registerUser, user, loading } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const redirectTo = (location.state as { from?: string })?.from || "/admin";
    navigate(redirectTo, { replace: true });
  }, [location.state, navigate, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure the passwords are identical.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await registerUser({ email: form.email, password: form.password });
      toast({
        title: "Account created",
        description: "Your account is ready. We've signed you in automatically.",
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error?.message || "Please try again with different credentials",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled = submitting || loading;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Create your account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  required
                  disabled={isDisabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  required
                  disabled={isDisabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat password"
                  value={form.confirmPassword}
                  onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                  required
                  disabled={isDisabled}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isDisabled}>
                {(submitting || loading) ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 text-sm text-muted-foreground">
            <div className="text-center">
              Already have an account? {" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in instead
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
