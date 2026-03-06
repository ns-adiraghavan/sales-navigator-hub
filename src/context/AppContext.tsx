import React, { createContext, useContext, useState } from "react";
import { User, Lead, Company, Meeting, Proposal, UserPipeline } from "@/data/types";
import { CURRENT_USER, USERS, COMPANIES, LEADS, MEETINGS, PROPOSALS, USER_PIPELINES } from "@/data/mockData";

interface AppState {
  currentUser: User;
  users: User[];
  companies: Company[];
  leads: Lead[];
  meetings: Meeting[];
  proposals: Proposal[];
  pipelines: UserPipeline[];
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
  upsertPipeline: (pipeline: UserPipeline) => void;
  /** Returns the current user's pipeline for a given lead, or undefined */
  getMyPipeline: (leadId: string) => UserPipeline | undefined;
  /** Returns ALL pipelines for a lead (for management/admin) */
  getPipelinesForLead: (leadId: string) => UserPipeline[];
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

  const upsertPipeline = (pipeline: UserPipeline) => {
    setPipelines((prev) => {
      const exists = prev.find((p) => p.id === pipeline.id);
      if (exists) return prev.map((p) => (p.id === pipeline.id ? pipeline : p));
      return [...prev, pipeline];
    });
  };

  const getMyPipeline = (leadId: string): UserPipeline | undefined =>
    pipelines.find((p) => p.leadId === leadId && p.ownerId === currentUser.id);

  const getPipelinesForLead = (leadId: string): UserPipeline[] =>
    pipelines.filter((p) => p.leadId === leadId);

  return (
    <AppContext.Provider
      value={{
        currentUser, users, companies, leads, meetings, proposals, pipelines,
        setCurrentUser,
        addLead, updateLead, deleteLead,
        addMeeting, updateMeeting, deleteMeeting,
        addCompany, updateCompany,
        addUser, updateUser, deleteUser,
        addProposal, updateProposal,
        upsertPipeline, getMyPipeline, getPipelinesForLead,
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
