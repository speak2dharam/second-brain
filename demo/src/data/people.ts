import type { External, Person } from './types';

const LOCATIONS: Record<string, [country: string, region: string]> = {
  Noida: ['India', 'APAC'],
  Sydney: ['Australia', 'APAC'],
  Tokyo: ['Japan', 'APAC'],
  London: ['United Kingdom', 'EMEA'],
  'New York': ['United States', 'Americas'],
};

function p(id: string, name: string, jobTitle: string, department: string, location: string, managerId: string | null): Person {
  const [country, region] = LOCATIONS[location];
  const email = name.toLowerCase().replace(/[^a-z ]/g, '').split(' ').join('.') + '@unifycloud.com';
  return { id, name, email, jobTitle, department, location, country, region, managerId };
}

/** Fictional staff for the demo. */
export const PEOPLE: Person[] = [
  p('arjun', 'Arjun Kapoor', 'CEO', 'Leadership', 'Noida', null),
  p('meera', 'Meera Iyer', 'CTO', 'Leadership', 'Noida', 'arjun'),
  p('sanjay', 'Sanjay Mishra', 'VP Delivery', 'Leadership', 'Noida', 'arjun'),
  p('james', 'James Carter', 'VP Sales', 'Sales', 'New York', 'arjun'),
  p('pooja', 'Pooja Sharma', 'HR Manager', 'HR', 'Noida', 'arjun'),
  p('rahul', 'Rahul Verma', 'IT Administrator', 'IT', 'Noida', 'meera'),
  p('karan', 'Karan Malhotra', 'IT Engineer', 'IT', 'Noida', 'rahul'),
  p('sophie', 'Sophie Turner', 'Sales & Marketing Manager', 'Marketing', 'London', 'james'),
  p('neha', 'Neha Gupta', 'Marketing Executive', 'Marketing', 'Noida', 'sophie'),
  p('liam', "Liam O'Brien", 'Account Executive', 'Sales', 'Sydney', 'james'),
  p('hiroshi', 'Hiroshi Tanaka', 'Account Executive', 'Sales', 'Tokyo', 'james'),
  p('vikram', 'Vikram Singh', 'Delivery Team Lead', 'Delivery', 'Noida', 'sanjay'),
  p('ananya', 'Ananya Rao', 'Technical Project Manager', 'Delivery', 'Noida', 'vikram'),
  p('aditya', 'Aditya Joshi', 'Technical Project Manager', 'Delivery', 'Noida', 'vikram'),
  p('emily', 'Emily Clarke', 'Technical Project Manager', 'Delivery', 'London', 'vikram'),
  p('kenji', 'Kenji Sato', 'Technical Project Manager', 'Delivery', 'Tokyo', 'vikram'),
  p('jack', 'Jack Wilson', 'Technical Project Manager', 'Delivery', 'Sydney', 'vikram'),
  p('nikhil', 'Nikhil Bansal', 'Engineering Team Lead', 'Engineering', 'Noida', 'meera'),
  p('sneha', 'Sneha Patel', 'Senior Developer', 'Engineering', 'Noida', 'nikhil'),
  p('priya', 'Priya Nair', 'Developer', 'Engineering', 'Noida', 'nikhil'),
  p('riya', 'Riya Saxena', 'Trainee Developer', 'Engineering', 'Noida', 'nikhil'),
  p('dev', 'Dev Khanna', 'UI/UX Designer', 'Engineering', 'Noida', 'nikhil'),
];

export const EXTERNALS: External[] = [
  { id: 'ext:carlos', name: 'Carlos Ruiz', email: 'carlos.ruiz@contoso.com', org: 'Contoso Logistics' },
  { id: 'ext:mia', name: 'Mia Chen', email: 'mia.chen@fabrikam.com', org: 'Fabrikam Retail' },
  { id: 'ext:oliver', name: 'Oliver Hughes', email: 'oliver.hughes@northwindhealth.co.uk', org: 'Northwind Health' },
  { id: 'ext:yuki', name: 'Yuki Mori', email: 'yuki.mori@tailspin.jp', org: 'Tailspin Manufacturing' },
  { id: 'ext:grace', name: 'Grace Lee', email: 'grace.lee@woodgrovebank.com', org: 'Woodgrove Bank' },
  { id: 'ext:noah', name: 'Noah Kim', email: 'noah.kim@adventure-works.com.au', org: 'Adventure Works' },
  { id: 'ext:sam', name: 'Sam Patel', email: 'sam.patel@litware.com', org: 'Litware Inc (AMMP partner)' },
  { id: 'ext:msft', name: 'Microsoft Partner Referrals', email: 'referrals@microsoft.com', org: 'Microsoft' },
];

export const LOCATION_NAMES = Object.keys(LOCATIONS);
export const COUNTRIES = Array.from(new Set(Object.values(LOCATIONS).map(([c]) => c)));
export const DEPARTMENTS = Array.from(new Set(PEOPLE.map((x) => x.department)));
export const JOB_TITLES = Array.from(new Set(PEOPLE.map((x) => x.jobTitle)));

const byId = new Map(PEOPLE.map((x) => [x.id, x]));
const extById = new Map(EXTERNALS.map((x) => [x.id, x]));

export const personById = (id: string): Person | undefined => byId.get(id);
export const externalById = (id: string): External | undefined => extById.get(id);

export function nameOf(id: string): string {
  return byId.get(id)?.name ?? extById.get(id)?.name ?? id;
}

export function isUnder(personId: string, managerId: string): boolean {
  let cur = byId.get(personId);
  for (let guard = 0; cur?.managerId && guard < 20; guard++) {
    if (cur.managerId === managerId) return true;
    cur = byId.get(cur.managerId);
  }
  return false;
}
