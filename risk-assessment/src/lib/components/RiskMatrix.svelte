<script lang="ts">
  import type { IncidentData, RiskLevel } from '$lib/types';

  interface Props {
    data: IncidentData[];
  }

  let { data }: Props = $props();

  // Матрица рисков 5x5 с DaisyUI цветами
  const matrix: { level: RiskLevel; class: string }[][] = [
    [
      { level: 'low', class: 'bg-success' },
      { level: 'low', class: 'bg-success' },
      { level: 'medium', class: 'bg-warning' },
      { level: 'medium', class: 'bg-warning' },
      { level: 'high', class: 'bg-orange-500' }
    ],
    [
      { level: 'low', class: 'bg-success' },
      { level: 'medium', class: 'bg-warning' },
      { level: 'medium', class: 'bg-warning' },
      { level: 'high', class: 'bg-orange-500' },
      { level: 'high', class: 'bg-orange-500' }
    ],
    [
      { level: 'medium', class: 'bg-warning' },
      { level: 'medium', class: 'bg-warning' },
      { level: 'high', class: 'bg-orange-500' },
      { level: 'high', class: 'bg-orange-500' },
      { level: 'critical', class: 'bg-error' }
    ],
    [
      { level: 'medium', class: 'bg-warning' },
      { level: 'high', class: 'bg-orange-500' },
      { level: 'high', class: 'bg-orange-500' },
      { level: 'critical', class: 'bg-error' },
      { level: 'critical', class: 'bg-error' }
    ],
    [
      { level: 'high', class: 'bg-orange-500' },
      { level: 'high', class: 'bg-orange-500' },
      { level: 'critical', class: 'bg-error' },
      { level: 'critical', class: 'bg-error' },
      { level: 'critical', class: 'bg-error' }
    ]
  ];

  const severityLabels = ['Незнач.', 'Небольш.', 'Средний', 'Значит.', 'Катастр.'];
  const probabilityLabels = ['Очень низкая', 'Низкая', 'Средняя', 'Высокая', 'Очень высокая'];

  // Текущая позиция риска
  const currentRisk = $derived.by(() => {
    if (!data.length) return null;
    const lastYear = data[data.length - 1];
    const maxIncidents = Math.max(...data.map(d => d.totalIncidents));
    const probabilityIndex = Math.min(4, Math.floor((lastYear.totalIncidents / Math.max(maxIncidents, 1)) * 5));
    const severity = lastYear.fatalities * 5 + lastYear.severeInjuries;
    const severityIndex = Math.min(4, severity);
    return { probability: probabilityIndex, severity: severityIndex };
  });

  // Данные для отображения типов рисков
  const riskTypes = $derived([
    {
      name: 'Неисправности оборудования',
      count: data.length ? data[data.length - 1].equipmentFailures : 0,
      percent: data.length ? Math.round((data[data.length - 1].equipmentFailures / Math.max(data[data.length - 1].totalIncidents, 1)) * 100) : 0,
      color: 'progress-info'
    },
    {
      name: 'Человеческий фактор',
      count: data.length ? data[data.length - 1].humanFactor : 0,
      percent: data.length ? Math.round((data[data.length - 1].humanFactor / Math.max(data[data.length - 1].totalIncidents, 1)) * 100) : 0,
      color: 'progress-warning'
    },
    {
      name: 'Экологические риски',
      count: data.length ? data[data.length - 1].environmentalRisks : 0,
      percent: data.length ? Math.round((data[data.length - 1].environmentalRisks / Math.max(data[data.length - 1].totalIncidents, 1)) * 100) : 0,
      color: 'progress-success'
    }
  ]);
</script>

