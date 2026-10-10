import type { Nomination, Suggestion } from './types';

/** Fields from the real "Update Nomination" popup (see docs/research/nomination-tracker.md). */
export const NOMINATION_FIELDS: { key: string; label: string }[] = [
  { key: 'crInfraStatus', label: 'CR Infra Status' },
  { key: 'cpDbStatus', label: 'CP DB Status' },
  { key: 'cpAppStatus', label: 'CP App Status' },
  { key: 'crDataCollectionStart', label: 'CR Data Collection Start Date' },
  { key: 'crDataCollectionEnd', label: 'CR Data Collection End Date' },
  { key: 'cpDataCollectionStart', label: 'CP Data Collection Start Date' },
  { key: 'cpDataCollectionEnd', label: 'CP Data Collection End Date' },
  { key: 'crDataReceiveDate', label: 'CR Data Receive Date' },
  { key: 'cpDataReceiveDate', label: 'CP Data Receive Date' },
  { key: 'ammpPartner', label: 'AMMP Partner' },
  { key: 'ammpPartnerContact', label: 'AMMP Partner Contact' },
  { key: 'loe', label: 'LOE' },
  { key: 'loeSentLink', label: 'LOE Sent Link' },
  { key: 'loeAckLink', label: 'LOE Acknowledge Received Link' },
  { key: 'poe', label: 'POE' },
  { key: 'poeReceivedLink', label: 'POE Received Link' },
  { key: 'nda', label: 'Partner Agreement/NDA' },
  { key: 'ndaLink', label: 'Partner Agreement/NDA Link' },
  { key: 'nextSteps', label: 'Next Steps' },
  { key: 'helpRequired', label: 'Help Required' },
  { key: 'accountStatus', label: 'Account Status' },
];

export const STAGES = ['New', 'LOE sent', 'Data collection', 'Assessment', 'Reporting', 'Completed'];

const SP = 'https://unifycloud.sharepoint.com/sites/Sales';

const COMPLETE: Record<string, string> = {
  crInfraStatus: 'Completed', cpDbStatus: 'Completed', cpAppStatus: 'Completed',
  crDataCollectionStart: '2026-07-21', crDataCollectionEnd: '2026-07-30', cpDataCollectionStart: '2026-07-21', cpDataCollectionEnd: '2026-08-01',
  crDataReceiveDate: '2026-07-31', cpDataReceiveDate: '2026-08-02', ammpPartner: 'Proseware Ltd', ammpPartnerContact: 'Lena Fischer',
  loe: 'Acknowledged', loeSentLink: `${SP}/Coho/LOE.pdf`, loeAckLink: `${SP}/Coho/LOE-ack.pdf`, poe: 'Received', poeReceivedLink: `${SP}/Coho/POE.pdf`,
  nda: 'Signed', ndaLink: `${SP}/Coho/NDA.pdf`, nextSteps: 'Closed – report delivered', helpRequired: 'None', accountStatus: 'Completed',
};

