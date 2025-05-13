
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  Calendar, 
  CalendarGrid, 
  CalendarCell, 
  CalendarDay, 
  CalendarMonth, 
  CalendarHeader,
  CalendarNav,
  CalendarViewSelector
} from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarIcon, Filter, CalendarPlus } from 'lucide-react';
import { mockEvents } from '@/data/mockData';
import { Event, EventType, AudienceGroup } from '@/types/events';
import EventDetailModal from '@/components/EventDetailModal';

const EventCalendar = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day' | 'list'>('month');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // Filters
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>([]);
  const [selectedAudience, setSelectedAudience] = useState<AudienceGroup[]>([]);
  
  // All event types for filtering
  const eventTypes: EventType[] = [
    'Holiday', 'Exam', 'Meeting', 'Announcement', 
    'PTA', 'Cultural Program', 'Other'
  ];
  
  // All audience groups for filtering
  const audienceGroups: AudienceGroup[] = [
    'Parents', 'Students', 'Teachers', 'Staff', 'Administrators', 'Others'
  ];
  
  const filteredEvents = mockEvents.filter(event => {
    // Filter by event type if any types are selected
    const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(event.eventType);
    
    // Filter by audience if any audience groups are selected
    const audienceMatch = selectedAudience.length === 0 || 
      selectedAudience.some(group => event.audience.groups.includes(group));
    
    return typeMatch && audienceMatch;
  });
  
  // Mock rendering of calendar cell with events
  const renderEventCell = (day: Date) => {
    const dayEvents = filteredEvents.filter(event => {
      const eventDate = new Date(event.startDateTime);
      return eventDate.getDate() === day.getDate() && 
             eventDate.getMonth() === day.getMonth() && 
             eventDate.getFullYear() === day.getFullYear();
    });
    
    if (dayEvents.length === 0) return null;
    
    return (
      <div className="mt-1 max-h-24 overflow-y-auto space-y-1">
        {dayEvents.map(event => (
          <div 
            key={event.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedEvent(event);
            }}
            className={`
              text-xs p-1 rounded cursor-pointer truncate
              ${event.status === 'draft' ? 'border border-dashed border-primary' : ''}
              ${new Date(event.startDateTime) < new Date() ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'}
            `}
          >
            {event.title}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Event Calendar</h2>
          <p className="text-muted-foreground">View and manage all school events</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <Filter className="h-4 w-4" /> 
                Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="end">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Event Type</h4>
                  <div className="space-y-2">
                    {eventTypes.map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`type-${type}`} 
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedTypes([...selectedTypes, type]);
                            } else {
                              setSelectedTypes(selectedTypes.filter(t => t !== type));
                            }
                          }}
                        />
                        <label htmlFor={`type-${type}`} className="text-sm">{type}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Audience</h4>
                  <div className="space-y-2">
                    {audienceGroups.map(group => (
                      <div key={group} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`audience-${group}`} 
                          checked={selectedAudience.includes(group)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAudience([...selectedAudience, group]);
                            } else {
                              setSelectedAudience(selectedAudience.filter(g => g !== group));
                            }
                          }}
                        />
                        <label htmlFor={`audience-${group}`} className="text-sm">{group}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button onClick={() => navigate('/create-event')}>
            <CalendarPlus className="h-4 w-4 mr-2" /> 
            Add Event
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setDate(new Date())}>
                Today
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex gap-2">
                    <CalendarIcon className="h-4 w-4" /> 
                    {format(date, 'MMMM yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex items-center">
              <Select value={view} onValueChange={(v) => setView(v as any)}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="calendar-container">
          <div className="grid grid-cols-7 gap-px bg-border">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="bg-card p-2 text-center text-sm font-medium">
                {day}
              </div>
            ))}
            
            {/* Generate calendar grid */}
            {Array.from({ length: 35 }, (_, i) => {
              const currentDate = new Date(date.getFullYear(), date.getMonth(), i - new Date(date.getFullYear(), date.getMonth(), 1).getDay() + 1);
              const isCurrentMonth = currentDate.getMonth() === date.getMonth();
              const isToday = new Date().toDateString() === currentDate.toDateString();
              
              return (
                <div 
                  key={i}
                  className={`
                    bg-card min-h-[100px] p-2 hover:bg-muted/50 transition-colors
                    ${!isCurrentMonth ? 'text-muted-foreground bg-muted/30' : ''}
                    ${isToday ? 'bg-accent/50' : ''}
                  `}
                >
                  <div className="font-medium text-sm">
                    {currentDate.getDate()}
                  </div>
                  {isCurrentMonth && renderEventCell(currentDate)}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {selectedEvent && (
        <EventDetailModal 
          event={selectedEvent} 
          isOpen={!!selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
        />
      )}
    </div>
  );
};

export default EventCalendar;
