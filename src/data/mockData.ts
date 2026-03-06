import { User, Company, Lead, Meeting, Proposal } from "./types";

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
    role: "user",
    avatar: "SM",
    department: "Sales",
    createdAt: "2024-02-01",
  },
  {
    id: "u3",
    name: "David Chen",
    email: "david.chen@salesops.com",
    role: "user",
    avatar: "DC",
    department: "Sales",
    createdAt: "2024-02-15",
  },
  {
    id: "u4",
    name: "Maria Garcia",
    email: "maria.garcia@salesops.com",
    role: "admin",
    avatar: "MG",
    department: "Management",
    createdAt: "2024-01-10",
  },
  {
    id: "u5",
    name: "James Wilson",
    email: "james.wilson@salesops.com",
    role: "user",
    avatar: "JW",
    department: "Sales",
    createdAt: "2024-03-01",
  },
];

export const COMPANIES: Company[] = [
  { id: "c1", name: "Coca-Cola", industry: "Food & Beverage", website: "coca-cola.com", location: "Atlanta, GA", size: "500K+", createdAt: "2024-01-20" },
  { id: "c2", name: "Salesforce", industry: "Technology", website: "salesforce.com", location: "San Francisco, CA", size: "70K+", createdAt: "2024-01-22" },
  { id: "c3", name: "Goldman Sachs", industry: "Finance", website: "goldmansachs.com", location: "New York, NY", size: "45K+", createdAt: "2024-01-25" },
  { id: "c4", name: "Tesla", industry: "Automotive", website: "tesla.com", location: "Austin, TX", size: "127K+", createdAt: "2024-02-01" },
  { id: "c5", name: "Deloitte", industry: "Consulting", website: "deloitte.com", location: "New York, NY", size: "415K+", createdAt: "2024-02-10" },
  { id: "c6", name: "Pfizer", industry: "Pharmaceuticals", website: "pfizer.com", location: "New York, NY", size: "83K+", createdAt: "2024-02-15" },
  { id: "c7", name: "Amazon Web Services", industry: "Technology", website: "aws.amazon.com", location: "Seattle, WA", size: "1.5M+", createdAt: "2024-02-20" },
  { id: "c8", name: "Unilever", industry: "Consumer Goods", website: "unilever.com", location: "London, UK", size: "149K+", createdAt: "2024-03-01" },
];

