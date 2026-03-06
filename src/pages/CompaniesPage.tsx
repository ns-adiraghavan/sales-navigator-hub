import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Company, Industry, INDUSTRY_OPTIONS } from "@/data/types";
import { formatCurrency, generateId } from "@/lib/constants";
import { STAGE_COLORS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Building2, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import LeadDetailDrawer from "@/components/LeadDetailDrawer";

const CompaniesPage: React.FC = () => {
  const { companies, leads, pipelines, proposals, addCompany } = useApp();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.industry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Companies</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} companies</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus size={16} />Add Company
        </Button>
      </div>

      <div className="relative w-72">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search companies..." className="pl-8 h-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="space-y-3">
        {filtered.map((company) => {
          const compLeads = leads.filter((l) => l.companyId === company.id);
          const compPipelineIds = new Set(
            pipelines.filter((p) => compLeads.some((l) => l.id === p.leadId)).map((p) => p.id)
          );
          const totalValue = proposals.filter((p) => compPipelineIds.has(p.pipelineId)).reduce((s, p) => s + p.value, 0);
          const isExpanded = expandedCompany === company.id;

          return (
            <Card key={company.id} className="shadow-card border-border overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/20 transition-colors"
                onClick={() => setExpandedCompany(isExpanded ? null : company.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{company.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <Badge variant="secondary" className="text-xs h-5">{company.industry}</Badge>
                      {company.location && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin size={10} />{company.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-muted-foreground">Leads</p>
                    <p className="font-bold text-foreground">{compLeads.length}</p>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-muted-foreground">Total Pipeline</p>
                    <p className="font-bold text-primary">{formatCurrency(totalValue)}</p>
                  </div>
                  {isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-border">
                  {compLeads.length === 0 ? (
                    <p className="px-6 py-4 text-sm text-muted-foreground">No leads for this company yet.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/30 border-b border-border">
                          <th className="text-left px-6 py-2.5 text-xs font-medium text-muted-foreground">Prospect</th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Email</th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Active Pipelines</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {compLeads.map((lead) => {
                          const leadPipelines = pipelines.filter((p) => p.leadId === lead.id);
                          const uniqueStages = [...new Set(leadPipelines.map((p) => p.stage))];
                          return (
                            <tr
                              key={lead.id}
                              className="hover:bg-muted/20 cursor-pointer"
                              onClick={() => setSelectedLeadId(lead.id)}
                            >
                              <td className="px-6 py-2.5">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                      {lead.prospectName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium text-foreground">{lead.prospectName}</span>
                                </div>
                              </td>
                              <td className="px-4 py-2.5 text-muted-foreground text-xs">{lead.email}</td>
                              <td className="px-4 py-2.5">
                                <div className="flex flex-wrap gap-1">
                                  {uniqueStages.length === 0 ? (
                                    <span className="text-xs text-muted-foreground">No pipeline</span>
                                  ) : (
                                    uniqueStages.map((stage) => (
                                      <Badge key={stage} className={`text-xs border ${STAGE_COLORS[stage]}`} variant="outline">
                                        {stage}
                                      </Badge>
                                    ))
                                  )}
                                  {leadPipelines.length > 1 && (
                                    <span className="text-xs text-muted-foreground">({leadPipelines.length} threads)</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <AddCompanyModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSave={(company) => { addCompany(company); setShowModal(false); }}
      />

      {selectedLeadId && (
        <LeadDetailDrawer leadId={selectedLeadId} onClose={() => setSelectedLeadId(null)} />
      )}
    </div>
  );
};

interface AddCompanyModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (company: Company) => void;
}

const AddCompanyModal: React.FC<AddCompanyModalProps> = ({ open, onClose, onSave }) => {
  const [form, setForm] = useState<Partial<Company>>({});

  const set = (key: keyof Company, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = () => {
    if (!form.name || !form.industry) return;
    onSave({
      id: generateId(),
      name: form.name!,
      industry: form.industry as Industry,
      website: form.website,
      location: form.location,
      size: form.size,
      createdAt: new Date().toISOString().split("T")[0],
    });
    setForm({});
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Company</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Company Name *</Label>
            <Input value={form.name || ""} onChange={(e) => set("name", e.target.value)} placeholder="Acme Corp" />
          </div>
          <div className="space-y-1.5">
            <Label>Industry *</Label>
            <Select value={form.industry || ""} onValueChange={(v) => set("industry", v)}>
              <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
              <SelectContent>
                {INDUSTRY_OPTIONS.map((ind) => (
                  <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Website</Label>
              <Input value={form.website || ""} onChange={(e) => set("website", e.target.value)} placeholder="acme.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input value={form.location || ""} onChange={(e) => set("location", e.target.value)} placeholder="City, State" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Company Size</Label>
            <Input value={form.size || ""} onChange={(e) => set("size", e.target.value)} placeholder="e.g. 1K-5K" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.name || !form.industry}>Add Company</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompaniesPage;
