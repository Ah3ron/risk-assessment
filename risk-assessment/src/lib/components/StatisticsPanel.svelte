<script lang="ts">
  import { calculateStatistics } from '$lib/statistics';
  import { formatNumber } from '$lib/parser';
  import type { IncidentData, StatisticalMetrics } from '$lib/types';

  interface Props {
    data: IncidentData[];
  }

  let { data }: Props = $props();

  const metrics: Record<string, { label: string; values: number[] }> = $derived({
    totalIncidents: { label: 'Инциденты', values: data.map(d => d.totalIncidents) },
    severeInjuries: { label: 'Тяжелые травмы', values: data.map(d => d.severeInjuries) },
    fatalities: { label: 'Смертельные исходы', values: data.map(d => d.fatalities) },
    equipmentFailures: { label: 'Неисправности оборудования', values: data.map(d => d.equipmentFailures) },
    humanFactor: { label: 'Человеческий фактор', values: data.map(d => d.humanFactor) },
    incidentRate: { label: 'Частота на 100', values: data.map(d => d.incidentRate) }
  });

  const statistics: Map<string, StatisticalMetrics> = $derived.by(() => {
    const result = new Map<string, StatisticalMetrics>();
    for (const [key, metric] of Object.entries(metrics)) {
      result.set(key, calculateStatistics(metric.values));
    }
    return result;
  });

  function getTrendIcon(trend: number): string {
    if (trend > 0.5) return '↗';
    if (trend < -0.5) return '↘';
    return '→';
  }

  function getTrendClass(trend: number): string {
    if (trend > 0.5) return 'text-error';
    if (trend < -0.5) return 'text-success';
    return 'text-warning';
  }
</script>

<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="card-title text-lg">
      <div class="badge badge-primary badge-outline p-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      Статистический анализ
    </h2>

    <div class="overflow-x-auto">
      <table class="table table-zebra table-sm">
        <thead>
          <tr class="bg-base-200">
            <th>Показатель</th>
            <th class="text-right">Среднее</th>
            <th class="text-right">Медиана</th>
            <th class="text-right">Ст. откл.</th>
            <th class="text-right">Коэф. вар.</th>
            <th class="text-right">Мин</th>
            <th class="text-right">Макс</th>
            <th class="text-center">Тренд</th>
          </tr>
        </thead>
        <tbody>
          {#each Object.entries(metrics) as [key, metric]}
            {@const stats = statistics.get(key)}
            {#if stats}
              <tr>
                <td class="font-medium">{metric.label}</td>
                <td class="text-right font-mono text-sm">{formatNumber(stats.mean)}</td>
                <td class="text-right font-mono text-sm">{formatNumber(stats.median)}</td>
                <td class="text-right font-mono text-sm">{formatNumber(stats.stdDev)}</td>
                <td class="text-right font-mono text-sm">{formatNumber(stats.coefficientOfVariation, 1)}%</td>
                <td class="text-right font-mono text-sm">{stats.min}</td>
                <td class="text-right font-mono text-sm">{stats.max}</td>
                <td class="text-center">
                  <span class="text-lg font-bold {getTrendClass(stats.trend)}">
                    {getTrendIcon(stats.trend)}
                  </span>
                </td>
              </tr>
            {/if}
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Пояснения -->
    <div class="bg-base-200 rounded-lg p-3 text-xs">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div>
          <span class="font-medium">Коэф. вариации:</span>
          <span class="text-base-content/60"> до 33% — низкая, 33-66% — средняя, более 66% — высокая вариация</span>
        </div>
        <div>
          <span class="font-medium">Тренд:</span>
          <span class="text-base-content/60"> ↗ рост, ↘ снижение, → стабилизация</span>
        </div>
        <div>
          <span class="font-medium">Ст. отклонение:</span>
          <span class="text-base-content/60"> мера разброса значений</span>
        </div>
      </div>
    </div>
  </div>
</div>
