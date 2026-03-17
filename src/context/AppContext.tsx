import React, { createContext, useContext, useState } from "react";
import { User, Lead, Company, Meeting, Proposal, UserPipeline, TeamLink } from "@/data/types";
import { CURRENT_USER, USERS, COMPANIES, LEADS, MEETINGS, PROPOSALS, USER_PIPELINES, TEAM_LINKS } from "@/data/mockData";

export type CurrencyCode = "INR" | "USD";

interface AppState {
  currentUser: User;
  users: User[];
  companies: Company[];
  leads: Lead[];
  meetings: Meeting[];
  proposals: Proposal[];
  pipelines: UserPipeline[];
  teamLinks: TeamLink[];
  /** Active display currency */
  currency: CurrencyCode;
  /** Exchange rate: 1 USD = N INR (admin-configurable) */
  usdToInrRate: number;
  setCurrency: (c: CurrencyCode) => void;
  setUsdToInrRate: (rate: number) => void;
  setCurrentUser: (u: User) => void;
  addLead: (lead: Lead) => void;
  updateLead: (lead: Lead) => void;
  deleteLead: (id: string) => void;
  addMeeting: (meeting: Meeting) => void;
  updateMeeting: (meeting: Meeting) => void;
  deleteMeeting: (id: string) => void;
  addCompany: (company: Company) => void;
  updateCompany: (company: Company) => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  updateProposal: (proposal: Proposal) => void;
  addProposal: (proposal: Proposal) => void;
  deleteProposal: (id: string) => void;
  upsertPipeline: (pipeline: UserPipeline) => void;
  upsertTeamLink: (link: TeamLink) => void;
  removeTeamLink: (bdId: string) => void;
  /** Returns the current user's pipeline for a given lead, or undefined */
  getMyPipeline: (leadId: string) => UserPipeline | undefined;
  /** Returns ALL pipelines for a lead (for management/admin) */
  getPipelinesForLead: (leadId: string) => UserPipeline[];
  /** Returns proposals for a given pipeline thread */
  getProposalsForPipeline: (pipelineId: string) => Proposal[];
  /**
   * Returns the set of lead IDs visible to the given user based on their role:
   *  - admin/management: all leads
   *  - sales: own pipelines + pipelines owned by their BDs
   *  - bd: leads they personally entered (scheduledById on meetings / pipeline ownerId)
   */
  getVisibleLeadIds: (userId: string) => Set<string>;
  /** Whether the given user can access pipeline views */
  canViewPipeline: (userId: string) => boolean;
  /** BD users that report to a given sales user */
  getBDsForSales: (salesId: string) => User[];
}

