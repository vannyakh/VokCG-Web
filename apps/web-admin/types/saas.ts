export type TenantStatus = "active" | "trial" | "suspended";
export type PlanInterval = "month" | "year";
export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "canceled"
  | "trialing";

export type Plan = {
  id: string;
  name: string;
  slug: string;
  price: number;
  interval: PlanInterval;
  features: string[];
  subscribers: number;
  active: boolean;
  stripe_price_id?: string | null;
  created_at: string;
};

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  plan: string | null;
  plan_id: string | null;
  users: number;
  status: TenantStatus;
  mrr: number;
  stripe_customer_id?: string | null;
  created_at: string;
};

export type Subscription = {
  id: string;
  tenant_id: string;
  tenant: string;
  plan_id: string;
  plan: string;
  status: SubscriptionStatus;
  amount: number;
  renews_at: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  created_at: string;
};

export type PlanCreateInput = {
  name: string;
  slug: string;
  price: number;
  interval: PlanInterval;
  features: string[];
  active: boolean;
  stripe_price_id?: string | null;
};

export type PlanUpdateInput = Partial<PlanCreateInput>;

export type TenantCreateInput = {
  name: string;
  slug: string;
  status: TenantStatus;
  plan_id?: string | null;
  members_count: number;
};

export type TenantUpdateInput = Partial<TenantCreateInput>;

export type SubscriptionCreateInput = {
  tenant_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  amount?: number;
  renews_at?: string | null;
};

export type SubscriptionUpdateInput = {
  plan_id?: string;
  status?: SubscriptionStatus;
  amount?: number;
  renews_at?: string | null;
};
