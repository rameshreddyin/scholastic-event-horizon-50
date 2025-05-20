
export type EventType = 
  | 'Academic'
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

export type NoticePeriod =
  | 'same_day'
  | '1_day_before'
  | '2_days_before'
  | '3_days_before'
  | '1_week_before';

export interface AudienceSubgroup {
  id: string;
  name: string;
  group: AudienceGroup;
}

export interface NoticeSettings {
  addToNoticeBoard: boolean;
  audienceGroups: AudienceGroup[];
  noticePeriod: NoticePeriod;
  expiryDate: Date | null;
}

export interface EventCreationData {
  title: string;
  description: string;
  eventType: EventType;
  isAllDay: boolean;
  startDateTime: Date;
  endDateTime: Date;
  noticeSettings: NoticeSettings;
  isDraft: boolean;
}

export interface Event extends EventCreationData {
  id: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date | null;
  status: 'draft' | 'published' | 'cancelled';
}
