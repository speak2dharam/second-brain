/**
 * Mock UCLMS data (UnifyCloud Learning Management System, https://ucelearning.azurewebsites.net).
 * In the real app this comes from the UCLMS REST API: /api/courses, /api/users/{id}/activity,
 * /api/reports/org/{id}, /api/reports/course/{id}. See docs/research/uclms.md.
 */
import type { ClientOrg, Course, Enrollment, LearningStatus } from './types';

export const COURSES: Course[] = [
  { id: 'lc1', title: 'Information Security & Data Privacy 2026', category: 'Compliance', status: 'Published', passingScore: 80, modules: 4, items: 8, instructorId: 'rahul', mandatory: true, dueDate: '2026-10-31' },
  { id: 'lc2', title: 'New Joiner Onboarding', category: 'Onboarding', status: 'Published', passingScore: 70, modules: 3, items: 6, instructorId: 'pooja' },
  { id: 'lc3', title: 'CloudAtlas Fundamentals', category: 'Product training', status: 'Published', passingScore: 70, modules: 5, items: 10, instructorId: 'sneha' },
  { id: 'lc4', title: 'CloudPilot: App & DB Assessments', category: 'Product training', status: 'Published', passingScore: 75, modules: 6, items: 12, instructorId: 'sneha' },
  { id: 'lc5', title: 'AMMP Partner Playbook', category: 'Sales enablement', status: 'Published', passingScore: 70, modules: 4, items: 7, instructorId: 'sophie' },
  { id: 'lc6', title: 'Second Brain for Admins', category: 'Internal tools', status: 'Draft', passingScore: 70, modules: 2, items: 5, instructorId: 'nikhil' },
];

const ITEMS = new Map(COURSES.map((c) => [c.id, c.items]));
let n = 0;
let cert = 1040;

function en(personId: string, courseId: string, status: LearningStatus, done: number, enrolledAt: string, lastActivity: string, score?: number, completedAt?: string): Enrollment {
  const items = ITEMS.get(courseId)!;
  return {
    id: `en${++n}`, personId, courseId, status,
    itemsCompleted: status === 'Completed' ? items : done,
    enrolledAt, lastActivity: completedAt ?? lastActivity, score, completedAt,
    certificate: status === 'Completed' ? `UC-CERT-${++cert}` : undefined,
  };
}

