import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCart } from '../context/CartContext';
import { usePlaceOrder, useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { OrderItem, DeliveryInfo } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, ShoppingBag, AlertCircle, Loader2 } from 'lucide-react';
import OrderConfirmationModal from '../components/OrderConfirmationModal';

interface PlacedOrderData {
  items: Array<{ title: string; quantity: number; priceAtPurchaseINR: number }>;
  totalAmountINR: number;
  deliveryInfo: DeliveryInfo;
  buyerName: string;
  buyerContact: string;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const placeOrderMutation = usePlaceOrder();

  const [formData, setFormData] = useState({
    buyerName: userProfile?.name ?? '',
    buyerContact: userProfile?.contact ?? '',
    companyName: '',
    companyAddress: '',
    contactNumber: '',
    email: '',
    comments: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrderData | null>(null);

  const formatINR = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.buyerName.trim()) newErrors.buyerName = 'Name is required';
    if (!formData.buyerContact.trim()) newErrors.buyerContact = 'Contact is required';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.companyAddress.trim()) newErrors.companyAddress = 'Company address is required';
    if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!identity) {
      setErrors({ general: 'Please log in to place an order.' });
      return;
    }
    if (items.length === 0) {
      setErrors({ general: 'Your cart is empty.' });
      return;
    }

    const orderItems: OrderItem[] = items.map(item => ({
      bookId: item.bookId,
      quantity: BigInt(item.quantity),
      priceAtPurchaseINR: BigInt(item.finalPriceINR),
    }));

    const deliveryInfo: DeliveryInfo = {
      companyName: formData.companyName.trim(),
      companyAddress: formData.companyAddress.trim(),
      contactNumber: formData.contactNumber.trim(),
      email: formData.email.trim(),
      comments: formData.comments.trim() || undefined,
    };

    try {
      await placeOrderMutation.mutateAsync({
        buyerName: formData.buyerName.trim(),
        buyerContact: formData.buyerContact.trim(),
        deliveryInfo,
        items: orderItems,
      });

      const orderData: PlacedOrderData = {
        items: items.map(item => ({
          title: item.title,
          quantity: item.quantity,
          priceAtPurchaseINR: item.finalPriceINR,
        })),
        totalAmountINR: totalPrice,
        deliveryInfo,
        buyerName: formData.buyerName.trim(),
        buyerContact: formData.buyerContact.trim(),
      };

      setPlacedOrder(orderData);
      clearCart();
      setShowConfirmation(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to place order. Please try again.';
      setErrors({ general: message });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  if (items.length === 0 && !showConfirmation) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Add some books before checking out.</p>
        <Button onClick={() => navigate({ to: '/' })}>Browse Catalog</Button>
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Login Required</h2>
        <p className="text-muted-foreground mb-6">Please log in to place an order.</p>
        <Button onClick={() => navigate({ to: '/' })}>Go to Catalog</Button>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            {/* Personal Details */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-serif text-xl font-semibold text-foreground mb-4">Personal Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="buyerName">Full Name *</Label>
                  <Input
                    id="buyerName"
                    name="buyerName"
                    value={formData.buyerName}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className={errors.buyerName ? 'border-destructive' : ''}
                  />
                  {errors.buyerName && <p className="text-destructive text-xs mt-1">{errors.buyerName}</p>}
                </div>
                <div>
                  <Label htmlFor="buyerContact">Personal Contact *</Label>
                  <Input
                    id="buyerContact"
                    name="buyerContact"
                    value={formData.buyerContact}
                    onChange={handleChange}
                    placeholder="Your personal contact"
                    className={errors.buyerContact ? 'border-destructive' : ''}
                  />
                  {errors.buyerContact && <p className="text-destructive text-xs mt-1">{errors.buyerContact}</p>}
                </div>
              </div>
            </div>

            {/* Company / Delivery Details */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-serif text-xl font-semibold text-foreground mb-4">Delivery Details</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Your company or organisation name"
                    className={errors.companyName ? 'border-destructive' : ''}
                  />
                  {errors.companyName && <p className="text-destructive text-xs mt-1">{errors.companyName}</p>}
                </div>
                <div>
                  <Label htmlFor="companyAddress">Company Address *</Label>
                  <Textarea
                    id="companyAddress"
                    name="companyAddress"
                    value={formData.companyAddress}
                    onChange={handleChange}
                    placeholder="Full delivery address"
                    rows={3}
                    className={errors.companyAddress ? 'border-destructive' : ''}
                  />
                  {errors.companyAddress && <p className="text-destructive text-xs mt-1">{errors.companyAddress}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactNumber">Contact Number *</Label>
                    <Input
                      id="contactNumber"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      placeholder="Phone number"
                      className={errors.contactNumber ? 'border-destructive' : ''}
                    />
                    {errors.contactNumber && <p className="text-destructive text-xs mt-1">{errors.contactNumber}</p>}
                  </div>
                  <div>
                    <Label htmlFor="email">Email ID *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="comments">Comments (Optional)</Label>
                  <Textarea
                    id="comments"
                    name="comments"
                    value={formData.comments}
                    onChange={handleChange}
                    placeholder="Any special instructions or notes for your order"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {errors.general && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errors.general}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={placeOrderMutation.isPending}
            >
              {placeOrderMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Place Order
                </>
              )}
            </Button>
          </form>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
              <h2 className="font-serif text-xl font-bold text-foreground mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map(item => (
                  <div key={item.bookId} className="flex gap-3">
                    <div className="w-10 h-14 shrink-0 rounded overflow-hidden bg-muted">
                      {item.coverImageUrl ? (
                        <img src={item.coverImageUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-2">{item.title}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-primary">
                        {formatINR(item.finalPriceINR * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatINR(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Confirmation Modal */}
      {placedOrder && (
        <OrderConfirmationModal
          open={showConfirmation}
          onClose={() => {
            setShowConfirmation(false);
            navigate({ to: '/orders' });
          }}
          orderData={placedOrder}
        />
      )}
    </>
  );
}
