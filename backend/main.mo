import Array "mo:core/Array";
import Time "mo:core/Time";
import CoreOrder "mo:core/Order";
import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat32 "mo:core/Nat32";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile
  public type UserProfile = {
    name : Text;
    contact : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Data Models
  public type Book = {
    id : Nat32;
    title : Text;
    author : Text;
    description : Text;
    coverImageUrl : Text;
    category : Text;
    originalPrice : Nat;
    discountPercent : Nat;
    finalPrice : Nat;
    stockAvailable : Nat;
  };

  public type OrderItem = {
    bookId : Nat32;
    quantity : Nat;
    priceAtPurchase : Nat;
  };

  public type BookOrder = {
    orderId : Nat32;
    buyerPrincipal : Principal;
    buyerName : Text;
    buyerContact : Text;
    items : [OrderItem];
    totalAmount : Nat;
    status : Text;
    createdAt : Time.Time;
  };

  let books = Map.empty<Nat32, Book>();
  let orders = Map.empty<Nat32, BookOrder>();
  var nextBookId : Nat32 = 1;
  var nextOrderId : Nat32 = 1;

  // ---- Book functions ----

  public query func getBook(bookId : Nat32) : async Book {
    switch (books.get(bookId)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) { book };
    };
  };

  public query func getAllBooks() : async [Book] {
    books.values().toArray();
  };

  public shared ({ caller }) func addBook(
    title : Text,
    author : Text,
    description : Text,
    coverImageUrl : Text,
    category : Text,
    originalPrice : Nat,
    discountPercent : Nat,
    stockAvailable : Nat,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add books");
    };

    let book : Book = {
      id = nextBookId;
      title;
      author;
      description;
      coverImageUrl;
      category;
      originalPrice;
      discountPercent;
      finalPrice = originalPrice - (originalPrice * discountPercent / 100);
      stockAvailable;
    };

    books.add(book.id, book);
    nextBookId += 1;
  };

  public shared ({ caller }) func updateBook(updatedBook : Book) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update books");
    };

    switch (books.get(updatedBook.id)) {
      case (null) { Runtime.trap("Book not found") };
      case (?_) {
        books.add(
          updatedBook.id,
          {
            updatedBook with
            finalPrice = updatedBook.originalPrice - (updatedBook.originalPrice * updatedBook.discountPercent / 100 : Nat);
          },
        );
      };
    };
  };

  public shared ({ caller }) func deleteBook(bookId : Nat32) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete books");
    };
    if (not books.containsKey(bookId)) {
      Runtime.trap("Book not found");
    };
    books.remove(bookId);
  };

  // ---- Order functions ----

  public shared ({ caller }) func placeOrder(buyerName : Text, buyerContact : Text, items : [OrderItem]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can place orders");
    };
    if (buyerName == "" or buyerContact == "") {
      Runtime.trap("Buyer details cannot be empty");
    };
    if (items.size() == 0) {
      Runtime.trap("Order must contain at least one item");
    };

    var totalAmount = 0;

    for (item in items.values()) {
      switch (books.get(item.bookId)) {
        case (null) { Runtime.trap("Book with ID " # item.bookId.toText() # " not found") };
        case (?book) {
          if (item.quantity == 0) {
            Runtime.trap("Item quantity must be greater than zero");
          };
          if (item.quantity > book.stockAvailable) {
            Runtime.trap("Not enough stock available for " # book.title);
          };
          totalAmount += item.quantity * book.finalPrice;
        };
      };
    };

    let order : BookOrder = {
      orderId = nextOrderId;
      buyerPrincipal = caller;
      buyerName;
      buyerContact;
      items = items;
      totalAmount;
      status = "Pending";
      createdAt = Time.now();
    };

    // Deduct stock for each item
    for (item in items.values()) {
      switch (books.get(item.bookId)) {
        case (null) {};
        case (?book) {
          books.add(
            item.bookId,
            {
              book with
              stockAvailable = book.stockAvailable - item.quantity;
            },
          );
        };
      };
    };

    orders.add(order.orderId, order);
    nextOrderId += 1;
  };

  public query ({ caller }) func getOrder(orderId : Nat32) : async BookOrder {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view orders");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (order.buyerPrincipal != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view your own orders");
        };
        order;
      };
    };
  };

  public query ({ caller }) func getOrdersByBuyer() : async [BookOrder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their orders");
    };
    let filteredOrders = List.empty<BookOrder>();
    for (order in orders.values()) {
      if (order.buyerPrincipal == caller) {
        filteredOrders.add(order);
      };
    };
    filteredOrders.toArray();
  };

  public query ({ caller }) func getAllOrders() : async [BookOrder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat32, newStatus : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        orders.add(
          orderId,
          {
            order with
            status = newStatus;
          },
        );
      };
    };
  };

  public shared ({ caller }) func restockBook(bookId : Nat32, additionalStock : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can restock books");
    };
    if (additionalStock == 0) {
      Runtime.trap("Cannot add zero stock");
    };

    switch (books.get(bookId)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) {
        books.add(
          bookId,
          {
            book with
            stockAvailable = book.stockAvailable + additionalStock;
          },
        );
      };
    };
  };

  public query func getBookStock(bookId : Nat32) : async Nat {
    switch (books.get(bookId)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) { book.stockAvailable };
    };
  };
};
