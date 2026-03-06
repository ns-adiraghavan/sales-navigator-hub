import React from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Building2, Calendar, TrendingUp, DollarSign, Target, ArrowUp, ArrowDown } from "lucide-react";
import { formatCurrency, STAGE_COLORS } from "@/lib/constants";
import { PipelineStage } from "@/data/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const CHART_COLORS = ["#ff5c35", "#3b82f6", "#22c55e", "#8b5cf6", "#f59e0b", "#ec4899", "#14b8a6"];

const DashboardPage: React.FC = () => {
  const { leads, meetings, companies, proposals } = useApp();

  const today = new Date().toISOString().split("T")[0];
  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEndStr = weekEnd.toISOString().split("T")[0];

  const totalLeads = leads.length;
  const meetingsThisWeek = meetings.filter((m) => m.date >= today && m.date <= weekEndStr).length;
  const totalPipelineValue = leads.reduce((sum, l) => sum + (l.proposalValue || 0), 0);
  const forecastedRevenue = leads.reduce((sum, l) => sum + (l.expectedRevenue || 0), 0);
  const closedWon = leads.filter((l) => l.stage === "Closed Won");
  const closedRevenue = closedWon.reduce((sum, l) => sum + (l.proposalValue || 0), 0);

  // Leads by stage
  const stageData = (
    ["New Lead", "Contacted", "Discovery", "Proposal Sent", "Negotiation", "Closed Won", "Closed Lost"] as PipelineStage[]
  ).map((stage) => ({
    stage: stage.split(" ")[0],
    fullStage: stage,
    count: leads.filter((l) => l.stage === stage).length,
    value: leads.filter((l) => l.stage === stage).reduce((s, l) => s + (l.proposalValue || 0), 0),
  }));

  // Pipeline by company
  const companyPipeline = companies
    .map((c) => {
      const compLeads = leads.filter((l) => l.companyId === c.id);
      return {
        name: c.name.split(" ")[0],
        value: compLeads.reduce((s, l) => s + (l.proposalValue || 0), 0),
        leads: compLeads.length,
      };
    })
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const pieData = stageData.filter((s) => s.count > 0).map((s) => ({ name: s.fullStage, value: s.count }));

  const recentLeads = [...leads].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);
  const upcomingMeetings = meetings.filter((m) => m.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);

  const statCards = [
    { title: "Total Leads", value: totalLeads, icon: Users, color: "text-blue-600", bg: "bg-blue-50", change: "+12%", up: true },
    { title: "Pipeline Value", value: formatCurrency(totalPipelineValue), icon: DollarSign, color: "text-orange-600", bg: "bg-orange-50", change: "+8%", up: true },
    { title: "Revenue Forecast", value: formatCurrency(forecastedRevenue), icon: TrendingUp, color: "text-green-600", bg: "bg-green-50", change: "+5%", up: true },
    { title: "Meetings (7d)", value: meetingsThisWeek, icon: Calendar, color: "text-purple-600", bg: "bg-purple-50", change: meetingsThisWeek > 0 ? `${meetingsThisWeek} upcoming` : "None", up: true },
    { title: "Companies", value: companies.length, icon: Building2, color: "text-teal-600", bg: "bg-teal-50", change: "+2 this month", up: true },
    { title: "Closed Won", value: formatCurrency(closedRevenue), icon: Target, color: "text-emerald-600", bg: "bg-emerald-50", change: `${closedWon.length} deals`, up: true },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sales Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your pipeline and activity</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <Card key={card.title} className="shadow-card border-border">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <card.icon size={18} className={card.color} />
                </div>
              </div>
              <p className="text-xl font-bold text-foreground leading-none mb-1">{card.value}</p>
              <p className="text-xs text-muted-foreground mb-2">{card.title}</p>
              <div className="flex items-center gap-1">
                {card.up ? <ArrowUp size={10} className="text-green-500" /> : <ArrowDown size={10} className="text-red-500" />}
                <span className="text-xs text-muted-foreground">{card.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart */}
        <Card className="lg:col-span-2 shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Pipeline Value by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stageData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 92%)" />
                <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} labelFormatter={(l, payload) => payload?.[0]?.payload?.fullStage || l} />
                <Bar dataKey="value" fill="hsl(18 100% 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie chart */}
        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Leads by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" nameKey="name">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent leads */}
        <Card className="shadow-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Recent Lead Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentLeads.map((lead) => {
                const company = companies.find((c) => c.id === lead.companyId);
                return (
                  <div key={lead.id} className="flex items-center justify-between px-6 py-3 hover:bg-muted/30 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-foreground">{lead.prospectName}</p>
                      <p className="text-xs text-muted-foreground">{company?.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {lead.proposalValue ? (
                        <span className="text-xs font-semibold text-foreground">{formatCurrency(lead.proposalValue)}</span>
                      ) : null}
                      <Badge className={`text-xs border ${STAGE_COLORS[lead.stage]}`} variant="outline">
                        {lead.stage}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming meetings */}
        <Card className="shadow-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Upcoming Meetings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {upcomingMeetings.length === 0 ? (
              <div className="px-6 py-8 text-center text-muted-foreground text-sm">No upcoming meetings</div>
            ) : (
              <div className="divide-y divide-border">
                {upcomingMeetings.map((meeting) => {
                  const lead = leads.find((l) => l.id === meeting.leadId);
                  const company = companies.find((c) => c.id === lead?.companyId);
                  return (
                    <div key={meeting.id} className="flex items-center gap-4 px-6 py-3 hover:bg-muted/30 transition-colors">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex flex-col items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary leading-none">
                          {new Date(meeting.date + "T12:00:00").toLocaleDateString("en-US", { day: "numeric" })}
                        </span>
                        <span className="text-xs text-primary/70 leading-none">
                          {new Date(meeting.date + "T12:00:00").toLocaleDateString("en-US", { month: "short" })}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{meeting.title}</p>
                        <p className="text-xs text-muted-foreground">{lead?.prospectName} · {company?.name} · {meeting.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Company pipeline */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Top Companies by Pipeline Value</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={companyPipeline} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 92%)" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="value" fill="hsl(210 100% 56%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
