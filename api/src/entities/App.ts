
import { Entity } from '@collabsoft-net/types';

export interface App extends Entity {
  name: string;
  key: string;
  active: boolean;
  slug: string;
  summary: string;
  tagline: string;
  createdAt: string;
  categories: Array<string>;
  logoId: string;
  hosting: Array<'CLOUD'|'SERVER'|'DATA_CENTER'>;
  isPaid: boolean;
  host: Array<'confluence'|'jira'>;
  scopes: Array<string>;
  partnerName: string;
  partnerId: string;
  partnerSlug: string;
  totalInstalls: number;
  totalUsers: number;
}