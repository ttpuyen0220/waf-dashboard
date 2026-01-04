import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "online":
    case "active":
      return "text-success";
    case "offline":
    case "pending_verification":
      return "text-destructive";
    default:
      return "text-muted-foreground";
  }
}

export function getActionColor(action: string): string {
  return action === "Blocked" ? "text-destructive" : "text-yellow-500";
}

export function getSourceColor(source: string): string {
  switch (source) {
    case "Rule Engine":
      return "text-blue-500";
    case "ML Engine":
      return "text-purple-500";
    case "Hybrid":
      return "text-accent";
    default:
      return "text-muted-foreground";
  }
}

export function formatHTTPRequest(request: {
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
}): string {
  const lines: string[] = [];
  
  // Request line
  lines.push(`${request.method} ${request.url} HTTP/1.1`);
  
  // Headers
  Object.entries(request.headers).forEach(([key, value]) => {
    lines.push(`${key}: ${value}`);
  });
  
  // Empty line before body
  if (request.body) {
    lines.push("");
    lines.push(request.body);
  }
  
  return lines.join("\n");
}

export function getThreatLevelColor(score: number): string {
  if (score >= 80) return "text-red-500";
  if (score >= 60) return "text-orange-500";
  if (score >= 40) return "text-yellow-500";
  return "text-green-500";
}

export function getThreatLevelBadge(score: number): string {
  if (score >= 80) return "destructive";
  if (score >= 60) return "warning";
  if (score >= 40) return "secondary";
  return "success";
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return "text-green-500";
  if (confidence >= 0.6) return "text-yellow-500";
  return "text-orange-500";
}
