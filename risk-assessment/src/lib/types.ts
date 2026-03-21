// Типы данных для системы оценки рисков

export interface IncidentData {
  year: number;
  totalIncidents: number;
  severeInjuries: number;
  fatalities: number;
  equipmentFailures: number;
  humanFactor: number;
  environmentalRisks: number;
  incidentRate: number;
  mortalityRate: number;
}

export interface RiskAssessment {
  overallRiskScore: number;
  riskLevel: RiskLevel;
  riskCategory: RiskCategory;
  components: RiskComponent[];
  recommendations: string[];
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type RiskCategory = 'безопасный' | 'допустимый' | 'критический' | 'недопустимый';

export interface RiskComponent {
  name: string;
  value: number;
  weight: number;
  contribution: number;
  trend: 'improving' | 'stable' | 'worsening';
}

export interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable';
  slope: number;
  r2: number;
  confidence: number;
  forecast: ForecastPoint[];
}

export interface ForecastPoint {
  year: number;
  value: number;
  lowerBound: number;
  upperBound: number;
}

export interface StatisticalMetrics {
  mean: number;
  median: number;
  stdDev: number;
  variance: number;
  coefficientOfVariation: number;
  min: number;
  max: number;
  range: number;
  trend: number;
}

export interface CorrelationResult {
  variable1: string;
  variable2: string;
  correlation: number;
  strength: string;
  direction: string;
}

export interface RiskMatrix {
  probability: number;
  severity: number;
  cell: RiskMatrixCell;
}

export interface RiskMatrixCell {
  level: RiskLevel;
  score: number;
  description: string;
  color: string;
}

export interface ReportData {
  generatedAt: Date;
  dataRange: { start: number; end: number };
  totalRecords: number;
  riskAssessment: RiskAssessment;
  trends: Map<string, TrendAnalysis>;
  statistics: Map<string, StatisticalMetrics>;
  correlations: CorrelationResult[];
  recommendations: string[];
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  fill?: boolean;
  tension?: number;
}

export interface PredictionModel {
  type: 'linear' | 'exponential' | 'polynomial' | 'moving-average';
  parameters: number[];
  accuracy: number;
  forecast: ForecastPoint[];
}
