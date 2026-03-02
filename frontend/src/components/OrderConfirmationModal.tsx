import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, AlertTriangle, Building2, MapPin, Phone, Mail, MessageSquare } from 'lucide-react';
import { DeliveryInfo } from '../backend';

interface OrderItem {
  title: string;
  quantity: number;
  priceAtPurchaseINR: number;
}

interface OrderData {
  items: OrderItem[];
  totalAmountINR: number;
  deliveryInfo: DeliveryInfo;
  buyerName: string;
  buyerContact: string;
}

interface OrderConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  orderData: OrderData;
}

export default function OrderConfirmationModal({
  open,
  onClose,
  orderData,
}: OrderConfirmationModalProps) {
  const formatINR = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-8 h-8 text-green-600 shrink-0" />
            <div>
              <DialogTitle className="font-serif text-xl text-foreground">
                Order Placed Successfully!
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Thank you for your order. Here is your order summary.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Cancellation Warning */}
        <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/40 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-destructive text-sm">Important Notice</p>
            <p className="text-destructive/90 text-sm mt-0.5">
              Orders <strong>cannot be cancelled</strong> once placed. Please review your order details carefully before closing this window.
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Books Ordered</h3>
          <div className="space-y-2">
            {orderData.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start gap-2 py-2 border-b border-border last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground line-clamp-2">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatINR(item.priceAtPurchaseINR)} × {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-semibold text-primary shrink-0">
                  {formatINR(item.priceAtPurchaseINR * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="font-bold text-foreground text-lg">Total Amount</span>
          <span className="font-bold text-primary text-xl">{formatINR(orderData.totalAmountINR)}</span>
        </div>

        <Separator />

        {/* Delivery Details */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Delivery Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Building2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <span className="text-muted-foreground">Company: </span>
                <span className="text-foreground font-medium">{orderData.deliveryInfo.companyName}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <span className="text-muted-foreground">Address: </span>
                <span className="text-foreground font-medium">{orderData.deliveryInfo.companyAddress}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <span className="text-muted-foreground">Contact: </span>
                <span className="text-foreground font-medium">{orderData.deliveryInfo.contactNumber}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div>
                <span className="text-muted-foreground">Email: </span>
                <span className="text-foreground font-medium">{orderData.deliveryInfo.email}</span>
              </div>
            </div>
            {orderData.deliveryInfo.comments && (
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <span className="text-muted-foreground">Comments: </span>
                  <span className="text-foreground font-medium">{orderData.deliveryInfo.comments}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button className="flex-1" onClick={onClose}>
            View My Orders
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
