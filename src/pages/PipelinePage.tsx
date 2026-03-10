import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { UserPipeline, PipelineStage } from "@/data/types";
import { PIPELINE_STAGES, STAGE_COLORS, STAGE_DOT, formatCurrency, generateId } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, DollarSign, TrendingUp, Target } from "lucide-react";
import LeadDetailDrawer from "@/components/LeadDetailDrawer";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const PipelinePage: React.FC = () => {
  const { leads, companies, users, currentUser, pipelines, proposals, upsertPipeline, getProposalsForPipeline } = useApp();
  const [viewMode, setViewMode] = useState<"kanban" | "table" | "chart">("kanban");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const isElevated = currentUser.role === "admin" || currentUser.role === "management";

  // BD users cannot access pipeline at all
  if (currentUser.role === "bd") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-6">
        <TrendingUp size={48} className="text-muted-foreground" />
        <h2 className="text-xl font-bold">Pipeline Not Available</h2>
        <p className="text-muted-foreground max-w-xs">Business Developers don't have pipeline access. Your Sales Team lead manages the pipeline for the leads you enter.</p>
      </div>
    );
  }

  const visiblePipelines = isElevated
    ? pipelines
    : pipelines.filter((p) => p.ownerId === currentUser.id);

  // Aggregate value from proposals linked to visible pipelines
  const getPipelineValue = (pipeline: UserPipeline) =>
    getProposalsForPipeline(pipeline.id).reduce((s, p) => s + p.value, 0);

  const getPipelineExpected = (pipeline: UserPipeline) =>
    getProposalsForPipeline(pipeline.id).reduce((s, p) => s + p.expectedRevenue, 0);

  const getPipelineMaxProb = (pipeline: UserPipeline) => {
    const props = getProposalsForPipeline(pipeline.id).filter((p) => p.probability !== undefined);
    if (!props.length) return undefined;
    return Math.max(...props.map((p) => p.probability!));
  };

  const totalValue = visiblePipelines.reduce((s, p) => s + getPipelineValue(p), 0);
  const forecastRevenue = visiblePipelines.reduce((s, p) => s + getPipelineExpected(p), 0);
  const wonPipelines = visiblePipelines.filter((p) => p.stage === "Closed Won");
  const wonValue = wonPipelines.reduce((s, p) => s + getPipelineValue(p), 0);
  const activePipelines = visiblePipelines.filter((p) => p.stage !== "Closed Won" && p.stage !== "Closed Lost");

  const handleStageChange = (pipeline: UserPipeline, stage: PipelineStage) => {
    upsertPipeline({ ...pipeline, stage, updatedAt: new Date().toISOString().split("T")[0] });
  };

  const stageStats = PIPELINE_STAGES.map((stage) => {
    const stagePipelines = visiblePipelines.filter((p) => p.stage === stage);
    return {
      stage,
      count: stagePipelines.length,
      value: stagePipelines.reduce((s, p) => s + getPipelineValue(p), 0),
    };
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            {activePipelines.length} active pipeline thread{activePipelines.length !== 1 ? "s" : ""}
            {!isElevated && " (your view)"}
          </p>
        </div>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "kanban" | "table" | "chart")}>
          <TabsList className="h-9">
            <TabsTrigger value="kanban" className="px-4 text-sm">Kanban</TabsTrigger>
            <TabsTrigger value="table" className="px-4 text-sm">Table</TabsTrigger>
            <TabsTrigger value="chart" className="px-4 text-sm">Forecast</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Pipeline", value: formatCurrency(totalValue), icon: DollarSign, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Revenue Forecast", value: formatCurrency(forecastRevenue), icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
          { label: "Closed Won", value: formatCurrency(wonValue), icon: Target, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Active Threads", value: activePipelines.length, icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
        ].map((s) => (
          <Card key={s.label} className="shadow-card border-border">
            <CardContent className="p-4">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon size={16} className={s.color} />
              </div>
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Kanban */}
      {viewMode === "kanban" && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {PIPELINE_STAGES.map((stage) => {
              const stagePipelines = visiblePipelines.filter((p) => p.stage === stage);
              const stageValue = stagePipelines.reduce((s, p) => s + getPipelineValue(p), 0);
              return (
                <div key={stage} className="w-64 shrink-0">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${STAGE_DOT[stage]}`} />
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{stage}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="text-xs h-4 px-1.5">{stagePipelines.length}</Badge>
                      {stageValue > 0 && <span className="text-xs text-muted-foreground">{formatCurrency(stageValue)}</span>}
                    </div>
                  </div>
                  <div className="space-y-2 bg-muted/30 rounded-lg p-2 min-h-32">
                    {stagePipelines.map((pipeline) => {
                      const lead = leads.find((l) => l.id === pipeline.leadId);
                      const company = companies.find((c) => c.id === lead?.companyId);
                      const owner = users.find((u) => u.id === pipeline.ownerId);
                      const isMe = pipeline.ownerId === currentUser.id;
                      const pValue = getPipelineValue(pipeline);
                      const prob = getPipelineMaxProb(pipeline);
                      return (
                        <Card
                          key={pipeline.id}
                          className="shadow-card border-border cursor-pointer hover:shadow-card-md transition-shadow"
                          onClick={() => setSelectedLeadId(pipeline.leadId)}
                        >
                          <CardContent className="p-3">
                            <p className="font-semibold text-sm text-foreground mb-0.5">{lead?.prospectName}</p>
                            <p className="text-xs text-muted-foreground mb-2">{company?.name}</p>
                            <div className="flex items-center justify-between">
                              {pValue > 0 ? (
                                <span className="text-xs font-bold text-primary">{formatCurrency(pValue)}</span>
                              ) : <span />}
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className={`text-xs ${isMe ? "bg-primary text-white" : "bg-secondary text-secondary-foreground"}`}>{owner?.avatar}</AvatarFallback>
                              </Avatar>
                            </div>
                            {prob !== undefined && prob > 0 && (
                              <div className="mt-2">
                                <div className="h-1 bg-muted rounded-full overflow-hidden">
                                  <div className="h-full bg-primary rounded-full" style={{ width: `${prob}%` }} />
                                </div>
                                <span className="text-xs text-muted-foreground">{prob}% probability</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                    {stagePipelines.length === 0 && (
                      <div className="py-4 text-center text-xs text-muted-foreground/50">No pipelines</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Table view */}
      {viewMode === "table" && (
        <Card className="shadow-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Lead</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Company</th>
                  {isElevated && <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Owner</th>}
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Stage</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Total Value</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Expected</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Proposals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visiblePipelines.map((pipeline) => {
                  const lead = leads.find((l) => l.id === pipeline.leadId);
                  const company = companies.find((c) => c.id === lead?.companyId);
                  const owner = users.find((u) => u.id === pipeline.ownerId);
                  const pValue = getPipelineValue(pipeline);
                  const pExpected = getPipelineExpected(pipeline);
                  const pProposals = getProposalsForPipeline(pipeline.id);
                  return (
                    <tr key={pipeline.id} className="hover:bg-muted/20 cursor-pointer" onClick={() => setSelectedLeadId(pipeline.leadId)}>
                      <td className="px-4 py-3 font-medium">{lead?.prospectName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{company?.name}</td>
                      {isElevated && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="bg-secondary text-xs">{owner?.avatar}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">{owner?.name}</span>
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <Select
                          value={pipeline.stage}
                          onValueChange={(v) => { handleStageChange(pipeline, v as PipelineStage); }}
                        >
                          <SelectTrigger className={`h-7 w-36 border text-xs font-medium px-2 ${STAGE_COLORS[pipeline.stage]}`} onClick={(e) => e.stopPropagation()}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent onClick={(e) => e.stopPropagation()}>
                            {PIPELINE_STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(pValue)}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{formatCurrency(pExpected)}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant="secondary" className="text-xs">{pProposals.length}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Forecast chart */}
      {viewMode === "chart" && (
        <div className="space-y-6">
          <Card className="shadow-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Pipeline by Stage — Value & Count</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stageStats} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 92%)" />
                  <XAxis dataKey="stage" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" />
                  <YAxis yAxisId="left" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number, name: string) => [name === "value" ? formatCurrency(v) : v, name === "value" ? "Pipeline Value" : "Thread Count"]} />
                  <Bar yAxisId="left" dataKey="value" fill="hsl(18 100% 50%)" radius={[4, 4, 0, 0]} name="value" />
                  <Bar yAxisId="right" dataKey="count" fill="hsl(210 100% 56%)" radius={[4, 4, 0, 0]} name="count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stageStats.filter((s) => s.count > 0).map((stage) => (
              <Card key={stage.stage} className="shadow-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${STAGE_DOT[stage.stage]}`} />
                      <span className="text-sm font-semibold">{stage.stage}</span>
                    </div>
                    <Badge variant="secondary">{stage.count} thread{stage.count !== 1 ? "s" : ""}</Badge>
                  </div>
                  <p className="text-2xl font-bold text-foreground mt-2">{formatCurrency(stage.value)}</p>
                  <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${totalValue > 0 ? (stage.value / totalValue) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totalValue > 0 ? ((stage.value / totalValue) * 100).toFixed(1) : 0}% of total pipeline
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedLeadId && <LeadDetailDrawer leadId={selectedLeadId} onClose={() => setSelectedLeadId(null)} />}
    </div>
  );
};

export default PipelinePage;
