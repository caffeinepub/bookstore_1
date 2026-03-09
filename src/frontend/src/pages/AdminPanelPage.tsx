import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, ShoppingBag } from "lucide-react";
import React, { useState } from "react";
import BooksManagementTab from "../components/admin/BooksManagementTab";
import OrdersManagementTab from "../components/admin/OrdersManagementTab";
import PasswordPromptScreen from "../components/auth/PasswordPromptScreen";

function isAdminAuthenticated(): boolean {
  return sessionStorage.getItem("adminAuthenticated") === "true";
}

export default function AdminPanelPage() {
  const [authenticated, setAuthenticated] = useState<boolean>(
    isAdminAuthenticated(),
  );

  if (!authenticated) {
    return <PasswordPromptScreen onSuccess={() => setAuthenticated(true)} />;
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
