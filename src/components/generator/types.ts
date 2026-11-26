import type { ListFormat, SessionType } from '@/lib/list-rules';
import type { Asn, City, Country } from '@/lib/targeting';

export const steps = [
  { label: 'Credentials', description: 'Who connects' },
  { label: 'Targeting', description: 'Where it connects' },
  { label: 'Review', description: 'Ready to generate' },
] as const;

export type Step = 0 | 1 | 2;
export type View = 'generator' | 'list' | 'result';

export type Draft = {
  name: string;
  username: string;
  password: string;
  count: string;
  format: ListFormat;
  rotation: SessionType;
  country: Country | null;
  city: City | null;
  asn: Asn | null;
};

export type ProxySnapshot = {
  id: number;
  name: string;
  filename: string;
  country: string;
  city: string;
  format: ListFormat;
  rotation: SessionType;
  submittedAt: string;
  lines: readonly string[];
};
