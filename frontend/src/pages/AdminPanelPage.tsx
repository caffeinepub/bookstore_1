import React from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import AccessDeniedScreen from '../components/auth/AccessDeniedScreen';
import BooksManagementTab from '../components/admin/BooksManagementTab';
import OrdersManagementTab from '../components/admin/OrdersManagementTab';

export default function AdminPanelPage() {
  const { identity } = useInternetIdentity();
  const { isFetching: actorFetching } = useActor();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  const isAuthenticated = !!identity;

  if (!isAuthenticated || actorFetching || adminLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {!isAuthenticated ? 'Please log in to access the admin panel.' : 'Checking permissions...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-serif text-3xl font-bold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Manage books and orders</p>
        </div>
      </div>

      <Tabs defaultValue="books">
        <TabsList className="mb-6">
          <TabsTrigger value="books">Books Management</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
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
