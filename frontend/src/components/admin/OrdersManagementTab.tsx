import React, { useState, useMemo } from 'react';
import { Search, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useGetAllOrders } from '../../hooks/useQueries';
import type { BookOrder } from '../../backend';

function formatPrice(price: bigint): string {
  return `$${(Number(price) / 100).toFixed(2)}`;
}

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp / 1_000_000n);
  return new Date(ms).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'completed': return 'default';
    case 'cancelled': return 'destructive';
    default: return 'secondary';
  }
}

export default function OrdersManagementTab() {
  const [search, setSearch] = useState('');
  const { data: orders = [], isLoading } = useGetAllOrders();

  const filtered = useMemo(() => {
    if (!search) return orders;
    const q = search.toLowerCase();
    return orders.filter(
      (o: BookOrder) =>
        o.buyerName.toLowerCase().includes(q) ||
        String(o.orderId).includes(q) ||
        o.buyerContact.toLowerCase().includes(q)
    );
  }, [orders, search]);

  const sorted = [...filtered].sort((a, b) => Number(b.createdAt - a.createdAt));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl font-semibold">All Orders</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">
            {search ? 'No orders match your search.' : 'No orders yet.'}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-secondary">
                <TableHead className="font-semibold">Order ID</TableHead>
                <TableHead className="font-semibold">Buyer</TableHead>
                <TableHead className="font-semibold hidden md:table-cell">Contact</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Items</TableHead>
                <TableHead className="font-semibold">Total</TableHead>
                <TableHead className="font-semibold hidden lg:table-cell">Date</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((order: BookOrder) => (
                <TableRow key={order.orderId} className="hover:bg-secondary/50">
                  <TableCell className="font-mono text-sm font-medium">
                    #{order.orderId}
                  </TableCell>
                  <TableCell className="font-medium text-sm">{order.buyerName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                    {order.buyerContact}
                  </TableCell>
                  <TableCell className="text-sm hidden sm:table-cell">
                    <span className="text-muted-foreground">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-sm">
                    {formatPrice(order.totalAmount)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                    {formatDate(order.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(order.status) as any} className="text-xs">
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
