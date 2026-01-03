import { createSignal, For, Show } from "solid-js";
import { settings, updateSetting, feedActions, SettingItem, Settings, ALLOWABLE_REFRESH_TIMES, MAX_ALLOWABLE_STORIES_IN_LIVE, MAX_LOOKBACK_TIMES } from "@shared/settings";
import { status } from "@src/_git_commit"
import LegalModal from "./LegalModal";

const InputRenderer = (props: { item: SettingItem }) => {
  const id = props.item.id;

  switch (props.item.type) {
    case "toggle":

      return (
        <label class="relative inline-block h-6 w-10">
          <input
            class="opacity-0 w-0 h-0"
            type="checkbox"
            checked={settings[id] as boolean}
            onChange={(e) => updateSetting(id, e.currentTarget.checked)}
          />
          <span class="slider"></span>
        </label>
      );
    case "selectnum":
      return (
        <select
          value={settings[id] as string}
          class="text-gray-100 bg-transparent font-semibold outline-none"
          onChange={(e) => updateSetting(id, +(e.currentTarget.value))}
        >
          <For each={props.item.options}>{(opt) => <option value={opt}>{opt}</option>}</For>
        </select>
      );
    case "select":
      return (
        <select
          value={settings[id] as string}
          class="text-gray-100 bg-transparent font-semibold outline-none"
          onChange={(e) => updateSetting(id, e.currentTarget.value as any)}
        >
          <For each={props.item.options}>{(opt) => <option value={opt}>{opt}</option>}</For>
        </select>
      );
    case "multitext":
      return (
        <textarea
          value={settings[id] as string}
          class="border-b border-gray-400 w-full outline-none focus:border-blue-500 text-gray-100"
          onInput={(e) => updateSetting(id, e.currentTarget.value as Settings[typeof id])}
        />
      );
    default:
      return (
        <input
          type="text"
          value={settings[id] as string}
          class="border-b border-gray-400 text-right w-24 outline-none focus:border-blue-500 text-gray-100"
          onInput={(e) => updateSetting(id, e.currentTarget.value as Settings[typeof id])}
        />
      );
  }
};

const SettingRow = (props: { item: SettingItem }) => (
  <div class="p-4 ">
    <div class="flex justify-between items-start">
      <div class="flex-1 pr-4">
        <h3 class="text-gray-300 font-medium">{props.item.label}</h3>
        <p class="text-sm text-gray-500 leading-tight">{props.item.desc}</p>
      </div>
      {props.item.type !== "multitext" && <div class="shrink-0 pt-1">
        <InputRenderer item={props.item} />
      </div>}
    </div>
    {props.item.type === "multitext" &&
      <div class="shrink-0 pt-1">
        <InputRenderer item={props.item} />
      </div>}
    <p class="text-xs text-gray-400 mt-2 italic">{props.item.help}</p>
  </div>
);

