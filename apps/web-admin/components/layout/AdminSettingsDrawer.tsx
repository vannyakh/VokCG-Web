"use client";

import { App, Drawer, Slider, Switch } from "antd";
import {
  Check,
  ClipboardCopy,
  Monitor,
  Moon,
  RotateCcw,
  Sun,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useTheme } from "next-themes";
import {
  ADMIN_PREFERENCE_TABS,
  ADMIN_SHORTCUTS,
  ADMIN_SIDEBAR,
  exportAdminPreferencesSnapshot,
  PRESET_COLORS,
  PREFERENCES_DRAWER_WIDTH,
  THEME_MODE_OPTIONS,
  type AdminPreferenceTabId,
} from "@vokcg/config";
import { ThemePreview } from "./ThemePreview";
import { useAdminUiStore } from "@/store";

type Props = { open: boolean; onClose: () => void };

const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor } as const;

function BlockTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] font-semibold text-primary">{children}</p>;
}

function SettingRow({
  label,
  hint,
  children,
  disabled,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center justify-between gap-4 py-2.5",
        disabled ? "opacity-40 pointer-events-none" : "",
      ].join(" ")}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-primary">{label}</p>
        {hint && <p className="mt-0.5 text-[11px] text-muted">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SettingBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-1">
      <BlockTitle>{title}</BlockTitle>
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

function HeaderIconBtn({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-subtle hover:text-primary"
    >
      {children}
    </button>
  );
}

export function AdminSettingsDrawer({ open, onClose }: Props) {
  const { message } = App.useApp();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] =
    useState<AdminPreferenceTabId>("appearance");

  const {
    primaryColor,
    setPrimaryColor,
    sidebarWidth,
    setSidebarWidth,
    sidebarMiniMode,
    setSidebarMiniMode,
    sidebarHoverExpand,
    setSidebarHoverExpand,
    contentCompact,
    setContentCompact,
    tabBarVisible,
    setTabBarVisible,
    tabBarDraggable,
    setTabBarDraggable,
    tabBarWheelScroll,
    setTabBarWheelScroll,
    tabBarShowIcons,
    setTabBarShowIcons,
    resetTabSession,
    resetPreferences,
  } = useAdminUiStore();

  const handleReset = useCallback(() => {
    resetPreferences();
    setTheme("system");
    message.success("Preferences reset to defaults");
  }, [message, resetPreferences, setTheme]);

  const handleCopy = useCallback(() => {
    const prefs = useAdminUiStore.getState();
    const payload = exportAdminPreferencesSnapshot(
      {
        primaryColor: prefs.primaryColor,
        sidebarWidth: prefs.sidebarWidth,
        sidebarMiniMode: prefs.sidebarMiniMode,
        sidebarHoverExpand: prefs.sidebarHoverExpand,
        contentCompact: prefs.contentCompact,
        tabBarVisible: prefs.tabBarVisible,
        tabBarDraggable: prefs.tabBarDraggable,
        tabBarWheelScroll: prefs.tabBarWheelScroll,
        tabBarShowIcons: prefs.tabBarShowIcons,
      },
      theme,
    );
    void navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    message.success("Preferences copied to clipboard");
  }, [message, theme]);

  return (
    <Drawer
      placement="right"
      size={PREFERENCES_DRAWER_WIDTH}
      open={open}
      onClose={onClose}
      closable={false}
      title={null}
      styles={{
        header: { display: "none" },
        body: {
          padding: 0,
          background: "var(--bg-surface)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-default px-4 pb-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-[15px] font-bold leading-tight text-primary">
              Preferences
            </h2>
            <p className="mt-0.5 text-[11px] text-muted">
              Customize settings &amp; live preview
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <HeaderIconBtn title="Reset to defaults" onClick={handleReset}>
              <RotateCcw size={14} />
            </HeaderIconBtn>
            <HeaderIconBtn title="Copy preferences" onClick={handleCopy}>
              <ClipboardCopy size={14} />
            </HeaderIconBtn>
            <HeaderIconBtn title="Close" onClick={onClose}>
              <X size={15} />
            </HeaderIconBtn>
          </div>
        </div>

        {/* ── Tab nav (Vben segmented) ─────────────────────── */}
        <div className="mt-3.5 rounded-lg bg-canvas p-1">
          <div className="flex gap-0.5">
            {ADMIN_PREFERENCE_TABS.map(({ id, label }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={[
                    "flex-1 rounded-md px-1 py-1.5 text-center text-[11px] font-medium transition-all duration-150",
                    isActive
                      ? "bg-surface text-accent shadow-sm"
                      : "text-muted hover:text-secondary",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Tab content ────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {activeTab === "appearance" && (
          <div className="flex flex-col gap-6">
            <SettingBlock title="Theme mode">
              <div className="grid grid-cols-3 gap-2 pt-1">
                {THEME_MODE_OPTIONS.map(({ id, label }) => {
                  const isActive = theme === id;
                  const Icon = THEME_ICONS[id];
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setTheme(id)}
                      className={[
                        "group flex flex-col items-center gap-2 rounded-lg border py-3 transition-all duration-150",
                        isActive
                          ? "border-accent bg-accent-muted"
                          : "border-default bg-canvas hover:border-accent/40",
                      ].join(" ")}
                    >
                      <Icon
                        size={15}
                        strokeWidth={isActive ? 2.2 : 1.6}
                        className={
                          isActive
                            ? "text-accent"
                            : "text-muted group-hover:text-secondary"
                        }
                      />
                      <span
                        className={[
                          "text-[11px] leading-none",
                          isActive
                            ? "font-semibold text-accent"
                            : "font-medium text-secondary",
                        ].join(" ")}
                      >
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </SettingBlock>

            <SettingBlock title="Accent color">
              <div className="grid grid-cols-6 gap-2 pt-1">
                {PRESET_COLORS.map(({ name, value }) => {
                  const isActive = primaryColor === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      title={name}
                      onClick={() => setPrimaryColor(value)}
                      className="group flex flex-col items-center gap-1.5"
                    >
                      <div
                        className={[
                          "flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all duration-150",
                          isActive
                            ? "scale-110 border-white/80 shadow-md dark:border-white/30"
                            : "border-transparent hover:scale-105",
                        ].join(" ")}
                        style={{ backgroundColor: value }}
                      >
                        {isActive && (
                          <Check
                            size={11}
                            className="text-white"
                            strokeWidth={3}
                          />
                        )}
                      </div>
                      <span
                        className={[
                          "text-[9px] leading-none",
                          isActive
                            ? "font-semibold text-primary"
                            : "font-medium text-muted",
                        ].join(" ")}
                      >
                        {name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </SettingBlock>

            <ThemePreview />
          </div>
        )}

        {activeTab === "layout" && (
          <div className="flex flex-col gap-6">
            <SettingBlock title="Sidebar">
              <SettingRow
                label="Mini (icon-only) mode"
                hint="Always show collapsed sidebar"
              >
                <Switch
                  size="small"
                  checked={sidebarMiniMode}
                  onChange={setSidebarMiniMode}
                />
              </SettingRow>
              <SettingRow
                label="Expand on hover"
                hint="Fly-out when cursor enters sidebar"
                disabled={!sidebarMiniMode}
              >
                <Switch
                  size="small"
                  checked={sidebarHoverExpand}
                  onChange={setSidebarHoverExpand}
                  disabled={!sidebarMiniMode}
                />
              </SettingRow>
              <div
                className={
                  sidebarMiniMode ? "opacity-40 pointer-events-none" : ""
                }
              >
                <div className="flex items-center justify-between py-2">
                  <span className="text-[13px] font-medium text-primary">
                    Expanded width
                  </span>
                  <span className="rounded bg-subtle px-1.5 py-0.5 font-mono text-[10px] font-bold text-secondary">
                    {sidebarWidth}px
                  </span>
                </div>
                <Slider
                  min={ADMIN_SIDEBAR.widthMin}
                  max={ADMIN_SIDEBAR.widthMax}
                  step={ADMIN_SIDEBAR.widthStep}
                  value={sidebarWidth}
                  onChange={setSidebarWidth}
                  disabled={sidebarMiniMode}
                  tooltip={{ open: false }}
                />
                <div className="flex justify-between text-[10px] text-muted">
                  <span>{ADMIN_SIDEBAR.widthMin}</span>
                  <span>{ADMIN_SIDEBAR.widthMax}</span>
                </div>
              </div>
            </SettingBlock>

            <SettingBlock title="Tab bar">
              <SettingRow
                label="Show tab bar"
                hint="Multi-tab navigation strip"
              >
                <Switch
                  size="small"
                  checked={tabBarVisible}
                  onChange={setTabBarVisible}
                />
              </SettingRow>
              <SettingRow label="Draggable tabs" disabled={!tabBarVisible}>
                <Switch
                  size="small"
                  checked={tabBarDraggable}
                  onChange={setTabBarDraggable}
                  disabled={!tabBarVisible}
                />
              </SettingRow>
              <SettingRow label="Wheel scroll" disabled={!tabBarVisible}>
                <Switch
                  size="small"
                  checked={tabBarWheelScroll}
                  onChange={setTabBarWheelScroll}
                  disabled={!tabBarVisible}
                />
              </SettingRow>
              <SettingRow label="Show tab icons" disabled={!tabBarVisible}>
                <Switch
                  size="small"
                  checked={tabBarShowIcons}
                  onChange={setTabBarShowIcons}
                  disabled={!tabBarVisible}
                />
              </SettingRow>
              <button
                type="button"
                onClick={resetTabSession}
                className="mt-1 w-full rounded-lg border border-default py-2 text-[12px] font-medium text-secondary transition-colors hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-500"
              >
                Reset open tabs
              </button>
            </SettingBlock>

            <SettingBlock title="Content">
              <SettingRow
                label="Compact content width"
                hint="Max-width on wide screens"
              >
                <Switch
                  size="small"
                  checked={contentCompact}
                  onChange={setContentCompact}
                />
              </SettingRow>
            </SettingBlock>
          </div>
        )}

        {activeTab === "shortcuts" && (
          <SettingBlock title="Keyboard shortcuts">
            <div className="mt-1 overflow-hidden rounded-lg border border-default">
              {ADMIN_SHORTCUTS.map(({ key, label }, i) => (
                <div
                  key={key}
                  className={[
                    "flex items-center justify-between gap-3 px-3 py-2.5",
                    i < ADMIN_SHORTCUTS.length - 1
                      ? "border-b border-subtle"
                      : "",
                  ].join(" ")}
                >
                  <span className="text-[12px] text-secondary">{label}</span>
                  <kbd className="shrink-0 rounded-md border border-default bg-subtle px-2 py-0.5 font-mono text-[10px] font-semibold text-primary">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          </SettingBlock>
        )}
      </div>
    </Drawer>
  );
}
