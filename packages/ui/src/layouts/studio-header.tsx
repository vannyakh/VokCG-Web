'use client'

import { Dropdown, message } from 'antd'
import {
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sun,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { studioPageMeta, USER_ROUTES } from '@vokcg/constants'
import { useLogout } from '@vokcg/api'
import { useLocale } from '@vokcg/i18n'
import { useAuthStore, useSidebarStore } from '@vokcg/store'

import { UserAvatar } from '../components/user-avatar'
import { useColorMode } from '../components/color-mode'
import { Tooltip } from '../components/tooltip'

type StudioHeaderProps = {
  pathname: string
  isMobile?: boolean
  mobileNavOpen?: boolean
  onMenuClick?: () => void
}

function HeaderIconBtn({
  onClick,
  tooltip,
  children,
  active,
}: {
  onClick: () => void
  tooltip: string
  children: React.ReactNode
  active?: boolean
}) {
  return (
    <Tooltip content={tooltip}>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={[
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-secondary',
          active
            ? 'border-accent/30 bg-accent/10 text-accent'
            : 'border-transparent bg-subtle/60',
        ].join(' ')}
      >
        {children}
      </button>
    </Tooltip>
  )
}

export function StudioHeader({
  pathname,
  isMobile = false,
  mobileNavOpen = false,
  onMenuClick,
}: StudioHeaderProps) {
  const { t } = useLocale()
  const meta = studioPageMeta(pathname)
  const { hidden, toggleHidden } = useSidebarStore()
  const { colorMode, toggleColorMode } = useColorMode()
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const router = useRouter()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-divider bg-surface px-3 sm:gap-3 sm:px-4 md:px-5">
      <HeaderIconBtn
        tooltip={
          isMobile
            ? mobileNavOpen
              ? t('create.hideSidebar')
              : t('create.showSidebar')
            : hidden
              ? t('create.showSidebar')
              : t('create.hideSidebar')
        }
        active={isMobile ? mobileNavOpen : !hidden}
        onClick={isMobile ? (onMenuClick ?? (() => {})) : toggleHidden}
      >
        {isMobile ? (
          mobileNavOpen ? <X size={17} /> : <Menu size={17} />
        ) : hidden ? (
          <PanelLeftOpen size={17} />
        ) : (
          <PanelLeftClose size={17} />
        )}
      </HeaderIconBtn>

      <div className="hidden h-5 w-px shrink-0 bg-divider sm:block" aria-hidden />

      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden sm:flex-none"
      >
        <span className="hidden truncate text-sm font-medium text-muted md:inline">
          {t(meta.sectionKey)}
        </span>
        <ChevronRight size={14} className="hidden shrink-0 text-muted/60 md:block" aria-hidden />
        <h1 className="truncate text-sm font-bold text-primary sm:text-[15px]">{t(meta.labelKey)}</h1>
      </nav>

      <div className="hidden flex-1 lg:block" aria-hidden />

      <div className="flex shrink-0 items-center gap-2">
        <HeaderIconBtn
          tooltip={colorMode === 'dark' ? t('header.lightMode') : t('header.darkMode')}
          onClick={toggleColorMode}
        >
          {colorMode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </HeaderIconBtn>

        {user && (
          <>
            <div className="hidden h-5 w-px shrink-0 bg-divider sm:block" aria-hidden />

            <Dropdown
              trigger={['click']}
              placement="bottomRight"
              open={userMenuOpen}
              onOpenChange={setUserMenuOpen}
              arrow={false}
              popupRender={() => (
                <div className="w-[288px] overflow-hidden rounded-[18px] border border-divider bg-surface shadow-lg">
                  <div className="flex items-center gap-3.5 border-b border-divider bg-subtle/50 px-4 py-4">
                    <UserAvatar
                      username={user.username}
                      avatarUrl={user.avatar_url}
                      size="lg"
                      className="ring-2 ring-divider"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-bold text-primary">{user.username}</p>
                      <p className="mt-0.5 truncate text-sm text-muted">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5 p-2">
                    <Link
                      href={USER_ROUTES.settings}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-medium text-secondary"
                    >
                      <Settings size={16} strokeWidth={2} />
                      {t('nav.settings')}
                    </Link>
                    <div className="my-1 h-px bg-divider" />
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-medium text-red-500"
                      onClick={() => {
                        setUserMenuOpen(false)
                        logout.mutate(undefined, {
                          onSettled: () => router.push(USER_ROUTES.login),
                        })
                      }}
                    >
                      <LogOut size={16} strokeWidth={2} />
                      {t('header.logout')}
                    </button>
                  </div>
                </div>
              )}
            >
              <button
                type="button"
                aria-expanded={userMenuOpen}
                className={[
                  'flex max-w-[200px] items-center gap-2 rounded-full border py-1 pl-1 pr-2.5 sm:max-w-none sm:pr-3',
                  userMenuOpen
                    ? 'border-accent/30 bg-accent/10'
                    : 'border-divider bg-subtle/50',
                ].join(' ')}
              >
                <UserAvatar username={user.username} avatarUrl={user.avatar_url} size="md" />
                <span className="hidden truncate text-[13px] font-semibold text-primary md:inline">
                  {user.username}
                </span>
                <ChevronDown
                  size={14}
                  className={[
                    'hidden shrink-0 text-muted transition-transform md:block',
                    userMenuOpen ? 'rotate-180' : '',
                  ].join(' ')}
                  aria-hidden
                />
              </button>
            </Dropdown>
          </>
        )}
      </div>
    </header>
  )
}
