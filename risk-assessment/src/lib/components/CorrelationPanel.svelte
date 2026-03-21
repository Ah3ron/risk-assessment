<script lang="ts">
  import { analyzeCorrelations } from "$lib/statistics";
  import type { IncidentData } from "$lib/types";

  interface Props {
    data: IncidentData[];
  }

  let { data }: Props = $props();

  const correlations = $derived(analyzeCorrelations(data).slice(0, 8));

  function getColor(r: number): string {
    const abs = Math.abs(r);
    if (abs >= 0.7) return r > 0 ? "text-success" : "text-error";
    if (abs >= 0.5) return "text-warning";
    return "text-base-content/60";
  }

  function getBadge(r: number): string {
    const abs = Math.abs(r);
    if (abs >= 0.7) return "badge-success";
    if (abs >= 0.5) return "badge-warning";
    return "badge-ghost";
  }
</script>

<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="card-title text-lg">
      <div class="badge badge-primary badge-outline p-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
          />
        </svg>
      </div>
      Корреляционный анализ
    </h2>

    {#if data.length < 3}
      <div class="alert alert-warning">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span class="text-sm">Минимум 3 записи для анализа</span>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr class="bg-base-200">
              <th>Показатель 1</th>
              <th>Показатель 2</th>
              <th class="text-right">r</th>
              <th>Сила</th>
              <th>Направление</th>
            </tr>
          </thead>
          <tbody>
            {#each correlations as corr}
              <tr>
                <td class="text-sm">{corr.variable1}</td>
                <td class="text-sm">{corr.variable2}</td>
                <td class="text-right font-mono {getColor(corr.correlation)}">
                  {corr.correlation.toFixed(2)}
                </td>
                <td
                  ><span
                    class="badge badge-sm whitespace-nowrap {getBadge(
                      corr.correlation,
                    )}">{corr.strength}</span
                  ></td
                >
                <td
                  class="text-sm {corr.direction === 'положительная'
                    ? 'text-success'
                    : 'text-error'}"
                >
                  {corr.direction === "положительная"
                    ? "↗ Прямая"
                    : "↘ Обратная"}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Шкала -->
      <div class="bg-base-200 rounded-lg p-3">
        <div class="text-xs font-medium mb-2">Шкала силы связи (|r|):</div>
        <div class="flex gap-1 text-xs">
          <div class="flex-1 text-center p-1 bg-success/20 rounded">
            ≥0.9 оч.сильная
          </div>
          <div class="flex-1 text-center p-1 bg-success/20 rounded">
            ≥0.7 сильная
          </div>
          <div class="flex-1 text-center p-1 bg-warning/20 rounded">
            ≥0.5 умеренная
          </div>
          <div class="flex-1 text-center p-1 bg-base-300 rounded">
            &lt;0.3 слабая
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
