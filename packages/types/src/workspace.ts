export type WorkspacePlan = {
  id: string
  name: string
  slug: string
  price: number
  interval: 'month' | 'year'
  features: string[]
}

export type Workspace = {
  id: string
  name: string
  slug: string
  status: 'active' | 'trial' | 'suspended'
  members_count: number
  plan: WorkspacePlan | null
  subscription_status: 'active' | 'trialing' | 'past_due' | 'canceled' | null
  subscription_id?: string | null
  role?: string
  renews_at: string | null
  mrr: number
}
