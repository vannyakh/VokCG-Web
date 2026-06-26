export type WorkspacePlan = {
  id: string;
  name: string;
  slug: string;
  price: number;
  interval: "month" | "year";
  features: string[];
};

export type WorkspaceMember = {
  id: string;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
} & Record<string, unknown>;

export type WorkspaceTenantBrief = {
  id: string;
  name: string;
  slug: string;
};

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  status: "active" | "trial" | "suspended";
  members_count: number;
  plan: WorkspacePlan | null;
  subscription_status: "active" | "trialing" | "past_due" | "canceled" | null;
  subscription_id?: string | null;
  role?: string;
  renews_at: string | null;
  mrr: number;
};

export type WorkspaceContext = {
  workspace: Workspace;
  members: WorkspaceMember[];
  tenants: WorkspaceTenantBrief[];
};
