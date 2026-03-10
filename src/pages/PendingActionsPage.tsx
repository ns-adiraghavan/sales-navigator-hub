import React from "react";
import { useNudges } from "@/hooks/useNudges";
import PendingActions from "@/components/PendingActions";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";

const PendingActionsPage: React.FC = () => {
  const nudges = useNudges();
  const navigate = useNavigate();

  const handleScheduleMeeting = (leadId: string) => {
    navigate(`/leads`, { state: { openDrawerLeadId: leadId, drawerTab: "meetings" } });
  };
  const handleUpdatePipeline = (leadId: string) => {
    navigate(`/leads`, { state: { openDrawerLeadId: leadId, drawerTab: "pipeline" } });
  };
  const handleAddNotes = (_meetingId?: string, leadId?: string) => {
    if (leadId) navigate(`/leads`, { state: { openDrawerLeadId: leadId, drawerTab: "meetings" } });
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
          <Bell size={18} className="text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pending Actions</h1>
          <p className="text-sm text-muted-foreground">
            {nudges.length === 0
              ? "You're all caught up — no actions required."
              : `${nudges.length} action${nudges.length !== 1 ? "s" : ""} require your attention`}
          </p>
        </div>
      </div>

      {nudges.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground gap-3">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Bell size={28} className="text-muted-foreground/40" />
          </div>
          <p className="font-medium text-foreground">All clear!</p>
          <p className="text-sm max-w-xs">No follow-ups, overdue meetings, or stale pipelines to action right now.</p>
        </div>
      ) : (
        <PendingActions
          nudges={nudges}
          onScheduleMeeting={handleScheduleMeeting}
          onUpdatePipeline={handleUpdatePipeline}
          onAddNotes={handleAddNotes}
          defaultExpanded
        />
      )}
    </div>
  );
};

export default PendingActionsPage;
