<script lang="ts">
  import { onMount } from 'svelte';
  import { Chart, registerables } from 'chart.js';
  import type { IncidentData } from '$lib/types';

  Chart.register(...registerables);

  interface Props {
    data: IncidentData[];
  }

  let { data }: Props = $props();

  let incidentsCanvas: HTMLCanvasElement;
  let causesCanvas: HTMLCanvasElement;
  let trendCanvas: HTMLCanvasElement;

  let incidentsChart: Chart | null = null;
  let causesChart: Chart | null = null;
  let trendChart: Chart | null = null;

  const years = $derived(data.map(d => d.year.toString()));

  // DaisyUI цвета для графиков
  const colors = {
    primary: '#3b82f6',      // blue
    secondary: '#22c55e',    // green  
    warning: '#f59e0b',      // amber
    error: '#ef4444',        // red
    info: '#06b6d4',         // cyan
    purple: '#8b5cf6'        // violet
  };

  function createCharts() {
    if (!data.length) return;

    incidentsChart?.destroy();
    causesChart?.destroy();
    trendChart?.destroy();

    // График инцидентов
    incidentsChart = new Chart(incidentsCanvas, {
      type: 'bar',
      data: {
        labels: years,
        datasets: [
          { 
            label: 'Всего', 
            data: data.map(d => d.totalIncidents), 
            backgroundColor: colors.primary, 
            borderRadius: 4 
          },
          { 
            label: 'Травмы', 
            data: data.map(d => d.severeInjuries), 
            backgroundColor: colors.warning, 
            borderRadius: 4 
          },
          { 
            label: 'Смерти', 
            data: data.map(d => d.fatalities), 
            backgroundColor: colors.error, 
            borderRadius: 4 
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { position: 'top' }, 
          title: { display: true, text: 'Динамика инцидентов' } 
        },
        scales: { y: { beginAtZero: true } }
      }
    });

    // Круговая диаграмма
    const lastYear = data[data.length - 1];
    causesChart = new Chart(causesCanvas, {
      type: 'doughnut',
      data: {
        labels: ['Оборудование', 'Человеческий фактор', 'Экология'],
        datasets: [{
          data: [lastYear.equipmentFailures, lastYear.humanFactor, lastYear.environmentalRisks],
          backgroundColor: [colors.primary, colors.warning, colors.secondary]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { position: 'right' }, 
          title: { display: true, text: `Причины (${lastYear.year})` } 
        }
      }
    });

    // Тренды
    trendChart = new Chart(trendCanvas, {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          { 
            label: 'Инциденты', 
            data: data.map(d => d.totalIncidents), 
            borderColor: colors.primary, 
            backgroundColor: colors.primary + '20',
            fill: true, 
            tension: 0.3 
          },
          { 
            label: 'Травмы', 
            data: data.map(d => d.severeInjuries), 
            borderColor: colors.warning, 
            backgroundColor: colors.warning + '20',
            fill: true, 
            tension: 0.3 
          },
          { 
            label: 'Частота', 
            data: data.map(d => d.incidentRate), 
            borderColor: colors.secondary, 
            backgroundColor: colors.secondary + '20',
            fill: true, 
            tension: 0.3, 
            yAxisID: 'y1' 
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: { 
          legend: { position: 'top' }, 
          title: { display: true, text: 'Тренды показателей' } 
        },
        scales: {
          y: { type: 'linear', display: true, position: 'left' },
          y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false } }
        }
      }
    });
  }

  onMount(() => { if (data.length) createCharts(); });
  $effect(() => { if (data.length) createCharts(); });
</script>

<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="card-title text-lg">
      <div class="badge badge-primary badge-outline p-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        </svg>
      </div>
      Визуализация данных
    </h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-base-200 rounded-lg p-3">
        <div class="h-64"><canvas bind:this={incidentsCanvas}></canvas></div>
      </div>
      <div class="bg-base-200 rounded-lg p-3">
        <div class="h-64"><canvas bind:this={causesCanvas}></canvas></div>
      </div>
      <div class="bg-base-200 rounded-lg p-3 lg:col-span-2">
        <div class="h-64"><canvas bind:this={trendCanvas}></canvas></div>
      </div>
    </div>
  </div>
</div>
