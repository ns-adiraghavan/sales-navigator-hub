import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Lead, PipelineStage } from "@/data/types";
import { PIPELINE_STAGES, STAGE_COLORS, formatCurrency, generateId } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Mail, Phone, Linkedin, Calendar, Plus, Building2, DollarSign, Target, Clock, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { MeetingFormModal } from "@/pages/MeetingsPage";
import { Meeting } from "@/data/types";

interface LeadDetailDrawerProps {
  leadId: string;
  onClose: () => void;
}

const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({ leadId, onClose }) => {
  const { leads, companies, users, meetings, updateLead, addMeeting, updateMeeting } = useApp();
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [editMeeting, setEditMeeting] = useState<Meeting | null>(null);

  const lead = leads.find((l) => l.id === leadId);
  if (!lead) return null;

  const company = companies.find((c) => c.id === lead.companyId);
  const owner = users.find((u) => u.id === lead.ownerId);
  const leadMeetings = meetings
    .filter((m) => m.leadId === leadId)
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleStageChange = (stage: PipelineStage) => {
    updateLead({ ...lead, stage, updatedAt: new Date().toISOString().split("T")[0] });
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

        {/* Stage selector */}
        <div className="px-6 py-3 bg-muted/30 border-b border-border flex items-center gap-3 flex-wrap">
          <Select value={lead.stage} onValueChange={handleStageChange}>
            <SelectTrigger className={`h-8 w-40 border text-xs font-semibold ${STAGE_COLORS[lead.stage]}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PIPELINE_STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Updated {lead.updatedAt}</span>
          </div>
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

            <TabsContent value="overview" className="p-6 space-y-5 mt-0">
              {/* Contact info */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contact Information</h3>
                <div className="space-y-2">
                  <InfoRow icon={Mail} label="Email" value={lead.email} href={`mailto:${lead.email}`} />
                  {lead.mobile && <InfoRow icon={Phone} label="Mobile" value={lead.mobile} href={`tel:${lead.mobile}`} />}
                  {lead.linkedIn && <InfoRow icon={Linkedin} label="LinkedIn" value={lead.linkedIn} href={`https://${lead.linkedIn}`} />}
                </div>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Company</h3>
                <div className="space-y-2">
                  <InfoRow icon={Building2} label="Company" value={company?.name || "—"} />
                  <InfoRow icon={Target} label="Industry" value={company?.industry || "—"} />
                  <InfoRow icon={Building2} label="Size" value={company?.size || "—"} />
                </div>
              </div>

              {/* Owner */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Lead Owner</h3>
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-secondary text-xs">{owner?.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{owner?.name}</p>
                    <p className="text-xs text-muted-foreground">{owner?.email}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {lead.notes && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Notes</h3>
                  <p className="text-sm text-foreground bg-muted/40 rounded-lg p-3">{lead.notes}</p>
                </div>
              )}
            </TabsContent>

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
                leadMeetings.map((meeting) => (
                  <div key={meeting.id} className="border border-border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-sm">{meeting.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock size={11} />{meeting.date} at {meeting.time}
                          {meeting.duration && ` · ${meeting.duration}min`}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditMeeting(meeting); setShowMeetingModal(true); }}>
                        <Pencil size={11} />
                      </Button>
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
                ))
              )}
            </TabsContent>

            <TabsContent value="pipeline" className="p-6 mt-0 space-y-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Revenue Tracking</h3>
              <div className="grid grid-cols-2 gap-4">
                <ValueCard label="Proposal Value" value={formatCurrency(lead.proposalValue)} icon={DollarSign} color="text-orange-600" bg="bg-orange-50" />
                <ValueCard label="Expected Revenue" value={formatCurrency(lead.expectedRevenue)} icon={Target} color="text-green-600" bg="bg-green-50" />
              </div>
              {lead.probability !== undefined && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">Win Probability</span>
                    <span className="text-sm font-bold">{lead.probability}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${lead.probability}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Stage progression */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Pipeline Stage</p>
                <div className="space-y-1.5">
                  {PIPELINE_STAGES.map((s, i) => {
                    const stageIndex = PIPELINE_STAGES.indexOf(lead.stage);
                    const currentIndex = i;
                    const isActive = s === lead.stage;
                    const isPast = currentIndex < stageIndex && lead.stage !== "Closed Lost";
                    return (
                      <div
                        key={s}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors text-sm",
                          isActive ? "bg-primary/10 text-primary font-semibold" : isPast ? "text-muted-foreground" : "text-muted-foreground/50 hover:bg-muted/30"
                        )}
                        onClick={() => handleStageChange(s)}
                      >
                        <div className={cn("w-2 h-2 rounded-full", isActive ? "bg-primary" : isPast ? "bg-muted-foreground" : "bg-muted-foreground/30")} />
                        {s}
                        {isActive && <Badge className="ml-auto text-xs h-4 px-1.5 bg-primary/20 text-primary border-0">Current</Badge>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <MeetingFormModal
        open={showMeetingModal}
        meeting={editMeeting}
        onClose={() => { setShowMeetingModal(false); setEditMeeting(null); }}
        onSave={(meeting) => {
          const newMeeting = { ...meeting, leadId: leadId };
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
