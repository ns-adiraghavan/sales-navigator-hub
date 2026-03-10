import React, { useState } from "react";
import { Nudge, NudgeType } from "@/hooks/useNudges";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, Calendar, GitBranch, FileText, X, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface PendingActionsProps {
  nudges: Nudge[];
  onScheduleMeeting: (leadId: string) => void;
  onUpdatePipeline: (leadId: string) => void;
  onAddNotes: (meetingId?: string, leadId?: string) => void;
  defaultExpanded?: boolean;
}

const NUDGE_CONFIG: Record<NudgeType, { icon: React.ElementType; color: string; bgColor: string; borderColor: string; actions: string[] }> = {
  pipeline_inactive: {
    icon: AlertTriangle,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    actions: ["schedule", "pipeline"],
  },
  meeting_no_outcome: {
    icon: FileText,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    actions: ["notes"],
  },
  meeting_no_pipeline_update: {
    icon: GitBranch,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    actions: ["pipeline"],
  },
  no_followup_scheduled: {
    icon: Calendar,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    actions: ["schedule"],
  },
};

const COLLAPSED_PREVIEW = 3;

const PendingActions: React.FC<PendingActionsProps> = ({
  nudges,
  onScheduleMeeting,
  onUpdatePipeline,
  onAddNotes,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = nudges.filter((n) => !dismissed.has(n.id));
  if (visible.length === 0) return null;

  const displayed = expanded ? visible : visible.slice(0, COLLAPSED_PREVIEW);
  const warnings = visible.filter((n) => n.severity === "warning").length;

  return (
    <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center">
            <Zap size={13} className="text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground">Pending Actions</span>
          <Badge className="h-5 px-1.5 text-xs bg-primary/10 text-primary border-0 font-semibold">
            {visible.length}
          </Badge>
          {warnings > 0 && (
            <Badge className="h-5 px-1.5 text-xs bg-amber-100 text-amber-700 border-0 font-semibold">
              {warnings} urgent
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground hidden sm:block">
          Actions that need your attention
        </span>
      </div>

      {/* Nudge cards */}
      <div className="divide-y divide-border">
        {displayed.map((nudge) => {
          const cfg = NUDGE_CONFIG[nudge.type];
          const Icon = nudge.severity === "warning" ? AlertTriangle : Info;
          return (
            <div
              key={nudge.id}
              className={cn(
                "flex items-start gap-3 px-4 py-3 hover:bg-muted/20 transition-colors group"
              )}
            >
              {/* Icon */}
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5", cfg.bgColor, cfg.borderColor, "border")}>
                <cfg.icon size={13} className={cfg.color} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground">{nudge.leadName}</span>
                  <span className="text-xs text-muted-foreground mt-0.5">· {nudge.companyName}</span>
                  {nudge.severity === "warning" && (
                    <Badge className="h-4 px-1.5 text-xs bg-amber-100 text-amber-700 border-0">Urgent</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{nudge.message}</p>

                {/* Quick actions */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {cfg.actions.includes("schedule") && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs gap-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={() => onScheduleMeeting(nudge.leadId)}
                    >
                      <Calendar size={10} />
                      Schedule meeting
                    </Button>
                  )}
                  {cfg.actions.includes("pipeline") && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs gap-1 border-violet-200 text-violet-700 hover:bg-violet-50"
                      onClick={() => onUpdatePipeline(nudge.leadId)}
                    >
                      <GitBranch size={10} />
                      Update pipeline
                    </Button>
                  )}
                  {cfg.actions.includes("notes") && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-xs gap-1 border-red-200 text-red-700 hover:bg-red-50"
                      onClick={() => onAddNotes(nudge.meetingId, nudge.leadId)}
                    >
                      <FileText size={10} />
                      Add meeting notes
                    </Button>
                  )}
                </div>
              </div>

              {/* Dismiss */}
              <button
                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted"
                onClick={() => setDismissed((prev) => new Set([...prev, nudge.id]))}
                title="Dismiss"
              >
                <X size={12} className="text-muted-foreground" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Show more / less */}
      {visible.length > COLLAPSED_PREVIEW && (
        <button
          className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors border-t border-border"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <><ChevronUp size={12} /> Show less</>
          ) : (
            <><ChevronDown size={12} /> Show {visible.length - COLLAPSED_PREVIEW} more actions</>
          )}
        </button>
      )}
    </div>
  );
};

export default PendingActions;
