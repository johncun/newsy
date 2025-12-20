import { createStore } from "solid-js/store";
import { z } from "zod";
import { SETTINGS_KEY } from "./constants";

export const SettingsSchema = z.object({
  username: z.string().min(1, "Name is required"),
  notifications: z.boolean(),
  theme: z.enum(["Light", "Dark", "System"]),
  apiEndpoint: z.string().url().or(z.string().length(0)),
});

export type Settings = z.infer<typeof SettingsSchema>;

export type SettingItem = {
  id: keyof Settings;
  label: string;
  desc: string;
  help: string;
  type: "text" | "toggle" | "select";
  options?: string[];
};

const DEFAULTS: Settings = {
  username: "Guest",
  notifications: true,
  theme: "System",
  apiEndpoint: "",
};

const loadSettings = (): Settings => {
  const saved = localStorage.getItem(SETTINGS_KEY);
  if (!saved) return DEFAULTS;
  try {
    return SettingsSchema.parse(JSON.parse(saved));
  } catch {
    return DEFAULTS;
  }
};

export const [settings, setSettings] = createStore<Settings>(loadSettings());

// Helper to update store and disk immediately
export const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
  setSettings(key, value);
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const resetSettings = () => {
  setSettings(DEFAULTS);
  localStorage.removeItem(SETTINGS_KEY);
};
