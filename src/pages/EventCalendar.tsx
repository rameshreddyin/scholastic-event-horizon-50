
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfWeek, endOfWeek, startOfDay, endOfDay, eachDayOfInterval, addDays, isSameMonth, isSameDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
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
import { Calendar as CalendarIcon, Filter, CalendarPlus, List, ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Navigation functions
  const navigatePrevious = () => {
    const newDate = new Date(date);
    switch (view) {
      case 'month':
        newDate.setMonth(date.getMonth() - 1);
        break;
      case 'week':
        newDate.setDate(date.getDate() - 7);
        break;
      case 'day':
        newDate.setDate(date.getDate() - 1);
        break;
      default:
        break;
    }
    setDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(date);
    switch (view) {
      case 'month':
        newDate.setMonth(date.getMonth() + 1);
        break;
      case 'week':
        newDate.setDate(date.getDate() + 7);
        break;
      case 'day':
        newDate.setDate(date.getDate() + 1);
        break;
      default:
        break;
    }
    setDate(newDate);
  };

  // Get events for the current view
  const getEventsForView = useMemo(() => {
    let start, end, events;
    
    switch (view) {
      case 'week':
        start = startOfWeek(date);
        end = endOfWeek(date);
        events = filteredEvents.filter(event => {
          const eventDate = new Date(event.startDateTime);
          return eventDate >= start && eventDate <= end;
        });
        break;
      case 'day':
        start = startOfDay(date);
        end = endOfDay(date);
        events = filteredEvents.filter(event => {
          const eventDate = new Date(event.startDateTime);
          return isSameDay(eventDate, date);
        });
        break;
      case 'list':
        // For list view, show all events sorted by date
        events = [...filteredEvents].sort((a, b) => 
          new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
        );
        break;
      default:
        // Month view - handled separately in the render
        events = filteredEvents;
    }
    
    return events;
  }, [filteredEvents, view, date]);
  
  // Render event card function used in multiple views
  const renderEventCard = (event: Event) => {
    return (
      <div 
        key={event.id}
        onClick={() => setSelectedEvent(event)}
        className={`
          p-2 mb-1 rounded cursor-pointer text-sm
          ${event.status === 'draft' ? 'border border-dashed border-primary' : ''}
          ${new Date(event.startDateTime) < new Date() ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'}
        `}
      >
        <div className="font-medium truncate">{event.title}</div>
        <div className="text-xs">
          {format(new Date(event.startDateTime), 'h:mm a')}
          {!event.isAllDay && ` - ${format(new Date(event.endDateTime), 'h:mm a')}`}
        </div>
      </div>
    );
  };
  
  // Render day cell for month view
  const renderDayCell = (day: Date) => {
    const dayEvents = filteredEvents.filter(event => {
      const eventDate = new Date(event.startDateTime);
      return isSameDay(eventDate, day);
    });
    
    const isCurrentMonth = isSameMonth(day, date);
    const isToday = isSameDay(new Date(), day);
    
    return (
      <div 
        key={day.toString()}
        className={`
          bg-card min-h-[100px] p-2 hover:bg-muted/50 transition-colors
          ${!isCurrentMonth ? 'text-muted-foreground bg-muted/30' : ''}
          ${isToday ? 'bg-accent/50' : ''}
        `}
      >
        <div className="font-medium text-sm">
          {day.getDate()}
        </div>
        {isCurrentMonth && dayEvents.length > 0 && (
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
        )}
      </div>
    );
  };
  
  // Render week view
  const renderWeekView = () => {
    const startDate = startOfWeek(date);
    const weekDays = eachDayOfInterval({
      start: startDate,
      end: endOfWeek(date)
    });
    
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-px bg-border">
          {weekDays.map((day) => (
            <div key={day.toString()} className="bg-card p-2 text-center text-sm font-medium">
              <div>{format(day, 'EEE')}</div>
              <div className={`rounded-full w-8 h-8 flex items-center justify-center mx-auto ${isSameDay(day, new Date()) ? 'bg-accent text-accent-foreground' : ''}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-px bg-border">
          {weekDays.map((day) => {
            const dayEvents = filteredEvents.filter(event => {
              const eventDate = new Date(event.startDateTime);
              return isSameDay(eventDate, day);
            });
            
            return (
              <div key={day.toString()} className="bg-card min-h-[200px] p-2">
                {dayEvents.map(renderEventCard)}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Render day view
  const renderDayView = () => {
    const dayEvents = getEventsForView;
    
    return (
      <div className="space-y-4">
        <div className="text-center p-4">
          <h3 className="text-xl font-semibold">{format(date, 'EEEE, MMMM d, yyyy')}</h3>
        </div>
        
        <div className="bg-card p-4 rounded-md min-h-[400px]">
          {dayEvents.length > 0 ? (
            <div className="space-y-2">
              {dayEvents.map(event => (
                <div 
                  key={event.id}
                  className="flex p-3 border-l-4 border-primary hover:bg-muted/50 rounded-r cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex-1">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(event.startDateTime), 'h:mm a')} - {format(new Date(event.endDateTime), 'h:mm a')}
                    </div>
                    <div className="text-sm mt-1 line-clamp-2">{event.description}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No events scheduled for this day
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render list view
  const renderListView = () => {
    const events = getEventsForView;
    
    // Group events by date
    const eventsByDate: Record<string, Event[]> = {};
    events.forEach(event => {
      const dateKey = format(new Date(event.startDateTime), 'yyyy-MM-dd');
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }
      eventsByDate[dateKey].push(event);
    });
    
    return (
      <div className="space-y-6">
        {Object.keys(eventsByDate).length > 0 ? (
          Object.keys(eventsByDate).map(dateKey => {
            const eventsForDate = eventsByDate[dateKey];
            const dateObj = new Date(dateKey);
            
            return (
              <div key={dateKey} className="space-y-2">
                <div className="sticky top-0 bg-background p-2 font-medium text-sm flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isSameDay(dateObj, new Date()) ? 'bg-primary' : 'bg-muted-foreground'}`}></div>
                  {format(dateObj, 'EEEE, MMMM d, yyyy')}
                </div>
                
                <div className="bg-card rounded-md overflow-hidden">
                  {eventsForDate.map(event => (
                    <div 
                      key={event.id}
                      className="p-3 border-b hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(event.startDateTime), 'h:mm a')}
                        {!event.isAllDay && ` - ${format(new Date(event.endDateTime), 'h:mm a')}`}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-muted rounded-full">{event.eventType}</span>
                        {event.audience.isEveryone ? (
                          <span className="text-xs">For everyone</span>
                        ) : (
                          <span className="text-xs">{event.audience.groups.join(', ')}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            No events found matching your filters
          </div>
        )}
      </div>
    );
  };
  
  // Render month view (grid calendar)
  const renderMonthView = () => {
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const daysArray = Array.from({ length: 42 }, (_, i) => {
      const day = i - firstDayOfMonth + 1;
      return new Date(date.getFullYear(), date.getMonth(), day);
    });
    
    return (
      <div className="grid grid-cols-7 gap-px bg-border">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
          <div key={dayName} className="bg-card p-2 text-center text-sm font-medium">
            {dayName}
          </div>
        ))}
        
        {daysArray.map(renderDayCell)}
      </div>
    );
  };
  
  // Render different views based on the selected view
  const renderView = () => {
    switch (view) {
      case 'week':
        return renderWeekView();
      case 'day':
        return renderDayView();
      case 'list':
        return renderListView();
      default:
        return renderMonthView();
    }
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
              
              <div className="flex items-center">
                <Button variant="ghost" size="icon" onClick={navigatePrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex gap-2">
                      <CalendarIcon className="h-4 w-4" /> 
                      {view === 'month' && format(date, 'MMMM yyyy')}
                      {view === 'week' && `Week of ${format(startOfWeek(date), 'MMM d')} - ${format(endOfWeek(date), 'MMM d')}`}
                      {view === 'day' && format(date, 'MMMM d, yyyy')}
                      {view === 'list' && 'All Events'}
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
                
                <Button variant="ghost" size="icon" onClick={navigateNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
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
          {renderView()}
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
