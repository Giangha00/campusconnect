import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@/types/event";
import { useUser } from "@/contexts/user-context";
import { User, LogIn, LogOut, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useValidation } from "@/hooks/use-validation";
import {
  validateUsername,
  validatePassword,
  validateName,
  validateDepartment,
} from "@/lib/validation";

interface LoginDialogProps {
  children?: React.ReactNode;
}

type Mode = "login" | "register";

export function LoginDialog({ children }: LoginDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("login");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [department, setDepartment] = useState("");

  const { user, login, register, logout } = useUser();
  const { toast } = useToast();
  const { errors, validate, clearError, clearAllErrors } = useValidation();

  const resetAll = () => {
    setUsername("");
    setPassword("");
    setRegUsername("");
    setRegPassword("");
    setName("");
    setRole("student");
    setDepartment("");
    setShowPassword(false);
    setShowRegPassword(false);
    clearAllErrors();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate login fields
    const isUsernameValid = validate("login-username", username, {
      required: true,
    });
    const isPasswordValid = validate("login-password", password, {
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
      toast({ title: "Login successful" });
      setIsOpen(false);
      resetAll();
      setMode("login");
    } else {
      toast({
        title: "Login failed",
        description: res.message,
        variant: "destructive",
      });
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate registration fields
    const isUsernameValid = validate("reg-username", regUsername, {
      required: true,
      minLength: 3,
      maxLength: 20,
      pattern: /^[a-zA-Z0-9_]+$/,
    });
    const isPasswordValid = validate("reg-password", regPassword, {
      required: true,
      minLength: 6,
      maxLength: 50,
    });
    const isNameValid = validate("reg-name", name, {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s]+$/,
    });
    const isDepartmentValid = department
      ? validate("reg-department", department, {
          minLength: 2,
          maxLength: 50,
          pattern: /^[a-zA-Z0-9\s\-_]+$/,
        })
      : true;

    if (
      !isUsernameValid ||
      !isPasswordValid ||
      !isNameValid ||
      !isDepartmentValid
    ) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors and try again",
        variant: "destructive",
      });
      return;
    }

    const res = register({
      username: regUsername.trim(),
      password: regPassword,
      name: name.trim(),
      role,
      department: department.trim() || undefined,
    });
    if (res.ok) {
      toast({
        title: "Registration successful",
        description: "You are now logged in",
      });
      setIsOpen(false);
      resetAll();
      setMode("login");
    } else {
      toast({
        title: "Registration failed",
        description: res.message,
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    logout();
    toast({ title: "Logout successful", description: "See you again!" });
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "student":
        return "Student";
      case "faculty":
        return "Faculty";
      case "visitor":
        return "Visitor";
    }
  };

  if (user) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 text-sm">
          <User className="h-4 w-4" />
          <span className="font-medium">{user.name}</span>
          <span className="text-muted-foreground">
            ({getRoleLabel(user.role)})
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="h-4 w-4 mr-1" />
          Logout
        </Button>
      </div>
    );
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) setMode("login");
      }}
    >
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" data-testid="button-login-trigger">
            <LogIn className="h-4 w-4 mr-2" />
            Login
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "login"
              ? "Login to CampusConnect"
              : "Register for CampusConnect"}
          </DialogTitle>
        </DialogHeader>

        {mode === "login" ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Username *</Label>
                  <Input
                    id="login-username"
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      clearError("login-username");
                    }}
                    onBlur={() =>
                      validate("login-username", username, { required: true })
                    }
                    className={errors["login-username"] ? "border-red-500" : ""}
                    required
                    data-testid="input-login-username"
                  />
                  {errors["login-username"] && (
                    <p className="text-sm text-red-500">
                      {errors["login-username"]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        clearError("login-password");
                      }}
                      onBlur={() =>
                        validate("login-password", password, { required: true })
                      }
                      className={
                        errors["login-password"] ? "border-red-500" : ""
                      }
                      required
                      data-testid="input-login-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors["login-password"] && (
                    <p className="text-sm text-red-500">
                      {errors["login-password"]}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  data-testid="button-login-submit"
                >
                  Login
                </Button>
              </form>
              <div className="mt-4 text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                  type="button"
                  className="underline hover:text-foreground"
                  onClick={() => setMode("register")}
                  data-testid="link-switch-to-register"
                >
                  Register
                </button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Registration Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-username">Username *</Label>
                  <Input
                    id="reg-username"
                    type="text"
                    placeholder="Choose a username (3-20 characters, letters, numbers, underscore only)"
                    value={regUsername}
                    onChange={(e) => {
                      setRegUsername(e.target.value);
                      clearError("reg-username");
                    }}
                    onBlur={() =>
                      validate("reg-username", regUsername, {
                        required: true,
                        minLength: 3,
                        maxLength: 20,
                        pattern: /^[a-zA-Z0-9_]+$/,
                      })
                    }
                    className={errors["reg-username"] ? "border-red-500" : ""}
                    required
                    data-testid="input-register-username"
                  />
                  {errors["reg-username"] && (
                    <p className="text-sm text-red-500">
                      {errors["reg-username"]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="reg-password"
                      type={showRegPassword ? "text" : "password"}
                      placeholder="Create a password (min 6 characters)"
                      value={regPassword}
                      onChange={(e) => {
                        setRegPassword(e.target.value);
                        clearError("reg-password");
                      }}
                      onBlur={() =>
                        validate("reg-password", regPassword, {
                          required: true,
                          minLength: 6,
                          maxLength: 50,
                        })
                      }
                      className={errors["reg-password"] ? "border-red-500" : ""}
                      required
                      data-testid="input-register-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                    >
                      {showRegPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors["reg-password"] && (
                    <p className="text-sm text-red-500">
                      {errors["reg-password"]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Full Name *</Label>
                  <Input
                    id="reg-name"
                    type="text"
                    placeholder="Enter your full name (letters and spaces only)"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      clearError("reg-name");
                    }}
                    onBlur={() =>
                      validate("reg-name", name, {
                        required: true,
                        minLength: 2,
                        maxLength: 50,
                        pattern: /^[a-zA-Z\s]+$/,
                      })
                    }
                    className={errors["reg-name"] ? "border-red-500" : ""}
                    required
                    data-testid="input-register-name"
                  />
                  {errors["reg-name"] && (
                    <p className="text-sm text-red-500">{errors["reg-name"]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-role">Role *</Label>
                  <Select
                    value={role}
                    onValueChange={(value: UserRole) => setRole(value)}
                  >
                    <SelectTrigger data-testid="select-register-role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                      <SelectItem value="visitor">Visitor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {role !== "visitor" && (
                  <div className="space-y-2">
                    <Label htmlFor="reg-department">Department</Label>
                    <Input
                      id="reg-department"
                      type="text"
                      placeholder="Enter department (optional)"
                      value={department}
                      onChange={(e) => {
                        setDepartment(e.target.value);
                        clearError("reg-department");
                      }}
                      onBlur={() =>
                        department
                          ? validate("reg-department", department, {
                              minLength: 2,
                              maxLength: 50,
                              pattern: /^[a-zA-Z0-9\s\-_]+$/,
                            })
                          : clearError("reg-department")
                      }
                      className={
                        errors["reg-department"] ? "border-red-500" : ""
                      }
                      data-testid="input-register-department"
                    />
                    {errors["reg-department"] && (
                      <p className="text-sm text-red-500">
                        {errors["reg-department"]}
                      </p>
                    )}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  data-testid="button-register-submit"
                >
                  Register
                </Button>
              </form>
              <div className="mt-4 text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  className="underline hover:text-foreground"
                  onClick={() => setMode("login")}
                  data-testid="link-switch-to-login"
                >
                  Login
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}
