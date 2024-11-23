import { Title } from "@solidjs/meta";
import { createSignal, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import "./indexpage.css";

export default function GameMenu() {
  const [hoveredButton, setHoveredButton] = createSignal(null);
  const [showModal, setShowModal] = createSignal(false);
  const [gameId, setGameId] = createSignal("");
  const [newGameCode, setNewGameCode] = createSignal(null);
  const [isLoading, setIsLoading] = createSignal(false);
  const navigate = useNavigate();

  const handleSingleplayer = () => {
    navigate("/singleplayer");
  };

  const handleMultiplayer = () => {
    setShowModal(true);
    setNewGameCode(null); // Reset any previous game code
  };

  const handleJoinGame = () => {
    if (gameId()) {
      navigate(`/multiplayer/${gameId()}`);
    }
  };

  const handleNewGame = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/startGame');
      const data = await response.json();
      setNewGameCode(data.code);
    } catch (error) {
      console.error('Failed to create game:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getGameUrl = (code) => {
    return `${window.location.origin}/multiplayer/${code}`;
  };

  return (
    <main class="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <Title>PlaceExplorer</Title>

      {/* Main content remains the same... */}
      <div class="text-center space-y-12 max-w-2xl mx-auto z-10">
        <h1 class="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text animate-pulse pb-10">
          Let's get started!
        </h1>
        <p class="text-2xl font-semibold text-center text-gray-300">
          Welcome to <span class="text-blue-500">PlaceExplorer!</span>
        </p>
        <p class="text-lg text-center text-gray-300 mt-2">
          Choose a game mode, <br />
          <span class="text-gray-200 font-medium">Click Play</span>, <br />
          and <span class="text-green-500 font-bold">Have Fun!</span>
        </p>


        {/* ... other content ... */}
        <div class="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button
            onClick={handleSingleplayer}
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
            onClick={handleMultiplayer}
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
      </div>

      {/* Background blobs */}
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl animate-blob"></div>
        <div class="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        <div class="absolute bottom-1/4 left-1/3 w-96 h-96 bg-green-600/20 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Enhanced Modal with Game Code Display */}
      <Show when={showModal()}>
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
              setNewGameCode(null);
            }
          }}>
          <div class="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md modal-content"
            onClick={e => e.stopPropagation()}>
            <h2 class="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text">
              {newGameCode() ? 'Your Game is Ready!' : 'Join Multiplayer Game'}
            </h2>

            <Show
              when={!newGameCode()}
              fallback={
                <div class="space-y-6">
                  <div class="space-y-4">
                    <label class="block text-sm text-gray-300">Game Code</label>
                    <div class="flex items-center gap-2">
                      <input
                        type="text"
                        value={newGameCode()}
                        readonly
                        class="w-full px-4 py-2 bg-gray-700 rounded-lg outline-none"
                      />
                      <button
                        onClick={() => copyToClipboard(newGameCode())}
                        class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-all"
                        title="Copy code"
                      >
                        <i class="fas fa-copy"></i>
                      </button>
                    </div>

                    <label class="block text-sm text-gray-300 mt-4">Game URL</label>
                    <div class="flex items-center gap-2">
                      <input
                        type="text"
                        value={getGameUrl(newGameCode())}
                        readonly
                        class="w-full px-4 py-2 bg-gray-700 rounded-lg outline-none text-sm"
                      />
                      <button
                        onClick={() => copyToClipboard(getGameUrl(newGameCode()))}
                        class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-all"
                        title="Copy URL"
                      >
                        <i class="fas fa-copy"></i>
                      </button>
                    </div>
                  </div>

                  <div class="flex gap-4">
                    <button
                      onClick={() => navigate(`/multiplayer/${newGameCode()}`)}
                      class="w-full px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition-all"
                    >
                      Start Playing
                    </button>
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setNewGameCode(null);
                      }}
                      class="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              }
            >
              <div class="space-y-6">
                <div class="space-y-4">
                  <label class="block text-sm text-gray-300">Game ID</label>
                  <input
                    type="text"
                    value={gameId()}
                    onInput={(e) => setGameId(e.target.value)}
                    placeholder="Enter game ID"
                    class="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                <div class="flex flex-col gap-4">
                  <button
                    onClick={handleJoinGame}
                    class="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    disabled={!gameId()}
                  >
                    Join Game
                  </button>

                  <div class="relative">
                    <div class="absolute inset-0 flex items-center">
                      <div class="w-full border-t border-gray-600"></div>
                    </div>
                    <div class="relative flex justify-center text-sm">
                      <span class="px-2 bg-gray-800 text-gray-400">or</span>
                    </div>
                  </div>

                  <button
                    onClick={handleNewGame}
                    disabled={isLoading()}
                    class="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded-lg font-semibold transition-all transform hover:scale-105 disabled:opacity-50"
                  >
                    {isLoading() ? (
                      <span class="flex items-center justify-center gap-2">
                        <i class="fas fa-spinner fa-spin"></i>
                        Creating Game...
                      </span>
                    ) : (
                      'Create New Game'
                    )}
                  </button>
                </div>
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </main>
  );
}