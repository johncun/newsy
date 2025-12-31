import { createSignal, Show } from "solid-js";
import { Portal } from "solid-js/web";

const LegalModal = () => {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <div class="flex justify-center p-2">
      {/* Trigger Button - Place this in your Footer or Settings */}
      <button
        onClick={() => setIsOpen(true)}
        class="text-sm text-blue-200 hover:text-blue-200 underline transition-colors"
      >
        Legal & Terms of Use
      </button>

      <Show when={isOpen()}>
        <Portal>
          {/* Backdrop Overlay */}
          <div
            class="d inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            {/* Modal Container */}
            <div
              class="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-slate-100/70 rounded-2xl shadow-2xl p-6 md:p-8"
              onClick={(e) => e.stopPropagation()} // Prevents closing when clicking content
            >
              {/* Header */}
              <div class="flex items-center justify-between mb-4 border-b pb-4">
                <h2 class="text-2xl font-bold text-gray-900">Legal Information</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  class="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  &times;
                </button>
              </div>

              {/* Disclaimer Content */}
              <div class="space-y-6 text-gray-700 leading-relaxed text-sm md:text-base">
                <p class="text-xs text-gray-500 uppercase tracking-widest font-semibold">Effective Dec 2025</p>

                <section>
                  <h3 class="font-bold text-gray-900 mb-1 italic">1. "As-Is" Service</h3>
                  <p>This application is provided "AS IS." The developer disclaims all warranties, express or implied. Use at your own risk.</p>
                </section>

                <section>
                  <h3 class="font-bold text-gray-900 mb-1 italic">2. Limitation of Liability</h3>
                  <p>In no event shall the developer be personally liable for any damages, data loss, or service interruptions arising from use.</p>
                </section>

                <section>
                  <h3 class="font-bold text-gray-900 mb-1 italic">3. Future Changes</h3>
                  <p>As this is an independently maintained project, the developer may modify or discontinue the service at any time without notice.</p>
                </section>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                class="mt-8 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md active:scale-[0.98]"
              >
                I Understand
              </button>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  );
};

export default LegalModal;
