import type { Chat, Doc, Email, Leave, Repo, Sprint, WorkItem } from './types';

const DELIVERY = ['vikram', 'ananya', 'aditya', 'emily', 'kenji', 'jack'];
const ENGINEERING = ['nikhil', 'sneha', 'priya', 'riya', 'dev'];
const MARKETING = ['sophie', 'neha', 'liam', 'hiroshi'];
const IT = ['rahul', 'karan'];

const e = (id: string, from: string, to: string[], date: string, subject: string, body: string): Email => ({ id, from, to, subject, body, date });

export const EMAILS: Email[] = [
  e('e1', 'ext:carlos', ['ananya'], '2026-10-06T09:15', 'Contoso – CloudRecon collector started',
    'Hi Ananya,\n\nWe started running the CloudRecon collector on our infrastructure on Monday 6 Oct. We expect it to finish by 13 Oct.\n\nRegards,\nCarlos'),
  e('e2', 'ananya', ['ext:carlos', 'ext:sam'], '2026-10-07T11:40', 'Contoso – NDA signed + next steps',
    'Hi Carlos,\n\nThanks for returning the signed NDA. It is saved here: https://unifycloud.sharepoint.com/sites/Sales/Contoso/NDA-signed.pdf\n\nI have copied Sam Patel from Litware Inc, our AMMP partner for this engagement.\n\nNext step: review the infra data on our 14 Oct call.\n\nAnanya'),
  e('e3', 'ext:mia', ['aditya'], '2026-10-08T16:05', 'RE: Fabrikam – Letter of Engagement',
    'Hi Aditya,\n\nWe have received and acknowledged the LOE. Signed copy: https://unifycloud.sharepoint.com/sites/Sales/Fabrikam/LOE-ack.pdf\n\nMia'),
  e('e4', 'aditya', ['ext:mia'], '2026-10-02T10:00', 'Fabrikam – Letter of Engagement',
    'Hi Mia,\n\nPlease find the LOE here: https://unifycloud.sharepoint.com/sites/Sales/Fabrikam/LOE.pdf\n\nThe application assessment (CloudPilot) has not started yet. We will schedule the app scan once the LOE is acknowledged.\n\nAditya'),
  e('e5', 'ext:oliver', ['emily'], '2026-10-03T13:30', 'Northwind – infra data uploaded',
    'Hi Emily,\n\nThe infra data was uploaded to the shared folder today (3 Oct). Our DB team needs an access approval before we can run the database scan. Can you help?\n\nOliver'),
  e('e6', 'emily', ['vikram'], '2026-10-04T09:10', 'Northwind – help needed on DB access',
    'Hi Vikram,\n\nNorthwind is blocked: their DB team needs an access approval before the CloudPilot DB scan. Can we escalate with their IT lead?\n\nEmily'),
  e('e7', 'ext:grace', ['aditya'], '2026-10-09T15:45', 'Woodgrove – Proof of Execution signed',
    'Hi Aditya,\n\nThe POE is signed and uploaded: https://unifycloud.sharepoint.com/sites/Sales/Woodgrove/POE.pdf\n\nGrace'),
  e('e8', 'ext:noah', ['jack'], '2026-10-08T08:30', 'Adventure Works – collectors running',
    'Hi Jack,\n\nBoth the CloudRecon and CloudPilot collectors started this morning (8 Oct). Infra and app data collection are now in progress.\n\nNoah'),
  e('e9', 'ext:msft', ['sophie'], '2026-10-09T03:20', 'New nomination: Alpine Ski House (Australia)',
    'A new customer nomination has been shared with UnifyCloud through Partner Center.\n\nCustomer: Alpine Ski House\nCountry: Australia\nNext step: assign a TPM and book an intro call.'),
  e('e10', 'ext:msft', ['sophie'], '2026-10-07T02:10', 'New nomination: Tailspin Manufacturing (Japan)',
    'A new customer nomination has been shared with UnifyCloud through Partner Center.\n\nCustomer: Tailspin Manufacturing\nCountry: Japan'),
  e('e11', 'sophie', ['neha'], '2026-10-08T12:00', 'Q4 campaign – AMMP webinar',
    'Hi Neha,\n\nLet us run an AMMP webinar for Australian and Japanese prospects in November. Can you prepare the invite list?\n\nSophie'),
  e('e12', 'neha', ['sophie', 'liam', 'hiroshi'], '2026-10-09T10:30', 'Webinar invite list ready',
    'Hi all,\n\nThe invite list is ready (148 contacts). Liam and Hiroshi, please review your accounts by Monday.\n\nNeha'),
  e('e13', 'james', ['sophie'], '2026-10-09T18:00', 'Pipeline review on Friday',
    'Sophie, let us review the nomination pipeline on Friday. I want to see which leads are stuck.\n\nJames'),
  e('e14', 'pooja', ['riya'], '2026-10-01T09:00', 'Welcome to UnifyCloud – onboarding checklist',
    'Hi Riya,\n\nWelcome aboard! Your onboarding checklist is in your OneDrive. Please complete the security training this week.\n\nPooja, HR'),
  e('e15', 'nikhil', ['riya'], '2026-10-06T10:00', 'Your first sprint tasks',
    'Hi Riya,\n\nFor Sprint 42 please pick up: (1) fix the login redirect loop, (2) add a loading state to the chat screen.\n\nNikhil'),
  e('e16', 'riya', ['nikhil'], '2026-10-06T10:45', 'RE: Your first sprint tasks',
    'Thanks Nikhil, I have started on the login redirect bug.\n\nRiya'),
  e('e17', 'dev', ['riya'], '2026-10-07T14:00', 'Design system walkthrough',
    'Hi Riya,\n\nShall we do a 30-minute walkthrough of our design system tomorrow at 3pm?\n\nDev'),
  e('e18', 'riya', ['dev'], '2026-10-08T09:20', 'RE: Design system walkthrough',
    '3pm works, thanks Dev!\n\nRiya'),
  e('e19', 'neha', ['riya'], '2026-10-05T11:00', 'Marketing team intro – brand guidelines',
    'Hi Riya,\n\nWelcome from the marketing team! Here are our brand guidelines for any UI work.\n\nNeha'),
  e('e20', 'rahul', ['karan'], '2026-10-02T09:30', 'Laptop provisioning for new joiners',
    'Karan, please provision 3 laptops for this week\'s joiners via the Central Provisioning System.\n\nRahul'),
  e('e21', 'karan', ['rahul'], '2026-10-06T15:10', 'Provisioning done – 3 laptops',
    'All 3 laptops are provisioned and handed over.\n\nKaran'),
  e('e22', 'meera', ['nikhil'], '2026-10-08T17:30', 'Architecture review',
    'Nikhil, please book an architecture review for the Second Brain sync workers next week.\n\nMeera'),
  e('e23', 'vikram', ['ananya', 'aditya', 'emily', 'kenji', 'jack'], '2026-10-09T13:00', 'Weekly delivery stand-up notes',
    'Team,\n\n• Contoso: collector running\n• Fabrikam: LOE acknowledged\n• Northwind: blocked on DB access\n• Tailspin: intro call next week\n• Adventure Works: collectors started\n\nVikram'),
  e('e24', 'kenji', ['ext:yuki'], '2026-10-08T10:00', 'Tailspin – intro call',
    'Yuki-san,\n\nCould we schedule an introductory call next week to discuss the assessment?\n\nKenji'),
  e('e25', 'ext:yuki', ['kenji'], '2026-10-09T09:00', 'RE: Tailspin – intro call',
    'Sato-san,\n\nThursday 16 Oct at 10:00 JST works for us.\n\nYuki'),
  e('e26', 'sneha', ['nikhil'], '2026-10-09T18:15', 'PR review: sync worker',
    'Nikhil, the sync worker PR with retry policy is ready for review.\n\nSneha'),
  e('e27', 'priya', ['sneha'], '2026-10-10T10:05', 'Question on Graph delta query',
    'Sneha, how do we store the delta token between sync runs?\n\nPriya'),
  e('e28', 'liam', ['jack'], '2026-10-07T08:00', 'Adventure Works – commercial terms',
    'Jack, commercial terms are agreed. You are clear to start the assessment.\n\nLiam'),
  e('e29', 'pooja', ['vikram'], '2026-10-09T11:00', 'Leave request – Ananya 20–24 Oct',
    'Hi Vikram,\n\nAnanya has applied for leave from 20 to 24 Oct. Please approve or reject in the leave portal.\n\nPooja'),
  e('e30', 'sanjay', ['vikram'], '2026-10-10T09:00', 'Delivery utilisation report',
    'Vikram, please share the October utilisation numbers by Monday.\n\nSanjay'),
  e('e31', 'arjun', ['meera', 'sanjay', 'james'], '2026-10-09T19:30', 'Board update',
    'Team, please send me your one-page updates for the board by Wednesday.\n\nArjun'),
  // Between two people excluded from Email: never read, so invisible to everyone (incl. Admin).
  e('e32', 'meera', ['james'], '2026-10-10T08:00', 'Confidential: Q4 org changes',
    'James, sharing the draft of the Q4 org changes. Please keep this confidential.\n\nMeera'),
];

