"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getLogs } from "@/lib/api";
import { AttackLog } from "@/types";
import { formatDate, getActionColor, getSourceColor } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function LogsPage() {
  const [logs, setLogs] = useState<AttackLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    const result = await getLogs();
    if (result) {
      setLogs(result);
    }
    setIsLoading(false);
  };

  const toggleRow = (index: number) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Attack Logs</h1>
        <div className="h-96 bg-card animate-shimmer rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attack Logs</h1>
        <p className="text-muted-foreground">
          Monitor security events and threats
        </p>
      </div>

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
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
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
                            variant={log.action === "Blocked" ? "destructive" : "outline"}
                            className="text-xs"
                          >
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs ${getSourceColor(log.source)}`}>
                            {log.source}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs font-semibold">
                          {log.score}
                        </TableCell>
                        <TableCell className="text-xs">
                          {log.confidence ? `${(log.confidence * 100).toFixed(0)}%` : "N/A"}
                        </TableCell>
                        <TableCell>
                          {expandedRow === index ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
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
                                  <h4 className="font-semibold mb-2">Trigger Pattern</h4>
                                  <code className="block bg-background p-2 rounded text-xs">
                                    {log.trigger}
                                  </code>
                                </div>
                              )}
                              <div>
                                <h4 className="font-semibold mb-2">Full Request</h4>
                                <div className="bg-background p-3 rounded space-y-2">
                                  <div className="text-xs">
                                    <span className="font-semibold">Method:</span>{" "}
                                    <span className="font-mono">{log.full_request.method}</span>
                                  </div>
                                  <div className="text-xs">
                                    <span className="font-semibold">URL:</span>{" "}
                                    <span className="font-mono break-all">{log.full_request.url}</span>
                                  </div>
                                  <div className="text-xs">
                                    <span className="font-semibold">Headers:</span>
                                    <pre className="mt-1 text-xs overflow-x-auto">
                                      {JSON.stringify(log.full_request.headers, null, 2)}
                                    </pre>
                                  </div>
                                  {log.full_request.body && (
                                    <div className="text-xs">
                                      <span className="font-semibold">Body:</span>
                                      <pre className="mt-1 text-xs overflow-x-auto">
                                        {log.full_request.body}
                                      </pre>
                                    </div>
                                  )}
                                </div>
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
        </CardContent>
      </Card>
    </div>
  );
}
