import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdmin } from "@/contexts/admin-context";
import { LogIn, Eye, EyeOff, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useValidation } from "@/hooks/use-validation";

export default function AdminLoginPage() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { admin, login } = useAdmin();
  const { toast } = useToast();
  const { errors, validate, clearError } = useValidation();

  // Redirect if already logged in as admin
  if (admin) {
    setLocation("/admin/dashboard");
    return null;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate login fields
    const isUsernameValid = validate("username", username, {
      required: true,
    });
    const isPasswordValid = validate("password", password, {
      required: true,
    });

    if (!isUsernameValid || !isPasswordValid) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors and try again",
        variant: "destructive",
      });
      return;
    }

    const res = login(username.trim(), password);
    if (res.ok) {
      toast({
        title: "Login successful",
        description: "Welcome to Admin Dashboard!",
      });
      setLocation("/admin/dashboard");
    } else {
      toast({
        title: "Login failed",
        description: res.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: "url('/images/schools/School_7.jpg')",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Login Card */}
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Admin Login
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Access the CampusConnect admin panel
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-sm font-medium text-gray-700"
                >
                  Username *
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    clearError("username");
                  }}
                  onBlur={() =>
                    validate("username", username, { required: true })
                  }
                  className={errors["username"] ? "border-red-500" : ""}
                  required
                  data-testid="input-admin-username"
                />
                {errors["username"] && (
                  <p className="text-sm text-red-500">{errors["username"]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearError("password");
                    }}
                    onBlur={() =>
                      validate("password", password, { required: true })
                    }
                    className={
                      errors["password"] ? "border-red-500 pr-10" : "pr-10"
                    }
                    required
                    data-testid="input-admin-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {errors["password"] && (
                  <p className="text-sm text-red-500">{errors["password"]}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5"
                data-testid="button-admin-login"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login to Admin Panel
              </Button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">
                    Admin Access Only
                  </h4>
                  <p className="text-xs text-blue-700">
                    This admin panel is restricted to authorized administrators
                    only. If you believe you should have access, please contact
                    your system administrator.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">CampusConnect Admin Panel</p>
              <p className="text-xs text-gray-400 mt-1">
                Secure access for authorized personnel only
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
