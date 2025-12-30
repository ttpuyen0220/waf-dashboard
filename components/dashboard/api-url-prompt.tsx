"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiUrl, setApiUrl } from "@/lib/api";
import { toast } from "sonner";
import { Link as LinkIcon } from "lucide-react";

export function ApiUrlPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [apiUrl, setApiUrlState] = useState("");

  useEffect(() => {
    const url = getApiUrl();
    if (!url) {
      setShowPrompt(true);
    }
  }, []);

  const handleSave = () => {
    if (!apiUrl) {
      toast.error("Please enter a valid API URL");
      return;
    }
    setApiUrl(apiUrl);
    setShowPrompt(false);
    toast.success("API URL configured successfully!");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-primary" />
            Configure API URL
          </CardTitle>
          <CardDescription>
            Please enter your WAF API base URL to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-url-prompt">API Base URL</Label>
            <Input
              id="api-url-prompt"
              type="url"
              placeholder="https://api.example.com"
              value={apiUrl}
              onChange={(e) => setApiUrlState(e.target.value)}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              You can change this later in Settings
            </p>
          </div>
          <Button onClick={handleSave} className="w-full">
            Save and Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
