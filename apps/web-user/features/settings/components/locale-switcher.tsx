"use client";

import { Select } from "antd";
import { useMemo } from "react";
import { useLocale, UI_LOCALES, type UiLocale } from "@vokcg/i18n";

type Props = {
  className?: string;
  style?: React.CSSProperties;
  bordered?: boolean;
};

export function LocaleSwitcher({ className, style, bordered = true }: Props) {
  const { uiLocale, setUiLocale } = useLocale();

  const options = useMemo(
    () =>
      (Object.entries(UI_LOCALES) as [UiLocale, string][]).map(
        ([value, label]) => ({
          value,
          label: `${value} – ${label}`,
        }),
      ),
    [],
  );

  return (
    <Select
      className={className}
      style={style}
      variant={bordered ? "outlined" : "borderless"}
      options={options}
      value={uiLocale}
      onChange={(value) => setUiLocale(value as UiLocale)}
      popupMatchSelectWidth={false}
    />
  );
}
