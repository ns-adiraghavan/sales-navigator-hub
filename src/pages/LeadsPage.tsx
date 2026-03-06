import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Lead, UserPipeline } from "@/data/types";
import { PIPELINE_STAGES, STAGE_COLORS, generateId } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Mail, Phone, Linkedin, Pencil, Trash2, ChevronRight, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import LeadDetailDrawer from "@/components/LeadDetailDrawer";

const LeadsPage: React.FC = () => {
  const { leads, companies, users, currentUser, pipelines, addLead, updateLead, deleteLead, upsertPipeline } = useApp();
  const [search, setSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const isElevated = currentUser.role === "admin" || currentUser.role === "management";

  // Leads where the current user has a pipeline thread
  const myLeadIds = new Set(pipelines.filter((p) => p.ownerId === currentUser.id).map((p) => p.leadId));

  const filteredLeads = leads.filter((l) => {
    const company = companies.find((c) => c.id === l.companyId);
    const matchSearch =
      l.prospectName.toLowerCase().includes(search.toLowerCase()) ||
      company?.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase());
    const matchOwner = ownerFilter === "all" || pipelines.some((p) => p.leadId === l.id && p.ownerId === ownerFilter);
    // Regular users only see their own leads
    const matchRole = isElevated ? true : myLeadIds.has(l.id);
    return matchSearch && matchOwner && matchRole;
  });

  const handleDelete = (id: string) => {
    if (confirm("Delete this lead?")) deleteLead(id);
  };

  const getLastActivity = (leadId: string) => {
    return leads.find((l) => l.id === leadId)?.updatedAt || "—";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-sm text-muted-foreground">{filteredLeads.length} leads found</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus size={16} />New Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Only elevated roles see the All Leads / My Leads tabs */}
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
          <Input placeholder="Search leads..." className="pl-8 h-9 w-64" value={search} onChange={(e) => setSearch(e.target.value)} />
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

      {/* Table */}
      <Card className="shadow-card border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Prospect</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Company</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Lead Owner(s)</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Last Activity</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLeads.map((lead) => {
                const company = companies.find((c) => c.id === lead.companyId);
                const leadPipelines = pipelines.filter((p) => p.leadId === lead.id);
                const owners = leadPipelines.map((p) => users.find((u) => u.id === p.ownerId)).filter(Boolean);
                return (
                  <tr
                    key={lead.id}
                    className="hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => setSelectedLeadId(lead.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {lead.prospectName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">{lead.prospectName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{company?.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a href={`mailto:${lead.email}`} className="text-primary hover:underline text-xs" onClick={(e) => e.stopPropagation()}>
                          {lead.email}
                        </a>
                        {lead.mobile && (
                          <a href={`tel:${lead.mobile}`} className="text-muted-foreground hover:text-primary" onClick={(e) => e.stopPropagation()}>
                            <Phone size={12} />
                          </a>
                        )}
                        {lead.linkedIn && (
                          <a href={`https://${lead.linkedIn}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary" onClick={(e) => e.stopPropagation()}>
                            <Linkedin size={12} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {owners.slice(0, 3).map((owner) => owner && (
                          <Avatar key={owner.id} className="h-5 w-5 -ml-1 first:ml-0 ring-1 ring-background">
                            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">{owner.avatar}</AvatarFallback>
                          </Avatar>
                        ))}
                        {owners.length > 3 && (
                          <span className="text-xs text-muted-foreground ml-1">+{owners.length - 3}</span>
                        )}
                        {owners.length === 1 && (
                          <span className="text-xs text-muted-foreground ml-1">{owners[0]?.name.split(" ")[0]}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{getLastActivity(lead.id)}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal size={14} /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedLeadId(lead.id)} className="gap-2"><ChevronRight size={14} />View Details</DropdownMenuItem>
                          {isElevated && (
                            <DropdownMenuItem onClick={() => setEditLead(lead)} className="gap-2"><Pencil size={14} />Edit</DropdownMenuItem>
                          )}
                          {currentUser.role === "admin" && (
                            <DropdownMenuItem onClick={() => handleDelete(lead.id)} className="gap-2 text-destructive"><Trash2 size={14} />Delete</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
              {filteredLeads.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No leads found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

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

      {/* Lead Detail Drawer */}
      {selectedLeadId && (
        <LeadDetailDrawer leadId={selectedLeadId} onClose={() => setSelectedLeadId(null)} />
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