const c = (id: string, where: string, from: string, participants: string[], date: string, text: string): Chat => ({ id, where, from, participants, date, text });

export const CHATS: Chat[] = [
  c('c1', 'Delivery Team › General', 'ananya', DELIVERY, '2026-10-10T09:40', 'Contoso collector is running, data expected on 13 Oct.'),
  c('c2', 'Delivery Team › General', 'aditya', DELIVERY, '2026-10-09T17:00', 'Fabrikam acknowledged the LOE 🎉'),
  c('c3', 'Delivery Team › General', 'emily', DELIVERY, '2026-10-10T08:15', 'Northwind is still blocked on DB access approval.'),
  c('c4', 'Delivery Team › General', 'kenji', DELIVERY, '2026-10-09T11:00', 'Tailspin intro call booked for 16 Oct.'),
  c('c5', 'Delivery Team › General', 'jack', DELIVERY, '2026-10-08T10:00', 'Adventure Works collectors started this morning.'),
  c('c6', 'Engineering › General', 'nikhil', ENGINEERING, '2026-10-10T09:00', 'Sprint 42 planning at 3pm today.'),
  c('c7', 'Engineering › General', 'sneha', ENGINEERING, '2026-10-09T18:20', 'Sync worker PR is ready for review.'),
  c('c8', 'Chat: Riya Saxena, Nikhil Bansal', 'riya', ['riya', 'nikhil'], '2026-10-10T11:30', 'Fixed the login redirect bug, PR raised.'),
  c('c9', 'Chat: Dev Khanna, Riya Saxena', 'dev', ['dev', 'riya'], '2026-10-09T16:00', 'Here is the Figma link for the chat screen.'),
  c('c10', 'Marketing › General', 'neha', MARKETING, '2026-10-09T12:00', 'Webinar landing page is live.'),
  c('c11', 'Marketing › General', 'sophie', MARKETING, '2026-10-09T09:30', 'Two new nominations from Microsoft this week: Alpine Ski House and Tailspin.'),
  c('c12', 'IT › General', 'karan', IT, '2026-10-09T19:00', 'VPN maintenance on Saturday at 2am.'),
  c('c13', 'IT › General', 'rahul', IT, '2026-10-06T15:00', 'New joiner laptops are ready.'),
  c('c14', 'Chat: Meera Iyer, Sanjay Mishra', 'meera', ['meera', 'sanjay'], '2026-10-09T20:00', "Let's review the AI roadmap on Monday."),
  c('c15', 'Engineering › General', 'priya', ENGINEERING, '2026-10-10T10:20', 'We hit Graph throttling in the test tenant. Adding a back-off.'),
  c('c16', 'Chat: Pooja Sharma, Ananya Rao', 'pooja', ['pooja', 'ananya'], '2026-10-09T11:05', 'Your leave request has been sent to Vikram for approval.'),
];

