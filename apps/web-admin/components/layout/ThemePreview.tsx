import { Button, Input, Switch, Tag } from "antd";

/** Live preview of current theme tokens in the preferences drawer */
export function ThemePreview() {
  return (
    <div
      className="overflow-hidden rounded-xl border border-default"
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      <div className="flex items-center gap-2 border-b border-default bg-subtle px-3 py-2">
        <div className="h-2 w-2 rounded-full bg-accent" />
        <span className="text-[11px] font-semibold text-secondary">
          Live preview
        </span>
      </div>

      <div className="space-y-3 bg-surface p-3">
        <div className="flex flex-wrap gap-2">
          <Button type="primary" size="small">
            Primary
          </Button>
          <Button size="small">Default</Button>
          <Tag color="processing">Tag</Tag>
        </div>

        <Input size="small" placeholder="Input field" />

        <SettingRow label="Switch" />
      </div>
    </div>
  );
}

function SettingRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-default bg-canvas px-2.5 py-1.5">
      <span className="text-[12px] text-secondary">{label}</span>
      <Switch size="small" defaultChecked />
    </div>
  );
}
