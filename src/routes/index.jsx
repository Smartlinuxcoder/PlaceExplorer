import { Title } from "@solidjs/meta";
import { createSignal } from "solid-js";
import  "./indexpage.css";

export default function GameMenu() {
  const [hoveredButton, setHoveredButton] = createSignal(null);

  return (
    <main class="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <Title>PlaceExplorer</Title>
      
      <div class="text-center space-y-12 max-w-2xl mx-auto">
        <h1 class="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text animate-pulse">
          Let's get started!
        </h1>
        
        <p class="text-xl text-gray-300 mb-8">
          Choose your adventure mode
        </p>

        <div class="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button
            class={`
              px-8 py-4 text-xl font-bold rounded-lg transform transition-all duration-300
              ${hoveredButton() === 'single' 
                ? 'scale-105 bg-gradient-to-r from-blue-600 to-blue-400 shadow-lg shadow-blue-500/50' 
                : 'bg-blue-600 hover:bg-blue-500'
              }
            `}
            onMouseEnter={() => setHoveredButton('single')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <span class="flex items-center gap-2">
              <i class="fas fa-user"></i>
              Singleplayer
            </span>
          </button>

          <button
            class={`
              px-8 py-4 text-xl font-bold rounded-lg transform transition-all duration-300
              ${hoveredButton() === 'multi' 
                ? 'scale-105 bg-gradient-to-r from-green-600 to-green-400 shadow-lg shadow-green-500/50' 
                : 'bg-green-600 hover:bg-green-500'
              }
            `}
            onMouseEnter={() => setHoveredButton('multi')}
            onMouseLeave={() => setHoveredButton(null)}
          >
            <span class="flex items-center gap-2">
              <i class="fas fa-users"></i>
              Multiplayer
            </span>
          </button>
        </div>

        <div class="mt-16 text-gray-400 text-sm">
          <p>Choose singleplayer for a solo adventure or multiplayer to explore with friends!</p>
        </div>
      </div>

      {/* Add animated background elements */}
      <div class="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl animate-blob"></div>
        <div class="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        <div class="absolute bottom-1/4 left-1/3 w-96 h-96 bg-green-600/20 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>
    </main>
  );
}
