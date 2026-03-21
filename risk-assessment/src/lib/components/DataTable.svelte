<script lang="ts">
  import { exportToCSV, formatNumber } from '$lib/parser';
  import type { IncidentData } from '$lib/types';

  interface Props {
    data: IncidentData[];
  }

  let { data }: Props = $props();

  function downloadCSV() {
    const csv = exportToCSV(data);
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'risk_data.csv';
    link.click();
    URL.revokeObjectURL(url);
  }
</script>

<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <div class="flex justify-between items-center mb-2">
      <h2 class="card-title text-lg">
        <div class="badge badge-primary badge-outline p-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        Таблица данных
      </h2>
      
      <button class="btn btn-sm btn-outline btn-primary" onclick={downloadCSV}>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        CSV
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="table table-zebra table-sm">
        <thead>
          <tr class="bg-base-200">
            <th>Год</th>
            <th class="text-right">Инцид.</th>
            <th class="text-right">Травмы</th>
            <th class="text-right">Смерти</th>
            <th class="text-right">Оборуд.</th>
            <th class="text-right">Чел.фак.</th>
            <th class="text-right">Эколог.</th>
            <th class="text-right">Частота</th>
          </tr>
        </thead>
        <tbody>
          {#each data as row}
            {@const rowClass = row.fatalities > 0 ? 'bg-error/10' : row.severeInjuries > 5 ? 'bg-warning/10' : ''}
            <tr class="hover:bg-base-200 {rowClass}">
              <td class="font-medium">{row.year}</td>
              <td class="text-right">{row.totalIncidents}</td>
              <td class="text-right">{row.severeInjuries}</td>
              <td class="text-right">
                {#if row.fatalities > 0}
                  <span class="badge badge-error badge-sm">{row.fatalities}</span>
                {:else}
                  <span class="text-base-content/40">0</span>
                {/if}
              </td>
              <td class="text-right">{row.equipmentFailures}</td>
              <td class="text-right">{row.humanFactor}</td>
              <td class="text-right">{row.environmentalRisks}</td>
              <td class="text-right font-mono text-sm">{formatNumber(row.incidentRate, 1)}</td>
            </tr>
          {/each}
        </tbody>
        <tfoot>
          <tr class="bg-base-300 font-medium">
            <td>ИТОГО</td>
            <td class="text-right">{data.reduce((s, d) => s + d.totalIncidents, 0)}</td>
            <td class="text-right">{data.reduce((s, d) => s + d.severeInjuries, 0)}</td>
            <td class="text-right">
              {#if data.reduce((s, d) => s + d.fatalities, 0) > 0}
                <span class="text-error">{data.reduce((s, d) => s + d.fatalities, 0)}</span>
              {:else}
                0
              {/if}
            </td>
            <td class="text-right">{data.reduce((s, d) => s + d.equipmentFailures, 0)}</td>
            <td class="text-right">{data.reduce((s, d) => s + d.humanFactor, 0)}</td>
            <td class="text-right">{data.reduce((s, d) => s + d.environmentalRisks, 0)}</td>
            <td class="text-right">—</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="flex gap-4 text-xs text-base-content/60 mt-2">
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 bg-error/20 rounded"></div>
        <span>Смертельные исходы</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-3 h-3 bg-warning/20 rounded"></div>
        <span>Много травм (&gt;5)</span>
      </div>
    </div>
  </div>
</div>
