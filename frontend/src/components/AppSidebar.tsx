import { Calendar, Home, Users, UserCheck, Clock, MessageCircle, Mic, LogOut, User } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const adminMenuItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Patients",
    url: "/patients",
    icon: Users,
  },
  {
    title: "Doctors",
    url: "/doctors",
    icon: UserCheck,
  },
  {
    title: "Availability",
    url: "/availability",
    icon: Clock,
  },
  {
    title: "Appointments",
    url: "/appointments",
    icon: Calendar,
  },
];

const patientMenuItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "My Appointments",
    url: "/appointments",
    icon: Calendar,
  },
  {
    title: "AI Chat",
    url: "/chat",
    icon: MessageCircle,
  },
  {
    title: "Voice Notes",
    url: "/voice-note",
    icon: Mic,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = user?.role === 'admin' ? adminMenuItems : patientMenuItems;

  const handleLogout = () => {
    logout();
  };

  return (
    <Sidebar className="glass border-r border-glass-border">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-medical-primary to-medical-accent rounded-xl flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">MedFlow AI</h2>
            <p className="text-sm text-slate-400">Healthcare Management</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-300 font-medium">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={`text-slate-200 hover:bg-glass-light hover:text-white transition-all duration-200 rounded-xl ${
                      location.pathname === item.url ? 'bg-gradient-to-r from-medical-primary/20 to-medical-accent/20 text-medical-accent border-l-2 border-medical-accent' : ''
                    }`}
                  >
                    <Link to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-glass-border">
        <div className="space-y-3">
          {/* User Info */}
          <div className="flex items-center gap-3 p-3 bg-glass-light rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-r from-medical-primary to-medical-accent rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.contact}
              </p>
              <p className="text-xs text-slate-400 capitalize">
                {user?.role}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full text-slate-200 hover:bg-glass-light hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
