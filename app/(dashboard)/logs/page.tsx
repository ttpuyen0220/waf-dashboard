"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getLogs, createLogStream } from "@/lib/api";
import { AttackLog, LogFilters } from "@/types";
import {
  formatDate,
  getActionColor,
  getSourceColor,
  formatHTTPRequest,
  getThreatLevelColor,
  getConfidenceColor,
} from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Radio,
  RadioTower,
  Eye,
  Shield,
  AlertTriangle,
  Activity,
} from "lucide-react";

export default function LogsPage() {
  const [logs, setLogs] = useState<AttackLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [detailedLog, setDetailedLog] = useState<AttackLog | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<LogFilters>({});
  const [tempFilters, setTempFilters] = useState<LogFilters>({});

  // Real-time streaming state
  const [streamEnabled, setStreamEnabled] = useState(false);
  const [streamConnection, setStreamConnection] = useState<EventSource | null>(
    null
  );

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    const result = await getLogs(page, pageSize, filters);
    if (result) {
      setLogs(result.logs);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    }
    setIsLoading(false);
  }, [page, pageSize, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Real-time streaming
  useEffect(() => {
    if (streamEnabled && !streamConnection) {
      const eventSource = createLogStream((log) => {
        setLogs((prev) => [log, ...prev.slice(0, pageSize - 1)]);
      });
      setStreamConnection(eventSource);
    } else if (!streamEnabled && streamConnection) {
      streamConnection.close();
      setStreamConnection(null);
    }

    return () => {
      if (streamConnection) {
        streamConnection.close();
      }
    };
  }, [streamEnabled]);

  const toggleRow = (index: number) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setPage(1);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({});
    setTempFilters({});
    setPage(1);
  };

  const openDetailModal = (log: AttackLog) => {
    setDetailedLog(log);
  };

  const closeDetailModal = () => {
    setDetailedLog(null);
  };

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== "" && v !== null
  ).length;

  if (isLoading && logs.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Attack Logs</h1>
        <div className="h-96 bg-card animate-shimmer rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attack Logs</h1>
          <p className="text-muted-foreground">
            Monitor security events and threats
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={streamEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => setStreamEnabled(!streamEnabled)}
            className="gap-2"
          >
            {streamEnabled ? (
              <>
                <RadioTower className="h-4 w-4 animate-pulse" />
                Live
              </>
            ) : (
              <>
                <Radio className="h-4 w-4" />
                Enable Live
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Logs</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Blocked</p>
                <p className="text-2xl font-bold text-destructive">
                  {logs.filter((l) => l.action === "Blocked").length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Flagged</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {logs.filter((l) => l.action === "Flagged").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold">
                  {logs.length > 0
                    ? Math.round(
                        logs.reduce((acc, l) => acc + l.score, 0) / logs.length
                      )
                    : 0}
                </p>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filter Logs</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="ip">IP Address</Label>
                  <Input
                    id="ip"
                    placeholder="192.168.1.1"
                    value={tempFilters.ip || ""}
                    onChange={(e) =>
                      setTempFilters({ ...tempFilters, ip: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="action">Action</Label>
                  <Select
                    value={tempFilters.action || ""}
                    onValueChange={(value) =>
                      setTempFilters({
                        ...tempFilters,
                        action: value as LogFilters["action"],
                      })
                    }
                  >
                    <SelectTrigger id="action">
                      <SelectValue placeholder="All actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All actions</SelectItem>
                      <SelectItem value="Blocked">Blocked</SelectItem>
                      <SelectItem value="Flagged">Flagged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Select
                    value={tempFilters.source || ""}
                    onValueChange={(value) =>
                      setTempFilters({
                        ...tempFilters,
                        source: value as LogFilters["source"],
                      })
                    }
                  >
                    <SelectTrigger id="source">
                      <SelectValue placeholder="All sources" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All sources</SelectItem>
                      <SelectItem value="Rule Engine">Rule Engine</SelectItem>
                      <SelectItem value="ML Engine">ML Engine</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="path">Request Path</Label>
                  <Input
                    id="path"
                    placeholder="/api/endpoint"
                    value={tempFilters.path || ""}
                    onChange={(e) =>
                      setTempFilters({ ...tempFilters, path: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minScore">Min Score</Label>
                  <Input
                    id="minScore"
                    type="number"
                    placeholder="0"
                    min="0"
                    max="100"
                    value={tempFilters.minScore || ""}
                    onChange={(e) =>
                      setTempFilters({
                        ...tempFilters,
                        minScore: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minConfidence">Min Confidence (%)</Label>
                  <Input
                    id="minConfidence"
                    type="number"
                    placeholder="0"
                    min="0"
                    max="100"
                    value={
                      tempFilters.minConfidence
                        ? tempFilters.minConfidence * 100
                        : ""
                    }
                    onChange={(e) =>
                      setTempFilters({
                        ...tempFilters,
                        minConfidence: e.target.value
                          ? Number(e.target.value) / 100
                          : undefined,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={applyFilters}>Apply Filters</Button>
                <Button variant="outline" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Logs Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No attack logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log, index) => (
                    <>
                      <TableRow
                        key={index}
                        className="cursor-pointer hover:bg-accent/50"
                        onClick={() => toggleRow(index)}
                      >
                        <TableCell className="font-mono text-xs">
                          {formatDate(log.timestamp)}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {log.ip}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-xs">
                          {log.path}
                        </TableCell>
                        <TableCell className="text-xs">{log.reason}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              log.action === "Blocked" ? "destructive" : "outline"
                            }
                            className="text-xs"
                          >
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-xs ${getSourceColor(log.source)}`}
                          >
                            {log.source}
                          </span>
                        </TableCell>
                        <TableCell
                          className={`text-xs font-semibold ${getThreatLevelColor(
                            log.score
                          )}`}
                        >
                          {log.score}
                        </TableCell>
                        <TableCell
                          className={`text-xs ${getConfidenceColor(
                            log.confidence
                          )}`}
                        >
                          {log.confidence
                            ? `${(log.confidence * 100).toFixed(0)}%`
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openDetailModal(log);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {expandedRow === index ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedRow === index && (
                        <TableRow>
                          <TableCell colSpan={9} className="bg-muted/30">
                            <div className="p-4 space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">Tags</h4>
                                <div className="flex gap-2 flex-wrap">
                                  {log.tags.map((tag, i) => (
                                    <Badge key={i} variant="outline">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              {log.trigger && (
                                <div>
                                  <h4 className="font-semibold mb-2">
                                    Trigger Pattern
                                  </h4>
                                  <code className="block bg-background p-2 rounded text-xs">
                                    {log.trigger}
                                  </code>
                                </div>
                              )}
                              <div>
                                <h4 className="font-semibold mb-2">
                                  HTTP Request (Plain Format)
                                </h4>
                                <pre className="bg-background p-3 rounded text-xs overflow-x-auto font-mono">
                                  {formatHTTPRequest(log.full_request)}
                                </pre>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t border-border/50">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * pageSize + 1} to{" "}
                {Math.min(page * pageSize, total)} of {total} logs
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="text-sm">
                  Page {page} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Log Modal */}
      {detailedLog && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          onClick={closeDetailModal}
        >
          <div
            className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">Security Event Details</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDate(detailedLog.timestamp)}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={closeDetailModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid gap-6">
              {/* Overview */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-border/50">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          IP Address
                        </Label>
                        <p className="font-mono text-sm">{detailedLog.ip}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Request Path
                        </Label>
                        <p className="font-mono text-sm break-all">
                          {detailedLog.path}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Action Taken
                        </Label>
                        <div className="mt-1">
                          <Badge
                            variant={
                              detailedLog.action === "Blocked"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {detailedLog.action}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Detection Source
                        </Label>
                        <p className={getSourceColor(detailedLog.source)}>
                          {detailedLog.source}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Threat Score
                        </Label>
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-2xl font-bold ${getThreatLevelColor(
                              detailedLog.score
                            )}`}
                          >
                            {detailedLog.score}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            / 100
                          </span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          ML Confidence
                        </Label>
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-2xl font-bold ${getConfidenceColor(
                              detailedLog.confidence
                            )}`}
                          >
                            {detailedLog.confidence
                              ? `${(detailedLog.confidence * 100).toFixed(0)}%`
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reason */}
              <div>
                <Label className="text-sm font-semibold mb-2">
                  Blocking Reason
                </Label>
                <Card className="border-border/50 mt-2">
                  <CardContent className="pt-4">
                    <p className="text-sm">{detailedLog.reason}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tags */}
              <div>
                <Label className="text-sm font-semibold mb-2">Threat Tags</Label>
                <div className="flex gap-2 flex-wrap mt-2">
                  {detailedLog.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Trigger */}
              {detailedLog.trigger && (
                <div>
                  <Label className="text-sm font-semibold mb-2">
                    Trigger Pattern
                  </Label>
                  <Card className="border-border/50 mt-2">
                    <CardContent className="pt-4">
                      <code className="text-xs font-mono">
                        {detailedLog.trigger}
                      </code>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* HTTP Request */}
              <div>
                <Label className="text-sm font-semibold mb-2">
                  Complete HTTP Request
                </Label>
                <Card className="border-border/50 mt-2">
                  <CardContent className="pt-4">
                    <pre className="text-xs font-mono overflow-x-auto">
                      {formatHTTPRequest(detailedLog.full_request)}
                    </pre>
                  </CardContent>
                </Card>
              </div>

              {/* Request Analysis */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-semibold mb-2">
                    Request Method
                  </Label>
                  <Card className="border-border/50 mt-2">
                    <CardContent className="pt-4">
                      <Badge variant="outline">
                        {detailedLog.full_request.method}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <Label className="text-sm font-semibold mb-2">
                    Content Type
                  </Label>
                  <Card className="border-border/50 mt-2">
                    <CardContent className="pt-4">
                      <p className="text-sm font-mono">
                        {detailedLog.full_request.headers["content-type"] ||
                          detailedLog.full_request.headers["Content-Type"] ||
                          "N/A"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
