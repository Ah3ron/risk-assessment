<script lang="ts">
  import { 
    calculateRiskScore, 
    getRiskLevel, 
    generateRecommendations,
    calculateStatistics,
    analyzeTrend
  } from '$lib/statistics';
  import { formatNumber } from '$lib/parser';
  import type { IncidentData } from '$lib/types';

  interface Props {
    data: IncidentData[];
  }

  let { data }: Props = $props();

  const riskScore = $derived(calculateRiskScore(data));
  const riskLevel = $derived(getRiskLevel(riskScore));
  const recommendations = $derived(generateRecommendations(data, riskScore));
  const stats = $derived(calculateStatistics(data.map(d => d.totalIncidents)));
  const trend = $derived(analyzeTrend(data.map(d => d.totalIncidents), data.map(d => d.year)));

  const levelLabels: Record<string, string> = {
    low: 'Низкий', medium: 'Средний', high: 'Высокий', critical: 'Критический'
  };

  const levelBadges: Record<string, string> = {
    low: 'badge-success', medium: 'badge-warning', high: 'badge-warning', critical: 'badge-error'
  };

  function generateReport() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <title>Отчет оценки рисков</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; padding: 30px; line-height: 1.5; max-width: 800px; margin: 0 auto; }
          h1 { font-size: 18pt; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
          h2 { font-size: 14pt; margin-top: 20px; color: #1f2937; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #d1d5db; padding: 6px 10px; text-align: left; }
          th { background: #f3f4f6; }
          .risk-low { color: #16a34a; }
          .risk-medium { color: #ca8a04; }
          .risk-high { color: #ea580c; }
          .risk-critical { color: #dc2626; }
          .footer { margin-top: 30px; text-align: center; font-size: 10pt; color: #6b7280; }
        </style>
      </head>
      <body>
        <h1>Отчет об оценке производственных рисков</h1>
        <p><strong>ЗАО "Солигорский институт проблем ресурсосбережения"</strong></p>
        <p>Дата: ${new Date().toLocaleDateString('ru-RU')} | Период: ${data[0]?.year}-${data[data.length-1]?.year}</p>
        
        <h2>1. Оценка риска</h2>
        <p>Индекс: <strong>${formatNumber(riskScore, 0)}</strong>/100 | Уровень: <strong class="risk-${riskLevel}">${levelLabels[riskLevel]}</strong></p>
        
        <h2>2. Статистика</h2>
        <table>
          <tr><td>Среднее инцидентов</td><td>${formatNumber(stats.mean)}</td></tr>
          <tr><td>Стандартное отклонение</td><td>${formatNumber(stats.stdDev)}</td></tr>
          <tr><td>Коэффициент вариации</td><td>${formatNumber(stats.coefficientOfVariation, 1)}%</td></tr>
        </table>
        
        <h2>3. Тренд</h2>
        <p>Направление: ${trend.direction === 'increasing' ? 'Растущий' : trend.direction === 'decreasing' ? 'Снижающийся' : 'Стабильный'}</p>
        <p>R² = ${(trend.r2 * 100).toFixed(1)}%</p>
        
        <h2>4. Рекомендации</h2>
        <ol>${recommendations.map(r => `<li>${r}</li>`).join('')}</ol>
        
        <div class="footer">© ${new Date().getFullYear()} ЗАО "Солигорский институт проблем ресурсосбережения"</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
</script>

<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="card-title text-lg">
      <div class="badge badge-primary badge-outline p-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      Генерация отчета
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div class="bg-base-200 rounded-lg p-4">
        <div class="text-sm font-medium mb-2">Печать / PDF</div>
        <p class="text-xs text-base-content/60 mb-3">Отчет с таблицами и рекомендациями</p>
        <button class="btn btn-primary btn-sm w-full" onclick={generateReport}>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Сформировать
        </button>
      </div>

      <div class="bg-base-200 rounded-lg p-4">
        <div class="text-sm font-medium mb-2">Сводка</div>
        <div class="text-xs space-y-1">
          <div class="flex justify-between">
            <span class="text-base-content/60">Период:</span>
            <span>{data[0]?.year || '-'} - {data[data.length-1]?.year || '-'}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-base-content/60">Инцидентов:</span>
            <span>{data.reduce((s, d) => s + d.totalIncidents, 0)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-base-content/60">Риск:</span>
            <span class="badge badge-sm {levelBadges[riskLevel]}">{levelLabels[riskLevel]}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="alert alert-info text-xs mt-3">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>Ctrl+P в окне предпросмотра для сохранения в PDF</span>
    </div>
  </div>
</div>
