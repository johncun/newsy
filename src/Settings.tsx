import { createSignal, For } from "solid-js";
import { settings, updateSetting, resetSettings, SettingItem } from "@shared/settings";

const menuItems: SettingItem[] = [
  { id: "username", label: "Profile Name", desc: "Your public identity", help: "Used for display only.", type: "text" },
  { id: "notifications", label: "Notifications", desc: "Enable push alerts", help: "Requires system permission.", type: "toggle" },
  { id: "theme", label: "App Theme", desc: "Visual style", help: "Follows system appearance.", type: "select", options: ["Light", "Dark", "System"] },
  { id: "apiEndpoint", label: "API Server", desc: "Custom server URL", help: "Leave blank for default.", type: "text" },
];

export const SettingsPage = () => {
  const [search, setSearch] = createSignal("");

  const filteredItems = () =>
    menuItems.filter((i) =>
      i.label.toLowerCase().includes(search().toLowerCase()) ||
      i.desc.toLowerCase().includes(search().toLowerCase())
    );

  return (
    <div class="flex flex-col h-screen bg-gray-50 max-w-md mx-auto overflow-hidden shadow-2xl">
      {/* Header with Search and Reset */}
      <div class="p-4 bg-white border-b sticky top-0 z-10 space-y-3">
        <div class="flex justify-between items-center">
          <h1 class="text-xl font-bold text-gray-800">Settings</h1>
          <button
            onClick={() => confirm("Reset all settings?") && resetSettings()}
            class="text-sm text-red-500 font-medium active:opacity-50 transition-opacity"
          >
            Reset to Defaults
          </button>
        </div>
        <div class="relative">
          <input
            type="text"
            placeholder="Search settings..."
            class="w-full pl-4 pr-10 py-2.5 bg-gray-100 rounded-xl focus:ring-2 ring-blue-500 outline-none transition-all"
            value={search()}
            onInput={(e) => setSearch(e.currentTarget.value)}
          />
        </div>
      </div>

      {/* Scrollable Settings List */}
      <div class="flex-1 overflow-y-auto">
        <div class="flex flex-col">
          <For each={filteredItems()} fallback={
            <p class="p-10 text-center text-gray-400">No settings found matching "{search()}"</p>
          }>
            {(item) => (
              <div class="setting-item p-4 border-b border-gray-100 bg-white active:bg-gray-50 transition-colors">
                <div class="flex justify-between items-start mb-1">
                  <div class="flex-1 pr-4">
                    <h3 class="text-gray-900 font-semibold text-base">{item.label}</h3>
                    <p class="text-sm text-gray-500 leading-snug">{item.desc}</p>
                  </div>
                  <div class="flex-shrink-0 pt-1">
                    <InputRenderer item={item} />
                  </div>
                </div>
                <p class="text-xs text-gray-400 mt-1 italic">{item.help}</p>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};

const InputRenderer = (props: { item: SettingItem }) => {
  const id = () => props.item.id;

  switch (props.item.type) {
    case "toggle":
      return (
        <label class="android-switch">
          <input
            type="checkbox"
            checked={settings[id()] as boolean}
            onChange={(e) => updateSetting(id(), e.currentTarget.checked)}
          />
          <span class="slider"></span>
        </label>
      );
    case "select":
      return (
        <select
          value={settings[id()] as string}
          class="text-blue-600 bg-transparent font-semibold py-1 outline-none text-sm"
          onChange={(e) => updateSetting(id(), e.currentTarget.value as any)}
        >
          <For each={props.item.options}>
            {(opt) => <option value={opt}>{opt}</option>}
          </For>
        </select>
      );
    default:
      return (
        <input
          type="text"
          value={settings[id()] as string}
          class="border-b border-gray-200 text-right w-28 focus:border-blue-500 outline-none text-sm py-1 bg-transparent"
          onInput={(e) => updateSetting(id(), e.currentTarget.value)}
        />
      );
  }
};


