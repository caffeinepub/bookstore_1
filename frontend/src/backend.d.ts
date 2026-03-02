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
    status: string;
    createdAt: Time;
    orderId: number;
    buyerContact: string;
    totalAmount: bigint;
    buyerPrincipal: Principal;
    items: Array<OrderItem>;
    buyerName: string;
}
export interface Book {
    id: number;
    finalPrice: bigint;
    coverImageUrl: string;
    title: string;
    originalPrice: bigint;
    description: string;
    discountPercent: bigint;
    author: string;
    category: string;
    stockAvailable: bigint;
}
export type Time = bigint;
export interface UserProfile {
    contact: string;
    name: string;
}
export interface OrderItem {
    bookId: number;
    quantity: bigint;
    priceAtPurchase: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBook(title: string, author: string, description: string, coverImageUrl: string, category: string, originalPrice: bigint, discountPercent: bigint, stockAvailable: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteBook(bookId: number): Promise<void>;
    getAllBooks(): Promise<Array<Book>>;
    getAllOrders(): Promise<Array<BookOrder>>;
    getBook(bookId: number): Promise<Book>;
    getBookStock(bookId: number): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getOrder(orderId: number): Promise<BookOrder>;
    getOrdersByBuyer(): Promise<Array<BookOrder>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(buyerName: string, buyerContact: string, items: Array<OrderItem>): Promise<void>;
    restockBook(bookId: number, additionalStock: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateBook(updatedBook: Book): Promise<void>;
    updateOrderStatus(orderId: number, newStatus: string): Promise<void>;
}
