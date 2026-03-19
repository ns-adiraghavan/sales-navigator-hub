import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Code2, Database, Zap, GitBranch, Plug } from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────

const Pre: React.FC<{ children: string }> = ({ children }) => (
  <pre className="text-xs font-mono bg-muted/60 border border-border rounded-lg p-4 overflow-x-auto whitespace-pre leading-relaxed text-foreground/80">
    {children}
  </pre>
);

const SectionHeading: React.FC<{ icon: React.ElementType; title: string; subtitle?: string }> = ({
  icon: Icon,
  title,
  subtitle,
}) => (
  <div className="flex items-start gap-3 mb-5">
    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
      <Icon size={15} className="text-primary" />
    </div>
    <div>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const SubSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{title}</p>
    {children}
  </div>
);

// ─── schemas (static) ────────────────────────────────────────────────────────

const SCHEMAS: Record<string, string> = {
  User: JSON.stringify(
    {
      id: "user_abc123",
      name: "Alex Johnson",
      email: "alex.johnson@salesops.com",
      role: "admin | sales | management | bd",
      avatar: "AJ",
      department: "Sales",
      reportsTo: "user_xyz (BD only — links to sales user id)",
      createdAt: "2024-01-15",
    },
    null,
    2
  ),
  Company: JSON.stringify(
    {
      id: "company_abc123",
      name: "Coca-Cola",
      industry: "Retail & Logistics",
      website: "coca-cola.com",
      location: "Atlanta, GA",
      size: "500K+",
      createdAt: "2024-01-20",
    },
    null,
    2
  ),
  Lead: JSON.stringify(
    {
      id: "lead_abc123",
      prospectName: "John Martinez",
      companyId: "company_abc123  ← references Company.id",
      email: "j.martinez@coca-cola.com  ← unique identifier",
      linkedIn: "linkedin.com/in/jmartinez",
      mobile: "+1-404-555-0123",
      notes: "Interested in enterprise software solutions.",
      createdAt: "2024-03-01",
      updatedAt: "2024-03-10",
    },
    null,
    2
  ),
  Pipeline: JSON.stringify(
    {
      id: "pipeline_abc123",
      leadId: "lead_abc123   ← references Lead.id",
      ownerId: "user_abc123  ← references User.id",
      stage:
        "New Lead | Contacted | Discovery | Proposal Sent | Negotiation | Closed Won | Closed Lost",
      createdAt: "2024-03-01",
      updatedAt: "2024-03-10",
    },
    null,
    2
  ),
  Proposal: JSON.stringify(
    {
      id: "proposal_abc123",
      pipelineId: "pipeline_abc123  ← references Pipeline.id",
      leadId: "lead_abc123         ← references Lead.id",
      ownerId: "user_abc123        ← references User.id",
      title: "Enterprise Sales Platform - Phase 1",
      value: 250000,
      stage: "Proposal Sent",
      probability: 70,
      expectedRevenue: 175000,
      notes: "Full platform license with 5-year term.",
      attachmentName: "proposal_deck.pdf",
      attachmentUrl: "blob:...",
      createdAt: "2024-03-01",
      updatedAt: "2024-03-10",
    },
    null,
    2
  ),
  Meeting: JSON.stringify(
    {
      id: "meeting_abc123",
      title: "Initial Discovery Call",
      leadId: "lead_abc123         ← references Lead.id",
      scheduledById: "user_abc123  ← references User.id",
      date: "2024-03-15",
      time: "10:00",
      duration: 60,
      meetingType: "in-person | online",
      location: "HQ or https://meet.link",
      notes: "Initial call to understand requirements.",
      outcome: "Positive - moved to proposal stage",
      minutes: "Discussed current CRM pain points.",
      attendees: ["Alex Johnson", "John Martinez"],
      attachmentName: "meeting_notes.pdf",
      attachmentUrl: "blob:...",
      createdAt: "2024-03-10",
    },
    null,
    2
  ),
  Settings: JSON.stringify(
    {
      currency: "INR | USD",
      usdToInrRate: 90,
      inactivityDays: 7,
    },
    null,
    2
  ),
};

// ─── action map (static) ─────────────────────────────────────────────────────

