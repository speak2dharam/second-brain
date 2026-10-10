export type Level = 'none' | 'own' | 'team' | 'department' | 'location' | 'all';

/** Narrowest → widest. Used to pick the "top" access a user has in a source. */
export const LEVEL_RANK: Level[] = ['none', 'own', 'team', 'department', 'location', 'all'];

export const LEVEL_LABEL: Record<Level, string> = {
  none: 'No access',
  own: 'Own data',
  team: 'Team',
  department: 'Department',
  location: 'Same location',
  all: 'All staff',
};

export interface Person {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  department: string;
  location: string;
  country: string;
  region: string;
  managerId: string | null;
}

export interface External {
  id: string;
  name: string;
  email: string;
  org: string;
}

export interface AccessOption {
  level: Level;
  label: string;
}

export interface Exclusions {
  people: string[];
  countries: string[];
  jobTitles: string[];
}

export type SourceStatus = 'Connected' | 'Syncing' | 'Error' | 'Not configured';

export interface DataSource {
  id: string;
  name: string;
  category: string;
  connection: string;
  description: string;
  enabled: boolean;
  status: SourceStatus;
  lastSync: string | null;
  itemCount: number;
  owner: string;
  readWrite: boolean;
  syncFrequency: string;
  /** Access types this source offers to roles (D-022). */
  access: AccessOption[];
  exclusions: Exclusions;
  /** Holds people's personal data, so exclusions apply (D-008). */
  personal: boolean;
  explorer: string | null;
  custom?: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  builtIn: boolean;
  isAdmin: boolean;
  /** Given to every signed-in user automatically. */
  everyone: boolean;
  access: Record<string, Level>;
  members: string[];
}

export interface Email {
  id: string;
  from: string;
  to: string[];
  subject: string;
  body: string;
  date: string;
}

export interface Chat {
  id: string;
  where: string;
  from: string;
  participants: string[];
  text: string;
  date: string;
}

export interface WorkItem {
  id: number;
  title: string;
  type: 'Task' | 'Bug' | 'User Story';
  state: string;
  assignedTo: string;
  sprint: string;
  project: string;
  org: string;
  updated: string;
}

export interface Repo {
  name: string;
  project: string;
  org: string;
  lastCommit: string;
  lastCommitBy: string;
}

export interface Sprint {
  name: string;
  project: string;
  org: string;
  start: string;
  end: string;
  state: 'Current' | 'Completed' | 'Upcoming';
}

export interface Leave {
  id: string;
  personId: string;
  type: string;
  from: string;
  to: string;
  days: number;
  status: 'Approved' | 'Pending' | 'Rejected';
}

export interface Doc {
  id: string;
  name: string;
  source: 'sharepoint' | 'onedrive';
  location: string;
  ownerId: string;
  modified: string;
}

/* ---------- UCLMS (learning) — shapes follow the UCLMS API (CourseListDto, UserActivityDto, OrgReportDto) ---------- */

export interface Course {
  id: string;
  title: string;
  category: string;
  status: 'Published' | 'Draft' | 'Archived';
  passingScore: number;
  modules: number;
  items: number;
  instructorId: string;
  mandatory?: boolean;
  dueDate?: string;
}

export type LearningStatus = 'Not started' | 'In progress' | 'Completed';

export interface Enrollment {
  id: string;
  personId: string;
  courseId: string;
  status: LearningStatus;
  itemsCompleted: number;
  enrolledAt: string;
  lastActivity: string;
  score?: number;
  completedAt?: string;
  certificate?: string;
}

/** Client/partner organisations in UCLMS. Their learners are not UnifyCloud staff, so only totals are shown. */
export interface ClientOrg {
  name: string;
  learners: number;
  enrollments: number;
  completed: number;
  avgScore: number;
}

export interface Nomination {
  id: string;
  accountName: string;
  accountId: string;
  opportunityId: string;
  tpid: string;
  partnerName: string;
  partnerId: string;
  engagementType: string;
  assessmentType: string;
  ownerId: string;
  country: string;
  stage: string;
  received: string;
  fields: Record<string, string>;
  aiFields: string[];
}

export interface Suggestion {
  id: string;
  nominationId: string;
  field: string;
  value: string;
  confidence: number;
  emailId: string;
  status: 'hidden' | 'pending' | 'approved' | 'rejected';
}

/* ---------- Daily digest (D-027) ---------- */

export type DigestChannel = 'email' | 'teams' | 'app';

export interface DigestSettings {
  enabled: boolean;
  time: string;
  days: 'weekdays' | 'everyday';
  channels: DigestChannel[];
  sections: string[];
}

export interface DigestPolicy {
  defaultEnabled: boolean;
  defaultTime: string;
  allowedChannels: DigestChannel[];
}

/* ---------- AI agents (D-028 – D-030) ---------- */

export type Autonomy = 'read' | 'suggest' | 'auto';
export type Trigger = 'new-email' | 'after-meeting' | 'hourly' | 'daily' | 'weekly' | 'manual';

export interface Agent {
  id: string;
  name: string;
  purpose: string;
  builtIn: boolean;
  enabled: boolean;
  trigger: Trigger;
  time: string;
  sources: string[];
  writesTo: string | null;
  autonomy: Autonomy;
  autoThreshold: number;
  instructions: string;
  notify: string[];
  monthlyBudget: number;
}

export interface AgentRun {
  id: string;
  agentId: string;
  at: string;
  status: 'Success' | 'Partial' | 'Failed';
  processed: number;
  produced: number;
  approved: number;
  rejected: number;
  cost: number;
  note: string;
}

export interface DemoState {
  userId: string | null;
  sources: DataSource[];
  roles: Role[];
  nominations: Nomination[];
  suggestions: Suggestion[];
  digestPolicy: DigestPolicy;
  digest: Record<string, DigestSettings>;
  agents: Agent[];
  agentRuns: AgentRun[];
}
