export type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  created_at: string;
  last_used: string | null;
};

export type ApiKeyCreateResponse = ApiKey & { secret: string };

export type AuthSession = {
  id: string;
  created_at: string;
  expires_at: string;
  ip_address?: string | null;
  user_agent?: string | null;
  is_current: boolean;
};

export type ApiKeyUsageLog = {
  id: string;
  api_key_id?: string | null;
  user_id?: string | null;
  api_key_name?: string | null;
  api_key_prefix?: string | null;
  method: string;
  path: string;
  status_code: number;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
};

export type PaginatedApiAccessLogs = {
  items: ApiKeyUsageLog[];
  page: number;
  page_size: number;
  total: number;
};
