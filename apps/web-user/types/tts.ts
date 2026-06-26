export type TtsServer = {
  id: string;
  label: string;
  requires_api_key?: boolean;
  configured?: boolean;
  config_hint?: string;
};

export type TtsVoice = {
  id: string;
  label: string;
  featured?: boolean;
};

export type TtsServersData = {
  servers: TtsServer[];
};

export type TtsVoicesData = {
  voices: TtsVoice[];
  default_voice: string;
  featured_voices?: string[];
};

export type VoiceCloneProfile = {
  id: string;
  name: string;
  provider: "mimo" | "siliconflow";
  gender: "male" | "female";
  language: string;
  voice_name: string;
  reference_text: string;
  avatar_url?: string | null;
  created_at?: string;
};

export const NO_VOICE_ID = "no-voice";

export const TTS_SERVERS_FALLBACK: TtsServer[] = [
  { id: NO_VOICE_ID, label: "No Voice" },
  { id: "azure-tts-v1", label: "Azure TTS V1" },
  { id: "azure-tts-v2", label: "Azure TTS V2" },
  { id: "siliconflow", label: "SiliconFlow TTS" },
  { id: "siliconflow-clone", label: "SiliconFlow Clone" },
  { id: "gemini-tts", label: "Google Gemini TTS" },
  { id: "mimo-tts", label: "Xiaomi MiMo TTS" },
  { id: "mimo-voice-clone", label: "MiMo Voice Clone" },
];

export const CLONE_PROVIDERS = [
  { id: "mimo", label: "MiMo Voice Clone", serverId: "mimo-voice-clone" },
  {
    id: "siliconflow",
    label: "SiliconFlow Clone",
    serverId: "siliconflow-clone",
  },
] as const;

export const VOICE_CLONE_LANGUAGES = [
  { value: "en", label: "English" },
  { value: "zh", label: "Chinese (Mandarin)" },
  { value: "zh-yue", label: "Chinese (Cantonese)" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "km", label: "Khmer" },
  { value: "th", label: "Thai" },
  { value: "vi", label: "Vietnamese" },
  { value: "id", label: "Indonesian" },
  { value: "ms", label: "Malay" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "it", label: "Italian" },
  { value: "ru", label: "Russian" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
  { value: "tr", label: "Turkish" },
  { value: "nl", label: "Dutch" },
] as const;

export function isCloneTtsServer(serverId: string) {
  return serverId === "mimo-voice-clone" || serverId === "siliconflow-clone";
}

export function isMimoTtsServer(serverId: string) {
  return serverId === "mimo-tts" || serverId === "mimo-voice-clone";
}

export function isTtsServerAvailable(server: TtsServer | undefined): boolean {
  if (!server) return false;
  if (server.id === NO_VOICE_ID) return true;
  return server.configured !== false;
}
