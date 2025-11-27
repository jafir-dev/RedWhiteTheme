import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Coins,
  LayoutDashboard,
  Settings,
  Users,
  Gift,
  ShoppingCart,
  Package,
  FileText,
  LogOut,
  ChevronRight
} from "lucide-react";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminWheelConfig from "@/components/admin/AdminWheelConfig";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminCoupons from "@/components/admin/AdminCoupons";
import AdminLoanRequests from "@/components/admin/AdminLoanRequests";

type AdminSection = "dashboard" | "wheel" | "users" | "orders" | "products" | "coupons" | "requests";

interface AdminPageProps {
  section?: AdminSection;
}

export default function Admin({ section = "dashboard" }: AdminPageProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    if (!isLoading && user && !user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [isLoading, isAuthenticated, user, toast, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 text-center">
          <Skeleton className="h-16 w-16 rounded-full mx-auto" />
          <Skeleton className="h-8 w-48 mx-auto" />
        </div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return null;
  }

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { id: "wheel", label: "Wheel Config", icon: Settings, path: "/admin/wheel" },
    { id: "users", label: "Users", icon: Users, path: "/admin/users" },
    { id: "orders", label: "Orders", icon: ShoppingCart, path: "/admin/orders" },
    { id: "products", label: "Products", icon: Package, path: "/admin/products" },
    { id: "coupons", label: "Coupons", icon: Gift, path: "/admin/coupons" },
    { id: "requests", label: "Loan Requests", icon: FileText, path: "/admin/requests" },
  ];

  const renderContent = () => {
    switch (section) {
      case "wheel":
        return <AdminWheelConfig />;
      case "users":
        return <AdminUsers />;
      case "orders":
        return <AdminOrders />;
      case "products":
        return <AdminProducts />;
      case "coupons":
        return <AdminCoupons />;
      case "requests":
        return <AdminLoanRequests />;
      default:
        return <AdminDashboard />;
    }
  };

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b p-4">
            <Link href="/" className="flex items-center gap-2">
              <Coins className="w-6 h-6 text-primary" />
              <span className="font-display font-bold text-lg">GPT</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={section === item.id}
                        data-testid={`nav-${item.id}`}
                      >
                        <Link href={item.path}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.profileImageUrl || undefined} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {user?.firstName?.[0] || user?.email?.[0] || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.firstName || "Admin"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
              <Button variant="ghost" size="icon" asChild>
                <a href="/api/logout" data-testid="button-admin-logout">
                  <LogOut className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 p-4 border-b bg-background">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground">Home</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-foreground font-medium">
                  {menuItems.find(m => m.id === section)?.label || "Dashboard"}
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                Back to Site
              </Link>
            </Button>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