const w = (id: number, title: string, type: WorkItem['type'], state: string, assignedTo: string, sprint: string, project: string, org: string, updated: string): WorkItem =>
  ({ id, title, type, state, assignedTo, sprint, project, org, updated });

export const WORK_ITEMS: WorkItem[] = [
  w(4211, 'Fix login redirect loop', 'Bug', 'Resolved', 'riya', 'Sprint 42', 'Second Brain', 'unifycloud-eng', '2026-10-10T11:25'),
  w(4212, 'Add loading state to chat screen', 'Task', 'Active', 'riya', 'Sprint 42', 'Second Brain', 'unifycloud-eng', '2026-10-09T15:00'),
  w(4198, 'Implement Graph delta sync for mail', 'Task', 'Active', 'priya', 'Sprint 42', 'Second Brain', 'unifycloud-eng', '2026-10-10T10:10'),
  w(4199, 'Sync worker retry policy', 'Task', 'In review', 'sneha', 'Sprint 42', 'Second Brain', 'unifycloud-eng', '2026-10-09T18:10'),
  w(4150, 'pgvector spike', 'User Story', 'Done', 'sneha', 'Sprint 41', 'Second Brain', 'unifycloud-eng', '2026-10-01T16:00'),
  w(4205, 'Chat screen design v2', 'Task', 'Active', 'dev', 'Sprint 42', 'Second Brain', 'unifycloud-eng', '2026-10-09T16:05'),
  w(4200, 'Sprint 42 planning', 'Task', 'Done', 'nikhil', 'Sprint 42', 'Second Brain', 'unifycloud-eng', '2026-10-10T09:05'),
  w(3980, 'CloudAtlas – export to PDF', 'User Story', 'Active', 'sneha', 'Sprint 42', 'CloudAtlas', 'unifycloud-eng', '2026-10-08T12:00'),
  w(3981, 'CloudAtlas – fix chart legend overlap', 'Bug', 'New', 'priya', 'Sprint 42', 'CloudAtlas', 'unifycloud-eng', '2026-10-07T09:00'),
  w(5101, 'Contoso – CloudRecon data review', 'Task', 'Active', 'ananya', 'Oct W2', 'Customer Engagements', 'unifycloud-delivery', '2026-10-10T09:45'),
  w(5102, 'Fabrikam – schedule CloudPilot app scan', 'Task', 'New', 'aditya', 'Oct W2', 'Customer Engagements', 'unifycloud-delivery', '2026-10-09T17:05'),
  w(5103, 'Woodgrove – final assessment report', 'Task', 'Active', 'aditya', 'Oct W2', 'Customer Engagements', 'unifycloud-delivery', '2026-10-09T15:50'),
  w(5104, 'Northwind – DB access approval', 'Task', 'Blocked', 'emily', 'Oct W2', 'Customer Engagements', 'unifycloud-delivery', '2026-10-10T08:20'),
  w(5105, 'Tailspin – prepare intro deck', 'Task', 'Active', 'kenji', 'Oct W2', 'Customer Engagements', 'unifycloud-delivery', '2026-10-09T11:10'),
  w(5106, 'Adventure Works – monitor collectors', 'Task', 'Active', 'jack', 'Oct W2', 'Customer Engagements', 'unifycloud-delivery', '2026-10-08T10:05'),
  w(5107, 'Delivery capacity plan Q4', 'Task', 'Active', 'vikram', 'Oct W2', 'Customer Engagements', 'unifycloud-delivery', '2026-10-09T13:10'),
];

