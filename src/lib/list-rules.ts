export const formats = ['http', 'https', 'socks5', 'socks5h'] as const;
export const sessionTypes = ['sticky', 'rotating'] as const;

export const listRules = {
  defaultCount: 100,
  minCount: 1,
  maxCount: 1000,
  defaultFormat: 'http',
  defaultSessionType: 'sticky',
  maxNameLength: 60,
} as const;

export type ListFormat = (typeof formats)[number];
export type SessionType = (typeof sessionTypes)[number];

export type ListRequest = {
  proxy_user_id: string;
  proxy_user_password: string;
  list_count: number;
  list_format: ListFormat;
  list_session_type: SessionType;
  country_id?: string;
  city_alias?: string;
  asn_id?: number;
};

export function rotationLabel(type: SessionType) {
  return type === 'sticky' ? 'Sticky' : 'Rotating';
}
