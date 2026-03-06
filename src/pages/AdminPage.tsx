import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { User, UserRole } from "@/data/types";
import { generateId } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Shield, Users, Building2, Lock } from "lucide-react";

import { STAGE_COLORS } from "@/lib/constants";

const AdminPage: React.FC = () => {
  const { currentUser, users, leads, companies, addUser, updateUser, deleteUser, addCompany } = useApp();
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

  const adminUsers = users.filter((u) => u.role === "admin");
  const regularUsers = users.filter((u) => u.role === "user");

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-sm text-muted-foreground">Manage users, roles, and platform settings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: users.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Admins", value: adminUsers.length, icon: Shield, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Companies", value: companies.length, icon: Building2, color: "text-teal-600", bg: "bg-teal-50" },
          { label: "Total Leads", value: leads.length, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
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
          <TabsTrigger value="users" className="px-4 text-sm">User Management</TabsTrigger>
          <TabsTrigger value="companies" className="px-4 text-sm">Company Records</TabsTrigger>
          <TabsTrigger value="leads" className="px-4 text-sm">All Leads</TabsTrigger>
        </TabsList>

        {/* Users tab */}
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
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">Leads</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users.map((user) => {
                      const userLeads = leads.filter((l) => l.ownerId === user.id);
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
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{user.email}</td>
                          <td className="px-4 py-3">
                            <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs">
                              {user.role}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{user.department || "—"}</td>
                          <td className="px-4 py-3 font-medium">{userLeads.length}</td>
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Companies tab */}
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

        {/* All leads tab */}
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
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">Owner</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">Stage</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase">Value</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leads.map((lead) => {
                    const company = companies.find((c) => c.id === lead.companyId);
                    const owner = users.find((u) => u.id === lead.ownerId);
                    return (
                      <tr key={lead.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium">{lead.prospectName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{company?.name}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-xs bg-secondary">{owner?.avatar}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">{owner?.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`text-xs border ${STAGE_COLORS[lead.stage]}`} variant="outline">{lead.stage}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {lead.proposalValue ? `$${(lead.proposalValue / 1000).toFixed(0)}K` : "—"}
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
      </Tabs>

      {/* User modal */}
      <UserFormModal
        open={showUserModal}
        user={editUser}
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
  onClose: () => void;
  onSave: (user: User) => void;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ open, user, onClose, onSave }) => {
  const [form, setForm] = useState<Partial<User>>(user || { role: "user" });

  React.useEffect(() => {
    setForm(user || { role: "user" });
  }, [user, open]);

  const set = (key: keyof User, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = () => {
    if (!form.name || !form.email) return;
    onSave({
      id: user?.id || generateId(),
      name: form.name!,
      email: form.email!,
      role: (form.role as UserRole) || "user",
      avatar: form.name!.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
      department: form.department,
      createdAt: user?.createdAt || new Date().toISOString().split("T")[0],
    });
  };

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
              <Select value={form.role || "user"} onValueChange={(v) => set("role", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Input value={form.department || ""} onChange={(e) => set("department", e.target.value)} placeholder="Sales" />
            </div>
          </div>
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
