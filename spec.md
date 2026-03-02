# Specification

## Summary
**Goal:** Build a full end-to-end BookStore Community app with a book catalog, cart/checkout flow, order history, and a vendor/admin panel, styled with a warm bookshop-inspired theme.

**Planned changes:**

### Backend
- Book data model with fields: id, title, author, description, coverImageUrl, category, originalPrice, discountPercent, finalPrice (computed), stockAvailable; CRUD operations restricted to admin role.
- Order data model with fields: orderId, buyerPrincipal, buyerName, buyerContact, items (bookId + quantity + priceAtPurchase), totalAmount, status, createdAt; endpoints to place an order, retrieve orders by buyer, and retrieve all orders (admin only).

### Frontend
- **Book Catalog page:** responsive grid of book cards showing cover, title, author, category tag, original price (strikethrough), discount badge, and final price; real-time search by title/author and category filter.
- **Book Detail page:** full description, cover image, price breakdown (original, discount, final), and "Add to Cart" button; accessible by clicking a catalog card.
- **Order Cart page:** lists added books with quantity controls and remove option, dynamic subtotal, "Proceed to Checkout" button; requires authentication (Internet Identity).
- **Checkout page:** form for buyer name and contact, order summary review, "Place Order" button with loading state; clears cart on success.
- **Order Confirmation page:** displays orderId, purchased items with prices, total, buyer name, contact, and timestamp; accessible only after successful order placement.
- **Order History page:** lists the authenticated user's past orders (orderId, date, total, item summary), sorted newest first; shows empty state when no orders exist.
- **Vendor/Admin Panel:** admin-only access; Books Management tab (add/edit/delete books via form and table); Orders tab (searchable table with orderId, buyer name, contact, items summary, total, date).
- **Global navigation:** top header with logo, nav links (Catalog, My Orders, Cart with item count badge), and login/logout button (Internet Identity).
- **Theme:** earthy tones (warm browns, cream/parchment, deep forest green accents), serif headings for book titles, clean card-based layout, fully responsive for mobile and desktop.

**User-visible outcome:** Users can browse and search books, view details, add books to a cart, check out, and view their order history — all authenticated via Internet Identity. Admins can manage the book catalog and view all orders through a dedicated panel.
