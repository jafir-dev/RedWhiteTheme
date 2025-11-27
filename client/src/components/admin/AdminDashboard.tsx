import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  Coins, 
  ShoppingCart, 
  Gift,
  TrendingUp,
  FileText
} from "lucide-react";
import type { User, Order, Coupon, WheelSpin, LoanRequest } from "@shared/schema";

export default function AdminDashboard() {
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const { data: coupons = [], isLoading: couponsLoading } = useQuery<Coupon[]>({
    queryKey: ["/api/admin/coupons"],
  });

  const { data: spins = [], isLoading: spinsLoading } = useQuery<WheelSpin[]>({
    queryKey: ["/api/admin/spins"],
  });

  const { data: requests = [], isLoading: requestsLoading } = useQuery<LoanRequest[]>({
    queryKey: ["/api/admin/loan-requests"],
  });

  const isLoading = usersLoading || ordersLoading || couponsLoading || spinsLoading || requestsLoading;

  const totalRevenue = orders
    .filter(o => o.status === "paid" || o.status === "completed")
    .reduce((sum, o) => sum + o.finalPrice, 0);

  const activeCoupons = coupons.filter(c => !c.isRedeemed).length;
  const pendingRequests = requests.filter(r => r.status === "pending").length;

  const stats = [
    {
      title: "Total Users",
      value: users.length,
      icon: Users,
      description: "Registered members",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Total Spins",
      value: spins.length,
      icon: Coins,
      description: "Wheel spins used",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Orders",
      value: orders.length,
      icon: ShoppingCart,
      description: `Rs ${totalRevenue.toLocaleString()} revenue`,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Active Coupons",
      value: activeCoupons,
      icon: Gift,
      description: `${coupons.length} total generated`,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your business performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} data-testid={`stat-card-${stat.title.toLowerCase().replace(" ", "-")}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <p className="font-display text-3xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-primary" />
              Pending Requests
            </CardTitle>
            <CardDescription>
              Loan and customization requests awaiting action
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requestsLoading ? (
              <Skeleton className="h-20" />
            ) : pendingRequests === 0 ? (
              <p className="text-muted-foreground text-sm py-4">
                No pending requests
              </p>
            ) : (
              <div className="space-y-3">
                {requests
                  .filter(r => r.status === "pending")
                  .slice(0, 3)
                  .map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium capitalize">{request.type} Request</p>
                        <p className="text-xs text-muted-foreground">
                          {request.contactPhone}
                        </p>
                      </div>
                      <span className="text-xs text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded">
                        Pending
                      </span>
                    </div>
                  ))}
                {pendingRequests > 3 && (
                  <p className="text-sm text-muted-foreground text-center">
                    +{pendingRequests - 3} more requests
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest spins and orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            {spinsLoading || ordersLoading ? (
              <Skeleton className="h-20" />
            ) : (
              <div className="space-y-3">
                {spins.slice(0, 3).map((spin) => (
                  <div
                    key={spin.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Coins className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Wheel Spin</p>
                        <p className="text-xs text-muted-foreground">
                          User {spin.userId.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(spin.createdAt!).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {spins.length === 0 && orders.length === 0 && (
                  <p className="text-muted-foreground text-sm py-4">
                    No recent activity
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
