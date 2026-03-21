// Статистические функции для анализа рисков
import type { 
  IncidentData, 
  StatisticalMetrics, 
  TrendAnalysis, 
  ForecastPoint,
  CorrelationResult,
  RiskLevel
} from './types';

/**
 * Вычисление среднего значения
 */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Вычисление медианы
 */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Вычисление стандартного отклонения
 */
export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = mean(values);
  const squareDiffs = values.map(v => Math.pow(v - avg, 2));
  return Math.sqrt(mean(squareDiffs));
}

/**
 * Вычисление дисперсии
 */
export function variance(values: number[]): number {
  const std = standardDeviation(values);
  return std * std;
}

/**
 * Вычисление коэффициента вариации
 */
export function coefficientOfVariation(values: number[]): number {
  const avg = mean(values);
  if (avg === 0) return 0;
  return (standardDeviation(values) / avg) * 100;
}

/**
 * Вычисление всех статистических метрик
 */
export function calculateStatistics(values: number[]): StatisticalMetrics {
  const sorted = [...values].sort((a, b) => a - b);
  const avg = mean(values);
  const std = standardDeviation(values);
  
  // Вычисление тренда (простая линейная регрессия)
  const n = values.length;
  const xMean = (n - 1) / 2;
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (values[i] - avg);
    denominator += Math.pow(i - xMean, 2);
  }
  
  const trend = denominator !== 0 ? numerator / denominator : 0;
  
  return {
    mean: avg,
    median: median(values),
    stdDev: std,
    variance: variance(values),
    coefficientOfVariation: coefficientOfVariation(values),
    min: sorted[0] || 0,
    max: sorted[sorted.length - 1] || 0,
    range: (sorted[sorted.length - 1] || 0) - (sorted[0] || 0),
    trend
  };
}

/**
 * Линейная регрессия для прогнозирования
 */
export function linearRegression(x: number[], y: number[]): { slope: number; intercept: number; r2: number } {
  const n = x.length;
  if (n === 0) return { slope: 0, intercept: 0, r2: 0 };
  
  const xMean = mean(x);
  const yMean = mean(y);
  
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (x[i] - xMean) * (y[i] - yMean);
    denominator += Math.pow(x[i] - xMean, 2);
  }
  
  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = yMean - slope * xMean;
  
  // Вычисление R²
  let ssRes = 0;
  let ssTot = 0;
  
  for (let i = 0; i < n; i++) {
    const predicted = slope * x[i] + intercept;
    ssRes += Math.pow(y[i] - predicted, 2);
    ssTot += Math.pow(y[i] - yMean, 2);
  }
  
  const r2 = ssTot !== 0 ? 1 - (ssRes / ssTot) : 0;
  
  return { slope, intercept, r2 };
}

/**
 * Анализ тренда с прогнозом
 */
export function analyzeTrend(values: number[], years: number[]): TrendAnalysis {
  const n = values.length;
  if (n < 2) {
    return {
      direction: 'stable',
      slope: 0,
      r2: 0,
      confidence: 0,
      forecast: []
    };
  }
  
  const { slope, intercept, r2 } = linearRegression(
    years.map((y, i) => i),
    values
  );
  
  // Определение направления тренда
  let direction: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (Math.abs(slope) > 0.1) {
    direction = slope > 0 ? 'increasing' : 'decreasing';
  }
  
  // Прогноз на 3 года вперед
  const forecast: ForecastPoint[] = [];
  const std = standardDeviation(values);
  const lastYear = years[years.length - 1];
  
  for (let i = 1; i <= 3; i++) {
    const futureYear = lastYear + i;
    const predictedValue = intercept + slope * (n - 1 + i);
    const margin = std * 1.96 * Math.sqrt(1 + 1 / n + Math.pow(n - 1 + i - (n - 1) / 2, 2) / (n - 1));
    
    forecast.push({
      year: futureYear,
      value: Math.max(0, predictedValue),
      lowerBound: Math.max(0, predictedValue - margin),
      upperBound: predictedValue + margin
    });
  }
  
  return {
    direction,
    slope,
    r2,
    confidence: Math.abs(r2) * 100,
    forecast
  };
}

/**
 * Вычисление корреляции Пирсона
 */
