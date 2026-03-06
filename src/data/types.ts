export type UserRole = "admin" | "management" | "user";

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

export type Industry =
  | "Automotive & Manufacturing"
  | "Banking & Insurance"
  | "Retail & Logistics"
  | "Life Sciences & Healthcare"
  | "ICT & Media";

export const INDUSTRY_OPTIONS: Industry[] = [
  "Automotive & Manufacturing",
  "Banking & Insurance",
  "Retail & Logistics",
  "Life Sciences & Healthcare",
  "ICT & Media",
];

export interface Company {
  id: string;
  name: string;
  industry: Industry | string;
  website?: string;
  location?: string;
  size?: string;
  createdAt: string;
}

/**
 * A Lead represents a unique prospect (unique by email).
 * Multiple users can engage the same lead — each user gets their own pipeline thread (UserPipeline).
 * The Lead record itself does NOT store stage/proposalValue/etc. Those live in UserPipeline.
 */
export interface Lead {
  id: string;
  prospectName: string;
  companyId: string;
  email: string; // unique identifier — same email = same lead record
  linkedIn?: string;
  mobile?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Each user has their own independent pipeline thread per lead.
 * Identified by leadId + ownerId (unique pair).
 * A pipeline thread can have multiple Proposal entries.
 */
export interface UserPipeline {
  id: string;
  leadId: string;
  ownerId: string;
  stage: PipelineStage;
  createdAt: string;
  updatedAt: string;
}

/**
 * A Proposal is a specific commercial offer within a user's pipeline thread.
 * Multiple proposals can exist under the same pipeline thread.
 */
export interface Proposal {
  id: string;
  pipelineId: string; // links to UserPipeline
  leadId: string;
  ownerId: string;
  title: string;
  value: number;
  stage: PipelineStage;
  probability?: number;
  expectedRevenue: number;
  notes?: string;
  attachmentName?: string; // file name for uploaded proposal deck
  attachmentUrl?: string;  // object URL for the uploaded file
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  leadId: string;
  scheduledById: string; // user who scheduled the meeting
  date: string; // ISO string
  time: string;
  duration?: number; // minutes
  notes?: string;
  outcome?: string;
  minutes?: string;
  attendees?: string[];
  createdAt: string;
}
