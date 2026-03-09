import Map "mo:core/Map";
import Time "mo:core/Time";
import List "mo:core/List";
import Nat32 "mo:core/Nat32";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Text "mo:core/Text";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Explicit migration from old to new state.

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
  public type BookCategory = {
    #Journals;
    #ProfessionalBooks;
    #BareActs;
    #AcademicBooks;
  };

  public type Book = {
    id : Nat32;
    title : Text;
    author : Text;
    publisher : Text;
    yearPublished : Nat;
    numPages : Nat;
    description : Text;
    coverImageUrl : Text;
    category : BookCategory;
    originalPriceINR : Nat;
    discountPercent : Nat;
    finalPriceINR : Nat;
    stockAvailable : Nat;
  };

  public type OrderItem = {
    bookId : Nat32;
    quantity : Nat;
    priceAtPurchaseINR : Nat;
  };

  public type DeliveryInfo = {
    companyName : Text;
    companyAddress : Text;
    contactNumber : Text;
    email : Text;
    comments : ?Text;
  };

  public type OrderStatus = {
    #pending;
    #inProgress;
    #success;
  };

  public type StatusChangeEntry = {
    timestamp : Time.Time;
    newStatus : OrderStatus;
    changedBy : Principal;
  };

  public type BookOrder = {
    orderId : Nat32;
    buyerPrincipal : Principal;
    buyerName : Text;
    buyerContact : Text;
    deliveryInfo : DeliveryInfo;
    items : [OrderItem];
    totalAmountINR : Nat;
    status : OrderStatus;
    statusHistory : [StatusChangeEntry];
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

  public query func getBooksByCategory(category : BookCategory) : async [Book] {
    let filteredBooks = List.empty<Book>();
    for (book in books.values()) {
      if (isBookCategoryEqual(book.category, category)) {
        filteredBooks.add(book);
      };
    };
    filteredBooks.toArray();
  };

  func isBookCategoryEqual(category1 : BookCategory, category2 : BookCategory) : Bool {
    switch (category1, category2) {
      case (#Journals, #Journals) { true };
      case (#ProfessionalBooks, #ProfessionalBooks) { true };
      case (#BareActs, #BareActs) { true };
      case (#AcademicBooks, #AcademicBooks) { true };
      case (_, _) { false };
    };
  };

  public shared ({ caller }) func addBook(
    title : Text,
    author : Text,
    publisher : Text,
    yearPublished : Nat,
    numPages : Nat,
    description : Text,
    coverImageUrl : Text,
    category : BookCategory,
    originalPriceINR : Nat,
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
      publisher;
      yearPublished;
      numPages;
      description;
      coverImageUrl;
      category;
      originalPriceINR;
      discountPercent;
      finalPriceINR = originalPriceINR - (originalPriceINR * discountPercent / 100 : Nat);
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
            finalPriceINR = updatedBook.originalPriceINR - (updatedBook.originalPriceINR * updatedBook.discountPercent / 100 : Nat);
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

  public shared ({ caller }) func placeOrder(
    buyerName : Text,
    buyerContact : Text,
    deliveryInfo : DeliveryInfo,
    items : [OrderItem],
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can place orders");
    };
    if (buyerName == "" or buyerContact == "") {
      Runtime.trap("Buyer details cannot be empty");
    };
    if (deliveryInfo.companyName == "" or deliveryInfo.companyAddress == "" or deliveryInfo.contactNumber == "" or deliveryInfo.email == "") {
      Runtime.trap("Delivery information cannot be empty");
    };
    if (items.size() == 0) {
      Runtime.trap("Order must contain at least one item");
    };

    var totalAmountINR = 0;

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
          totalAmountINR += item.quantity * book.finalPriceINR;
        };
      };
    };

    let initialStatus : OrderStatus = #pending;
    let emptyHistory : [StatusChangeEntry] = [];

    let order : BookOrder = {
      orderId = nextOrderId;
      buyerPrincipal = caller;
      buyerName;
      buyerContact;
      deliveryInfo;
      items = items;
      totalAmountINR;
      status = initialStatus;
      statusHistory = emptyHistory;
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

  public shared ({ caller }) func updateOrderStatus(orderId : Nat32, newStatus : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let statusChange : StatusChangeEntry = {
          timestamp = Time.now();
          newStatus;
          changedBy = caller;
        };

        let updatedHistory = List.fromArray<StatusChangeEntry>(order.statusHistory);
        updatedHistory.add(statusChange);

        orders.add(
          orderId,
          {
            order with
            status = newStatus;
            statusHistory = updatedHistory.toArray();
          },
        );
      };
    };
  };

  public query ({ caller }) func getOrderStatusHistory(orderId : Nat32) : async [StatusChangeEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view order history");
    };

    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (not (AccessControl.isAdmin(accessControlState, caller)) and order.buyerPrincipal != caller) {
          Runtime.trap("Unauthorized: You do not have permission to view this order's history");
        };
        order.statusHistory;
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