export const INITIAL_NOMINATIONS: Nomination[] = [
  {
    id: 'n1', accountName: 'Contoso Logistics', accountId: 'UC-CUST-005501', opportunityId: '7-3KQ81TZ2M', tpid: '1043387',
    partnerName: 'Litware Inc', partnerId: 'UC-PRT-000301', engagementType: 'Bundle1', assessmentType: 'Infra + App',
    ownerId: 'ananya', country: 'Australia', stage: 'Data collection', received: '2026-09-29',
    fields: { loe: 'Acknowledged', loeSentLink: `${SP}/Contoso/LOE.pdf`, loeAckLink: `${SP}/Contoso/LOE-ack.pdf`, accountStatus: 'Active' }, aiFields: [],
  },
  {
    id: 'n2', accountName: 'Fabrikam Retail', accountId: 'UC-CUST-005512', opportunityId: '7-3LMB2Q9XA', tpid: '1051290',
    partnerName: 'Litware Inc', partnerId: 'UC-PRT-000301', engagementType: 'Bundle2', assessmentType: 'App',
    ownerId: 'aditya', country: 'United States', stage: 'LOE sent', received: '2026-09-24',
    fields: { ammpPartner: 'Litware Inc', ammpPartnerContact: 'Sam Patel', nda: 'Signed', ndaLink: `${SP}/Fabrikam/NDA.pdf`, accountStatus: 'Active' }, aiFields: [],
  },
  {
    id: 'n3', accountName: 'Northwind Health', accountId: 'UC-CUST-005520', opportunityId: '7-3MZP0R4KD', tpid: '1060114',
    partnerName: 'Proseware Ltd', partnerId: 'UC-PRT-000287', engagementType: 'Bundle1', assessmentType: 'Infra + DB',
    ownerId: 'emily', country: 'United Kingdom', stage: 'Assessment', received: '2026-09-15',
    fields: { loe: 'Acknowledged', crDataCollectionStart: '2026-09-22', crDataCollectionEnd: '2026-10-01', ammpPartner: 'Proseware Ltd', accountStatus: 'Active' }, aiFields: [],
  },
  {
    id: 'n4', accountName: 'Tailspin Manufacturing', accountId: 'UC-CUST-005533', opportunityId: '7-3NB7Y1WQE', tpid: '1072245',
    partnerName: '—', partnerId: '—', engagementType: 'Bundle1', assessmentType: '',
    ownerId: 'kenji', country: 'Japan', stage: 'New', received: '2026-10-07',
    fields: { accountStatus: 'New' }, aiFields: [],
  },
  {
    id: 'n5', accountName: 'Woodgrove Bank', accountId: 'UC-CUST-005467', opportunityId: '7-3PCX5V8HJ', tpid: '1038812',
    partnerName: 'Litware Inc', partnerId: 'UC-PRT-000301', engagementType: 'Bundle2', assessmentType: 'Infra + App + DB',
    ownerId: 'aditya', country: 'United States', stage: 'Reporting', received: '2026-08-20',
    fields: {
      crInfraStatus: 'Completed', cpDbStatus: 'Completed', cpAppStatus: 'Completed', crDataCollectionStart: '2026-08-31', crDataCollectionEnd: '2026-09-10',
      cpDataCollectionStart: '2026-09-01', cpDataCollectionEnd: '2026-09-12', crDataReceiveDate: '2026-09-11', cpDataReceiveDate: '2026-09-13',
      ammpPartner: 'Litware Inc', ammpPartnerContact: 'Sam Patel', loe: 'Acknowledged', loeSentLink: `${SP}/Woodgrove/LOE.pdf`, loeAckLink: `${SP}/Woodgrove/LOE-ack.pdf`,
      nda: 'Signed', ndaLink: `${SP}/Woodgrove/NDA.pdf`, nextSteps: 'Present final report', accountStatus: 'Active',
    }, aiFields: [],
  },
  {
    id: 'n6', accountName: 'Adventure Works', accountId: 'UC-CUST-005525', opportunityId: '7-3QDT6U2LN', tpid: '1066309',
    partnerName: 'Litware Inc', partnerId: 'UC-PRT-000301', engagementType: 'Bundle1', assessmentType: 'Infra + App',
    ownerId: 'jack', country: 'Australia', stage: 'Data collection', received: '2026-09-30',
    fields: { loe: 'Acknowledged', accountStatus: 'Active' }, aiFields: [],
  },
  {
    id: 'n7', accountName: 'Coho Winery', accountId: 'UC-CUST-005398', opportunityId: '7-3HXW4M7PC', tpid: '1021876',
    partnerName: 'Proseware Ltd', partnerId: 'UC-PRT-000287', engagementType: 'Bundle1', assessmentType: 'Infra + App + DB',
    ownerId: 'emily', country: 'United Kingdom', stage: 'Completed', received: '2026-07-10',
    fields: { ...COMPLETE }, aiFields: [],
  },
  {
    id: 'n8', accountName: 'Alpine Ski House', accountId: 'UC-CUST-005541', opportunityId: '7-3RFE9K1TB', tpid: '1079930',
    partnerName: '—', partnerId: '—', engagementType: 'Bundle1', assessmentType: '',
    ownerId: 'ananya', country: 'Australia', stage: 'New', received: '2026-10-09',
    fields: { accountStatus: 'New' }, aiFields: [],
  },
];

let n = 0;
const s = (nominationId: string, field: string, value: string, confidence: number, emailId: string, status: Suggestion['status'] = 'hidden'): Suggestion =>
  ({ id: `s${++n}`, nominationId, field, value, confidence, emailId, status });

/** What the AI "finds" by reading emails. 'hidden' = not scanned yet; 'pending' = waiting for approval. */
export const INITIAL_SUGGESTIONS: Suggestion[] = [
  s('n1', 'crInfraStatus', 'In progress', 92, 'e1'),
  s('n1', 'crDataCollectionStart', '2026-10-06', 97, 'e1'),
  s('n1', 'crDataCollectionEnd', '2026-10-13 (expected)', 74, 'e1'),
  s('n1', 'ammpPartner', 'Litware Inc', 95, 'e2'),
  s('n1', 'ammpPartnerContact', 'Sam Patel', 93, 'e2'),
  s('n1', 'nda', 'Signed', 96, 'e2'),
  s('n1', 'ndaLink', `${SP}/Contoso/NDA-signed.pdf`, 98, 'e2'),
  s('n1', 'nextSteps', 'Review infra data on the 14 Oct call', 88, 'e2'),

  s('n2', 'loe', 'Acknowledged', 96, 'e3', 'pending'),
  s('n2', 'loeSentLink', `${SP}/Fabrikam/LOE.pdf`, 98, 'e4', 'pending'),
  s('n2', 'loeAckLink', `${SP}/Fabrikam/LOE-ack.pdf`, 97, 'e3', 'pending'),
  s('n2', 'cpAppStatus', 'Not started', 85, 'e4', 'pending'),
  s('n2', 'nextSteps', 'Schedule CloudPilot app scan', 80, 'e4', 'pending'),

  s('n3', 'crDataReceiveDate', '2026-10-03', 95, 'e5'),
  s('n3', 'crInfraStatus', 'Data received', 90, 'e5'),
  s('n3', 'cpDbStatus', 'Blocked – access approval', 86, 'e5'),
  s('n3', 'helpRequired', 'Customer DB team needs access approval before the DB scan', 91, 'e6'),

  s('n4', 'nextSteps', 'Intro call Thu 16 Oct, 10:00 JST', 94, 'e25'),

  s('n5', 'poe', 'Received', 97, 'e7', 'pending'),
  s('n5', 'poeReceivedLink', `${SP}/Woodgrove/POE.pdf`, 98, 'e7', 'pending'),

  s('n6', 'crDataCollectionStart', '2026-10-08', 96, 'e8'),
  s('n6', 'cpDataCollectionStart', '2026-10-08', 96, 'e8'),
  s('n6', 'crInfraStatus', 'In progress', 88, 'e8'),
  s('n6', 'cpAppStatus', 'In progress', 85, 'e8'),

  s('n8', 'nextSteps', 'Assign TPM and book intro call', 70, 'e9'),
];
