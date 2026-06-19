'use client'

import { Dropdown } from 'antd'
import { ChevronDown, LogOut, Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useLogout } from '@vokcg/api'
import { USER_ROUTES } from '@vokcg/constants'
import { useLocale } from '@vokcg/i18n'
import { useAuthStore } from '@vokcg/store'
import { UserAvatar } from '@vokcg/ui'

export function UserMenu() {
  const { t } = useLocale()
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  if (!user) return null

  return (
    <Dropdown
      trigger={['click']}
      placement="bottomRight"
      open={open}
      onOpenChange={setOpen}
      arrow={false}
      popupRender={() => (
        <div className="w-[280px] overflow-hidden rounded-2xl border border-divider bg-surface shadow-xl shadow-black/10">
          <div className="flex items-center gap-3 border-b border-divider bg-subtle/40 px-4 py-3.5">
            <UserAvatar
              username={user.username}
              avatarUrl={user.avatar_url}
              size="lg"
              className="ring-2 ring-divider"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-bold text-primary">{user.username}</p>
              <p className="mt-0.5 truncate text-[13px] text-muted">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-col gap-0.5 p-2">
            <Link
              href={USER_ROUTES.settings}
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium text-secondary transition-colors hover:bg-subtle hover:text-primary"
            >
              <Settings size={15} strokeWidth={2} className="shrink-0" />
              {t('nav.settings')}
            </Link>
            <div className="my-1 h-px bg-divider/70" />
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium text-red-500 transition-colors hover:bg-red-500/8 hover:text-red-600 dark:hover:text-red-400"
              onClick={() => {
                setOpen(false)
                logout.mutate(undefined, {
                  onSettled: () => router.push(USER_ROUTES.login),
                })
              }}
            >
              <LogOut size={15} strokeWidth={2} className="shrink-0" />
              {t('header.logout')}
            </button>
          </div>
        </div>
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        className={[
          'flex max-w-[200px] items-center gap-2 rounded-xl border py-1.5 pl-1.5 pr-2.5 transition-colors sm:max-w-none sm:pr-3',
          open
            ? 'border-accent/30 bg-accent/8'
            : 'border-divider bg-subtle/50 hover:border-divider hover:bg-subtle',
        ].join(' ')}
      >
        <UserAvatar username={user.username} avatarUrl={user.avatar_url} size="sm" />
        <span className="hidden truncate text-[13px] font-semibold text-primary md:inline">
          {user.username}
        </span>
        <ChevronDown
          size={14}
          className={[
            'hidden shrink-0 text-muted transition-transform md:block',
            open ? 'rotate-180' : '',
          ].join(' ')}
          aria-hidden
        />
      </button>
    </Dropdown>
  )
}
