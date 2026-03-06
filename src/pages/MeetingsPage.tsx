import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Meeting } from "@/data/types";
import { generateId } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ChevronLeft, ChevronRight, Clock, Users, MapPin, FileText, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const MeetingsPage: React.FC = () => {
  const { meetings, leads, companies, currentUser, addMeeting, updateMeeting, deleteMeeting } = useApp();
  const [viewMode, setViewMode] = useState<"month" | "week" | "list">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editMeeting, setEditMeeting] = useState<Meeting | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const getMeetingsForDate = (dateStr: string) =>
    meetings.filter((m) => m.date === dateStr);

  // Calendar helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays: (string | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, month, i + 1);
      return d.toISOString().split("T")[0];
    }),
  ];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const upcomingMeetings = [...meetings]
    .filter((m) => m.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  const pastMeetings = [...meetings]
    .filter((m) => m.date < todayStr)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Meetings</h1>
          <p className="text-sm text-muted-foreground">{meetings.length} total meetings</p>
        </div>
        <Button onClick={() => { setEditMeeting(null); setShowModal(true); }} className="gap-2">
          <Plus size={16} />Schedule Meeting
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "month" | "week" | "list")}>
          <TabsList className="h-9">
            <TabsTrigger value="month" className="px-4 text-sm">Month</TabsTrigger>
            <TabsTrigger value="list" className="px-4 text-sm">List</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {viewMode === "month" && (
        <Card className="shadow-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{MONTHS[month]} {year}</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevMonth}><ChevronLeft size={14} /></Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextMonth}><ChevronRight size={14} /></Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
              {DAYS.map((d) => (
                <div key={d} className="bg-muted/50 text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>
              ))}
              {calendarDays.map((date, i) => {
                const dayMeetings = date ? getMeetingsForDate(date) : [];
                const isToday = date === todayStr;
                const isSelected = date === selectedDate;
                return (
                  <div
                    key={i}
                    className={cn(
                      "bg-card min-h-20 p-1.5 cursor-pointer hover:bg-muted/30 transition-colors",
                      !date && "bg-muted/20 cursor-default",
                      isSelected && "ring-2 ring-inset ring-primary/30 bg-primary/5"
                    )}
                    onClick={() => date && setSelectedDate(date === selectedDate ? null : date)}
                  >
                    {date && (
                      <>
                        <div className={cn(
                          "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1",
                          isToday ? "bg-primary text-white" : "text-foreground"
                        )}>
                          {new Date(date + "T12:00:00").getDate()}
                        </div>
                        <div className="space-y-0.5">
                          {dayMeetings.slice(0, 2).map((m) => (
                            <div
                              key={m.id}
                              className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded truncate font-medium cursor-pointer hover:bg-primary/20"
                              onClick={(e) => { e.stopPropagation(); setEditMeeting(m); setShowModal(true); }}
                            >
                              {m.time} {m.title}
                            </div>
                          ))}
                          {dayMeetings.length > 2 && (
                            <div className="text-xs text-muted-foreground px-1">+{dayMeetings.length - 2} more</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === "list" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Upcoming</h2>
            <div className="space-y-3">
              {upcomingMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onEdit={() => { setEditMeeting(meeting); setShowModal(true); }}
                  onDelete={() => { if (confirm("Delete meeting?")) deleteMeeting(meeting.id); }}
                />
              ))}
              {upcomingMeetings.length === 0 && (
                <p className="text-muted-foreground text-sm py-4">No upcoming meetings</p>
              )}
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Past Meetings</h2>
            <div className="space-y-3">
              {pastMeetings.map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  past
                  onEdit={() => { setEditMeeting(meeting); setShowModal(true); }}
                  onDelete={() => { if (confirm("Delete meeting?")) deleteMeeting(meeting.id); }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected date meetings */}
      {selectedDate && viewMode === "month" && (
        <Card className="shadow-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {getMeetingsForDate(selectedDate).length === 0 ? (
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">No meetings this day.</p>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setEditMeeting(null); setShowModal(true); }}>
                  <Plus size={12} />Add Meeting
                </Button>
              </div>
            ) : (
              getMeetingsForDate(selectedDate).map((meeting) => (
                <MeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onEdit={() => { setEditMeeting(meeting); setShowModal(true); }}
                  onDelete={() => { if (confirm("Delete meeting?")) deleteMeeting(meeting.id); }}
                />
              ))
            )}
          </CardContent>
        </Card>
      )}

      <MeetingFormModal
        open={showModal}
        meeting={editMeeting}
        defaultDate={selectedDate || undefined}
        onClose={() => { setShowModal(false); setEditMeeting(null); }}
        onSave={(meeting) => {
          if (editMeeting) updateMeeting(meeting);
          else addMeeting(meeting);
          setShowModal(false);
          setEditMeeting(null);
        }}
      />
    </div>
  );
};

interface MeetingCardProps {
  meeting: Meeting;
  past?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, past, onEdit, onDelete }) => {
  const { leads, companies } = useApp();
  const lead = leads.find((l) => l.id === meeting.leadId);
  const company = companies.find((c) => c.id === lead?.companyId);

  return (
    <Card className={cn("shadow-card border-border", past && "opacity-70")}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex flex-col items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary leading-none">
                {new Date(meeting.date + "T12:00:00").getDate()}
              </span>
              <span className="text-xs text-primary/70 leading-none">
                {new Date(meeting.date + "T12:00:00").toLocaleDateString("en-US", { month: "short" })}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">{meeting.title}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock size={11} />{meeting.time}{meeting.duration ? ` · ${meeting.duration}min` : ""}</span>
                {lead && <span className="text-xs text-muted-foreground">{lead.prospectName} · {company?.name}</span>}
              </div>
              {meeting.outcome && <Badge variant="outline" className="mt-2 text-xs bg-green-50 text-green-700 border-green-200">{meeting.outcome}</Badge>}
              {meeting.minutes && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{meeting.minutes}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}><Pencil size={13} /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onDelete}><Trash2 size={13} /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface MeetingFormModalProps {
  open: boolean;
  meeting?: Meeting | null;
  defaultDate?: string;
  onClose: () => void;
  onSave: (meeting: Meeting) => void;
}

export const MeetingFormModal: React.FC<MeetingFormModalProps> = ({ open, meeting, defaultDate, onClose, onSave }) => {
  const { leads, companies } = useApp();
  const [form, setForm] = useState<Partial<Meeting>>(
    meeting || { date: defaultDate || new Date().toISOString().split("T")[0], time: "10:00", duration: 60 }
  );

  React.useEffect(() => {
    setForm(meeting || { date: defaultDate || new Date().toISOString().split("T")[0], time: "10:00", duration: 60 });
  }, [meeting, open, defaultDate]);

  const set = (key: keyof Meeting, value: unknown) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = () => {
    if (!form.title || !form.leadId || !form.date || !form.time) return;
    onSave({
      id: meeting?.id || generateId(),
      title: form.title!,
      leadId: form.leadId!,
      date: form.date!,
      time: form.time!,
      duration: form.duration,
      notes: form.notes,
      outcome: form.outcome,
      minutes: form.minutes,
      attendees: form.attendees,
      createdAt: meeting?.createdAt || new Date().toISOString().split("T")[0],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{meeting ? "Edit Meeting" : "Schedule Meeting"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Meeting Title *</Label>
            <Input value={form.title || ""} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Discovery Call" />
          </div>
          <div className="space-y-1.5">
            <Label>Associated Lead *</Label>
            <Select value={form.leadId || ""} onValueChange={(v) => set("leadId", v)}>
              <SelectTrigger><SelectValue placeholder="Select lead" /></SelectTrigger>
              <SelectContent>
                {leads.map((l) => {
                  const co = companies.find((c) => c.id === l.companyId);
                  return <SelectItem key={l.id} value={l.id}>{l.prospectName} · {co?.name}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Date *</Label>
              <Input type="date" value={form.date || ""} onChange={(e) => set("date", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Time *</Label>
              <Input type="time" value={form.time || ""} onChange={(e) => set("time", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Duration (minutes)</Label>
            <Select value={String(form.duration || 60)} onValueChange={(v) => set("duration", Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[15, 30, 45, 60, 90, 120].map((d) => <SelectItem key={d} value={String(d)}>{d} min</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} placeholder="Pre-meeting notes..." rows={2} />
          </div>
          {meeting && (
            <>
              <div className="space-y-1.5">
                <Label>Outcome</Label>
                <Input value={form.outcome || ""} onChange={(e) => set("outcome", e.target.value)} placeholder="Meeting outcome..." />
              </div>
              <div className="space-y-1.5">
                <Label>Meeting Minutes</Label>
                <Textarea value={form.minutes || ""} onChange={(e) => set("minutes", e.target.value)} placeholder="Key takeaways and action items..." rows={3} />
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.title || !form.leadId || !form.date || !form.time}>
            {meeting ? "Update Meeting" : "Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingsPage;
