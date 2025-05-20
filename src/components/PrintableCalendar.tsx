
import React from 'react';
import { format, isSameDay, isSameMonth, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';
import { Event } from '@/types/events';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PrintableCalendarProps {
  currentDate: Date;
  events: Event[];
  view: 'month' | 'year';
}

const PrintableCalendar: React.FC<PrintableCalendarProps> = ({ currentDate, events, view }) => {
  if (view === 'year') {
    return <YearlyCalendarView currentDate={currentDate} events={events} />;
  }
  
  // Create an array of dates for the month
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysArray = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDayOfMonth + 1;
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
  });
  
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
    <div className="printable-calendar">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Academic Calendar</h2>
        <p className="text-lg">{format(currentDate, 'MMMM yyyy')}</p>
      </div>
      
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2 border">Sunday</th>
            <th className="p-2 border">Monday</th>
            <th className="p-2 border">Tuesday</th>
            <th className="p-2 border">Wednesday</th>
            <th className="p-2 border">Thursday</th>
            <th className="p-2 border">Friday</th>
            <th className="p-2 border">Saturday</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, weekIndex) => (
            <tr key={`week-${weekIndex}`}>
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const dateIndex = weekIndex * 7 + dayIndex;
                const day = daysArray[dateIndex];
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayEvents = eventsByDate[dateKey] || [];
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <td 
                    key={`day-${dateIndex}`}
                    className={`
                      p-2 border align-top h-24
                      ${!isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : ''}
                      ${isToday ? 'bg-accent/20' : ''}
                    `}
                  >
                    <div className="font-medium">{day.getDate()}</div>
                    <div className="space-y-1 mt-1">
                      {dayEvents.map((event, idx) => (
                        <div 
                          key={`print-event-${event.id}-${idx}`}
                          className={`
                            text-xs p-1 rounded truncate
                            ${event.eventType === 'Academic' ? 'bg-green-100' : ''}
                            ${event.eventType === 'Holiday' ? 'bg-red-100' : ''}
                            ${event.eventType === 'Exam' ? 'bg-orange-100' : ''}
                            ${event.eventType === 'Meeting' ? 'bg-purple-100' : ''}
                            ${event.eventType === 'Announcement' ? 'bg-blue-100' : ''}
                            ${event.eventType === 'PTA' ? 'bg-yellow-100' : ''}
                            ${event.eventType === 'Cultural Program' ? 'bg-teal-100' : ''}
                            ${event.eventType === 'Other' ? 'bg-gray-100' : ''}
                          `}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="mt-4 flex flex-wrap gap-2">
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 bg-green-100 rounded mr-1"></div> Academic
        </div>
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 bg-red-100 rounded mr-1"></div> Holiday
        </div>
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 bg-orange-100 rounded mr-1"></div> Exam
        </div>
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 bg-purple-100 rounded mr-1"></div> Meeting
        </div>
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 bg-blue-100 rounded mr-1"></div> Announcement
        </div>
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 bg-yellow-100 rounded mr-1"></div> PTA
        </div>
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 bg-teal-100 rounded mr-1"></div> Cultural Program
        </div>
        <div className="flex items-center mr-4">
          <div className="w-3 h-3 bg-gray-100 rounded mr-1"></div> Other
        </div>
      </div>
    </div>
  );
};

const YearlyCalendarView: React.FC<{currentDate: Date, events: Event[]}> = ({ currentDate, events }) => {
  const year = currentDate.getFullYear();
  const startDate = startOfYear(currentDate);
  const endDate = endOfYear(currentDate);
  
  // Get all months in the year
  const months = eachMonthOfInterval({ start: startDate, end: endDate });
  
  // Group events by month then by date for the whole year
  const eventsByMonth: Record<string, Record<string, Event[]>> = {};
  
  months.forEach(month => {
    const monthKey = format(month, 'yyyy-MM');
    eventsByMonth[monthKey] = {};
  });
  
  events.forEach(event => {
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
  
  return (
    <div className="yearly-calendar">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Academic Calendar - Yearly View</h2>
        <p className="text-lg">{year}</p>
      </div>
      
      <div className="space-y-8">
        {months.map(month => {
          const monthKey = format(month, 'yyyy-MM');
          const monthEvents = eventsByMonth[monthKey];
          const hasEvents = Object.keys(monthEvents).length > 0;
          
          return (
            <div key={monthKey} className="month-section">
              <h3 className="text-xl font-semibold mb-2">{format(month, 'MMMM')}</h3>
              
              {hasEvents ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/6">Date</TableHead>
                      <TableHead className="w-1/3">Event</TableHead>
                      <TableHead className="w-1/6">Time</TableHead>
                      <TableHead className="w-1/6">Type</TableHead>
                      <TableHead className="w-1/6">Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.keys(monthEvents).sort().map(dateKey => {
                      const eventsForDate = monthEvents[dateKey];
                      
                      return eventsForDate.map((event, index) => (
                        <TableRow key={`${dateKey}-${event.id}`}>
                          {index === 0 && (
                            <TableCell className="font-medium" rowSpan={eventsForDate.length}>
                              {format(new Date(dateKey), 'd MMM, yyyy')}
                            </TableCell>
                          )}
                          <TableCell className="font-medium">{event.title}</TableCell>
                          <TableCell>
                            {event.isAllDay ? 
                              'All day' : 
                              `${format(new Date(event.startDateTime), 'h:mm a')} - ${format(new Date(event.endDateTime), 'h:mm a')}`
                            }
                          </TableCell>
                          <TableCell>
                            <span className={`
                              px-2 py-1 rounded-full text-xs
                              ${event.eventType === 'Academic' ? 'bg-green-100' : ''}
                              ${event.eventType === 'Holiday' ? 'bg-red-100' : ''}
                              ${event.eventType === 'Exam' ? 'bg-orange-100' : ''}
                              ${event.eventType === 'Meeting' ? 'bg-purple-100' : ''}
                              ${event.eventType === 'Announcement' ? 'bg-blue-100' : ''}
                              ${event.eventType === 'PTA' ? 'bg-yellow-100' : ''}
                              ${event.eventType === 'Cultural Program' ? 'bg-teal-100' : ''}
                              ${event.eventType === 'Other' ? 'bg-gray-100' : ''}
                            `}>
                              {event.eventType}
                            </span>
                          </TableCell>
                          <TableCell>{event.location || 'N/A'}</TableCell>
                        </TableRow>
                      ));
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-muted-foreground text-center py-4 border rounded-md">
                  No events scheduled for this month
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 print:mt-4">
        <h3 className="text-lg font-semibold mb-2">Event Types</h3>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 bg-green-100 rounded mr-1"></div> Academic
          </div>
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 bg-red-100 rounded mr-1"></div> Holiday
          </div>
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 bg-orange-100 rounded mr-1"></div> Exam
          </div>
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 bg-purple-100 rounded mr-1"></div> Meeting
          </div>
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 bg-blue-100 rounded mr-1"></div> Announcement
          </div>
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 bg-yellow-100 rounded mr-1"></div> PTA
          </div>
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 bg-teal-100 rounded mr-1"></div> Cultural Program
          </div>
          <div className="flex items-center mr-4">
            <div className="w-3 h-3 bg-gray-100 rounded mr-1"></div> Other
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintableCalendar;
