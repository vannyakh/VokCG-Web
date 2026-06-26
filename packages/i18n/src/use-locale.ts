"use client";

import { useCallback, useMemo } from "react";

import { useLocaleStore } from "./locale-store";

import { MESSAGES } from "./messages";
import type { UiLocale } from "./meta";
import { translate, type TranslateParams } from "./translate";

export function useLocale() {
  const uiLocale = useLocaleStore((s) => s.uiLocale);
  const setUiLocale = useLocaleStore((s) => s.setUiLocale);

  const messages = MESSAGES[uiLocale];

  const t = useCallback(
    (key: string, params?: TranslateParams) => translate(messages, key, params),
    [messages],
  );

  return useMemo(
    () => ({
      uiLocale,
      setUiLocale,
      t,
    }),
    [uiLocale, setUiLocale, t],
  );
}

export type { UiLocale };
