import { create } from "zustand";
import { persist } from "zustand/middleware";

import { STORAGE_KEYS } from "@vokcg/config";
import type {
  CreateConfigSection,
  CreateStudioConfig,
} from "@/types/create-config";

export const CREATE_CONFIG_DEFAULTS: CreateStudioConfig = {
  content: {
    subject: "",
    script: "",
    terms: "",
    language: "",
    paragraphCount: 1,
    scriptPrompt: "",
    systemPrompt: "",
  },
  visuals: {
    source: "pexels",
    aspect: "9:16",
    concatMode: "random",
    transitionMode: "",
    clipDuration: 3,
    count: 1,
    materials: [],
    uploadedMaterialNames: [],
  },
  audio: {
    ttsServer: "azure-tts-v1",
    voiceName: "",
    voiceVolume: 1.0,
    voiceRate: 1.0,
    stylePrompt: "",
    bgmType: "random",
    bgmFile: "",
    bgmVolume: 0.2,
  },
  subtitles: {
    enabled: true,
    position: "bottom",
    customPosition: 70,
    fontName: "STHeitiMedium.ttc",
    textForeColor: "#FFFFFF",
    fontSize: 60,
    strokeColor: "#000000",
    strokeWidth: 1.5,
    bgEnabled: true,
    textBgColor: "#000000",
    roundedBg: false,
  },
};

type VideoState = {
  locale: string;
  taskId: string;
  config: CreateStudioConfig;

  patchConfig: <S extends CreateConfigSection>(
    section: S,
    partial: Partial<CreateStudioConfig[S]>,
  ) => void;
  setConfig: (config: CreateStudioConfig) => void;
  setLocale: (v: string) => void;
  setTaskId: (id: string) => void;
  clearTaskId: () => void;
  resetForm: () => void;
};

export function getCreateStudioConfig(): CreateStudioConfig {
  return useVideoStore.getState().config;
}

export const useVideoStore = create<VideoState>()(
  persist(
    (set) => ({
      locale: "en",
      taskId: "",
      config: CREATE_CONFIG_DEFAULTS,

      patchConfig: (section, partial) =>
        set((state) => ({
          config: {
            ...state.config,
            [section]: { ...state.config[section], ...partial },
          },
        })),

      setConfig: (config) => set({ config }),
      setLocale: (locale) => set({ locale }),
      setTaskId: (taskId) => set({ taskId }),
      clearTaskId: () => set({ taskId: "" }),
      resetForm: () => set({ config: CREATE_CONFIG_DEFAULTS, taskId: "" }),
    }),
    {
      name: STORAGE_KEYS.videoStore,
      partialize: (state) => ({ locale: state.locale, config: state.config }),
    },
  ),
);
