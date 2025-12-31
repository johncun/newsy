import { createStore } from "solid-js/store";
import { z } from "zod";
import { DEFAULT_FEED_URLS, SETTINGS_KEY } from "@shared/constants";
import { SourceRecord, SourceRecordSchema } from "./feed-types";
import { setPerformFetchFeedsTrigger, setTick, tick } from "@src/signals";
import { untrack } from "solid-js";
import { lastFeedFetchedTime } from "@src/common";

export const ALLOWABLE_REFRESH_TIMES = [0, 1, 2, 5, 10, 20, 30, 60, 180]
export const MAX_ALLOWABLE_STORIES_IN_LIVE = [10, 20, 30, 50, 100]


export const SettingsSchema = z.object({
  maxFeedsPerRequest: z.enum(["10", "25", "50", "100"]),
  maxLookbackTime: z.enum(["1", "2", "5", "8", "24", "48", "240"]),
  theme: z.enum(["Light", "Dark", "System"]),
  feeds: z.array(SourceRecordSchema),
  fullMode: z.boolean(),
  showFigureCaptions: z.boolean(),
  gotoTopAfterRefresh: z.boolean(),
  autoRefreshTime: z.union(ALLOWABLE_REFRESH_TIMES.map(n => z.literal(n))),
  maxLiveCount: z.union(MAX_ALLOWABLE_STORIES_IN_LIVE.map(n => z.literal(n))),
});

export type Settings = z.infer<typeof SettingsSchema>;

export type SettingItem = {
  id: keyof Settings;
  label: string;
  desc: string;
  help: string;
  type: "text" | "toggle" | "select" | "selectnum";
  options?: string[];
};

const DEFAULTS: Settings = {
  fullMode: false,
  showFigureCaptions: false,
  theme: "System",
  maxFeedsPerRequest: "50",
  maxLookbackTime: "1",
  feeds: DEFAULT_FEED_URLS,
  autoRefreshTime: 0,
  maxLiveCount: 50,
  gotoTopAfterRefresh: false
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
const MS_MINUTE = 1000 * 60;

setInterval(() => {
  setTick(t => t + 1);
  console.log({ tick: tick() })
  untrack(() => {
    if (settings.autoRefreshTime > 0 && Date.now() - lastFeedFetchedTime > (settings.autoRefreshTime * MS_MINUTE)) {
      console.log('auto fetch', { lastFeedFetchedTime, diff: Date.now() - lastFeedFetchedTime, period: settings.autoRefreshTime * MS_MINUTE })
      setPerformFetchFeedsTrigger(Date.now())
    }
  })
}, ~~(MS_MINUTE / 3))


