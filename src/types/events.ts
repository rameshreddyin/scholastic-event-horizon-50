
export type EventType = 
  | 'Holiday' 
  | 'Exam' 
  | 'Meeting' 
  | 'Announcement' 
  | 'PTA' 
  | 'Cultural Program' 
  | 'Other';

export type AudienceGroup = 
  | 'Parents' 
  | 'Students' 
  | 'Teachers' 
  | 'Staff' 
  | 'Administrators' 
  | 'Others';

export interface AudienceSubgroup {
  id: string;
  name: string;
  group: AudienceGroup;
}

export interface EventAudience {
  groups: AudienceGroup[];
  subgroups: string[]; // IDs of subgroups
  isEveryone: boolean;
}

export interface EventNotification {
  sendPush: boolean;
  sendEmail: boolean;
  showInCalendar: boolean;
  reminderHours: number | null;
  followUpNotification: boolean;
  enableRSVP: boolean;
}

export interface EventCreationData {
  title: string;
  description: string;
  eventType: EventType;
  isAllDay: boolean;
  startDateTime: Date;
  endDateTime: Date;
  audience: EventAudience;
  notification: EventNotification;
  isDraft: boolean;
}

export interface Event extends EventCreationData {
  id: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date | null;
  status: 'draft' | 'published' | 'cancelled';
}
