import { createStore } from "solid-js/store";
import { z } from "zod";
import { SETTINGS_KEY } from "@shared/constants";

// 1. Schemas
const FeedDefSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  url: z.url("bad URL"),
  priority: z.number().int().min(0),
  status: z.enum(["idle", "loading", "success", "error"]).optional(),
});

export type FeedDef = z.infer<typeof FeedDefSchema>;

export const SettingsSchema = z.object({
  username: z.string().min(1),
  notifications: z.boolean(),
  theme: z.enum(["Light", "Dark", "System"]),
  feeds: z.array(FeedDefSchema),
});

export type Settings = z.infer<typeof SettingsSchema>;

// UI Blueprint Type
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
  feeds: [],
};

// 2. Store & Persistence
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

const persist = () => localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

export const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
  setSettings(key, value);
  persist();
};

export const feedActions = {
  add: () => {
    const newFeed: FeedDef = { id: crypto.randomUUID(), name: "Enter Name", url: "https://", priority: 0, status: "idle" };
    setSettings("feeds", (f) => [...f, newFeed]);
    persist();
  },
  remove: (id: string) => {
    setSettings("feeds", (f) => f.filter(feed => feed.id !== id));
    persist();
  },
  update: (id: string, updates: Partial<FeedDef>) => {
    setSettings("feeds", (f) => f.id === id, updates);
    persist();
  },
  test: async (id: string, url: string) => {
    feedActions.update(id, { status: "loading" });
    try {
      await fetch(url, { method: 'HEAD', mode: 'no-cors' });
      feedActions.update(id, { status: "success" });
      setTimeout(() => feedActions.update(id, { status: "idle" }), 3000);
    } catch {
      feedActions.update(id, { status: "error" });
    }
  },
  reset: () => {
    setSettings(DEFAULTS);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings, null, 2))
  }
};
