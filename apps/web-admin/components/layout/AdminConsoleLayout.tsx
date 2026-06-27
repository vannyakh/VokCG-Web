"use client";

import { type ReactNode, Suspense } from "react";

import type { AdminConsoleLayoutState } from "@/hooks/use-admin-console-layout";

import { AdminHeader } from "./AdminHeader";
import { AdminSettingsDrawer } from "./AdminSettingsDrawer";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTabbar } from "./AdminTabbar";

type AdminConsoleLayoutProps = AdminConsoleLayoutState & {
  children: ReactNode;
};

export function AdminConsoleLayout({
  children,
  activeTab,
  collapsed,
  setCollapsed,
  settingsOpen,
  setSettingsOpen,
  refreshing,
  openTabs,
  tabBarVisible,
  contentClass,
  handleRefresh,
  handleTabClick,
  handleTabClose,
  handleCloseOthers,
  handleCloseAll,
  handleSortTabs,
}: AdminConsoleLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <AdminSidebar
        activeTab={activeTab}
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        onTabOpen={handleTabClick}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader
          activeTab={activeTab}
          collapsed={collapsed}
          refreshing={refreshing}
          onSidebarToggle={() => setCollapsed((c) => !c)}
          onRefresh={handleRefresh}
          onSettingsOpen={() => setSettingsOpen(true)}
        />

        {tabBarVisible && (
          <AdminTabbar
            tabs={openTabs}
            activeTab={activeTab}
            onTabClick={handleTabClick}
            onTabClose={handleTabClose}
            onSortTabs={handleSortTabs}
            onCloseOthers={handleCloseOthers}
            onCloseAll={handleCloseAll}
          />
        )}

        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-canvas">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-0 h-48"
            style={{
              background:
                "radial-gradient(ellipse 70% 100% at 50% 0%, color-mix(in srgb, var(--color-primary) 8%, transparent), transparent)",
            }}
          />

          <div className={contentClass}>
            <Suspense
              fallback={
                <div className="flex h-full w-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-default border-t-accent" />
                </div>
              }
            >
              {children}
            </Suspense>
          </div>
        </main>
      </div>

      <AdminSettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
