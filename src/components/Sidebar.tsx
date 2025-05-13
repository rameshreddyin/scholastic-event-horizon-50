
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Book, 
  Settings, 
  CalendarPlus 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const Sidebar = () => {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = React.useState(isMobile);

  React.useEffect(() => {
    setCollapsed(isMobile);
  }, [isMobile]);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: CalendarDays, label: 'Calendar', path: '/calendar' },
    { icon: Users, label: 'Users', path: '/users' },
    { icon: Book, label: 'Classes', path: '/classes' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div 
      className={cn(
        "shrink-0 border-r border-border bg-card transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        <div className={cn(
          "flex items-center p-4 border-b border-border",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && <h1 className="text-lg font-bold">SchoolEvents</h1>}
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? "→" : "←"}
          </Button>
        </div>
        
        <div className="flex flex-col gap-2 p-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                isActive ? "bg-accent text-accent-foreground font-medium" : "hover:bg-muted",
                collapsed && "justify-center"
              )}
            >
              <item.icon className="h-5 w-5" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </div>
        
        <div className="mt-auto p-3 border-t border-border">
          <NavLink
            to="/create-event"
            className={({ isActive }) => cn(
              "flex items-center justify-center gap-2 p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
              isActive && "bg-primary/80"
            )}
          >
            <CalendarPlus className="h-5 w-5" />
            {!collapsed && <span>Create Event</span>}
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
