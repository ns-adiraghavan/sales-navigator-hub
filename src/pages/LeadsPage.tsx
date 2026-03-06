import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Lead, PipelineStage } from "@/data/types";
import { PIPELINE_STAGES, STAGE_COLORS, formatCurrency, generateId } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Filter, Mail, Phone, Linkedin, Pencil, Trash2, Calendar, ChevronRight, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import LeadDetailDrawer from "@/components/LeadDetailDrawer";

const LeadsPage: React.FC = () => {
  const { leads, companies, users, currentUser, addLead, updateLead, deleteLead } = useApp();
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [ownerFilter, setOwnerFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"all" | "mine">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const isAdmin = currentUser.role === "admin";

  const filteredLeads = leads.filter((l) => {
    const company = companies.find((c) => c.id === l.companyId);
    const matchSearch =
      l.prospectName.toLowerCase().includes(search.toLowerCase()) ||
      company?.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase());
    const matchStage = stageFilter === "all" || l.stage === stageFilter;
    const matchOwner = ownerFilter === "all" || l.ownerId === ownerFilter;
    const matchView = viewMode === "all" ? true : l.ownerId === currentUser.id;
    return matchSearch && matchStage && matchOwner && matchView;
  });

  const handleDelete = (id: string) => {
    if (confirm("Delete this lead?")) deleteLead(id);
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
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "all" | "mine")}>
          <TabsList className="h-9">
            <TabsItem value="all" label="All Leads" />
            <TabsItem value="mine" label="My Leads" />
          </TabsList>
        </Tabs>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search leads..." className="pl-8 h-9 w-64" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="h-9 w-44">
            <SelectValue placeholder="All Stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {PIPELINE_STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        {isAdmin && (
          <Select value={ownerFilter} onValueChange={setOwnerFilter}>
            <SelectTrigger className="h-9 w-40">
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
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Stage</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Value</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Owner</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLeads.map((lead) => {
                const company = companies.find((c) => c.id === lead.companyId);
                const owner = users.find((u) => u.id === lead.ownerId);
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
                        <div>
                          <p className="font-medium text-foreground">{lead.prospectName}</p>
                          <p className="text-xs text-muted-foreground">{lead.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{company?.name}</td>
                    <td className="px-4 py-3">
                      <Select
                        value={lead.stage}
                        onValueChange={(val) => {
                          updateLead({ ...lead, stage: val as PipelineStage, updatedAt: new Date().toISOString().split("T")[0] });
                        }}
                      >
                        <SelectTrigger className={`h-7 w-36 border text-xs font-medium px-2 ${STAGE_COLORS[lead.stage]}`} onClick={(e) => e.stopPropagation()}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent onClick={(e) => e.stopPropagation()}>
                          {PIPELINE_STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">{formatCurrency(lead.proposalValue)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">{owner?.avatar}</AvatarFallback>
                        </Avatar>
                        <span className="text-muted-foreground text-xs">{owner?.name.split(" ")[0]}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <a href={`mailto:${lead.email}`} className="text-muted-foreground hover:text-primary transition-colors"><Mail size={14} /></a>
                        {lead.mobile && <a href={`tel:${lead.mobile}`} className="text-muted-foreground hover:text-primary transition-colors"><Phone size={14} /></a>}
                        {lead.linkedIn && <a href={`https://${lead.linkedIn}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors"><Linkedin size={14} /></a>}
                      </div>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal size={14} /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedLeadId(lead.id)} className="gap-2"><ChevronRight size={14} />View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditLead(lead)} className="gap-2"><Pencil size={14} />Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(lead.id)} className="gap-2 text-destructive"><Trash2 size={14} />Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
              {filteredLeads.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No leads found</td></tr>
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
        onSave={(lead) => {
          if (editLead) updateLead({ ...lead, updatedAt: new Date().toISOString().split("T")[0] });
          else addLead(lead);
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

// Tab item helper
const TabsItem: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <TabsTrigger value={value} className="text-sm px-4">{label}</TabsTrigger>
);

interface LeadFormModalProps {
  open: boolean;
  lead?: Lead | null;
  onClose: () => void;
  onSave: (lead: Lead) => void;
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({ open, lead, onClose, onSave }) => {
  const { companies, currentUser } = useApp();
  const [form, setForm] = useState<Partial<Lead>>(
    lead || { ownerId: currentUser.id, stage: "New Lead" }
  );

  React.useEffect(() => {
    setForm(lead || { ownerId: currentUser.id, stage: "New Lead" });
  }, [lead, open]);

  const handleSubmit = () => {
    if (!form.prospectName || !form.companyId || !form.email) return;
    onSave({
      id: lead?.id || generateId(),
      prospectName: form.prospectName!,
      companyId: form.companyId!,
      email: form.email!,
      linkedIn: form.linkedIn,
      mobile: form.mobile,
      notes: form.notes,
      ownerId: form.ownerId || currentUser.id,
      stage: form.stage || "New Lead",
      proposalValue: form.proposalValue,
      expectedRevenue: form.expectedRevenue,
      probability: form.probability,
      createdAt: lead?.createdAt || new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    });
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
            <Input type="email" value={form.email || ""} onChange={(e) => set("email", e.target.value)} placeholder="email@company.com" />
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Pipeline Stage</Label>
              <Select value={form.stage || "New Lead"} onValueChange={(v) => set("stage", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PIPELINE_STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Proposal Value ($)</Label>
              <Input type="number" value={form.proposalValue || ""} onChange={(e) => set("proposalValue", Number(e.target.value))} placeholder="0" />
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
