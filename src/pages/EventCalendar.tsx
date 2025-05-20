
import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfWeek, endOfWeek, startOfDay, endOfDay, eachDayOfInterval, addDays, isSameMonth, isSameDay, startOfYear, endOfYear } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { 
  Calendar as CalendarIcon, 
  Filter, 
  CalendarPlus, 
  ChevronLeft, 
  ChevronRight,
  Printer,
  Share,
  FileText,
  ListOrdered
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockEvents } from '@/data/mockData';
import { Event, EventType, AudienceGroup } from '@/types/events';
import EventDetailModal from '@/components/EventDetailModal';
import { toast } from '@/hooks/use-toast';
import PrintableCalendar from '@/components/PrintableCalendar';

const EventCalendar = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day' | 'list' | 'year'>('month');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const printableCalendarRef = useRef<HTMLDivElement>(null);
  
  // Filters
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>([]);
  const [selectedAudience, setSelectedAudience] = useState<AudienceGroup[]>([]);
  const [excludedTypes, setExcludedTypes] = useState<EventType[]>([]);
  
  // All event types for filtering
  const eventTypes: EventType[] = [
    'Holiday', 'Exam', 'Meeting', 'Announcement', 
    'PTA', 'Cultural Program', 'Academic', 'Other'
  ];
  
  // All audience groups for filtering
  const audienceGroups: AudienceGroup[] = [
    'Parents', 'Students', 'Teachers', 'Staff', 'Administrators', 'Others'
  ];
  
  const filteredEvents = mockEvents.filter(event => {
    // Filter by event type if any types are selected
    const typeMatch = selectedTypes.length === 0 || selectedTypes.includes(event.eventType);
    
    // Exclude event types if any are selected to be excluded
    const notExcluded = !excludedTypes.includes(event.eventType);
    
    // Filter by audience if any audience groups are selected
    const audienceMatch = selectedAudience.length === 0 || 
      selectedAudience.some(group => event.audience.groups.includes(group));
    
    return typeMatch && audienceMatch && notExcluded;
  });

  // Print calendar functionality
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Academic Calendar</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                color: #333;
              }
              .calendar-header {
                text-align: center;
                margin-bottom: 20px;
              }
              .calendar-header h1 {
                margin-bottom: 5px;
                color: #4a5568;
              }
              .month-name {
                font-size: 18px;
                margin-bottom: 10px;
                color: #2d3748;
              }
              .calendar-grid {
                width: 100%;
                border-collapse: collapse;
              }
              .calendar-grid th {
                background-color: #f7fafc;
                padding: 10px;
                border: 1px solid #e2e8f0;
                text-align: center;
              }
              .calendar-grid td {
                height: 100px;
                width: 14.28%;
                vertical-align: top;
                border: 1px solid #e2e8f0;
                padding: 5px;
              }
              .today {
                background-color: #ebf8ff;
              }
              .other-month {
                color: #a0aec0;
                background-color: #f7fafc;
              }
              .date-number {
                font-weight: bold;
                margin-bottom: 5px;
              }
              .event {
                margin-bottom: 5px;
                padding: 3px 5px;
                border-radius: 3px;
                font-size: 12px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
              .academic { background-color: #c6f6d5; }
              .holiday { background-color: #fed7d7; }
              .exam { background-color: #feebc8; }
              .meeting { background-color: #e9d8fd; }
              .announcement { background-color: #bee3f8; }
              .pta { background-color: #fbd38d; }
              .cultural { background-color: #b2f5ea; }
              .other { background-color: #e2e8f0; }
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
              .legend {
                margin-top: 20px;
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
              }
              .legend-item {
                display: flex;
                align-items: center;
                margin-right: 15px;
              }
              .legend-color {
                width: 15px;
                height: 15px;
                border-radius: 3px;
                margin-right: 5px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              th, td {
                border: 1px solid #e2e8f0;
                padding: 8px 12px;
                text-align: left;
              }
              th {
                background-color: #f7fafc;
                font-weight: bold;
              }
              .month-section {
                margin-bottom: 30px;
                page-break-inside: avoid;
              }
              .month-section h3 {
                color: #2d3748;
                border-bottom: 2px solid #e2e8f0;
                padding-bottom: 5px;
                margin-bottom: 10px;
              }
              .yearly-view {
                margin-top: 30px;
              }
            </style>
          </head>
          <body>
            <div id="printable-content"></div>
          </body>
        </html>
      `);
      
      // Render the content based on current view
      const ReactDOMServer = {
        renderToString: (component) => {
          if (view === 'year') {
            return renderYearlyPrintView();
          } else {
            return renderMonthlyPrintView();
          }
        }
      };
      
      // Use this to append the content
      printWindow.document.getElementById('printable-content').innerHTML = 
        view === 'year' ? renderYearlyPrintView() : renderMonthlyPrintView();
      
      printWindow.document.close();
      
      // Wait for resources to load then print
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } else {
      toast({
        title: "Error",
        description: "Unable to open print window. Please check your browser settings.",
        variant: "destructive",
      });
    }
  };
  
  // Render monthly printable calendar HTML
  const renderMonthlyPrintView = () => {
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const daysArray = Array.from({ length: 42 }, (_, i) => {
      const day = i - firstDayOfMonth + 1;
      return new Date(date.getFullYear(), date.getMonth(), day);
    });
    
    let calendarHTML = `
      <div class="calendar-header">
        <h1>Academic Calendar</h1>
        <p class="month-name">${format(date, 'MMMM yyyy')}</p>
      </div>

      <table class="calendar-grid">
        <thead>
          <tr>
            <th>Sunday</th>
            <th>Monday</th>
            <th>Tuesday</th>
            <th>Wednesday</th>
            <th>Thursday</th>
            <th>Friday</th>
            <th>Saturday</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    // Create rows for each week
    for (let i = 0; i < 6; i++) {
      calendarHTML += '<tr>';
      
      // Create 7 days for each row
      for (let j = 0; j < 7; j++) {
        const dayIndex = i * 7 + j;
        const currentDay = daysArray[dayIndex];
        const isCurrentMonth = isSameMonth(currentDay, date);
        const isToday = isSameDay(currentDay, new Date());
        
        // Get events for this day
        const dayEvents = filteredEvents.filter(event => 
          isSameDay(new Date(event.startDateTime), currentDay)
        );
        
        calendarHTML += `
          <td class="${isToday ? 'today' : ''} ${!isCurrentMonth ? 'other-month' : ''}">
            <div class="date-number">${currentDay.getDate()}</div>
            ${dayEvents.map(event => {
              const eventTypeClass = event.eventType.toLowerCase().replace(/\s+/g, '-');
              return `<div class="event ${eventTypeClass === 'cultural-program' ? 'cultural' : eventTypeClass}">${event.title}</div>`;
            }).join('')}
          </td>
        `;
      }
      
      calendarHTML += '</tr>';
    }
    
    calendarHTML += `
        </tbody>
      </table>

      <div class="legend">
        <div class="legend-item">
          <div class="legend-color academic"></div>
          <span>Academic</span>
        </div>
        <div class="legend-item">
          <div class="legend-color holiday"></div>
          <span>Holiday</span>
        </div>
        <div class="legend-item">
          <div class="legend-color exam"></div>
          <span>Exam</span>
        </div>
        <div class="legend-item">
          <div class="legend-color meeting"></div>
          <span>Meeting</span>
        </div>
        <div class="legend-item">
          <div class="legend-color announcement"></div>
          <span>Announcement</span>
        </div>
        <div class="legend-item">
          <div class="legend-color pta"></div>
          <span>PTA</span>
        </div>
        <div class="legend-item">
          <div class="legend-color cultural"></div>
          <span>Cultural Program</span>
        </div>
        <div class="legend-item">
          <div class="legend-color other"></div>
          <span>Other</span>
        </div>
      </div>
    `;
    
    return calendarHTML;
  };
  
  // Render yearly printable calendar HTML
  const renderYearlyPrintView = () => {
    const year = date.getFullYear();
    const startDate = startOfYear(date);
    const endDate = endOfYear(date);
    
    // Get all months in the year
    const months = [];
    for (let i = 0; i < 12; i++) {
      months.push(new Date(year, i, 1));
    }
    
    // Group events by month then by date for the whole year
    const eventsByMonth = {};
    
    months.forEach(month => {
      const monthKey = format(month, 'yyyy-MM');
      eventsByMonth[monthKey] = {};
    });
    
    filteredEvents.forEach(event => {
      const eventDate = new Date(event.startDateTime);
      if (eventDate.getFullYear() === year) {
        const monthKey = format(eventDate, 'yyyy-MM');
        const dateKey = format(eventDate, 'yyyy-MM-dd');
        
        if (!eventsByMonth[monthKey]) {
          eventsByMonth[monthKey] = {};
        }
        
        if (!eventsByMonth[monthKey][dateKey]) {
          eventsByMonth[monthKey][dateKey] = [];
        }
        
        eventsByMonth[monthKey][dateKey].push(event);
      }
    });
    
    let yearlyHTML = `
      <div class="calendar-header">
        <h1>Academic Calendar - Yearly View</h1>
        <p class="month-name">${year}</p>
      </div>
    `;
    
    // For each month
    months.forEach(month => {
      const monthKey = format(month, 'yyyy-MM');
      const monthEvents = eventsByMonth[monthKey];
      const monthName = format(month, 'MMMM');
      const hasEvents = Object.keys(monthEvents).length > 0;
      
      yearlyHTML += `
        <div class="month-section">
          <h3>${monthName}</h3>
      `;
      
      if (hasEvents) {
        yearlyHTML += `
          <table>
            <thead>
              <tr>
                <th width="16%">Date</th>
                <th width="33%">Event</th>
                <th width="16%">Time</th>
                <th width="16%">Type</th>
                <th width="16%">Location</th>
              </tr>
            </thead>
            <tbody>
        `;
        
        // Sort dates within the month
        const sortedDates = Object.keys(monthEvents).sort();
        
        sortedDates.forEach(dateKey => {
          const eventsForDate = monthEvents[dateKey];
          const dateObj = new Date(dateKey);
          
          eventsForDate.forEach((event, index) => {
            const formattedDate = format(dateObj, 'd MMM, yyyy');
            const eventTypeClass = event.eventType.toLowerCase().replace(/\s+/g, '-');
            
            yearlyHTML += '<tr>';
            
            // Only show date on the first event of the day
            if (index === 0) {
              yearlyHTML += `<td rowspan="${eventsForDate.length}">${formattedDate}</td>`;
            }
            
            yearlyHTML += `
              <td>${event.title}</td>
              <td>${event.isAllDay ? 'All day' : `${format(new Date(event.startDateTime), 'h:mm a')} - ${format(new Date(event.endDateTime), 'h:mm a')}`}</td>
              <td><span class="${eventTypeClass}">${event.eventType}</span></td>
              <td>${event.location || 'N/A'}</td>
            </tr>
            `;
          });
        });
        
        yearlyHTML += `
            </tbody>
          </table>
        `;
      } else {
        yearlyHTML += `
          <div style="text-align: center; padding: 15px; color: #666; border: 1px solid #ddd; border-radius: 4px;">
            No events scheduled for this month
          </div>
        `;
      }
      
      yearlyHTML += '</div>';
    });
    
    // Add legend
    yearlyHTML += `
      <div class="legend">
        <h3>Event Types</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
          <div class="legend-item">
            <div class="legend-color academic"></div>
            <span>Academic</span>
          </div>
          <div class="legend-item">
            <div class="legend-color holiday"></div>
            <span>Holiday</span>
          </div>
          <div class="legend-item">
            <div class="legend-color exam"></div>
            <span>Exam</span>
          </div>
          <div class="legend-item">
            <div class="legend-color meeting"></div>
            <span>Meeting</span>
          </div>
          <div class="legend-item">
            <div class="legend-color announcement"></div>
            <span>Announcement</span>
          </div>
          <div class="legend-item">
            <div class="legend-color pta"></div>
            <span>PTA</span>
          </div>
          <div class="legend-item">
            <div class="legend-color cultural"></div>
            <span>Cultural Program</span>
          </div>
          <div class="legend-item">
            <div class="legend-color other"></div>
            <span>Other</span>
          </div>
        </div>
      </div>
    `;
    
    return yearlyHTML;
  };

  // Share calendar functionality
  const handleShare = async () => {
    const calendarTitle = "Academic Calendar";
    const calendarDescription = `${calendarTitle} - ${format(date, 'MMMM yyyy')}`;
    
    // Generate a text representation of events
    let eventText = `${calendarTitle} - ${view === 'year' ? date.getFullYear() : format(date, 'MMMM yyyy')}\n\n`;
    
    // Group events by date
    const eventsByDate: Record<string, Event[]> = {};
    filteredEvents.forEach(event => {
      const dateKey = format(new Date(event.startDateTime), 'yyyy-MM-dd');
      if (!eventsByDate[dateKey]) {
        eventsByDate[dateKey] = [];
      }
      eventsByDate[dateKey].push(event);
    });
    
    // Build text content from grouped events
    Object.keys(eventsByDate).sort().forEach(dateKey => {
      const dateObj = new Date(dateKey);
      eventText += `${format(dateObj, 'EEEE, MMMM d, yyyy')}\n`;
      
      eventsByDate[dateKey].forEach(event => {
        eventText += `• ${event.title}`;
        if (!event.isAllDay) {
          eventText += ` (${format(new Date(event.startDateTime), 'h:mm a')} - ${format(new Date(event.endDateTime), 'h:mm a')})`;
        }
        eventText += ` - ${event.eventType}\n`;
      });
      eventText += '\n';
    });
    
    // Create shareable data
    const shareData = {
      title: calendarTitle,
      text: calendarDescription,
      // We don't have an actual URL for the calendar so we'll use a placeholder
      url: window.location.href
    };
    
    try {
      // Check if Web Share API is available
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "Success",
          description: "Calendar shared successfully!",
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        try {
          await navigator.clipboard.writeText(eventText);
          toast({
            title: "Calendar copied to clipboard",
            description: "You can now paste and share it.",
          });
        } catch (err) {
          toast({
            title: "Error",
            description: "Failed to copy calendar to clipboard.",
            variant: "destructive",
          });
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to share the calendar.",
        variant: "destructive",
      });
    }
  };
  
  // Export calendar as text file
  const handleExport = () => {
    const calendarTitle = "Academic Calendar";
    const fileName = `${calendarTitle.replace(/\s+/g, '_')}_${view === 'year' ? date.getFullYear() : format(date, 'MMM_yyyy')}.txt`;
    
    // Generate a text representation of events based on view
    let eventText = `${calendarTitle} - ${view === 'year' ? date.getFullYear() : format(date, 'MMMM yyyy')}\n\n`;
    
    // For yearly view, group by month first
    if (view === 'year') {
      const year = date.getFullYear();
      const months = [];
      for (let i = 0; i < 12; i++) {
        months.push(new Date(year, i, 1));
      }
      
      // Filter events for this year
      const yearlyEvents = filteredEvents.filter(event => {
        const eventDate = new Date(event.startDateTime);
        return eventDate.getFullYear() === year;
      });
      
      // Group by month then by date
      const eventsByMonth: Record<string, Record<string, Event[]>> = {};
      
      months.forEach(month => {
        const monthKey = format(month, 'yyyy-MM');
        eventsByMonth[monthKey] = {};
      });
      
      yearlyEvents.forEach(event => {
        const eventDate = new Date(event.startDateTime);
        const monthKey = format(eventDate, 'yyyy-MM');
        const dateKey = format(eventDate, 'yyyy-MM-dd');
        
        if (!eventsByMonth[monthKey]) {
          eventsByMonth[monthKey] = {};
        }
        
        if (!eventsByMonth[monthKey][dateKey]) {
          eventsByMonth[monthKey][dateKey] = [];
        }
        
        eventsByMonth[monthKey][dateKey].push(event);
      });
      
      // Build text content by month
      months.forEach(month => {
        const monthKey = format(month, 'yyyy-MM');
        const monthEvents = eventsByMonth[monthKey];
        const hasEvents = Object.keys(monthEvents).length > 0;
        
        eventText += `== ${format(month, 'MMMM')} ==\n\n`;
        
        if (hasEvents) {
          Object.keys(monthEvents).sort().forEach(dateKey => {
            const dateObj = new Date(dateKey);
            eventText += `${format(dateObj, 'MMMM d, yyyy (EEEE)')}\n`;
            
            monthEvents[dateKey].forEach(event => {
              eventText += `• ${event.title}`;
              if (!event.isAllDay) {
                eventText += ` (${format(new Date(event.startDateTime), 'h:mm a')} - ${format(new Date(event.endDateTime), 'h:mm a')})`;
              }
              eventText += ` - ${event.eventType}`;
              if (event.location) {
                eventText += ` - ${event.location}`;
              }
              eventText += '\n';
            });
            eventText += '\n';
          });
        } else {
          eventText += 'No events scheduled for this month\n\n';
        }
      });
      
    } else {
      // Monthly/weekly/daily view - group events by date
      const eventsByDate: Record<string, Event[]> = {};
      
      filteredEvents.forEach(event => {
        const dateKey = format(new Date(event.startDateTime), 'yyyy-MM-dd');
        if (!eventsByDate[dateKey]) {
          eventsByDate[dateKey] = [];
        }
        eventsByDate[dateKey].push(event);
      });
      
      // Build text content from grouped events
      Object.keys(eventsByDate).sort().forEach(dateKey => {
        const dateObj = new Date(dateKey);
        eventText += `${format(dateObj, 'EEEE, MMMM d, yyyy')}\n`;
        
        eventsByDate[dateKey].forEach(event => {
          eventText += `• ${event.title}`;
          if (!event.isAllDay) {
            eventText += ` (${format(new Date(event.startDateTime), 'h:mm a')} - ${format(new Date(event.endDateTime), 'h:mm a')})`;
          }
          eventText += ` - ${event.eventType}`;
          if (event.location) {
            eventText += ` - ${event.location}`;
          }
          eventText += '\n';
        });
        eventText += '\n';
      });
    }
    
    // Create the file
    const blob = new Blob([eventText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // Create a link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: "Calendar exported successfully!",
    });
  };

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
      case 'year':
        newDate.setFullYear(date.getFullYear() - 1);
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
      case 'year':
        newDate.setFullYear(date.getFullYear() + 1);
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
      case 'year':
        const year = date.getFullYear();
        events = filteredEvents.filter(event => {
          const eventDate = new Date(event.startDateTime);
          return eventDate.getFullYear() === year;
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
                        <Badge variant="outline">{event.eventType}</Badge>
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
  
  // Render year view
  const renderYearView = () => {
    const events = getEventsForView;
    const year = date.getFullYear();
    
    // Group events by month and then by date
    const months = [];
    for (let i = 0; i < 12; i++) {
      months.push(new Date(year, i, 1));
    }
    
    const eventsByMonth: Record<string, Record<string, Event[]>> = {};
    
    months.forEach(month => {
      const monthKey = format(month, 'yyyy-MM');
      eventsByMonth[monthKey] = {};
    });
    
    events.forEach(event => {
      const eventDate = new Date(event.startDateTime);
      const monthKey = format(eventDate, 'yyyy-MM');
      const dateKey = format(eventDate, 'yyyy-MM-dd');
      
      if (!eventsByMonth[monthKey]) {
        eventsByMonth[monthKey] = {};
      }
      
      if (!eventsByMonth[monthKey][dateKey]) {
        eventsByMonth[monthKey][dateKey] = [];
      }
      
      eventsByMonth[monthKey][dateKey].push(event);
    });
    
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-xl font-bold">{year} Academic Calendar</h3>
          <p className="text-muted-foreground">Yearly overview of all events</p>
        </div>
        
        {months.map(month => {
          const monthKey = format(month, 'yyyy-MM');
          const monthEvents = eventsByMonth[monthKey];
          const hasEvents = Object.keys(monthEvents).length > 0;
          
          return (
            <Card key={monthKey}>
              <CardHeader className="pb-2">
                <CardTitle>{format(month, 'MMMM')}</CardTitle>
                <CardDescription>
                  {Object.values(monthEvents).flat().length} events
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {hasEvents ? (
                  <div className="space-y-2">
                    {Object.keys(monthEvents).sort().map(dateKey => {
                      const dateObj = new Date(dateKey);
                      const eventsForDate = monthEvents[dateKey];
                      
                      return (
                        <div key={dateKey} className="border-l-2 border-primary pl-4 py-2">
                          <div className="font-medium">
                            {format(dateObj, 'EEEE, d')}
                          </div>
                          
                          <div className="space-y-1 mt-1">
                            {eventsForDate.map(event => (
                              <div
                                key={event.id}
                                onClick={() => setSelectedEvent(event)}
                                className="cursor-pointer hover:bg-muted p-2 rounded-md"
                              >
                                <div className="flex justify-between">
                                  <span className="font-medium">{event.title}</span>
                                  <Badge variant="outline">{event.eventType}</Badge>
                                </div>
                                
                                <div className="text-sm text-muted-foreground">
                                  {event.isAllDay ? 
                                    'All day' : 
                                    `${format(new Date(event.startDateTime), 'h:mm a')} - ${format(new Date(event.endDateTime), 'h:mm a')}`
                                  }
                                  {event.location && ` • ${event.location}`}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No events scheduled for this month
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
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
      case 'year':
        return renderYearView();
      default:
        return renderMonthView();
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Academic Calendar</h2>
          <p className="text-muted-foreground">View and manage all school events</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <Filter className="h-4 w-4" /> 
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72" align="end">
              <div className="p-2">
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
              
              <DropdownMenuSeparator />
              
              <div className="p-2">
                <h4 className="font-medium mb-2">Exclude Event Types</h4>
                <div className="space-y-2">
                  {eventTypes.map(type => (
                    <div key={`exclude-${type}`} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`exclude-${type}`} 
                        checked={excludedTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setExcludedTypes([...excludedTypes, type]);
                          } else {
                            setExcludedTypes(excludedTypes.filter(t => t !== type));
                          }
                        }}
                      />
                      <label htmlFor={`exclude-${type}`} className="text-sm">{type}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              <DropdownMenuSeparator />
              
              <div className="p-2">
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
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <Share className="h-4 w-4" />
                Share
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print Calendar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare}>
                <Share className="mr-2 h-4 w-4" />
                Share Calendar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExport}>
                <FileText className="mr-2 h-4 w-4" />
                Export as Text
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
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
                      {view === 'year' && date.getFullYear()}
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
                  <SelectItem value="year">
                    <div className="flex items-center">
                      <ListOrdered className="mr-2 h-4 w-4" />
                      Year
                    </div>
                  </SelectItem>
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
      
      {/* Hidden printable calendar container */}
      <div className="hidden">
        <div ref={printableCalendarRef} id="printable-calendar">
          <PrintableCalendar currentDate={date} events={filteredEvents} view={view === 'year' ? 'year' : 'month'} />
        </div>
      </div>
    </div>
  );
};

export default EventCalendar;
