/**
 * Roles:
 *  bd         – Business Developer: can enter leads & meetings on behalf of their ST. No pipeline access.
 *  sales      – Sales Team: full pipeline access for their own leads + leads entered by their BDs.
 *  management – Full read visibility of all leads, meetings, and pipelines across the team.
 *  admin      – All management access + edit any record + manage users + configure team hierarchy.
 */
export type UserRole = "bd" | "sales" | "management" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  /** For BD users: the Sales Team member they report to (userId) */
  reportsTo?: string;
  createdAt: string;
}

/**
 * Links a BD user to the Sales Team member they report to.
 * Managed by Admin via the Team Hierarchy panel.
 */
export interface TeamLink {
  bdId: string;
  salesId: string;
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

export type MeetingType = "in-person" | "online";

export interface Meeting {
  id: string;
  title: string;
  leadId: string;
  scheduledById: string; // user who scheduled the meeting
  date: string; // ISO string
  time: string;
  duration?: number; // minutes
  meetingType?: MeetingType;
  location?: string; // address for in-person or link for online
  notes?: string;
  outcome?: string;
  minutes?: string;
  attendees?: string[];
  /** PDF/doc attachment for meeting notes */
  attachmentName?: string;
  attachmentUrl?: string;
  createdAt: string;
}
