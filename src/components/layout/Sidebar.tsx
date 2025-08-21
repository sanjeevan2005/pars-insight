import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Package, 
  Upload, 
  BarChart3, 
  User, 
  Settings, 
  Menu,
  X,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  userRole?: 'admin' | 'user';
}

const Sidebar = ({ userRole = 'user' }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { 
      icon: Package, 
      label: "Dashboard", 
      path: "/dashboard",
      description: "View all packages"
    },
    { 
      icon: Upload, 
      label: "Upload", 
      path: "/upload",
      description: "Upload shipping documents"
    },
    { 
      icon: BarChart3, 
      label: "Analytics", 
      path: "/analytics",
      description: "View shipping analytics"
    },
    { 
      icon: User, 
      label: "Profile", 
      path: "/profile",
      description: "Manage your account"
    },
  ];

  if (userRole === 'admin') {
    navigationItems.push({
      icon: ShieldCheck,
      label: "Admin Panel",
      path: "/admin",
      description: "Manage users"
    });
  }

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-card border-r border-border transition-all duration-300 lg:relative lg:translate-x-0",
          isCollapsed ? "-translate-x-full lg:w-16" : "w-72 lg:w-64",
          "shadow-medium"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 logistics-gradient rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">PARS</h1>
                <p className="text-xs text-muted-foreground">Package Analysis</p>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="lg:hidden"
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth group relative",
                  "hover:bg-muted hover:shadow-soft",
                  isActive && "logistics-gradient text-white shadow-medium",
                  isCollapsed && "justify-center"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                )} />
                
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate",
                      isActive ? "text-white" : "text-foreground"
                    )}>
                      {item.label}
                    </p>
                    <p className={cn(
                      "text-xs truncate mt-0.5",
                      isActive ? "text-white/80" : "text-muted-foreground"
                    )}>
                      {item.description}
                    </p>
                  </div>
                )}
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-card border border-border rounded-md shadow-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User info (when expanded) */}
        {!isCollapsed && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-subtle">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">John Doe</p>
                <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;