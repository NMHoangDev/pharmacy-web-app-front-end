// Centralized React Query keys.
// Rule: same resource must always use the same key shape.

export const queryKeys = {
  products: (params = {}) => ["products", params],
  productDetail: (idOrSlug) => ["product-detail", idOrSlug],

  cart: (userId) => ["cart", userId],

  notifications: (params = {}) => ["notifications", params],
  unreadCount: () => ["unread-count"],

  discounts: () => ["discounts"],

  currentUser: () => ["current-user"],

  userStats: (params = {}) => ["admin-user-stats", params],
  medicineStats: (params = {}) => ["admin-medicine-stats", params],
  orderStats: (params = {}) => ["admin-order-stats", params],

  // Optional content examples (used by the sample refactor page)
  posts: (params = {}) => ["posts", params],
};

export default queryKeys;
