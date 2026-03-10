import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Lead, UserPipeline } from "@/data/types";
import { generateId } from "@/lib/constants";
import { Button } from "@/components/ui/button";
...


  // Preview panel data helpers
  const getPreviewData = (lead: Lead) => {
    const company = companies.find((c) => c.id === lead.companyId);
    const leadPipelines = pipelines.filter((p) => p.leadId === lead.id);
    const myPipeline = leadPipelines.find((p) => p.ownerId === currentUser.id);
    const owners = leadPipelines.map((p) => users.find((u) => u.id === p.ownerId)).filter(Boolean);

    const leadMeetings = meetings
      .filter((m) => m.leadId === lead.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pastMeetings = leadMeetings.filter((m) => new Date(m.date) < today);
    const futureMeetings = leadMeetings.filter((m) => new Date(m.date) >= today);
    const lastMeeting = pastMeetings[0] || null;
    const nextMeeting = futureMeetings[futureMeetings.length - 1] || null;

    const myProposals = myPipeline
      ? proposals.filter((p) => p.pipelineId === myPipeline.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      : [];
    const latestProposal = myProposals[0] || null;

    return { company, owners, myPipeline, lastMeeting, nextMeeting, latestProposal };
  };

  const stageColor: Record<string, string> = {
    "New Lead": "bg-blue-100 text-blue-700",
    "Contacted": "bg-purple-100 text-purple-700",
    "Discovery": "bg-yellow-100 text-yellow-700",
    "Proposal Sent": "bg-orange-100 text-orange-700",
    "Negotiation": "bg-violet-100 text-violet-700",
    "Closed Won": "bg-green-100 text-green-700",
    "Closed Lost": "bg-red-100 text-red-700",
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-sm text-muted-foreground">{filteredLeads.length} leads</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus size={16} />New Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="px-6 pb-3 flex flex-wrap gap-3 shrink-0">
        {isElevated && (
          <Tabs defaultValue="all" onValueChange={(v) => setOwnerFilter(v === "mine" ? currentUser.id : "all")}>
            <TabsList className="h-9">
              <TabsTrigger value="all" className="text-sm px-4">All Leads</TabsTrigger>
              <TabsTrigger value="mine" className="text-sm px-4">My Leads</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search leads..." className="pl-8 h-9 w-56" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {isElevated && (
          <Select value={ownerFilter} onValueChange={setOwnerFilter}>
            <SelectTrigger className="h-9 w-44">
              <SelectValue placeholder="All Owners" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Owners</SelectItem>
              {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Two-panel workspace */}
      <div className="flex flex-1 min-h-0 px-6 pb-6 gap-4">
        {/* Left panel — compact lead list (40%) */}
        <Card className="w-[40%] flex flex-col overflow-hidden border-border shadow-sm">
          <ScrollArea className="flex-1">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-muted/60 border-b border-border backdrop-blur-sm">
                  <th className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Prospect</th>
                  <th className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">Company</th>
                  <th className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">Owner</th>
                  <th className="text-left px-3 py-2.5 font-medium text-muted-foreground text-xs uppercase tracking-wider">Activity</th>
                  <th className="px-3 py-2.5 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLeads.map((lead) => {
                  const company = companies.find((c) => c.id === lead.companyId);
                  const leadPipelines = pipelines.filter((p) => p.leadId === lead.id);
                  const owners = leadPipelines.map((p) => users.find((u) => u.id === p.ownerId)).filter(Boolean);
                  const isSelected = selectedLeadId === lead.id;
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLeadId(lead.id)}
                      className={`cursor-pointer transition-colors ${isSelected ? "bg-primary/8 border-l-2 border-l-primary" : "hover:bg-muted/30"}`}
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar className="h-6 w-6 shrink-0">
                            <AvatarFallback className={`text-xs font-semibold ${isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                              {lead.prospectName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className={`font-medium truncate text-xs ${isSelected ? "text-primary" : "text-foreground"}`}>{lead.prospectName}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground truncate hidden sm:table-cell max-w-[90px]">{company?.name}</td>
                      <td className="px-3 py-2.5 hidden md:table-cell">
                        <div className="flex items-center gap-0.5">
                          {owners.slice(0, 2).map((owner) => owner && (
                            <Avatar key={owner.id} className="h-5 w-5 -ml-1 first:ml-0 ring-1 ring-background">
                              <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">{owner.avatar}</AvatarFallback>
                            </Avatar>
                          ))}
                          {owners.length > 2 && <span className="text-xs text-muted-foreground ml-1">+{owners.length - 2}</span>}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{getLastActivity(lead.id)}</td>
                      <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal size={12} /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setOpenDrawerLeadId(lead.id); setDrawerTab("overview"); }} className="gap-2 text-xs"><ChevronRight size={12} />Full Details</DropdownMenuItem>
                            {isElevated && (
                              <DropdownMenuItem onClick={() => setEditLead(lead)} className="gap-2 text-xs"><Pencil size={12} />Edit</DropdownMenuItem>
                            )}
                            {currentUser.role === "admin" && (
                              <DropdownMenuItem onClick={() => handleDelete(lead.id)} className="gap-2 text-xs text-destructive"><Trash2 size={12} />Delete</DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
                {filteredLeads.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground text-sm">No leads found</td></tr>
                )}
              </tbody>
            </table>
          </ScrollArea>
        </Card>

        {/* Right panel — preview (60%) */}
        <Card className="w-[60%] flex flex-col overflow-hidden border-border shadow-sm">
          {selectedLead ? (
            <ScrollArea className="flex-1">
              {(() => {
                const { company, owners, myPipeline, lastMeeting, nextMeeting, latestProposal } = getPreviewData(selectedLead);
                return (
                  <div className="p-5 space-y-5">
                    {/* Lead header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                            {selectedLead.prospectName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h2 className="font-semibold text-foreground text-lg leading-tight">{selectedLead.prospectName}</h2>
                          <p className="text-sm text-muted-foreground">{company?.name}</p>
                          {company?.industry && (
                            <Badge variant="outline" className="text-xs mt-1">{company.industry}</Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 gap-1.5 text-xs"
                        onClick={() => { setOpenDrawerLeadId(selectedLead.id); setDrawerTab("overview"); }}
                      >
                        <ChevronRight size={13} />Full View
                      </Button>
                    </div>

                    {/* Contact info */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail size={14} className="shrink-0 text-primary/60" />
                        <a href={`mailto:${selectedLead.email}`} className="text-primary hover:underline truncate text-xs">{selectedLead.email}</a>
                      </div>
                      {selectedLead.mobile && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone size={14} className="shrink-0 text-primary/60" />
                          <span className="text-xs">{selectedLead.mobile}</span>
                        </div>
                      )}
                      {selectedLead.linkedIn && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Linkedin size={14} className="shrink-0 text-primary/60" />
                          <a href={`https://${selectedLead.linkedIn}`} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs truncate">{selectedLead.linkedIn}</a>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User size={14} className="shrink-0 text-primary/60" />
                        <span className="text-xs">{owners.map((o) => o?.name.split(" ")[0]).join(", ") || "Unassigned"}</span>
                      </div>
                    </div>

                    <div className="h-px bg-border" />

                    {/* Quick actions */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Quick Actions</p>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8"
                          onClick={() => { setOpenDrawerLeadId(selectedLead.id); setDrawerTab("meetings"); }}>
                          <Calendar size={13} />Schedule Meeting
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8"
                          onClick={() => { setOpenDrawerLeadId(selectedLead.id); setDrawerTab("meetings"); }}>
                          <Activity size={13} />Add Meeting Notes
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8"
                          onClick={() => { setOpenDrawerLeadId(selectedLead.id); setDrawerTab("pipeline"); }}>
                          <TrendingUp size={13} />View Pipeline
                        </Button>
                      </div>
                    </div>

                    <div className="h-px bg-border" />

                    {/* Activity preview */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Activity</p>
                      <div className="space-y-3">
                        {/* Last meeting */}
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                          <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                            <Calendar size={13} className="text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground">Last Meeting</p>
                            {lastMeeting ? (
                              <>
                                <p className="text-xs text-muted-foreground truncate">{lastMeeting.title}</p>
                                <p className="text-xs text-muted-foreground">{lastMeeting.date}</p>
                                {lastMeeting.outcome && <p className="text-xs text-muted-foreground italic truncate">"{lastMeeting.outcome}"</p>}
                              </>
                            ) : (
                              <p className="text-xs text-muted-foreground">No meetings yet</p>
                            )}
                          </div>
                        </div>

                        {/* Upcoming meeting */}
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Calendar size={13} className="text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground">Upcoming Meeting</p>
                            {nextMeeting ? (
                              <>
                                <p className="text-xs text-muted-foreground truncate">{nextMeeting.title}</p>
                                <p className="text-xs text-muted-foreground">{nextMeeting.date} · {nextMeeting.time}</p>
                              </>
                            ) : (
                              <p className="text-xs text-muted-foreground">None scheduled</p>
                            )}
                          </div>
                        </div>

                        {/* Latest pipeline */}
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                          <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                            <TrendingUp size={13} className="text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-foreground">Pipeline</p>
                            {myPipeline ? (
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stageColor[myPipeline.stage] || "bg-muted text-muted-foreground"}`}>
                                  {myPipeline.stage}
                                </span>
                                {latestProposal && (
                                  <span className="text-xs text-muted-foreground">
                                    ${latestProposal.value.toLocaleString()} · {latestProposal.title}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">No pipeline started</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </ScrollArea>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
              <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
                <ChevronRight size={24} className="text-muted-foreground" />
              </div>
              <p className="font-medium text-sm">Select a lead</p>
              <p className="text-xs mt-1">Click any row on the left to preview lead details here</p>
            </div>
          )}
        </Card>
      </div>

      {/* Create / Edit Modal */}
      <LeadFormModal
        open={showCreateModal || !!editLead}
        lead={editLead}
        onClose={() => { setShowCreateModal(false); setEditLead(null); }}
        onSave={(lead, pipeline) => {
          if (editLead) updateLead(lead);
          else { addLead(lead); if (pipeline) upsertPipeline(pipeline); }
          setShowCreateModal(false);
          setEditLead(null);
        }}
      />

      {/* Lead Detail Drawer — opened from quick actions / nudges / Full View */}
      {openDrawerLeadId && (
        <LeadDetailDrawer
          leadId={openDrawerLeadId}
          defaultTab={drawerTab}
          onClose={() => { setOpenDrawerLeadId(null); setDrawerTab("overview"); }}
        />
      )}
    </div>
  );
};

interface LeadFormModalProps {
  open: boolean;
  lead?: Lead | null;
  onClose: () => void;
  onSave: (lead: Lead, pipeline?: UserPipeline) => void;
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({ open, lead, onClose, onSave }) => {
  const { companies, leads, currentUser } = useApp();
  const [form, setForm] = useState<Partial<Lead>>(lead || {});
  const [emailError, setEmailError] = useState("");

  React.useEffect(() => {
    setForm(lead || {});
    setEmailError("");
  }, [lead, open]);

  const handleSubmit = () => {
    if (!form.prospectName || !form.companyId || !form.email) return;

    // Email uniqueness check (only for new leads)
    if (!lead) {
      const existing = leads.find((l) => l.email.toLowerCase() === form.email!.toLowerCase());
      if (existing) {
        setEmailError("A lead with this email already exists. Multiple users can engage the same lead from their own pipeline.");
        return;
      }
    }

    const newLead: Lead = {
      id: lead?.id || generateId(),
      prospectName: form.prospectName!,
      companyId: form.companyId!,
      email: form.email!,
      linkedIn: form.linkedIn,
      mobile: form.mobile,
      notes: form.notes,
      createdAt: lead?.createdAt || new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };

    // Create an initial pipeline thread for the current user (only on new lead)
    const pipeline: UserPipeline | undefined = !lead ? {
      id: generateId(),
      leadId: newLead.id,
      ownerId: currentUser.id,
      stage: "New Lead",
      createdAt: newLead.createdAt,
      updatedAt: newLead.updatedAt,
    } : undefined;

    onSave(newLead, pipeline);
  };

  const set = (key: keyof Lead, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{lead ? "Edit Lead" : "Create New Lead"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Prospect Name *</Label>
              <Input value={form.prospectName || ""} onChange={(e) => set("prospectName", e.target.value)} placeholder="Full name" />
            </div>
            <div className="space-y-1.5">
              <Label>Company *</Label>
              <Select value={form.companyId || ""} onValueChange={(v) => set("companyId", v)}>
                <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                <SelectContent>
                  {companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Email *</Label>
            <Input
              type="email"
              value={form.email || ""}
              onChange={(e) => { set("email", e.target.value); setEmailError(""); }}
              placeholder="email@company.com"
              disabled={!!lead}
            />
            {emailError && <p className="text-xs text-destructive">{emailError}</p>}
            {!lead && <p className="text-xs text-muted-foreground">Leads are unique by email address.</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Mobile</Label>
              <Input value={form.mobile || ""} onChange={(e) => set("mobile", e.target.value)} placeholder="+1-000-000-0000" />
            </div>
            <div className="space-y-1.5">
              <Label>LinkedIn</Label>
              <Input value={form.linkedIn || ""} onChange={(e) => set("linkedIn", e.target.value)} placeholder="linkedin.com/in/..." />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} placeholder="Additional notes..." rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!form.prospectName || !form.companyId || !form.email}>
            {lead ? "Update Lead" : "Create Lead"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeadsPage;