export const SettingsPage = () => {
  const [search, setSearch] = createSignal("");

  const menuItems: SettingItem[] = [
    {
      id: "maxFeedsPerRequest", label: "Max stories per refresh", desc: "Maximum stories to return on eaxch refresh",
      help: "This will control how quick the response is and how many new stories are added for your viewing each time.",
      type: "select", options: ["10", "25", "50", "100"]
    },
    {
      id: "maxLookbackTime", label: "Oldest story time per refresh in hours", desc: "Will not return stories older than this",
      help: "Helps keep your live stories manageable, is set to 0 then will only fetch those after latest story published time",
      type: "selectnum", options: MAX_LOOKBACK_TIMES.map(String)
    },

    {
      id: "fullMode", label: "Shows news stories in 3/4 page mode", desc: "Allows swiping up to get to next story",
      help: "",
      type: "toggle"
    },
    {
      id: "showFigureCaptions", label: "Displays captions under all images in news reader", desc: "Sometimes the captions are very verbose, this will remove them",
      help: "",
      type: "toggle"
    },
    {
      id: "autoRefreshTime", label: "Will automatically fetch stories after this number of minutes since last fetch", desc: "Useful is you want your view to contains the latest feeds without any action",
      help: "",
      type: "selectnum", options: ALLOWABLE_REFRESH_TIMES.map(String)
    },
    {
      id: "maxLiveCount", label: "Keeps the live feed to this length, removing the oldest stories", desc: "Removes any live storires replacing them with the latest from your feeds",
      help: "",
      type: "selectnum", options: MAX_ALLOWABLE_STORIES_IN_LIVE.map(String)
    },
    {
      id: "gotoTopAfterRefresh", label: "Go to top of list if the stories are refreshed", desc: "Can be a pain if you are saving items, but better to see latest storries as they come in",
      help: "",
      type: "toggle"
    },
    {
      id: "ignoreWords", label: "Ignore articles that contain the following words", desc: "This will ignore stories that contain any of the following words, more than one word then separate with a '+'. For example: 'red fox black+cat' would ignore any that contain the word 'red' or 'fox', or 'black' and 'cat' in the same story",
      help: "",
      type: "multitext"
    },
  ];

  const filteredGeneral = () => menuItems.filter(i => i.label.toLowerCase().includes(search().toLowerCase()));
  // const _sortedFeeds = () => [...settings.feeds].sort((a, b) => b.votes - a.votes);

  return (
    <div class="absolute inset-0 max-w-md overflow-hidden">
      <div class="absolute p-1 border-b h-16 top-0 z-10 shadow-sm">
        <div class="flex justify-between items-center mb-4 h-8 gap-4">
          <input
            type="text"
            placeholder="Search..."
            class="w-full p-2 bg-gray-500 rounded-lg h-full outline-none text-slate-100 focus:ring-2 ring-blue-400"
            onInput={(e) => setSearch(e.currentTarget.value)}
          />
          <button onClick={() => confirm("Reset all?") && feedActions.reset()} class="border bg-amber-600 h-8 border-orange-600 rounded-lg  px-2 text-black ">Reset</button>
        </div>
      </div>

      <div class="absolute inset-x-0 top-16 bottom-0 overflow-y-auto pb-2">
        <For each={filteredGeneral()}>{(item) => <SettingRow item={item} />}</For>

        <div class="p-4 flex justify-between items-center mt-4">
          <h2 class="text-md font-bold text-slate-300 ">Newsfeeds</h2>
          <button onClick={feedActions.add} class="text-blue-400 text-md font-bold">+ Add Feed</button>
        </div>

        <For each={settings.feeds}>
          {(feed) => (
            <Show when={!search() || feed.name.toLowerCase().includes(search().toLowerCase())}>
              <div class="p-4 mb-4 border-b border-gray-100/20 w-full animate-fade-in flex flex-col items-start gap-1">
                <div class="flex justify-between w-full gap-4">
                  <input
                    class="border-b border-gray-400 flex-1 text-left outline-none focus:border-blue-500 text-gray-100"

                    value={feed.name}
                    onInput={(e) => feedActions.update(feed.id, { name: e.currentTarget.value })}
                  />

                  <div class="flex items-center ">
                    <button
                      onClick={() => feedActions.update(feed.id, { votes: Math.max(0, feed.votes - 1) })}
                      class="w-6 h-6 p-1 flex rounded-full border-gray-200 border items-center justify-center text-gray-200 font-bold active:bg-gray-200 "
                    >
                      <div><svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
                      </svg></div>
                    </button>
                    <span class="w-8 text-center text-md font-mono font-bold text-gray-100">
                      {feed.votes}
                    </span>
                    <button
                      onClick={() => feedActions.update(feed.id, { votes: feed.votes + 1 })}
                      class="w-6 h-6 p-1 flex rounded-full border-gray-200 border items-center justify-center text-gray-200 font-bold active:bg-gray-200 "
                    >
                      <div><svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg></div>
                    </button>
                  </div>
                </div>

                <input
                  class="flex-1 w-full my-2 border-b border-gray-400 text-left outline-none focus:border-blue-500 text-gray-400 bg-transparent truncate"
                  value={feed.url}
                  onInput={(e) => feedActions.update(feed.id, { url: e.currentTarget.value })}
                />
                <div class="flex w-full gap-4 justify-between items-center">
                  <button
                    onClick={() => feedActions.test(feed.id, feed.url)}
                    disabled={feed.status === "loading"}
                    class={`rounded-md px-2 text-green-600 transition-all h-8 border ${feed.status === "success" ? "bg-green-50 border-green-200 text-green-600" :
                      feed.status === "error" ? "bg-red-50 border-red-200 text-red-600" :
                        "bg-gray-50 border-gray-200 text-gray-400 active:bg-gray-200"
                      }`}
                  >
                    {feed.status === "loading" ? "..." : feed.status === "success" ? "✓" : "Test"}
                  </button>
                  <button
                    onClick={() => confirm("Delete feed?") && feedActions.remove(feed.id)}
                    class="text-gray-300 rounded-full bg-red-600 w-8 h-8 p-2"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            </Show>
          )}
        </For>
        <LegalModal />
        <div class="flex justify-around items-center text-xs py-2 text-slate-500"><div>{status.logMessage}</div><div>{new Date(+status.when).toUTCString()}</div></div>
      </div >
    </div >
  );
};

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
);
