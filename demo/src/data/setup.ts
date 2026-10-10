import { CHATS, DOCS, EMAILS, LEAVES, WORK_ITEMS } from './content';
import { ENROLLMENTS } from './learning';
import { INITIAL_AGENTS, INITIAL_DIGEST_POLICY, INITIAL_RUNS } from './agents';
import { INITIAL_NOMINATIONS, INITIAL_SUGGESTIONS } from './nominations';
import { PEOPLE } from './people';
import type { AccessOption, DataSource, DemoState, Exclusions, Level, Role } from './types';

const opts = (...pairs: [Level, string][]): AccessOption[] => pairs.map(([level, label]) => ({ level, label }));
const none = (): Exclusions => ({ people: [], countries: [], jobTitles: [] });

export const INITIAL_SOURCES: DataSource[] = [
  {
    id: 'entra', name: 'Microsoft Entra ID', category: 'Identity & org', connection: 'Microsoft Graph API',
    description: 'Staff directory: names, job titles, departments, locations and managers. The foundation for everything else.',
    enabled: true, status: 'Connected', lastSync: '2026-10-10T09:00', itemCount: PEOPLE.length, owner: 'IT', readWrite: false, syncFrequency: 'Hourly',
    access: opts(['own', 'Own profile'], ['team', 'My team'], ['department', 'My department'], ['location', 'My location'], ['all', 'Full hierarchy']),
    exclusions: none(), personal: false, explorer: '/explore/directory',
  },
  {
    id: 'email', name: 'Outlook email', category: 'Communication', connection: 'Microsoft Graph API',
    description: 'Mailboxes of all staff. Used by the AI to answer questions and fill in records.',
    enabled: true, status: 'Connected', lastSync: '2026-10-10T11:30', itemCount: EMAILS.length, owner: 'IT', readWrite: false, syncFrequency: 'Every 15 min',
    access: opts(['own', 'Own mailbox'], ['department', 'Department mailboxes'], ['location', 'Same location'], ['all', 'All staff mailboxes']),
    exclusions: { people: ['meera', 'james'], countries: [], jobTitles: [] }, personal: true, explorer: '/explore/email',
  },
  {
    id: 'teams', name: 'Microsoft Teams', category: 'Communication', connection: 'Microsoft Graph API',
    description: 'Chats, channel messages and meeting transcripts.',
    enabled: true, status: 'Connected', lastSync: '2026-10-10T11:30', itemCount: CHATS.length, owner: 'IT', readWrite: false, syncFrequency: 'Every 15 min',
    access: opts(['own', 'Own chats & channels'], ['department', 'Department'], ['location', 'Same location'], ['all', 'All staff']),
    exclusions: { people: ['meera'], countries: [], jobTitles: [] }, personal: true, explorer: '/explore/teams',
  },
  {
    id: 'sharepoint', name: 'SharePoint', category: 'Documents', connection: 'Microsoft Graph API',
    description: 'Team sites and documents: proposals, SOWs, NDAs, LOEs.',
    enabled: true, status: 'Connected', lastSync: '2026-10-10T10:00', itemCount: DOCS.filter((d) => d.source === 'sharepoint').length, owner: 'IT', readWrite: false, syncFrequency: 'Hourly',
    access: opts(['own', 'Own files'], ['all', 'All sites']),
    exclusions: none(), personal: true, explorer: '/explore/documents',
  },
  {
    id: 'onedrive', name: 'OneDrive', category: 'Documents', connection: 'Microsoft Graph API',
    description: 'Personal files of each staff member.',
    enabled: true, status: 'Connected', lastSync: '2026-10-10T10:00', itemCount: DOCS.filter((d) => d.source === 'onedrive').length, owner: 'IT', readWrite: false, syncFrequency: 'Hourly',
    access: opts(['own', 'Own files'], ['all', 'All staff files']),
    exclusions: none(), personal: true, explorer: '/explore/documents',
  },
  {
    id: 'devops', name: 'Azure DevOps', category: 'Delivery', connection: 'Azure DevOps REST API',
    description: 'Organisations, projects, repos, sprints and work items.',
    enabled: true, status: 'Connected', lastSync: '2026-10-10T11:00', itemCount: WORK_ITEMS.length, owner: 'Engineering', readWrite: false, syncFrequency: 'Every 30 min',
    access: opts(['own', 'Own work items'], ['team', 'Team work items'], ['all', 'All orgs, repos, sprints, tasks']),
    exclusions: none(), personal: true, explorer: '/explore/devops',
  },
  {
    id: 'leave', name: 'Leave Management Portal', category: 'In-house portal (HR)', connection: 'Excel upload',
    description: 'Leave requests and balances. HR uploads an export every day.',
    enabled: true, status: 'Connected', lastSync: '2026-10-10T08:00', itemCount: LEAVES.length, owner: 'HR', readWrite: false, syncFrequency: 'Daily upload',
    access: opts(['own', 'Own leaves'], ['team', 'Team leaves'], ['department', 'Department leaves'], ['all', 'All leaves']),
    exclusions: none(), personal: true, explorer: '/explore/leave',
  },
  {
    id: 'nomination', name: 'Nomination Tracker', category: 'In-house portal (Sales & Marketing)', connection: 'In-house API (read + write)',
    description: 'Leads from Microsoft and their progress. AI fills in missing fields from emails.',
    enabled: true, status: 'Connected', lastSync: '2026-10-10T07:30', itemCount: INITIAL_NOMINATIONS.length, owner: 'Nomination Tracker team', readWrite: true, syncFrequency: 'Hourly',
    access: opts(['own', 'Own leads'], ['all', 'All leads']),
    exclusions: none(), personal: false, explorer: '/leads',
  },
  {
    id: 'uclms', name: 'UCLMS (Learning)', category: 'In-house portal (Learning)', connection: 'UCLMS REST API',
    description: 'UnifyCloud Learning Management System: courses, enrolments, progress, quiz and assignment scores, certificates. Used by staff and client organisations.',
    enabled: true, status: 'Connected', lastSync: '2026-10-10T10:45', itemCount: ENROLLMENTS.length, owner: 'UI/UX team', readWrite: false, syncFrequency: 'Hourly',
    access: opts(['own', 'Own learning'], ['team', 'Team learning'], ['department', 'Department learning'], ['location', 'Same location'], ['all', 'All learners + client org reports']),
    exclusions: none(), personal: true, explorer: '/explore/learning',
  },
  {
    id: 'partner', name: 'Microsoft Partner Center', category: 'Partner / sales', connection: 'Partner Center API',
    description: 'Where Microsoft shares leads (referrals) with UnifyCloud.',
    enabled: true, status: 'Connected', lastSync: '2026-10-10T06:00', itemCount: INITIAL_NOMINATIONS.length, owner: 'Sales & Marketing', readWrite: false, syncFrequency: 'Daily',
    access: opts(['all', 'View Microsoft referrals']),
    exclusions: none(), personal: false, explorer: null,
  },
  {
    id: 'provisioning', name: 'Central Provisioning System', category: 'In-house portal (IT)', connection: 'Excel upload',
    description: 'Laptops, licences and accounts provisioned for staff.',
    enabled: true, status: 'Connected', lastSync: '2026-10-09T18:00', itemCount: 42, owner: 'IT', readWrite: false, syncFrequency: 'Daily upload',
    access: opts(['own', 'Own items'], ['all', 'All records']),
    exclusions: none(), personal: true, explorer: null,
  },
];

