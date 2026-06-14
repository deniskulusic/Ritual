import type {
  CheckoutOrderRequest,
  CheckoutOrderResponse,
} from "@/payload/collections/carts/contracts";
import type { AppliedPromotion as AppliedPromotionContract } from "@/payload/collections/carts/promo-contract";
import type {
  BoxNowWidgetConfig,
  ShippingPickupPoint,
} from "@/payload/collections/carts/shipping-contract";

export type LocalCartItem = {
  productSlug: string;
  quantity: number;
};

export type LocalCart = {
  items: LocalCartItem[];
  promoCode: null | string;
  shippingOptionId: null | string;
  shippingPickupPoint: null | ShippingPickupPoint;
};

export type CartQuote = {
  boxNowWidgetConfig: BoxNowWidgetConfig | null;
  adjustments: Array<{
    message: string;
    productSlug: string;
    type: "quantity-adjusted" | "removed" | "unavailable";
  }>;
  items: Array<{
    image: null | string;
    lineTotal: number;
    maxQuantity: null | number;
    priceLabel: string;
    productId: number;
    productSlug: string;
    quantity: number;
    title: string;
    totalLabel: string;
    unitPrice: number;
  }>;
  localCart: LocalCart;
  promoCodeError: null | string;
  promotion: AppliedPromotionContract | null;
  selectedShippingOptionId: null | string;
  shippingOptions: Array<{
    available: boolean;
    checkoutOnly: boolean;
    description: string;
    disabledLabel: string;
    id: string;
    kind: "home" | "locker";
    label: string;
    priceLabel: string;
    priceValue: number;
    provider: string;
    requiresPickupPoint: boolean;
    selected: boolean;
  }>;
  totals: {
    discount: number;
    discountLabel: string;
    grandTotal: number;
    grandTotalLabel: string;
    shipping: number;
    shippingLabel: string;
    subtotal: number;
    subtotalLabel: string;
  };
};

export type CartDisplayItem = {
  image: null | string;
  lineTotal: number;
  maxQuantity: number;
  priceLabel: string;
  productSlug: string;
  quantity: number;
  title: string;
  totalLabel: string;
  unitPrice: number;
};

export type CartAddOverlayState = {
  phase: "added" | "closing-added" | "closing-error" | "error" | "loading";
  productSlug: string;
  quantityAdded: number;
};

export type CartContextValue = {
  activeAddProductSlug: null | string;
  adjustments: CartQuote["adjustments"];
  addItem: (productSlug: string, quantity?: number) => void;
  applyPromoCode: (code: string) => void;
  isAddPending: boolean;
  cartItems: CartDisplayItem[];
  hasHydrated: boolean;
  isAuthenticated: boolean;
  isCheckoutPending: boolean;
  isQuotePending: boolean;
  isRestoring: boolean;
  isSyncPending: boolean;
  itemCount: number;
  placeOrder: (input: Omit<CheckoutOrderRequest, "cart">) => Promise<CheckoutOrderResponse>;
  promoCodeError: null | string;
  promotion: AppliedPromotionContract | null;
  removeItem: (productSlug: string) => void;
  removePromoCode: () => void;
  boxNowWidgetConfig: BoxNowWidgetConfig | null;
  selectShippingPickupPoint: (pickupPoint: null | ShippingPickupPoint) => void;
  selectShippingOption: (shippingOptionId: string) => void;
  selectedShippingOption: CartQuote["shippingOptions"][number] | null;
  shippingPickupPoint: null | ShippingPickupPoint;
  shippingOptions: CartQuote["shippingOptions"];
  totals: CartQuote["totals"];
  updateItemQuantity: (productSlug: string, quantity: number) => void;
};

export type CartProviderProps = {
  children: React.ReactNode;
};
