<script lang="ts">
  import "../app.css";

  let { children } = $props();

  let currentTheme = $state("light");

  const themes = [
    { id: "light", name: "Светлая", icon: "sun" },
    { id: "dark", name: "Тёмная", icon: "moon" },
  ];

  const iconPaths: Record<string, string> = {
    sun: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z",
    moon: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",
  };

  function setTheme(theme: string) {
    currentTheme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }

  $effect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) {
      currentTheme = saved;
      document.documentElement.setAttribute("data-theme", saved);
    }
  });
</script>

<div class="min-h-screen bg-base-200" data-theme={currentTheme}>
  <!-- Заголовок -->
  <header class="bg-primary text-primary-content shadow-lg sticky top-0 z-50">
    <div class="container mx-auto px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="bg-primary-content/20 p-2 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <div>
            <h1 class="text-lg font-bold leading-tight">
              Оценка производственных рисков
            </h1>
            <p class="text-xs opacity-80 hidden sm:block">
              ЗАО "Солигорский институт проблем ресурсосбережения"
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Переключатель тем -->
          <div class="dropdown dropdown-end">
            <div tabindex="0" role="button" class="btn btn-ghost btn-sm gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d={iconPaths[
                    themes.find((t) => t.id === currentTheme)?.icon || "sun"
                  ]}
                />
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
            <ul
              tabindex="0"
              class="dropdown-content menu bg-base-100 rounded-box z-[1] w-44 p-2 shadow-lg"
            >
              {#each themes as theme}
                <li class="text-base-content">
                  <button
                    class="flex items-center gap-2 {currentTheme === theme.id
                      ? 'active'
                      : ''}"
                    onclick={() => setTheme(theme.id)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d={iconPaths[theme.icon]}
                      />
                    </svg>
                    <span>{theme.name}</span>
                  </button>
                </li>
              {/each}
            </ul>
          </div>

          <span class="badge badge-secondary badge-sm">v1.0</span>
        </div>
      </div>
    </div>
  </header>

  <!-- Основной контент -->
  <main class="container mx-auto px-4 py-6">
    {@render children()}
  </main>

  <!-- Футер -->
  <footer class="bg-base-300 mt-auto py-4">
    <div
      class="container mx-auto px-4 text-center text-sm text-base-content/70"
    >
      <p>2026 ЗАО "Солигорский институт проблем ресурсосбережения"</p>
    </div>
  </footer>
</div>
