
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, CalendarPlus, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Mock data
  const upcomingEvents = [
    { id: '1', title: 'Parent-Teacher Meeting', date: '2025-05-20', time: '14:00', type: 'Meeting' },
    { id: '2', title: 'Annual Sports Day', date: '2025-05-25', time: '09:00', type: 'Cultural Program' },
    { id: '3', title: 'Final Exams', date: '2025-06-05', time: 'All Day', type: 'Exam' },
  ];
  
  const stats = [
    { title: 'Total Events', value: '24', icon: CalendarDays },
    { title: 'Events This Month', value: '8', icon: CalendarDays },
    { title: 'Upcoming Events', value: '3', icon: Clock },
    { title: 'Total Audience', value: '450+', icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold">Welcome to School Events</h2>
        <Button onClick={() => navigate('/create-event')} className="sm:w-auto w-full">
          <CalendarPlus className="mr-2 h-4 w-4" /> Create Event
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4 sm:grid-cols-2">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className="h-12 w-12 bg-secondary flex items-center justify-center rounded-full">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Upcoming Events</span>
            <Button variant="outline" size="sm" onClick={() => navigate('/calendar')}>
              View Calendar
            </Button>
          </CardTitle>
          <CardDescription>Events scheduled in the near future</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div 
                key={event.id} 
                onClick={() => navigate(`/event/${event.id}`)}
                className="flex justify-between items-center p-3 border border-border rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div>
                  <h4 className="font-medium">{event.title}</h4>
                  <div className="flex gap-2 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <CalendarDays className="h-3 w-3 mr-1" /> 
                      {event.date}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" /> 
                      {event.time}
                    </span>
                  </div>
                </div>
                <div className="bg-secondary px-2 py-1 rounded text-xs">
                  {event.type}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
