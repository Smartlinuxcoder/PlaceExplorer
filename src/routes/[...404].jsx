import { Title } from "@solidjs/meta";
import { HttpStatusCode } from "@solidjs/start";

export default function NotFound() {
  return (
    <main class="relative bg-gray-900 text-white min-h-screen flex flex-col justify-center items-center overflow-hidden p-6">
      <Title>404 - Page Not Found</Title>
      <HttpStatusCode code={404} />

      {/* Goofy balls */}
      <div class="absolute top-0 left-0 w-72 h-72 bg-gradient-to-r from-pink-500 to-yellow-500 rounded-full opacity-30 blur-2xl animate-pulse"></div>
      <div class="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 blur-3xl"></div>
      <div class="absolute top-1/3 left-1/4 w-48 h-48 bg-gradient-to-r from-green-400 to-teal-500 rounded-full opacity-40 blur-lg animate-spin-slow"></div>
      <div class="absolute top-10 right-1/3 w-60 h-60 bg-gradient-to-r from-red-500 to-orange-500 rounded-full opacity-25 blur-xl"></div>
      <div class="absolute bottom-1/4 left-1/3 w-64 h-64 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full opacity-30 blur-2xl"></div>
      <div class="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-r from-yellow-400 to-green-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
      <div class="absolute top-1/4 right-0 w-72 h-72 bg-gradient-to-r from-fuchsia-500 to-blue-500 rounded-full opacity-30 blur-3xl animate-spin-slow"></div>

      <div class="relative text-center max-w-md">
        <h1 class="text-6xl font-bold bg-gradient-to-r from-red-400 to-purple-600 bg-clip-text text-transparent">
          104
        </h1>
        <p class="mt-4 text-xl bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent font-semibold">
          Oops! The page you're looking for isn't here.
        </p>
        <p class="mt-2 text-gray-500">
          Our silly robot couldn't find what you were searching for.
        </p>
        <a
          href="/"
          class="mt-6 inline-block px-6 py-3 text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg transform hover:scale-105 transition-transform"
        >
          Go Back Home
        </a>
      </div>

      <footer class="relative mt-10 text-sm text-gray-500">
        A goofy page by{" "}
        <a
          href="https://github.com/smartlinuxcoder"
          class="text-indigo-400 underline hover:text-indigo-300"
        >
          @smartlinuxcoder
        </a>
      </footer>
    </main>
  );
}
