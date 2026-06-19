import { redirect } from 'next/navigation'

import { ADMIN_ROUTES } from '@vokcg/constants'

export default function AdminHomePage() {
  redirect(ADMIN_ROUTES.overview)
}
