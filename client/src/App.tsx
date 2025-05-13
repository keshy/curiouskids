import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import History from "@/pages/History";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

// Protected route component - redirects to login if not authenticated
const ProtectedRoute = ({ component: Component, ...rest }: any) => {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Show nothing while checking auth status
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  
  // If authenticated with Google, render the component
  if (user) return <Component {...rest} />;
  
  // Otherwise redirect to login
  return <Redirect to="/login" />;
};

// Main router component
function Router() {
  const { user } = useAuth();
  const [location] = useLocation();
  
  // If user is already logged in and tries to access login page, redirect to home
  useEffect(() => {
    if (user && location === "/login") {
      window.location.href = "/";
    }
  }, [user, location]);

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={() => <ProtectedRoute component={Home} />} />
      <Route path="/history" component={() => <ProtectedRoute component={History} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
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
