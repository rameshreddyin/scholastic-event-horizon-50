
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Search, CalendarPlus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/calendar':
        return 'Event Calendar';
      case '/create-event':
        return 'Create Event';
      default:
        if (location.pathname.startsWith('/event/')) {
          return 'Event Details';
        }
        return 'School Management System';
    }
  };

  return (
    <header className="border-b border-border px-4 py-3 bg-card">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold hidden md:block">{getPageTitle()}</h1>
        
        <div className="relative md:w-1/3 hidden sm:block">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            className="w-full pl-8 bg-background"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            className="hidden sm:flex"
            onClick={() => navigate('/create-event')}
          >
            <CalendarPlus className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="icon" className="rounded-full">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