export const ENROLLMENTS: Enrollment[] = [
  // Mandatory security & privacy training: everyone, due 31 Oct
  en('arjun', 'lc1', 'Completed', 8, '2026-09-15', '', 94, '2026-09-22T10:00'),
  en('meera', 'lc1', 'In progress', 5, '2026-09-15', '2026-10-08T21:10', 88),
  en('sanjay', 'lc1', 'Completed', 8, '2026-09-15', '', 90, '2026-09-25T18:30'),
  en('james', 'lc1', 'In progress', 3, '2026-09-15', '2026-10-01T15:00'),
  en('pooja', 'lc1', 'Completed', 8, '2026-09-15', '', 97, '2026-09-18T11:20'),
  en('rahul', 'lc1', 'Completed', 8, '2026-09-15', '', 98, '2026-09-16T09:45'),
  en('karan', 'lc1', 'Completed', 8, '2026-09-15', '', 92, '2026-09-19T16:00'),
  en('sophie', 'lc1', 'Completed', 8, '2026-09-15', '', 89, '2026-09-29T12:15'),
  en('neha', 'lc1', 'In progress', 6, '2026-09-15', '2026-10-09T17:40', 84),
  en('liam', 'lc1', 'In progress', 2, '2026-09-15', '2026-09-30T08:10'),
  en('hiroshi', 'lc1', 'Not started', 0, '2026-09-15', '2026-09-15'),
  en('vikram', 'lc1', 'Completed', 8, '2026-09-15', '', 91, '2026-10-02T19:05'),
  en('ananya', 'lc1', 'Completed', 8, '2026-09-15', '', 95, '2026-09-24T14:30'),
  en('aditya', 'lc1', 'Completed', 8, '2026-09-15', '', 86, '2026-10-06T13:00'),
  en('emily', 'lc1', 'Not started', 0, '2026-09-15', '2026-09-15'),
  en('kenji', 'lc1', 'In progress', 4, '2026-09-15', '2026-10-07T10:20', 81),
  en('jack', 'lc1', 'Not started', 0, '2026-09-15', '2026-09-15'),
  en('nikhil', 'lc1', 'Completed', 8, '2026-09-15', '', 93, '2026-09-21T20:00'),
  en('sneha', 'lc1', 'Completed', 8, '2026-09-15', '', 96, '2026-09-17T09:30'),
  en('priya', 'lc1', 'In progress', 7, '2026-09-15', '2026-10-10T09:15', 90),
  en('riya', 'lc1', 'In progress', 3, '2026-10-01', '2026-10-09T18:00', 85),
  en('dev', 'lc1', 'Completed', 8, '2026-09-15', '', 88, '2026-10-03T11:10'),

  // Onboarding
  en('riya', 'lc2', 'In progress', 4, '2026-10-01', '2026-10-10T10:30', 90),

  // Product training
  en('riya', 'lc3', 'Not started', 0, '2026-10-06', '2026-10-06'),
  en('priya', 'lc3', 'Completed', 10, '2026-08-01', '', 91, '2026-08-20T17:00'),
  en('dev', 'lc3', 'In progress', 6, '2026-09-01', '2026-10-08T15:30', 86),
  en('ananya', 'lc3', 'Completed', 10, '2026-07-10', '', 88, '2026-08-05T12:00'),
  en('jack', 'lc3', 'In progress', 7, '2026-08-15', '2026-10-05T09:00', 79),
  en('kenji', 'lc3', 'Completed', 10, '2026-07-20', '', 85, '2026-08-28T11:30'),
  en('liam', 'lc3', 'In progress', 3, '2026-09-10', '2026-09-26T14:00', 72),
  en('aditya', 'lc4', 'Completed', 12, '2026-06-01', '', 93, '2026-07-15T16:45'),
  en('emily', 'lc4', 'In progress', 9, '2026-08-01', '2026-10-09T13:20', 87),
  en('kenji', 'lc4', 'In progress', 5, '2026-09-01', '2026-10-06T08:40', 80),
  en('sneha', 'lc4', 'Completed', 12, '2026-05-15', '', 96, '2026-06-20T10:00'),
  en('ananya', 'lc4', 'In progress', 8, '2026-09-05', '2026-10-10T08:50', 89),

  // Sales enablement
  en('sophie', 'lc5', 'Completed', 7, '2026-08-01', '', 90, '2026-08-18T09:00'),
  en('liam', 'lc5', 'Completed', 7, '2026-08-01', '', 84, '2026-09-02T07:30'),
  en('hiroshi', 'lc5', 'In progress', 4, '2026-08-01', '2026-10-08T11:15', 78),
  en('neha', 'lc5', 'In progress', 5, '2026-09-01', '2026-10-09T16:00', 82),
  en('james', 'lc5', 'Not started', 0, '2026-09-01', '2026-09-01'),
  en('ananya', 'lc5', 'Completed', 7, '2026-08-10', '', 87, '2026-09-12T10:40'),
  en('aditya', 'lc5', 'In progress', 2, '2026-09-20', '2026-10-04T12:00', 75),
];

export const CLIENT_ORGS: ClientOrg[] = [
  { name: 'Litware Inc (partner)', learners: 14, enrollments: 31, completed: 22, avgScore: 84.5 },
  { name: 'Contoso Logistics (customer)', learners: 9, enrollments: 12, completed: 5, avgScore: 79.2 },
  { name: 'Fabrikam Retail (customer)', learners: 6, enrollments: 6, completed: 1, avgScore: 72.0 },
];

const courseById = new Map(COURSES.map((c) => [c.id, c]));
export const courseOf = (id: string) => courseById.get(id)!;
