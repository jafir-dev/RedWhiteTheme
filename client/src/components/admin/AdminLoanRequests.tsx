import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Search, FileText, Phone, Scale, Image, Sparkles, Coins } from "lucide-react";
import type { LoanRequest } from "@shared/schema";

export default function AdminLoanRequests() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<LoanRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const { data: requests = [], isLoading } = useQuery<LoanRequest[]>({
    queryKey: ["/api/admin/loan-requests"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/loan-requests/${id}/status`, { 
        status, 
        adminNotes: notes 
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/loan-requests"] });
      toast({ title: "Request status updated" });
      setSelectedRequest(null);
      setAdminNotes("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const filteredRequests = requests.filter((request) => {
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesSearch =
      request.contactPhone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "contacted":
        return <Badge className="bg-blue-600">Contacted</Badge>;
      case "completed":
        return <Badge className="bg-green-600">Completed</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === "loan" ? (
      <Badge variant="outline" className="border-primary text-primary">
        <Coins className="w-3 h-3 mr-1" />
        Loan
      </Badge>
    ) : (
      <Badge variant="outline">
        <Sparkles className="w-3 h-3 mr-1" />
        Customization
      </Badge>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold mb-2">Loan & Customization Requests</h1>
        <p className="text-muted-foreground">
          Manage customer requests and follow-ups
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by phone or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-requests"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-request-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            All Requests ({filteredRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Gold (est.)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id} data-testid={`request-row-${request.id}`}>
                      <TableCell className="font-mono">#{request.id}</TableCell>
                      <TableCell>{getTypeBadge(request.type)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          {request.contactPhone || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {request.goldWeightEstimate ? (
                          <div className="flex items-center gap-1">
                            <Scale className="w-4 h-4 text-muted-foreground" />
                            {request.goldWeightEstimate}g
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {request.createdAt
                          ? new Date(request.createdAt).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(request);
                            setAdminNotes(request.adminNotes || "");
                          }}
                          data-testid={`button-view-request-${request.id}`}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Details Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request #{selectedRequest?.id}</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {getTypeBadge(selectedRequest.type)}
                {getStatusBadge(selectedRequest.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Contact Phone</p>
                  <p className="font-medium">{selectedRequest.contactPhone || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Est. Gold Weight</p>
                  <p className="font-medium">
                    {selectedRequest.goldWeightEstimate
                      ? `${selectedRequest.goldWeightEstimate}g`
                      : "-"}
                  </p>
                </div>
              </div>

              {selectedRequest.imageUrl && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Attached Image</p>
                  <div className="rounded-lg overflow-hidden bg-muted">
                    <img
                      src={selectedRequest.imageUrl}
                      alt="Request attachment"
                      className="max-h-48 mx-auto"
                    />
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-2">Description</p>
                <p className="text-sm bg-muted p-3 rounded-lg">
                  {selectedRequest.description || "No description provided"}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Admin Notes</p>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this request..."
                  rows={3}
                  data-testid="textarea-admin-notes"
                />
              </div>

              <div className="flex gap-3">
                <Select
                  value={selectedRequest.status || "pending"}
                  onValueChange={(status) =>
                    updateStatusMutation.mutate({
                      id: selectedRequest.id,
                      status,
                      notes: adminNotes,
                    })
                  }
                >
                  <SelectTrigger className="flex-1" data-testid="select-update-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() =>
                    updateStatusMutation.mutate({
                      id: selectedRequest.id,
                      status: selectedRequest.status || "pending",
                      notes: adminNotes,
                    })
                  }
                  disabled={updateStatusMutation.isPending}
                >
                  Save Notes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
