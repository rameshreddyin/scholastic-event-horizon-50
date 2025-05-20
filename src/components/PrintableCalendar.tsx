
import React from 'react';
import { format, isSameDay, isSameMonth } from 'date-fns';
import { Event } from '@/types/events';

interface PrintableCalendarProps {
  currentDate: Date;
  events: Event[];
}

const PrintableCalendar: React.FC<PrintableCalendarProps> = ({ currentDate, events }) => {
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

export default PrintableCalendar;
