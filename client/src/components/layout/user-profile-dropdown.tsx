import { useState } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/user-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, Settings, Lock, LogOut, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function UserProfileDropdown() {
  const { user, logout } = useUser();
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) {
    return null;
  }

  const handleViewProfile = () => {
    setLocation("/profile?view=profile");
    setIsOpen(false);
  };

  const handleEditInfo = () => {
    setLocation("/profile?view=edit");
    setIsOpen(false);
  };

  const handleChangePassword = () => {
    setLocation("/profile?view=password");
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    setLocation("/");
  };

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
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-3 py-2 hover:bg-accent"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline-block font-medium text-sm">
            {user.name}
          </span>
          <ChevronDown className="h-4 w-4 hidden sm:inline-block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleViewProfile}>
          <User className="mr-2 h-4 w-4" />
          <span>View Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEditInfo}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Edit Personal Information</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleChangePassword}>
          <Lock className="mr-2 h-4 w-4" />
          <span>Change Password</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
