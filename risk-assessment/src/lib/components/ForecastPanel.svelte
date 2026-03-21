<script lang="ts">
  import { onMount } from "svelte";
  import { Chart, registerables } from "chart.js";
  import { analyzeTrend } from "$lib/statistics";
  import type { IncidentData, TrendAnalysis } from "$lib/types";

  Chart.register(...registerables);

  interface Props {
    data: IncidentData[];
  }

  let { data }: Props = $props();

  let forecastCanvas: HTMLCanvasElement;
  let forecastChart: Chart | null = null;

  const trends = $derived.by(() => {
    const result = new Map<string, TrendAnalysis>();
    if (data.length >= 2) {
      const years = data.map((d) => d.year);
      result.set(
        "incidents",
        analyzeTrend(
          data.map((d) => d.totalIncidents),
          years,
        ),
      );
      result.set(
        "injuries",
        analyzeTrend(
          data.map((d) => d.severeInjuries),
          years,
        ),
      );
      result.set(
        "rate",
        analyzeTrend(
          data.map((d) => d.incidentRate),
          years,
        ),
      );
    }
    return result;
  });

  const colors = {
    primary: "#3b82f6",
    secondary: "#22c55e",
    error: "#ef4444",
  };

  function createChart() {
    if (!data.length || !forecastCanvas) return;
    forecastChart?.destroy();

    const incidentsTrend = trends.get("incidents");
    if (!incidentsTrend) return;

    const historicalYears = data.map((d) => d.year.toString());
    const forecastYears = incidentsTrend.forecast.map((f) => f.year.toString());

    forecastChart = new Chart(forecastCanvas, {
      type: "line",
      data: {
        labels: [...historicalYears, ...forecastYears],
        datasets: [
          {
            label: "Исторические",
            data: [
              ...data.map((d) => d.totalIncidents),
              ...new Array(forecastYears.length).fill(null),
            ],
            borderColor: colors.primary,
            backgroundColor: colors.primary + "20",
            pointRadius: 5,
            fill: true,
          },
          {
            label: "Прогноз",
            data: [
              ...new Array(historicalYears.length - 1).fill(null),
              data[data.length - 1].totalIncidents,
              ...incidentsTrend.forecast.map((f) => f.value),
            ],
            borderColor: colors.secondary,
            backgroundColor: colors.secondary + "20",
            borderDash: [5, 5],
            pointRadius: 5,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" },
          title: { display: true, text: "Прогноз инцидентов" },
        },
        scales: { y: { beginAtZero: true } },
      },
    });
  }

  onMount(() => {
    if (data.length >= 2) createChart();
  });
  $effect(() => {
    if (data.length >= 2) createChart();
  });

  const directionLabels = {
    increasing: "Растущий",
    decreasing: "Снижающийся",
    stable: "Стабильный",
  };
  const directionClass = {
    increasing: "text-error",
    decreasing: "text-success",
    stable: "text-warning",
  };
  const directionIcon = {
    increasing: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
    decreasing: "M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6",
    stable: "M5 12h14",
  };
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
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      </div>
      Прогнозирование
    </h2>

    {#if data.length < 2}
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
        <span class="text-sm">Минимум 2 записи для прогноза</span>
      </div>
    {:else}
      <!-- Тренды -->
      <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
        {#each ["incidents", "injuries", "rate"] as key}
          {@const trend = trends.get(key)}
          {#if trend}
            <div class="bg-base-200 rounded-lg p-3 text-center">
              <div class="text-xs text-base-content/60 mb-1">
                {key === "incidents"
                  ? "Инциденты"
                  : key === "injuries"
                    ? "Травмы"
                    : "Частота"}
              </div>
              <div class="flex items-center justify-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 {directionClass[trend.direction]}"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d={directionIcon[trend.direction]}
                  />
                </svg>
                <span class="font-bold {directionClass[trend.direction]}"
                  >{directionLabels[trend.direction]}</span
                >
              </div>
              <div class="text-xs mt-1 text-base-content/60">
                R<sup>2</sup>: {(trend.r2 * 100).toFixed(0)}%
              </div>
            </div>
          {/if}
        {/each}
      </div>

      <!-- График -->
      <div class="bg-base-200 rounded-lg p-3">
        <div class="h-64"><canvas bind:this={forecastCanvas}></canvas></div>
      </div>

      <!-- Таблица прогнозов -->
      {@const incidentsTrend = trends.get("incidents")}
      {#if incidentsTrend && incidentsTrend.forecast.length > 0}
        <div class="overflow-x-auto">
          <table class="table table-sm">
            <thead>
              <tr class="bg-base-200">
                <th>Год</th>
                <th class="text-right">Прогноз</th>
                <th class="text-right">Нижн. граница</th>
                <th class="text-right">Верхн. граница</th>
              </tr>
            </thead>
            <tbody>
              {#each incidentsTrend.forecast as f}
                <tr>
                  <td class="font-medium">{f.year}</td>
                  <td class="text-right font-mono">{Math.round(f.value)}</td>
                  <td class="text-right font-mono"
                    >{Math.round(f.lowerBound)}</td
                  >
                  <td class="text-right font-mono"
                    >{Math.round(f.upperBound)}</td
                  >
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}

      <!-- Методология -->
      <div class="collapse collapse-arrow bg-base-200">
        <input type="checkbox" />
        <div class="collapse-title text-sm">Методология</div>
        <div class="collapse-content text-xs text-base-content/70">
          <p>Линейная регрессия: Y = a + b x X</p>
          <p>R2 - точность модели (ближе к 1 - лучше)</p>
          <p>Доверительные интервалы 95%</p>
        </div>
      </div>
    {/if}
  </div>
</div>