export const LEADS: Lead[] = [
  { id: "l1", prospectName: "John Martinez", companyId: "c1", email: "j.martinez@coca-cola.com", linkedIn: "linkedin.com/in/jmartinez", mobile: "+1-404-555-0123", notes: "Interested in enterprise software solutions.", ownerId: "u1", stage: "Proposal Sent", proposalValue: 250000, expectedRevenue: 225000, probability: 70, createdAt: "2024-03-01", updatedAt: "2024-03-10" },
  { id: "l2", prospectName: "Lisa Thompson", companyId: "c1", email: "l.thompson@coca-cola.com", mobile: "+1-404-555-0124", notes: "Director of IT infrastructure.", ownerId: "u2", stage: "Discovery", proposalValue: 80000, expectedRevenue: 64000, probability: 40, createdAt: "2024-03-05", updatedAt: "2024-03-12" },
  { id: "l3", prospectName: "Robert Kim", companyId: "c1", email: "r.kim@coca-cola.com", linkedIn: "linkedin.com/in/rkim", notes: "VP of Operations, interested in automation.", ownerId: "u1", stage: "Negotiation", proposalValue: 420000, expectedRevenue: 378000, probability: 80, createdAt: "2024-02-20", updatedAt: "2024-03-15" },
  { id: "l4", prospectName: "Amanda Foster", companyId: "c2", email: "a.foster@salesforce.com", linkedIn: "linkedin.com/in/afoster", mobile: "+1-415-555-0201", notes: "Exploring third-party integrations.", ownerId: "u2", stage: "Contacted", proposalValue: 130000, expectedRevenue: 91000, probability: 35, createdAt: "2024-03-08", updatedAt: "2024-03-08" },
  { id: "l5", prospectName: "Michael Brown", companyId: "c2", email: "m.brown@salesforce.com", mobile: "+1-415-555-0202", notes: "Product team lead.", ownerId: "u3", stage: "New Lead", proposalValue: 0, expectedRevenue: 0, probability: 10, createdAt: "2024-03-12", updatedAt: "2024-03-12" },
  { id: "l6", prospectName: "Jennifer Walsh", companyId: "c3", email: "j.walsh@gs.com", linkedIn: "linkedin.com/in/jwalsh", mobile: "+1-212-555-0301", notes: "Head of Digital Transformation.", ownerId: "u1", stage: "Closed Won", proposalValue: 890000, expectedRevenue: 890000, probability: 100, createdAt: "2024-01-15", updatedAt: "2024-03-01" },
  { id: "l7", prospectName: "Chris Anderson", companyId: "c4", email: "c.anderson@tesla.com", linkedIn: "linkedin.com/in/canderson", notes: "Senior Manager, Supply Chain.", ownerId: "u3", stage: "Proposal Sent", proposalValue: 340000, expectedRevenue: 272000, probability: 65, createdAt: "2024-02-28", updatedAt: "2024-03-11" },
  { id: "l8", prospectName: "Patricia Lee", companyId: "c5", email: "p.lee@deloitte.com", mobile: "+1-212-555-0501", notes: "Senior Partner, wants consulting platform.", ownerId: "u2", stage: "Discovery", proposalValue: 175000, expectedRevenue: 122500, probability: 45, createdAt: "2024-03-03", updatedAt: "2024-03-09" },
  { id: "l9", prospectName: "Steven Park", companyId: "c5", email: "s.park@deloitte.com", linkedIn: "linkedin.com/in/spark", mobile: "+1-212-555-0502", notes: "Principal, Technology Practice.", ownerId: "u1", stage: "Negotiation", proposalValue: 220000, expectedRevenue: 198000, probability: 78, createdAt: "2024-02-25", updatedAt: "2024-03-14" },
  { id: "l10", prospectName: "Rachel Torres", companyId: "c6", email: "r.torres@pfizer.com", mobile: "+1-212-555-0601", notes: "VP of IT, interested in data analytics.", ownerId: "u5", stage: "Contacted", proposalValue: 560000, expectedRevenue: 280000, probability: 30, createdAt: "2024-03-10", updatedAt: "2024-03-10" },
  { id: "l11", prospectName: "Daniel Wright", companyId: "c7", email: "d.wright@aws.amazon.com", linkedIn: "linkedin.com/in/dwright", mobile: "+1-206-555-0701", notes: "Technical Account Manager interested in collaboration tools.", ownerId: "u3", stage: "New Lead", probability: 15, createdAt: "2024-03-14", updatedAt: "2024-03-14" },
  { id: "l12", prospectName: "Emma Clark", companyId: "c8", email: "e.clark@unilever.com", linkedIn: "linkedin.com/in/eclark", notes: "Global Category Manager.", ownerId: "u5", stage: "Closed Lost", proposalValue: 95000, expectedRevenue: 0, probability: 0, createdAt: "2024-02-01", updatedAt: "2024-03-05" },
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
  { id: "m1", title: "Initial Discovery Call", leadId: "l1", date: fmt(addDays(today, -14)), time: "10:00", duration: 60, notes: "Initial call to understand requirements.", outcome: "Positive - moved to proposal stage", minutes: "Discussed current CRM pain points. Client needs better pipeline visibility. Follow up with proposal by EOW.", attendees: ["Alex Johnson", "John Martinez"], createdAt: fmt(addDays(today, -20)) },
  { id: "m2", title: "Proposal Walkthrough", leadId: "l1", date: fmt(addDays(today, -7)), time: "14:00", duration: 90, notes: "Walk through the full platform demo and pricing.", outcome: "Very interested. Requesting final pricing approval from CFO.", minutes: "Presented all modules. Client impressed with pipeline analytics. Need CFO sign-off on budget.", attendees: ["Alex Johnson", "John Martinez", "Lisa Thompson"], createdAt: fmt(addDays(today, -14)) },
  { id: "m3", title: "Discovery Session", leadId: "l2", date: fmt(addDays(today, -5)), time: "11:00", duration: 60, notes: "Deep dive into infrastructure needs.", outcome: "Progressing - needs technical review", minutes: "Reviewed current tech stack. Integration requirements identified. Technical team review needed.", attendees: ["Sarah Mitchell", "Lisa Thompson"], createdAt: fmt(addDays(today, -10)) },
  { id: "m4", title: "Contract Negotiation", leadId: "l3", date: fmt(addDays(today, -3)), time: "15:00", duration: 120, notes: "Final terms discussion.", outcome: "Pending legal review", minutes: "Agreed on core terms. Legal team reviewing contract language. Expected to close within 2 weeks.", attendees: ["Alex Johnson", "Maria Garcia", "Robert Kim"], createdAt: fmt(addDays(today, -7)) },
  { id: "m5", title: "Intro Call", leadId: "l4", date: fmt(addDays(today, -2)), time: "09:00", duration: 30, notes: "First touchpoint.", outcome: "Interested - scheduling follow-up", minutes: "Brief intro. Amanda wants a full demo. Scheduled for next week.", attendees: ["Sarah Mitchell", "Amanda Foster"], createdAt: fmt(addDays(today, -5)) },
  { id: "m6", title: "Platform Demo", leadId: "l7", date: fmt(addDays(today, 1)), time: "13:00", duration: 90, notes: "Full product walkthrough for supply chain team.", attendees: ["David Chen", "Chris Anderson"], createdAt: fmt(addDays(today, -3)) },
  { id: "m7", title: "Executive Briefing", leadId: "l9", date: fmt(addDays(today, 2)), time: "10:00", duration: 60, notes: "C-suite alignment meeting.", attendees: ["Alex Johnson", "Maria Garcia", "Steven Park"], createdAt: fmt(addDays(today, -2)) },
  { id: "m8", title: "Technical Deep Dive", leadId: "l8", date: fmt(addDays(today, 3)), time: "14:30", duration: 90, notes: "Technical architecture review.", attendees: ["David Chen", "Patricia Lee"], createdAt: fmt(addDays(today, -1)) },
  { id: "m9", title: "Follow-up Discussion", leadId: "l10", date: fmt(addDays(today, 5)), time: "11:00", duration: 45, notes: "Check in on proposal review.", attendees: ["James Wilson", "Rachel Torres"], createdAt: fmt(addDays(today, 0)) },
  { id: "m10", title: "Quarterly Business Review", leadId: "l6", date: fmt(addDays(today, 7)), time: "09:00", duration: 120, notes: "QBR with closed won client.", outcome: "Ongoing relationship", minutes: "Reviewed ROI metrics. Client highly satisfied. Upsell opportunity identified.", attendees: ["Alex Johnson", "Jennifer Walsh"], createdAt: fmt(addDays(today, -30)) },
];