<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="card-title text-lg">
      <div class="badge badge-primary badge-outline p-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      </div>
      Матрица рисков
    </h2>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <!-- Матрица 5x5 -->
      <div class="xl:col-span-2">
        <div class="overflow-x-auto">
          <table class="table table-compact w-full">
            <thead>
              <tr>
                <th class="text-xs">Вероятность \ Тяжесть</th>
                {#each severityLabels as label}
                  <th class="text-center text-xs">{label}</th>
                {/each}
              </tr>
            </thead>
            <tbody>
              {#each matrix as row, rowIndex}
                <tr>
                  <td class="text-xs font-medium whitespace-nowrap">{probabilityLabels[4 - rowIndex]}</td>
                  {#each row as cell, colIndex}
                    <td class="p-1">
                      <div 
                        class="{cell.class} h-8 min-w-[40px] rounded transition-all hover:scale-105 hover:z-10 relative"
                        class:ring-2={currentRisk && currentRisk.probability === (4 - rowIndex) && currentRisk.severity === colIndex}
                        class:ring-base-content={currentRisk && currentRisk.probability === (4 - rowIndex) && currentRisk.severity === colIndex}
                      >
                        {#if currentRisk && currentRisk.probability === (4 - rowIndex) && currentRisk.severity === colIndex}
                          <div class="absolute inset-0 flex items-center justify-center">
                            <div class="w-3 h-3 bg-white rounded-full animate-pulse shadow-lg"></div>
                          </div>
                        {/if}
                      </div>
                    </td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <!-- Легенда -->
        <div class="flex flex-wrap gap-2 mt-3 justify-center">
          <div class="badge badge-success badge-sm gap-1">
            <div class="w-2 h-2 rounded-full bg-success-content"></div>
            Низкий
          </div>
          <div class="badge badge-warning badge-sm gap-1">
            <div class="w-2 h-2 rounded-full bg-warning-content"></div>
            Средний
          </div>
          <div class="badge badge-sm gap-1 bg-orange-500 text-white">
            <div class="w-2 h-2 rounded-full bg-white"></div>
            Высокий
          </div>
          <div class="badge badge-error badge-sm gap-1">
            <div class="w-2 h-2 rounded-full bg-error-content"></div>
            Критический
          </div>
        </div>
      </div>

      <!-- Панель справа -->
      <div class="space-y-3">
        <!-- Текущая позиция -->
        {#if currentRisk}
          <div class="alert alert-info">
            <div class="flex-1">
              <div class="text-xs font-medium opacity-70">Текущая позиция:</div>
              <div class="text-sm">
                <span class="font-bold">Вероятность:</span> {probabilityLabels[currentRisk.probability]}
              </div>
              <div class="text-sm">
                <span class="font-bold">Тяжесть:</span> {severityLabels[currentRisk.severity]}
              </div>
            </div>
          </div>
        {/if}

        <!-- Распределение причин -->
        <div class="bg-base-200 rounded-lg p-3">
          <div class="text-sm font-medium mb-2">Причины инцидентов</div>
          <div class="space-y-2">
            {#each riskTypes as risk}
              <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-base-content/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div class="flex-1">
                  <div class="flex justify-between text-xs">
                    <span>{risk.name}</span>
                    <span class="font-bold">{risk.count}</span>
                  </div>
                  <progress 
                    class="progress {risk.color} h-1.5 w-full" 
                    value={risk.percent} 
                    max="100"
                  ></progress>
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Шкала -->
        <div class="bg-base-200 rounded-lg p-3">
          <div class="text-sm font-medium mb-2">Шкала оценки</div>
          <div class="space-y-1 text-xs">
            <div class="flex justify-between">
              <span>Низкий риск</span>
              <span class="text-base-content/60">0-24</span>
            </div>
            <div class="flex justify-between">
              <span>Средний риск</span>
              <span class="text-base-content/60">25-49</span>
            </div>
            <div class="flex justify-between">
              <span>Высокий риск</span>
              <span class="text-base-content/60">50-74</span>
            </div>
            <div class="flex justify-between">
              <span>Критический риск</span>
              <span class="text-base-content/60">75-100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
