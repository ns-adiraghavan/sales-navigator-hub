import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Lead, UserPipeline, PipelineStage } from "@/data/types";
import { PIPELINE_STAGES, STAGE_COLORS, formatCurrency, generateId } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Mail, Phone, Linkedin, Calendar, Plus, Building2, DollarSign, Target, Clock, Pencil, User, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { MeetingFormModal } from "@/pages/MeetingsPage";
import { Meeting } from "@/data/types";

interface LeadDetailDrawerProps {
  leadId: string;
  onClose: () => void;
}

const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({ leadId, onClose }) => {
  const { leads, companies, users, meetings, currentUser, updateLead, addMeeting, updateMeeting, getMyPipeline, getPipelinesForLead, upsertPipeline } = useApp();
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [editMeeting, setEditMeeting] = useState<Meeting | null>(null);

  const lead = leads.find((l) => l.id === leadId);
  if (!lead) return null;

  const company = companies.find((c) => c.id === lead.companyId);
  const leadMeetings = meetings
    .filter((m) => m.leadId === leadId)
    .sort((a, b) => b.date.localeCompare(a.date));

  const isElevated = currentUser.role === "admin" || currentUser.role === "management";
  const myPipeline = getMyPipeline(leadId);
  const allPipelines = isElevated ? getPipelinesForLead(leadId) : [];

  const handlePipelineStageChange = (stage: PipelineStage) => {
    if (!myPipeline) {
      // Create a new pipeline thread for the current user
      upsertPipeline({
        id: generateId(),
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

  const handlePipelineFieldUpdate = (field: keyof UserPipeline, value: unknown) => {
    if (!myPipeline) return;
    upsertPipeline({ ...myPipeline, [field]: value, updatedAt: new Date().toISOString().split("T")[0] });
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
              <p className="text-sm text-muted-foreground">{company?.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X size={16} /></Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="overview" className="h-full">
            <TabsList className="w-full rounded-none border-b border-border h-10 bg-transparent">
              <TabsTrigger value="overview" className="flex-1 rounded-none text-xs">Overview</TabsTrigger>
              <TabsTrigger value="meetings" className="flex-1 rounded-none text-xs">
                Meetings ({leadMeetings.length})
              </TabsTrigger>
              <TabsTrigger value="pipeline" className="flex-1 rounded-none text-xs">Pipeline</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
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

            {/* Meetings Tab */}
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
                        {(currentUser.role === "admin" || meeting.scheduledById === currentUser.id) && (
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditMeeting(meeting); setShowMeetingModal(true); }}>
                            <Pencil size={11} />
                          </Button>
                        )}
                      </div>
                      {meeting.outcome && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">{meeting.outcome}</Badge>
                      )}
                      {meeting.notes && <p className="text-xs text-muted-foreground">{meeting.notes}</p>}
                      {meeting.minutes && (
                        <div className="bg-muted/40 rounded p-2 mt-1">
                          <p className="text-xs font-semibold text-muted-foreground mb-1">Minutes</p>
                          <p className="text-xs text-foreground">{meeting.minutes}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </TabsContent>

            {/* Pipeline Tab */}
            <TabsContent value="pipeline" className="p-6 mt-0 space-y-5">
              {/* My Pipeline thread */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">My Pipeline</h3>
                {!myPipeline ? (
                  <div className="border border-dashed border-border rounded-lg p-4 text-center space-y-3">
                    <AlertCircle size={20} className="mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">You don't have a pipeline thread for this lead yet.</p>
                    <Button size="sm" onClick={() => handlePipelineStageChange("New Lead")}>Start My Pipeline</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
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

                    {/* Revenue fields */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Proposal Value ($)</Label>
                        <Input
                          type="number"
                          value={myPipeline.proposalValue || ""}
                          onChange={(e) => handlePipelineFieldUpdate("proposalValue", Number(e.target.value))}
                          placeholder="0"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Expected Revenue ($)</Label>
                        <Input
                          type="number"
                          value={myPipeline.expectedRevenue || ""}
                          onChange={(e) => handlePipelineFieldUpdate("expectedRevenue", Number(e.target.value))}
                          placeholder="0"
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>

                    {/* Value cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <ValueCard label="Proposal Value" value={formatCurrency(myPipeline.proposalValue)} icon={DollarSign} color="text-orange-600" bg="bg-orange-50" />
                      <ValueCard label="Expected Revenue" value={formatCurrency(myPipeline.expectedRevenue)} icon={Target} color="text-green-600" bg="bg-green-50" />
                    </div>

                    {myPipeline.probability !== undefined && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-muted-foreground">Win Probability</span>
                          <span className="text-sm font-bold">{myPipeline.probability}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${myPipeline.probability}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
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
                      return (
                        <div key={p.id} className={cn("border border-border rounded-lg p-4 space-y-3", isMe && "border-primary/30 bg-primary/5")}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className={cn("text-xs", isMe ? "bg-primary text-white" : "bg-secondary text-secondary-foreground")}>
                                {owner?.avatar}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-semibold">{owner?.name}{isMe && " (You)"}</span>
                            <Badge className={`ml-auto text-xs border ${STAGE_COLORS[p.stage]}`} variant="outline">{p.stage}</Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-xs">
                            <div>
                              <p className="text-muted-foreground">Proposal Value</p>
                              <p className="font-semibold text-foreground">{formatCurrency(p.proposalValue)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Expected</p>
                              <p className="font-semibold text-foreground">{formatCurrency(p.expectedRevenue)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Probability</p>
                              <p className="font-semibold text-foreground">{p.probability !== undefined ? `${p.probability}%` : "—"}</p>
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
    </>
  );
};

const InfoRow: React.FC<{ icon: React.ElementType; label: string; value: string; href?: string }> = ({ icon: Icon, label, value, href }) => (
  <div className="flex items-center gap-3">
    <Icon size={14} className="text-muted-foreground shrink-0" />
    <span className="text-xs text-muted-foreground w-16 shrink-0">{label}</span>
    {href ? (
      <a href={href} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline truncate">{value}</a>
    ) : (
      <span className="text-sm text-foreground truncate">{value}</span>
    )}
  </div>
);

const ValueCard: React.FC<{ label: string; value: string; icon: React.ElementType; color: string; bg: string }> = ({ label, value, icon: Icon, color, bg }) => (
  <div className={`rounded-lg p-3 ${bg}`}>
    <Icon size={16} className={`${color} mb-2`} />
    <p className={`text-lg font-bold ${color}`}>{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

export default LeadDetailDrawer;
