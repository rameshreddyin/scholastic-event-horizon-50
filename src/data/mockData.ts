
import { Event, AudienceSubgroup } from '../types/events';

// Mock audience subgroups data
export const audienceSubgroups: AudienceSubgroup[] = [
  // Parents subgroups (classes)
  { id: 'p-class1', name: 'Class 1 Parents', group: 'Parents' },
  { id: 'p-class2', name: 'Class 2 Parents', group: 'Parents' },
  { id: 'p-class3', name: 'Class 3 Parents', group: 'Parents' },
  { id: 'p-class4', name: 'Class 4 Parents', group: 'Parents' },
  { id: 'p-class5', name: 'Class 5 Parents', group: 'Parents' },
  
  // Teachers subgroups (subjects/departments)
  { id: 't-math', name: 'Mathematics', group: 'Teachers' },
  { id: 't-science', name: 'Science', group: 'Teachers' },
  { id: 't-english', name: 'English', group: 'Teachers' },
  { id: 't-history', name: 'History', group: 'Teachers' },
  { id: 't-arts', name: 'Arts', group: 'Teachers' },
  
  // Students subgroups (grades)
  { id: 's-grade1', name: 'Grade 1', group: 'Students' },
  { id: 's-grade2', name: 'Grade 2', group: 'Students' },
  { id: 's-grade3', name: 'Grade 3', group: 'Students' },
  { id: 's-grade4', name: 'Grade 4', group: 'Students' },
  { id: 's-grade5', name: 'Grade 5', group: 'Students' },
  
  // Staff subgroups (departments)
  { id: 'st-admin', name: 'Administration', group: 'Staff' },
  { id: 'st-IT', name: 'IT Department', group: 'Staff' },
  { id: 'st-maintenance', name: 'Maintenance', group: 'Staff' },
  { id: 'st-library', name: 'Library', group: 'Staff' },
  
  // Administrators subgroups
  { id: 'a-principal', name: 'Principal', group: 'Administrators' },
  { id: 'a-vice-principal', name: 'Vice Principal', group: 'Administrators' },
  { id: 'a-coordinator', name: 'Coordinators', group: 'Administrators' },
];

// Mock events data
export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Parent-Teacher Meeting',
    description: 'Quarterly parent-teacher meeting to discuss student progress',
    eventType: 'Meeting',
    isAllDay: false,
    startDateTime: new Date('2025-05-20T14:00:00'),
    endDateTime: new Date('2025-05-20T17:00:00'),
    audience: {
      groups: ['Parents', 'Teachers'],
      subgroups: ['p-class1', 'p-class2', 'p-class3', 't-math', 't-science'],
      isEveryone: false
    },
    notification: {
      sendPush: true,
      sendEmail: true,
      showInCalendar: true,
      reminderHours: 24,
      followUpNotification: false,
      enableRSVP: true
    },
    createdBy: 'Admin',
    createdAt: new Date('2025-05-01T10:30:00'),
    updatedAt: null,
    status: 'published',
    isDraft: false
  },
  {
    id: '2',
    title: 'Annual Sports Day',
    description: 'Annual sports competition for all students',
    eventType: 'Cultural Program',
    isAllDay: true,
    startDateTime: new Date('2025-05-25T09:00:00'),
    endDateTime: new Date('2025-05-25T16:00:00'),
    audience: {
      groups: ['Parents', 'Students', 'Teachers', 'Staff'],
      subgroups: [],
      isEveryone: true
    },
    notification: {
      sendPush: true,
      sendEmail: true,
      showInCalendar: true,
      reminderHours: 48,
      followUpNotification: true,
      enableRSVP: false
    },
    createdBy: 'Sports Teacher',
    createdAt: new Date('2025-04-15T11:20:00'),
    updatedAt: new Date('2025-04-20T15:45:00'),
    status: 'published',
    isDraft: false
  },
  {
    id: '3',
    title: 'Final Exams',
    description: 'End-of-year final examinations for all grades',
    eventType: 'Exam',
    isAllDay: true,
    startDateTime: new Date('2025-06-05T08:00:00'),
    endDateTime: new Date('2025-06-15T16:00:00'),
    audience: {
      groups: ['Students', 'Teachers', 'Parents'],
      subgroups: ['s-grade1', 's-grade2', 's-grade3', 's-grade4', 's-grade5'],
      isEveryone: false
    },
    notification: {
      sendPush: true,
      sendEmail: true,
      showInCalendar: true,
      reminderHours: 72,
      followUpNotification: false,
      enableRSVP: false
    },
    createdBy: 'Academic Coordinator',
    createdAt: new Date('2025-03-10T09:15:00'),
    updatedAt: null,
    status: 'published',
    isDraft: false
  },
  {
    id: '4',
    title: 'Teacher Training Workshop',
    description: 'Professional development workshop for all teaching staff',
    eventType: 'Meeting',
    isAllDay: false,
    startDateTime: new Date('2025-05-15T10:00:00'),
    endDateTime: new Date('2025-05-15T15:00:00'),
    audience: {
      groups: ['Teachers'],
      subgroups: ['t-math', 't-science', 't-english', 't-history', 't-arts'],
      isEveryone: false
    },
    notification: {
      sendPush: true,
      sendEmail: true,
      showInCalendar: true,
      reminderHours: 24,
      followUpNotification: false,
      enableRSVP: true
    },
    createdBy: 'Principal',
    createdAt: new Date('2025-04-25T14:20:00'),
    updatedAt: null,
    status: 'draft',
    isDraft: true
  }
];
