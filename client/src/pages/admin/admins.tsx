import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Users,
  UserCheck,
  UserX,
  Mail,
  Shield,
  Filter,
  Eye,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminNavbar } from "@/components/admin/admin-navbar";
import { useAdmin } from "@/contexts/admin-context";
import { adminApi, type AdminResponse } from "@/lib/api";
import { useValidation } from "@/hooks/use-validation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { SafeText, sanitizeAttribute } from "@/components/common/safe-text";

export default function AdminAdminsPage() {
  const { admin } = useAdmin();
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20;

  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminResponse | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<AdminResponse>>({});
  const [createFormData, setCreateFormData] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    role: "faculty" as "admin" | "faculty",
  });
  const {
    errors: createErrors,
    validate: validateCreate,
    clearError: clearCreateError,
    clearAllErrors,
  } = useValidation();

  const isAdmin = admin?.role === "admin";

  // Load admins from API
  useEffect(() => {
    const loadAdmins = async () => {
      try {
        setIsLoading(true);
        const apiAdmins = await adminApi.getAll();
        setAdmins(apiAdmins);
      } catch (error) {
        console.error("Error loading admins from API:", error);
        setAdmins([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAdmins();
  }, []);

  const filteredAdmins = useMemo(() => {
    return admins.filter((adminItem) => {
      const matchesSearch =
        !searchQuery ||
        adminItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adminItem.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adminItem.username.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === "all" || adminItem.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && adminItem.active === true) ||
        (statusFilter === "inactive" && adminItem.active === false);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [admins, searchQuery, roleFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalAdmins = admins.length;
    const activeAdmins = admins.filter((a) => a.active === true).length;
    const adminCount = admins.filter((a) => a.role === "admin").length;
    const facultyCount = admins.filter((a) => a.role === "faculty").length;

    return {
      totalAdmins,
      activeAdmins,
      adminCount,
      facultyCount,
    };
  }, [admins]);

  // Check if user has admin role
  if (!isAdmin) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Card className="border-red-200 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Access Denied
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                This page is restricted to Administrators only.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Pagination logic
  const indexOfLastAdmin = currentPage * usersPerPage;
  const indexOfFirstAdmin = indexOfLastAdmin - usersPerPage;
  const currentAdmins = filteredAdmins.slice(indexOfFirstAdmin, indexOfLastAdmin);
  const totalPages = Math.ceil(filteredAdmins.length / usersPerPage);

  const paginationItems = useMemo(() => {
    if (totalPages <= 1) return [];

    const pageNumbers: (number | string)[] = [];
    const siblingCount = 1;
    const totalPageNumbers = siblingCount * 2 + 5;

    if (totalPages <= totalPageNumbers) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
      return pageNumbers;
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      for (let i = 1; i <= leftItemCount; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push("...");
      pageNumbers.push(totalPages);
    } else if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      pageNumbers.push(firstPageIndex);
      pageNumbers.push("...");
      for (let i = totalPages - rightItemCount + 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else if (shouldShowLeftDots && shouldShowRightDots) {
      pageNumbers.push(firstPageIndex);
      pageNumbers.push("...");
      for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push("...");
      pageNumbers.push(lastPageIndex);
    }

    return pageNumbers;
  }, [totalPages, currentPage]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "faculty":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (active: boolean | undefined) => {
    return active === true
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200";
  };

  const handleViewAdmin = (adminItem: AdminResponse) => {
    setSelectedAdmin(adminItem);
    setViewDialogOpen(true);
  };

  const handleEditAdmin = (adminItem: AdminResponse) => {
    setSelectedAdmin(adminItem);
    setEditFormData({
      name: adminItem.name,
      email: adminItem.email,
      active: adminItem.active,
    });
    setEditDialogOpen(true);
  };

  const handleToggleStatus = async (adminItem: AdminResponse) => {
    try {
      const newActiveStatus = !adminItem.active;
      await adminApi.updateStatus(adminItem.id, newActiveStatus);

      // Refresh admins list
      const apiAdmins = await adminApi.getAll();
      setAdmins(apiAdmins);

      toast({
        title: "Status Updated",
        description: `${adminItem.name} has been ${newActiveStatus ? "activated" : "deactivated"} successfully.`,
      });
    } catch (error: any) {
      console.error("Error toggling status:", error);
      let errorMessage = "Failed to update status. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedAdmin) return;

    try {
      // Only send status, do not send role
      const updateData: any = {
        name: editFormData.name,
        email: editFormData.email,
      };

      // Map status to active
      if (editFormData.active !== undefined) {
        updateData.active = editFormData.active;
        updateData.status = editFormData.active ? "Active" : "Inactive";
      }

      const updated = await adminApi.update(selectedAdmin.id, updateData);

      // Refresh admins list
      const apiAdmins = await adminApi.getAll();
      setAdmins(apiAdmins);

      toast({
        title: "Admin Updated",
        description: "Admin information has been updated successfully.",
      });
      setEditDialogOpen(false);
      setSelectedAdmin(null);
      setEditFormData({});
    } catch (error: any) {
      console.error("Error updating admin:", error);
      let errorMessage = "Failed to update admin. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;

    try {
      // Note: Backend might not have delete endpoint, check if needed
      // await adminApi.delete(selectedAdmin.id);
      
      // For now, just show message
      toast({
        title: "Delete Not Available",
        description: "Delete functionality for admins is not available.",
        variant: "destructive",
      });
      setDeleteDialogOpen(false);
      setSelectedAdmin(null);
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete admin. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (adminItem: AdminResponse) => {
    setSelectedAdmin(adminItem);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <AdminNavbar currentPage="admins" />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="h-8 w-8 text-purple-600" />
                Admin & Faculty Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage administrator and faculty accounts. Admin has the highest privileges, 
                can manage events and users. Faculty manages events for their department. 
                Role cannot be changed after creation.
              </p>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Account
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Admin/Faculty Account</DialogTitle>
                  <DialogDescription>
                    Create a new administrator or faculty account
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="create-username">Username *</Label>
                      <Input
                        id="create-username"
                        value={createFormData.username}
                        onChange={(e) => {
                          setCreateFormData({
                            ...createFormData,
                            username: e.target.value,
                          });
                          clearCreateError("create-username");
                        }}
                        onBlur={() =>
                          validateCreate("create-username", createFormData.username, {
                            required: true,
                            minLength: 3,
                            maxLength: 50,
                          })
                        }
                        className={
                          createErrors["create-username"] ? "border-red-500" : ""
                        }
                        placeholder="Enter username"
                      />
                      {createErrors["create-username"] && (
                        <p className="text-sm text-red-500 mt-1">
                          {createErrors["create-username"]}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="create-password">Password *</Label>
                      <Input
                        id="create-password"
                        type="password"
                        value={createFormData.password}
                        onChange={(e) => {
                          setCreateFormData({
                            ...createFormData,
                            password: e.target.value,
                          });
                          clearCreateError("create-password");
                        }}
                        onBlur={() =>
                          validateCreate("create-password", createFormData.password, {
                            required: true,
                            minLength: 6,
                          })
                        }
                        className={
                          createErrors["create-password"] ? "border-red-500" : ""
                        }
                        placeholder="Enter password"
                      />
                      {createErrors["create-password"] && (
                        <p className="text-sm text-red-500 mt-1">
                          {createErrors["create-password"]}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="create-name">Full Name *</Label>
                      <Input
                        id="create-name"
                        value={createFormData.name}
                        onChange={(e) => {
                          setCreateFormData({
                            ...createFormData,
                            name: e.target.value,
                          });
                          clearCreateError("create-name");
                        }}
                        onBlur={() =>
                          validateCreate("create-name", createFormData.name, {
                            required: true,
                            minLength: 2,
                            maxLength: 100,
                          })
                        }
                        className={
                          createErrors["create-name"] ? "border-red-500" : ""
                        }
                        placeholder="Enter full name"
                      />
                      {createErrors["create-name"] && (
                        <p className="text-sm text-red-500 mt-1">
                          {createErrors["create-name"]}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="create-email">Email *</Label>
                      <Input
                        id="create-email"
                        type="email"
                        value={createFormData.email}
                        onChange={(e) => {
                          setCreateFormData({
                            ...createFormData,
                            email: e.target.value.toLowerCase().trim(),
                          });
                          clearCreateError("create-email");
                        }}
                        onBlur={() =>
                          validateCreate("create-email", createFormData.email, {
                            required: true,
                            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          })
                        }
                        className={
                          createErrors["create-email"] ? "border-red-500" : ""
                        }
                        placeholder="Enter email"
                      />
                      {createErrors["create-email"] && (
                        <p className="text-sm text-red-500 mt-1">
                          {createErrors["create-email"]}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="create-role">Role *</Label>
                      <Select
                        value={createFormData.role}
                        onValueChange={(value) =>
                          setCreateFormData({
                            ...createFormData,
                            role: value as "admin" | "faculty",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="faculty">Faculty</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCreateDialogOpen(false);
                      setCreateFormData({
                        username: "",
                        password: "",
                        name: "",
                        email: "",
                        role: "faculty",
                      });
                      clearAllErrors();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      // Validate all fields
                      const isUsernameValid = validateCreate(
                        "create-username",
                        createFormData.username,
                        { required: true, minLength: 3, maxLength: 50 }
                      );
                      const isPasswordValid = validateCreate(
                        "create-password",
                        createFormData.password,
                        { required: true, minLength: 6 }
                      );
                      const isNameValid = validateCreate(
                        "create-name",
                        createFormData.name,
                        { required: true, minLength: 2, maxLength: 100 }
                      );
                      const isEmailValid = validateCreate(
                        "create-email",
                        createFormData.email,
                        {
                          required: true,
                          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        }
                      );

                      if (
                        !isUsernameValid ||
                        !isPasswordValid ||
                        !isNameValid ||
                        !isEmailValid
                      ) {
                        toast({
                          title: "Validation Error",
                          description:
                            "Please fix all validation errors before creating the account.",
                          variant: "destructive",
                        });
                        return;
                      }

                      try {
                        await adminApi.create({
                          username: createFormData.username.trim(),
                          password: createFormData.password,
                          name: createFormData.name.trim(),
                          email: createFormData.email.trim().toLowerCase(),
                          role: createFormData.role,
                        });

                        toast({
                          title: "Account Created",
                          description: `Account "${createFormData.name}" has been created successfully.`,
                        });

                        // Reset form and close dialog
                        setCreateFormData({
                          username: "",
                          password: "",
                          name: "",
                          email: "",
                          role: "faculty",
                        });
                        clearAllErrors();
                        setCreateDialogOpen(false);

                        // Reload admins list
                        const apiAdmins = await adminApi.getAll();
                        setAdmins(apiAdmins);
                      } catch (error: any) {
                        console.error("Error creating account:", error);
                        let errorMessage =
                          "Failed to create account. Please try again.";
                        if (error.response?.data) {
                          const errorData = error.response.data;
                          if (errorData.message) {
                            errorMessage = errorData.message;
                          }
                        }
                        toast({
                          title: "Error",
                          description: errorMessage,
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    Create Account
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="cursor-pointer bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">
                    Total Accounts
                  </p>
                  <p className="text-3xl font-bold">{stats.totalAdmins}</p>
                </div>
                <Users className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">
                    Active Accounts
                  </p>
                  <p className="text-3xl font-bold">{stats.activeAdmins}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    Administrators
                  </p>
                  <p className="text-3xl font-bold">{stats.adminCount}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Faculty</p>
                  <p className="text-3xl font-bold">{stats.facultyCount}</p>
                </div>
                <Users className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Admins Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentAdmins.map((adminItem) => (
              <Card
                key={adminItem.id}
                className="hover:shadow-lg transition-shadow overflow-hidden"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold">
                          {adminItem.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <h3 className="font-semibold text-gray-900 truncate" title={adminItem.name}>
                          <SafeText>{adminItem.name}</SafeText>
                        </h3>
                        <p className="text-sm text-gray-500 truncate" title={adminItem.username}>
                          <SafeText>{adminItem.username}</SafeText>
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewAdmin(adminItem)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditAdmin(adminItem)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Account
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(adminItem)}
                            className={
                              adminItem.active
                                ? "text-orange-600"
                                : "text-green-600"
                            }
                          >
                            {adminItem.active ? (
                              <>
                                <UserX className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Role and Status Badges */}
                    <div className="flex gap-2 flex-wrap">
                      <Badge className={getRoleColor(adminItem.role)}>
                        {adminItem.role === "admin"
                          ? "Administrator"
                          : "Faculty"}
                      </Badge>
                      <Badge className={getStatusColor(adminItem.active)}>
                        {adminItem.active === true ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    {/* Admin Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 min-w-0">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate min-w-0" title={adminItem.email}>
                          <SafeText>{adminItem.email}</SafeText>
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {paginationItems.map((page, index) => {
              if (typeof page === "string") {
                return (
                  <span key={`ellipsis-${index}`} className="px-1">
                    ...
                  </span>
                );
              }
              return (
                <Button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  variant={currentPage === page ? "default" : "outline"}
                  size="icon"
                  className="h-10 w-10"
                >
                  {page}
                </Button>
              );
            })}
            <Button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* View Admin Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Account Details</DialogTitle>
            <DialogDescription>
              View detailed information about the account
            </DialogDescription>
          </DialogHeader>
          {selectedAdmin && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {selectedAdmin.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">
                    <SafeText>{selectedAdmin.name}</SafeText>
                  </h3>
                  <p className="text-gray-600">
                    <SafeText>{selectedAdmin.username}</SafeText>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Email
                  </Label>
                  <p className="text-sm">
                    <SafeText>{selectedAdmin.email}</SafeText>
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Role
                  </Label>
                  <Badge className={getRoleColor(selectedAdmin.role)}>
                    {selectedAdmin.role === "admin"
                      ? "Administrator"
                      : "Faculty"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Status
                  </Label>
                  <Badge className={getStatusColor(selectedAdmin.active)}>
                    {selectedAdmin.active === true ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {selectedAdmin.createdAt && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Created At
                    </Label>
                    <p className="text-sm">
                      {new Date(selectedAdmin.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>
              Update account information. Role cannot be changed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Input
                  id="edit-role"
                  value={
                    selectedAdmin?.role === "admin"
                      ? "Administrator"
                      : "Faculty"
                  }
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Role cannot be changed
                </p>
              </div>
              <div>
                <Label htmlFor="edit-status">Status *</Label>
                <Select
                  value={
                    editFormData.active === true
                      ? "active"
                      : editFormData.active === false
                      ? "inactive"
                      : ""
                  }
                  onValueChange={(value) =>
                    setEditFormData({
                      ...editFormData,
                      active: value === "active",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setEditFormData({});
                setSelectedAdmin(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Admin Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              account "{selectedAdmin?.name}" and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAdmin}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
