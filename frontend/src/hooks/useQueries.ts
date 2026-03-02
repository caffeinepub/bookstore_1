import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Book, BookCategory, BookOrder, OrderItem, OrderStatus, UserProfile, DeliveryInfo } from '../backend';

export function useGetAllBooks() {
  const { actor, isFetching } = useActor();
  return useQuery<Book[]>({
    queryKey: ['books'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBooks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBook(bookId: number) {
  const { actor, isFetching } = useActor();
  return useQuery<Book>({
    queryKey: ['book', bookId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getBook(bookId);
    },
    enabled: !!actor && !isFetching && bookId !== undefined,
  });
}

export function useGetBooksByCategory(category: BookCategory) {
  const { actor, isFetching } = useActor();
  return useQuery<Book[]>({
    queryKey: ['books', 'category', category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBooksByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddBook() {
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
      if (!actor) throw new Error('Actor not available');
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
        book.stockAvailable
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function useUpdateBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (book: Book) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBook(book);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function useDeleteBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookId: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBook(bookId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      buyerName: string;
      buyerContact: string;
      deliveryInfo: DeliveryInfo;
      items: OrderItem[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.placeOrder(
        params.buyerName,
        params.buyerContact,
        params.deliveryInfo,
        params.items
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useGetOrdersByBuyer() {
  const { actor, isFetching } = useActor();
  return useQuery<BookOrder[]>({
    queryKey: ['orders', 'buyer'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrdersByBuyer();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<BookOrder[]>({
    queryKey: ['orders', 'all'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { orderId: number; newStatus: OrderStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateOrderStatus(params.orderId, params.newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useOrderStatusHistory(orderId: number) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['orderStatusHistory', orderId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrderStatusHistory(orderId);
    },
    enabled: !!actor && !isFetching && orderId !== undefined,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRestockBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { bookId: number; additionalStock: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.restockBook(params.bookId, params.additionalStock);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}
