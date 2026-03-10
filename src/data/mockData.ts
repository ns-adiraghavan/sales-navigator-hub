import { User, Company, Lead, Meeting, Proposal, UserPipeline, TeamLink } from "./types";

export const CURRENT_USER: User = {
  id: "u1",
  name: "Alex Johnson",
  email: "alex.johnson@salesops.com",
  role: "admin",
  avatar: "AJ",
  department: "Sales",
  createdAt: "2024-01-15",
};

export const USERS: User[] = [
  CURRENT_USER,
  {
    id: "u2",
    name: "Sarah Mitchell",
    email: "sarah.mitchell@salesops.com",
    role: "sales",
    avatar: "SM",
    department: "Sales",
    createdAt: "2024-02-01",
  },
  {
    id: "u3",
    name: "David Chen",
    email: "david.chen@salesops.com",
    role: "sales",
    avatar: "DC",
    department: "Sales",
    createdAt: "2024-02-15",
  },
  {
    id: "u4",
    name: "Maria Garcia",
    email: "maria.garcia@salesops.com",
    role: "management",
    avatar: "MG",
    department: "Management",
    createdAt: "2024-01-10",
  },
  {
    id: "u5",
    name: "James Wilson",
    email: "james.wilson@salesops.com",
    role: "sales",
    avatar: "JW",
    department: "Sales",
    createdAt: "2024-03-01",
  },
  {
    id: "u6",
    name: "Priya Patel",
    email: "priya.patel@salesops.com",
    role: "bd",
    avatar: "PP",
    department: "Business Development",
    reportsTo: "u2", // reports to Sarah Mitchell (sales)
    createdAt: "2024-04-01",
  },
  {
    id: "u7",
    name: "Tom Nguyen",
    email: "tom.nguyen@salesops.com",
    role: "bd",
    avatar: "TN",
    department: "Business Development",
    reportsTo: "u3", // reports to David Chen (sales)
    createdAt: "2024-04-05",
  },
];

/**
 * Team hierarchy: BD → Sales relationships.
 * Derived from User.reportsTo, but also stored here for Admin editing.
 */
export const TEAM_LINKS: TeamLink[] = [
  { bdId: "u6", salesId: "u2" },
  { bdId: "u7", salesId: "u3" },
];

export const COMPANIES: Company[] = [
  { id: "c1", name: "Coca-Cola", industry: "Retail & Logistics", website: "coca-cola.com", location: "Atlanta, GA", size: "500K+", createdAt: "2024-01-20" },
  { id: "c2", name: "Salesforce", industry: "ICT & Media", website: "salesforce.com", location: "San Francisco, CA", size: "70K+", createdAt: "2024-01-22" },
  { id: "c3", name: "Goldman Sachs", industry: "Banking & Insurance", website: "goldmansachs.com", location: "New York, NY", size: "45K+", createdAt: "2024-01-25" },
  { id: "c4", name: "Tesla", industry: "Automotive & Manufacturing", website: "tesla.com", location: "Austin, TX", size: "127K+", createdAt: "2024-02-01" },
  { id: "c5", name: "Deloitte", industry: "ICT & Media", website: "deloitte.com", location: "New York, NY", size: "415K+", createdAt: "2024-02-10" },
  { id: "c6", name: "Pfizer", industry: "Life Sciences & Healthcare", website: "pfizer.com", location: "New York, NY", size: "83K+", createdAt: "2024-02-15" },
  { id: "c7", name: "Amazon Web Services", industry: "ICT & Media", website: "aws.amazon.com", location: "Seattle, WA", size: "1.5M+", createdAt: "2024-02-20" },
  { id: "c8", name: "Unilever", industry: "Retail & Logistics", website: "unilever.com", location: "London, UK", size: "149K+", createdAt: "2024-03-01" },
];

/**
 * Leads are unique by email address.
 * Multiple users can engage the same lead — their pipeline info is stored in USER_PIPELINES.
 */
