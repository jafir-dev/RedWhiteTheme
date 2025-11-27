import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
import { Search, Gift, CheckCircle, Clock } from "lucide-react";
import type { Coupon } from "@shared/schema";

export default function AdminCoupons() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: coupons = [], isLoading } = useQuery<Coupon[]>({
    queryKey: ["/api/admin/coupons"],
  });

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && !coupon.isRedeemed) ||
      (statusFilter === "redeemed" && coupon.isRedeemed);
    const matchesSearch =
      coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.userId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeCoupons = coupons.filter(c => !c.isRedeemed).length;
  const redeemedCoupons = coupons.filter(c => c.isRedeemed).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold mb-2">Coupons</h1>
        <p className="text-muted-foreground">
          Track coupon generation and redemption
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Coupons</p>
                <p className="font-display text-2xl font-bold">{coupons.length}</p>
              </div>
              <Gift className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="font-display text-2xl font-bold text-green-600">{activeCoupons}</p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Redeemed</p>
                <p className="font-display text-2xl font-bold text-blue-600">{redeemedCoupons}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by code or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-coupons"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-coupon-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Coupons</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="redeemed">Redeemed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            All Coupons ({filteredCoupons.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No coupons found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Prize</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Redeemed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoupons.map((coupon) => (
                    <TableRow key={coupon.id} data-testid={`coupon-row-${coupon.id}`}>
                      <TableCell>
                        <code className="font-mono font-semibold bg-muted px-2 py-1 rounded">
                          {coupon.code}
                        </code>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {coupon.userId.slice(0, 8)}...
                      </TableCell>
                      <TableCell>Prize #{coupon.prizeId}</TableCell>
                      <TableCell className="text-right font-medium">
                        Rs {coupon.value.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {coupon.isRedeemed ? (
                          <Badge className="bg-blue-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Redeemed
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {coupon.createdAt
                          ? new Date(coupon.createdAt).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {coupon.redeemedAt
                          ? new Date(coupon.redeemedAt).toLocaleDateString()
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
