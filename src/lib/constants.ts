import { PipelineStage, Proposal, UserPipeline } from "@/data/types";

export const PIPELINE_STAGES: PipelineStage[] = [
  "New Lead",
  "Contacted",
  "Discovery",
  "Proposal Sent",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
];

export const CLOSED_STAGES: PipelineStage[] = ["Closed Won", "Closed Lost"];
export const ACTIVE_STAGES: PipelineStage[] = PIPELINE_STAGES.filter(
  (s) => !CLOSED_STAGES.includes(s)
);

export const STAGE_COLORS: Record<PipelineStage, string> = {
  "New Lead": "bg-blue-100 text-blue-700 border-blue-200",
  Contacted: "bg-purple-100 text-purple-700 border-purple-200",
  Discovery: "bg-amber-100 text-amber-700 border-amber-200",
  "Proposal Sent": "bg-orange-100 text-orange-700 border-orange-200",
  Negotiation: "bg-violet-100 text-violet-700 border-violet-200",
  "Closed Won": "bg-green-100 text-green-700 border-green-200",
  "Closed Lost": "bg-red-100 text-red-700 border-red-200",
};

export const STAGE_DOT: Record<PipelineStage, string> = {
  "New Lead": "bg-blue-500",
  Contacted: "bg-purple-500",
  Discovery: "bg-amber-500",
  "Proposal Sent": "bg-orange-500",
  Negotiation: "bg-violet-500",
  "Closed Won": "bg-green-500",
  "Closed Lost": "bg-red-500",
};

export const formatCurrency = (value?: number, currency: "INR" | "USD" = "INR", usdToInrRate = 90) => {
  if (value === undefined || value === null) return "—";
  if (currency === "USD") {
    const usd = value / usdToInrRate;
    if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(1)}M`;
    if (usd >= 1_000) return `$${(usd / 1_000).toFixed(0)}K`;
    return `$${usd.toFixed(0)}`;
  }
  // INR — use Indian number system (lakhs / crores)
  if (value >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(1)}Cr`;
  if (value >= 1_00_000) return `₹${(value / 1_00_000).toFixed(1)}L`;
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(0)}K`;
  return `₹${value}`;
};

const _seq = () => Math.random().toString(36).substr(2, 7);

export const generateId = (prefix?: "user" | "company" | "lead" | "pipeline" | "proposal" | "meeting") =>
  prefix ? `${prefix}_${_seq()}` : _seq();

/**
 * Returns the display value for a pipeline thread:
 * - Active stages → sum of ALL proposal values (pipeline value)
 * - Closed Won    → sum of proposals whose own stage is "Closed Won" (deal value)
 * - Closed Lost   → sum of proposals whose own stage is "Closed Lost" (deal value)
 */
export const getPipelineDisplayValue = (
  pipeline: UserPipeline,
  proposals: Proposal[]
): number => {
  const threadProposals = proposals.filter((p) => p.pipelineId === pipeline.id);
  if (pipeline.stage === "Closed Won") {
    return threadProposals
      .filter((p) => p.stage === "Closed Won")
      .reduce((s, p) => s + p.value, 0);
  }
  if (pipeline.stage === "Closed Lost") {
    return threadProposals
      .filter((p) => p.stage === "Closed Lost")
      .reduce((s, p) => s + p.value, 0);
  }
  // Active: total pipeline value across all proposals
  return threadProposals.reduce((s, p) => s + p.value, 0);
};

/**
 * Returns the expected revenue for a pipeline thread (same closed/active split).
 */
export const getPipelineDisplayExpected = (
  pipeline: UserPipeline,
  proposals: Proposal[]
): number => {
  const threadProposals = proposals.filter((p) => p.pipelineId === pipeline.id);
  if (pipeline.stage === "Closed Won") {
    return threadProposals
      .filter((p) => p.stage === "Closed Won")
      .reduce((s, p) => s + p.expectedRevenue, 0);
  }
  if (pipeline.stage === "Closed Lost") {
    return threadProposals
      .filter((p) => p.stage === "Closed Lost")
      .reduce((s, p) => s + p.expectedRevenue, 0);
  }
  return threadProposals.reduce((s, p) => s + p.expectedRevenue, 0);
};
