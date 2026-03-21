// Утилиты для работы с данными
import Papa from 'papaparse';
import type { IncidentData } from './types';

/**
 * Парсинг CSV файла с данными об инцидентах
 */
export function parseCSVFile(file: File): Promise<IncidentData[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      encoding: 'UTF-8',
      complete: (results) => {
        try {
          const data = results.data as Record<string, string | number>[];
          const incidents: IncidentData[] = data.map(row => ({
            year: Number(row['Год'] || row['year'] || 0),
            totalIncidents: Number(row['Общее_количество_инцидентов'] || row['totalIncidents'] || 0),
            severeInjuries: Number(row['Тяжелые_травмы'] || row['severeInjuries'] || 0),
            fatalities: Number(row['Смертельные_исходы'] || row['fatalities'] || 0),
            equipmentFailures: Number(row['Оборудование_неисправности'] || row['equipmentFailures'] || 0),
            humanFactor: Number(row['Человеческий_фактор'] || row['humanFactor'] || 0),
            environmentalRisks: Number(row['Экологические_риски'] || row['environmentalRisks'] || 0),
            incidentRate: Number(row['Частота_инцидентов_на_100'] || row['incidentRate'] || 0),
            mortalityRate: Number(row['Коэффициент_смертности'] || row['mortalityRate'] || 0)
          }));
          
          // Сортировка по году
          incidents.sort((a, b) => a.year - b.year);
          
          resolve(incidents);
        } catch (error) {
          reject(new Error('Ошибка обработки данных: неверный формат файла'));
        }
      },
      error: (error) => {
        reject(new Error(`Ошибка чтения файла: ${error.message}`));
      }
    });
  });
}

/**
 * Генерация демонстрационных данных
 */
export function generateDemoData(): IncidentData[] {
  return [
    { year: 2019, totalIncidents: 28, severeInjuries: 7, fatalities: 0, equipmentFailures: 12, humanFactor: 12, environmentalRisks: 3, incidentRate: 5.6, mortalityRate: 0 },
    { year: 2020, totalIncidents: 22, severeInjuries: 7, fatalities: 1, equipmentFailures: 10, humanFactor: 8, environmentalRisks: 1, incidentRate: 4.4, mortalityRate: 200 },
    { year: 2021, totalIncidents: 25, severeInjuries: 5, fatalities: 0, equipmentFailures: 11, humanFactor: 10, environmentalRisks: 2, incidentRate: 5.0, mortalityRate: 0 },
    { year: 2022, totalIncidents: 20, severeInjuries: 4, fatalities: 0, equipmentFailures: 8, humanFactor: 9, environmentalRisks: 2, incidentRate: 4.0, mortalityRate: 0 },
    { year: 2023, totalIncidents: 18, severeInjuries: 3, fatalities: 0, equipmentFailures: 7, humanFactor: 8, environmentalRisks: 1, incidentRate: 3.6, mortalityRate: 0 }
  ];
}

/**
 * Экспорт данных в CSV формат
 */
export function exportToCSV(data: IncidentData[]): string {
  const headers = [
    'Год',
    'Общее_количество_инцидентов',
    'Тяжелые_травмы',
    'Смертельные_исходы',
    'Оборудование_неисправности',
    'Человеческий_фактор',
    'Экологические_риски',
    'Частота_инцидентов_на_100',
    'Коэффициент_смертности'
  ];
  
  const rows = data.map(d => [
    d.year,
    d.totalIncidents,
    d.severeInjuries,
    d.fatalities,
    d.equipmentFailures,
    d.humanFactor,
    d.environmentalRisks,
    d.incidentRate,
    d.mortalityRate
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * Валидация данных
 */
export function validateData(data: IncidentData[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (data.length === 0) {
    errors.push('Файл не содержит данных');
    return { valid: false, errors };
  }
  
  if (data.length < 2) {
    errors.push('Для анализа требуется минимум 2 записи данных');
  }
  
  const years = data.map(d => d.year);
  const uniqueYears = new Set(years);
  
  if (years.length !== uniqueYears.size) {
    errors.push('Обнаружены дублирующиеся годы в данных');
  }
  
  data.forEach((row, index) => {
    if (row.year < 1990 || row.year > new Date().getFullYear() + 10) {
      errors.push(`Строка ${index + 1}: некорректный год ${row.year}`);
    }
    
    if (row.totalIncidents < 0) {
      errors.push(`Строка ${index + 1}: количество инцидентов не может быть отрицательным`);
    }
    
    if (row.severeInjuries > row.totalIncidents) {
      errors.push(`Строка ${index + 1}: количество тяжелых травм превышает общее число инцидентов`);
    }
    
    if (row.fatalities > row.severeInjuries && row.severeInjuries > 0) {
      errors.push(`Строка ${index + 1}: количество смертельных исходов превышает число тяжелых травм`);
    }
  });
  
  return { valid: errors.length === 0, errors };
}

/**
 * Форматирование числа с разделителями
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toLocaleString('ru-RU', { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals 
  });
}

/**
 * Форматирование процента
 */
export function formatPercent(value: number): string {
  return `${formatNumber(value, 1)}%`;
}

/**
 * Определение цвета для уровня риска
 */
export function getRiskColor(level: 'low' | 'medium' | 'high' | 'critical'): string {
  const colors = {
    low: '#22c55e',
    medium: '#eab308',
    high: '#f97316',
    critical: '#ef4444'
  };
  return colors[level];
}

/**
 * Получение CSS класса для уровня риска
 */
export function getRiskClass(level: 'low' | 'medium' | 'high' | 'critical'): string {
  const classes = {
    low: 'badge-success',
    medium: 'badge-warning',
    high: 'badge-orange',
    critical: 'badge-error'
  };
  return classes[level];
}