/** Catalog shown in "Add data source". */
export const SOURCE_TEMPLATES: Omit<DataSource, 'id' | 'enabled' | 'status' | 'lastSync' | 'itemCount' | 'exclusions' | 'explorer'>[] = [
  {
    name: 'Custom Excel upload', category: 'In-house data', connection: 'Excel upload', description: 'Any team can share data as an Excel export.',
    owner: '', readWrite: false, syncFrequency: 'Manual upload', personal: true, custom: true,
    access: opts(['own', 'Own rows'], ['all', 'All rows']),
  },
  {
    name: 'Azure subscriptions', category: 'Cloud', connection: 'Azure Resource Manager API', description: 'Resources and costs across Azure subscriptions.',
    owner: 'IT', readWrite: false, syncFrequency: 'Daily', personal: false, custom: true,
    access: opts(['all', 'View resources & costs']),
  },
  {
    name: 'Custom REST API', category: 'Other', connection: 'REST API', description: 'Connect any system that exposes an API.',
    owner: '', readWrite: false, syncFrequency: 'Hourly', personal: true, custom: true,
    access: opts(['own', 'Own records'], ['all', 'All records']),
  },
];

const access = (pairs: Record<string, Level>) => pairs;

export const INITIAL_ROLES: Role[] = [
  {
    id: 'admin', name: 'Admin', description: 'Sees all data (except excluded people). Manages data sources and roles.',
    builtIn: true, isAdmin: true, everyone: false, access: {}, members: ['rahul'],
  },
  {
    id: 'employee', name: 'Employee', description: 'Everyone gets this automatically: own data only.',
    builtIn: true, isAdmin: false, everyone: true,
    access: access({ entra: 'own', email: 'own', teams: 'own', sharepoint: 'own', onedrive: 'own', devops: 'own', leave: 'own', uclms: 'own', nomination: 'own', partner: 'none', provisioning: 'own' }),
    members: [],
  },
  {
    id: 'teamlead', name: 'Team Lead', description: 'Sees their team in the directory, DevOps and leaves.',
    builtIn: false, isAdmin: false, everyone: false,
    access: access({ entra: 'team', devops: 'team', leave: 'team', uclms: 'team' }), members: ['vikram', 'nikhil'],
  },
  {
    id: 'leadership', name: 'Leadership', description: 'CEO, CTO and VPs: what is happening across the company.',
    builtIn: false, isAdmin: false, everyone: false,
    access: access({ entra: 'all', email: 'all', teams: 'all', devops: 'all', leave: 'all', uclms: 'all', nomination: 'all', partner: 'all', sharepoint: 'all' }),
    members: ['arjun', 'meera', 'sanjay', 'james'],
  },
  {
    id: 'hr', name: 'HR Leave Manager', description: 'Complete access to leave data, plus the staff directory.',
    builtIn: false, isAdmin: false, everyone: false, access: access({ leave: 'all', entra: 'all' }), members: ['pooja'],
  },
  {
    id: 'ld', name: 'Training Manager', description: 'Tracks training and compliance across all staff in UCLMS.',
    builtIn: false, isAdmin: false, everyone: false, access: access({ uclms: 'all', entra: 'all' }), members: [],
  },
  {
    id: 'itmail', name: 'IT Email Reader', description: 'Can read email of all staff (e.g. for support and compliance).',
    builtIn: false, isAdmin: false, everyone: false, access: access({ email: 'all' }), members: ['karan'],
  },
  {
    id: 'smm', name: 'Sales & Marketing Manager', description: 'Sees all leads in the Nomination Tracker and Partner Center.',
    builtIn: false, isAdmin: false, everyone: false, access: access({ nomination: 'all', partner: 'all', entra: 'department' }), members: ['sophie'],
  },
];

export function initialState(): DemoState {
  return {
    userId: null,
    sources: structuredClone(INITIAL_SOURCES),
    roles: structuredClone(INITIAL_ROLES),
    nominations: structuredClone(INITIAL_NOMINATIONS),
    suggestions: structuredClone(INITIAL_SUGGESTIONS),
    digestPolicy: structuredClone(INITIAL_DIGEST_POLICY),
    digest: {},
    agents: structuredClone(INITIAL_AGENTS),
    agentRuns: structuredClone(INITIAL_RUNS),
  };
}

/** Demo log-in accounts, with what to try as each. */
export const PERSONAS: { id: string; story: string }[] = [
  { id: 'rahul', story: 'Admin: sees everything, manages data sources and roles' },
  { id: 'meera', story: 'CTO (Leadership): "What is happening in Noida?"' },
  { id: 'vikram', story: 'Team Lead: sees only his team' },
  { id: 'sophie', story: 'Sales & Marketing Manager: all leads + AI auto-fill' },
  { id: 'pooja', story: 'HR: complete access to leaves' },
  { id: 'karan', story: 'IT Email Reader: email of all staff' },
  { id: 'ananya', story: 'TPM: her own leads and data' },
  { id: 'riya', story: 'Trainee: only her own data' },
];
