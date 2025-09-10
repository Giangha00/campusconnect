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

type Mode = "login" | "register";

export function LoginDialog({ children }: LoginDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("login");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [department, setDepartment] = useState("");

  const { user, login, register, logout } = useUser();
  const { toast } = useToast();

  const resetAll = () => {
    setUsername("");
    setPassword("");
    setRegUsername("");
    setRegPassword("");
    setName("");
    setRole("student");
    setDepartment("");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ username và mật khẩu",
        variant: "destructive",
      });
      return;
    }
    const res = login(username.trim(), password);
    if (res.ok) {
      toast({ title: "Đăng nhập thành công" });
      setIsOpen(false);
      resetAll();
      setMode("login");
    } else {
      toast({
        title: "Đăng nhập thất bại",
        description: res.message,
        variant: "destructive",
      });
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername.trim() || !regPassword || !name.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ thông tin bắt buộc",
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
        title: "Đăng ký thành công",
        description: "Bạn đã được đăng nhập",
      });
      setIsOpen(false);
      resetAll();
      setMode("login");
    } else {
      toast({
        title: "Đăng ký thất bại",
        description: res.message,
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    logout();
    toast({ title: "Đăng xuất thành công", description: "Hẹn gặp lại bạn!" });
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
            Đăng nhập
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "login"
              ? "Đăng nhập CampusConnect"
              : "Đăng ký CampusConnect"}
          </DialogTitle>
        </DialogHeader>

        {mode === "login" ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin tài khoản</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Username *</Label>
                  <Input
                    id="login-username"
                    type="text"
                    placeholder="Nhập username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    data-testid="input-login-username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Mật khẩu *</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="input-login-password"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  data-testid="button-login-submit"
                >
                  Đăng nhập
                </Button>
              </form>
              <div className="mt-4 text-sm text-muted-foreground">
                Chưa có tài khoản?{" "}
                <button
                  type="button"
                  className="underline hover:text-foreground"
                  onClick={() => setMode("register")}
                  data-testid="link-switch-to-register"
                >
                  Đăng ký
                </button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin đăng ký</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-username">Username *</Label>
                  <Input
                    id="reg-username"
                    type="text"
                    placeholder="Chọn username"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    required
                    data-testid="input-register-username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Mật khẩu *</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="Tạo mật khẩu"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    data-testid="input-register-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Họ và tên *</Label>
                  <Input
                    id="reg-name"
                    type="text"
                    placeholder="Nhập họ và tên"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    data-testid="input-register-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-role">Vai trò *</Label>
                  <Select
                    value={role}
                    onValueChange={(value: UserRole) => setRole(value)}
                  >
                    <SelectTrigger data-testid="select-register-role">
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
                    <Label htmlFor="reg-department">Khoa/Bộ môn</Label>
                    <Input
                      id="reg-department"
                      type="text"
                      placeholder="Nhập khoa/bộ môn"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      data-testid="input-register-department"
                    />
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  data-testid="button-register-submit"
                >
                  Đăng ký
                </Button>
              </form>
              <div className="mt-4 text-sm text-muted-foreground">
                Đã có tài khoản?{" "}
                <button
                  type="button"
                  className="underline hover:text-foreground"
                  onClick={() => setMode("login")}
                  data-testid="link-switch-to-login"
                >
                  Đăng nhập
                </button>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}
