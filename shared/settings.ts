import { createStore } from "solid-js/store";
import { z } from "zod";
import { DEFAULT_FEED_URLS, SETTINGS_KEY } from "@shared/constants";
import { SourceRecord, SourceRecordSchema } from "./feed-types";


export const SettingsSchema = z.object({
  username: z.string().min(1),
  notifications: z.boolean(),
  theme: z.enum(["Light", "Dark", "System"]),
  feeds: z.array(SourceRecordSchema),
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
  feeds: DEFAULT_FEED_URLS
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

const persist = () => { console.log('persist', { settings }); localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }
persist()

export const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
  setSettings(key, value);
  persist();
};

export const feedActions = {
  add: () => {
    const newFeed: SourceRecord = { id: crypto.randomUUID(), name: "Enter Name", url: "https://", votes: 1 };
    setSettings("feeds", (f) => [...f, newFeed]);
    persist();
  },
  remove: (id: string) => {
    setSettings("feeds", (f) => f.filter(feed => feed.id !== id));
    persist();
  },
  update: (id: string, updates: Partial<SourceRecord>) => {
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