export const PROPOSALS: Proposal[] = [
  { id: "p1", leadId: "l1", title: "Enterprise Sales Platform - Coca-Cola", value: 250000, stage: "Proposal Sent", probability: 70, expectedRevenue: 175000, sentDate: fmt(addDays(today, -10)), notes: "Full platform license with 5-year term.", createdAt: fmt(addDays(today, -15)), updatedAt: fmt(addDays(today, -10)) },
  { id: "p2", leadId: "l3", title: "Automation Suite - Coca-Cola Operations", value: 420000, stage: "Negotiation", probability: 80, expectedRevenue: 336000, sentDate: fmt(addDays(today, -20)), notes: "Custom implementation included.", createdAt: fmt(addDays(today, -25)), updatedAt: fmt(addDays(today, -3)) },
  { id: "p3", leadId: "l6", title: "Digital Transformation Platform - Goldman Sachs", value: 890000, stage: "Closed Won", probability: 100, expectedRevenue: 890000, sentDate: fmt(addDays(today, -60)), closedDate: fmt(addDays(today, -30)), notes: "Multi-year enterprise agreement.", createdAt: fmt(addDays(today, -65)), updatedAt: fmt(addDays(today, -30)) },
  { id: "p4", leadId: "l7", title: "Supply Chain Analytics - Tesla", value: 340000, stage: "Proposal Sent", probability: 65, expectedRevenue: 221000, sentDate: fmt(addDays(today, -8)), notes: "Includes custom dashboard development.", createdAt: fmt(addDays(today, -12)), updatedAt: fmt(addDays(today, -8)) },
  { id: "p5", leadId: "l9", title: "Consulting Platform - Deloitte", value: 220000, stage: "Negotiation", probability: 78, expectedRevenue: 171600, sentDate: fmt(addDays(today, -15)), notes: "Volume discount applied.", createdAt: fmt(addDays(today, -18)), updatedAt: fmt(addDays(today, -5)) },
];
