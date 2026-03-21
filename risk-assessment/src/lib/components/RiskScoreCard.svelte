<script lang="ts">
  import { 
    calculateRiskScore, 
    getRiskLevel, 
    getRiskLevelDescription,
    generateRecommendations 
  } from '$lib/statistics';
  import { formatNumber } from '$lib/parser';
  import type { IncidentData } from '$lib/types';

  interface Props {
    data: IncidentData[];
  }

  let { data }: Props = $props();

  const riskScore = $derived(calculateRiskScore(data));
  const riskLevel = $derived(getRiskLevel(riskScore));
  const riskDescription = $derived(getRiskLevelDescription(riskLevel));
  const recommendations = $derived(generateRecommendations(data, riskScore));

  const levelConfig = {
    low: { label: 'Низкий', badge: 'badge-success', bg: 'bg-success/10', progress: 'text-success' },
    medium: { label: 'Средний', badge: 'badge-warning', bg: 'bg-warning/10', progress: 'text-warning' },
    high: { label: 'Высокий', badge: 'badge-orange-500', bg: 'bg-orange-500/10', progress: 'text-orange-500' },
    critical: { label: 'Критический', badge: 'badge-error', bg: 'bg-error/10', progress: 'text-error' }
  };

  const config = $derived(levelConfig[riskLevel]);
</script>

<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="card-title text-lg">
      <div class="badge badge-primary badge-outline p-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
      Оценка производственного риска
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Индикатор с фоном -->
      <div class="flex flex-col items-center justify-center py-6">
        <div class="relative">
          <!-- Фоновый круг -->
          <div class="absolute inset-0 rounded-full bg-base-200 scale-110"></div>
          <!-- Прогресс -->
          <div class="radial-progress {config.progress} text-lg relative z-10" style="--value:{riskScore}; --size:11rem; --thickness:0.7rem; --bg: transparent;">
            <div class="text-center">
              <div class="text-4xl font-bold">{formatNumber(riskScore, 0)}</div>
              <div class="text-xs text-base-content/60">из 100</div>
            </div>
          </div>
        </div>
        <div class="mt-4">
          <span class="badge {config.badge} badge-lg gap-1">
            {config.label} уровень риска
          </span>
        </div>
      </div>

      <!-- Шкала -->
      <div class="space-y-3">
        <div class="text-sm font-medium">Шкала уровней:</div>
        <div class="grid grid-cols-4 gap-1 text-xs text-center">
          <div class="bg-success text-success-content rounded py-2">0-24</div>
          <div class="bg-warning text-warning-content rounded py-2">25-49</div>
          <div class="bg-orange-500 text-white rounded py-2">50-74</div>
          <div class="bg-error text-error-content rounded py-2">75-100</div>
        </div>
        <div class="grid grid-cols-4 gap-1 text-xs text-center text-base-content/60">
          <span>Низкий</span>
          <span>Средний</span>
          <span>Высокий</span>
          <span>Крит.</span>
        </div>
        
        <div class="{config.bg} rounded-lg p-3 text-sm mt-4">
          {riskDescription}
        </div>
      </div>
    </div>

    <div class="divider my-2"></div>

    <!-- Рекомендации -->
    <div>
      <div class="flex items-center gap-2 mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <span class="text-sm font-medium">Рекомендации</span>
      </div>
      
      <ul class="space-y-1.5 max-h-48 overflow-y-auto">
        {#each recommendations as rec, i}
          <li class="flex items-start gap-2 text-sm">
            <span class="badge badge-primary badge-xs mt-1">{i + 1}</span>
            <span class:text-error={rec.startsWith('КРИТИЧНО') || rec.startsWith('ПРОВЕСТИ')}>
              {rec}
            </span>
          </li>
        {/each}
      </ul>
    </div>

    <!-- Методология -->
    <div class="collapse collapse-arrow bg-base-200 mt-2">
      <input type="checkbox" />
      <div class="collapse-title text-sm font-medium">
        Методология расчета
      </div>
      <div class="collapse-content text-xs">
        <p class="font-medium mb-1">Формула:</p>
        <code class="block bg-base-300 p-2 rounded mb-2">
          R = (W1 x F + W2 x S + W3 x T + W4 x E + W5 x H + W6 x N) x 100 x K
        </code>
        <p class="text-base-content/70">Весовые коэффициенты: смертельные исходы (0.35), тяжелые травмы (0.25), инциденты (0.15), оборудование (0.10), человеческий фактор (0.10), экология (0.05)</p>
      </div>
    </div>
  </div>
</div>
