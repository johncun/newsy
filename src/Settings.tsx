import { createSignal, For } from "solid-js";
import { settings, updateSetting, feedActions, SettingItem } from "@shared/settings";

// 1. Internal Component: The Input Switcher (Fixes TS2322)
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
    default:
      return (
        <input
          type="text"
          value={settings[id] as string}
          class="border-b border-gray-400 text-right w-24 outline-none focus:border-blue-500 text-gray-100"
          onInput={(e) => updateSetting(id, e.currentTarget.value)}
        />
      );
  }
};

// 2. Internal Component: The Layout Row
const SettingRow = (props: { item: SettingItem }) => (
  <div class="p-4 ">
    <div class="flex justify-between items-start">
      <div class="flex-1 pr-4">
        <h3 class="text-gray-300 font-medium">{props.item.label}</h3>
        <p class="text-sm text-gray-500 leading-tight">{props.item.desc}</p>
      </div>
      <div class="shrink-0 pt-1">
        <InputRenderer item={props.item} />
      </div>
    </div>
    <p class="text-xs text-gray-400 mt-2 italic">{props.item.help}</p>
  </div>
);

// 3. Main Export
export const SettingsPage = () => {
  const [search, setSearch] = createSignal("");

  const menuItems: SettingItem[] = [
    { id: "username", label: "Profile Name", desc: "Display name", help: "Publicly visible.", type: "text" },
    { id: "notifications", label: "Alerts", desc: "Push notifications", help: "Requires system permission.", type: "toggle" },
    { id: "theme", label: "Theme", desc: "App appearance", help: "Dark mode saves battery.", type: "select", options: ["Light", "Dark", "System"] },
  ];

  const filteredGeneral = () => menuItems.filter(i => i.label.toLowerCase().includes(search().toLowerCase()));
  // const _sortedFeeds = () => [...settings.feeds].sort((a, b) => b.votes - a.votes);

  return (
    <div class="flex flex-col h-screen max-w-md mx-auto overflow-hidden shadow-xl">
      <div class="p-1 border-b sticky top-0 z-10 shadow-sm">
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

      <div class="flex-1 overflow-y-auto pb-20">
        <For each={filteredGeneral()}>{(item) => <SettingRow item={item} />}</For>

        <div class="p-4 flex justify-between items-center mt-4">
          <h2 class="text-md font-bold text-slate-300 ">Newsfeeds</h2>
          <button onClick={feedActions.add} class="text-blue-400 text-md font-bold">+ Add Feed</button>
        </div>

        <For each={settings.feeds}>
          {(feed) => (
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
                    class="w-6 h-6 flex rounded-full border-gray-200 border items-center justify-center text-gray-200 font-bold active:bg-gray-200 "
                  >
                    <div>-</div>
                  </button>
                  <span class="w-8 text-center text-md font-mono font-bold text-gray-100">
                    {feed.votes}
                  </span>
                  <button
                    onClick={() => feedActions.update(feed.id, { votes: feed.votes + 1 })}
                    class="w-6 h-6 flex rounded-full border-gray-200 border items-center justify-center text-gray-200 font-bold active:bg-gray-200 "
                  >
                    <div>+</div>
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

          )}
        </For>     </div >
    </div >
  );
};

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
);
