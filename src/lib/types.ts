// ─── Domain Data Model ───────────────────────────────────────
// Canonical types for the Cacao Flow platform.
// These mirror the target database schema and should be used
// as the source of truth once a real backend is connected.

// ─── Originator ──────────────────────────────────────────────

export interface Originator {
  id: string;
  name: string;
  type: "producer" | "cooperative";
  region: string;
  contact_name: string;
  contact_email: string;
  created_at: string;
}

// ─── Plot ────────────────────────────────────────────────────

export type PlotStatus =
  | "draft"
  | "registered"
  | "ready_for_scoring"
  | "scored"
  | "vpc_issued"
  | "under_review"
  | "pre_approved"
  | "rejected";

export type DocumentationStatus = "insufficient" | "sufficient";

export interface Plot {
  id: string;
  originator_id: string;
  plot_name: string;
  crop_type: "CCN-51" | "Fino de Aroma" | "Trinitario";
  country: string;
  region: string;
  area_hectares: number;
  season_label: string;
  expected_yield_tons: number;
  estimated_harvest_date: string;
  status: PlotStatus;
  documentation_status: DocumentationStatus;
  created_at: string;
  updated_at: string;
}

// ─── Plot Documents ──────────────────────────────────────────

export type DocumentType =
  | "land_record"
  | "yield_history"
  | "crop_plan"
  | "photo_evidence"
  | "other";

export interface PlotDocument {
  id: string;
  plot_id: string;
  document_type: DocumentType;
  file_name: string;
  file_url: string;
  uploaded_at: string;
}

// ─── Plot History (optional, future) ─────────────────────────

export interface PlotHistory {
  id: string;
  plot_id: string;
  season_year: string;
  historical_yield_kg: number;
  notes: string | null;
}

// ─── Scorecard ───────────────────────────────────────────────

export interface Scorecard {
  id: string;
  plot_id: string;
  historical_consistency_score: number;
  climate_risk_score: number;
  plot_size_score: number;
  documentation_score: number;
  total_score: number;
  expected_yield_kg: number;
  financing_ratio: number;
  reference_price_per_kg: number;
  eligible_financing_amount: number;
  created_at: string;
}

// ─── VPC (Verified Production Claim) ─────────────────────────

export interface VPCRecord {
  id: string;
  plot_id: string;
  scorecard_id: string;
  status: "pending" | "issued" | "active" | "settled";
  claim_hash: string;
  onchain_reference: string;
  created_at: string;
}

// ─── Financing Review ────────────────────────────────────────

export interface FinancingReview {
  id: string;
  vpc_id: string;
  financier_name: string;
  review_status: "pending" | "approved" | "rejected" | "funded";
  approved_amount: number;
  notes: string | null;
  reviewed_at: string;
}
