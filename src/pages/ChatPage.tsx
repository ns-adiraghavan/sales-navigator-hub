import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { formatCurrency } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { PipelineStage } from "@/data/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  data?: QueryResult;
}

interface QueryResult {
  type: "count" | "list" | "value" | "chart";
  count?: number;
  items?: Array<Record<string, unknown>>;
  value?: string;
  label?: string;
  chartData?: Array<{ name: string; value: number }>;
}

const SUGGESTED_QUERIES = [
  "How many leads do we have associated with Coca-Cola?",
  "What is the total proposal value in the pipeline?",
  "Show all leads in the Negotiation stage.",
  "How many meetings are scheduled this week?",
  "What is our total revenue forecast?",
  "Which leads are Closed Won?",
  "Show me all meetings with outcomes.",
  "What is the average deal size?",
];

const ChatPage: React.FC = () => {
  const { leads, companies, meetings, pipelines, proposals, users, currency, usdToInrRate } = useApp();
  const fmt = (v?: number) => formatCurrency(v, currency, usdToInrRate);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hi! I'm your Sales Data Assistant. Ask me anything about your pipeline, leads, or meetings.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEndStr = weekEnd.toISOString().split("T")[0];

  const queryData = (query: string): { text: string; data?: QueryResult } => {
    const q = query.toLowerCase();

    // Helper: get total proposal value for a pipeline id
    const pipelineValue = (pipelineId: string) =>
      proposals.filter((p) => p.pipelineId === pipelineId).reduce((s, p) => s + p.value, 0);

    // Company-specific lead count
    const companyMatch = companies.find((c) => q.includes(c.name.toLowerCase()));
    if (companyMatch && (q.includes("lead") || q.includes("how many"))) {
      const compLeads = leads.filter((l) => l.companyId === companyMatch.id);
      return {
        text: `**${companyMatch.name}** has **${compLeads.length} lead(s)** in the pipeline.`,
        data: {
          type: "list",
          count: compLeads.length,
          items: compLeads.map((l) => {
            const myPipeline = pipelines.find((p) => p.leadId === l.id);
            return { Prospect: l.prospectName, Stage: myPipeline?.stage || "No Pipeline", Value: fmt(myPipeline ? pipelineValue(myPipeline.id) : 0) };
          }),
          label: `Leads for ${companyMatch.name}`,
        },
      };
    }

    // Total pipeline value
    if (q.includes("total") && (q.includes("pipeline") || q.includes("proposal value") || q.includes("deal value"))) {
      const total = proposals.reduce((s, p) => s + p.value, 0);
      return {
        text: `The **total pipeline value** is **${fmt(total)}** across ${proposals.length} proposal(s).`,
        data: { type: "value", value: fmt(total), label: "Total Pipeline Value" },
      };
    }

    // Revenue forecast
    if (q.includes("forecast") || q.includes("expected revenue")) {
      const total = proposals.reduce((s, p) => s + p.expectedRevenue, 0);
      return {
        text: `The **total revenue forecast** is **${formatCurrency(total)}**, weighted by probability across all active deals.`,
        data: { type: "value", value: formatCurrency(total), label: "Revenue Forecast" },
      };
    }

    // Meetings this week
    if (q.includes("meeting") && (q.includes("week") || q.includes("scheduled") || q.includes("upcoming"))) {
      const weekMeetings = meetings.filter((m) => m.date >= today && m.date <= weekEndStr);
      return {
        text: `There are **${weekMeetings.length} meeting(s)** scheduled this week.`,
        data: {
          type: "list",
          count: weekMeetings.length,
          items: weekMeetings.map((m) => {
            const lead = leads.find((l) => l.id === m.leadId);
            const company = companies.find((c) => c.id === lead?.companyId);
            const scheduler = users.find((u) => u.id === m.scheduledById);
            return { Title: m.title, Date: m.date, Time: m.time, Lead: lead?.prospectName || "—", Company: company?.name || "—", "Scheduled By": scheduler?.name || "—" };
          }),
          label: "Meetings This Week",
        },
      };
    }

    // Stage-specific leads (via pipelines)
    const stages: PipelineStage[] = ["New Lead", "Contacted", "Discovery", "Proposal Sent", "Negotiation", "Closed Won", "Closed Lost"];
    const matchedStage = stages.find((s) => q.includes(s.toLowerCase()));
    if (matchedStage && q.includes("lead")) {
      const stagePipelines = pipelines.filter((p) => p.stage === matchedStage);
      const stageLeadIds = new Set(stagePipelines.map((p) => p.leadId));
      const stageLeads = leads.filter((l) => stageLeadIds.has(l.id));
      return {
        text: `There are **${stageLeads.length} lead(s)** in the **${matchedStage}** stage.`,
        data: {
          type: "list",
          count: stageLeads.length,
          items: stageLeads.map((l) => {
            const company = companies.find((c) => c.id === l.companyId);
            const p = stagePipelines.find((p) => p.leadId === l.id);
            const owner = users.find((u) => u.id === p?.ownerId);
            return { Prospect: l.prospectName, Company: company?.name || "—", Owner: owner?.name || "—", Value: formatCurrency(p ? pipelineValue(p.id) : 0) };
          }),
          label: `${matchedStage} Leads`,
        },
      };
    }

    // Closed won
    if (q.includes("closed won") || (q.includes("won") && q.includes("deal"))) {
      const wonPipelines = pipelines.filter((p) => p.stage === "Closed Won");
      const wonValue = wonPipelines.reduce((s, p) => s + pipelineValue(p.id), 0);
      return {
        text: `We have **${wonPipelines.length} Closed Won** pipeline thread(s) worth **${formatCurrency(wonValue)}** total.`,
        data: {
          type: "list",
          items: wonPipelines.map((p) => {
            const lead = leads.find((l) => l.id === p.leadId);
            const company = companies.find((c) => c.id === lead?.companyId);
            const owner = users.find((u) => u.id === p.ownerId);
            return { Prospect: lead?.prospectName || "—", Company: company?.name || "—", Owner: owner?.name || "—", Value: formatCurrency(pipelineValue(p.id)) };
          }),
          label: "Closed Won Deals",
        },
      };
    }

    // Average deal size
    if (q.includes("average") && (q.includes("deal") || q.includes("value") || q.includes("size"))) {
      const withValue = proposals.filter((p) => p.value > 0);
      const avg = withValue.length ? withValue.reduce((s, p) => s + p.value, 0) / withValue.length : 0;
      return {
        text: `The **average deal size** is **${formatCurrency(avg)}** based on ${withValue.length} proposal(s) with a value.`,
        data: { type: "value", value: formatCurrency(avg), label: "Average Deal Size" },
      };
    }

    // Total leads count
    if (q.includes("how many lead") || q.includes("total lead")) {
      return {
        text: `There are currently **${leads.length} total leads** in the system.`,
        data: { type: "count", count: leads.length, label: "Total Leads" },
      };
    }

    // Pipeline by stage chart
    if (q.includes("stage") || q.includes("pipeline breakdown") || q.includes("chart")) {
      const stageData = stages.map((stage) => {
        const stagePipelineIds = new Set(pipelines.filter((p) => p.stage === stage).map((p) => p.id));
        return {
          name: stage.split(" ")[0],
          value: proposals.filter((p) => stagePipelineIds.has(p.pipelineId)).reduce((s, p) => s + p.value, 0),
        };
      });
      return {
        text: `Here's a breakdown of your pipeline value by stage:`,
        data: { type: "chart", chartData: stageData, label: "Pipeline by Stage" },
      };
    }

    // Meetings with outcomes
    if (q.includes("meeting") && (q.includes("outcome") || q.includes("result"))) {
      const withOutcome = meetings.filter((m) => m.outcome);
      return {
        text: `There are **${withOutcome.length} meeting(s)** with recorded outcomes.`,
        data: {
          type: "list",
          items: withOutcome.map((m) => ({ Title: m.title, Date: m.date, Outcome: m.outcome || "—" })),
          label: "Meetings with Outcomes",
        },
      };
    }

    return {
      text: `I couldn't find a direct answer to that query. Try asking about specific companies, pipeline stages, deal values, or meetings. Here are some things I can help with:\n\n• Lead counts by company or stage\n• Pipeline and revenue values\n• Scheduled meetings\n• Closed won deals\n• Average deal size`,
    };
  };

  const handleSend = (queryText?: string) => {
    const text = queryText || input.trim();
    if (!text) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const result = queryData(text);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.text,
        data: result.data,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="p-6 pb-3 border-b border-border">
        <h1 className="text-2xl font-bold">Chat with Data</h1>
        <p className="text-sm text-muted-foreground">Ask questions about your sales pipeline in plain English</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden lg:flex flex-col w-64 border-r border-border p-4 space-y-3 overflow-y-auto">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Suggested Queries</p>
          {SUGGESTED_QUERIES.map((q) => (
            <button
              key={q}
              className="text-left text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-lg px-3 py-2 transition-colors border border-transparent hover:border-border"
              onClick={() => handleSend(q)}
            >
              {q}
            </button>
          ))}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className={msg.role === "user" ? "bg-primary text-white text-xs" : "bg-muted text-muted-foreground text-xs"}>
                    {msg.role === "user" ? "Me" : "AI"}
                  </AvatarFallback>
                </Avatar>
                <div className={cn("max-w-xl space-y-2", msg.role === "user" ? "items-end" : "items-start")}>
                  <div className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-white rounded-tr-sm"
                      : "bg-card border border-border rounded-tl-sm shadow-card"
                  )}>
                    <FormattedText text={msg.content} />
                  </div>
                  {msg.data && <ResultCard data={msg.data} />}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-muted text-xs">AI</AvatarFallback>
                </Avatar>
                <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-card">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about your sales data..."
                className="flex-1"
              />
              <Button onClick={() => handleSend()} disabled={!input.trim()} className="gap-2">
                <Send size={14} />Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <span>
      {parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : part.split("\n").map((line, j) => (
          <React.Fragment key={j}>{j > 0 && <br />}{line}</React.Fragment>
        ))
      )}
    </span>
  );
};