const ACTION_MAP = [
  { action: "Create Lead", affects: "leads[]", description: "Adds a new Lead to the leads array. Enforces email uniqueness — skips if duplicate email exists. Also creates an initial UserPipeline thread for the current user." },
  { action: "Update Lead", affects: "leads[]", description: "Replaces the matching Lead record in state by id. Email is immutable after creation." },
  { action: "Delete Lead", affects: "leads[]", description: "Removes the Lead by id. Associated pipelines, proposals, and meetings remain in state (orphaned)." },
  { action: "Add Company", affects: "companies[]", description: "Appends a new Company to the companies array." },
  { action: "Update Company", affects: "companies[]", description: "Replaces the matching Company record in state by id." },
  { action: "Schedule Meeting", affects: "meetings[]", description: "Appends a new Meeting linked to a leadId and scheduledById (current user)." },
  { action: "Update Meeting", affects: "meetings[]", description: "Replaces the matching Meeting by id, preserving all other fields." },
  { action: "Delete Meeting", affects: "meetings[]", description: "Removes the Meeting by id from state." },
  { action: "Upsert Pipeline", affects: "pipelines[]", description: "If a pipeline with the same id exists, it is replaced. Otherwise appended. Used for both creation and stage changes." },
  { action: "Add Proposal", affects: "proposals[]", description: "Appends a new Proposal linked to pipelineId and leadId." },
  { action: "Update Proposal", affects: "proposals[]", description: "Replaces the matching Proposal by id. Stage on the proposal is independent of the pipeline stage." },
  { action: "Delete Proposal", affects: "proposals[]", description: "Removes the Proposal by id from state." },
  { action: "Add User", affects: "users[]", description: "Appends a new User. Available to admin only." },
  { action: "Update User", affects: "users[]", description: "Replaces the matching User by id." },
  { action: "Delete User", affects: "users[]", description: "Removes the User by id. Team links are not automatically cleaned up." },
  { action: "Upsert Team Link", affects: "teamLinks[], users[]", description: "Links a BD user to a Sales user. Also updates User.reportsTo on the BD user record." },
  { action: "Remove Team Link", affects: "teamLinks[], users[]", description: "Unlinks a BD user. Clears reportsTo on the BD user record." },
  { action: "Set Currency", affects: "settings.currency", description: "Switches the global display currency between INR and USD. All currency formatters re-render automatically." },
  { action: "Set USD-to-INR Rate", affects: "settings.usdToInrRate", description: "Updates the exchange rate used when converting pipeline values to USD display." },
  { action: "Set Inactivity Days", affects: "settings.inactivityDays", description: "Updates the threshold (in days) used by useNudges to flag stale pipelines." },
];

// ─── API mapping (static) ────────────────────────────────────────────────────

const API_MAP = [
  { action: "Fetch Leads", method: "GET", endpoint: "/leads" },
  { action: "Create Lead", method: "POST", endpoint: "/leads" },
  { action: "Update Lead", method: "PATCH", endpoint: "/leads/:id" },
  { action: "Delete Lead", method: "DELETE", endpoint: "/leads/:id" },
  { action: "Fetch Companies", method: "GET", endpoint: "/companies" },
  { action: "Create Company", method: "POST", endpoint: "/companies" },
  { action: "Update Company", method: "PATCH", endpoint: "/companies/:id" },
  { action: "Fetch Meetings", method: "GET", endpoint: "/meetings" },
  { action: "Create Meeting", method: "POST", endpoint: "/meetings" },
  { action: "Update Meeting", method: "PATCH", endpoint: "/meetings/:id" },
  { action: "Delete Meeting", method: "DELETE", endpoint: "/meetings/:id" },
  { action: "Fetch Pipelines", method: "GET", endpoint: "/pipelines" },
  { action: "Create Pipeline", method: "POST", endpoint: "/pipelines" },
  { action: "Update Pipeline Stage", method: "PATCH", endpoint: "/pipelines/:id" },
  { action: "Fetch Proposals", method: "GET", endpoint: "/proposals" },
  { action: "Create Proposal", method: "POST", endpoint: "/proposals" },
  { action: "Update Proposal", method: "PATCH", endpoint: "/proposals/:id" },
  { action: "Delete Proposal", method: "DELETE", endpoint: "/proposals/:id" },
  { action: "Fetch Users", method: "GET", endpoint: "/users" },
  { action: "Create User", method: "POST", endpoint: "/users" },
  { action: "Update User", method: "PATCH", endpoint: "/users/:id" },
  { action: "Delete User", method: "DELETE", endpoint: "/users/:id" },
  { action: "Fetch Team Links", method: "GET", endpoint: "/team-links" },
  { action: "Upsert Team Link", method: "PUT", endpoint: "/team-links/:bdId" },
  { action: "Remove Team Link", method: "DELETE", endpoint: "/team-links/:bdId" },
  { action: "Get Settings", method: "GET", endpoint: "/settings" },
  { action: "Update Settings", method: "PATCH", endpoint: "/settings" },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-blue-50 text-blue-700 border-blue-200",
  POST: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PATCH: "bg-amber-50 text-amber-700 border-amber-200",
  PUT: "bg-violet-50 text-violet-700 border-violet-200",
  DELETE: "bg-red-50 text-red-700 border-red-200",
};

