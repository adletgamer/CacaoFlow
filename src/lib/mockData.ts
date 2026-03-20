export interface Lot {
  id: string;
  producerId: string;
  producerName: string;
  location: string;
  coordinates: { lat: number; lng: number };
  areaSembrada: number;
  cacaoType: "CCN-51" | "Fino de Aroma" | "Trinitario";
  treeAge: number;
  estimatedHarvestDate: string;
  status: "registered" | "scored" | "vpc_issued" | "funded" | "settled";
  createdAt: string;
}

export interface ScoreBreakdownItem {
  label: string;
  value: number;
  max: number;
  color: "green" | "yellow" | "red";
}

export interface ScoringResult {
  lotId: string;
  yieldEstimated: number;
  score: string;
  scoreNumeric: number;
  riskLevel: "low" | "medium" | "high";
  climaticRisk: "low" | "moderate" | "high";
  maxFunding: number;
  historicalYield: number;
  confidenceIndex: number;
  breakdown: ScoreBreakdownItem[];
}

export interface VPC {
  id: string;
  lotId: string;
  claimHash: string;
  onchainReference: string;
  metadata: {
    producer: string;
    location: string;
    yield: number;
    score: string;
    issuedAt: string;
  };
  status: "pending" | "issued" | "active";
}

export interface FinancingCandidate {
  lotId: string;
  vpcId: string;
  score: string;
  yieldEstimated: number;
  eligibleAmount: number;
  approvedAmount: number;
  producerName: string;
  location: string;
  cacaoType: string;
  daysRemaining: number;
}

export interface OutcomeSimulation {
  lotId: string;
  actualYield: number;
  projectedYield: number;
  pricePerKg: number;
  totalRevenue: number;
  financierRepayment: number;
  producerNet: number;
  performanceRatio: number;
}

export const mockLots: Lot[] = [
  {
    id: "LOT-2026-001",
    producerId: "PROD-001",
    producerName: "Cooperativa San Martín",
    location: "Huila, Colombia",
    coordinates: { lat: 2.5359, lng: -75.5277 },
    areaSembrada: 4.5,
    cacaoType: "Fino de Aroma",
    treeAge: 6,
    estimatedHarvestDate: "2026-09-15",
    status: "funded",
    createdAt: "2026-01-10",
  },
  {
    id: "LOT-2026-002",
    producerId: "PROD-002",
    producerName: "Finca El Progreso",
    location: "Esmeraldas, Ecuador",
    coordinates: { lat: 0.9592, lng: -79.6539 },
    areaSembrada: 3.2,
    cacaoType: "CCN-51",
    treeAge: 4,
    estimatedHarvestDate: "2026-08-20",
    status: "vpc_issued",
    createdAt: "2026-02-05",
  },
  {
    id: "LOT-2026-003",
    producerId: "PROD-003",
    producerName: "Asociación Cacao Sur",
    location: "Tumbes, Perú",
    coordinates: { lat: -3.5669, lng: -80.4515 },
    areaSembrada: 6.0,
    cacaoType: "Trinitario",
    treeAge: 8,
    estimatedHarvestDate: "2026-10-01",
    status: "scored",
    createdAt: "2026-03-01",
  },
];

export const mockScoring: Record<string, ScoringResult> = {
  "LOT-2026-001": {
    lotId: "LOT-2026-001",
    yieldEstimated: 1.8,
    score: "A",
    scoreNumeric: 92,
    riskLevel: "low",
    climaticRisk: "low",
    maxFunding: 3600,
    historicalYield: 1.65,
    confidenceIndex: 94,
    breakdown: [
      { label: "Consistencia histórica", value: 36, max: 40, color: "green" },
      { label: "Riesgo climático", value: 26, max: 30, color: "green" },
      { label: "Tamaño del lote", value: 14, max: 15, color: "green" },
      { label: "Documentación completa", value: 16, max: 15, color: "green" },
    ],
  },
  "LOT-2026-002": {
    lotId: "LOT-2026-002",
    yieldEstimated: 1.2,
    score: "B+",
    scoreNumeric: 78,
    riskLevel: "medium",
    climaticRisk: "moderate",
    maxFunding: 2400,
    historicalYield: 1.1,
    confidenceIndex: 81,
    breakdown: [
      { label: "Consistencia histórica", value: 28, max: 40, color: "yellow" },
      { label: "Riesgo climático", value: 22, max: 30, color: "yellow" },
      { label: "Tamaño del lote", value: 13, max: 15, color: "green" },
      { label: "Documentación completa", value: 15, max: 15, color: "green" },
    ],
  },
  "LOT-2026-003": {
    lotId: "LOT-2026-003",
    yieldEstimated: 2.4,
    score: "A-",
    scoreNumeric: 86,
    riskLevel: "low",
    climaticRisk: "low",
    maxFunding: 4800,
    historicalYield: 2.2,
    confidenceIndex: 88,
    breakdown: [
      { label: "Consistencia histórica", value: 32, max: 40, color: "green" },
      { label: "Riesgo climático", value: 24, max: 30, color: "green" },
      { label: "Tamaño del lote", value: 15, max: 15, color: "green" },
      { label: "Documentación completa", value: 15, max: 15, color: "green" },
    ],
  },
};

export const mockVPCs: Record<string, VPC> = {
  "LOT-2026-001": {
    id: "VPC-2026-001",
    lotId: "LOT-2026-001",
    claimHash: "0x7a3b...f29e1c4d8b",
    onchainReference: "stellar:VPC-2026-001",
    metadata: {
      producer: "Cooperativa San Martín",
      location: "Huila, Colombia",
      yield: 1.8,
      score: "A",
      issuedAt: "2026-01-15",
    },
    status: "active",
  },
  "LOT-2026-002": {
    id: "VPC-2026-002",
    lotId: "LOT-2026-002",
    claimHash: "0x3e9f...a12b5c7d3e",
    onchainReference: "stellar:VPC-2026-002",
    metadata: {
      producer: "Finca El Progreso",
      location: "Esmeraldas, Ecuador",
      yield: 1.2,
      score: "B+",
      issuedAt: "2026-02-10",
    },
    status: "active",
  },
};

export const mockCandidates: FinancingCandidate[] = [
  {
    lotId: "LOT-2026-001",
    vpcId: "VPC-2026-001",
    score: "A",
    yieldEstimated: 1.8,
    eligibleAmount: 3600,
    approvedAmount: 2880,
    producerName: "Cooperativa San Martín",
    location: "Huila, Colombia",
    cacaoType: "Fino de Aroma",
    daysRemaining: 45,
  },
  {
    lotId: "LOT-2026-002",
    vpcId: "VPC-2026-002",
    score: "B+",
    yieldEstimated: 1.2,
    eligibleAmount: 2400,
    approvedAmount: 960,
    producerName: "Finca El Progreso",
    location: "Esmeraldas, Ecuador",
    cacaoType: "CCN-51",
    daysRemaining: 62,
  },
  {
    lotId: "LOT-2026-003",
    vpcId: "VPC-2026-003",
    score: "A-",
    yieldEstimated: 2.4,
    eligibleAmount: 4800,
    approvedAmount: 0,
    producerName: "Asociación Cacao Sur",
    location: "Tumbes, Perú",
    cacaoType: "Trinitario",
    daysRemaining: 90,
  },
];

export const mockOutcome: OutcomeSimulation = {
  lotId: "LOT-2026-001",
  actualYield: 1.92,
  projectedYield: 1.8,
  pricePerKg: 2850,
  totalRevenue: 5472,
  financierRepayment: 3168,
  producerNet: 2304,
  performanceRatio: 1.067,
};