export const LEADS: Lead[] = [
  { id: "l1", prospectName: "John Martinez", companyId: "c1", email: "j.martinez@coca-cola.com", linkedIn: "linkedin.com/in/jmartinez", mobile: "+1-404-555-0123", notes: "Interested in enterprise software solutions.", createdAt: "2024-03-01", updatedAt: "2024-03-10" },
  { id: "l2", prospectName: "Lisa Thompson", companyId: "c1", email: "l.thompson@coca-cola.com", mobile: "+1-404-555-0124", notes: "Director of IT infrastructure.", createdAt: "2024-03-05", updatedAt: "2024-03-12" },
  { id: "l3", prospectName: "Robert Kim", companyId: "c1", email: "r.kim@coca-cola.com", linkedIn: "linkedin.com/in/rkim", notes: "VP of Operations, interested in automation.", createdAt: "2024-02-20", updatedAt: "2024-03-15" },
  { id: "l4", prospectName: "Amanda Foster", companyId: "c2", email: "a.foster@salesforce.com", linkedIn: "linkedin.com/in/afoster", mobile: "+1-415-555-0201", notes: "Exploring third-party integrations.", createdAt: "2024-03-08", updatedAt: "2024-03-08" },
  { id: "l5", prospectName: "Michael Brown", companyId: "c2", email: "m.brown@salesforce.com", mobile: "+1-415-555-0202", notes: "Product team lead.", createdAt: "2024-03-12", updatedAt: "2024-03-12" },
  { id: "l6", prospectName: "Jennifer Walsh", companyId: "c3", email: "j.walsh@gs.com", linkedIn: "linkedin.com/in/jwalsh", mobile: "+1-212-555-0301", notes: "Head of Digital Transformation.", createdAt: "2024-01-15", updatedAt: "2024-03-01" },
  { id: "l7", prospectName: "Chris Anderson", companyId: "c4", email: "c.anderson@tesla.com", linkedIn: "linkedin.com/in/canderson", notes: "Senior Manager, Supply Chain.", createdAt: "2024-02-28", updatedAt: "2024-03-11" },
  { id: "l8", prospectName: "Patricia Lee", companyId: "c5", email: "p.lee@deloitte.com", mobile: "+1-212-555-0501", notes: "Senior Partner, wants consulting platform.", createdAt: "2024-03-03", updatedAt: "2024-03-09" },
  { id: "l9", prospectName: "Steven Park", companyId: "c5", email: "s.park@deloitte.com", linkedIn: "linkedin.com/in/spark", mobile: "+1-212-555-0502", notes: "Principal, Technology Practice.", createdAt: "2024-02-25", updatedAt: "2024-03-14" },
  { id: "l10", prospectName: "Rachel Torres", companyId: "c6", email: "r.torres@pfizer.com", mobile: "+1-212-555-0601", notes: "VP of IT, interested in data analytics.", createdAt: "2024-03-10", updatedAt: "2024-03-10" },
  { id: "l11", prospectName: "Daniel Wright", companyId: "c7", email: "d.wright@aws.amazon.com", linkedIn: "linkedin.com/in/dwright", mobile: "+1-206-555-0701", notes: "Technical Account Manager interested in collaboration tools.", createdAt: "2024-03-14", updatedAt: "2024-03-14" },
  { id: "l12", prospectName: "Emma Clark", companyId: "c8", email: "e.clark@unilever.com", linkedIn: "linkedin.com/in/eclark", notes: "Global Category Manager.", createdAt: "2024-02-01", updatedAt: "2024-03-05" },
];

/**
 * Per-user pipeline threads. Each user has their own pipeline per lead.
 */