export function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0) return 0;
  
  const xMean = mean(x);
  const yMean = mean(y);
  
  let numerator = 0;
  let denominatorX = 0;
  let denominatorY = 0;
  
  for (let i = 0; i < n; i++) {
    const dx = x[i] - xMean;
    const dy = y[i] - yMean;
    numerator += dx * dy;
    denominatorX += dx * dx;
    denominatorY += dy * dy;
  }
  
  const denominator = Math.sqrt(denominatorX * denominatorY);
  return denominator !== 0 ? numerator / denominator : 0;
}

/**
 * Анализ корреляций между переменными
 */
export function analyzeCorrelations(data: IncidentData[]): CorrelationResult[] {
  const results: CorrelationResult[] = [];
  
  const variables: { name: string; values: number[] }[] = [
    { name: 'Общее количество инцидентов', values: data.map(d => d.totalIncidents) },
    { name: 'Тяжелые травмы', values: data.map(d => d.severeInjuries) },
    { name: 'Смертельные исходы', values: data.map(d => d.fatalities) },
    { name: 'Неисправности оборудования', values: data.map(d => d.equipmentFailures) },
    { name: 'Человеческий фактор', values: data.map(d => d.humanFactor) },
    { name: 'Экологические риски', values: data.map(d => d.environmentalRisks) }
  ];
  
  for (let i = 0; i < variables.length; i++) {
    for (let j = i + 1; j < variables.length; j++) {
      const correlation = pearsonCorrelation(variables[i].values, variables[j].values);
      
      let strength = 'слабая';
      const absCorr = Math.abs(correlation);
      if (absCorr >= 0.9) strength = 'очень сильная';
      else if (absCorr >= 0.7) strength = 'сильная';
      else if (absCorr >= 0.5) strength = 'умеренная';
      else if (absCorr >= 0.3) strength = 'слабая';
      else strength = 'очень слабая';
      
      results.push({
        variable1: variables[i].name,
        variable2: variables[j].name,
        correlation,
        strength,
        direction: correlation > 0 ? 'положительная' : 'отрицательная'
      });
    }
  }
  
  return results.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
}

/**
 * Расчет общего индекса риска
 */
export function calculateRiskScore(data: IncidentData[]): number {
  if (data.length === 0) return 0;
  
  const lastYear = data[data.length - 1];
  const previousYears = data.slice(0, -1);
  
  // Веса компонентов риска
  const weights = {
    fatalities: 0.35,          // Смертельные исходы - наибольший вес
    severeInjuries: 0.25,      // Тяжелые травмы
    totalIncidents: 0.15,      // Общее количество инцидентов
    equipmentFailures: 0.10,   // Неисправности оборудования
    humanFactor: 0.10,         // Человеческий фактор
    environmentalRisks: 0.05   // Экологические риски
  };
  
  // Нормализация значений
  const maxValues = {
    fatalities: Math.max(...data.map(d => d.fatalities), 1),
    severeInjuries: Math.max(...data.map(d => d.severeInjuries), 1),
    totalIncidents: Math.max(...data.map(d => d.totalIncidents), 1),
    equipmentFailures: Math.max(...data.map(d => d.equipmentFailures), 1),
    humanFactor: Math.max(...data.map(d => d.humanFactor), 1),
    environmentalRisks: Math.max(...data.map(d => d.environmentalRisks), 1)
  };
  
  // Расчет нормализованных компонентов
  const normalizedScore = 
    (lastYear.fatalities / maxValues.fatalities) * weights.fatalities +
    (lastYear.severeInjuries / maxValues.severeInjuries) * weights.severeInjuries +
    (lastYear.totalIncidents / maxValues.totalIncidents) * weights.totalIncidents +
    (lastYear.equipmentFailures / maxValues.equipmentFailures) * weights.equipmentFailures +
    (lastYear.humanFactor / maxValues.humanFactor) * weights.humanFactor +
    (lastYear.environmentalRisks / maxValues.environmentalRisks) * weights.environmentalRisks;
  
  // Учет тренда (если риск растет, увеличиваем оценку)
  const trendAdjustment = calculateTrendAdjustment(data);
  
  return Math.min(100, Math.max(0, normalizedScore * 100 * (1 + trendAdjustment)));
}

/**
 * Расчет корректировки на тренд
 */
function calculateTrendAdjustment(data: IncidentData[]): number {
  if (data.length < 2) return 0;
  
  const totalIncidents = data.map(d => d.totalIncidents);
  const { slope } = linearRegression(
    data.map((_, i) => i),
    totalIncidents
  );
  
  // Если тренд положительный (рост инцидентов), увеличиваем риск
  const avgIncidents = mean(totalIncidents);
  if (avgIncidents === 0) return 0;
  
  return slope > 0 ? 0.2 : -0.1;
}

