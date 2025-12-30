"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getDomains, addDomain, verifyDomain } from "@/lib/api";
import { Domain } from "@/types";
import { toast } from "sonner";
import { Plus, Globe, CheckCircle, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function DomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDomainName, setNewDomainName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
    setIsLoading(true);
    const result = await getDomains();
    if (result) {
      setDomains(result);
    }
    setIsLoading(false);
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);

    const result = await addDomain({ name: newDomainName });
    if (result) {
      toast.success("Domain added successfully!");
      setDomains([result, ...domains]);
      setNewDomainName("");
      setShowAddModal(false);
    }
    setIsAdding(false);
  };

  const handleVerifyDomain = async (domainId: string) => {
    const result = await verifyDomain({ domain_id: domainId });
    if (result) {
      if (result.status === "active") {
        toast.success(result.message);
        fetchDomains();
      } else {
        toast.error(result.message);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Domains</h1>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-card animate-shimmer rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Domains</h1>
          <p className="text-muted-foreground">Manage your protected domains</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Domain
        </Button>
      </div>

      {/* Add Domain Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md animate-fade-in">
            <CardHeader>
              <CardTitle>Add New Domain</CardTitle>
            </CardHeader>
            <form onSubmit={handleAddDomain}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="domain">Domain Name</Label>
                  <Input
                    id="domain"
                    placeholder="example.com"
                    value={newDomainName}
                    onChange={(e) => setNewDomainName(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <div className="flex gap-2 p-6 pt-0">
                <Button type="submit" disabled={isAdding}>
                  {isAdding ? "Adding..." : "Add Domain"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Domains List */}
      <div className="grid gap-4">
        {domains.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Globe className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No domains added yet</p>
              <Button className="mt-4" onClick={() => setShowAddModal(true)}>
                Add your first domain
              </Button>
            </CardContent>
          </Card>
        ) : (
          domains.map((domain) => (
            <Card key={domain._id} className="border-border/50 animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold">{domain.name}</h3>
                      <Badge
                        variant={
                          domain.status === "active" ? "success" : "outline"
                        }
                      >
                        {domain.status === "active" ? (
                          <CheckCircle className="mr-1 h-3 w-3" />
                        ) : (
                          <Clock className="mr-1 h-3 w-3" />
                        )}
                        {domain.status === "active" ? "Active" : "Pending Verification"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Target IP:</span>
                        <p className="font-mono">{domain.target_ip}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <p>{formatDate(domain.created_at)}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Nameservers:</span>
                        <div className="mt-1 space-y-1">
                          {domain.nameservers.map((ns, i) => (
                            <p key={i} className="font-mono text-xs bg-background px-2 py-1 rounded">
                              {ns}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {domain.status === "pending_verification" && (
                    <Button
                      onClick={() => handleVerifyDomain(domain._id)}
                      variant="outline"
                    >
                      Verify Domain
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
