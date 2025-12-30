import { createStore } from "solid-js/store";
import { z } from "zod";
import { DEFAULT_FEED_URLS, SETTINGS_KEY } from "@shared/constants";
import { SourceRecord, SourceRecordSchema } from "./feed-types";


export const SettingsSchema = z.object({
  maxFeedsPerRequest: z.enum(["10", "25", "50", "100"]),
  maxLookbackTime: z.enum(["1", "2", "5", "8", "24", "48", "240"]),
  theme: z.enum(["Light", "Dark", "System"]),
  feeds: z.array(SourceRecordSchema),
  fullMode: z.boolean()
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
  fullMode: false,
  theme: "System",
  maxFeedsPerRequest: "50",
  maxLookbackTime: "1",
  feeds: DEFAULT_FEED_URLS
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