const AppContext = createContext<AppState | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  const [users, setUsers] = useState<User[]>(USERS);
  const [companies, setCompanies] = useState<Company[]>(COMPANIES);
  const [leads, setLeads] = useState<Lead[]>(LEADS);
  const [meetings, setMeetings] = useState<Meeting[]>(MEETINGS);
  const [proposals, setProposals] = useState<Proposal[]>(PROPOSALS);
  const [pipelines, setPipelines] = useState<UserPipeline[]>(USER_PIPELINES);
  const [teamLinks, setTeamLinks] = useState<TeamLink[]>(TEAM_LINKS);

  const addLead = (lead: Lead) => setLeads((prev) => [...prev, lead]);
  const updateLead = (lead: Lead) =>
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? lead : l)));
  const deleteLead = (id: string) => setLeads((prev) => prev.filter((l) => l.id !== id));

  const addMeeting = (meeting: Meeting) => setMeetings((prev) => [...prev, meeting]);
  const updateMeeting = (meeting: Meeting) =>
    setMeetings((prev) => prev.map((m) => (m.id === meeting.id ? meeting : m)));
  const deleteMeeting = (id: string) => setMeetings((prev) => prev.filter((m) => m.id !== id));

  const addCompany = (company: Company) => setCompanies((prev) => [...prev, company]);
  const updateCompany = (company: Company) =>
    setCompanies((prev) => prev.map((c) => (c.id === company.id ? company : c)));

  const addUser = (user: User) => setUsers((prev) => [...prev, user]);
  const updateUser = (user: User) =>
    setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
  const deleteUser = (id: string) => setUsers((prev) => prev.filter((u) => u.id !== id));

  const addProposal = (proposal: Proposal) => setProposals((prev) => [...prev, proposal]);
  const updateProposal = (proposal: Proposal) =>
    setProposals((prev) => prev.map((p) => (p.id === proposal.id ? proposal : p)));
  const deleteProposal = (id: string) => setProposals((prev) => prev.filter((p) => p.id !== id));

  const upsertPipeline = (pipeline: UserPipeline) => {
    setPipelines((prev) => {
      const exists = prev.find((p) => p.id === pipeline.id);
      if (exists) return prev.map((p) => (p.id === pipeline.id ? pipeline : p));
      return [...prev, pipeline];
    });
  };

  const upsertTeamLink = (link: TeamLink) => {
    setTeamLinks((prev) => {
      const exists = prev.find((l) => l.bdId === link.bdId);
      if (exists) return prev.map((l) => (l.bdId === link.bdId ? link : l));
      return [...prev, link];
    });
    // Also update the reportsTo on the BD user
    setUsers((prev) =>
      prev.map((u) => (u.id === link.bdId ? { ...u, reportsTo: link.salesId } : u))
    );
  };

  const removeTeamLink = (bdId: string) => {
    setTeamLinks((prev) => prev.filter((l) => l.bdId !== bdId));
    setUsers((prev) =>
      prev.map((u) => (u.id === bdId ? { ...u, reportsTo: undefined } : u))
    );
  };

  const getMyPipeline = (leadId: string): UserPipeline | undefined =>
    pipelines.find((p) => p.leadId === leadId && p.ownerId === currentUser.id);

  const getPipelinesForLead = (leadId: string): UserPipeline[] =>
    pipelines.filter((p) => p.leadId === leadId);

  const getProposalsForPipeline = (pipelineId: string): Proposal[] =>
    proposals.filter((p) => p.pipelineId === pipelineId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const getBDsForSales = (salesId: string): User[] => {
    const bdIds = new Set(teamLinks.filter((l) => l.salesId === salesId).map((l) => l.bdId));
    return users.filter((u) => bdIds.has(u.id));
  };

  const canViewPipeline = (userId: string): boolean => {
    const user = users.find((u) => u.id === userId);
    if (!user) return false;
    return user.role !== "bd";
  };

  const getVisibleLeadIds = (userId: string): Set<string> => {
    const user = users.find((u) => u.id === userId);
    if (!user) return new Set();

    // admin & management see everything
    if (user.role === "admin" || user.role === "management") {
      return new Set(leads.map((l) => l.id));
    }

    // sales: own pipeline leads + leads entered by their BDs
    if (user.role === "sales") {
      const ownLeadIds = new Set(pipelines.filter((p) => p.ownerId === userId).map((p) => p.leadId));
      const bdIds = new Set(teamLinks.filter((l) => l.salesId === userId).map((l) => l.bdId));
      const bdLeadIds = new Set(
        meetings
          .filter((m) => bdIds.has(m.scheduledById))
          .map((m) => m.leadId)
      );
      return new Set([...ownLeadIds, ...bdLeadIds]);
    }

    // bd: leads they personally created meetings for
    if (user.role === "bd") {
      return new Set(meetings.filter((m) => m.scheduledById === userId).map((m) => m.leadId));
    }

    return new Set();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser, users, companies, leads, meetings, proposals, pipelines, teamLinks,
        setCurrentUser,
        addLead, updateLead, deleteLead,
        addMeeting, updateMeeting, deleteMeeting,
        addCompany, updateCompany,
        addUser, updateUser, deleteUser,
        addProposal, updateProposal, deleteProposal,
        upsertPipeline, upsertTeamLink, removeTeamLink,
        getMyPipeline, getPipelinesForLead, getProposalsForPipeline,
        getVisibleLeadIds, canViewPipeline, getBDsForSales,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