const ResultCard: React.FC<{ data: QueryResult }> = ({ data }) => {
  if (data.type === "value") {
    return (
      <Card className="shadow-card border-border">
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground mb-0.5">{data.label}</p>
          <p className="text-2xl font-bold text-primary">{data.value}</p>
        </CardContent>
      </Card>
    );
  }

  if (data.type === "count") {
    return (
      <Card className="shadow-card border-border">
        <CardContent className="p-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Hash size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{data.count}</p>
            <p className="text-xs text-muted-foreground">{data.label}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.type === "chart" && data.chartData) {
    return (
      <Card className="shadow-card border-border w-full max-w-md">
        <CardHeader className="pb-1 pt-3 px-3">
          <CardTitle className="text-xs font-semibold text-muted-foreground">{data.label}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 20% 92%)" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="value" fill="hsl(18 100% 50%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  if (data.type === "list" && data.items && data.items.length > 0) {
    const columns = Object.keys(data.items[0]);
    return (
      <Card className="shadow-card border-border w-full max-w-lg overflow-hidden">
        {data.label && (
          <div className="px-3 py-2 border-b border-border bg-muted/30">
            <p className="text-xs font-semibold text-muted-foreground">{data.label} ({data.count ?? data.items.length})</p>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/20">
                {columns.map((col) => (
                  <th key={col} className="text-left px-3 py-1.5 font-medium text-muted-foreground">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.items.map((row, i) => (
                <tr key={i} className="hover:bg-muted/20">
                  {columns.map((col) => (
                    <td key={col} className="px-3 py-1.5 text-foreground">{String(row[col])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  }

  return null;
};

export default ChatPage;
