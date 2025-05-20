import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, addDays } from 'date-fns';
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
  Clock,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  EventType, 
  AudienceGroup, 
  EventCreationData, 
  NoticeSettings,
  NoticePeriod
} from '@/types/events';

// Form steps
const formSteps = [
  { id: 'details', title: 'Basic Details' },
  { id: 'scheduling', title: 'Scheduling' },
  { id: 'notice', title: 'Notice Board' }
];

const eventTypes: EventType[] = [
  'Academic', 'Holiday', 'Exam', 'Meeting', 'Announcement', 'PTA', 'Cultural Program', 'Other'
];

const audienceGroups: AudienceGroup[] = [
  'Parents', 'Students', 'Teachers', 'Staff', 'Administrators', 'Others'
];

const noticePeriods: { value: NoticePeriod; label: string }[] = [
  { value: 'same_day', label: 'Same day' },
  { value: '1_day_before', label: '1 day before' },
  { value: '2_days_before', label: '2 days before' },
  { value: '3_days_before', label: '3 days before' },
  { value: '1_week_before', label: '1 week before' },
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
    eventType: duplicateEvent?.eventType || 'Academic',
    isAllDay: duplicateEvent?.isAllDay || false,
    startDateTime: duplicateEvent?.startDateTime || new Date(),
    endDateTime: duplicateEvent?.endDateTime || new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
    noticeSettings: duplicateEvent?.noticeSettings || {
      addToNoticeBoard: false,
      audienceGroups: [],
      noticePeriod: '1_day_before',
      expiryDate: null
    },
    isDraft: false
  };
  
  // Form schema
  const formSchema = z.object({
    title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
    description: z.string().optional(),
    eventType: z.enum(['Academic', 'Holiday', 'Exam', 'Meeting', 'Announcement', 'PTA', 'Cultural Program', 'Other']),
    isAllDay: z.boolean(),
    startDateTime: z.date(),
    endDateTime: z.date(),
    noticeSettings: z.object({
      addToNoticeBoard: z.boolean(),
      audienceGroups: z.array(z.enum(['Parents', 'Students', 'Teachers', 'Staff', 'Administrators', 'Others'])),
      noticePeriod: z.enum(['same_day', '1_day_before', '2_days_before', '3_days_before', '1_week_before']),
      expiryDate: z.date().nullable()
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
  
  // Watch for changes
  const isAllDay = watch('isAllDay');
  const addToNoticeBoard = watch('noticeSettings.addToNoticeBoard');
  const startDateTime = watch('startDateTime');
  
  // Set default expiry date when start date changes
  React.useEffect(() => {
    if (!form.getValues('noticeSettings.expiryDate')) {
      setValue('noticeSettings.expiryDate', startDateTime);
    }
  }, [startDateTime, setValue]);
  
  // Fixed submission handler to correctly handle the isDraft parameter
  const onSubmit = (data: z.infer<typeof formSchema>, isDraftParam: boolean = false) => {
    // Update draft status
    const finalData = { ...data, isDraft: isDraftParam };
    console.log('Form submitted:', finalData);
    
    toast.success(isDraftParam ? 'Academic calendar event draft saved successfully' : 'Academic calendar event created successfully', {
      description: isDraftParam ? 'You can edit it later.' : 'The event has been published.',
    });
    
    // Navigate to calendar after successful submission
    navigate('/calendar');
  };
  
  const nextStep = () => {
    const fields = [
      ['title', 'eventType'],
      ['startDateTime', 'endDateTime'],
      ['noticeSettings']
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
        return renderNoticeStep();
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

                          // Update notice expiry date to match event end date by default
                          form.setValue('noticeSettings.expiryDate', form.getValues('endDateTime'));
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
                          
                          // Update notice expiry date to match event end date by default
                          form.setValue('noticeSettings.expiryDate', newDate);
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
  
  const renderNoticeStep = () => {
    return (
      <>
        <FormField
          control={form.control}
          name="noticeSettings.addToNoticeBoard"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mb-6">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Add to Notice Board</FormLabel>
                <FormDescription>
                  Share this event on the notice board
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
        
        {addToNoticeBoard && (
          <>
            <FormField
              control={form.control}
              name="noticeSettings.audienceGroups"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Who is this notice for?</FormLabel>
                    <FormDescription>
                      Select the audience for this notice
                    </FormDescription>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-2">
                    {audienceGroups.map(group => (
                      <FormField
                        key={group}
                        control={form.control}
                        name="noticeSettings.audienceGroups"
                        render={({ field }) => {
                          const isSelected = field.value?.includes(group);
                          return (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={(checked) => {
                                    const currentValue = [...field.value];
                                    if (checked) {
                                      field.onChange([...currentValue, group]);
                                    } else {
                                      field.onChange(currentValue.filter(item => item !== group));
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
            
            <FormField
              control={form.control}
              name="noticeSettings.noticePeriod"
              render={({ field }) => (
                <FormItem className="mt-6">
                  <FormLabel>When to add to Notice Board</FormLabel>
                  <FormDescription>
                    Choose when the notice should appear on the board
                  </FormDescription>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select notice timing" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {noticePeriods.map(period => (
                        <SelectItem key={period.value} value={period.value}>{period.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="noticeSettings.expiryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col mt-6">
                  <FormLabel>Notice Expiry Date</FormLabel>
                  <FormDescription>
                    By default, notice expires when the event ends. You can set a custom expiry date.
                  </FormDescription>
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
                            <Bell className="h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Set expiry date</span>
                            )}
                          </div>
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={(date) => field.onChange(date)}
                        disabled={(date) => {
                          // Disable dates before event start date
                          const startDate = form.getValues('startDateTime');
                          return date < startDate;
                        }}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        
        {/* Notice Summary */}
        {addToNoticeBoard && (
          <div className="mt-6 bg-muted/20 p-4 rounded-md">
            <h4 className="font-medium mb-2">Notice Board Summary</h4>
            <div className="text-sm space-y-2">
              <p>This event will be visible on the notice board:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Audience:</strong> {form.watch('noticeSettings.audienceGroups').length 
                    ? form.watch('noticeSettings.audienceGroups').join(', ') 
                    : 'No audience selected'}
                </li>
                <li>
                  <strong>Timing:</strong> {
                    noticePeriods.find(p => p.value === form.watch('noticeSettings.noticePeriod'))?.label || 'Same day'
                  }
                </li>
                <li>
                  <strong>Expires:</strong> {
                    form.watch('noticeSettings.expiryDate') 
                      ? format(form.watch('noticeSettings.expiryDate'), 'PPP') 
                      : 'Same as event end date'
                  }
                </li>
              </ul>
            </div>
          </div>
        )}
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
      
      <h1 className="text-2xl font-bold mb-2">Create Academic Calendar Event</h1>
      <p className="text-muted-foreground mb-6">Fill out the form below to create a new academic calendar event</p>
      
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
            {step === 0 && "Enter the basic details for your academic calendar event"}
            {step === 1 && "Set when your event will take place"}
            {step === 2 && "Configure notice board settings"}
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
                  Save to Academic Calendar
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
