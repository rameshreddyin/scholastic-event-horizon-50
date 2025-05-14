
import React, { useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  CalendarDays, 
  Clock, 
  Users, 
  Bell, 
  Mail, 
  Edit, 
  Trash2,
  Copy,
  ExternalLink 
} from 'lucide-react';
import { Event } from '@/types/events';
import { audienceSubgroups } from '@/data/mockData';

interface EventDetailModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

const EventDetailModal = ({ event, isOpen, onClose }: EventDetailModalProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const handleEdit = () => {
    // Navigate to create-event with the event data for editing
    navigate('/create-event', { state: { editingEvent: event } });
    onClose();
  };
  
  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    // In a real app, this would make an API call
    console.log('Delete event:', event.id);
    
    toast({
      title: "Event Deleted",
      description: `${event.title} has been successfully deleted.`,
    });
    
    setDeleteDialogOpen(false);
    onClose();
    navigate('/calendar');
  };
  
  const handleDuplicate = () => {
    // Navigate to create event with prefilled data
    navigate('/create-event', { state: { duplicateFrom: event } });
    
    toast({
      title: "Event Duplicated",
      description: "You can now edit the duplicated event.",
    });
    
    onClose();
  };
  
  const getAudienceDisplay = () => {
    if (event.audience.isEveryone) {
      return 'Everyone';
    }
    
    if (event.audience.subgroups.length > 0) {
      const subgroups = audienceSubgroups.filter(sg => 
        event.audience.subgroups.includes(sg.id)
      );
      
      return subgroups.map(sg => sg.name).join(', ');
    }
    
    return event.audience.groups.join(', ');
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-xl">{event.title}</DialogTitle>
                <Badge variant="outline" className="mt-1">
                  {event.eventType}
                </Badge>
                {event.isDraft && (
                  <Badge variant="outline" className="ml-2 mt-1 border-dashed">
                    Draft
                  </Badge>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Date & Time */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-4 w-4" />
                <span>{format(new Date(event.startDateTime), 'MMMM d, yyyy')}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>
                  {event.isAllDay ? 'All Day' : `${format(new Date(event.startDateTime), 'h:mm a')} - ${format(new Date(event.endDateTime), 'h:mm a')}`}
                </span>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h4 className="text-sm font-medium mb-1">Description</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {event.description || 'No description provided.'}
              </p>
            </div>

            <Separator />

            {/* Audience */}
            <div>
              <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                <Users className="h-4 w-4" />
                Audience
              </h4>
              <p className="text-sm text-muted-foreground">
                {getAudienceDisplay()}
              </p>
            </div>

            <Separator />

            {/* Notifications */}
            <div>
              <h4 className="text-sm font-medium mb-2">Notification Settings</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Bell className="h-3 w-3" />
                  <span>Push Notification:</span>
                  <span className={event.notification.sendPush ? 'text-primary' : 'text-muted-foreground'}>
                    {event.notification.sendPush ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span>Email Alert:</span>
                  <span className={event.notification.sendEmail ? 'text-primary' : 'text-muted-foreground'}>
                    {event.notification.sendEmail ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Creator info */}
            <div className="text-xs text-muted-foreground pt-2">
              Created by {event.createdBy} on {format(new Date(event.createdAt), 'MMM d, yyyy')}
              {event.updatedAt && ` · Updated on ${format(new Date(event.updatedAt), 'MMM d, yyyy')}`}
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handleEdit} title="Edit">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleDuplicate} title="Duplicate">
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" onClick={handleDelete} title="Delete">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            <Button 
              variant="default"
              onClick={() => {
                navigate(`/event/${event.id}`);
                onClose();
              }}
              className="gap-1"
            >
              View Details <ExternalLink className="h-3 w-3" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{event.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EventDetailModal;