// ─── page ─────────────────────────────────────────────────────────────────────

const DevReferencePage: React.FC = () => {
  const { leads, pipelines, proposals, meetings, currency, usdToInrRate, inactivityDays } = useApp();
  const [activeSchema, setActiveSchema] = useState<keyof typeof SCHEMAS>("User");

  const liveState = {
    leads,
    pipelines,
    proposals,
    meetings,
    settings: { currency, usdToInrRate, inactivityDays },
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-2">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Code2 size={18} className="text-primary" />
          <h1 className="text-lg font-bold text-foreground">Developer Reference</h1>
          <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 bg-amber-50">Internal</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Read-only documentation of the frontend data model, in-memory state, action map, derived logic, and future API mappings.
          All data is sourced live from <code className="bg-muted px-1 rounded font-mono">AppContext</code>.
        </p>
      </div>

      <Tabs defaultValue="schemas">
        <TabsList className="h-9 mb-6 flex-wrap gap-1">
          <TabsTrigger value="schemas" className="text-xs gap-1.5">
            <Database size={12} /> Data Schemas
          </TabsTrigger>
          <TabsTrigger value="state" className="text-xs gap-1.5">
            <Code2 size={12} /> State Overview
          </TabsTrigger>
          <TabsTrigger value="actions" className="text-xs gap-1.5">
            <Zap size={12} /> Action Map
          </TabsTrigger>
          <TabsTrigger value="derived" className="text-xs gap-1.5">
            <GitBranch size={12} /> Derived Logic
          </TabsTrigger>
          <TabsTrigger value="api" className="text-xs gap-1.5">
            <Plug size={12} /> API Mapping
          </TabsTrigger>
        </TabsList>

        {/* ── Section 1: Data Schemas ─────────────────────────────────────── */}
        <TabsContent value="schemas" className="space-y-4">
          <SectionHeading
            icon={Database}
            title="Data Schemas"
            subtitle="Structure of all core entities. Field annotations show relationships via IDs."
          />
          <div className="flex gap-2 flex-wrap mb-4">
            {(Object.keys(SCHEMAS) as Array<keyof typeof SCHEMAS>).map((key) => (
              <button
                key={key}
                onClick={() => setActiveSchema(key)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  activeSchema === key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {key}
              </button>
            ))}
          </div>
          <Pre>{SCHEMAS[activeSchema]}</Pre>

          <div className="mt-4 p-3 bg-muted/40 border border-border rounded-lg">
            <p className="text-xs font-semibold text-foreground mb-2">Relationship Map</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-muted-foreground font-mono">
              <span>Lead.companyId → Company.id</span>
              <span>Pipeline.leadId → Lead.id</span>
              <span>Pipeline.ownerId → User.id</span>
              <span>Proposal.pipelineId → Pipeline.id</span>
              <span>Proposal.leadId → Lead.id</span>
              <span>Proposal.ownerId → User.id</span>
              <span>Meeting.leadId → Lead.id</span>
              <span>Meeting.scheduledById → User.id</span>
              <span>User.reportsTo → User.id (BD only)</span>
              <span>TeamLink.bdId → User.id</span>
              <span>TeamLink.salesId → User.id</span>
            </div>
          </div>
        </TabsContent>

        {/* ── Section 2: State Overview ───────────────────────────────────── */}
        <TabsContent value="state" className="space-y-4">
          <SectionHeading
            icon={Code2}
            title="Live In-Memory State"
            subtitle="Current snapshot of AppContext state. Updates in real-time as data changes."
          />
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Leads", count: leads.length },
              { label: "Pipelines", count: pipelines.length },
              { label: "Proposals", count: proposals.length },
              { label: "Meetings", count: meetings.length },
            ].map(({ label, count }) => (
              <div key={label} className="bg-muted/40 border border-border rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{count}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          <SubSection title="Settings">
            <Pre>{JSON.stringify(liveState.settings, null, 2)}</Pre>
          </SubSection>

          <SubSection title="leads[]">
            <ScrollArea className="h-64">
              <Pre>{JSON.stringify(leads, null, 2)}</Pre>
            </ScrollArea>
          </SubSection>

          <SubSection title="pipelines[]">
            <ScrollArea className="h-64">
              <Pre>{JSON.stringify(pipelines, null, 2)}</Pre>
            </ScrollArea>
          </SubSection>

          <SubSection title="proposals[]">
            <ScrollArea className="h-64">
              <Pre>{JSON.stringify(proposals, null, 2)}</Pre>
            </ScrollArea>
          </SubSection>

          <SubSection title="meetings[]">
            <ScrollArea className="h-64">
              <Pre>{JSON.stringify(meetings, null, 2)}</Pre>
            </ScrollArea>
          </SubSection>
        </TabsContent>

        {/* ── Section 3: Action Map ───────────────────────────────────────── */}
        <TabsContent value="actions" className="space-y-4">
          <SectionHeading
            icon={Zap}
            title="Action Map"
            subtitle="All key mutations exposed by AppContext and what state they affect."
          />
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-3 py-2 font-semibold text-foreground w-44">Action</th>
                  <th className="text-left px-3 py-2 font-semibold text-foreground w-44">Affects State</th>
                  <th className="text-left px-3 py-2 font-semibold text-foreground">Description</th>
                </tr>
              </thead>
              <tbody>
                {ACTION_MAP.map((row, i) => (
                  <tr key={row.action} className={`border-b border-border/60 ${i % 2 === 0 ? "bg-background" : "bg-muted/20"}`}>
                    <td className="px-3 py-2 font-mono text-primary font-medium">{row.action}</td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">{row.affects}</td>
                    <td className="px-3 py-2 text-muted-foreground leading-relaxed">{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* ── Section 4: Derived Logic ────────────────────────────────────── */}
        <TabsContent value="derived" className="space-y-6">
          <SectionHeading
            icon={GitBranch}
            title="Derived Logic"
            subtitle="Computed values and business rules derived from raw state."
          />

          <SubSection title="Pipeline Inactivity Nudges (useNudges)">
            <Pre>{`// src/hooks/useNudges.ts
// For each active pipeline owned by the current user:
//   1. Find the most recent meeting for that lead
//   2. If no meeting exists, use pipeline.createdAt as the baseline
//   3. If daysSince(baseline) >= inactivityDays → generate a nudge

const daysSince = (dateStr: string): number =>
  Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);

// Setting: inactivityDays (default 7, configurable by Admin)
// Nudge object: { leadId, leadName, pipelineId, daysSince, stage }`}</Pre>
          </SubSection>

          <SubSection title="Pipeline Display Value (getPipelineDisplayValue)">
            <Pre>{`// src/lib/constants.ts
// Determines what monetary value to show for a pipeline thread.

if (pipeline.stage === "Closed Won") {
  // Deal Value: sum ONLY proposals whose own stage is "Closed Won"
  return proposals
    .filter(p => p.pipelineId === pipeline.id && p.stage === "Closed Won")
    .reduce((sum, p) => sum + p.value, 0);
}
if (pipeline.stage === "Closed Lost") {
  // Deal Value: sum ONLY proposals whose own stage is "Closed Lost"
  return proposals
    .filter(p => p.pipelineId === pipeline.id && p.stage === "Closed Lost")
    .reduce((sum, p) => sum + p.value, 0);
}
// Active Pipeline Value: sum ALL proposals in the thread
return proposals
  .filter(p => p.pipelineId === pipeline.id)
  .reduce((sum, p) => sum + p.value, 0);

// Rationale: during negotiation multiple proposals are in-flight,
// so total pipeline value = sum of all proposals. Once closed,
// only the proposals with the matching outcome count as deal value.`}</Pre>
          </SubSection>

          <SubSection title="Visibility Filters (getVisibleLeadIds)">
            <Pre>{`// src/context/AppContext.tsx
// Returns the Set<leadId> a given userId can see.

if (role === "admin" || role === "management") {
  return new Set(leads.map(l => l.id));  // all leads
}

if (role === "sales") {
  // Own pipeline leads
  const ownLeadIds = pipelines
    .filter(p => p.ownerId === userId)
    .map(p => p.leadId);

  // Leads engaged by their BD reports
  const bdIds = teamLinks
    .filter(l => l.salesId === userId)
    .map(l => l.bdId);
  const bdLeadIds = meetings
    .filter(m => bdIds.includes(m.scheduledById))
    .map(m => m.leadId);

  return new Set([...ownLeadIds, ...bdLeadIds]);
}

if (role === "bd") {
  // Only leads the BD personally scheduled a meeting for
  return new Set(
    meetings.filter(m => m.scheduledById === userId).map(m => m.leadId)
  );
}`}</Pre>
          </SubSection>

          <SubSection title="Currency Formatting (formatCurrency)">
            <Pre>{`// src/lib/constants.ts
// Values are always stored in INR internally.
// USD display = value / usdToInrRate

if (currency === "USD") {
  const usd = value / usdToInrRate;
  if (usd >= 1_000_000) return \`$\${(usd / 1_000_000).toFixed(1)}M\`;
  if (usd >= 1_000)     return \`$\${(usd / 1_000).toFixed(0)}K\`;
  return \`$\${usd.toFixed(0)}\`;
}
// INR — Indian number system (Lakhs / Crores)
if (value >= 1_00_00_000) return \`₹\${(value / 1_00_00_000).toFixed(1)}Cr\`;
if (value >= 1_00_000)    return \`₹\${(value / 1_00_000).toFixed(1)}L\`;
if (value >= 1_000)       return \`₹\${(value / 1_000).toFixed(0)}K\`;
return \`₹\${value}\`;`}</Pre>
          </SubSection>

          <SubSection title="ID Generation (generateId)">
            <Pre>{`// src/lib/constants.ts
// Generates a stable, prefixed string ID for each entity type.
// Format: "<prefix>_<7-char random alphanumeric>"

generateId("lead")     → "lead_x4k9z2a"
generateId("pipeline") → "pipeline_3mfqw1r"
generateId("proposal") → "proposal_9bnvt8c"
generateId("meeting")  → "meeting_k2pxd5m"
generateId("company")  → "company_7jzrq4n"
generateId("user")     → "user_5cvwy8s"

// Email uniqueness: addLead() in AppContext skips insertion
// if a lead with the same email (case-insensitive) already exists.`}</Pre>
          </SubSection>
        </TabsContent>

        {/* ── Section 5: API Mapping ──────────────────────────────────────── */}
        <TabsContent value="api" className="space-y-4">
          <SectionHeading
            icon={Plug}
            title="Future API Integration"
            subtitle="Placeholder REST endpoint mapping for each frontend action. Static reference only — no backend is wired yet."
          />
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700 mb-4">
            ⚠ This is a static placeholder. All data currently lives in React state via <code className="font-mono">AppContext</code>.
            Connecting to a real backend requires replacing context mutations with fetch/mutation calls to these endpoints.
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-3 py-2 font-semibold text-foreground">Action</th>
                  <th className="text-left px-3 py-2 font-semibold text-foreground w-20">Method</th>
                  <th className="text-left px-3 py-2 font-semibold text-foreground">Endpoint</th>
                </tr>
              </thead>
              <tbody>
                {API_MAP.map((row, i) => (
                  <tr key={row.action} className={`border-b border-border/60 ${i % 2 === 0 ? "bg-background" : "bg-muted/20"}`}>
                    <td className="px-3 py-2 text-foreground/80">{row.action}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-block border rounded px-1.5 py-0.5 text-[10px] font-semibold font-mono ${METHOD_COLORS[row.method] ?? ""}`}>
                        {row.method}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">{row.endpoint}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DevReferencePage;
