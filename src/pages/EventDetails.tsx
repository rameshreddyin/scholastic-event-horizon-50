
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  CalendarDays, 
  Clock, 
  Users, 
  Bell, 
  Mail, 
  Edit, 
  Trash2,
  Copy,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { mockEvents, audienceSubgroups } from '@/data/mockData';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const event = mockEvents.find(e => e.id === id);
  
  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
        <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/calendar')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> 
          Back to Calendar
        </Button>
      </div>
    );
  }
  
  const getAudienceDisplay = () => {
    if (event.audience.isEveryone) {
      return 'Everyone';
    }
    
    if (event.audience.subgroups.length > 0) {
      const subgroups = audienceSubgroups.filter(sg => 
        event.audience.subgroups.includes(sg.id)
      );
      
      return (
        <div className="space-y-1">
          {subgroups.map(sg => (
            <div key={sg.id} className="text-sm">
              {sg.name}
            </div>
          ))}
        </div>
      );
    }
    
    return event.audience.groups.join(', ');
  };
  
  // Mock RSVP data
  const rsvpData = {
    attending: 28,
    notAttending: 5,
    noResponse: 17
  };

  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/calendar')}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" /> 
        Back to Calendar
      </Button>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-2xl">{event.title}</CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline">
                      {event.eventType}
                    </Badge>
                    {event.isDraft && (
                      <Badge variant="outline" className="border-dashed">
                        Draft
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/event/${event.id}/edit`)}>
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => console.log('Duplicate event')}>
                    <Copy className="h-4 w-4 mr-1" /> Duplicate
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => console.log('Delete event')}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(event.startDateTime), 'MMMM d, yyyy')}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {event.isAllDay ? 'All Day' : `${format(new Date(event.startDateTime), 'h:mm a')} - ${format(new Date(event.endDateTime), 'h:mm a')}`}
                    </span>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notification Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-4 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <Bell className="h-4 w-4" /> Push Notifications
                      </h4>
                      {event.notification.sendPush ? 
                        <Badge variant="outline" className="bg-primary/10">Sent</Badge> :
                        <Badge variant="outline" className="bg-muted">Not Sent</Badge>
                      }
                    </div>
                    {event.notification.sendPush && (
                      <div className="text-sm text-muted-foreground">
                        Sent on {format(new Date(event.createdAt), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4" /> Email Alerts
                      </h4>
                      {event.notification.sendEmail ? 
                        <Badge variant="outline" className="bg-primary/10">Sent</Badge> :
                        <Badge variant="outline" className="bg-muted">Not Sent</Badge>
                      }
                    </div>
                    {event.notification.sendEmail && (
                      <div className="text-sm text-muted-foreground">
                        Sent on {format(new Date(event.createdAt), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                </div>
                
                {event.notification.enableRSVP && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3">RSVP Summary</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-accent/50 p-3 rounded-md text-center">
                        <div className="text-xl font-bold">{rsvpData.attending}</div>
                        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                          <CheckCircle2 className="h-3 w-3" /> Attending
                        </div>
                      </div>
                      <div className="bg-accent/50 p-3 rounded-md text-center">
                        <div className="text-xl font-bold">{rsvpData.notAttending}</div>
                        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                          <XCircle className="h-3 w-3" /> Not Attending
                        </div>
                      </div>
                      <div className="bg-accent/50 p-3 rounded-md text-center">
                        <div className="text-xl font-bold">{rsvpData.noResponse}</div>
                        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                          <MessageCircle className="h-3 w-3" /> No Response
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" /> Audience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {event.audience.isEveryone ? (
                  <Badge variant="secondary" className="mb-4">Everyone</Badge>
                ) : (
                  <>
                    {event.audience.groups.map(group => (
                      <div key={group} className="mb-2">
                        <h4 className="text-sm font-medium mb-1">{group}</h4>
                        {event.audience.subgroups.length > 0 ? (
                          <div className="ml-4 text-sm text-muted-foreground">
                            {audienceSubgroups
                              .filter(sg => sg.group === group && event.audience.subgroups.includes(sg.id))
                              .map(sg => (
                                <div key={sg.id} className="mb-1">{sg.name}</div>
                              ))
                            }
                          </div>
                        ) : (
                          <div className="ml-4 text-sm text-muted-foreground">All</div>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start" onClick={() => console.log('Send reminder')}>
                  <Bell className="mr-2 h-4 w-4" /> Send Reminder
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate(`/event/${event.id}/edit`)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit Event
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => console.log('Duplicate')}>
                  <Copy className="mr-2 h-4 w-4" /> Duplicate Event
                </Button>
                <Button variant="destructive" className="w-full justify-start" onClick={() => console.log('Delete')}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
