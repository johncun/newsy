import { createSignal, onMount } from "solid-js";

const IntroScreen = () => {
  const [startText, setStartText] = createSignal(false);

  onMount(() => {
    // Start text animation slightly after background loads
    setTimeout(() => setStartText(true), 500);
  });

  return (
    <div class="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden text-white">

      {/* 1. Animated Mesh Gradient Background */}
      <div class="absolute inset-0 -z-10 animate-mesh-gradient bg-size[300%_300%] bg-linear-to-br from-[#242424] via-blue-900/20 to-black" />

      {/* 2. Pulsing Image Container */}
      <div class="relative flex items-center justify-center mb-12">
        {/* Outer Ring Pulse */}
        <div class="absolute w-48 h-48 bg-white/20 rounded-full animate-ping opacity-20" />
        {/* Inner Ring Pulse */}
        <div class="absolute w-48 h-48 bg-white/30 rounded-full animate-pulse" />

        {/* The Main Image/Logo */}
        <div class="relative w-40 h-40 rounded-full flex items-center justify-center overflow-hidden transform transition-transform hover:scale-110 duration-500">
          <img
            src="/maskable_icon_x512.png"
            alt="Brand Logo"
            class="object-contain"
          />
        </div>
      </div>

      {/* 3. Animated Text Description */}
      <div class={`text-center px-6 transition-all duration-1000 flex flex-col items-center transform ${startText() ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div class="w-[50vw] "><img src="/cuisle-text.svg" /></div>
        <div class="text-lg md:text-xl text-white/80 max-w-md mx-auto leading-relaxed">
          Taking the pulse of the news
        </div>
      </div>

      {/* 4. Action Button */}

      {/* Skip button for repeat users */}
      {/* <button */}
      {/*   onClick={handleClose} */}
      {/*   class="absolute top-8 right-8 text-white/50 hover:text-white text-sm font-medium tracking-widest uppercase" */}
      {/* > */}
      {/*   Skip */}
      {/* </button> */}

      {/* Scoped Animations */}
      <style>{`
          @keyframes mesh {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-mesh-gradient {
            animation: mesh 10s ease infinite;
          }
        `}</style>
    </div>
  );
};

export default IntroScreen;