export const USER_PIPELINES: UserPipeline[] = [
  { id: "up1", leadId: "l1", ownerId: "u1", stage: "Proposal Sent", createdAt: "2024-03-01", updatedAt: "2024-03-10" },
  { id: "up2", leadId: "l1", ownerId: "u2", stage: "Discovery", createdAt: "2024-03-05", updatedAt: "2024-03-12" },
  { id: "up3", leadId: "l2", ownerId: "u2", stage: "Discovery", createdAt: "2024-03-05", updatedAt: "2024-03-12" },
  { id: "up4", leadId: "l3", ownerId: "u1", stage: "Negotiation", createdAt: "2024-02-20", updatedAt: "2024-03-15" },
  { id: "up5", leadId: "l4", ownerId: "u2", stage: "Contacted", createdAt: "2024-03-08", updatedAt: "2024-03-08" },
  { id: "up6", leadId: "l5", ownerId: "u3", stage: "New Lead", createdAt: "2024-03-12", updatedAt: "2024-03-12" },
  { id: "up7", leadId: "l6", ownerId: "u1", stage: "Closed Won", createdAt: "2024-01-15", updatedAt: "2024-03-01" },
  { id: "up8", leadId: "l7", ownerId: "u3", stage: "Proposal Sent", createdAt: "2024-02-28", updatedAt: "2024-03-11" },
  { id: "up9", leadId: "l8", ownerId: "u2", stage: "Discovery", createdAt: "2024-03-03", updatedAt: "2024-03-09" },
  { id: "up10", leadId: "l9", ownerId: "u1", stage: "Negotiation", createdAt: "2024-02-25", updatedAt: "2024-03-14" },
  { id: "up11", leadId: "l10", ownerId: "u5", stage: "Contacted", createdAt: "2024-03-10", updatedAt: "2024-03-10" },
  { id: "up12", leadId: "l11", ownerId: "u3", stage: "New Lead", createdAt: "2024-03-14", updatedAt: "2024-03-14" },
  { id: "up13", leadId: "l12", ownerId: "u5", stage: "Closed Lost", createdAt: "2024-02-01", updatedAt: "2024-03-05" },
];

// Get today and relative dates
const today = new Date();
const addDays = (d: Date, days: number) => {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
};
const fmt = (d: Date) => d.toISOString().split("T")[0];

export const MEETINGS: Meeting[] = [
  { id: "m1", title: "Initial Discovery Call", leadId: "l1", scheduledById: "u1", date: fmt(addDays(today, -14)), time: "10:00", duration: 60, notes: "Initial call to understand requirements.", outcome: "Positive - moved to proposal stage", minutes: "Discussed current CRM pain points. Client needs better pipeline visibility. Follow up with proposal by EOW.", attendees: ["Alex Johnson", "John Martinez"], createdAt: fmt(addDays(today, -20)) },
  { id: "m2", title: "Proposal Walkthrough", leadId: "l1", scheduledById: "u1", date: fmt(addDays(today, -7)), time: "14:00", duration: 90, notes: "Walk through the full platform demo and pricing.", outcome: "Very interested. Requesting final pricing approval from CFO.", minutes: "Presented all modules. Client impressed with pipeline analytics. Need CFO sign-off on budget.", attendees: ["Alex Johnson", "John Martinez", "Lisa Thompson"], createdAt: fmt(addDays(today, -14)) },
  { id: "m3", title: "Discovery Session", leadId: "l2", scheduledById: "u2", date: fmt(addDays(today, -5)), time: "11:00", duration: 60, notes: "Deep dive into infrastructure needs.", outcome: "Progressing - needs technical review", minutes: "Reviewed current tech stack. Integration requirements identified. Technical team review needed.", attendees: ["Sarah Mitchell", "Lisa Thompson"], createdAt: fmt(addDays(today, -10)) },
  { id: "m4", title: "Contract Negotiation", leadId: "l3", scheduledById: "u1", date: fmt(addDays(today, -3)), time: "15:00", duration: 120, notes: "Final terms discussion.", outcome: "Pending legal review", minutes: "Agreed on core terms. Legal team reviewing contract language. Expected to close within 2 weeks.", attendees: ["Alex Johnson", "Maria Garcia", "Robert Kim"], createdAt: fmt(addDays(today, -7)) },
  { id: "m5", title: "Intro Call", leadId: "l4", scheduledById: "u2", date: fmt(addDays(today, -2)), time: "09:00", duration: 30, notes: "First touchpoint.", outcome: "Interested - scheduling follow-up", minutes: "Brief intro. Amanda wants a full demo. Scheduled for next week.", attendees: ["Sarah Mitchell", "Amanda Foster"], createdAt: fmt(addDays(today, -5)) },
  { id: "m6", title: "Platform Demo", leadId: "l7", scheduledById: "u3", date: fmt(addDays(today, 1)), time: "13:00", duration: 90, notes: "Full product walkthrough for supply chain team.", attendees: ["David Chen", "Chris Anderson"], createdAt: fmt(addDays(today, -3)) },
  { id: "m7", title: "Executive Briefing", leadId: "l9", scheduledById: "u1", date: fmt(addDays(today, 2)), time: "10:00", duration: 60, notes: "C-suite alignment meeting.", attendees: ["Alex Johnson", "Maria Garcia", "Steven Park"], createdAt: fmt(addDays(today, -2)) },
  { id: "m8", title: "Technical Deep Dive", leadId: "l8", scheduledById: "u2", date: fmt(addDays(today, 3)), time: "14:30", duration: 90, notes: "Technical architecture review.", attendees: ["David Chen", "Patricia Lee"], createdAt: fmt(addDays(today, -1)) },
  { id: "m9", title: "Follow-up Discussion", leadId: "l10", scheduledById: "u5", date: fmt(addDays(today, 5)), time: "11:00", duration: 45, notes: "Check in on proposal review.", attendees: ["James Wilson", "Rachel Torres"], createdAt: fmt(addDays(today, 0)) },
  { id: "m10", title: "Quarterly Business Review", leadId: "l6", scheduledById: "u1", date: fmt(addDays(today, 7)), time: "09:00", duration: 120, notes: "QBR with closed won client.", outcome: "Ongoing relationship", minutes: "Reviewed ROI metrics. Client highly satisfied. Upsell opportunity identified.", attendees: ["Alex Johnson", "Jennifer Walsh"], createdAt: fmt(addDays(today, -30)) },
];