/**
 * Определение уровня риска
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score < 25) return 'low';
  if (score < 50) return 'medium';
  if (score < 75) return 'high';
  return 'critical';
}

/**
 * Получение описания уровня риска
 */
export function getRiskLevelDescription(level: RiskLevel): string {
  const descriptions: Record<RiskLevel, string> = {
    low: 'Низкий уровень риска. Производственная безопасность соответствует нормативным требованиям. Рекомендуется продолжать текущую политику безопасности.',
    medium: 'Средний уровень риска. Требуется усиление мер безопасности и проведение дополнительных проверок.',
    high: 'Высокий уровень риска. Необходимо срочное внедрение корректирующих мероприятий и пересмотр системы управления безопасностью.',
    critical: 'Критический уровень риска. Требуется немедленное вмешательство и приостановка опасных производственных процессов.'
  };
  return descriptions[level];
}

/**
 * Расчет скользящего среднего
 */
export function movingAverage(values: number[], window: number): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = values.slice(start, i + 1);
    result.push(mean(slice));
  }
  
  return result;
}

/**
 * Экспоненциальное сглаживание
 */
export function exponentialSmoothing(values: number[], alpha: number): number[] {
  const result: number[] = [values[0]];
  
  for (let i = 1; i < values.length; i++) {
    result.push(alpha * values[i] + (1 - alpha) * result[i - 1]);
  }
  
  return result;
}

/**
 * Генерация рекомендаций на основе анализа
 */
export function generateRecommendations(data: IncidentData[], riskScore: number): string[] {
  const recommendations: string[] = [];
  
  if (data.length === 0) return ['Загрузите данные для анализа'];
  
  const lastYear = data[data.length - 1];
  const stats = {
    total: calculateStatistics(data.map(d => d.totalIncidents)),
    equipment: calculateStatistics(data.map(d => d.equipmentFailures)),
    human: calculateStatistics(data.map(d => d.humanFactor))
  };
  
  // Рекомендации на основе уровня риска
  if (riskScore >= 75) {
    recommendations.push('КРИТИЧНО: Немедленно провести комплексный аудит системы безопасности');
    recommendations.push('КРИТИЧНО: Рассмотреть приостановку опасных производственных процессов');
  } else if (riskScore >= 50) {
    recommendations.push('Срочно разработать план корректирующих мероприятий');
    recommendations.push('Провести дополнительное обучение персонала по технике безопасности');
  }
  
  // Рекомендации на основе трендов
  if (stats.total.trend > 0) {
    recommendations.push('Внимание: Наблюдается рост общего количества инцидентов. Требуется анализ причин');
  }
  
  // Рекомендации на основе причин инцидентов
  const totalCauses = lastYear.equipmentFailures + lastYear.humanFactor + lastYear.environmentalRisks;
  
  if (lastYear.equipmentFailures / totalCauses > 0.4) {
    recommendations.push('Усилить контроль за техническим состоянием оборудования');
    recommendations.push('Внедрить систему предиктивного обслуживания оборудования');
  }
  
  if (lastYear.humanFactor / totalCauses > 0.4) {
    recommendations.push('Провести дополнительное обучение персонала');
    recommendations.push('Разработать систему мотивации за безопасное поведение');
    recommendations.push('Внедрить систему наблюдения за безопасностью (Safety Observations)');
  }
  
  if (lastYear.environmentalRisks > 0) {
    recommendations.push('Провести оценку экологических рисков');
    recommendations.push('Разработать план мероприятий по снижению экологических рисков');
  }
  
  // Рекомендации на основе смертельных исходов
  if (lastYear.fatalities > 0) {
    recommendations.push('ПРОВЕСТИ РАССЛЕДОВАНИЕ смертельного случая с привлечением независимых экспертов');
    recommendations.push('Разработать дополнительные меры предотвращения аналогичных случаев');
  }
  
  // Стандартные рекомендации
  if (recommendations.length < 3) {
    recommendations.push('Продолжать регулярный мониторинг показателей безопасности');
    recommendations.push('Поддерживать актуальность планов эвакуации и ликвидации аварий');
    recommendations.push('Проводить регулярные учения по действиям в чрезвычайных ситуациях');
  }
  
  return recommendations;
}
