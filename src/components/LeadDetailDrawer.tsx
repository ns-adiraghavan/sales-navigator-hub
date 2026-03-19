import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PipelineStage, Proposal } from "@/data/types";
import { PIPELINE_STAGES, STAGE_COLORS, formatCurrency, generateId } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { X, Mail, Phone, Linkedin, Clock, Plus, Building2, Target, Pencil, User, AlertCircle, FileText, Upload, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { MeetingFormModal } from "@/pages/MeetingsPage";
import { Meeting } from "@/data/types";

interface LeadDetailDrawerProps {
  leadId: string;
  onClose: () => void;
  defaultTab?: "overview" | "meetings" | "pipeline";
}

const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({ leadId, onClose, defaultTab = "overview" }) => {
  const {
    leads, companies, users, meetings, currentUser,
    addMeeting, updateMeeting,
    getMyPipeline, getPipelinesForLead, upsertPipeline,
    getProposalsForPipeline, addProposal, updateProposal, deleteProposal,
    currency, usdToInrRate,
  } = useApp();
  const fmt = (v?: number) => formatCurrency(v, currency, usdToInrRate);

  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [editMeeting, setEditMeeting] = useState<Meeting | null>(null);
  const [showAddProposal, setShowAddProposal] = useState(false);
  const [expandedProposalId, setExpandedProposalId] = useState<string | null>(null);

  const lead = leads.find((l) => l.id === leadId);
  if (!lead) return null;

  const company = companies.find((c) => c.id === lead.companyId);
  const leadMeetings = meetings
    .filter((m) => m.leadId === leadId)
    .sort((a, b) => b.date.localeCompare(a.date));

  const isElevated = currentUser.role === "admin" || currentUser.role === "management";
  const isBD = currentUser.role === "bd";
  const myPipeline = getMyPipeline(leadId);
  const allPipelines = isElevated ? getPipelinesForLead(leadId) : [];
  const myProposals = myPipeline ? getProposalsForPipeline(myPipeline.id) : [];

  const handlePipelineStageChange = (stage: PipelineStage) => {
    if (!myPipeline) {
      upsertPipeline({
        id: generateId("pipeline"),
        leadId,
        ownerId: currentUser.id,
        stage,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      });
    } else {
      upsertPipeline({ ...myPipeline, stage, updatedAt: new Date().toISOString().split("T")[0] });
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-card shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {lead.prospectName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-bold text-foreground">{lead.prospectName}</h2>
              <p className="text-sm text-muted-foreground">{company?.name} · {company?.industry}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X size={16} /></Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue={defaultTab} className="h-full">
            <TabsList className="w-full rounded-none border-b border-border h-10 bg-transparent">
              <TabsTrigger value="overview" className="flex-1 rounded-none text-xs">Overview</TabsTrigger>
              <TabsTrigger value="meetings" className="flex-1 rounded-none text-xs">
                Meetings ({leadMeetings.length})
              </TabsTrigger>
              {!isBD && (
                <TabsTrigger value="pipeline" className="flex-1 rounded-none text-xs">Pipeline</TabsTrigger>
              )}
            </TabsList>

            {/* ── Overview Tab ── */}
            <TabsContent value="overview" className="p-6 space-y-5 mt-0">
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contact Information</h3>
                <div className="space-y-2">
                  <InfoRow icon={Mail} label="Email" value={lead.email} href={`mailto:${lead.email}`} />
                  {lead.mobile && <InfoRow icon={Phone} label="Mobile" value={lead.mobile} href={`tel:${lead.mobile}`} />}
                  {lead.linkedIn && <InfoRow icon={Linkedin} label="LinkedIn" value={lead.linkedIn} href={`https://${lead.linkedIn}`} />}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Company</h3>
                <div className="space-y-2">
                  <InfoRow icon={Building2} label="Company" value={company?.name || "—"} />
                  <InfoRow icon={Target} label="Industry" value={company?.industry || "—"} />
                  <InfoRow icon={Building2} label="Size" value={company?.size || "—"} />
                </div>
              </div>

              {/* Who is engaging this lead */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Engaged By</h3>
                {getPipelinesForLead(leadId).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pipeline threads yet.</p>
                ) : (
                  <div className="space-y-2">
                    {getPipelinesForLead(leadId).map((p) => {
                      const owner = users.find((u) => u.id === p.ownerId);
                      const isMe = p.ownerId === currentUser.id;
                      return (
                        <div key={p.id} className="flex items-center gap-3">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className={cn("text-xs", isMe ? "bg-primary text-white" : "bg-secondary text-secondary-foreground")}>
                              {owner?.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{owner?.name}{isMe && " (You)"}</span>
                          <Badge className={`ml-auto text-xs border ${STAGE_COLORS[p.stage]}`} variant="outline">{p.stage}</Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {lead.notes && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notes</h3>
                  <p className="text-sm text-foreground bg-muted/40 rounded-lg p-3">{lead.notes}</p>
                </div>
              )}
            </TabsContent>

            {/* ── Meetings Tab ── */}
            <TabsContent value="meetings" className="p-6 mt-0 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Meeting History</h3>
                <Button size="sm" className="gap-1.5" onClick={() => { setEditMeeting(null); setShowMeetingModal(true); }}>
                  <Plus size={13} />Schedule
                </Button>
              </div>
              {leadMeetings.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">No meetings yet</div>
              ) : (
                leadMeetings.map((meeting) => {
                  const scheduler = users.find((u) => u.id === meeting.scheduledById);
                  const canEditMeeting = currentUser.role === "admin" || meeting.scheduledById === currentUser.id;
                  return (
                    <div key={meeting.id} className="border border-border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm">{meeting.title}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock size={11} />{meeting.date} at {meeting.time}
                            {meeting.duration && ` · ${meeting.duration}min`}
                          </p>
                          {scheduler && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <User size={11} />Scheduled by {scheduler.name}
                            </p>
                          )}
                        </div>
                        {canEditMeeting && (
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditMeeting(meeting); setShowMeetingModal(true); }}>
                            <Pencil size={11} />
                          </Button>
                        )}
                      </div>
                      {meeting.outcome && (
                        <Badge variant="outline" className="text-xs border-primary/30 bg-primary/5 text-primary">{meeting.outcome}</Badge>
                      )}
                      {meeting.notes && <p className="text-xs text-muted-foreground">{meeting.notes}</p>}
                      {meeting.minutes && (
                        <div className="bg-muted/40 rounded p-2 mt-1">
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Minutes</p>
                          <p className="text-xs text-foreground">{meeting.minutes}</p>
                        </div>
                      )}

                      {/* PDF / doc attachment */}
                      <div className="pt-1">
                        {meeting.attachmentName ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={meeting.attachmentUrl}
                              download={meeting.attachmentName}
                              className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FileText size={12} />{meeting.attachmentName}
                            </a>
                            {canEditMeeting && (
                              <button
                                className="text-xs text-muted-foreground hover:text-destructive transition-colors ml-auto"
                                onClick={() => updateMeeting({ ...meeting, attachmentName: undefined, attachmentUrl: undefined })}
                              >
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                        ) : (
                          canEditMeeting && (
                            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors">
                              <Upload size={12} />
                              <span>Attach meeting notes (PDF)</span>
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  const url = URL.createObjectURL(file);
                                  updateMeeting({ ...meeting, attachmentName: file.name, attachmentUrl: url });
                                }}
                              />
                            </label>
                          )
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </TabsContent>

            {/* ── Pipeline Tab ── */}
            <TabsContent value="pipeline" className="p-6 mt-0 space-y-6">
              {/* My Pipeline thread */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">My Pipeline</h3>

                {!myPipeline ? (
                  <div className="border border-dashed border-border rounded-lg p-4 text-center space-y-3">
                    <AlertCircle size={20} className="mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">You don't have a pipeline thread for this lead yet.</p>
                    <Button size="sm" onClick={() => handlePipelineStageChange("New Lead")}>Start My Pipeline</Button>
                  </div>
                ) : (
                  <>
                    {/* Stage selector */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Stage</p>
                      <div className="space-y-1">
                        {PIPELINE_STAGES.map((s, i) => {
                          const stageIndex = PIPELINE_STAGES.indexOf(myPipeline.stage);
                          const isActive = s === myPipeline.stage;
                          const isPast = i < stageIndex && myPipeline.stage !== "Closed Lost";
                          return (
                            <div
                              key={s}
                              className={cn(
                                "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors text-sm",
                                isActive ? "bg-primary/10 text-primary font-semibold" : isPast ? "text-muted-foreground" : "text-muted-foreground/50 hover:bg-muted/30"
                              )}
                              onClick={() => handlePipelineStageChange(s)}
                            >
                              <div className={cn("w-2 h-2 rounded-full shrink-0", isActive ? "bg-primary" : isPast ? "bg-muted-foreground" : "bg-muted-foreground/30")} />
                              {s}
                              {isActive && <Badge className="ml-auto text-xs h-4 px-1.5 bg-primary/20 text-primary border-0">Current</Badge>}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Proposals section */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Proposals</p>
                        <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs" onClick={() => setShowAddProposal(true)}>
                          <Plus size={12} />Add Proposal
                        </Button>
                      </div>

                      {myProposals.length === 0 ? (
                        <div className="border border-dashed border-border rounded-lg py-6 text-center">
                          <FileText size={20} className="mx-auto text-muted-foreground mb-2" />
                          <p className="text-xs text-muted-foreground">No proposals yet. Add one to track your commercial offer.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {myProposals.map((proposal) => (
                            <ProposalCard
                              key={proposal.id}
                              proposal={proposal}
                              isExpanded={expandedProposalId === proposal.id}
                              onToggle={() => setExpandedProposalId(expandedProposalId === proposal.id ? null : proposal.id)}
                              onUpdate={updateProposal}
                              onDelete={() => deleteProposal(proposal.id)}
                              canEdit={currentUser.role === "admin" || proposal.ownerId === currentUser.id}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Management/Admin: all pipeline threads */}
              {isElevated && allPipelines.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">All Pipeline Threads</h3>
                  <div className="space-y-3">
                    {allPipelines.map((p) => {
                      const owner = users.find((u) => u.id === p.ownerId);
                      const isMe = p.ownerId === currentUser.id;
                      const threadProposals = getProposalsForPipeline(p.id);
                      const totalValue = threadProposals.reduce((s, pr) => s + pr.value, 0);
                      return (
                        <div key={p.id} className={cn("border border-border rounded-lg p-4 space-y-2", isMe && "border-primary/30 bg-primary/5")}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className={cn("text-xs", isMe ? "bg-primary text-white" : "bg-secondary text-secondary-foreground")}>
                                {owner?.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-semibold">{owner?.name}{isMe && " (You)"}</span>
                            <Badge className={`ml-auto text-xs border ${STAGE_COLORS[p.stage]}`} variant="outline">{p.stage}</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <p className="text-muted-foreground">Proposals</p>
                              <p className="font-semibold text-foreground">{threadProposals.length}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Total Value</p>
                              <p className="font-semibold text-foreground">{fmt(totalValue)}</p>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">Updated {p.updatedAt}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Meeting modal */}
      <MeetingFormModal
        open={showMeetingModal}
        meeting={editMeeting}
        onClose={() => { setShowMeetingModal(false); setEditMeeting(null); }}
        onSave={(meeting) => {
          const newMeeting = { ...meeting, leadId: leadId, scheduledById: currentUser.id };
          if (editMeeting) updateMeeting(newMeeting);
          else addMeeting(newMeeting);
          setShowMeetingModal(false);
          setEditMeeting(null);
        }}
      />

      {/* Add Proposal modal */}
      {myPipeline && (
        <AddProposalModal
          open={showAddProposal}
          pipelineId={myPipeline.id}
          leadId={leadId}
          ownerId={currentUser.id}
          currentStage={myPipeline.stage}
          onClose={() => setShowAddProposal(false)}
          onSave={(proposal) => {
            addProposal(proposal);
            setShowAddProposal(false);
          }}
        />
      )}
    </>
  );
};

// ── Proposal Card ──────────────────────────────────────────────────────────────
interface ProposalCardProps {
  proposal: Proposal;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (p: Proposal) => void;
  onDelete: () => void;
  canEdit: boolean;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ proposal, isExpanded, onToggle, onUpdate, onDelete, canEdit }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(proposal);
  const { currency, usdToInrRate } = useApp();
  const fmt = (v?: number) => formatCurrency(v, currency, usdToInrRate);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const updated = { ...proposal, attachmentName: file.name, attachmentUrl: url, updatedAt: new Date().toISOString().split("T")[0] };
    onUpdate(updated);
  };

  const handleSave = () => {
    onUpdate({ ...form, updatedAt: new Date().toISOString().split("T")[0] });
    setEditing(false);
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header row */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/20 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2 min-w-0">
          <FileText size={14} className="text-muted-foreground shrink-0" />
          <span className="text-sm font-medium text-foreground truncate">{proposal.title}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className="text-sm font-bold text-primary">{fmt(proposal.value)}</span>
          <Badge className={`text-xs border ${STAGE_COLORS[proposal.stage]}`} variant="outline">{proposal.stage}</Badge>
          {isExpanded ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-border px-4 py-3 space-y-3 bg-muted/10">
          {!editing ? (
            <>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Value</p>
                  <p className="font-semibold">{fmt(proposal.value)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Expected</p>
                  <p className="font-semibold">{fmt(proposal.expectedRevenue)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Probability</p>
                  <p className="font-semibold">{proposal.probability !== undefined ? `${proposal.probability}%` : "—"}</p>
                </div>
              </div>
              {proposal.notes && (
                <p className="text-xs text-muted-foreground bg-muted/40 rounded px-3 py-2">{proposal.notes}</p>
              )}
              <p className="text-xs text-muted-foreground">Created {proposal.createdAt}</p>

              {/* Attachment */}
              {proposal.attachmentName ? (
                <a
                  href={proposal.attachmentUrl}
                  download={proposal.attachmentName}
                  className="flex items-center gap-2 text-xs text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FileText size={12} />{proposal.attachmentName}
                </a>
              ) : (
                proposal.stage === "Proposal Sent" && canEdit && (
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors">
                    <Upload size={12} />
                    <span>Upload proposal deck</span>
                    <input type="file" className="hidden" accept=".pdf,.pptx,.docx,.ppt" onChange={handleFileUpload} />
                  </label>
                )
              )}

              {canEdit && (
                <div className="flex items-center gap-2 pt-1">
                  <Button size="sm" variant="outline" className="h-6 text-xs gap-1" onClick={() => { setForm(proposal); setEditing(true); }}>
                    <Pencil size={10} />Edit
                  </Button>
                  <Button size="sm" variant="ghost" className="h-6 text-xs gap-1 text-destructive hover:text-destructive" onClick={onDelete}>
                    <Trash2 size={10} />Delete
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Title</Label>
                <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="h-8 text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Proposal Value ($)</Label>
                  <Input type="number" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))} className="h-8 text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Expected Revenue ($)</Label>
                  <Input type="number" value={form.expectedRevenue} onChange={(e) => setForm((f) => ({ ...f, expectedRevenue: Number(e.target.value) }))} className="h-8 text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Stage</Label>
                  <Select value={form.stage} onValueChange={(v) => setForm((f) => ({ ...f, stage: v as PipelineStage }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{PIPELINE_STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Probability (%)</Label>
                  <Input type="number" min={0} max={100} value={form.probability ?? ""} onChange={(e) => setForm((f) => ({ ...f, probability: Number(e.target.value) }))} className="h-8 text-xs" placeholder="0–100" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Notes</Label>
                <Textarea value={form.notes || ""} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} className="text-xs" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="h-7 text-xs" onClick={handleSave}>Save</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Add Proposal Modal ─────────────────────────────────────────────────────────
interface AddProposalModalProps {
  open: boolean;
  pipelineId: string;
  leadId: string;
  ownerId: string;
  currentStage: PipelineStage;
  onClose: () => void;
  onSave: (proposal: Proposal) => void;
}

const AddProposalModal: React.FC<AddProposalModalProps> = ({ open, pipelineId, leadId, ownerId, currentStage, onClose, onSave }) => {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState<Partial<Proposal>>({ stage: currentStage, value: 0, expectedRevenue: 0, probability: 50 });

  const set = <K extends keyof Proposal>(k: K, v: Proposal[K]) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.title) return;
    onSave({
      id: generateId(),
      pipelineId,
      leadId,
      ownerId,
      title: form.title!,
      value: form.value || 0,
      stage: form.stage || currentStage,
      probability: form.probability,
      expectedRevenue: form.expectedRevenue || 0,
      notes: form.notes,
      createdAt: today,
      updatedAt: today,
    });
    setForm({ stage: currentStage, value: 0, expectedRevenue: 0, probability: 50 });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md z-[60]">
        <DialogHeader>
          <DialogTitle>Add Proposal</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label>Proposal Title *</Label>
            <Input value={form.title || ""} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Enterprise Platform - Phase 1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Proposal Value ($)</Label>
              <Input type="number" value={form.value || ""} onChange={(e) => set("value", Number(e.target.value))} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Expected Revenue ($)</Label>
              <Input type="number" value={form.expectedRevenue || ""} onChange={(e) => set("expectedRevenue", Number(e.target.value))} placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Stage</Label>
              <Select value={form.stage} onValueChange={(v) => set("stage", v as PipelineStage)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PIPELINE_STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Probability (%)</Label>
              <Input type="number" min={0} max={100} value={form.probability ?? ""} onChange={(e) => set("probability", Number(e.target.value))} placeholder="50" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} placeholder="Proposal context, terms, conditions..." rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.title}>Add Proposal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const InfoRow: React.FC<{ icon: React.ElementType; label: string; value: string; href?: string }> = ({ icon: Icon, label, value, href }) => (
  <div className="flex items-center gap-3 text-sm">
    <Icon size={14} className="text-muted-foreground shrink-0" />
    <span className="text-muted-foreground w-20 shrink-0">{label}</span>
    {href ? (
      <a href={href} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">{value}</a>
    ) : (
      <span className="text-foreground truncate">{value}</span>
    )}
  </div>
);

export default LeadDetailDrawer;
