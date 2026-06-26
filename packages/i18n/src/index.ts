import enUS from "./en-US";
import kmKH from "./km-KH";

export type { UiLocale } from "./meta";
export {
  UI_LOCALES,
  DEFAULT_UI_LOCALE,
  isUiLocale,
  normalizeUiLocale,
} from "./meta";

export { MESSAGES } from "./messages";
export type { Messages, MessageKey } from "./en-US";
export * from "./translate";
export { useLocale } from "./use-locale";
