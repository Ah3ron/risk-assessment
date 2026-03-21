<script lang="ts">
  import FileUpload from '$lib/components/FileUpload.svelte';
  import RiskScoreCard from '$lib/components/RiskScoreCard.svelte';
  import StatisticsPanel from '$lib/components/StatisticsPanel.svelte';
  import ChartsPanel from '$lib/components/ChartsPanel.svelte';
  import RiskMatrix from '$lib/components/RiskMatrix.svelte';
  import ForecastPanel from '$lib/components/ForecastPanel.svelte';
  import CorrelationPanel from '$lib/components/CorrelationPanel.svelte';
  import DataTable from '$lib/components/DataTable.svelte';
  import ReportGenerator from '$lib/components/ReportGenerator.svelte';
  import type { IncidentData } from '$lib/types';

  let data = $state<IncidentData[]>([]);
  let activeTab = $state(0);

  const tabs = [
    { id: 0, label: 'Обзор' },
    { id: 1, label: 'Статистика' },
    { id: 2, label: 'Графики' },
    { id: 3, label: 'Матрица' },
    { id: 4, label: 'Прогноз' },
    { id: 5, label: 'Корреляции' },
    { id: 6, label: 'Данные' },
    { id: 7, label: 'Отчет' }
  ];

  function handleDataLoaded(newData: IncidentData[]) {
    data = newData;
  }

  function resetData() {
    data = [];
    activeTab = 0;
  }
</script>

<svelte:head>
  <title>Оценка рисков | Солигорский институт</title>
</svelte:head>

<div class="space-y-4">
  {#if data.length === 0}
    <!-- Начальный экран -->
    <FileUpload onDataLoaded={handleDataLoaded} />

    <!-- Информация о системе -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-lg">
          <div class="badge badge-primary badge-outline p-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          О программном модуле
        </h2>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          <div class="bg-base-200 rounded-lg p-3 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto mb-1 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <div class="text-xs font-medium">Статистика</div>
          </div>
          <div class="bg-base-200 rounded-lg p-3 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto mb-1 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div class="text-xs font-medium">Оценка рисков</div>
          </div>
          <div class="bg-base-200 rounded-lg p-3 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto mb-1 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <div class="text-xs font-medium">Прогноз</div>
          </div>
          <div class="bg-base-200 rounded-lg p-3 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto mb-1 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            <div class="text-xs font-medium">Корреляции</div>
          </div>
          <div class="bg-base-200 rounded-lg p-3 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto mb-1 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            </svg>
            <div class="text-xs font-medium">Графики</div>
          </div>
          <div class="bg-base-200 rounded-lg p-3 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto mb-1 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div class="text-xs font-medium">Отчеты</div>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <!-- Основной интерфейс -->
    <div class="flex flex-wrap justify-between items-center gap-2">
      <div>
        <h2 class="text-xl font-bold">Анализ рисков</h2>
        <p class="text-sm text-base-content/60">{data[0].year} - {data[data.length - 1].year} ({data.length} записей)</p>
      </div>
      <button class="btn btn-ghost btn-sm" onclick={resetData}>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Новые данные
      </button>
    </div>

    <!-- Табы -->
    <div class="tabs tabs-boxed bg-base-100 p-1 shadow overflow-x-auto flex-nowrap">
      {#each tabs as tab}
        <button 
          class="tab whitespace-nowrap flex-shrink-0"
          class:tab-active={activeTab === tab.id}
          onclick={() => activeTab = tab.id}
        >
          {tab.label}
        </button>
      {/each}
    </div>

    <!-- Контент -->
    <div class="animate-fade-in">
      {#if activeTab === 0}
        <div class="space-y-4">
          <RiskScoreCard {data} />
          <DataTable {data} />
        </div>
      {:else if activeTab === 1}
        <StatisticsPanel {data} />
      {:else if activeTab === 2}
        <ChartsPanel {data} />
      {:else if activeTab === 3}
        <RiskMatrix {data} />
      {:else if activeTab === 4}
        <ForecastPanel {data} />
      {:else if activeTab === 5}
        <CorrelationPanel {data} />
      {:else if activeTab === 6}
        <DataTable {data} />
      {:else if activeTab === 7}
        <ReportGenerator {data} />
      {/if}
    </div>
  {/if}
</div>
