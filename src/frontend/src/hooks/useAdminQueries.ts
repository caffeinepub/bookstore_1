/**
 * Admin-specific query hooks that use the admin actor (with admin token initialized).
 * These are used exclusively in the admin panel to ensure proper backend authorization.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Book, BookCategory, BookOrder, OrderStatus } from "../backend";
import { useActor } from "./useActor";

export function useAdminGetAllBooks() {
  // getAllBooks is a public read operation — use regular actor to avoid auth issues
  const { actor, isFetching } = useActor();
  return useQuery<Book[]>({
    queryKey: ["adminBooks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBooks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminAddBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (book: {
      title: string;
      author: string;
      publisher: string;
      yearPublished: bigint;
      numPages: bigint;
      description: string;
      coverImageUrl: string;
      category: BookCategory;
      originalPriceINR: bigint;
      discountPercent: bigint;
      stockAvailable: bigint;
    }) => {
      if (!actor) throw new Error("Admin actor not available");
      return actor.addBook(
        book.title,
        book.author,
        book.publisher,
        book.yearPublished,
        book.numPages,
        book.description,
        book.coverImageUrl,
        book.category,
        book.originalPriceINR,
        book.discountPercent,
        book.stockAvailable,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBooks"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
}

export function useAdminUpdateBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (book: Book) => {
      if (!actor) throw new Error("Admin actor not available");
      return actor.updateBook(book);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBooks"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
}

export function useAdminDeleteBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookId: number) => {
      if (!actor) throw new Error("Admin actor not available");
      return actor.deleteBook(bookId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBooks"] });
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });
}

export function useAdminGetAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<BookOrder[]>({
    queryKey: ["adminOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { orderId: number; newStatus: OrderStatus }) => {
      if (!actor) throw new Error("Admin actor not available");
      return actor.updateOrderStatus(params.orderId, params.newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
    },
  });
}

export function useAdminGetBooksByCategory(category: BookCategory) {
  const { actor, isFetching } = useActor();
  return useQuery<Book[]>({
    queryKey: ["adminBooks", "category", category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBooksByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}
