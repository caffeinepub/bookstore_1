import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Loader2, LogIn, ShoppingBag } from "lucide-react";
import React, { useEffect, useState } from "react";
import BooksManagementTab from "../components/admin/BooksManagementTab";
import OrdersManagementTab from "../components/admin/OrdersManagementTab";
import AccessDeniedScreen from "../components/auth/AccessDeniedScreen";
import PasswordPromptScreen from "../components/auth/PasswordPromptScreen";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

function isAdminAuthenticated(): boolean {
  return sessionStorage.getItem("adminAuthenticated") === "true";
}

export default function AdminPanelPage() {
  const [passwordVerified, setPasswordVerified] = useState<boolean>(
    isAdminAuthenticated(),
  );
  const { identity, login, loginStatus, isInitializing } =
    useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";
  const isLoginError = loginStatus === "loginError";

  // Once II login succeeds, initialize admin role on backend
  const [adminInitialized, setAdminInitialized] = useState(false);
  const [initError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !actor || actorFetching || adminInitialized) return;
    // actor already called _initializeAccessControlWithSecret internally via useActor
    // Just mark as initialized so we can proceed
    setAdminInitialized(true);
  }, [isAuthenticated, actor, actorFetching, adminInitialized]);

  // Step 1: Password not yet verified
  if (!passwordVerified) {
    return <PasswordPromptScreen onSuccess={() => setPasswordVerified(true)} />;
  }

  // Step 2: Password verified but not yet logged in with Internet Identity
  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
            One More Step
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            To complete admin login, please verify your identity. This is
            required to authorize admin operations.
          </p>
          {isInitializing ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Initializing...</span>
            </div>
          ) : (
            <Button className="w-full" onClick={login} disabled={isLoggingIn}>
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying identity...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Verify Identity (Internet Identity)
                </>
              )}
            </Button>
          )}
          {isLoginError && (
            <p className="mt-3 text-sm text-destructive">
              Login failed. Please try again.
            </p>
          )}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Back to Catalog
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Waiting for actor to be ready
  if (actorFetching || !actor || !adminInitialized) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading admin panel...</span>
        </div>
      </div>
    );
  }

  if (initError) {
    return <AccessDeniedScreen />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Admin Panel
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage books and orders for Gopal Book Agency
        </p>
      </div>

      <Tabs defaultValue="books">
        <TabsList className="mb-6">
          <TabsTrigger value="books" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Books Management
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Orders Management
          </TabsTrigger>
        </TabsList>
        <TabsContent value="books">
          <BooksManagementTab />
        </TabsContent>
        <TabsContent value="orders">
          <OrdersManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