export const REPOS: Repo[] = [
  { name: 'secondbrain-web', project: 'Second Brain', org: 'unifycloud-eng', lastCommit: '2026-10-10T11:20', lastCommitBy: 'riya' },
  { name: 'secondbrain-sync', project: 'Second Brain', org: 'unifycloud-eng', lastCommit: '2026-10-09T18:05', lastCommitBy: 'sneha' },
  { name: 'cloudatlas-web', project: 'CloudAtlas', org: 'unifycloud-eng', lastCommit: '2026-10-08T11:50', lastCommitBy: 'sneha' },
  { name: 'cloudatlas-api', project: 'CloudAtlas', org: 'unifycloud-eng', lastCommit: '2026-10-07T17:30', lastCommitBy: 'priya' },
  { name: 'engagement-scripts', project: 'Customer Engagements', org: 'unifycloud-delivery', lastCommit: '2026-10-06T10:00', lastCommitBy: 'jack' },
];

export const SPRINTS: Sprint[] = [
  { name: 'Sprint 41', project: 'Second Brain', org: 'unifycloud-eng', start: '2026-09-22', end: '2026-10-03', state: 'Completed' },
  { name: 'Sprint 42', project: 'Second Brain', org: 'unifycloud-eng', start: '2026-10-06', end: '2026-10-17', state: 'Current' },
  { name: 'Sprint 43', project: 'Second Brain', org: 'unifycloud-eng', start: '2026-10-20', end: '2026-10-31', state: 'Upcoming' },
  { name: 'Oct W2', project: 'Customer Engagements', org: 'unifycloud-delivery', start: '2026-10-06', end: '2026-10-10', state: 'Current' },
];

