import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { User, UserRole } from "@/data/types";
import { generateId, STAGE_COLORS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Shield, Users, Building2, Lock, GitBranch, ArrowRight, X, Settings, RefreshCw } from "lucide-react";

const ROLE_BADGE: Record<UserRole, { label: string; className: string }> = {
  admin:      { label: "Admin",      className: "bg-destructive/10 text-destructive border-destructive/20" },
  management: { label: "Management", className: "bg-blue-50 text-blue-700 border-blue-200" },
  sales:      { label: "Sales Team", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  bd:         { label: "Business Dev", className: "bg-amber-50 text-amber-700 border-amber-200" },
};

const ROLE_PERMISSIONS: Record<UserRole, string> = {
  bd:         "Enter leads & meetings on behalf of their Sales Team. No pipeline access.",
  sales:      "Own leads + BD-entered leads. Own pipeline threads only.",
  management: "View all leads, all meetings, all pipelines across the team.",
  admin:      "Full access + edit any record + manage users + configure team hierarchy.",
};

const AdminPage: React.FC = () => {
  const { currentUser, users, leads, companies, pipelines, teamLinks, addUser, updateUser, deleteUser, upsertTeamLink, removeTeamLink, usdToInrRate, setUsdToInrRate, inactivityDays, setInactivityDays } = useApp();
  const [rateInput, setRateInput] = useState(String(usdToInrRate));
  const [inactivityInput, setInactivityInput] = useState(String(inactivityDays));
  const [showUserModal, setShowUserModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  if (currentUser.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-6">
        <Lock size={48} className="text-muted-foreground" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground">You need admin privileges to access this page.</p>
      </div>
    );
  }

  const bdUsers   = users.filter((u) => u.role === "bd");
  const salesUsers = users.filter((u) => u.role === "sales");
  const mgmtUsers  = users.filter((u) => u.role === "management");
  const adminUsers = users.filter((u) => u.role === "admin");

  return (
    <div className="p-6 space-y-6 overflow-y-auto">
      <div>
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-sm text-muted-foreground">Manage users, roles, team hierarchy, and platform settings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users",    value: users.length,       icon: Users,     color: "text-blue-600",    bg: "bg-blue-50" },
          { label: "Admins",         value: adminUsers.length,  icon: Shield,    color: "text-destructive", bg: "bg-destructive/10" },
          { label: "Companies",      value: companies.length,   icon: Building2, color: "text-teal-600",    bg: "bg-teal-50" },
          { label: "Total Leads",    value: leads.length,       icon: Users,     color: "text-purple-600",  bg: "bg-purple-50" },
        ].map((s) => (
          <Card key={s.label} className="shadow-card border-border">
            <CardContent className="p-4">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon size={16} className={s.color} />
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="users">
        <TabsList className="h-9">
          <TabsTrigger value="users"     className="px-4 text-sm">User Management</TabsTrigger>
          <TabsTrigger value="hierarchy" className="px-4 text-sm">Team Hierarchy</TabsTrigger>
          <TabsTrigger value="companies" className="px-4 text-sm">Company Records</TabsTrigger>
          <TabsTrigger value="leads"     className="px-4 text-sm">All Leads</TabsTrigger>
          <TabsTrigger value="settings"  className="px-4 text-sm">Settings</TabsTrigger>
        </TabsList>

        {/* ─── Users tab ─── */}
        <TabsContent value="users" className="mt-4">
          <Card className="shadow-card border-border">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Users & Roles</CardTitle>
              <Button size="sm" className="gap-1.5" onClick={() => { setEditUser(null); setShowUserModal(true); }}>
                <Plus size={13} />Add User
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">User</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">Email</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">Role</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">Department</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">Pipelines</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((user) => {
                      const userPipelines = pipelines.filter((p) => p.ownerId === user.id);
                      const rb = ROLE_BADGE[user.role];
                      const reportsToUser = user.reportsTo ? users.find((u) => u.id === user.reportsTo) : null;
                      return (
                        <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-7 w-7">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{user.avatar}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-foreground">{user.name}</p>
                                {user.id === currentUser.id && <span className="text-xs text-muted-foreground">(You)</span>}
                                {reportsToUser && <p className="text-xs text-muted-foreground">→ {reportsToUser.name}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{user.email}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={`text-xs border ${rb.className}`}>{rb.label}</Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{user.department || "—"}</td>
                          <td className="px-4 py-3 font-medium">{user.role === "bd" ? "—" : userPipelines.length}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditUser(user); setShowUserModal(true); }}>
                                <Pencil size={13} />
                              </Button>
                              {user.id !== currentUser.id && (
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { if (confirm(`Delete ${user.name}?`)) deleteUser(user.id); }}>
                                  <Trash2 size={13} />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Role legend */}
              <div className="px-4 py-3 border-t border-border bg-muted/20 space-y-1 text-xs text-muted-foreground">
                {(Object.entries(ROLE_PERMISSIONS) as [UserRole, string][]).map(([role, desc]) => (
                  <p key={role}>
                    <Badge variant="outline" className={`text-xs border mr-2 ${ROLE_BADGE[role].className}`}>{ROLE_BADGE[role].label}</Badge>
                    {desc}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Team Hierarchy tab ─── */}
        <TabsContent value="hierarchy" className="mt-4 space-y-4">
          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <GitBranch size={16} className="text-primary" />Team Hierarchy
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Assign which Business Developers report to which Sales Team members.
                    BD users can enter leads & meetings on behalf of their Sales Team lead.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Management layer */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Management Team</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mgmtUsers.map((mgmt) => (
                    <div key={mgmt.id} className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold">{mgmt.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{mgmt.name}</p>
                        <Badge variant="outline" className={`text-xs border ${ROLE_BADGE.management.className}`}>Management</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sales + BD links */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Sales Team → Business Developers</p>
                <div className="space-y-4">
                  {salesUsers.map((sales) => {
                    const linkedBDs = teamLinks.filter((l) => l.salesId === sales.id);
                    const unlinkedBDs = bdUsers.filter((bd) =>
                      !teamLinks.find((l) => l.bdId === bd.id)
                    );
                    return (
                      <div key={sales.id} className="border border-border rounded-lg overflow-hidden">
                        {/* Sales header */}
                        <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border-b border-border">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-bold">{sales.avatar}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground">{sales.name}</p>
                            <Badge variant="outline" className={`text-xs border ${ROLE_BADGE.sales.className}`}>Sales Team</Badge>
                          </div>
                        </div>

                        {/* BD users under this sales */}
                        <div className="p-3 space-y-2">
                          {linkedBDs.length === 0 && (
                            <p className="text-xs text-muted-foreground px-1">No BDs assigned yet.</p>
                          )}
                          {linkedBDs.map((link) => {
                            const bd = users.find((u) => u.id === link.bdId);
                            if (!bd) return null;
                            return (
                              <div key={bd.id} className="flex items-center gap-3 px-3 py-2 bg-amber-50 rounded-md border border-amber-100">
                                <ArrowRight size={14} className="text-amber-400 shrink-0" />
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="bg-amber-100 text-amber-700 text-xs">{bd.avatar}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-foreground flex-1">{bd.name}</span>
                                <Badge variant="outline" className={`text-xs border ${ROLE_BADGE.bd.className}`}>BD</Badge>
                                <Button
                                  variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                  onClick={() => removeTeamLink(bd.id)}
                                  title="Remove link"
                                >
                                  <X size={12} />
                                </Button>
                              </div>
                            );
                          })}

                          {/* Add BD dropdown */}
                          {unlinkedBDs.length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              <Select onValueChange={(bdId) => upsertTeamLink({ bdId, salesId: sales.id })}>
                                <SelectTrigger className="h-7 text-xs flex-1 border-dashed">
                                  <SelectValue placeholder="+ Assign a BD…" />
                                </SelectTrigger>
                                <SelectContent>
                                  {unlinkedBDs.map((bd) => (
                                    <SelectItem key={bd.id} value={bd.id}>{bd.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Unassigned BDs */}
              {bdUsers.filter((bd) => !teamLinks.find((l) => l.bdId === bd.id)).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">⚠ Unassigned BDs</p>
                  <div className="flex flex-wrap gap-2">
                    {bdUsers
                      .filter((bd) => !teamLinks.find((l) => l.bdId === bd.id))
                      .map((bd) => (
                        <div key={bd.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-sm">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="bg-amber-100 text-amber-700 text-xs">{bd.avatar}</AvatarFallback>
                          </Avatar>
                          <span className="text-amber-800">{bd.name}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Companies tab ─── */}
        <TabsContent value="companies" className="mt-4">
          <Card className="shadow-card border-border overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Company Records</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">Company</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">Industry</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">Location</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">Size</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">Leads</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">Since</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {companies.map((co) => {
                    const coLeads = leads.filter((l) => l.companyId === co.id);
                    return (
                      <tr key={co.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-primary/10 rounded flex items-center justify-center">
                              <Building2 size={13} className="text-primary" />
                            </div>
                            <span className="font-medium">{co.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3"><Badge variant="secondary" className="text-xs">{co.industry}</Badge></td>
                        <td className="px-4 py-3 text-muted-foreground">{co.location || "—"}</td>
                        <td className="px-4 py-3 text-muted-foreground">{co.size || "—"}</td>
                        <td className="px-4 py-3 font-medium">{coLeads.length}</td>
                        <td className="px-4 py-3 text-muted-foreground">{co.createdAt}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ─── All Leads tab ─── */}
        <TabsContent value="leads" className="mt-4">
          <Card className="shadow-card border-border overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">All Leads — Admin View</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">Prospect</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">Company</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">Pipeline Threads</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leads.map((lead) => {
                    const company = companies.find((c) => c.id === lead.companyId);
                    const leadPipelines = pipelines.filter((p) => p.leadId === lead.id);
                    return (
                      <tr key={lead.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium">{lead.prospectName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{company?.name}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{lead.email}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {leadPipelines.length === 0 ? (
                              <span className="text-xs text-muted-foreground">—</span>
                            ) : (
                              leadPipelines.map((p) => {
                                const owner = users.find((u) => u.id === p.ownerId);
                                return (
                                  <Badge key={p.id} className={`text-xs border ${STAGE_COLORS[p.stage]}`} variant="outline">
                                    {owner?.name.split(" ")[0]}: {p.stage}
                                  </Badge>
                                );
                              })
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{lead.updatedAt}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ─── Settings tab ─── */}
        <TabsContent value="settings" className="mt-4">
          <Card className="shadow-card border-border max-w-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Settings size={16} className="text-primary" />Platform Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Currency exchange rate */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Currency Exchange Rate</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Set the USD → INR conversion rate used across all currency displays.
                    All values are stored in INR.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 px-3 py-2 rounded-md font-mono">
                    1 USD =
                  </div>
                  <Input
                    type="number"
                    min={1}
                    step={0.5}
                    value={rateInput}
                    onChange={(e) => setRateInput(e.target.value)}
                    className="w-28 font-mono"
                    placeholder="90"
                  />
                  <div className="text-sm text-muted-foreground">INR</div>
                  <Button
                    size="sm"
                    className="gap-1.5"
                    onClick={() => {
                      const v = parseFloat(rateInput);
                      if (!isNaN(v) && v > 0) setUsdToInrRate(v);
                    }}
                  >
                    <RefreshCw size={13} />Apply
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Current rate: <span className="font-semibold text-foreground">1 USD = {usdToInrRate} INR</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User modal */}
      <UserFormModal
        open={showUserModal}
        user={editUser}
        users={users}
        onClose={() => { setShowUserModal(false); setEditUser(null); }}
        onSave={(user) => {
          if (editUser) updateUser(user);
          else addUser(user);
          setShowUserModal(false);
          setEditUser(null);
        }}
      />
    </div>
  );
};

interface UserFormModalProps {
  open: boolean;
  user?: User | null;
  users: User[];
  onClose: () => void;
  onSave: (user: User) => void;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ open, user, users, onClose, onSave }) => {
  const [form, setForm] = useState<Partial<User>>(user || { role: "sales" });

  React.useEffect(() => {
    setForm(user || { role: "sales" });
  }, [user, open]);

  const set = (key: keyof User, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = () => {
    if (!form.name || !form.email) return;
    onSave({
      id: user?.id || generateId(),
      name: form.name!,
      email: form.email!,
      role: (form.role as UserRole) || "sales",
      avatar: form.name!.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
      department: form.department,
      reportsTo: form.role === "bd" ? form.reportsTo : undefined,
      createdAt: user?.createdAt || new Date().toISOString().split("T")[0],
    });
  };

  const salesUsers = users.filter((u) => u.role === "sales");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Add User"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Full Name *</Label>
            <Input value={form.name || ""} onChange={(e) => set("name", e.target.value)} placeholder="John Smith" />
          </div>
          <div className="space-y-1.5">
            <Label>Email *</Label>
            <Input type="email" value={form.email || ""} onChange={(e) => set("email", e.target.value)} placeholder="user@company.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role || "sales"} onValueChange={(v) => set("role", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bd">Business Dev</SelectItem>
                  <SelectItem value="sales">Sales Team</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Input value={form.department || ""} onChange={(e) => set("department", e.target.value)} placeholder="Sales" />
            </div>
          </div>
          {form.role === "bd" && (
            <div className="space-y-1.5">
              <Label>Reports To (Sales Team)</Label>
              <Select value={form.reportsTo || ""} onValueChange={(v) => set("reportsTo", v)}>
                <SelectTrigger><SelectValue placeholder="Select Sales Team member" /></SelectTrigger>
                <SelectContent>
                  {salesUsers.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.name || !form.email}>{user ? "Update" : "Add User"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminPage;
