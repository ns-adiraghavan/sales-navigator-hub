import { PipelineStage } from "@/data/types";

export const PIPELINE_STAGES: PipelineStage[] = [
  "New Lead",
  "Contacted",
  "Discovery",
  "Proposal Sent",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
];

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

export const formatCurrency = (value?: number) => {
  if (!value) return "—";
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
};

export const generateId = () => Math.random().toString(36).substr(2, 9);