const l = (id: string, personId: string, type: string, from: string, to: string, days: number, status: Leave['status']): Leave => ({ id, personId, type, from, to, days, status });

export const LEAVES: Leave[] = [
  l('l1', 'ananya', 'Casual', '2026-10-20', '2026-10-24', 5, 'Pending'),
  l('l2', 'riya', 'Sick', '2026-10-03', '2026-10-03', 1, 'Approved'),
  l('l3', 'priya', 'Earned', '2026-10-27', '2026-10-31', 5, 'Approved'),
  l('l4', 'emily', 'Annual', '2026-10-13', '2026-10-17', 5, 'Approved'),
  l('l5', 'jack', 'Annual', '2026-10-20', '2026-10-21', 2, 'Approved'),
  l('l6', 'sneha', 'Casual', '2026-10-15', '2026-10-15', 1, 'Pending'),
  l('l7', 'karan', 'Earned', '2026-10-23', '2026-10-23', 1, 'Approved'),
  l('l8', 'neha', 'Casual', '2026-10-13', '2026-10-13', 1, 'Approved'),
  l('l9', 'aditya', 'Sick', '2026-10-07', '2026-10-07', 1, 'Approved'),
  l('l10', 'kenji', 'Annual', '2026-10-24', '2026-10-24', 1, 'Pending'),
  l('l11', 'riya', 'Casual', '2026-10-31', '2026-10-31', 1, 'Pending'),
];

export const DOCS: Doc[] = [
  { id: 'd1', name: 'Contoso – NDA-signed.pdf', source: 'sharepoint', location: 'Sales › Contoso', ownerId: 'ananya', modified: '2026-10-07T11:35' },
  { id: 'd2', name: 'Fabrikam – LOE.pdf', source: 'sharepoint', location: 'Sales › Fabrikam', ownerId: 'aditya', modified: '2026-10-02T09:55' },
  { id: 'd3', name: 'Second Brain – architecture.pptx', source: 'sharepoint', location: 'Engineering › Design', ownerId: 'nikhil', modified: '2026-10-08T18:00' },
  { id: 'd4', name: 'Q4 Campaign plan.docx', source: 'sharepoint', location: 'Marketing › Campaigns', ownerId: 'sophie', modified: '2026-10-08T12:10' },
  { id: 'd5', name: 'Onboarding checklist.docx', source: 'onedrive', location: 'OneDrive – Riya Saxena', ownerId: 'riya', modified: '2026-10-01T09:05' },
  { id: 'd6', name: 'Chat screen notes.docx', source: 'onedrive', location: 'OneDrive – Dev Khanna', ownerId: 'dev', modified: '2026-10-09T15:40' },
  { id: 'd7', name: 'Delivery utilisation Oct.xlsx', source: 'onedrive', location: 'OneDrive – Sanjay Mishra', ownerId: 'sanjay', modified: '2026-10-10T08:50' },
  { id: 'd8', name: 'Leave policy 2026.pdf', source: 'sharepoint', location: 'HR › Policies', ownerId: 'pooja', modified: '2026-09-15T10:00' },
];