/**
 * Proposals are linked to a UserPipeline thread (pipelineId).
 * Multiple proposals can exist per pipeline thread.
 */
export const PROPOSALS: Proposal[] = [
  { id: "p1", pipelineId: "up1", leadId: "l1", ownerId: "u1", title: "Enterprise Sales Platform - Phase 1", value: 250000, stage: "Proposal Sent", probability: 70, expectedRevenue: 175000, notes: "Full platform license with 5-year term.", createdAt: fmt(addDays(today, -15)), updatedAt: fmt(addDays(today, -10)) },
  { id: "p1b", pipelineId: "up1", leadId: "l1", ownerId: "u1", title: "Enterprise Sales Platform - Phase 2 Add-on", value: 80000, stage: "Proposal Sent", probability: 55, expectedRevenue: 44000, notes: "Analytics module expansion.", createdAt: fmt(addDays(today, -8)), updatedAt: fmt(addDays(today, -5)) },
  { id: "p2", pipelineId: "up4", leadId: "l3", ownerId: "u1", title: "Automation Suite - Coca-Cola Operations", value: 420000, stage: "Negotiation", probability: 80, expectedRevenue: 336000, notes: "Custom implementation included.", createdAt: fmt(addDays(today, -25)), updatedAt: fmt(addDays(today, -3)) },
  { id: "p3", pipelineId: "up7", leadId: "l6", ownerId: "u1", title: "Digital Transformation Platform - Goldman Sachs", value: 890000, stage: "Closed Won", probability: 100, expectedRevenue: 890000, notes: "Multi-year enterprise agreement.", createdAt: fmt(addDays(today, -65)), updatedAt: fmt(addDays(today, -30)) },
  { id: "p4", pipelineId: "up8", leadId: "l7", ownerId: "u3", title: "Supply Chain Analytics - Tesla", value: 340000, stage: "Proposal Sent", probability: 65, expectedRevenue: 221000, notes: "Includes custom dashboard development.", createdAt: fmt(addDays(today, -12)), updatedAt: fmt(addDays(today, -8)) },
  { id: "p5", pipelineId: "up10", leadId: "l9", ownerId: "u1", title: "Consulting Platform - Deloitte", value: 220000, stage: "Negotiation", probability: 78, expectedRevenue: 171600, notes: "Volume discount applied.", createdAt: fmt(addDays(today, -18)), updatedAt: fmt(addDays(today, -5)) },
];
