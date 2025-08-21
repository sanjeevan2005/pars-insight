import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
  userRole?: 'admin' | 'user';
}

const Layout = ({ children, userRole = 'user' }: LayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar userRole={userRole} />
      
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <Header 
          onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          showMenuButton={true}
        />
        
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;