import { useMemo } from "react";
import { useApp } from "@/context/AppContext";

export type NudgeType =
  | "pipeline_inactive"
  | "meeting_no_outcome"
  | "meeting_no_pipeline_update"
  | "no_followup_scheduled";

export interface Nudge {
  id: string;
  type: NudgeType;
  leadId: string;
  pipelineId?: string;
  meetingId?: string;
  leadName: string;
  companyName: string;
  message: string;
  severity: "warning" | "info";
}

const CLOSED_STAGES = new Set(["Closed Won", "Closed Lost"]);

export function useNudges(): Nudge[] {
  const { leads, companies, meetings, pipelines, currentUser, inactivityDays } = useApp();
  const INACTIVE_DAYS = inactivityDays;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return useMemo(() => {
    const nudges: Nudge[] = [];

    // Only compute nudges for the current user's pipeline threads
    const myPipelines = pipelines.filter((p) => p.ownerId === currentUser.id);

    for (const pipeline of myPipelines) {
      if (CLOSED_STAGES.has(pipeline.stage)) continue;

      const lead = leads.find((l) => l.id === pipeline.leadId);
      if (!lead) continue;
      const company = companies.find((c) => c.id === lead.companyId);
      const companyName = company?.name || "Unknown";

      const leadMeetings = meetings.filter((m) => m.leadId === pipeline.leadId);
      const futureMeetings = leadMeetings.filter((m) => new Date(m.date) >= today);
      const pastMeetings = leadMeetings.filter((m) => new Date(m.date) < today);

      // ── Rule 1: Pipeline Inactive for 7+ days ───────────────────────────
      const updatedAt = new Date(pipeline.updatedAt);
      updatedAt.setHours(0, 0, 0, 0);
      const daysSinceUpdate = Math.floor((today.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceUpdate >= INACTIVE_DAYS) {
        nudges.push({
          id: `inactive-${pipeline.id}`,
          type: "pipeline_inactive",
          leadId: lead.id,
          pipelineId: pipeline.id,
          leadName: lead.prospectName,
          companyName,
          message: `Pipeline inactive for ${daysSinceUpdate} days. Schedule a follow-up?`,
          severity: "warning",
        });
      }

      // ── Rule 2: Meeting completed but no outcome or minutes ───────────────
      const meetingsWithoutOutcome = pastMeetings.filter(
        (m) => m.scheduledById === currentUser.id && !m.outcome && !m.minutes
      );
      for (const m of meetingsWithoutOutcome) {
        nudges.push({
          id: `no-outcome-${m.id}`,
          type: "meeting_no_outcome",
          leadId: lead.id,
          meetingId: m.id,
          leadName: lead.prospectName,
          companyName,
          message: `"${m.title}" completed but outcome not logged.`,
          severity: "warning",
        });
      }

      // ── Rule 3: Meeting held but pipeline stage unchanged since meeting ──
      // Find past meetings that happened AFTER the pipeline was last updated
      const meetingsAfterPipelineUpdate = pastMeetings.filter((m) => {
        const meetingDate = new Date(m.date);
        meetingDate.setHours(0, 0, 0, 0);
        return meetingDate > updatedAt;
      });
      if (meetingsAfterPipelineUpdate.length > 0) {
        nudges.push({
          id: `no-pipeline-update-${pipeline.id}`,
          type: "meeting_no_pipeline_update",
          leadId: lead.id,
          pipelineId: pipeline.id,
          leadName: lead.prospectName,
          companyName,
          message: `Meeting held but pipeline stage unchanged since.`,
          severity: "info",
        });
      }

      // ── Rule 4: No follow-up meeting scheduled ────────────────────────────
      if (futureMeetings.length === 0) {
        nudges.push({
          id: `no-followup-${pipeline.id}`,
          type: "no_followup_scheduled",
          leadId: lead.id,
          pipelineId: pipeline.id,
          leadName: lead.prospectName,
          companyName,
          message: `No follow-up meeting scheduled.`,
          severity: "info",
        });
      }
    }

    // De-duplicate by id (safety) and return sorted by severity
    const seen = new Set<string>();
    return nudges
      .filter((n) => {
        if (seen.has(n.id)) return false;
        seen.add(n.id);
        return true;
      })
      .sort((a, b) => (a.severity === "warning" ? -1 : 1) - (b.severity === "warning" ? -1 : 1));
  }, [leads, companies, meetings, pipelines, currentUser.id, inactivityDays, today.toISOString().split("T")[0]]);
}
