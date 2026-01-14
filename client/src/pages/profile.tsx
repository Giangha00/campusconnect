import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/user-context";
import { usersApi, userAuthApi, apiClient, type UserResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, User, Mail, Lock, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type ViewMode = "profile" | "edit" | "password";

export default function Profile() {
  const { user, setUser } = useUser();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  // Get view mode from URL query params
  const getViewFromUrl = (): ViewMode => {
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get("view") as ViewMode;
    return (viewParam && ["profile", "edit", "password"].includes(viewParam)) 
      ? viewParam 
      : "profile";
  };

  const [activeTab, setActiveTab] = useState<ViewMode>(getViewFromUrl());

  // Update active tab when URL location changes (e.g., from dropdown menu)
  useEffect(() => {
    const viewFromUrl = getViewFromUrl();
    setActiveTab(viewFromUrl);
  }, [location]);

  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Store user year separately since User type from context doesn't have year
  const [userYear, setUserYear] = useState<string>("");

  // Form state for editing
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    year: "",
  });

  // Form state for password change
  const [passwordFormData, setPasswordFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load user data
  useEffect(() => {
    if (!user) {
      setLocation("/");
      return;
    }

    // Load fresh user data from API
    const loadUserData = async () => {
      try {
        const userData = await usersApi.getById(user.id);
        setEditFormData({
          name: userData.name || "",
          email: userData.email || "",
          year: userData.year || "",
        });
        setUserYear(userData.year || "");
      } catch (error) {
        console.error("Error loading user data:", error);
        // Fallback to current user data
        setEditFormData({
          name: user.name || "",
          email: user.email || "",
          year: "",
        });
        setUserYear("");
      }
    };

    loadUserData();
  }, [user, setLocation]);

  // Handle tab change - update URL query params
  const handleTabChange = (value: string) => {
    const newView = value as ViewMode;
    setActiveTab(newView);
    // Update URL without page reload
    const newUrl = `/profile?view=${newView}`;
    window.history.pushState({}, "", newUrl);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateEditForm = () => {
    if (!editFormData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Display name cannot be empty",
        variant: "destructive",
      });
      return false;
    }

    if (!editFormData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email cannot be empty",
        variant: "destructive",
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editFormData.email)) {
      toast({
        title: "Validation Error",
        description: "Invalid email format",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const validatePasswordForm = () => {
    if (!passwordFormData.oldPassword) {
      toast({
        title: "Validation Error",
        description: "Current password is required",
        variant: "destructive",
      });
      return false;
    }

    if (!passwordFormData.newPassword) {
      toast({
        title: "Validation Error",
        description: "New password is required",
        variant: "destructive",
      });
      return false;
    }

    if (passwordFormData.newPassword.length < 6) {
      toast({
        title: "Validation Error",
        description: "New password must be at least 6 characters",
        variant: "destructive",
      });
      return false;
    }

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Password confirmation does not match",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEditForm()) {
      return;
    }

    if (!user) {
      return;
    }

    setIsLoading(true);

    try {
      const updateData: any = {
        name: editFormData.name.trim(),
        email: editFormData.email.trim().toLowerCase(),
      };

      if (editFormData.year.trim()) {
        updateData.year = editFormData.year.trim();
      }

      const updatedUser = await usersApi.update(user.id, updateData);

      // Update user context (User type from context doesn't have year property)
      setUser({
        ...user,
        name: updatedUser.name,
        email: updatedUser.email,
      });

      // Update year state separately
      if (updatedUser.year) {
        setUserYear(updatedUser.year);
      }

      toast({
        title: "Update Successful",
        description: "Your personal information has been updated",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);

      let errorMessage = "Unable to update information. Please try again.";

      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      }

      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    if (!user) {
      return;
    }

    setIsLoading(true);

    try {
      // First, get user data from API to retrieve username for password verification
      // We need to call the API directly to get UserResponse which includes username
      const userResponse = await apiClient.get<UserResponse>(
        `/users/${user.id}`
      );
      const username = userResponse.data.username;

      if (!username) {
        toast({
          title: "Error",
          description: "Unable to retrieve user information. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Verify old password by attempting to login with username
      const loginResult = await userAuthApi.login(
        username,
        passwordFormData.oldPassword
      );

      if (!loginResult) {
        toast({
          title: "Password Verification Failed",
          description: "Current password is incorrect. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // If old password is correct, update to new password
      const updateData: any = {
        password: passwordFormData.newPassword,
      };

      await usersApi.update(user.id, updateData as any);

      toast({
        title: "Password Changed",
        description: "Your password has been successfully changed",
      });

      // Clear password fields
      setPasswordFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error changing password:", error);

      let errorMessage = "Unable to change password. Please try again.";

      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      }

      toast({
        title: "Password Change Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">
            Manage your personal information and account settings
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">View Profile</TabsTrigger>
            <TabsTrigger value="edit">Edit Information</TabsTrigger>
            <TabsTrigger value="password">Change Password</TabsTrigger>
          </TabsList>

          {/* View Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Your public profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4 pb-4">
                  <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold">{user.name}</h3>
                    <p className="text-muted-foreground">{user.email}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Display Name
                    </Label>
                    <p className="text-base">{user.name}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Email
                    </Label>
                    <p className="text-base">{user.email}</p>
                  </div>
                  {userYear && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Academic Year
                      </Label>
                      <p className="text-base">{userYear}</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Role
                    </Label>
                    <p className="text-base capitalize">{user.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Edit Information Tab */}
          <TabsContent value="edit" className="mt-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Edit Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal information. Email and display name will
                  be publicly visible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEditSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-name"
                      className="flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      Display Name *
                    </Label>
                    <Input
                      id="edit-name"
                      name="name"
                      type="text"
                      value={editFormData.name}
                      onChange={handleEditChange}
                      placeholder="Enter your display name"
                      required
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-email"
                      className="flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Email *
                    </Label>
                    <Input
                      id="edit-email"
                      name="email"
                      type="email"
                      value={editFormData.email}
                      onChange={handleEditChange}
                      placeholder="your.email@example.com"
                      required
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-year"
                      className="flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Academic Year
                    </Label>
                    <Input
                      id="edit-year"
                      name="year"
                      type="text"
                      value={editFormData.year}
                      onChange={handleEditChange}
                      placeholder="e.g., 2024-2025"
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter your academic year (e.g., 2024-2025)
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? "Updating..." : "Update Information"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLocation("/")}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Change Password Tab */}
          <TabsContent value="password" className="mt-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your password. You must enter your current password to
                  confirm the change.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="old-password">Current Password *</Label>
                    <div className="relative">
                      <Input
                        id="old-password"
                        name="oldPassword"
                        type={showOldPassword ? "text" : "password"}
                        value={passwordFormData.oldPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter your current password"
                        required
                        className="w-full pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                      >
                        {showOldPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password *</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordFormData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password (minimum 6 characters)"
                        required
                        className="w-full pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">
                      Confirm New Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordFormData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Re-enter new password"
                        required
                        className="w-full pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? "Changing Password..." : "Change Password"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLocation("/")}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
