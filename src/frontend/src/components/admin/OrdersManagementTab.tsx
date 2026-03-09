import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Package,
  Phone,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { type BookOrder, OrderStatus } from "../../backend";
import {
  useGetAllOrders,
  useOrderStatusHistory,
  useUpdateOrderStatus,
} from "../../hooks/useQueries";

const formatINR = (amount: number | bigint) =>
  `₹${Number(amount).toLocaleString("en-IN")}`;

const formatDate = (timestamp: bigint) => {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function getStatusBadge(status: OrderStatus) {
  const icon: React.ReactNode =
    status === OrderStatus.success ? (
      <CheckCircle2 className="w-3 h-3" />
    ) : status === OrderStatus.inProgress ? (
      <Loader2 className="w-3 h-3 animate-spin" />
    ) : (
      <Clock className="w-3 h-3" />
    );

  const label =
    status === OrderStatus.success
      ? "Delivered"
      : status === OrderStatus.inProgress
        ? "In Progress"
        : "Pending";

  const variant =
    status === OrderStatus.success
      ? "default"
      : status === OrderStatus.inProgress
        ? "secondary"
        : "outline";

  return (
    <Badge variant={variant} className="flex items-center gap-1 w-fit">
      {icon}
      {label}
    </Badge>
  );
}

function OrderRow({ order }: { order: BookOrder }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(
    order.status,
  );
  const updateStatusMutation = useUpdateOrderStatus();
  const { data: statusHistory } = useOrderStatusHistory(
    expanded ? order.orderId : -1,
  );

  const handleSaveStatus = async () => {
    await updateStatusMutation.mutateAsync({
      orderId: order.orderId,
      newStatus: selectedStatus,
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <button
        type="button"
        className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/20 transition-colors text-left"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <p className="font-semibold text-foreground text-sm">
              Order #{order.orderId}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {order.buyerName}
            </p>
            <p className="text-xs text-muted-foreground">
              {order.deliveryInfo.companyName}
            </p>
          </div>
          {getStatusBadge(order.status)}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-bold text-primary">
            {formatINR(order.totalAmountINR)}
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-border p-4 space-y-5">
          {/* Customer Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-2">
                Customer Details
              </h4>
              <div className="space-y-1.5 text-sm">
                <p>
                  <span className="text-muted-foreground">Name: </span>
                  <span className="font-medium">{order.buyerName}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Contact: </span>
                  <span className="font-medium">{order.buyerContact}</span>
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-2">
                Delivery Details
              </h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-start gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <span>{order.deliveryInfo.companyName}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <span>{order.deliveryInfo.companyAddress}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <span>{order.deliveryInfo.contactNumber}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <span>{order.deliveryInfo.email}</span>
                </div>
                {order.deliveryInfo.comments && (
                  <div className="flex items-start gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                    <span>{order.deliveryInfo.comments}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h4 className="font-semibold text-foreground text-sm mb-2">
              Items Ordered
            </h4>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={`${order.orderId}-${item.bookId}`}
                  className="flex justify-between text-sm py-1 border-b border-border last:border-0"
                >
                  <span className="text-muted-foreground">
                    Book #{item.bookId} × {Number(item.quantity)}
                  </span>
                  <span className="font-medium">
                    {formatINR(
                      Number(item.priceAtPurchaseINR) * Number(item.quantity),
                    )}
                  </span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-sm pt-1">
                <span>Total</span>
                <span className="text-primary">
                  {formatINR(order.totalAmountINR)}
                </span>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div>
            <h4 className="font-semibold text-foreground text-sm mb-2">
              Update Status
            </h4>
            <div className="flex items-center gap-3">
              <Select
                value={selectedStatus}
                onValueChange={(val) => setSelectedStatus(val as OrderStatus)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={OrderStatus.pending}>Pending</SelectItem>
                  <SelectItem value={OrderStatus.inProgress}>
                    In Progress
                  </SelectItem>
                  <SelectItem value={OrderStatus.success}>Delivered</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={handleSaveStatus}
                disabled={
                  updateStatusMutation.isPending ||
                  selectedStatus === order.status
                }
              >
                {updateStatusMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>

          {/* Status History */}
          {statusHistory && statusHistory.length > 0 && (
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-2">
                Status History
              </h4>
              <div className="space-y-2">
                {statusHistory.map((entry) => (
                  <div
                    key={`${entry.timestamp}-${entry.newStatus}`}
                    className="flex items-center gap-3 text-xs text-muted-foreground"
                  >
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>{formatDate(entry.timestamp)}</span>
                    <span>→</span>
                    {getStatusBadge(entry.newStatus)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function OrdersManagementTab() {
  const { data: orders, isLoading } = useGetAllOrders();
  const [search, setSearch] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground">No orders yet.</p>
      </div>
    );
  }

  const filteredOrders = orders.filter((order) => {
    const q = search.toLowerCase();
    return (
      !q ||
      order.buyerName.toLowerCase().includes(q) ||
      order.deliveryInfo.companyName.toLowerCase().includes(q) ||
      order.deliveryInfo.email.toLowerCase().includes(q) ||
      String(order.orderId).includes(q)
    );
  });

  const sortedOrders = [...filteredOrders].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Orders ({orders.length})
        </h2>
        <input
          type="text"
          placeholder="Search by name, company, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-64"
        />
      </div>
      <div className="space-y-3">
        {sortedOrders.map((order) => (
          <OrderRow key={order.orderId} order={order} />
        ))}
      </div>
    </div>
  );
}
