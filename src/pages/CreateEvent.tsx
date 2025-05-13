
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from '@/components/ui/form';
import { 
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  CalendarDays,
  ArrowLeft,
  Save,
  CalendarPlus,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  EventType, 
  AudienceGroup, 
  EventCreationData, 
  EventAudience, 
  EventNotification 
} from '@/types/events';
import { audienceSubgroups } from '@/data/mockData';

// Form steps
const formSteps = [
  { id: 'details', title: 'Basic Details' },
  { id: 'scheduling', title: 'Scheduling' },
  { id: 'audience', title: 'Audience' },
  { id: 'notifications', title: 'Notifications' }
];

const eventTypes: EventType[] = [
  'Holiday', 'Exam', 'Meeting', 'Announcement', 'PTA', 'Cultural Program', 'Other'
];

const audienceGroups: AudienceGroup[] = [
  'Parents', 'Students', 'Teachers', 'Staff', 'Administrators', 'Others'
];

const CreateEvent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Prefill with duplicated event if available
  const duplicateEvent = location.state?.duplicateFrom;
  
  const [step, setStep] = useState(0);
  
  // Default values
  const defaultValues: Partial<EventCreationData> = {
    title: duplicateEvent?.title || '',
    description: duplicateEvent?.description || '',
    eventType: duplicateEvent?.eventType || 'Meeting',
    isAllDay: duplicateEvent?.isAllDay || false,
    startDateTime: duplicateEvent?.startDateTime || new Date(),
    endDateTime: duplicateEvent?.endDateTime || new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
    audience: duplicateEvent?.audience || {
      groups: [],
      subgroups: [],
      isEveryone: false
    },
    notification: duplicateEvent?.notification || {
      sendPush: true,
      sendEmail: true,
      showInCalendar: true,
      reminderHours: 24,
      followUpNotification: false,
      enableRSVP: false
    },
    isDraft: false
  };
  
  // Form schema
  const formSchema = z.object({
    title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
    description: z.string().optional(),
    eventType: z.enum(['Holiday', 'Exam', 'Meeting', 'Announcement', 'PTA', 'Cultural Program', 'Other']),
    isAllDay: z.boolean(),
    startDateTime: z.date(),
    endDateTime: z.date(),
    audience: z.object({
      groups: z.array(z.enum(['Parents', 'Students', 'Teachers', 'Staff', 'Administrators', 'Others'])),
      subgroups: z.array(z.string()),
      isEveryone: z.boolean()
    }),
    notification: z.object({
      sendPush: z.boolean(),
      sendEmail: z.boolean(),
      showInCalendar: z.boolean(),
      reminderHours: z.number().nullable(),
      followUpNotification: z.boolean(),
      enableRSVP: z.boolean()
    }),
    isDraft: z.boolean()
  }).refine(data => {
    // Ensure end date is after start date
    return data.endDateTime > data.startDateTime;
  }, {
    message: "End date must be after start date",
    path: ["endDateTime"]
  });
  
  // Create form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues as any,
  });
  
  const { watch, setValue } = form;
  
  // Watch for audience changes
  const audienceGroups = watch('audience.groups');
  const isEveryone = watch('audience.isEveryone');
  const isAllDay = watch('isAllDay');
  
  // Get relevant subgroups based on selected groups
  const relevantSubgroups = audienceSubgroups.filter(sg => 
    audienceGroups.includes(sg.group)
  );
  
  // Fixed submission handler to correctly handle the isDraft parameter
  const onSubmit = (data: z.infer<typeof formSchema>, isDraftParam: boolean = false) => {
    // Update draft status
    const finalData = { ...data, isDraft: isDraftParam };
    console.log('Form submitted:', finalData);
    
    toast.success(isDraftParam ? 'Event draft saved successfully' : 'Event created successfully', {
      description: isDraftParam ? 'You can edit it later.' : 'The event has been published.',
    });
    
    // Navigate to calendar after successful submission
    navigate('/calendar');
  };
  
  const nextStep = () => {
    const fields = [
      ['title', 'eventType'],
      ['startDateTime', 'endDateTime'],
      ['audience'],
      ['notification']
    ][step];
    
    const isValid = fields.every(field => {
      const fieldState = form.getFieldState(field as any);
      return !fieldState.invalid;
    });
    
    if (isValid) {
      setStep(step + 1);
    } else {
      // Trigger validation
      fields.forEach(field => form.trigger(field as any));
    }
  };
  
  const prevStep = () => {
    setStep(Math.max(0, step - 1));
  };
  
  const renderStepContent = () => {
    switch (step) {
      case 0:
        return renderBasicDetailsStep();
      case 1:
        return renderSchedulingStep();
      case 2:
        return renderAudienceStep();
      case 3:
        return renderNotificationsStep();
      default:
        return renderBasicDetailsStep();
    }
  };
  
  const renderBasicDetailsStep = () => {
    return (
      <>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter event title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter a description for the event"
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="eventType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {eventTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </>
    );
  };
  
  const renderSchedulingStep = () => {
    return (
      <>
        <FormField
          control={form.control}
          name="isAllDay"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">All Day Event</FormLabel>
                <FormDescription>
                  Toggle if this event lasts all day
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="grid sm:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="startDateTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start {isAllDay ? 'Date' : 'Date & Time'}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal flex justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <div className="flex gap-2 items-center">
                          <CalendarDays className="h-4 w-4" />
                          {field.value ? (
                            isAllDay
                              ? format(field.value, "PPP")
                              : format(field.value, "PPP p")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </div>
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        if (date) {
                          // Keep the time part from the existing date
                          const newDate = new Date(date);
                          if (!isAllDay && field.value) {
                            newDate.setHours(field.value.getHours());
                            newDate.setMinutes(field.value.getMinutes());
                          }
                          field.onChange(newDate);
                          
                          // Update end date to be later than start date if needed
                          const endDate = form.getValues('endDateTime');
                          if (newDate >= endDate) {
                            const newEndDate = new Date(newDate);
                            newEndDate.setHours(newEndDate.getHours() + 1);
                            form.setValue('endDateTime', newEndDate);
                          }
                        }
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                    {!isAllDay && (
                      <div className="p-3 border-t">
                        <div className="flex justify-between items-center">
                          <label className="text-sm">Time:</label>
                          <input
                            type="time"
                            value={format(field.value, "HH:mm")}
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(':').map(Number);
                              const newDate = new Date(field.value);
                              newDate.setHours(hours);
                              newDate.setMinutes(minutes);
                              field.onChange(newDate);
                            }}
                            className="border rounded p-1 text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endDateTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End {isAllDay ? 'Date' : 'Date & Time'}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal flex justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <div className="flex gap-2 items-center">
                          <Clock className="h-4 w-4" />
                          {field.value ? (
                            isAllDay
                              ? format(field.value, "PPP")
                              : format(field.value, "PPP p")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </div>
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        if (date) {
                          // Keep the time part from the existing date
                          const newDate = new Date(date);
                          if (!isAllDay && field.value) {
                            newDate.setHours(field.value.getHours());
                            newDate.setMinutes(field.value.getMinutes());
                          }
                          field.onChange(newDate);
                        }
                      }}
                      disabled={(date) => {
                        // Disable dates before start date
                        const startDate = form.getValues('startDateTime');
                        if (!startDate) return false;
                        
                        // For all-day events, disable dates before start date
                        if (isAllDay) {
                          const startDateWithoutTime = new Date(startDate);
                          startDateWithoutTime.setHours(0, 0, 0, 0);
                          const dateWithoutTime = new Date(date);
                          dateWithoutTime.setHours(0, 0, 0, 0);
                          return dateWithoutTime < startDateWithoutTime;
                        }
                        
                        // For timed events, disable dates before start date
                        return date < startDate;
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                    {!isAllDay && (
                      <div className="p-3 border-t">
                        <div className="flex justify-between items-center">
                          <label className="text-sm">Time:</label>
                          <input
                            type="time"
                            value={format(field.value, "HH:mm")}
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(':').map(Number);
                              const newDate = new Date(field.value);
                              newDate.setHours(hours);
                              newDate.setMinutes(minutes);
                              field.onChange(newDate);
                            }}
                            className="border rounded p-1 text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </>
    );
  };
  
  const renderAudienceStep = () => {
    return (
      <>
        <FormField
          control={form.control}
          name="audience.isEveryone"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mb-6">
              <div className="space-y-0.5">
                <FormLabel className="text-base">This event is for everyone</FormLabel>
                <FormDescription>
                  Toggle if this event applies to all users in the system
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (checked) {
                      setValue('audience.groups', ['Parents', 'Students', 'Teachers', 'Staff', 'Administrators', 'Others']);
                      setValue('audience.subgroups', []);
                    }
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        {!isEveryone && (
          <>
            <FormField
              control={form.control}
              name="audience.groups"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">User Groups</FormLabel>
                    <FormDescription>
                      Select the main audience groups for this event
                    </FormDescription>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-2">
                    {['Parents', 'Students', 'Teachers', 'Staff', 'Administrators', 'Others'].map(group => (
                      <FormField
                        key={group}
                        control={form.control}
                        name="audience.groups"
                        render={({ field }) => {
                          const isSelected = field.value?.includes(group as AudienceGroup);
                          return (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={(checked) => {
                                    const currentValue = [...field.value];
                                    if (checked) {
                                      // Add group
                                      field.onChange([...currentValue, group as AudienceGroup]);
                                    } else {
                                      // Remove group and its subgroups
                                      field.onChange(currentValue.filter(item => item !== group));
                                      const subgroups = form.getValues('audience.subgroups');
                                      const filteredSubgroups = subgroups.filter(s => 
                                        !audienceSubgroups.find(sg => sg.id === s && sg.group === group)
                                      );
                                      setValue('audience.subgroups', filteredSubgroups);
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {group}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                </FormItem>
              )}
            />
            
            {audienceGroups.length > 0 && (
              <FormField
                control={form.control}
                name="audience.subgroups"
                render={({ field }) => (
                  <FormItem className="space-y-4 mt-6">
                    <div>
                      <FormLabel className="text-base">Specific Groups</FormLabel>
                      <FormDescription>
                        Select specific subgroups or leave empty to include all
                      </FormDescription>
                    </div>
                    
                    <div className="border rounded-md p-4 space-y-6">
                      {audienceGroups.map(group => {
                        const subgroups = audienceSubgroups.filter(sg => sg.group === group);
                        if (subgroups.length === 0) return null;
                        
                        return (
                          <div key={group} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{group}</h4>
                              <div className="flex gap-2 items-center">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const subgroupIds = subgroups.map(sg => sg.id);
                                    const currentSubgroups = [...field.value];
                                    
                                    // Check if all are selected
                                    const allSelected = subgroupIds.every(id => currentSubgroups.includes(id));
                                    
                                    if (allSelected) {
                                      // Deselect all
                                      field.onChange(currentSubgroups.filter(id => !subgroupIds.includes(id)));
                                    } else {
                                      // Select all
                                      const newSubgroups = [...currentSubgroups];
                                      subgroupIds.forEach(id => {
                                        if (!newSubgroups.includes(id)) {
                                          newSubgroups.push(id);
                                        }
                                      });
                                      field.onChange(newSubgroups);
                                    }
                                  }}
                                >
                                  {subgroups.every(sg => field.value.includes(sg.id)) ? 'Deselect All' : 'Select All'}
                                </Button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 ml-2">
                              {subgroups.map(subgroup => (
                                <div key={subgroup.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={subgroup.id}
                                    checked={field.value.includes(subgroup.id)}
                                    onCheckedChange={(checked) => {
                                      const currentValue = [...field.value];
                                      if (checked) {
                                        field.onChange([...currentValue, subgroup.id]);
                                      } else {
                                        field.onChange(currentValue.filter(id => id !== subgroup.id));
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={subgroup.id}
                                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {subgroup.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        )}
        
        {/* Audience Summary */}
        <div className="mt-6 bg-muted/20 p-4 rounded-md">
          <h4 className="font-medium mb-2">Audience Summary</h4>
          {isEveryone ? (
            <p className="text-sm">This event will be visible to everyone in the system.</p>
          ) : audienceGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground">No audience selected. Please select at least one group.</p>
          ) : (
            <div className="text-sm space-y-2">
              <p>This event will be visible to:</p>
              <ul className="list-disc list-inside">
                {audienceGroups.map(group => (
                  <li key={group}>
                    {group}
                    {form.watch('audience.subgroups').length > 0 && (
                      <ul className="list-circle list-inside ml-4 text-muted-foreground">
                        {audienceSubgroups
                          .filter(sg => sg.group === group && form.watch('audience.subgroups').includes(sg.id))
                          .map(sg => (
                            <li key={sg.id}>{sg.name}</li>
                          ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </>
    );
  };
  
  const renderNotificationsStep = () => {
    const reminderOptions = [
      { value: null, label: 'No reminder' },
      { value: 1, label: '1 hour before' },
      { value: 3, label: '3 hours before' },
      { value: 24, label: '1 day before' },
      { value: 48, label: '2 days before' },
      { value: 72, label: '3 days before' },
      { value: 168, label: '1 week before' }
    ];
    
    return (
      <>
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="notification.sendPush"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Send Push Notification</FormLabel>
                  <FormDescription>
                    Notify users via push notification
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="notification.sendEmail"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Send Email Alert</FormLabel>
                  <FormDescription>
                    Notify users via email
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="notification.showInCalendar"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Show in Calendar</FormLabel>
                  <FormDescription>
                    Display this event in the calendar view
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <Separator />
          
          <FormField
            control={form.control}
            name="notification.reminderHours"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Reminder</FormLabel>
                <FormDescription>
                  Send a reminder before the event
                </FormDescription>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => field.onChange(value === 'null' ? null : parseInt(value))}
                    defaultValue={field.value === null ? 'null' : field.value.toString()}
                    className="flex flex-col space-y-1"
                  >
                    {reminderOptions.map(option => (
                      <FormItem
                        key={option.value === null ? 'null' : option.value.toString()}
                        className="flex items-center space-x-3 space-y-0"
                      >
                        <FormControl>
                          <RadioGroupItem
                            value={option.value === null ? 'null' : option.value.toString()}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {option.label}
                        </FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="notification.followUpNotification"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Send Follow-up Notification</FormLabel>
                  <FormDescription>
                    Send a follow-up notification after the event
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="notification.enableRSVP"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Enable RSVP</FormLabel>
                  <FormDescription>
                    Allow users to RSVP to this event
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </>
    );
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="h-4 w-4" /> 
        Back
      </Button>
      
      <h1 className="text-2xl font-bold mb-2">Create Event</h1>
      <p className="text-muted-foreground mb-6">Fill out the form below to create a new event</p>
      
      {/* Progress indicator */}
      <div className="mb-8 space-y-2">
        <div className="flex justify-between text-sm">
          {formSteps.map((formStep, index) => (
            <div 
              key={formStep.id}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                step >= index ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2",
                  step > index 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : step === index 
                      ? "border-primary text-primary" 
                      : "border-muted-foreground text-muted-foreground"
                )}
              >
                {step > index ? "✓" : index + 1}
              </div>
              <span className="hidden sm:block">{formStep.title}</span>
            </div>
          ))}
        </div>
        
        <div className="step-progress">
          <div 
            className="step-progress-bar" 
            style={{ width: `${((step + 1) / formSteps.length) * 100}%` }} 
          />
        </div>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{formSteps[step].title}</CardTitle>
          <CardDescription>
            {step === 0 && "Enter the basic details for your event"}
            {step === 1 && "Set when your event will take place"}
            {step === 2 && "Choose who should see this event"}
            {step === 3 && "Configure notification preferences"}
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => onSubmit(data, false))}>
            <CardContent className="space-y-6">
              {renderStepContent()}
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <div className="flex gap-2">
                {step > 0 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                )}
                
                {step === formSteps.length - 1 && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => onSubmit(form.getValues(), true)}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Draft
                  </Button>
                )}
              </div>
              
              {step < formSteps.length - 1 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button type="button" onClick={() => onSubmit(form.getValues(), false)} className="gap-2">
                  <CalendarPlus className="h-4 w-4" />
                  Create Event
                </Button>
              )}
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default CreateEvent;
