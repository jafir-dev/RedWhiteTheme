import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import Checkout from "@/pages/Checkout";
import Customize from "@/pages/Customize";
import Admin from "@/pages/Admin";

function Router() {
  const { user, loading } = useAuth();
  const isAuthenticated = !!user;

  return (
    <Switch>
      {loading ? (
        <Route path="/" component={Landing} />
      ) : !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/products" component={Products} />
          <Route path="/login" component={Login} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/products" component={Products} />
          <Route path="/checkout/:id" component={Checkout} />
          <Route path="/customize" component={Customize} />
          <Route path="/admin" component={() => <Admin section="dashboard" />} />
          <Route path="/admin/wheel" component={() => <Admin section="wheel" />} />
          <Route path="/admin/users" component={() => <Admin section="users" />} />
          <Route path="/admin/orders" component={() => <Admin section="orders" />} />
          <Route path="/admin/products" component={() => <Admin section="products" />} />
          <Route path="/admin/coupons" component={() => <Admin section="coupons" />} />
          <Route path="/admin/requests" component={() => <Admin section="requests" />} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
