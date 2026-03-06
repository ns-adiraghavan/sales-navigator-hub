export type UserRole = "admin" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  createdAt: string;
}

export type PipelineStage =
  | "New Lead"
  | "Contacted"
  | "Discovery"
  | "Proposal Sent"
  | "Negotiation"
  | "Closed Won"
  | "Closed Lost";

export interface Company {
  id: string;
  name: string;
  industry: string;
  website?: string;
  location?: string;
  size?: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  prospectName: string;
  companyId: string;
  email: string;
  linkedIn?: string;
  mobile?: string;
  notes?: string;
  ownerId: string;
  stage: PipelineStage;
  proposalValue?: number;
  expectedRevenue?: number;
  probability?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  leadId: string;
  date: string; // ISO string
  time: string;
  duration?: number; // minutes
  notes?: string;
  outcome?: string;
  minutes?: string;
  attendees?: string[];
  createdAt: string;
}

export interface Proposal {
  id: string;
  leadId: string;
  title: string;
  value: number;
  stage: PipelineStage;
  probability: number;
  expectedRevenue: number;
  sentDate?: string;
  closedDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
