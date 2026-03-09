import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BookOrder {
    status: OrderStatus;
    createdAt: Time;
    deliveryInfo: DeliveryInfo;
    statusHistory: Array<StatusChangeEntry>;
    orderId: number;
    buyerContact: string;
    totalAmountINR: bigint;
    buyerPrincipal: Principal;
    items: Array<OrderItem>;
    buyerName: string;
}
export type Time = bigint;
export interface DeliveryInfo {
    email: string;
    companyName: string;
    contactNumber: string;
    comments?: string;
    companyAddress: string;
}
export interface OrderItem {
    priceAtPurchaseINR: bigint;
    bookId: number;
    quantity: bigint;
}
export interface Book {
    id: number;
    coverImageUrl: string;
    title: string;
    yearPublished: bigint;
    publisher: string;
    description: string;
    discountPercent: bigint;
    author: string;
    originalPriceINR: bigint;
    numPages: bigint;
    finalPriceINR: bigint;
    category: BookCategory;
    stockAvailable: bigint;
}
export interface StatusChangeEntry {
    changedBy: Principal;
    timestamp: Time;
    newStatus: OrderStatus;
}
export interface UserProfile {
    contact: string;
    name: string;
}
export enum BookCategory {
    Journals = "Journals",
    BareActs = "BareActs",
    AcademicBooks = "AcademicBooks",
    ProfessionalBooks = "ProfessionalBooks"
}
export enum OrderStatus {
    pending = "pending",
    success = "success",
    inProgress = "inProgress"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBook(title: string, author: string, publisher: string, yearPublished: bigint, numPages: bigint, description: string, coverImageUrl: string, category: BookCategory, originalPriceINR: bigint, discountPercent: bigint, stockAvailable: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteBook(bookId: number): Promise<void>;
    getAllBooks(): Promise<Array<Book>>;
    getAllOrders(): Promise<Array<BookOrder>>;
    getBook(bookId: number): Promise<Book>;
    getBookStock(bookId: number): Promise<bigint>;
    getBooksByCategory(category: BookCategory): Promise<Array<Book>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getOrder(orderId: number): Promise<BookOrder>;
    getOrderStatusHistory(orderId: number): Promise<Array<StatusChangeEntry>>;
    getOrdersByBuyer(): Promise<Array<BookOrder>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(buyerName: string, buyerContact: string, deliveryInfo: DeliveryInfo, items: Array<OrderItem>): Promise<void>;
    restockBook(bookId: number, additionalStock: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateBook(updatedBook: Book): Promise<void>;
    updateOrderStatus(orderId: number, newStatus: OrderStatus): Promise<void>;
}
