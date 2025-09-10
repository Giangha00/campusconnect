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
import { User, LogIn, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoginDialogProps {
  children?: React.ReactNode;
}

export function LoginDialog({ children }: LoginDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [department, setDepartment] = useState("");
  const { user, setUser } = useUser();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên của bạn",
        variant: "destructive",
      });
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      role,
      department: department.trim() || undefined,
      bookmarkedEvents: [],
      registeredEvents: [],
    };

    setUser(newUser);
    setIsOpen(false);
    setName("");
    setDepartment("");
    setRole("student");

    toast({
      title: "Đăng nhập thành công",
      description: `Chào mừng ${newUser.name}!`,
    });
  };

  const handleLogout = () => {
    setUser(null);
    toast({
      title: "Đăng xuất thành công",
      description: "Hẹn gặp lại bạn!",
    });
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "student":
        return "Sinh viên";
      case "faculty":
        return "Giảng viên/Khoa";
      case "visitor":
        return "Khách truy cập";
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
          Đăng xuất
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" data-testid="button-login-trigger">
            <LogIn className="h-4 w-4 mr-2" />
            Đăng nhập
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Đăng nhập CampusConnect</DialogTitle>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Thông tin người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nhập họ và tên"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  data-testid="input-login-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Vai trò *</Label>
                <Select
                  value={role}
                  onValueChange={(value: UserRole) => setRole(value)}
                >
                  <SelectTrigger data-testid="select-login-role">
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Sinh viên</SelectItem>
                    <SelectItem value="faculty">Giảng viên/Khoa</SelectItem>
                    <SelectItem value="visitor">Khách truy cập</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {role !== "visitor" && (
                <div className="space-y-2">
                  <Label htmlFor="department">Khoa/Bộ môn</Label>
                  <Input
                    id="department"
                    type="text"
                    placeholder="Nhập khoa/bộ môn"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    data-testid="input-login-department"
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                data-testid="button-login-submit"
              >
                Đăng nhập
              </Button>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
