import { toast } from "sonner";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  AuthCheckResponse,
  SystemStatus,
  Domain,
  AddDomainRequest,
  VerifyDomainRequest,
  VerifyDomainResponse,
  AddDNSRecordRequest,
  Rule,
  AddCustomRuleRequest,
  ToggleRuleRequest,
  AttackLog,
} from "@/types";

// Get API URL from localStorage or use default
export function getApiUrl(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("api_url") || "";
  }
  return "";
}

// Set API URL in localStorage
export function setApiUrl(url: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("api_url", url);
  }
}

// Generic API call handler with error handling
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T | null> {
  const apiUrl = getApiUrl();
  
  if (!apiUrl) {
    toast.error("API URL not configured. Please set it in Settings.");
    return null;
  }

  try {
    const response = await fetch(`${apiUrl}${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API call failed:", error);
    toast.error("Something went wrong. Please try again.");
    return null;
  }
}

// Auth API calls
export async function register(data: RegisterRequest): Promise<AuthResponse | null> {
  return apiCall<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function login(data: LoginRequest): Promise<AuthResponse | null> {
  return apiCall<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function checkAuth(): Promise<AuthCheckResponse | null> {
  return apiCall<AuthCheckResponse>("/api/auth/check");
}

export async function logout(): Promise<void> {
  await apiCall("/api/auth/logout", { method: "POST" });
}

// System status
export async function getSystemStatus(): Promise<SystemStatus | null> {
  return apiCall<SystemStatus>("/api/status");
}

// Domain API calls
export async function getDomains(): Promise<Domain[] | null> {
  return apiCall<Domain[]>("/api/domains");
}

export async function addDomain(data: AddDomainRequest): Promise<Domain | null> {
  return apiCall<Domain>("/api/domains/add", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function verifyDomain(
  data: VerifyDomainRequest
): Promise<VerifyDomainResponse | null> {
  return apiCall<VerifyDomainResponse>("/api/domains/verify", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// DNS API calls
export async function addDNSRecord(data: AddDNSRecordRequest): Promise<any | null> {
  return apiCall("/api/dns/records", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Rules API calls
export async function getGlobalRules(domainId?: string): Promise<Rule[] | null> {
  const query = domainId ? `?domain_id=${domainId}` : "";
  return apiCall<Rule[]>(`/api/rules/global${query}`);
}

export async function getCustomRules(domainId?: string): Promise<Rule[] | null> {
  const query = domainId ? `?domain_id=${domainId}` : "";
  return apiCall<Rule[]>(`/api/rules/custom${query}`);
}

export async function addCustomRule(data: AddCustomRuleRequest): Promise<any | null> {
  return apiCall("/api/rules/custom/add", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteCustomRule(ruleId: string): Promise<any | null> {
  return apiCall(`/api/rules/custom/delete?id=${ruleId}`, {
    method: "DELETE",
  });
}

export async function toggleRule(data: ToggleRuleRequest): Promise<any | null> {
  return apiCall("/api/rules/toggle", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Logs API calls
export async function getLogs(): Promise<AttackLog[] | null> {
  return apiCall<AttackLog[]>("/api/logs/secure");
}

// SSE for real-time logs
export function createLogStream(onMessage: (log: AttackLog) => void): EventSource | null {
  const apiUrl = getApiUrl();
  
  if (!apiUrl) {
    toast.error("API URL not configured.");
    return null;
  }

  try {
    const eventSource = new EventSource(`${apiUrl}/api/stream`, {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      try {
        const log = JSON.parse(event.data);
        onMessage(log);
      } catch (error) {
        console.error("Failed to parse log:", error);
      }
    };

    eventSource.onerror = () => {
      console.error("SSE connection error");
      eventSource.close();
    };

    return eventSource;
  } catch (error) {
    console.error("Failed to create SSE connection:", error);
    return null;
  }
}
