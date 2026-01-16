import { useState, useMemo } from "react";
import { Link } from "wouter";
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
  Phone,
  Calendar,
  Building2,
  Filter,
  Download,
  Eye,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
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
import { useUsers, User } from "@/contexts/users-context";
import { Shield } from "lucide-react";
import { adminApi } from "@/lib/api";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { SafeText, sanitizeAttribute } from "@/components/common/safe-text";

export default function AdminUsersPage() {
  const { admin } = useAdmin();
  const { users, updateUser, deleteUser, createUser } = useUsers();
  const { toast } = useToast();
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});
  const [createFormData, setCreateFormData] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    department: "",
  });
  const { errors: createErrors, validate: validateCreate, clearError: clearCreateError, clearAllErrors: clearAllCreateErrors } = useValidation();

  const isAdmin = admin?.role === "admin";
  const isFaculty = admin?.role === "faculty";

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        !searchQuery ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.designation.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === "active").length;
    const facultyCount = users.filter((u) => u.role === "faculty").length;
    const studentCount = users.filter((u) => u.role === "student").length;
    const visitorCount = users.filter((u) => u.role === "visitor").length;

    return {
      totalUsers,
      activeUsers,
      facultyCount,
      studentCount,
      visitorCount,
    };
  }, [users]);

  // Check if user has admin role - must be after all hooks
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
                This page is restricted to Administrators only. Faculty members
                can only manage events.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">
                  Please contact your administrator if you believe you should
                  have access to this page.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

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
      case "faculty":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "student":
        return "bg-green-100 text-green-800 border-green-200";
      case "visitor":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200";
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };


  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      designation: user.designation,
      phone: user.phone,
      specialization: user.specialization,
      status: user.status,
      year: user.year,
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedUser) return;

    updateUser(selectedUser.id, editFormData);
    toast({
      title: "User Updated",
      description: "User information has been updated successfully.",
    });
    setEditDialogOpen(false);
    setSelectedUser(null);
    setEditFormData({});
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;

    deleteUser(selectedUser.id);
    toast({
      title: "User Deleted",
      description: "User has been deleted successfully.",
      variant: "destructive",
    });
    setDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const exportUsersCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Role",
      "Department",
      "Designation",
      "Phone",
      "Status",
      "Joined Date",
      "Last Login",
    ];
    const rows = filteredUsers.map((user) => [
      user.id,
      user.name,
      user.email,
      user.role,
      user.department,
      user.designation,
      user.phone,
      user.status,
      user.joinedDate,
      user.lastLogin,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <AdminNavbar currentPage="users" />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                User Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage campus users, roles, and permissions
              </p>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Faculty Account
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Faculty Account</DialogTitle>
                  <DialogDescription>
                    Create a new faculty account for department event management
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
                        className={createErrors["create-username"] ? "border-red-500" : ""}
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
                        className={createErrors["create-password"] ? "border-red-500" : ""}
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
                        className={createErrors["create-name"] ? "border-red-500" : ""}
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
                        className={createErrors["create-email"] ? "border-red-500" : ""}
                        placeholder="Enter email"
                      />
                      {createErrors["create-email"] && (
                        <p className="text-sm text-red-500 mt-1">
                          {createErrors["create-email"]}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="create-department">Department *</Label>
                      <Input
                        id="create-department"
                        value={createFormData.department}
                        onChange={(e) => {
                          setCreateFormData({
                            ...createFormData,
                            department: e.target.value,
                          });
                          clearCreateError("create-department");
                        }}
                        onBlur={() =>
                          validateCreate("create-department", createFormData.department, {
                            required: true,
                            minLength: 2,
                            maxLength: 100,
                          })
                        }
                        className={createErrors["create-department"] ? "border-red-500" : ""}
                        placeholder="Enter department name (e.g., English Dept.)"
                      />
                      {createErrors["create-department"] && (
                        <p className="text-sm text-red-500 mt-1">
                          {createErrors["create-department"]}
                        </p>
                      )}
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
                        department: "",
                      });
                      clearAllCreateErrors();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
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
                      const isDepartmentValid = validateCreate(
                        "create-department",
                        createFormData.department,
                        { required: true, minLength: 2, maxLength: 100 }
                      );

                      if (
                        !isUsernameValid ||
                        !isPasswordValid ||
                        !isNameValid ||
                        !isEmailValid ||
                        !isDepartmentValid
                      ) {
                        toast({
                          title: "Validation Error",
                          description:
                            "Please fix all validation errors before creating the faculty account.",
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
                          role: "faculty", // Role is "faculty" for department event managers
                        });

                        // Refresh users list by calling getAll again
                        // The context will automatically update when users list changes
                        // We can trigger a refresh by calling useUsers hook's refresh if available
                        // For now, the page will refresh on next render or user can manually refresh

                        toast({
                          title: "Faculty Account Created",
                          description: `Faculty account "${createFormData.name}" has been created successfully. The user can now log in and manage events for their department.`,
                        });

                        setCreateFormData({
                          username: "",
                          password: "",
                          name: "",
                          email: "",
                          department: "",
                        });
                        clearAllCreateErrors();
                        setCreateDialogOpen(false);
                        
                        window.location.reload();
                      } catch (error: any) {
                        console.error("Error creating faculty account:", error);
                        let errorMessage =
                          "Failed to create faculty account. Please try again.";
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
                    Create Faculty
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card
            className="cursor-pointer bg-gradient-to-br from-blue-500 to-blue-600 text-white"
            onClick={() => {
              setRoleFilter("all");
              setStatusFilter("all");
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer bg-gradient-to-br from-green-500 to-green-600 text-white"
            onClick={() => {
              setRoleFilter("all");
              setStatusFilter("active");
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">
                    Active Users
                  </p>
                  <p className="text-3xl font-bold">{stats.activeUsers}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer bg-gradient-to-br from-purple-500 to-purple-600 text-white"
            onClick={() => {
              setRoleFilter("faculty");
              setStatusFilter("all");
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Faculty</p>
                  <p className="text-3xl font-bold">{stats.facultyCount}</p>
                </div>
                <Building2 className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer bg-gradient-to-br from-orange-500 to-orange-600 text-white"
            onClick={() => {
              setRoleFilter("student");
              setStatusFilter("all");
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">
                    Students
                  </p>
                  <p className="text-3xl font-bold">{stats.studentCount}</p>
                </div>
                <Users className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer bg-gradient-to-br from-gray-500 to-gray-600 text-white"
            onClick={() => {
              setRoleFilter("visitor");
              setStatusFilter("all");
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-100 text-sm font-medium">Visitors</p>
                  <p className="text-3xl font-bold">{stats.visitorCount}</p>
                </div>
                <UserX className="h-8 w-8 text-gray-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, department..."
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
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="visitor">Visitor</SelectItem>
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

        {/* Users Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={user.avatar}
                      alt={sanitizeAttribute(user.name)}
                      className="w-12 h-12 rounded-full object-cover"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        <SafeText>{user.name}</SafeText>
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        <SafeText>{user.designation}</SafeText>
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewUser(user)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditUser(user)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(user)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Role and Status Badges */}
                  <div className="flex gap-2 flex-wrap">
                    <Badge className={getRoleColor(user.role)}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                    <Badge className={getStatusColor(user.status)}>
                      {user.status.charAt(0).toUpperCase() +
                        user.status.slice(1)}
                    </Badge>
                  </div>

                  {/* User Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">
                        <SafeText>{user.email}</SafeText>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>
                        <SafeText>{user.phone}</SafeText>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Building2 className="h-4 w-4" />
                      <span className="truncate">
                        <SafeText>{user.department}</SafeText>
                      </span>
                    </div>
                    {user.year && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{user.year}</span>
                      </div>
                    )}
                  </div>

                  {/* Specialization */}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">Specialization:</span>{" "}
                      {user.specialization}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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

      {/* View User Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View detailed information about the user
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={selectedUser.avatar}
                  alt={sanitizeAttribute(selectedUser.name)}
                  className="w-20 h-20 rounded-full object-cover"
                  loading="lazy"
                />
                <div>
                  <h3 className="text-2xl font-bold">
                    <SafeText>{selectedUser.name}</SafeText>
                  </h3>
                  <p className="text-gray-600">
                    <SafeText>{selectedUser.designation}</SafeText>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Email
                  </Label>
                  <p className="text-sm">
                    <SafeText>{selectedUser.email}</SafeText>
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Phone
                  </Label>
                  <p className="text-sm">
                    <SafeText>{selectedUser.phone}</SafeText>
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Role
                  </Label>
                  <Badge className={getRoleColor(selectedUser.role)}>
                    {selectedUser.role.charAt(0).toUpperCase() +
                      selectedUser.role.slice(1)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Status
                  </Label>
                  <Badge className={getStatusColor(selectedUser.status)}>
                    {selectedUser.status.charAt(0).toUpperCase() +
                      selectedUser.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Department
                  </Label>
                  <p className="text-sm">
                    <SafeText>{selectedUser.department}</SafeText>
                  </p>
                </div>
                {selectedUser.year && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Year
                    </Label>
                    <p className="text-sm">{selectedUser.year}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Joined Date
                  </Label>
                  <p className="text-sm">{selectedUser.joinedDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Last Login
                  </Label>
                  <p className="text-sm">
                    {new Date(selectedUser.lastLogin).toLocaleString()}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Specialization
                </Label>
                <p className="text-sm">{selectedUser.specialization}</p>
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

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information below</DialogDescription>
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
                <Label htmlFor="edit-role">Role *</Label>
                <Select
                  value={editFormData.role || ""}
                  onValueChange={(value) =>
                    setEditFormData({
                      ...editFormData,
                      role: value as "faculty" | "student" | "visitor",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="faculty">Faculty</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="visitor">Visitor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-status">Status *</Label>
                <Select
                  value={editFormData.status || ""}
                  onValueChange={(value) =>
                    setEditFormData({
                      ...editFormData,
                      status: value as "active" | "inactive",
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
              <div>
                <Label htmlFor="edit-department">Department *</Label>
                <Input
                  id="edit-department"
                  value={editFormData.department || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      department: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-designation">Designation *</Label>
                <Input
                  id="edit-designation"
                  value={editFormData.designation || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      designation: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone *</Label>
                <Input
                  id="edit-phone"
                  value={editFormData.phone || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-year">Year</Label>
                <Input
                  id="edit-year"
                  value={editFormData.year || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, year: e.target.value })
                  }
                  placeholder="Optional"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-specialization">Specialization *</Label>
              <Textarea
                id="edit-specialization"
                value={editFormData.specialization || ""}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    specialization: e.target.value,
                  })
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setEditFormData({});
                setSelectedUser(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user "{selectedUser?.name}" and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
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
